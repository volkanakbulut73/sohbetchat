import React, { useState, useEffect } from 'react';
import { 
  Users, 
  CheckCircle, 
  XCircle, 
  ShieldCheck, 
  Clock, 
  FileText, 
  LogOut,
  RefreshCw,
  Search,
  Loader2,
  Megaphone,
  Mail,
  Send,
  MessageSquare,
  History,
  AlertTriangle,
  Bot,
  Github,
  ExternalLink,
  Settings,
  Lock,
  Eye,
  X,
  // Add Briefcase to imported icons from lucide-react
  Briefcase
} from 'lucide-react';
import { storageService } from '../services/storageService';
import { UserRegistration, Channel } from '../types';

interface AdminDashboardProps {
  onLogout: () => void;
}

type AdminTab = 'registrations' | 'notifications' | 'bot';

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [registrations, setRegistrations] = useState<UserRegistration[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<AdminTab>('registrations');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null);

  // Bot Training States
  const [botPersonality, setBotPersonality] = useState('');
  const [botSaving, setBotSaving] = useState(false);

  // Notification states
  const [chatNotif, setChatNotif] = useState({ channel: 'all', message: '' });
  const [notifSending, setNotifSending] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [regs, chns, history, botCfg] = await Promise.all([
        storageService.getAllRegistrations(),
        storageService.getChannels(),
        storageService.getNotificationLogs(),
        storageService.getBotConfig()
      ]);
      setRegistrations(regs);
      setChannels(chns);
      setLogs(history);
      setBotPersonality(botCfg);
    } catch (err: any) {
      setError(err.message || "Veriler yüklenirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleBotUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setBotSaving(true);
    try {
      await storageService.updateBotConfig(botPersonality);
      alert("Lara başarıyla eğitildi! Artık yeni talimatlarına göre davranacak.");
    } catch (err: any) {
      alert("Hata: " + err.message);
    } finally {
      setBotSaving(false);
    }
  };

  const handleStatusUpdate = async (id: string, status: 'approved' | 'rejected') => {
    if (!id) return;
    setProcessingId(id);
    try {
      await storageService.updateRegistrationStatus(id, status);
      await loadData();
    } catch (err: any) { alert(err.message); }
    finally { setProcessingId(null); }
  };

  const handleChatNotify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatNotif.message.trim()) return;
    setNotifSending(true);
    try {
      await storageService.sendChatNotification(chatNotif.channel, chatNotif.message);
      setChatNotif({ ...chatNotif, message: '' });
      await loadData();
    } catch (err: any) { alert(err.message); }
    finally { setNotifSending(false); }
  };

  const filtered = registrations.filter(r => {
    const matchesFilter = filter === 'all' || r.status === filter;
    const matchesSearch = r.nickname.toLowerCase().includes(searchTerm.toLowerCase()) || r.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#0b0f14] text-gray-300 font-mono flex flex-col">
      <header className="h-16 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-3">
          <div className="bg-[#00ff99] p-2 rounded-sm text-black shadow-[0_0_10px_rgba(0,255,153,0.3)]"><ShieldCheck size={20} /></div>
          <div>
            <h1 className="text-sm font-black text-white uppercase tracking-tighter italic">Workigom Admin Control</h1>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Secure Network Management</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={loadData}
            className="p-2 hover:bg-gray-800 text-gray-400 hover:text-[#00ff99] transition-all rounded-sm"
            title="Yenile"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
          <a 
            href="https://github.com/volkanakbulut73/sohbetchat" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-[10px] font-black uppercase text-white border border-gray-700 transition-all"
          >
            <Github size={14} /> Repository <ExternalLink size={10} />
          </a>
          <button 
            onClick={onLogout}
            className="flex items-center gap-2 px-4 py-1.5 bg-red-900/20 hover:bg-red-900/40 text-red-500 text-[10px] font-black uppercase border border-red-900/30 transition-all"
          >
            <LogOut size={14} /> Güvenli Çıkış
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Nav */}
        <nav className="w-64 border-r border-gray-800 p-4 space-y-2 shrink-0 bg-[#0e1218]">
          <button 
            onClick={() => setActiveTab('registrations')}
            className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-black uppercase transition-all border-l-2 ${activeTab === 'registrations' ? 'bg-[#00ff99]/10 text-[#00ff99] border-[#00ff99]' : 'text-gray-500 border-transparent hover:text-gray-300'}`}
          >
            <Users size={16} /> Kayıt Başvuruları
            {registrations.filter(r => r.status === 'pending').length > 0 && (
              <span className="ml-auto bg-[#00ff99] text-black px-1.5 py-0.5 rounded-full text-[9px] font-black animate-pulse">
                {registrations.filter(r => r.status === 'pending').length}
              </span>
            )}
          </button>
          <button 
            onClick={() => setActiveTab('notifications')}
            className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-black uppercase transition-all border-l-2 ${activeTab === 'notifications' ? 'bg-[#00ff99]/10 text-[#00ff99] border-[#00ff99]' : 'text-gray-500 border-transparent hover:text-gray-300'}`}
          >
            <Megaphone size={16} /> Duyuru & Bildirim
          </button>
          <button 
            onClick={() => setActiveTab('bot')}
            className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-black uppercase transition-all border-l-2 ${activeTab === 'bot' ? 'bg-[#00ff99]/10 text-[#00ff99] border-[#00ff99]' : 'text-gray-500 border-transparent hover:text-gray-300'}`}
          >
            <Bot size={16} /> Bot Eğitimi (Lara)
          </button>
        </nav>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-8 relative">
          {activeTab === 'registrations' && (
            <div className="space-y-6 max-w-6xl mx-auto">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gray-900/50 p-4 border border-gray-800">
                <div className="flex gap-2">
                  {(['all', 'pending', 'approved', 'rejected'] as const).map(f => (
                    <button 
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`px-3 py-1 text-[10px] font-black uppercase border transition-all ${filter === f ? 'bg-[#00ff99] text-black border-[#00ff99]' : 'border-gray-700 text-gray-500 hover:border-gray-500'}`}
                    >
                      {f === 'all' ? 'Tümü' : f === 'pending' ? 'Bekleyen' : f === 'approved' ? 'Onaylı' : 'Reddedilen'}
                    </button>
                  ))}
                </div>
                <div className="relative w-full md:w-64">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" />
                  <input 
                    type="text" 
                    placeholder="NİCK VEYA EMAİL ARA..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full bg-gray-900 border border-gray-800 py-2 pl-10 pr-4 text-xs text-white outline-none focus:border-[#00ff99] transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {filtered.length === 0 ? (
                  <div className="p-12 text-center text-gray-600 border-2 border-dashed border-gray-800">
                    <AlertTriangle size={32} className="mx-auto mb-4 opacity-20" />
                    <p className="font-bold text-xs uppercase tracking-widest italic">Herhangi bir başvuru bulunamadı.</p>
                  </div>
                ) : (
                  filtered.map(reg => (
                    <div key={reg.id} className="bg-gray-900 border border-gray-800 p-5 group hover:border-[#00ff99]/30 transition-all flex flex-col md:flex-row justify-between gap-6">
                      <div className="flex gap-5">
                        <div className={`w-12 h-12 rounded-sm flex items-center justify-center font-black text-xl italic shrink-0 ${reg.status === 'approved' ? 'bg-[#00ff99] text-black' : reg.status === 'rejected' ? 'bg-red-900 text-white' : 'bg-gray-700 text-gray-400'}`}>
                          {reg.nickname[0].toUpperCase()}
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-black text-white uppercase text-sm italic">{reg.nickname}</h4>
                            <span className={`text-[8px] px-1.5 py-0.5 font-black uppercase rounded-[2px] ${reg.status === 'approved' ? 'bg-green-900/40 text-green-400' : reg.status === 'rejected' ? 'bg-red-900/40 text-red-400' : 'bg-yellow-900/40 text-yellow-400'}`}>
                              {reg.status}
                            </span>
                          </div>
                          <p className="text-[10px] text-gray-400 font-bold uppercase">{reg.fullName} • {reg.email}</p>
                          <div className="flex gap-4 pt-2">
                            <button onClick={() => setSelectedDoc(reg.criminal_record_file || null)} className="flex items-center gap-1.5 text-[9px] font-black text-[#00ff99] hover:underline uppercase">
                              <FileText size={12} /> Sabıka Kaydı
                            </button>
                            <button onClick={() => setSelectedDoc(reg.insurance_file || null)} className="flex items-center gap-1.5 text-[9px] font-black text-[#00ff99] hover:underline uppercase">
                              {/* Fix: Use Briefcase icon correctly now that it's imported */}
                              <Briefcase size={12} /> SGK Belgesi
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {reg.status === 'pending' && (
                          <>
                            <button 
                              disabled={processingId === reg.id}
                              onClick={() => handleStatusUpdate(reg.id!, 'approved')}
                              className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 text-[10px] font-black uppercase transition-all flex items-center gap-2"
                            >
                              {processingId === reg.id ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle size={14} />} ONAYLA
                            </button>
                            <button 
                              disabled={processingId === reg.id}
                              onClick={() => handleStatusUpdate(reg.id!, 'rejected')}
                              className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 text-[10px] font-black uppercase transition-all flex items-center gap-2"
                            >
                              <XCircle size={14} /> REDDET
                            </button>
                          </>
                        )}
                        <span className="text-[9px] text-gray-600 font-bold ml-4">
                          <Clock size={10} className="inline mr-1" /> {new Date(reg.created_at || '').toLocaleDateString('tr-TR')}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="max-w-4xl mx-auto space-y-12">
              {/* Duyuru Gönderme */}
              <div className="bg-gray-900 border border-gray-800 p-8 space-y-6">
                <div className="flex items-center gap-3 border-b border-gray-800 pb-4">
                  <Megaphone className="text-[#00ff99]" size={24} />
                  <h3 className="text-lg font-black text-white uppercase italic tracking-tighter">Sistem Duyurusu Gönder</h3>
                </div>
                <form onSubmit={handleChatNotify} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Hedef Kanal</label>
                      <select 
                        className="w-full bg-gray-800 border border-gray-700 p-3 text-xs text-white outline-none focus:border-[#00ff99] appearance-none"
                        value={chatNotif.channel}
                        onChange={e => setChatNotif({...chatNotif, channel: e.target.value})}
                      >
                        <option value="all">TÜM KANALLAR</option>
                        {channels.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Mesaj İçeriği</label>
                    <textarea 
                      required
                      className="w-full bg-gray-800 border border-gray-700 p-4 text-xs text-white outline-none focus:border-[#00ff99] h-32 resize-none"
                      placeholder="Tüm kullanıcılara sistem mesajı gönderin..."
                      value={chatNotif.message}
                      onChange={e => setChatNotif({...chatNotif, message: e.target.value})}
                    />
                  </div>
                  <button 
                    disabled={notifSending}
                    className="bg-[#00ff99] text-black px-8 py-4 text-xs font-black uppercase hover:bg-white transition-all flex items-center gap-3 disabled:opacity-50"
                  >
                    {notifSending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />} DUYURUYU YAYINLA
                  </button>
                </form>
              </div>

              {/* Geçmiş Duyurular */}
              <div className="space-y-4">
                <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                  <History size={14} /> Duyuru Geçmişi
                </h4>
                <div className="bg-gray-900 border border-gray-800 divide-y divide-gray-800">
                  {logs.length === 0 ? (
                    <div className="p-8 text-center text-gray-700 italic text-[10px] uppercase font-bold">Henüz duyuru gönderilmedi.</div>
                  ) : (
                    logs.map(log => (
                      <div key={log.id} className="p-4 flex flex-col md:flex-row justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-sm uppercase ${log.type === 'chat' ? 'bg-blue-900 text-blue-300' : 'bg-purple-900 text-purple-300'}`}>
                              {log.type}
                            </span>
                            <span className="text-xs text-white font-bold">{log.body}</span>
                          </div>
                          <p className="text-[9px] text-gray-500 font-bold uppercase">Hedef: {log.target} • Gönderen: {log.sender_admin}</p>
                        </div>
                        <span className="text-[9px] text-gray-600 font-bold shrink-0">{new Date(log.created_at).toLocaleString('tr-TR')}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'bot' && (
            <div className="max-w-4xl mx-auto space-y-8">
              <div className="bg-gray-900 border border-gray-800 p-8 space-y-6">
                <div className="flex items-center gap-3 border-b border-gray-800 pb-4">
                  <Bot className="text-[#00ff99]" size={24} />
                  <h3 className="text-lg font-black text-white uppercase italic tracking-tighter">Bot Kişiliği ve Eğitimi</h3>
                </div>
                <div className="bg-yellow-900/10 border-l-4 border-yellow-600 p-4 text-[11px] text-yellow-500 font-bold leading-relaxed">
                  [ UYARI ]: Botun karakterini (Lara) buradan güncelleyebilirsiniz. Bu metin, botun tüm mesajlara cevap verirken uyacağı ana talimatlar setidir. 
                  "Sen mIRC botu Lara'sın..." ile başlamanız önerilir.
                </div>
                <form onSubmit={handleBotUpdate} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Sistem Talimatı (System Instruction)</label>
                    <textarea 
                      required
                      className="w-full bg-gray-800 border border-gray-700 p-5 text-xs text-white outline-none focus:border-[#00ff99] h-64 font-mono leading-relaxed"
                      placeholder="Örn: Sen mIRC botu Lara'sın. Samimi, neşeli ve mIRC jargonuna hakimsin..."
                      value={botPersonality}
                      onChange={e => setBotPersonality(e.target.value)}
                    />
                  </div>
                  <button 
                    disabled={botSaving}
                    className="bg-[#00ff99] text-black px-12 py-4 text-xs font-black uppercase hover:bg-white transition-all flex items-center gap-3 disabled:opacity-50"
                  >
                    {botSaving ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />} LARA'YI GÜNCELLE
                  </button>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Belge Görüntüleyici Modal */}
      {selectedDoc && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 p-10 backdrop-blur-sm">
          <div className="max-w-4xl w-full h-full flex flex-col bg-gray-900 border-2 border-gray-700 shadow-2xl overflow-hidden">
            <div className="bg-gray-800 px-4 py-2 flex justify-between items-center border-b border-gray-700">
              <span className="text-xs font-black text-white uppercase tracking-widest">Belge Önizleme</span>
              <button onClick={() => setSelectedDoc(null)} className="text-gray-400 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-auto bg-black p-4 flex items-center justify-center">
              {selectedDoc.startsWith('data:application/pdf') ? (
                <div className="text-center space-y-4">
                  <FileText size={64} className="text-[#00ff99] mx-auto opacity-50" />
                  <p className="text-white font-bold text-sm uppercase">Bu bir PDF belgesidir.</p>
                  <a href={selectedDoc} download="belge.pdf" className="inline-block bg-[#00ff99] text-black px-6 py-2 text-xs font-black uppercase">İNDİR VE GÖRÜNTÜLE</a>
                </div>
              ) : (
                <img src={selectedDoc} alt="Belge" className="max-w-full h-auto" />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;