
import { createClient } from '@supabase/supabase-js';
import { Message, Channel, MessageType, UserRegistration } from '../types';
import { CHAT_MODULE_CONFIG } from '../config';

export const isConfigured = () => 
  CHAT_MODULE_CONFIG.SUPABASE_URL && 
  CHAT_MODULE_CONFIG.SUPABASE_URL.startsWith('https://') && 
  CHAT_MODULE_CONFIG.SUPABASE_KEY &&
  CHAT_MODULE_CONFIG.SUPABASE_KEY.length > 20;

const supabaseUrl = CHAT_MODULE_CONFIG.SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = CHAT_MODULE_CONFIG.SUPABASE_KEY || 'placeholder';

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: true, autoRefreshToken: true },
  global: { headers: { 'x-application-name': 'workigom-chat' } },
});

const handleFetchError = (err: any, context: string) => {
  if (typeof window !== 'undefined' && !navigator.onLine) throw new Error("İnternet bağlantınız yok.");
  const msg = err.message || String(err);
  console.error(`Supabase Error [${context}]:`, msg);
  throw err;
};

async function retryRequest<T = any>(fn: () => PromiseLike<T> | T | any, retries = 3, delay = 1000): Promise<T> {
  try {
    return await fn();
  } catch (err: any) {
    if (retries > 0 && (err.message?.includes('Failed to fetch') || err.name === 'TypeError')) {
      await new Promise(res => setTimeout(res, delay));
      return retryRequest(fn, retries - 1, delay * 2);
    }
    throw err;
  }
}

