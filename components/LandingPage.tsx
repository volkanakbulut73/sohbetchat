
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
      console.log("Workigom Debug: Current Origin is", window.location.origin);
      google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleResponse,
        auto_select: false,
        cancel_on_tap_outside: true
      });

      // Render the button if the modal is open and container exists
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

      {/* SECTION 2-6: STATİK İÇERİK (Hızlı geçiş için aynı kaldı) */}
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
        {/* ... Diğer bölümler ... */}
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
          </div>
        </div>
      </footer>

      {/* LOGIN MODAL */}
      {showLoginForm && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/80 backdrop-blur-md p-6">
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
              {/* Google Button Container */}
              <div id="google-button-container" className="w-full"></div>
              {/* Fallback info for origin error */}
              <p className="text-[9px] text-gray-600 mt-2 text-center italic">
                Google girişi yapılamıyorsa tarayıcı konsolunu (F12) kontrol edin.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;
