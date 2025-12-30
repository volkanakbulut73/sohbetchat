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
    <div className="w-32 md:w-56 flex flex-col h-full font-mono text-xs select-none bg-white border-l border-gray-400">
        
        {/* Header Count */}
        <div className="bg-[#f0f0f0] border-b border-gray-300 p-1 font-bold text-center text-gray-600 uppercase flex justify-between items-center px-2">
            <span>USERS: {room.participants.length}</span>
            <button 
                onClick={() => setIsAdding(!isAdding)} 
                className="text-blue-800 hover:text-red-600 font-bold"
                title="Bot Ekle"
            >
                [+]
            </button>
        </div>

        {/* Add Bot Form (Overlay) */}
        {isAdding && (
            <div className="absolute top-8 right-2 w-48 bg-[#d4dce8] border-2 border-white shadow-[4px_4px_5px_rgba(0,0,0,0.3)] p-2 z-20 outline outline-1 outline-gray-500">
                <form onSubmit={handleAddSubmit} className="space-y-2">
                    <div className="text-[10px] font-bold text-[#000080] mb-1">YENİ BOT EKLE</div>
                    <input 
                        className="w-full border border-gray-500 p-1 h-6 text-xs" 
                        placeholder="Bot Adı"
                        autoFocus
                        value={newBotName}
                        onChange={e => setNewBotName(e.target.value)}
                    />
                    <div className="flex gap-1">
                        <button type="submit" className="flex-1 bg-white border border-gray-500 text-xs font-bold hover:bg-blue-100">OK</button>
                        <button type="button" onClick={() => setIsAdding(false)} className="flex-1 bg-white border border-gray-500 text-xs font-bold hover:bg-red-100">IPTAL</button>
                    </div>
                </form>
            </div>
        )}

        {/* List */}
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300">
            {sortedParticipants.map(p => {
                // Determine Prefix
                let prefix = "";
                let colorClass = "text-black";
                
                if (p.isAi) {
                    prefix = "@"; // Op/Bot
                    colorClass = "text-[#800000]"; // Red for Ops/Bots 
                } else {
                    prefix = "+"; // Voice/User
                    colorClass = "text-[#000080]"; // Blue for regular
                }

                return (
                    <div 
                        key={p.id} 
                        className="group flex items-center px-2 py-[1px] hover:bg-[#000080] hover:text-white cursor-default"
                        title="Özel sohbet için çift tıklayın"
                        onDoubleClick={() => onUserDoubleClick(p)}
                    >
                        {/* Always visible View */}
                        <span className={`w-4 font-bold ${colorClass} group-hover:text-white`}>
                            {prefix}
                        </span>
                        <span className={`truncate font-bold ${colorClass} group-hover:text-white flex-1`}>
                            {p.name}
                        </span>

                        {/* Remove Action (Hidden by default, visible on hover) */}
                        {!p.isAi && p.id !== 'user-1' && (
                            <button 
                                onClick={(e) => { e.stopPropagation(); onRemoveParticipant(p.id); }}
                                className="hidden group-hover:block text-white hover:text-red-300 font-bold px-1"
                            >
                                <X size={10} />
                            </button>
                        )}
                    </div>
                );
            })}
        </div>
    </div>
  );
};