export const storageService = {
  isConfigured,

  async getBotConfig(): Promise<string> {
    try {
      const response: any = await supabase
        .from('system_config')
        .select('value')
        .eq('key', 'bot_personality')
        .maybeSingle();
      
      const { data, error } = response;
      if (error) return "Sen mIRC botu Lara'sın. Samimi ve naziksin.";
      return data?.value || "Sen mIRC botu Lara'sın. Samimi ve naziksin.";
    } catch (e) {
      return "Sen mIRC botu Lara'sın. Samimi ve naziksin.";
    }
  },

  async updateBotConfig(personality: string) {
    try {
      const response: any = await supabase
        .from('system_config')
        .upsert({ key: 'bot_personality', value: personality }, { onConflict: 'key' });
      const { error } = response;
      if (error) throw error;
    } catch (e) {
      handleFetchError(e, 'updateBotConfig');
    }
  },

  async registerUser(regData: UserRegistration) {
    try {
      const response: any = await retryRequest(() => supabase.from('registrations').insert({
        nickname: regData.nickname,
        full_name: regData.fullName,
        email: regData.email,
        password: regData.password,
        criminal_record_file: regData.criminal_record_file,
        insurance_file: regData.insurance_file,
        status: 'pending'
      }));
      const { error } = response;
      if (error) {
        if (error.code === '23505') throw new Error('Bu email veya nickname zaten kullanımda.');
        throw error;
      }
    } catch (e) { handleFetchError(e, 'registerUser'); }
  },

  async loginUser(email: string, pass: string): Promise<UserRegistration | null> {
    try {
      const response: any = await retryRequest(() => supabase
        .from('registrations')
        .select('*')
        .eq('email', email)
        .eq('password', pass)
        .maybeSingle());
      const { data, error } = response;
      if (error) throw error;
      if (!data) return null;
      if (data.status === 'rejected') throw new Error('Başvurunuz reddedildi. Lütfen yönetici ile iletişime geçin.');
      if (data.status === 'pending') throw new Error('Hesabınız henüz onaylanmadı. Lütfen bekleyiniz.');
      return { ...data, fullName: data.full_name } as UserRegistration;
    } catch (e) { 
      if (e.message && e.message.includes('onaylanmadı')) throw e;
      if (e.message && e.message.includes('reddedildi')) throw e;
      handleFetchError(e, 'loginUser'); 
      return null; 
    }
  },

  async adminLogin(user: string, pass: string): Promise<boolean> {
    try {
      const response: any = await retryRequest(() => supabase
        .from('system_config')
        .select('key, value')
        .in('key', ['admin_username', 'admin_password']));
      const { data, error } = response;
      if (error || !data) return false;
      const dbAdmin = data.find((d: any) => d.key === 'admin_username')?.value;
      const dbPass = data.find((d: any) => d.key === 'admin_password')?.value;
      return user === dbAdmin && pass === dbPass;
    } catch (e) { handleFetchError(e, 'adminLogin'); return false; }
  },

  async getAllRegistrations(): Promise<UserRegistration[]> {
    if (!isConfigured()) return [];
    try {
      const response: any = await retryRequest(() => supabase
        .from('registrations')
        .select('*')
        .order('created_at', { ascending: false }));
      const { data, error } = response;
      if (error) return [];
      return (data || []).map((d: any) => ({ ...d, fullName: d.full_name })) as UserRegistration[];
    } catch (err) { return []; }
  },

  async updateRegistrationStatus(id: string, status: 'approved' | 'rejected') {
    try {
      const response: any = await supabase.from('registrations').update({ status }).eq('id', id);
      const { error } = response;
      if (error) throw error;
    } catch (e) { handleFetchError(e, 'updateStatus'); }
  },

  async deleteMessagesByChannel(channelName: string) {
    if (channelName.startsWith('#')) return;
    try { await supabase.from('messages').delete().eq('channel', channelName); } catch (e) {}
  },

  async deleteAllPrivateMessagesForUser(nick: string) {
    try {
      await supabase.from('messages').delete().or(`channel.ilike.private:%:${nick},channel.ilike.private:${nick}:%`);
    } catch (e) {}
  },

  async sendChatNotification(channel: string, text: string) {
    try {
      let targetChannels: string[] = [];
      if (channel === 'all') {
        const result: any = await supabase.from('channels').select('name');
        const { data: channels } = result;
        targetChannels = (channels || []).map((c: any) => c.name);
      } else { targetChannels = [channel]; }
      const insertData = targetChannels.map(c => ({ sender: 'SYSTEM', text, type: MessageType.SYSTEM, channel: c }));
      await supabase.from('messages').insert(insertData);
      await supabase.from('notifications_log').insert({ type: 'chat', target: channel, body: text, sender_admin: 'WorkigomAdmin' });
    } catch (e) { handleFetchError(e, 'sendChatNotification'); }
  },

  async sendEmailNotification(emails: string[], subject: string, body: string) {
    try {
      const logs = emails.map(email => ({ type: 'email', target: email, subject, body, sender_admin: 'WorkigomAdmin' }));
      await supabase.from('notifications_log').insert(logs);
    } catch (e) { handleFetchError(e, 'sendEmailNotification'); }
  },

  async getNotificationLogs() {
    try {
      const response: any = await retryRequest(() => supabase.from('notifications_log').select('*').order('created_at', { ascending: false }).limit(50));
      const { data, error } = response;
      return data || [];
    } catch (e) { return []; }
  },

  async getChannels(): Promise<Channel[]> {
    try {
      const response: any = await retryRequest(() => supabase.from('channels').select('*'));
      const { data, error } = response;
      return (data || []).map((c: any) => ({ ...c, unreadCount: 0, users: [], islocked: c.islocked ?? false, ops: c.ops ?? [], bannedusers: c.bannedusers ?? [] })) as Channel[];
    } catch (e) { return []; }
  },

  async getMessagesByChannel(channelName: string): Promise<Message[]> {
    try {
      const response: any = await retryRequest(() => supabase.from('messages').select('*').eq('channel', channelName).order('created_at', { ascending: true }).limit(100));
      const { data, error } = response;
      return (data || []).map((m: any) => ({ id: m.id.toString(), sender: m.sender, text: m.text, timestamp: new Date(m.created_at).getTime(), type: m.type as MessageType, channel: m.channel }));
    } catch (e) { return []; }
  },

  async saveMessage(message: Omit<Message, 'id' | 'timestamp'>) {
    try {
      const response: any = await supabase.from('messages').insert({ sender: message.sender, text: message.text, type: message.type, channel: message.channel });
      const { error } = response;
      if (error) throw error;
    } catch (e) { handleFetchError(e, 'saveMessage'); }
  }
};
