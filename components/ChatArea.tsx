
import React, { useEffect, useRef, useState } from 'react';
import { ChatRoom, Participant, LoadingState } from '../types';
import { Bold, Italic, Underline, Palette, Loader2, Smile, ShieldBan, Send } from 'lucide-react';
import EmojiPicker from './EmojiPicker';

interface ChatAreaProps {
  room: ChatRoom;
  currentUser: Participant;
  onSendMessage: (text: string) => void;
  loadingState: LoadingState;
  onTriggerBot: (botId: string) => void;
  isBlocked?: boolean;
  onToggleBlock?: () => void;
}

export const ChatArea: React.FC<ChatAreaProps> = ({ 
  room, 
  currentUser, 
  onSendMessage, 
  loadingState,
  onTriggerBot,
  isBlocked,
  onToggleBlock
}) => {
  const [inputText, setInputText] = useState('');
  const [showEmojis, setShowEmojis] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [room.messages, loadingState.status]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText);
    setInputText('');
    setShowEmojis(false);
  };

  const handleEmojiSelect = (emoji: string) => {
    setInputText(prev => prev + emoji);
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-full bg-[#f8fafc] relative font-sans text-sm">
      
      {/* Soft Header Info */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-200 p-2 flex justify-between items-center z-10 shadow-sm">
          <div className="flex flex-col">
            <span className="text-[11px] font-black text-blue-900 uppercase tracking-wider">
                {room.type === 'channel' ? room.name : `ÖZEL: ${room.name}`}
            </span>
            <span className="text-[9px] text-gray-400 font-bold truncate max-w-[200px]">
                {room.topic}
            </span>
          </div>
          {room.type === 'private' && (
              <button 
                onClick={onToggleBlock}
                className={`flex items-center gap-1 px-3 py-1 rounded-full text-[9px] font-black uppercase transition-all ${isBlocked ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
              >
                  <ShieldBan size={10}/> {isBlocked ? 'ENGELİ KALDIR' : 'ENGELLE'}
              </button>
          )}
      </div>

      {/* Messages Log - Bubble Style */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-[#f8fafc] to-[#f1f5f9] select-text scroll-smooth">
        
        {/* System Greeting */}
        <div className="flex justify-center my-2">
            <span className="bg-blue-50 text-blue-600 text-[9px] font-bold px-3 py-1 rounded-full border border-blue-100 uppercase tracking-tighter">
                *** {room.name} oturumu aktif edildi
            </span>
        </div>

        {room.messages.map((msg, index) => {
          const sender = room.participants.find(p => p.id === msg.senderId) || currentUser;
          const isMe = msg.senderId === currentUser.id;
          
          return (
            <div 
              key={msg.id} 
              className={`flex items-end gap-2 animate-message ${isMe ? 'flex-row-reverse' : 'flex-row'}`}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
               {/* Avatar */}
               <div className="shrink-0 mb-1">
                  <img 
                    src={sender.avatar} 
                    alt={sender.name}
                    className={`w-8 h-8 rounded-2xl border-2 border-white shadow-sm object-cover ${sender.isAi ? 'ring-2 ring-pink-200' : 'ring-2 ring-blue-100'}`} 
                  />
               </div>

               {/* Message Bubble */}
               <div className={`flex flex-col max-w-[75%] ${isMe ? 'items-end' : 'items-start'}`}>
                  <div className={`px-4 py-2.5 rounded-2xl shadow-sm relative ${
                    isMe 
                      ? 'bg-blue-600 text-white rounded-br-none' 
                      : (sender.isAi ? 'bg-pink-50 text-pink-900 border border-pink-100 rounded-bl-none' : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none')
                  }`}>
                    {!isMe && (
                      <div className={`text-[10px] font-black mb-1 uppercase tracking-tighter ${sender.isAi ? 'text-pink-600' : 'text-blue-800'}`}>
                        {sender.isAi ? `@${sender.name}` : sender.name}
                      </div>
                    )}
                    <div className="text-[13px] leading-relaxed font-medium">
                      {msg.text}
                    </div>
                  </div>
                  <span className="text-[9px] text-gray-400 mt-1 font-bold">
                    {formatTime(msg.timestamp)}
                  </span>
               </div>
            </div>
          );
        })}

        {loadingState.status === 'thinking' && (
           <div className="flex items-center gap-2 text-gray-400 animate-pulse ml-10">
             <div className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:0.4s]"></span>
             </div>
             <span className="text-[10px] font-bold uppercase tracking-widest">Yazıyor...</span>
           </div>
        )}

        {isBlocked && (
            <div className="bg-red-50 text-red-500 border border-red-100 p-3 rounded-xl text-center text-xs font-bold italic">
                Bu kullanıcıyı engellediniz.
            </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Modernized Input Area */}
      <div className="p-3 bg-white border-t border-gray-100">
        
        {/* Quick Tools */}
        <div className="flex items-center gap-2 mb-2 px-1 relative">
            <button 
                type="button"
                onClick={() => setShowEmojis(!showEmojis)}
                className={`p-1.5 rounded-lg transition-colors ${showEmojis ? 'bg-yellow-50 text-yellow-600' : 'text-gray-400 hover:bg-gray-100'}`}
                title="Emoji"
            >
                <Smile size={18} />
            </button>
            
            <div className="h-4 w-px bg-gray-200"></div>

            {room.type === 'channel' && (
                <div className="flex gap-2 overflow-x-auto no-scrollbar items-center">
                    {room.participants.filter(p => p.isAi).map(bot => (
                        <button
                            key={bot.id}
                            onClick={() => onTriggerBot(bot.id)}
                            className="px-2 py-1 rounded-md text-[9px] font-black uppercase bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all whitespace-nowrap"
                            disabled={loadingState.status === 'thinking'}
                        >
                            @{bot.name}
                        </button>
                    ))}
                </div>
            )}

            {/* Emoji Picker Popup */}
            {showEmojis && (
                <div className="absolute bottom-12 left-0 z-50">
                    <EmojiPicker 
                        onSelect={handleEmojiSelect} 
                        onClose={() => setShowEmojis(false)}
                    />
                </div>
            )}
        </div>

        {/* Text Input */}
        <form onSubmit={handleSubmit} className="flex gap-2 items-center">
          <div className="flex-1 relative">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Bir şeyler yaz..."
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 text-sm outline-none focus:bg-white focus:border-blue-400 transition-all placeholder:text-gray-400"
              disabled={loadingState.status === 'thinking' || isBlocked}
            />
          </div>
          <button
            type="submit"
            disabled={!inputText.trim() || loadingState.status === 'thinking' || isBlocked}
            className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 active:scale-95 transition-all shadow-md shadow-blue-200 disabled:opacity-50 disabled:shadow-none"
          >
            {loadingState.status === 'thinking' ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          </button>
        </form>
      </div>
    </div>
  );
};
