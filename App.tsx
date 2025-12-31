
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { ChatArea } from './components/ChatArea';
import { RightPanel } from './components/RightPanel';
import LandingPage from './components/LandingPage';
import RegistrationForm from './components/RegistrationForm';
import AdminDashboard from './components/AdminDashboard';
import { ChatRoom, Message, Participant, LoadingState, INITIAL_ROOM, INITIAL_USER, PREMADE_BOTS, UserRegistration } from './types';
import { generateBotResponse } from './services/groqService';
import { storageService } from './services/storageService';
import { Settings, Power, Shield, Save, X } from 'lucide-react';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'LANDING' | 'CHAT' | 'REGISTER' | 'ADMIN'>('LANDING');
  const [currentUser, setCurrentUser] = useState<Participant>(INITIAL_USER);
  const [rooms, setRooms] = useState<ChatRoom[]>([{ ...INITIAL_ROOM }]);
  const [activeRoomId, setActiveRoomId] = useState<string>(INITIAL_ROOM.id);
  const [loadingState, setLoadingState] = useState<LoadingState>({ status: 'idle' });
  
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [tempNick, setTempNick] = useState(currentUser.name);

  // Supabase'den onaylı gerçek kullanıcıları çekme
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
        // Mevcut kullanıcı + botlar + veritabanından gelen onaylı kullanıcılar
        const allParticipants = [currentUser, ...PREMADE_BOTS, ...approvedParticipants];
        const uniqueParticipants = Array.from(new Map(allParticipants.map(p => [p.id, p])).values());

        return {
          ...room,
          participants: uniqueParticipants
        };
      }));
    } catch (err) {
      console.error("User sync error:", err);
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentView === 'CHAT') {
      syncRealUsers();
      const interval = setInterval(syncRealUsers, 30000); // 30 saniyede bir güncelle
      return () => clearInterval(interval);
    }
  }, [currentView, syncRealUsers]);

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
    setTempNick(participant.name);
    setCurrentView('CHAT');
  };

  const activeRoom = useMemo(() => {
    return rooms.find(r => r.id === activeRoomId) || rooms[0];
  }, [rooms, activeRoomId]);

  const handleSwitchTab = (roomId: string) => {
    setActiveRoomId(roomId);
    setRooms(prev => prev.map(r => r.id === roomId ? { ...r, hasAlert: false } : r));
  };

  const handleStartPrivateChat = (target: Participant) => {
    if (target.id === currentUser.id) return;
    
    const roomId = `private-${target.id}`;
    const existingRoom = rooms.find(r => r.id === roomId);

    if (existingRoom) {
      setActiveRoomId(roomId);
    } else {
      const newPrivateRoom: ChatRoom = {
        id: roomId,
        name: `${target.name}`,
        topic: `${target.name} ile Özel Sohbet`,
        participants: [currentUser, target],
        messages: [],
        lastMessageAt: Date.now(),
        type: 'private',
        targetUserId: target.id
      };
      setRooms(prev => [...prev, newPrivateRoom]);
      setActiveRoomId(roomId);
    }
  };

  const triggerBotResponse = async (botId: string, roomId: string) => {
    const targetRoom = rooms.find(r => r.id === roomId);
    if (!targetRoom) return;
    
    const bot = targetRoom.participants.find(p => p.id === botId);
    if (!bot) return;

    setLoadingState({ status: 'thinking', participantId: botId });

    try {
      const responseText = await generateBotResponse(
        bot,
        targetRoom.participants,
        targetRoom.messages,
        targetRoom.topic
      );

      const botMessage: Message = {
        id: `msg-bot-${Date.now()}`,
        senderId: bot.id,
        text: responseText,
        timestamp: Date.now()
      };

      setRooms(prev => prev.map(r => 
        r.id === roomId ? { 
          ...r, 
          messages: [...r.messages, botMessage], 
          lastMessageAt: Date.now(),
          hasAlert: roomId !== activeRoomId 
        } : r
      ));
    } catch (err) {
      console.error("Bot trigger error:", err);
    } finally {
      setLoadingState({ status: 'idle' });
    }
  };

  const handleSendMessage = useCallback(async (text: string) => {
    if (!text.trim()) return;

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      senderId: currentUser.id,
      text: text,
      timestamp: Date.now()
    };

    setRooms(prev => prev.map(room => {
      if (room.id === activeRoomId) {
        return { ...room, messages: [...room.messages, newMessage], lastMessageAt: Date.now() };
      }
      return room;
    }));

    const currentActiveRoom = rooms.find(r => r.id === activeRoomId);
    if (currentActiveRoom) {
      if (currentActiveRoom.type === 'channel') {
        const bots = currentActiveRoom.participants.filter(p => p.isAi);
        if (bots.length > 0 && Math.random() > 0.4) {
          const randomBot = bots[Math.floor(Math.random() * bots.length)];
          setTimeout(() => triggerBotResponse(randomBot.id, activeRoomId), 1500);
        }
      } else if (currentActiveRoom.type === 'private') {
        const target = currentActiveRoom.participants.find(p => p.id === currentActiveRoom.targetUserId);
        if (target && target.isAi) {
          setTimeout(() => triggerBotResponse(target.id, activeRoomId), 1000);
        }
      }
    }
  }, [activeRoomId, rooms, currentUser.id]);

  const handleSaveSettings = () => {
    if (tempNick.trim()) {
      setCurrentUser(prev => ({ ...prev, name: tempNick }));
      setRooms(prev => prev.map(room => ({
        ...room,
        participants: room.participants.map(p => p.id === currentUser.id ? { ...p, name: tempNick } : p)
      })));
    }
    setShowSettingsModal(false);
  };

  const handleLogout = () => {
    if (window.confirm("Çıkış yapmak istediğinize emin misiniz?")) {
      setCurrentView('LANDING');
    }
  };

  if (currentView === 'LANDING') return <LandingPage onEnter={handleLoginSuccess} onRegisterClick={() => setCurrentView('REGISTER')} onAdminClick={() => setCurrentView('ADMIN')} />;
  if (currentView === 'REGISTER') return <RegistrationForm onClose={() => setCurrentView('LANDING')} onSuccess={() => setCurrentView('LANDING')} />;
  if (currentView === 'ADMIN') return <AdminDashboard onLogout={() => setCurrentView('LANDING')} />;

  return (
    <div className="fixed inset-0 flex flex-col overflow-hidden bg-[#d4dce8] font-sans selection:bg-blue-200">
      <header className="h-9 bg-[#000080] flex items-center justify-between px-2 text-white border-b-2 border-white select-none shrink-0">
        <div className="flex items-center gap-2">
          <Shield size={14} className="text-yellow-400" />
          <span className="font-bold text-xs uppercase tracking-tighter">Workigom Chat - [USER: {currentUser.name}]</span>
        </div>
        <div className="flex gap-2 text-[10px] font-bold">
          <button onClick={() => setShowSettingsModal(true)} className="hover:text-yellow-300 flex items-center gap-1">
            <Settings size={12} /> AYARLAR
          </button>
          <div className="w-px bg-blue-400 h-3 my-auto"></div>
          <button onClick={handleLogout} className="hover:text-red-400 flex items-center gap-1">
            <Power size={12} /> ÇIKIŞ
          </button>
        </div>
      </header>

      <div className="flex-1 flex flex-col p-1 min-h-0">
        <div className="flex items-end px-1 gap-0.5 bg-[#000080] pt-1 border-t border-l border-r border-black mx-0.5 overflow-x-auto no-scrollbar">
          {rooms.map(room => (
            <button
              key={room.id}
              onClick={() => handleSwitchTab(room.id)}
              className={`px-3 py-1 text-xs font-bold rounded-t-[3px] min-w-[90px] transition-all flex items-center justify-between gap-2 border-r border-blue-900 ${
                activeRoomId === room.id 
                  ? 'bg-[#d4dce8] text-black border-t-2 border-l-2 border-white' 
                  : (room.hasAlert ? 'bg-red-600 text-white animate-pulse' : 'bg-[#b0b8c4] text-gray-700 hover:bg-[#c4ccd8]')
              }`}
            >
              <span className="truncate">{room.name}</span>
              {room.type === 'private' && (
                <X 
                  size={10} 
                  className="hover:text-red-500 cursor-pointer" 
                  onClick={(e) => {
                    e.stopPropagation();
                    setRooms(prev => prev.filter(r => r.id !== room.id));
                    if (activeRoomId === room.id) setActiveRoomId(rooms[0].id);
                  }}
                />
              )}
            </button>
          ))}
        </div>

        <div className="flex-1 flex border-2 border-white bg-white shadow-inner relative overflow-hidden">
          <ChatArea 
            room={activeRoom} 
            currentUser={currentUser} 
            onSendMessage={handleSendMessage} 
            loadingState={loadingState}
            onTriggerBot={(id) => triggerBotResponse(id, activeRoomId)}
          />
          <RightPanel 
            room={activeRoom} 
            onAddBot={(bot) => setRooms(prev => prev.map(r => r.id === activeRoomId ? { ...r, participants: [...r.participants, bot] } : r))} 
            onRemoveParticipant={(id) => setRooms(prev => prev.map(r => r.id === activeRoomId ? { ...r, participants: r.participants.filter(p => p.id !== id) } : r))}
            onUserDoubleClick={handleStartPrivateChat}
          />
        </div>
      </div>

      {showSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-[#d4dce8] border-2 border-white shadow-2xl w-72">
            <div className="bg-[#000080] text-white px-2 py-1 flex justify-between items-center font-bold text-xs">
              <span>Profil Ayarları</span>
              <X size={14} className="cursor-pointer" onClick={() => setShowSettingsModal(false)} />
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-700 uppercase mb-1">Yeni Rumuz:</label>
                <input 
                  type="text" 
                  value={tempNick} 
                  onChange={e => setTempNick(e.target.value)} 
                  className="w-full border-2 border-gray-400 p-1 text-sm outline-none font-mono focus:border-blue-800"
                />
              </div>
              <button 
                onClick={handleSaveSettings} 
                className="w-full py-1.5 bg-[#d4dce8] border-2 border-white border-b-black border-r-black font-bold text-xs uppercase hover:bg-white active:bg-gray-200 flex items-center justify-center gap-2"
              >
                <Save size={14} /> KAYDET
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
