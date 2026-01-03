
import PocketBase from 'pocketbase';
import { createClient } from '@supabase/supabase-js';
import { Message, Channel, MessageType, UserRegistration } from '../types';
import { CHAT_MODULE_CONFIG } from '../config';

// --- 1. POCKETBASE (Chat & Realtime) ---
const pbUrl = CHAT_MODULE_CONFIG.POCKETBASE_URL || 'http://127.0.0.1:8090';
export const pb = new PocketBase(pbUrl);
pb.autoCancellation(false);

// --- 2. SUPABASE (Auth & User Management) ---
const sbUrl = CHAT_MODULE_CONFIG.SUPABASE_URL || '';
const sbKey = CHAT_MODULE_CONFIG.SUPABASE_ANON_KEY || '';
// Eğer config boşsa hata vermemesi için dummy client, ama fonksiyonlarda kontrol edeceğiz
export const supabase = (sbUrl && sbKey) 
  ? createClient(sbUrl, sbKey) 
  : null;

export const isConfigured = () => {
  return (
    CHAT_MODULE_CONFIG.POCKETBASE_URL && 
    CHAT_MODULE_CONFIG.POCKETBASE_URL.startsWith('http') &&
    CHAT_MODULE_CONFIG.SUPABASE_URL && 
    CHAT_MODULE_CONFIG.SUPABASE_URL.startsWith('http')
  );
};

const handleFetchError = (err: any, context: string) => {
  console.error(`Error in ${context}:`, err);
  if (typeof window !== 'undefined' && !navigator.onLine) throw new Error("İnternet bağlantınız yok.");
  
  const msg = err.message || err.error_description || String(err);
  throw new Error(msg); 
};

