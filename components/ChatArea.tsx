
import React, { useEffect, useRef, useState } from 'react';
import { ChatRoom, Participant, LoadingState } from '../types';
import { Send, Smile } from 'lucide-react';
import EmojiPicker from './EmojiPicker';

interface ChatAreaProps {
  room: ChatRoom;
  currentUser: Participant;
  onSendMessage: (text: string) => void;
  loadingState: LoadingState;
  onTriggerBot: (botId: string) => void;
}

export const ChatArea: React.FC<ChatAreaProps> = ({ 
  room, 
  currentUser, 
  onSendMessage, 
  loadingState 
}) => {
  const [inputText, setInputText] = useState('');
  const [showEmojis, setShowEmojis] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  useEffect(() => { scrollToBottom(); }, [room.messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText);
    setInputText('');
  };

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-white mirc-text">
      {/* Message History */}
      <div className="flex-1 overflow-y-auto p-2 space-y-0.5 select-text bg-white">
        
        {/* System Message - Pink Header Style */}
        {/* Fix: Escaped <SohbetChe> characters to prevent the JSX compiler from treating it as a component name */}
        <div className="bg-[#800080] text-white p-1 font-bold text-[13px] mb-2">
          [12:34] {'<SohbetChe>'} Zekanizi Geliştirmek Ve eğlenmek için #Oyun Radyomuzu Dinlemek için #Radyo ircd Komutları Hakkında Yardim almak için #heLp Sunucu Hakkinda bilgi Almak için #operHelp Kanalini Kullanabilirsiniz...
        </div>

        {room.messages.map((msg, idx) => {
          const sender = room.participants.find(p => p.id === msg.senderId) || { name: 'Sistem', color: 'text-gray-500' };
          const isBot = room.participants.find(p => p.id === msg.senderId)?.isAi;
          const time = formatTime(msg.timestamp);

          // Giriş/Çıkış simülasyonu
          if (idx === 0) {
             return (
               <div key={idx} className="text-[#008080] font-bold text-[13px]">
                 [{time}] * Giriş: {sender.name} (user@host.net) (Türkiye'nin bir numaralı sohbet sunucusu)
               </div>
             )
          }

          return (
            <div key={idx} className="flex gap-1.5 items-start">
              <span className="font-bold text-black shrink-0">[{time}]</span>
              <span className={`font-bold shrink-0 ${isBot ? 'text-[#ff00ff]' : 'text-black'}`}>
                &lt;{sender.name}&gt;
              </span>
              <span className="text-black break-words font-medium">{msg.text}</span>
            </div>
          );
        })}

        {loadingState.status === 'thinking' && (
          <div className="text-gray-400 font-bold italic text-[11px] ml-14">
            {/* Displaying participant name instead of ID for a more human feel */}
            * {room.participants.find(p => p.id === loadingState.participantId)?.name || 'Birisi'} yazıyor...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="h-8 flex items-center border-t border-[#808080] px-1 gap-1 bg-[#f1f1f1] shrink-0">
        <div className="flex-1 h-6 bg-white mirc-inset flex items-center px-1">
          <form onSubmit={handleSubmit} className="flex-1 flex">
            <input 
              type="text" 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full h-full outline-none text-[13px] bg-transparent font-medium"
              placeholder=""
              autoFocus
            />
          </form>
        </div>
        <button onClick={() => setShowEmojis(!showEmojis)} className="w-6 h-6 flex items-center justify-center hover:bg-gray-200 mirc-border">
          <Smile size={14} className="text-yellow-600" />
        </button>
        {showEmojis && (
          <div className="absolute bottom-10 right-2 z-50">
            <EmojiPicker onSelect={(e) => setInputText(p => p + e)} onClose={() => setShowEmojis(false)} />
          </div>
        )}
      </div>
    </div>
  );
};
