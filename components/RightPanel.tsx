
import React from 'react';
import { ChatRoom } from '../types';

interface RightPanelProps {
  room: ChatRoom;
}

export const RightPanel: React.FC<RightPanelProps> = ({ room }) => {
  const sortedParticipants = [...room.participants].sort((a, b) => {
    if (a.isAi === b.isAi) return a.name.localeCompare(b.name);
    return a.isAi ? -1 : 1;
  });

  return (
    <div className="w-[120px] bg-black border-l border-[#808080] flex flex-col shrink-0">
      {/* Scrollable list */}
      <div className="flex-1 overflow-y-auto px-1 py-1 font-bold text-[13px] mirc-text">
        {sortedParticipants.map((p, idx) => {
          let prefix = "";
          let color = "text-white";

          // mIRC Hierarchy Colors
          if (p.name === 'Lider') {
            prefix = "&";
            color = "text-[#ff0000]"; // Red for owner
          } else if (p.isAi) {
            prefix = "@";
            color = "text-[#ff8c00]"; // Orange for ops
          } else {
            prefix = "+";
            color = "text-[#00ff00]"; // Green for users
          }

          // Resimdeki seçili kullanıcı efekti simülasyonu
          const isSelected = p.name === 'Egoist';

          return (
            <div 
              key={p.id} 
              className={`flex items-center px-1 cursor-pointer transition-colors ${isSelected ? 'bg-[#000080]' : 'hover:bg-gray-800'}`}
            >
              <span className={`w-3.5 shrink-0 ${color}`}>{prefix}</span>
              <span className={`truncate tracking-tight ${color}`}>{p.name}</span>
            </div>
          );
        })}
        
        {/* Mock additional users for mIRC feel */}
        {['Ayaz', 'AyŞee', 'CaNn', 'CemRee', 'CiciKizz', 'efsuN'].map(name => (
          <div key={name} className="flex items-center px-1 hover:bg-gray-800 cursor-pointer">
            <span className="w-3.5 shrink-0"></span>
            <span className="truncate tracking-tight text-white">{name}</span>
          </div>
        ))}
      </div>

      {/* Right-most Channel Bar (Partial from image) */}
      <div className="w-full h-auto bg-[#c0c0c0] border-t border-[#808080] p-1 space-y-0.5">
        {['#SohbetChe.Net', '#Radyo', '#Oyun', '#Kelime', '#Yarisma'].map(ch => (
          <div key={ch} className="text-[10px] text-red-600 font-bold truncate leading-tight">
            {ch}
          </div>
        ))}
      </div>
    </div>
  );
};
