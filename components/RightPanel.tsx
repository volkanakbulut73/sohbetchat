
import React, { useState } from 'react';
import { Participant, ChatRoom, AVATAR_COLORS } from '../types';
import { Plus, X } from 'lucide-react';

interface RightPanelProps {
  room: ChatRoom;
  onAddBot: (bot: Participant) => void;
  onRemoveParticipant: (id: string) => void;
  onUserDoubleClick: (participant: Participant) => void;
}

export const RightPanel: React.FC<RightPanelProps> = ({ 
    room, 
    onAddBot, 
    onRemoveParticipant,
    onUserDoubleClick
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newBotName, setNewBotName] = useState('');
  const [newBotPersona, setNewBotPersona] = useState('');

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBotName.trim()) return;

    const randomColor = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
    const randomId = Math.floor(Math.random() * 1000);

    const newBot: Participant = {
        id: `bot-${Date.now()}`,
        name: newBotName,
        persona: newBotPersona || 'Yardımcı bot',
        isAi: true,
        avatar: `https://picsum.photos/id/${randomId}/200/200`,
        color: randomColor
    };

    onAddBot(newBot);
    setNewBotName('');
    setNewBotPersona('');
    setIsAdding(false);
  };

  // Sort: AI first, then humans
  const sortedParticipants = [...room.participants].sort((a, b) => {
      if (a.isAi === b.isAi) return a.name.localeCompare(b.name);
      return a.isAi ? -1 : 1;
  });

  return (
    <div className="w-24 md:w-28 flex flex-col h-full font-mono text-[10px] select-none bg-white border-l border-gray-100 shrink-0">
        
        {/* Header Count */}
        <div className="bg-[#f8fafc] border-b border-gray-100 p-1.5 font-bold text-center text-gray-400 uppercase flex justify-between items-center px-1.5">
            <span className="truncate">U: {room.participants.length}</span>
            <button 
                onClick={() => setIsAdding(!isAdding)} 
                className="text-blue-400 hover:text-blue-700 font-bold px-0.5"
                title="Bot Ekle"
            >
                [+]
            </button>
        </div>

        {/* Add Bot Form (Overlay) */}
        {isAdding && (
            <div className="absolute top-10 right-1 w-32 bg-white border border-gray-200 shadow-xl rounded-xl p-2 z-20">
                <form onSubmit={handleAddSubmit} className="space-y-2">
                    <div className="text-[8px] font-black text-gray-400 mb-1 uppercase tracking-widest">Bot Ekle</div>
                    <input 
                        className="w-full border border-gray-100 bg-gray-50 rounded-lg p-1.5 h-7 text-[9px] outline-none focus:border-blue-400" 
                        placeholder="Ad..."
                        autoFocus
                        value={newBotName}
                        onChange={e => setNewBotName(e.target.value)}
                    />
                    <div className="flex gap-1">
                        <button type="submit" className="flex-1 bg-blue-600 text-white rounded-lg text-[8px] font-bold p-1 hover:bg-blue-700">EKLE</button>
                        <button type="button" onClick={() => setIsAdding(false)} className="flex-1 bg-gray-100 text-gray-400 rounded-lg text-[8px] font-bold p-1 text-center">X</button>
                    </div>
                </form>
            </div>
        )}

        {/* List */}
        <div className="flex-1 overflow-y-auto no-scrollbar py-1">
            {sortedParticipants.map(p => {
                // Determine Prefix
                let prefix = "";
                let colorClass = "text-gray-800";
                
                if (p.isAi) {
                    prefix = "@"; // Op/Bot
                    colorClass = "text-pink-600"; // Pink for AI/Bot 
                } else {
                    prefix = "+"; // Voice/User
                    colorClass = "text-blue-800"; // Blue for regular
                }

                return (
                    <div 
                        key={p.id} 
                        className="group flex items-center px-1.5 py-0.5 hover:bg-blue-50 cursor-pointer rounded-md mx-1 transition-colors"
                        title="Özel sohbet için çift tıklayın"
                        onDoubleClick={() => onUserDoubleClick(p)}
                    >
                        <span className={`w-2.5 font-black text-[9px] shrink-0 ${colorClass}`}>
                            {prefix}
                        </span>
                        <span className={`truncate font-bold ${colorClass} flex-1`}>
                            {p.name}
                        </span>

                        {/* Remove Action (Hidden by default, visible on hover) */}
                        {!p.isAi && p.id !== 'user-1' && (
                            <button 
                                onClick={(e) => { e.stopPropagation(); onRemoveParticipant(p.id); }}
                                className="hidden group-hover:block text-red-400 hover:text-red-600 font-bold px-0.5"
                            >
                                <X size={9} />
                            </button>
                        )}
                    </div>
                );
            })}
        </div>
    </div>
  );
};
