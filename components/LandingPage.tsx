
import React, { useState, useEffect } from 'react';
import { 
  Shield,
  LogIn,
  UserPlus,
  Loader2,
  Globe,
  Lock,
  MessageSquare,
  X,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  Terminal,
  FileText,
  Briefcase,
  Users
} from 'lucide-react';
import { storageService } from '../services/storageService';
import { CHAT_MODULE_CONFIG } from '../config';

interface LandingPageProps {
  onEnter: (userData: any) => void;
  onRegisterClick: () => void;
  onAdminClick?: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onEnter, onRegisterClick, onAdminClick }) => {
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  const initGoogleIdentity = () => {
    const google = (window as any).google;
    if (google?.accounts?.id) {
      try {
        google.accounts.id.initialize({
          client_id: CHAT_MODULE_CONFIG.GOOGLE_CLIENT_ID,
          callback: handleGoogleResponse,
          auto_select: false,
          cancel_on_tap_outside: true
        });

        const buttonContainer = document.getElementById('google-button-container');
        if (buttonContainer) {
          google.accounts.id.renderButton(buttonContainer, {
            theme: 'outline',
            size: 'large',
            width: '100%',
            text: 'signin_with',
            shape: 'rectangular'
          });
        }
        return true;
      } catch (e) {
        console.error("Google Identity Init Error:", e);
        return false;
      }
    }
    return false;
  };

  useEffect(() => {
    let timer: any;
    if (showLoginForm) {
      timer = setInterval(() => {
        if (initGoogleIdentity()) {
          clearInterval(timer);
        }
      }, 500);
    }
    return () => clearInterval(timer);
  }, [showLoginForm]);

  const handleGoogleResponse = async (response: any) => {
    setLoading(true);
    setError(null);
    setInfoMessage(null);
    try {
      const base64Url = response.credential.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));

      const googleUser = JSON.parse(jsonPayload);
      const email = googleUser.email;
      const fullName = googleUser.name;

      const user = await storageService.loginWithGoogle(email);
      
      if (user) {
        onEnter(user);
      } else {
        const derivedNickname = email.split('@')[0] + Math.floor(Math.random() * 100);
        await storageService.registerGoogleUser(email, fullName, derivedNickname);
        setInfoMessage('Google kaydınız oluşturuldu ve onay için admin paneline iletildi. Onay sonrası giriş yapabilirsiniz.');
      }
    } catch (err: any) {
      setError(err.message || 'Google ile giriş hatası.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setInfoMessage(null);
    try {
      const user = await storageService.loginUser(loginEmail, loginPass);
      if (user) {
        onEnter(user);
      } else {
        setError('Email veya şifre hatalı.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Giriş hatası. Sunucuya bağlanılamıyor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f14] text-white font-mono selection:bg-[#00ff99] selection:text-black overflow-x-hidden">
      
      {/* SECTION 1: HERO (PDF Page 1) */}
      <section className="min-h-screen flex flex-col">
        <header className="p-4 flex justify-between items-center text-[10px] opacity-40 font-bold uppercase tracking-widest border-b border-white/5">
          <span>{new Date().toLocaleDateString('tr-TR')}</span>
          <span className="hidden md:block">Workigom Chat | Güvenli Sohbet Platformu</span>
          <button onClick={onAdminClick} className="hover:text-[#00ff99] transition-colors">Yönetici Paneli</button>
        </header>

        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-12">
          {/* Status Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-2 border border-[#00ff99]/40 rounded-sm bg-[#00ff99]/5">
              <div className="w-2 h-2 rounded-full bg-[#00ff99] animate-pulse shadow-[0_0_8px_#00ff99]"></div>
              <span className="text-[10px] font-black text-[#00ff99] tracking-[0.15em] uppercase">
                  SİSTEM DURUMU: GÜVENLİ ERİŞİM AKTİF
              </span>
          </div>

          {/* Headline */}
          <div className="space-y-0">
              <h1 className="text-5xl md:text-8xl font-black italic tracking-tighter text-white uppercase leading-[0.9]">
                  GERÇEK İNSANLARLA,
              </h1>
              <h2 className="text-5xl md:text-8xl font-black italic tracking-tighter text-[#00ff99] uppercase leading-[0.9] drop-shadow-[0_0_20px_rgba(0,255,153,0.4)]">
                  GÜVENLİ SOHBET
              </h2>
          </div>

          {/* Description */}
          <div className="max-w-3xl flex gap-6 items-start text-left">
              <div className="w-1 h-20 bg-[#00ff99] shrink-0 shadow-[0_0_10px_rgba(0,255,153,0.3)]"></div>
              <p className="text-gray-400 text-lg md:text-xl font-medium leading-relaxed italic">
                  Sabıka kaydı temiz, çalışan ve kimliği doğrulanmış kişilerle <br/>
                  huzurlu, seviyeli ve <span className="text-white font-bold">gerçek sohbet ortamı.</span>
              </p>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 w-full max-w-xl">
              <button 
                  onClick={() => setShowLoginForm(true)}
                  className="flex-1 bg-[#00ff99] text-black h-16 flex items-center justify-center gap-3 font-black text-sm uppercase tracking-widest hover:bg-white transition-all shadow-[0_0_30px_rgba(0,255,153,0.2)]"
              >
                  <LogIn size={20} />
                  <span>GİRİŞ YAP</span>
              </button>
              <button 
                  onClick={onRegisterClick}
                  className="flex-1 border border-[#00ff99] text-[#00ff99] h-16 flex items-center justify-center gap-3 font-black text-sm uppercase tracking-widest hover:bg-[#00ff99]/10 transition-all"
              >
                  <UserPlus size={20} />
                  <span>BAŞVUR VE KATIL</span>
              </button>
          </div>
        </div>
      </section>

      {/* SECTION 2: SECURITY PRIORITY (PDF Page 2) */}
      <section className="min-h-[60vh] flex flex-col items-center justify-center bg-black/10">
        <div className="flex flex-col items-center space-y-4">
            <div className="flex items-center gap-4">
                <ShieldCheck size={48} className="text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
                <h2 className="text-4xl md:text-6xl font-black italic text-white uppercase tracking-tighter">
                    GÜVENLİK BİZİM ÖNCELİĞİMİZ
                </h2>
            </div>
            <div className="w-40 h-1.5 bg-[#00ff99] shadow-[0_0_10px_rgba(0,255,153,0.3)]"></div>
        </div>
      </section>

      {/* SECTION 3: FEATURES GRID (PDF Page 3) */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            
            {/* Feature 1 */}
            <div className="bg-[#11161d] border border-white/5 p-8 space-y-8 relative overflow-hidden group">
                <div className="w-16 h-16 bg-[#00ff99]/10 rounded-sm flex items-center justify-center text-[#00ff99]">
                    <Shield size={32} />
                </div>
                <h3 className="text-2xl font-black italic uppercase tracking-tighter">GERÇEK KİŞİLER</h3>
                <ul className="space-y-4">
                    <li className="flex items-center gap-3 text-xs font-bold text-gray-400 uppercase tracking-widest">
                        <CheckCircle2 size={16} className="text-[#00ff99]" /> Kimlik doğrulama zorunlu
                    </li>
                    <li className="flex items-center gap-3 text-xs font-bold text-gray-400 uppercase tracking-widest">
                        <CheckCircle2 size={16} className="text-[#00ff99]" /> Sahte hesaplara geçit yok
                    </li>
                    <li className="flex items-center gap-3 text-xs font-bold text-gray-400 uppercase tracking-widest">
                        <CheckCircle2 size={16} className="text-[#00ff99]" /> Aktif moderasyon ve denetim
                    </li>
                </ul>
                <Users className="absolute -bottom-4 -right-4 text-white/5" size={120} />
            </div>

            {/* Feature 2 */}
            <div className="bg-[#11161d] border border-white/5 p-8 space-y-8 relative overflow-hidden group">
                <div className="w-16 h-16 bg-[#00ff99]/10 rounded-sm flex items-center justify-center text-[#00ff99]">
                    <FileText size={32} />
                </div>
                <h3 className="text-2xl font-black italic uppercase tracking-tighter">SABIKA KAYDI KONTROLÜ</h3>
                <ul className="space-y-4">
                    <li className="flex items-center gap-3 text-xs font-bold text-gray-400 uppercase tracking-widest">
                        <CheckCircle2 size={16} className="text-[#00ff99]" /> Temiz sicil olmayan kabul edilmez
                    </li>
                    <li className="flex items-center gap-3 text-xs font-bold text-gray-400 uppercase tracking-widest">
                        <CheckCircle2 size={16} className="text-[#00ff99]" /> Topluluk güvenliği esastır
                    </li>
                    <li className="flex items-center gap-3 text-xs font-bold text-gray-400 uppercase tracking-widest">
                        <CheckCircle2 size={16} className="text-[#00ff99]" /> Düzenli periyodik denetimler
                    </li>
                </ul>
                <Lock className="absolute -bottom-4 -right-4 text-white/5" size={120} />
            </div>

            {/* Feature 3 */}
            <div className="bg-[#11161d] border border-white/5 p-8 space-y-8 relative overflow-hidden group">
                <div className="w-16 h-16 bg-[#00ff99]/10 rounded-sm flex items-center justify-center text-[#00ff99]">
                    <Briefcase size={32} />
                </div>
                <h3 className="text-2xl font-black italic uppercase tracking-tighter">ÇALIŞAN OLMA ZORUNLULUĞU</h3>
                <ul className="space-y-4">
                    <li className="flex items-center gap-3 text-xs font-bold text-gray-400 uppercase tracking-widest">
                        <CheckCircle2 size={16} className="text-[#00ff99]" /> Aktif çalışan bireyler
                    </li>
                    <li className="flex items-center gap-3 text-xs font-bold text-gray-400 uppercase tracking-widest">
                        <CheckCircle2 size={16} className="text-[#00ff99]" /> Daha saygılı ve bilinçli topluluk
                    </li>
                    <li className="flex items-center gap-3 text-xs font-bold text-gray-400 uppercase tracking-widest">
                        <CheckCircle2 size={16} className="text-[#00ff99]" /> Profesyonel sosyal ağ
                    </li>
                </ul>
                <Briefcase className="absolute -bottom-4 -right-4 text-white/5" size={120} />
            </div>

        </div>
      </section>

      {/* SECTION 4: WHY? + TERMINAL (PDF Page 4) */}
      <section className="py-24 px-6 bg-[#0e1218]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            
            <div className="space-y-8">
                <h2 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-white">
                    NEDEN BURADAYIZ?
                </h2>
                <p className="text-lg text-gray-400 leading-relaxed font-medium">
                    İnternette anonimlik çoğu zaman güvensizliği beraberinde getirir. <span className="text-[#00ff99] font-bold">Biz bu döngüyü kırmak için buradayız.</span>
                </p>
                <div className="bg-[#11161d] border-l-4 border-[#00ff99] p-8">
                    <p className="text-xl font-medium italic text-gray-300 leading-relaxed">
                        Amacımız; gerçek insanların, gerçek sohbetler yaptığı, seviyeli, güvenli ve saygılı bir ortam oluşturmak.
                    </p>
                </div>

                {/* Sohbet Kültürümüz */}
                <div className="space-y-4 pt-8">
                    <div className="flex items-center gap-3 text-[#00ff99]">
                        <MessageSquare size={20} />
                        <h4 className="text-sm font-black uppercase tracking-widest">SOHBET KÜLTÜRÜMÜZ</h4>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex items-center gap-3 text-[11px] font-bold text-gray-500 uppercase">
                            <ChevronRight size={14} className="text-[#00ff99]" /> “Naber millet?” samimiyeti
                        </div>
                        <div className="flex items-center gap-3 text-[11px] font-bold text-gray-500 uppercase">
                            <ChevronRight size={14} className="text-[#00ff99]" /> Hakaret, taciz, spam yok
                        </div>
                        <div className="flex items-center gap-3 text-[11px] font-bold text-gray-500 uppercase">
                            <ChevronRight size={14} className="text-[#00ff99]" /> Geyik serbest, saygı şart
                        </div>
                        <div className="flex items-center gap-3 text-[11px] font-bold text-gray-500 uppercase">
                            <ChevronRight size={14} className="text-[#00ff99]" /> Moderasyon her an aktif
                        </div>
                    </div>
                </div>
            </div>

            {/* Terminal Widget */}
            <div className="bg-[#05070a] border border-blue-500/30 rounded-lg overflow-hidden shadow-[0_0_40px_rgba(0,120,255,0.1)]">
                <div className="bg-[#11161d] p-3 flex items-center justify-between border-b border-white/5">
                    <div className="flex items-center gap-2">
                        <Terminal size={14} className="text-blue-400" />
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">Status: connected to Workigom (irc.workigomchat.online)</span>
                    </div>
                    <div className="flex gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-gray-700"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-gray-700"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-red-800"></div>
                    </div>
                </div>
                <div className="p-6 space-y-3 font-mono text-[11px] text-blue-400/80">
                    <p className="text-gray-500">*** Local host: workigomchat.online (127.0.0.1)</p>
                    <p className="text-gray-500">*** Checking identity protocol...</p>
                    <div className="flex items-center gap-2 text-green-500 font-bold">
                        <CheckCircle2 size={12} /> Identity verified: [Kimlik Onaylandı]
                    </div>
                    <div className="flex items-center gap-2 text-green-500 font-bold">
                        <CheckCircle2 size={12} /> Criminal record: [Sicil Temiz]
                    </div>
                    <div className="flex items-center gap-2 text-green-500 font-bold">
                        <CheckCircle2 size={12} /> Professional status: [Aktif Çalışan]
                    </div>
                    <p className="pt-4 text-gray-500 italic">Kanal girişi bekleniyor...</p>
                    <div className="p-2 border border-blue-500/20 bg-blue-500/5 text-blue-400">
                        <span className="font-bold text-white">[ Sistem ]:</span> Sohbete katılmaya yetkiniz var. İyi sohbetler 😊
                    </div>
                    <div className="animate-pulse">_</div>
                </div>
            </div>

        </div>
      </section>

      {/* SECTION 5: PRIVILEGE (PDF Page 5) */}
      <section className="py-32 px-6 text-center space-y-12 relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.02] pointer-events-none">
            <span className="text-[30vw] font-black italic select-none">WORKIGOM</span>
        </div>

        <div className="relative z-10 space-y-4">
            <h2 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter text-white">
                GÜVENLİ SOHBET BİR
            </h2>
            <h2 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter text-[#00ff99] drop-shadow-[0_0_15px_rgba(0,255,153,0.3)]">
                AYRICALIKTIR
            </h2>
            <p className="text-sm font-bold text-gray-500 tracking-[0.5em] uppercase">W O R K I G O M C H A T . O N L I N E</p>
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row gap-6 justify-center max-w-xl mx-auto pt-8">
            <button 
                onClick={onRegisterClick}
                className="flex-1 bg-[#00ff99] text-black h-14 flex items-center justify-center gap-3 font-black text-xs uppercase tracking-widest hover:bg-white transition-all"
            >
                <LogIn size={18} /> BAŞVUR VE KATIL
            </button>
            <button className="flex-1 border border-white/20 text-gray-400 h-14 flex items-center justify-center gap-3 font-black text-xs uppercase tracking-widest hover:bg-white/5 transition-all">
                <FileText size={18} /> KURALLAR & GİZLİLİK
            </button>
        </div>
      </section>

      {/* SECTION 6: FOOTER (PDF Page 6) */}
      <footer className="p-12 border-t border-white/5 bg-black/40 flex flex-col md:flex-row justify-between items-center gap-8 text-[10px] font-black uppercase tracking-[0.2em] text-gray-600">
        <div>W O R K I G O M N E T W O R K S Y S T E M © 2 0 2 4</div>
        <div className="flex flex-wrap justify-center gap-8">
            <button onClick={onAdminClick} className="hover:text-[#00ff99] transition-colors flex items-center gap-2">YÖNETİCİ GİRİŞİ</button>
            <button className="hover:text-white transition-colors">DESTEK</button>
            <button className="hover:text-white transition-colors">KVKK</button>
        </div>
      </footer>

      {/* Login Modal */}
      {showLoginForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4 backdrop-blur-sm">
          <div className="bg-[#11161d] border border-[#00ff99]/30 w-full max-w-sm overflow-hidden flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.5)]">
            <div className="bg-black/50 text-white px-6 py-4 flex justify-between items-center border-b border-white/5">
              <span className="font-black text-xs flex items-center gap-2 uppercase tracking-widest">
                <Shield size={16} className="text-[#00ff99]" /> SİSTEM GİRİŞİ
              </span>
              <button onClick={() => setShowLoginForm(false)} className="hover:text-red-500 transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleLogin} className="p-8 space-y-6">
              {error && (
                <div className="bg-red-900/20 border border-red-500/50 p-3 text-red-400 text-[10px] font-black uppercase text-center">
                  HATA: {error}
                </div>
              )}
              {infoMessage && (
                <div className="bg-blue-900/20 border border-blue-500/50 p-3 text-blue-400 text-[10px] font-black uppercase text-center">
                  BİLGİ: {infoMessage}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1">E-POSTA ADRESİ</label>
                <input 
                  type="email" 
                  required
                  value={loginEmail}
                  onChange={e => setLoginEmail(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 p-4 text-xs text-white outline-none focus:border-[#00ff99] transition-all"
                  placeholder="isim@sirket.com"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1">ERİŞİM ŞİFRESİ</label>
                <input 
                  type="password" 
                  required
                  value={loginPass}
                  onChange={e => setLoginPass(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 p-4 text-xs text-white outline-none focus:border-[#00ff99] transition-all"
                  placeholder="********"
                />
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-[#00ff99] text-black py-4 font-black text-xs uppercase hover:bg-white transition-all disabled:opacity-50 tracking-widest"
              >
                {loading ? <Loader2 size={20} className="animate-spin mx-auto" /> : 'SİSTEME BAĞLAN'}
              </button>

              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
                <div className="relative flex justify-center text-[8px] font-black"><span className="bg-[#11161d] px-3 text-gray-600 uppercase tracking-tighter">Veya Sosyal Kimlik</span></div>
              </div>

              <div id="google-button-container" className="flex justify-center grayscale hover:grayscale-0 transition-all"></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;