export const storageService = {
  isConfigured,

  // ==========================================
  // POCKETBASE BÖLÜMÜ (MESAJLAŞMA)
  // ==========================================

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
      console.error("PB Realtime Error:", err);
      return () => {}; 
    }
  },

  async unsubscribeFromMessages() {
    try {
      return await pb.collection('messages').unsubscribe();
    } catch (err) { }
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
    } catch (e) { handleFetchError(e, 'saveMessage (PocketBase)'); }
  },

  async sendChatNotification(channel: string, text: string) {
    try {
      let targetChannels: string[] = [];
      if (channel === 'all') {
        try {
            const records = await pb.collection('channels').getFullList();
            targetChannels = records.map((c: any) => c.name);
        } catch(e) { targetChannels = []; }
        
        if(targetChannels.length === 0) targetChannels = ['#Sohbet']; 
      } else { targetChannels = [channel]; }
      
      for (const c of targetChannels) {
          await pb.collection('messages').create({
              sender: 'SYSTEM',
              text,
              type: MessageType.SYSTEM,
              channel: c
          });
      }
      
      // Logu da PocketBase'de tutalım (Chat logları ile beraber)
      try {
        await pb.collection('notifications_log').create({ 
            type: 'chat', 
            target: channel, 
            body: text, 
            sender_admin: 'WorkigomAdmin' 
        });
      } catch(e) { console.warn("Log PB'ye yazılamadı:", e); }
      
    } catch (e) { handleFetchError(e, 'sendChatNotification'); }
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

  // ==========================================
  // SUPABASE BÖLÜMÜ (KULLANICI & AUTH)
  // ==========================================

  async registerUser(regData: UserRegistration) {
    if (!supabase) throw new Error("Supabase bağlantısı yapılandırılmamış.");

    try {
      // 1. Unique Kontrolü
      const { data: existing, error: checkError } = await supabase
        .from('registrations')
        .select('email, nickname')
        .or(`email.eq.${regData.email},nickname.eq.${regData.nickname}`);

      if (checkError) throw checkError;

      if (existing && existing.length > 0) {
        const found = existing[0];
        if (found.email === regData.email) throw new Error('Bu email adresi zaten sistemde kayıtlı.');
        if (found.nickname === regData.nickname) throw new Error('Bu nickname başkası tarafından alınmış.');
      }

      // 2. Kayıt Ekleme
      const { error: insertError } = await supabase
        .from('registrations')
        .insert([{
          nickname: regData.nickname,
          full_name: regData.fullName,
          email: regData.email,
          password: regData.password, // Not: Prodüksiyonda hashlenmeli veya Supabase Auth kullanılmalı.
          criminal_record_file: regData.criminal_record_file,
          insurance_file: regData.insurance_file,
          status: 'pending'
        }]);

      if (insertError) throw insertError;

    } catch (e) { handleFetchError(e, 'registerUser (Supabase)'); }
  },

  async registerGoogleUser(email: string, fullName: string, nickname: string) {
    if (!supabase) return;
    try {
      const { data } = await supabase.from('registrations').select('id').eq('email', email).single();
      if (data) return; // Zaten var

      await supabase.from('registrations').insert([{
        nickname: nickname,
        full_name: fullName,
        email: email,
        password: 'google_oauth_no_password',
        status: 'pending'
      }]);
    } catch (e) { handleFetchError(e, 'registerGoogleUser'); }
  },

  async loginUser(email: string, pass: string): Promise<UserRegistration | null> {
    if (!supabase) throw new Error("Supabase ayarları eksik.");
    
    try {
      // Supabase'den kullanıcıyı sorgula
      const { data, error } = await supabase
        .from('registrations')
        .select('*')
        .eq('email', email)
        .eq('password', pass)
        .maybeSingle(); // single() yerine maybeSingle() çoklu kayıt hatasını önler

      if (error) throw error;
      if (!data) return null; // Kullanıcı bulunamadı

      // Statü kontrolleri
      if (data.status === 'rejected') throw new Error('Başvurunuz reddedildi. Lütfen yönetici ile iletişime geçin.');
      if (data.status === 'pending') throw new Error('Hesabınız henüz onaylanmadı. Lütfen bekleyiniz.');

      return { 
        id: data.id,
        nickname: data.nickname,
        fullName: data.full_name,
        email: data.email,
        status: data.status,
        created_at: data.created_at,
        criminal_record_file: data.criminal_record_file,
        insurance_file: data.insurance_file
      } as UserRegistration;

    } catch (e: any) { 
      if (e.message && (e.message.includes('onaylanmadı') || e.message.includes('bekleyiniz') || e.message.includes('reddedildi'))) throw e;
      console.error("Supabase Login Error:", e);
      throw new Error("Giriş sırasında hata: " + e.message); 
    }
  },

  async loginWithGoogle(email: string): Promise<UserRegistration | null> {
    if (!supabase) return null;
    try {
      const { data, error } = await supabase
        .from('registrations')
        .select('*')
        .eq('email', email)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;

      if (data.status === 'rejected') throw new Error('Bu Google hesabına bağlı başvuru reddedildi.');
      if (data.status === 'pending') throw new Error('Google hesabınızla ilişkili başvuru henüz onaylanmadı.');
      
      return { 
          id: data.id,
          nickname: data.nickname,
          fullName: data.full_name,
          email: data.email,
          status: data.status,
          created_at: data.created_at 
      } as UserRegistration;

    } catch (e: any) { 
      if (e.message && (e.message.includes('onaylanmadı') || e.message.includes('reddedildi'))) throw e;
      return null; 
    }
  },

  async adminLogin(user: string, pass: string): Promise<boolean> {
    if (!supabase) return user === 'admin' && pass === 'password123';
    try {
      // Admin şifresini de Supabase system_config tablosundan çekelim
      const { data, error } = await supabase
        .from('system_config')
        .select('*')
        .in('key', ['admin_username', 'admin_password']);
      
      if (error || !data) return user === 'admin' && pass === 'password123';

      const dbAdmin = data.find(r => r.key === 'admin_username')?.value;
      const dbPass = data.find(r => r.key === 'admin_password')?.value;
      
      if (!dbAdmin || !dbPass) return user === 'admin' && pass === 'password123';
      
      return user === dbAdmin && pass === dbPass;
    } catch (e) { 
      return user === 'admin' && pass === 'password123'; 
    }
  },

  async getAllRegistrations(): Promise<UserRegistration[]> {
    if (!supabase) return [];
    try {
      const { data, error } = await supabase
        .from('registrations')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;

      return data.map((d: any) => ({ 
          ...d, 
          fullName: d.full_name, // Mapping snake_case -> camelCase
          created_at: d.created_at
      })) as UserRegistration[];
    } catch (err: any) { 
      console.warn("Supabase getAllRegistrations error:", err.message);
      return []; 
    }
  },

  async updateRegistrationStatus(id: string, status: 'approved' | 'rejected') {
    if (!supabase) return;
    try {
      const { error } = await supabase
        .from('registrations')
        .update({ status })
        .eq('id', id);
      
      if (error) throw error;
    } catch (e) { handleFetchError(e, 'updateStatus (Supabase)'); }
  },

  // --- BOT CONFIG ---
  // Bot config'i de Supabase'e taşıyabiliriz veya PB'de kalabilir. 
  // Yönetim kolaylığı için Supabase'de tutalım.
  async getBotConfig(): Promise<string> {
    if (!supabase) return "Sen mIRC botu Lara'sın.";
    try {
      const { data, error } = await supabase
        .from('system_config')
        .select('value')
        .eq('key', 'bot_personality')
        .single();
        
      if (error || !data) return "Sen mIRC botu Lara'sın.";
      return data.value;
    } catch (e) { return "Sen mIRC botu Lara'sın."; }
  },

  async updateBotConfig(personality: string) {
    if (!supabase) return;
    try {
      // Upsert (Varsa güncelle, yoksa ekle)
      const { error } = await supabase
        .from('system_config')
        .upsert({ key: 'bot_personality', value: personality }, { onConflict: 'key' });

      if (error) throw error;
    } catch (e) { handleFetchError(e, 'updateBotConfig (Supabase)'); }
  }
};
