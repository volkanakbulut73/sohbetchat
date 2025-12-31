
import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Briefcase, 
  MessageSquare, 
  Lock, 
  ChevronRight, 
  FileText, 
  CheckCircle2, 
  Shield,
  LogIn,
  UserPlus,
  Mail,
  Loader2,
  X,
  AlertCircle,
  Terminal,
  ShieldCheck,
  UserCheck,
  FileCheck,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { storageService } from '../services/storageService';

interface LandingPageProps {
  onEnter: (userData: any) => void;
  onRegisterClick: () => void;
  onAdminClick?: () => void;
}

const GOOGLE_CLIENT_ID = "444278057283-6dukljlihlpau48m625o2foulcnc04b3.apps.googleusercontent.com";

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
      google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
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
        setInfoMessage('Google kaydınız oluşturuldu ve onay için admin paneline iletildi. Admin onayı sonrası giriş yapabilirsiniz.');
      }
    } catch (err: any) {
      if (err.message && (err.message.includes('onaylanmadı') || err.message.includes('bekleniyor'))) {
          setError(err.message);
      } else {
          setError(err.message || 'Google ile giriş yapılırken bir hata oluştu.');
      }
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
        setError('Hatalı email veya şifre. Lütfen bilgilerinizi kontrol edin.');
      }
    } catch (err: any) {
      setError(err.message || 'Giriş yapılırken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f14] text-gray-300 font-mono flex flex-col selection:bg-[#00ff99] selection:text-black selection:font-bold">
      
      {/* SECTION 1: HERO */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 py-12 overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#00ff99 0.5px, transparent 0.5px)', backgroundSize: '40px 40px' }}></div>
        
        <div className="max-w-6xl w-full text-center space-y-12 z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-sm border border-[#00ff99]/30 bg-black/40 text-[10px] font-bold text-[#00ff99] tracking-widest uppercase">
            <span className="w-2 h-2 rounded-full bg-[#00ff99] animate-pulse shadow-[0_0_8px_#00ff99]"></span>
            SİSTEM DURUMU: GÜVENLİ ERİŞİM AKTİF
          </div>

          <h1 className="text-5xl md:text-9xl font-black text-white leading-none tracking-tighter uppercase italic">
            GERÇEK İNSANLARLA,<br/>
            <span className="text-[#00ff99] drop-shadow-[0_0_20px_rgba(0,255,153,0.6)]">GÜVENLİ SOHBET</span>
          </h1>

          <div className="flex justify-center">
            <div className="max-w-2xl border-l-4 border-[#00ff99] bg-gray-900/40 p-6 text-center">
              <p className="text-sm md:text-xl text-gray-400 leading-relaxed font-bold tracking-tight">
                Sabıka kaydı temiz, çalışan ve kimliği doğrulanmış kişilerle<br/>
                huzurlu, seviyeli ve <span className="text-white">gerçek sohbet ortamı.</span>
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 justify-center pt-8">
            <button 
              onClick={() => setShowLoginForm(true)}
              className="group bg-[#00ff99] text-black px-12 py-5 text-sm font-black flex items-center justify-center gap-3 hover:bg-white transition-all transform active:scale-95"
            >
              <ArrowRight size={18} /> GİRİŞ YAP
            </button>
            <button 
              onClick={onRegisterClick}
              className="border-2 border-[#00ff99] text-[#00ff99] hover:bg-[#00ff99]/10 px-12 py-5 text-sm font-black transition-all flex items-center justify-center gap-3 transform active:scale-95"
            >
              <UserPlus size={18} /> BAŞVUR VE KATIL
            </button>
          </div>
        </div>
      </section>

      {/* SECTION 2: GÜVENLİK ÖNCELİĞİMİZ */}
      <section className="py-24 bg-[#0b0f14] border-t border-gray-900 flex flex-col items-center">
        <div className="flex flex-col items-center mb-16">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-white rounded-full text-black shadow-[0_0_20px_rgba(255,255,255,0.2)]">
              <ShieldAlert size={32} />
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-white uppercase italic tracking-tighter">GÜVENLİK BİZİM ÖNCELİĞİMİZ</h2>
          </div>
          <div className="w-32 h-1 bg-[#00ff99]"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
          {/* Card 1 */}
          <div className="bg-[#121820] border border-gray-800 p-8 space-y-8 hover:border-[#00ff99]/50 transition-all">
            <div className="w-16 h-16 bg-gray-900 border border-gray-800 flex items-center justify-center text-[#00ff99]">
              <Users size={32} />
            </div>
            <div className="space-y-6">
              <h3 className="text-xl font-black text-white uppercase tracking-widest italic">GERÇEK KİŞİLER</h3>
              <ul className="space-y-4">
                <li className="flex items-center gap-3 text-xs font-bold text-gray-400">
                  <CheckCircle2 size={16} className="text-[#00ff99]" /> Kimlik doğrulama zorunlu
                </li>
                <li className="flex items-center gap-3 text-xs font-bold text-gray-400">
                  <CheckCircle2 size={16} className="text-[#00ff99]" /> Sahte hesaplara geçit yok
                </li>
                <li className="flex items-center gap-3 text-xs font-bold text-gray-400">
                  <CheckCircle2 size={16} className="text-[#00ff99]" /> Aktif moderasyon ve denetim
                </li>
              </ul>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-[#121820] border border-gray-800 p-8 space-y-8 hover:border-[#00ff99]/50 transition-all">
            <div className="w-16 h-16 bg-gray-900 border border-gray-800 flex items-center justify-center text-[#00ff99]">
              <FileText size={32} />
            </div>
            <div className="space-y-6">
              <h3 className="text-xl font-black text-white uppercase tracking-widest italic">SİCİL KONTROLÜ</h3>
              <ul className="space-y-4">
                <li className="flex items-center gap-3 text-xs font-bold text-gray-400">
                  <CheckCircle2 size={16} className="text-[#00ff99]" /> Temiz sicil zorunluluğu
                </li>
                <li className="flex items-center gap-3 text-xs font-bold text-gray-400">
                  <CheckCircle2 size={16} className="text-[#00ff99]" /> Topluluk güvenliği esastır
                </li>
                <li className="flex items-center gap-3 text-xs font-bold text-gray-400">
                  <CheckCircle2 size={16} className="text-[#00ff99]" /> Periyodik denetim sistemi
                </li>
              </ul>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-[#121820] border border-gray-800 p-8 space-y-8 hover:border-[#00ff99]/50 transition-all">
            <div className="w-16 h-16 bg-gray-900 border border-gray-800 flex items-center justify-center text-[#00ff99]">
              <Briefcase size={32} />
            </div>
            <div className="space-y-6">
              <h3 className="text-xl font-black text-white uppercase tracking-widest italic">AKTİF ÇALIŞANLAR</h3>
              <ul className="space-y-4">
                <li className="flex items-center gap-3 text-xs font-bold text-gray-400">
                  <CheckCircle2 size={16} className="text-[#00ff99]" /> Profesyonel bir sosyal çevre
                </li>
                <li className="flex items-center gap-3 text-xs font-bold text-gray-400">
                  <CheckCircle2 size={16} className="text-[#00ff99]" /> Seviyeli ve bilinçli sohbet
                </li>
                <li className="flex items-center gap-3 text-xs font-bold text-gray-400">
                  <CheckCircle2 size={16} className="text-[#00ff99]" /> Saygılı topluluk kuralları
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: NEDEN BURADAYIZ & TERMINAL */}
      <section className="py-24 bg-[#0b0f14] px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          <div className="space-y-10">
            <h2 className="text-4xl md:text-5xl font-black text-white uppercase italic tracking-tighter underline decoration-[#00ff99] decoration-4 underline-offset-8">NEDEN BURADAYIZ?</h2>
            <p className="text-xl text-gray-400 leading-relaxed font-bold">
              İnternette anonimlik çoğu zaman güvensizliği beraberinde getirir. <span className="text-[#00ff99]">Biz bu döngüyü kırmak için buradayız.</span>
            </p>
            <div className="border-l-4 border-[#00ff99] bg-[#121820] p-8">
              <p className="text-lg italic font-bold text-white">
                "Amacımız; gerçek insanların, gerçek sohbetler yaptığı, seviyeli, güvenli ve saygılı bir ortam oluşturmak."
              </p>
            </div>

            <div className="space-y-6 pt-4">
               <h3 className="text-sm font-black text-[#00ff99] uppercase tracking-widest flex items-center gap-3">
                 <MessageSquare size={18} /> SOHBET KÜLTÜRÜMÜZ
               </h3>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-12 text-xs font-bold text-gray-300">
                 <div className="flex items-center gap-4 group">
                    <ChevronRight size={16} className="text-[#00ff99]" />
                    <span>“Naber millet?” samimiyeti</span>
                 </div>
                 <div className="flex items-center gap-4 group">
                    <ChevronRight size={16} className="text-[#00ff99]" />
                    <span>Hakaret ve taciz yasaktır</span>
                 </div>
                 <div className="flex items-center gap-4 group">
                    <ChevronRight size={16} className="text-[#00ff99]" />
                    <span>Geyik serbest, saygı şart</span>
                 </div>
                 <div className="flex items-center gap-4 group">
                    <ChevronRight size={16} className="text-[#00ff99]" />
                    <span>Moderasyon her an aktif</span>
                 </div>
               </div>
            </div>
          </div>

          {/* Terminal Window Mockup */}
          <div className="bg-[#0b0f14] border-2 border-white/20 shadow-2xl rounded-sm overflow-hidden transform rotate-1 hidden md:block">
            <div className="bg-[#121820] px-4 py-2 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/50"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-[#00ff99]/50 shadow-[0_0_5px_#00ff99]"></div>
              </div>
              <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest tracking-tighter">Status: connected to Workigom</div>
            </div>
            <div className="p-6 font-mono text-[13px] space-y-3 min-h-[350px]">
              <p className="text-blue-400">*** Local host: workigomchat.online (127.0.0.1)</p>
              <p className="text-blue-400">*** Checking identity protocol...</p>
              <div className="flex items-center gap-3 pl-4">
                <CheckCircle2 size={14} className="text-[#00ff99]" />
                <span className="text-gray-300 font-bold">Identity verified: <span className="text-[#00ff99]">[Kimlik Onaylandı]</span></span>
              </div>
              <div className="flex items-center gap-3 pl-4">
                <CheckCircle2 size={14} className="text-[#00ff99]" />
                <span className="text-gray-300 font-bold">Criminal record: <span className="text-[#00ff99]">[Sicil Temiz]</span></span>
              </div>
              <div className="flex items-center gap-3 pl-4">
                <CheckCircle2 size={14} className="text-[#00ff99]" />
                <span className="text-gray-300 font-bold">Professional status: <span className="text-[#00ff99]">[Aktif Çalışan]</span></span>
              </div>
              <p className="text-purple-400 pt-4">[ Sistem ]: Sohbete katılmaya yetkiniz var. İyi sohbetler 😊</p>
              <p className="text-white animate-pulse">_</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5: CTA */}
      <section className="py-32 bg-[#0b0f14] relative overflow-hidden flex flex-col items-center justify-center text-center">
        <div className="absolute inset-0 z-0 flex items-center justify-center opacity-[0.03] select-none pointer-events-none">
          <span className="text-[20vw] font-black tracking-tighter">WORKIGOM</span>
        </div>
        
        <div className="relative z-10 space-y-12">
          <h2 className="text-4xl md:text-7xl font-black text-white italic tracking-tighter uppercase leading-none">
            GÜVENLİ SOHBET BİR<br/>
            <span className="text-[#00ff99]">AYRICALIKTIR</span>
          </h2>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <button 
              onClick={onRegisterClick}
              className="bg-[#00ff99] text-black px-12 py-5 text-sm font-black flex items-center gap-3 hover:bg-white transition-all transform active:scale-95"
            >
              <Lock size={18} /> BAŞVUR VE KATIL
            </button>
            <button className="border border-gray-800 text-gray-500 px-12 py-5 text-sm font-black flex items-center gap-3 hover:border-gray-500 hover:text-white transition-all">
              <FileText size={18} /> KURALLAR & GİZLİLİK
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="mt-auto bg-black py-12 px-10 border-t border-gray-900">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-[11px] font-black text-gray-600 uppercase tracking-[0.4em]">
            W O R K I G O M N E T W O R K S Y S T E M © 2 0 2 4
          </div>
          <div className="flex gap-8 text-[11px] font-black text-gray-500 uppercase tracking-widest">
            <button onClick={onAdminClick} className="flex items-center gap-2 hover:text-[#00ff99] transition-colors">
              <ShieldCheck size={14} /> YÖNETİCİ GİRİŞİ
            </button>
            <button className="hover:text-[#00ff99] transition-colors">DESTEK</button>
            <button className="hover:text-[#00ff99] transition-colors">KVKK</button>
          </div>
        </div>
      </footer>

      {/* LOGIN MODAL */}
      {showLoginForm && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/80 backdrop-blur-md p-6 font-mono">
          <div className="bg-[#121820] border-2 border-gray-800 w-full max-w-md p-8 shadow-2xl relative">
            <button onClick={() => setShowLoginForm(false)} className="absolute top-4 right-4 text-gray-500 hover:text-white"><X size={20} /></button>
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-2 underline decoration-[#00ff99]">Sisteme Giriş</h2>
              <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Workigom Secure Network</p>
            </div>
            
            {error && (
              <div className="mb-6 bg-red-900/20 border border-red-500/50 p-4 flex items-start gap-3 text-red-400 text-[10px] font-bold leading-relaxed">
                <AlertCircle size={16} className="shrink-0" />
                <span>
                  {error}
                  {error.includes("origin is not allowed") && (
                    <div className="mt-2 text-white opacity-80">
                      Not: Lütfen Google Cloud Console'da <b>{window.location.origin}</b> adresini izinli kaynaklara ekleyin.
                    </div>
                  )}
                </span>
              </div>
            )}

            {infoMessage && (
              <div className="mb-6 bg-blue-900/20 border border-blue-500/50 p-4 flex items-start gap-3 text-blue-400 text-xs font-bold leading-relaxed">
                <CheckCircle2 size={16} className="shrink-0" />
                <span>{infoMessage}</span>
              </div>
            )}
            
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">E-Posta Adresi</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" size={16} />
                  <input type="email" required value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} className="w-full bg-black/50 border border-gray-800 focus:border-[#00ff99] py-3 pl-10 pr-4 text-sm text-white outline-none" placeholder="ornek@email.com" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Şifre</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" size={16} />
                  <input type="password" required value={loginPass} onChange={(e) => setLoginPass(e.target.value)} className="w-full bg-black/50 border border-gray-800 focus:border-[#00ff99] py-3 pl-10 pr-4 text-sm text-white outline-none" placeholder="••••••••" />
                </div>
              </div>
              <button type="submit" disabled={loading} className="w-full bg-[#00ff99] text-black py-4 text-sm font-black uppercase flex items-center justify-center gap-3 hover:bg-white transition-all disabled:opacity-50">
                {loading ? <Loader2 className="animate-spin" size={20} /> : <LogIn size={20} />} ERİŞİM İZNİ İSTE
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-800">
              <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest mb-4 text-center">Alternatif Erişim</p>
              <div id="google-button-container" className="w-full"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;
