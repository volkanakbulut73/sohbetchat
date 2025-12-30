
export enum MessageType {
  USER = 'USER',
  SYSTEM = 'SYSTEM',
  ERROR = 'ERROR'
}

export interface Participant {
  id: string;
  name: string;
  persona: string;
  avatar: string;
  isAi: boolean;
  color: string;
}

export interface Message {
  id: string;
  senderId?: string;
  sender?: string;
  text: string;
  timestamp: number;
  type?: MessageType;
  channel?: string;
}

export interface ChatRoom {
  id: string;
  name: string;
  topic: string;
  participants: Participant[];
  messages: Message[];
  lastMessageAt: number;
  type: 'channel' | 'private';
  targetUserId?: string;
  hasAlert?: boolean;
}

export interface LoadingState {
  status: 'idle' | 'thinking' | 'error';
  participantId?: string;
}

export interface UserRegistration {
  id?: string;
  nickname: string;
  fullName?: string;
  full_name?: string;
  email: string;
  password?: string;
  criminal_record_file?: string | null;
  insurance_file?: string | null;
  status: 'pending' | 'approved' | 'rejected';
  created_at?: string;
}

export interface Channel {
  id?: number | string;
  name: string;
  unreadCount?: number;
  users?: string[];
  islocked?: boolean;
  ops?: string[];
  bannedusers?: string[];
}

export const INITIAL_USER: Participant = {
  id: 'user-1',
  name: 'Lider',
  persona: 'Sohbet kanalının yöneticisi ve moderatörü.',
  avatar: 'https://picsum.photos/id/64/200/200',
  isAi: false,
  color: 'bg-slate-700'
};

export const AVATAR_COLORS: string[] = [
  'bg-slate-700', 'bg-pink-600', 'bg-red-600', 'bg-blue-600', 
  'bg-green-600', 'bg-indigo-600', 'bg-purple-600', 'bg-yellow-600',
  'bg-orange-600', 'bg-teal-600'
];

export const PREMADE_BOTS: Participant[] = [
  {
    id: 'bot-lara',
    name: 'Lara',
    persona: 'Kanalın neşeli ve yardımsever mIRC botu. Hoşgeldin mesajları yazar, espri yapar ve kullanıcılara yardımcı olur.',
    avatar: 'https://picsum.photos/id/1012/200/200',
    isAi: true,
    color: 'bg-pink-600'
  },
  {
    id: 'bot-socrates',
    name: 'Sokrates',
    persona: 'Antik Yunan filozofu. Her şeyi mIRC jargonuna uygun şekilde sorgular, bilgece ve bazen iğneleyici konuşur.',
    avatar: 'https://picsum.photos/id/1025/200/200',
    isAi: true,
    color: 'bg-stone-600'
  }
];

export const INITIAL_ROOM: ChatRoom = {
  id: 'room-1',
  name: '#Sohbet',
  topic: 'Workigom Secure Network - Gerçek ve Onaylı Kullanıcılar Odası',
  participants: [...PREMADE_BOTS],
  messages: [
    {
      id: 'msg-start',
      senderId: 'bot-lara',
      text: 'Selam millet! Workigom güvenli ağına hoş geldiniz. Sadece onaylı üyeler ve aktif botlar burada yer alabilir.',
      timestamp: Date.now()
    }
  ],
  lastMessageAt: Date.now(),
  type: 'channel',
  hasAlert: false
};
