
import React from 'react';
import { ChatRoom, Participant } from '../types';

interface RightPanelProps {
  room: ChatRoom;
  onUserDoubleClick?: (user: Participant) => void;
}

export const RightPanel: React.FC<RightPanelProps> = ({ room, onUserDoubleClick }) => {
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
          if (p.name === 'Lider' || p.name === 'Admin') {
            prefix = "&";
            color = "text-[#ff0000]"; // Red for owner/admin
          } else if (p.isAi) {
            prefix = "@";
            color = "text-[#ff8c00]"; // Orange for ops
          } else {
            prefix = "+";
            color = "text-[#00ff00]"; // Green for users
          }

          return (
            <div 
              key={p.id} 
              onDoubleClick={() => onUserDoubleClick?.(p)}
              className="flex items-center px-1 cursor-pointer transition-colors hover:bg-gray-800 active:bg-[#000080]"
              title={`${p.name} ile özel sohbet başlatmak için çift tıklayın`}
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
    </div>
  );
};
