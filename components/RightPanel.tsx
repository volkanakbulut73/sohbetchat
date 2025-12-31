
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

  const sortedParticipants = [...room.participants].sort((a, b) => {
      if (a.isAi === b.isAi) return a.name.localeCompare(b.name);
      return a.isAi ? -1 : 1;
  });

  return (
    <div className="w-[55px] flex flex-col h-full font-mono text-[9px] select-none bg-white border-l border-gray-200 shrink-0">
        
        {/* Header Count - Ultra Compact */}
        <div className="bg-gray-50 border-b border-gray-100 p-1 flex items-center justify-between px-1">
            <span className="font-bold text-gray-400 text-[8px]">U:{room.participants.length}</span>
            <button 
                onClick={() => setIsAdding(!isAdding)} 
                className="text-blue-500 hover:text-blue-700 font-black text-[10px]"
                title="Bot Ekle"
            >
                +
            </button>
        </div>

        {/* Add Bot Form (Overlay) */}
        {isAdding && (
            <div className="absolute top-8 right-2 w-36 bg-white border-2 border-blue-900 shadow-2xl p-2 z-50">
                <form onSubmit={handleAddSubmit} className="space-y-2">
                    <div className="text-[8px] font-black text-blue-900 mb-1 uppercase">Bot Ekle</div>
                    <input 
                        className="w-full border border-gray-300 p-1 h-6 text-[9px] outline-none focus:border-blue-500" 
                        placeholder="Nick..."
                        autoFocus
                        value={newBotName}
                        onChange={e => setNewBotName(e.target.value)}
                    />
                    <div className="flex gap-1">
                        <button type="submit" className="flex-1 bg-blue-800 text-white text-[8px] font-bold py-1">OK</button>
                        <button type="button" onClick={() => setIsAdding(false)} className="flex-1 bg-gray-200 text-gray-600 text-[8px] font-bold py-1">X</button>
                    </div>
                </form>
            </div>
        )}

        {/* List - mIRC style dense list */}
        <div className="flex-1 overflow-y-auto no-scrollbar py-0.5">
            {sortedParticipants.map(p => {
                let prefix = "";
                let colorClass = "text-gray-800";
                
                if (p.isAi) {
                    prefix = "@"; 
                    colorClass = "text-pink-600"; 
                } else {
                    prefix = "+"; 
                    colorClass = "text-blue-800"; 
                }

                return (
                    <div 
                        key={p.id} 
                        className="group flex items-center px-1 py-0.5 hover:bg-blue-50 cursor-pointer transition-colors overflow-hidden whitespace-nowrap"
                        title={p.name}
                        onDoubleClick={() => onUserDoubleClick(p)}
                    >
                        <span className={`w-2 font-black text-[9px] ${colorClass} shrink-0 mr-0.5`}>
                            {prefix}
                        </span>
                        <span className={`truncate font-bold ${colorClass} tracking-tighter`}>
                            {p.name}
                        </span>
                    </div>
                );
            })}
        </div>
    </div>
  );
};
