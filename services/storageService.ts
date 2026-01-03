
import PocketBase from 'pocketbase';
import { Message, Channel, MessageType, UserRegistration } from '../types';
import { CHAT_MODULE_CONFIG } from '../config';

export const isConfigured = () => 
  CHAT_MODULE_CONFIG.POCKETBASE_URL && 
  CHAT_MODULE_CONFIG.POCKETBASE_URL.startsWith('http');

const pbUrl = CHAT_MODULE_CONFIG.POCKETBASE_URL || 'http://127.0.0.1:8090';
export const pb = new PocketBase(pbUrl);

// Otomatik iptal işlemleri için
pb.autoCancellation(false);

const handleFetchError = (err: any, context: string) => {
  if (typeof window !== 'undefined' && !navigator.onLine) throw new Error("İnternet bağlantınız yok.");
  
  // PocketBase detaylı hata çözümlemesi
  const msg = err.message || err.data?.message || String(err);
  
  // Validation hatalarını birleştir
  if (err.data?.data) {
    const details = Object.entries(err.data.data)
      .map(([key, val]: [string, any]) => `${key}: ${val.message}`)
      .join(', ');
    if (details) {
      console.error(`PocketBase Validation Error [${context}]:`, details);
      throw new Error(details);
    }
  }

  console.error(`PocketBase Error [${context}]:`, msg, err.data);
  throw new Error(msg); 
};

