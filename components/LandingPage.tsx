
import React, { useState, useEffect } from 'react';
import { 
  Shield,
  LogIn,
  UserPlus,
  Loader2,
  AlertCircle,
  Globe,
  Lock,
  MessageSquare,
  X,
  ChevronRight,
  ShieldCheck
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
      setError(err.message || 'Giriş hatası.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f14] flex flex-col font-mono text-white selection:bg-[#00ff99] selection:text-black">
      {/* Upper Status Bar */}
      <div className="p-4 flex justify-between items-center text-[10px] opacity-50 font-bold uppercase tracking-widest border-b border-white/5">
        <div className="flex items-center gap-2">
           <Globe size={12} />
           <span>https://workigomchat.online</span>
        </div>
        <div className="flex gap-4">
          <button onClick={onAdminClick} className="hover:text-[#00ff99] transition-colors">Yönetici Girişi</button>
        </div>
      </div>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-12">
        
        {/* System Status Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-2 border border-[#00ff99]/40 rounded-sm bg-[#00ff99]/5">
            <div className="w-2 h-2 rounded-full bg-[#00ff99] animate-pulse shadow-[0_0_8px_#00ff99]"></div>
            <span className="text-[10px] font-black text-[#00ff99] tracking-[0.2em] uppercase">
                SİSTEM DURUMU: GÜVENLİ ERİŞİM AKTİF
            </span>
        </div>

        {/* Headline */}
        <div className="space-y-2">
            <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter text-white uppercase leading-none">
                GERÇEK İNSANLARLA,
            </h1>
            <h2 className="text-5xl md:text-7xl font-black italic tracking-tighter text-[#00ff99] uppercase leading-none drop-shadow-[0_0_25px_rgba(0,255,153,0.5)]">
                GÜVENLİ SOHBET
            </h2>
        </div>

        {/* Description */}
        <div className="max-w-2xl flex gap-6 items-start text-left">
            <div className="w-1 h-20 bg-[#00ff99] shrink-0 shadow-[0_0_10px_rgba(0,255,153,0.3)]"></div>
            <p className="text-gray-400 text-lg md:text-xl font-medium leading-relaxed italic">
                Sabıka kaydı temiz, çalışan ve kimliği doğrulanmış kişilerle <br/>
                huzurlu, seviyeli ve <span className="text-white font-bold">gerçek sohbet ortamı.</span>
            </p>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-6 w-full max-w-xl pt-4">
            <button 
                onClick={() => setShowLoginForm(true)}
                className="group relative flex-1 bg-[#00ff99] text-black h-16 flex items-center justify-center gap-3 font-black text-sm uppercase tracking-widest hover:bg-white transition-all overflow-hidden"
            >
                <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                <LogIn size={20} className="relative z-10" />
                <span className="relative z-10">GİRİŞ YAP</span>
            </button>
            <button 
                onClick={onRegisterClick}
                className="flex-1 border-2 border-[#00ff99] text-[#00ff99] h-16 flex items-center justify-center gap-3 font-black text-sm uppercase tracking-widest hover:bg-[#00ff99]/10 transition-all"
            >
                <UserPlus size={20} />
                <span>BAŞVUR VE KATIL</span>
            </button>
        </div>
      </main>

      {/* Footer Info Lines */}
      <footer className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8 border-t border-white/5 bg-black/20">
        <div className="space-y-2">
            <h4 className="text-[11px] font-black text-[#00ff99] uppercase tracking-widest flex items-center gap-2">
                <ShieldCheck size={14}/> GERÇEK KİŞİLER
            </h4>
            <p className="text-[10px] text-gray-500 font-bold uppercase leading-relaxed">
                Kimlik doğrulama zorunlu. Sahte hesaplara geçit yok. Aktif moderasyon.
            </p>
        </div>
        <div className="space-y-2">
            <h4 className="text-[11px] font-black text-[#00ff99] uppercase tracking-widest flex items-center gap-2">
                <Lock size={14}/> SABIKA KAYDI KONTROLÜ
            </h4>
            <p className="text-[10px] text-gray-500 font-bold uppercase leading-relaxed">
                Temiz sicil olmayan kabul edilmez. Topluluk güvenliği esastır.
            </p>
        </div>
        <div className="space-y-2">
            <h4 className="text-[11px] font-black text-[#00ff99] uppercase tracking-widest flex items-center gap-2">
                <MessageSquare size={14}/> SOHBET KÜLTÜRÜ
            </h4>
            <p className="text-[10px] text-gray-400 font-bold uppercase leading-relaxed">
                Workigom Network System © 2024 - Tüm Hakları Saklıdır
            </p>
        </div>
      </footer>

      {/* Login Modal */}
      {showLoginForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4 backdrop-blur-sm">
          <div className="bg-[#1a1f26] border border-[#00ff99]/30 w-full max-w-sm overflow-hidden flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.5)]">
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
                <div className="relative flex justify-center text-[8px] font-black"><span className="bg-[#1a1f26] px-3 text-gray-600 uppercase tracking-tighter">Veya Sosyal Kimlik</span></div>
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
