
import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { ChatArea } from './components/ChatArea';
import { RightPanel } from './components/RightPanel';
import LandingPage from './components/LandingPage';
import RegistrationForm from './components/RegistrationForm';
import AdminDashboard from './components/AdminDashboard';
import { ChatRoom, Message, Participant, LoadingState, INITIAL_ROOM, INITIAL_USER, PREMADE_BOTS, UserRegistration, MessageType } from './types';
import { generateBotResponse } from './services/groqService';
import { storageService } from './services/storageService';
import { Power, Shield, List, Radio, UserCheck, MessageSquare, UserX, UserCheck2 } from 'lucide-react';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'LANDING' | 'CHAT' | 'REGISTER' | 'ADMIN'>('LANDING');
  const [currentUser, setCurrentUser] = useState<Participant>(INITIAL_USER);
  const [rooms, setRooms] = useState<ChatRoom[]>([{ ...INITIAL_ROOM }]);
  const [activeRoomId, setActiveRoomId] = useState<string>(INITIAL_ROOM.id);
  const [loadingState, setLoadingState] = useState<LoadingState>({ status: 'idle' });
  const [blockedUserIds, setBlockedUserIds] = useState<string[]>([]);
  
  const activeRoom = useMemo(() => rooms.find(r => r.id === activeRoomId) || rooms[0], [rooms, activeRoomId]);

  // Katılımcıları Senkronize Et
  const syncRealUsers = useCallback(async () => {
    if (!storageService.isConfigured()) return;
    try {
      const registrations = await storageService.getAllRegistrations();
      const approvedParticipants: Participant[] = registrations
        .filter(reg => reg.status === 'approved' && reg.nickname !== currentUser.name)
        .map(reg => ({
          id: reg.id || `u-${reg.nickname}`,
          name: reg.nickname,
          persona: reg.fullName || 'Workigom Üyesi',
          avatar: `https://picsum.photos/seed/${reg.nickname}/200/200`,
          isAi: false,
          color: 'bg-blue-600'
        }));
      setRooms(prevRooms => prevRooms.map(room => {
        const allParticipants = [currentUser, ...PREMADE_BOTS, ...approvedParticipants];
        const uniqueParticipants = Array.from(new Map(allParticipants.map(p => [p.id, p])).values());
        return { ...room, participants: uniqueParticipants };
      }));
    } catch (err) { console.error("User sync error:", err); }
  }, [currentUser]);

  // Mesajları Senkronize Et
  const syncMessages = useCallback(async () => {
    if (!storageService.isConfigured() || currentView !== 'CHAT') return;
    try {
      for (const room of rooms) {
        const dbMessages = await storageService.getMessagesByChannel(room.name);
        
        setRooms(prevRooms => prevRooms.map(r => {
          if (r.name !== room.name) return r;
          
          const existingIds = new Set(r.messages.map(m => m.id));
          const newMessages = dbMessages.filter(m => !existingIds.has(m.id)).map(m => {
            const senderPart = r.participants.find(p => p.name === m.sender);
            return { ...m, senderId: senderPart?.id || 'system' };
          });

          if (newMessages.length === 0) return r;

          // Eğer oda aktif değilse ve yeni mesaj geldiyse uyarı (flash) yak
          const shouldAlert = r.id !== activeRoomId && newMessages.length > 0;

          return {
            ...r,
            messages: [...r.messages, ...newMessages].sort((a, b) => a.timestamp - b.timestamp),
            lastMessageAt: Math.max(r.lastMessageAt, ...newMessages.map(m => m.timestamp)),
            hasAlert: r.hasAlert || shouldAlert
          };
        }));
      }
    } catch (err) { console.error("Message sync error:", err); }
  }, [rooms, activeRoomId, currentView]);

  useEffect(() => {
    if (currentView === 'CHAT') {
      syncRealUsers();
      syncMessages();
      const userInterval = setInterval(syncRealUsers, 30000);
      const msgInterval = setInterval(syncMessages, 3000); 
      return () => {
        clearInterval(userInterval);
        clearInterval(msgInterval);
      };
    }
  }, [currentView, syncRealUsers, syncMessages]);

  const handleLoginSuccess = (userData: UserRegistration) => {
    const participant: Participant = {
      id: userData.id || `u-${userData.nickname}`,
      name: userData.nickname,
      persona: userData.fullName || 'Workigom Üyesi',
      avatar: `https://picsum.photos/seed/${userData.nickname}/200/200`,
      isAi: false,
      color: 'bg-slate-700'
    };
    setCurrentUser(participant);
    setCurrentView('CHAT');
  };

  const handleSwitchTab = (roomId: string) => {
    setActiveRoomId(roomId);
    setRooms(prev => prev.map(r => r.id === roomId ? { ...r, hasAlert: false } : r));
  };

  const handleSendMessage = useCallback(async (text: string) => {
    if (!text.trim()) return;
    try {
      await storageService.saveMessage({
        sender: currentUser.name,
        text: text,
        type: MessageType.USER,
        channel: activeRoom.name
      });
      syncMessages();
    } catch (err) { console.error("Mesaj hatası:", err); }
  }, [activeRoom.name, currentUser, syncMessages]);

  // Özel Sohbet Başlat (Çift Tık)
  const handleStartPrivateChat = (target: Participant) => {
    if (target.id === currentUser.id) return;

    // Sabit kanal adı oluştur (id'leri sıralayarak)
    const sortedIds = [currentUser.id, target.id].sort();
    const channelName = `private:${sortedIds[0]}:${sortedIds[1]}`;
    
    const existingRoom = rooms.find(r => r.name === channelName);
    if (existingRoom) {
      handleSwitchTab(existingRoom.id);
    } else {
      const newPrivateRoom: ChatRoom = {
        id: `room-p-${Date.now()}`,
        name: channelName,
        topic: `${target.name} ile özel mesajlaşma`,
        participants: [currentUser, target],
        messages: [],
        lastMessageAt: Date.now(),
        type: 'private',
        targetUserId: target.id,
        hasAlert: false
      };
      setRooms(prev => [...prev, newPrivateRoom]);
      setActiveRoomId(newPrivateRoom.id);
    }
  };

  // Engelleme Mantığı
  const toggleBlockUser = (userId: string) => {
    setBlockedUserIds(prev => 
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  // Engellenen kullanıcıların mesajlarını gösterme
  const filteredActiveRoom = useMemo(() => {
    return {
      ...activeRoom,
      messages: activeRoom.messages.filter(m => !m.senderId || !blockedUserIds.includes(m.senderId))
    };
  }, [activeRoom, blockedUserIds]);

  if (currentView === 'LANDING') return <LandingPage onEnter={handleLoginSuccess} onRegisterClick={() => setCurrentView('REGISTER')} onAdminClick={() => setCurrentView('ADMIN')} />;
  if (currentView === 'REGISTER') return <RegistrationForm onClose={() => setCurrentView('LANDING')} onSuccess={() => setCurrentView('LANDING')} />;
  if (currentView === 'ADMIN') return <AdminDashboard onLogout={() => setCurrentView('LANDING')} />;

  return (
    <div className="fixed inset-0 flex flex-col bg-[#f1f1f1] overflow-hidden text-black text-xs font-sans">
      {/* Title Bar */}
      <div className="h-6 bg-[#000080] flex items-center justify-between px-1 text-white shrink-0">
        <div className="flex items-center gap-1 font-bold truncate">
          <Shield size={12} className="text-yellow-400" />
          <span>mIRC SohbetChe Script - [USER: {currentUser.name}] - [{activeRoom.name}]</span>
        </div>
        <div className="flex gap-1">
          <button className="w-4 h-4 bg-[#c0c0c0] text-black flex items-center justify-center mirc-border">_</button>
          <button className="w-4 h-4 bg-[#c0c0c0] text-black flex items-center justify-center mirc-border">□</button>
          <button onClick={() => setCurrentView('LANDING')} className="w-4 h-4 bg-[#c0c0c0] text-black flex items-center justify-center mirc-border">X</button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="h-10 bg-[#f1f1f1] border-b border-[#808080] flex items-center px-1 gap-0.5 shrink-0 overflow-x-auto no-scrollbar">
        {[
          { icon: <Power size={14} />, text: 'Kopart' },
          { icon: <List size={14} />, text: 'Kanal Listesi' },
          { icon: <Radio size={14} />, text: 'Radyo Aç/Kapat' },
          { icon: <UserCheck size={14} />, text: 'Özeli Aç/Kapat' }
        ].map((item, idx) => (
          <button key={idx} className="h-8 min-w-[80px] flex flex-col items-center justify-center hover:bg-gray-200 mirc-border px-1">
            <span className="text-yellow-600">{item.icon}</span>
            <span className="text-[9px] font-bold">{item.text}</span>
          </button>
        ))}

        {/* Engelleme Butonu (Sadece Özel Mesajda Görünür) */}
        {activeRoom.type === 'private' && activeRoom.targetUserId && (
          <button 
            onClick={() => toggleBlockUser(activeRoom.targetUserId!)}
            className={`h-8 min-w-[80px] flex flex-col items-center justify-center mirc-border px-1 ml-auto ${blockedUserIds.includes(activeRoom.targetUserId) ? 'bg-red-100' : 'hover:bg-gray-200'}`}
          >
            {blockedUserIds.includes(activeRoom.targetUserId) ? (
              <><UserCheck2 size={14} className="text-green-600" /><span className="text-[9px] font-bold">ENGELİ KALDIR</span></>
            ) : (
              <><UserX size={14} className="text-red-600" /><span className="text-[9px] font-bold">ENGELLE</span></>
            )}
          </button>
        )}
      </div>

      {/* Tabs / Channels */}
      <div className="h-6 bg-white border-b border-[#808080] flex items-center px-1 gap-1 overflow-x-auto no-scrollbar">
        {rooms.map(room => (
          <button
            key={room.id}
            onClick={() => handleSwitchTab(room.id)}
            className={`px-3 h-5 flex items-center gap-1 border-r border-[#c0c0c0] text-[11px] font-bold transition-all ${
              activeRoomId === room.id 
                ? 'bg-[#000080] text-white' 
                : room.hasAlert 
                  ? 'mirc-flash-red' 
                  : 'hover:bg-gray-100'
            }`}
          >
            <MessageSquare size={10} /> {room.type === 'private' ? room.topic.split(' ')[0] : room.name}
          </button>
        ))}
      </div>

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden mirc-inset bg-white m-0.5">
        <ChatArea 
          room={filteredActiveRoom} 
          currentUser={currentUser} 
          onSendMessage={handleSendMessage} 
          loadingState={loadingState}
          onTriggerBot={() => {}} 
        />
        <RightPanel room={activeRoom} onUserDoubleClick={handleStartPrivateChat} />
      </div>
    </div>
  );
};

export default App;
