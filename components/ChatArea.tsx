import React, { useEffect, useRef, useState } from 'react';
import { ChatRoom, Participant, LoadingState } from '../types';
import { Bold, Italic, Underline, Palette, Loader2, Smile, ShieldBan, CheckCircle } from 'lucide-react';
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
    messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
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
    <div className="flex flex-col h-full bg-white relative font-mono text-sm">
      
      {/* Block Banner (Only Private) */}
      {room.type === 'private' && (
          <div className="bg-[#f0f0f0] border-b border-gray-400 p-1 flex justify-between items-center">
              <span className="text-[10px] text-gray-500 font-bold px-2">
                  Özel Sohbet: {room.name}
              </span>
              <button 
                onClick={onToggleBlock}
                className={`flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase border border-gray-400 ${isBlocked ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-black hover:bg-gray-200'}`}
              >
                  {isBlocked ? <><ShieldBan size={12}/> Engeli Kaldır</> : <><ShieldBan size={12}/> Engelle</>}
              </button>
          </div>
      )}

      {/* Messages Log */}
      <div className="flex-1 overflow-y-auto p-1 bg-white select-text cursor-text scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
        {/* System Greeting / Topic */}
        {room.type === 'channel' && (
            <div className="text-[#008000] font-bold mb-1">
                *** {room.name} kanalına giriş yaptınız.
            </div>
        )}
        {room.type === 'channel' && (
            <div className="text-[#008000] mb-2">
                *** Konu: <span className="text-black font-normal">{room.topic}</span>
            </div>
        )}
        {room.type === 'private' && (
            <div className="text-[#008000] font-bold mb-2">
                *** {room.name} ile özel sohbet başlatıldı.
            </div>
        )}

        {room.messages.map((msg) => {
          const sender = room.participants.find(p => p.id === msg.senderId) || currentUser;
          const isMe = msg.senderId === currentUser.id;
          const isBot = sender.isAi;
          
          // Classic mIRC Colors
          const nickColor = isMe ? "text-[#000080]" : (isBot ? "text-[#800000]" : "text-[#000000]");
          const bracketColor = "text-gray-500";

          return (
            <div key={msg.id} className="leading-[1.3] -ml-0.5 hover:bg-[#f0f0f0] px-1">
               <span className="text-gray-400 text-[11px] mr-1 inline-block min-w-[35px]">[{formatTime(msg.timestamp)}]</span>
               <span className={`${bracketColor}`}>&lt;</span>
               <span 
                 className={`font-bold cursor-pointer hover:underline ${nickColor}`}
                 title={sender.persona}
               >
                 {sender.name}
               </span>
               <span className={`${bracketColor}`}>&gt;</span>
               <span className="text-black ml-1 break-words">{msg.text}</span>
            </div>
          );
        })}

        {loadingState.status === 'thinking' && (
           <div className="leading-tight px-1 py-[1px] text-gray-500 italic flex items-center gap-1">
             * {loadingState.participantId ? room.participants.find(p => p.id === loadingState.participantId)?.name : 'Bot'} yazıyor...
           </div>
        )}

        {isBlocked && (
            <div className="text-red-500 font-bold text-xs italic mt-2 px-1">
                *** Bu kullanıcı engellendi. Mesajları görüntülenmeyecek.
            </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area Wrapper */}
      <div className="bg-[#d4dce8] p-1 border-t border-gray-400">
        
        {/* Formatting Toolbar */}
        <div className="flex items-center gap-1 mb-1 px-1 relative">
            <button className="w-6 h-5 bg-[#d4dce8] border border-white border-b-gray-500 border-r-gray-500 hover:bg-white active:border-t-gray-500 active:border-l-gray-500 flex items-center justify-center" title="Kalın"><Bold size={12} /></button>
            <button className="w-6 h-5 bg-[#d4dce8] border border-white border-b-gray-500 border-r-gray-500 hover:bg-white active:border-t-gray-500 active:border-l-gray-500 flex items-center justify-center" title="İtalik"><Italic size={12} /></button>
            <button className="w-6 h-5 bg-[#d4dce8] border border-white border-b-gray-500 border-r-gray-500 hover:bg-white active:border-t-gray-500 active:border-l-gray-500 flex items-center justify-center" title="Altı Çizili"><Underline size={12} /></button>
            <button className="w-6 h-5 bg-[#d4dce8] border border-white border-b-gray-500 border-r-gray-500 hover:bg-white active:border-t-gray-500 active:border-l-gray-500 flex items-center justify-center text-purple-700" title="Renk"><Palette size={12} /></button>
            <div className="w-px h-4 bg-gray-500 mx-1"></div>
            <button 
                type="button"
                onClick={() => setShowEmojis(!showEmojis)}
                className={`w-6 h-5 bg-[#d4dce8] border border-white border-b-gray-500 border-r-gray-500 hover:bg-white active:border-t-gray-500 active:border-l-gray-500 flex items-center justify-center ${showEmojis ? 'bg-white border-t-gray-500 border-l-gray-500' : ''}`}
                title="Emoji"
            >
                <Smile size={12} className="text-yellow-600 fill-current" />
            </button>
            
            {/* Quick Bot Pings (Only in Channels) */}
            {room.type === 'channel' && (
                <div className="flex-1 flex justify-end gap-2 overflow-x-auto items-center px-2">
                    <span className="text-[10px] text-gray-600 font-bold hidden sm:inline">PING:</span>
                    {room.participants.filter(p => p.isAi).map(bot => (
                        <button
                            key={bot.id}
                            onClick={() => onTriggerBot(bot.id)}
                            className="text-[10px] text-[#000080] hover:text-red-600 hover:underline whitespace-nowrap"
                            disabled={loadingState.status === 'thinking'}
                        >
                            @{bot.name}
                        </button>
                    ))}
                </div>
            )}

            {/* Emoji Picker Popup */}
            {showEmojis && (
                <div className="absolute bottom-8 left-0 z-50">
                    <EmojiPicker 
                        onSelect={handleEmojiSelect} 
                        onClose={() => setShowEmojis(false)}
                    />
                </div>
            )}
        </div>

        {/* Text Input */}
        <form onSubmit={handleSubmit} className="flex gap-1">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Escape' && setShowEmojis(false)}
            placeholder=""
            autoFocus
            className="flex-1 border-2 border-gray-500 border-r-white border-b-white bg-white px-2 py-1 text-sm outline-none font-mono shadow-[inset_1px_1px_2px_rgba(0,0,0,0.2)] disabled:bg-gray-100"
            disabled={loadingState.status === 'thinking' || isBlocked}
          />
          <button
            type="submit"
            disabled={!inputText.trim() || loadingState.status === 'thinking' || isBlocked}
            className="px-4 bg-[#d4dce8] border-2 border-white border-b-gray-600 border-r-gray-600 active:border-t-gray-600 active:border-l-gray-600 text-black font-bold text-xs uppercase disabled:opacity-50"
          >
            {loadingState.status === 'thinking' ? <Loader2 size={16} className="animate-spin" /> : 'Gönder'}
          </button>
        </form>
      </div>
    </div>
  );
};