export const storageService = {
  isConfigured,

  // --- Realtime Subscriptions ---
  async subscribeToMessages(callback: (msg: Message) => void) {
    try {
      return await pb.collection('messages').subscribe('*', (e) => {
        if (e.action === 'create') {
          callback({
            id: e.record.id,
            sender: e.record.sender,
            text: e.record.text,
            timestamp: new Date(e.record.created).getTime(),
            type: e.record.type as MessageType,
            channel: e.record.channel
          });
        }
      });
    } catch (err) {
      console.error("Realtime bağlantı hatası:", err);
      return () => {}; // Boş fonksiyon döndür
    }
  },

  async unsubscribeFromMessages() {
    try {
      return await pb.collection('messages').unsubscribe();
    } catch (err) { }
  },
  // -----------------------------

  async getBotConfig(): Promise<string> {
    try {
      const record = await pb.collection('system_config').getFirstListItem('key="bot_personality"');
      return record.value || "Sen mIRC botu Lara'sın. Samimi ve naziksin.";
    } catch (e: any) {
      return "Sen mIRC botu Lara'sın. Samimi ve naziksin.";
    }
  },

  async updateBotConfig(personality: string) {
    try {
      try {
        const record = await pb.collection('system_config').getFirstListItem('key="bot_personality"');
        await pb.collection('system_config').update(record.id, { value: personality });
      } catch (e: any) {
        if (e.status === 404) {
          await pb.collection('system_config').create({ key: 'bot_personality', value: personality });
        }
      }
    } catch (e) { handleFetchError(e, 'updateBotConfig'); }
  },

  async registerUser(regData: UserRegistration) {
    try {
      // Önce manuel unique kontrolü yapalım (Daha temiz hata mesajı için)
      try {
        const existing = await pb.collection('registrations').getList(1, 1, {
            filter: `email="${regData.email}" || nickname="${regData.nickname}"`
        });
        if (existing.totalItems > 0) {
            // Hangisinin çakıştığını bulmaya çalış
            const found = existing.items[0];
            if (found.email === regData.email) throw new Error('Bu email adresi zaten sistemde kayıtlı.');
            if (found.nickname === regData.nickname) throw new Error('Bu nickname başkası tarafından alınmış.');
            throw new Error('Bu email veya nickname zaten kullanımda.');
        }
      } catch (checkErr: any) {
          // Eğer bizim fırlattığımız hataysa yukarı gönder
          if (checkErr.message.includes('zaten')) throw checkErr;
      }

      await pb.collection('registrations').create({
        nickname: regData.nickname,
        full_name: regData.fullName,
        email: regData.email,
        password: regData.password,
        criminal_record_file: regData.criminal_record_file,
        insurance_file: regData.insurance_file,
        status: 'pending'
      });
    } catch (e) { handleFetchError(e, 'registerUser'); }
  },

  async registerGoogleUser(email: string, fullName: string, nickname: string) {
    try {
      const existing = await pb.collection('registrations').getList(1, 1, { filter: `email="${email}"` });
      if (existing.totalItems > 0) return;

      await pb.collection('registrations').create({
        nickname: nickname,
        full_name: fullName,
        email: email,
        password: 'google_oauth_no_password',
        status: 'pending'
      });
    } catch (e) { handleFetchError(e, 'registerGoogleUser'); }
  },

  async loginUser(email: string, pass: string): Promise<UserRegistration | null> {
    try {
      const result = await pb.collection('registrations').getList(1, 1, {
        filter: `email="${email}" && password="${pass}"`
      });

      if (result.totalItems === 0) return null;
      
      const data = result.items[0];
      if (data.status === 'rejected') throw new Error('Başvurunuz reddedildi. Lütfen yönetici ile iletişime geçin.');
      if (data.status === 'pending') throw new Error('Hesabınız henüz onaylanmadı. Lütfen bekleyiniz.');
      
      return { 
        id: data.id,
        nickname: data.nickname,
        fullName: data.full_name,
        email: data.email,
        status: data.status,
        created_at: data.created,
        criminal_record_file: data.criminal_record_file,
        insurance_file: data.insurance_file
      } as UserRegistration;

    } catch (e: any) { 
      if (e.message && (e.message.includes('onaylanmadı') || e.message.includes('bekleyiniz') || e.message.includes('reddedildi'))) throw e;
      return null; 
    }
  },

  async loginWithGoogle(email: string): Promise<UserRegistration | null> {
    try {
      const result = await pb.collection('registrations').getList(1, 1, {
        filter: `email="${email}"`
      });

      if (result.totalItems === 0) return null;

      const data = result.items[0];
      if (data.status === 'rejected') throw new Error('Bu Google hesabına bağlı başvuru reddedildi.');
      if (data.status === 'pending') throw new Error('Google hesabınızla ilişkili başvuru henüz onaylanmadı.');
      
      return { 
          id: data.id,
          nickname: data.nickname,
          fullName: data.full_name,
          email: data.email,
          status: data.status,
          created_at: data.created 
      } as UserRegistration;

    } catch (e: any) { 
      if (e.message && (e.message.includes('onaylanmadı') || e.message.includes('reddedildi'))) throw e;
      return null; 
    }
  },

  async adminLogin(user: string, pass: string): Promise<boolean> {
    try {
      const records = await pb.collection('system_config').getList(1, 10, {
          filter: 'key="admin_username" || key="admin_password"'
      });
      
      const dbAdmin = records.items.find(r => r.key === 'admin_username')?.value;
      const dbPass = records.items.find(r => r.key === 'admin_password')?.value;
      
      // Eğer veritabanında henüz admin yoksa varsayılanı kabul et
      if (!dbAdmin || !dbPass) return user === 'admin' && pass === 'password123';
      
      return user === dbAdmin && pass === dbPass;
    } catch (e) { return user === 'admin' && pass === 'password123'; }
  },

  async getAllRegistrations(): Promise<UserRegistration[]> {
    if (!isConfigured()) return [];
    try {
      const records = await pb.collection('registrations').getFullList({
          sort: '-created',
      });
      return records.map((d: any) => ({ 
          ...d, 
          fullName: d.full_name,
          created_at: d.created
      })) as UserRegistration[];
    } catch (err) { return []; }
  },

  async updateRegistrationStatus(id: string, status: 'approved' | 'rejected') {
    try {
      await pb.collection('registrations').update(id, { status });
    } catch (e) { handleFetchError(e, 'updateStatus'); }
  },

  async sendChatNotification(channel: string, text: string) {
    try {
      let targetChannels: string[] = [];
      if (channel === 'all') {
        const records = await pb.collection('channels').getFullList();
        targetChannels = records.map((c: any) => c.name);
        if(targetChannels.length === 0) targetChannels = ['#Sohbet']; // Fallback
      } else { targetChannels = [channel]; }
      
      for (const c of targetChannels) {
          await pb.collection('messages').create({
              sender: 'SYSTEM',
              text,
              type: MessageType.SYSTEM,
              channel: c
          });
      }
      
      await pb.collection('notifications_log').create({ 
          type: 'chat', 
          target: channel, 
          body: text, 
          sender_admin: 'WorkigomAdmin' 
      });
    } catch (e) { handleFetchError(e, 'sendChatNotification'); }
  },

  async getNotificationLogs() {
    try {
      const records = await pb.collection('notifications_log').getList(1, 50, {
          sort: '-created'
      });
      return records.items.map((r: any) => ({
          ...r,
          created_at: r.created
      }));
    } catch (e) { return []; }
  },

  async getChannels(): Promise<Channel[]> {
    try {
      const records = await pb.collection('channels').getFullList();
      return records.map((c: any) => ({ 
          ...c, 
          unreadCount: 0, 
          users: [], 
          islocked: c.islocked ?? false
      })) as Channel[];
    } catch (e) { return []; }
  },

  async getMessagesByChannel(channelName: string): Promise<Message[]> {
    try {
      const result = await pb.collection('messages').getList(1, 100, {
          filter: `channel="${channelName}"`,
          sort: 'created'
      });
      
      return result.items.map((m: any) => ({ 
        id: m.id, 
        sender: m.sender, 
        text: m.text, 
        timestamp: new Date(m.created).getTime(),
        type: m.type as MessageType, 
        channel: m.channel 
      }));
    } catch (e) { return []; }
  },

  async saveMessage(message: Omit<Message, 'id' | 'timestamp'>) {
    try {
      await pb.collection('messages').create({ 
        sender: message.sender, 
        text: message.text, 
        type: message.type, 
        channel: message.channel 
      });
    } catch (e) { handleFetchError(e, 'saveMessage'); }
  }
};
