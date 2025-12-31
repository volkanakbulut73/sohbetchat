
import React, { useState, useEffect } from 'react';
import { 
  Shield,
  LogIn,
  UserPlus,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { storageService } from '../services/storageService';

interface LandingPageProps {
  onEnter: (userData: any) => void;
  onRegisterClick: () => void;
  onAdminClick?: () => void;
}

const GOOGLE_CLIENT_ID = "444278057283-6dukljlihlpau48m625o2foulcnc04b3.apps.googleusercontent.com";

// Fix: Added the missing parts of the LandingPage component and ensured it has a default export.
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
      setError(err.message || 'Google ile giriş yapılırken bir hata oluştu.');
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
            SİSTEM DURUMU: GÜVENLİ ERİŞİM
          </div>

          <div className="space-y-6">
            <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter italic uppercase">
              WORKIGOM <span className="text-[#00ff99]">CHAT</span>
            </h1>
            <p className="text-xs md:text-sm text-gray-400 font-bold max-w-xl mx-auto uppercase tracking-[0.2em] leading-relaxed">
              Profesyonel iletişim ağı ve mIRC simülasyonu.
              <br />Güvenli kanal yapısı ve gerçek kullanıcı doğrulama.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-4">
            <button 
              onClick={() => setShowLoginForm(true)}
              className="bg-[#00ff99] text-black px-10 py-4 text-xs font-black uppercase tracking-widest hover:bg-white transition-all shadow-[6px_6px_0px_0px_rgba(255,255,255,0.1)] active:shadow-none active:translate-y-1"
            >
              Giriş Yap
            </button>
            <button 
              onClick={onRegisterClick}
              className="border-2 border-white text-white px-10 py-4 text-xs font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all"
            >
              Kayıt Ol
            </button>
          </div>

          {onAdminClick && (
            <button 
              onClick={onAdminClick}
              className="block mx-auto text-[9px] text-gray-600 font-bold uppercase tracking-widest hover:text-[#00ff99] pt-10"
            >
              Yönetici Paneli
            </button>
          )}
        </div>
      </section>

      {/* Login Modal */}
      {showLoginForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm">
          <div className="bg-[#d4dce8] border-2 border-white shadow-[10px_10px_0px_0px_rgba(0,0,0,0.5)] w-full max-w-sm overflow-hidden flex flex-col">
            <div className="bg-[#000080] text-white px-3 py-1.5 text-[11px] font-black flex justify-between items-center select-none">
              <span className="flex items-center gap-2">
                <Shield size={12} /> Workigom - Kullanıcı Girişi
              </span>
              <button onClick={() => setShowLoginForm(false)} className="hover:bg-red-600 p-0.5 transition-colors">
                <AlertCircle size={16} />
              </button>
            </div>

            <form onSubmit={handleLogin} className="p-6 space-y-4">
              {error && (
                <div className="bg-red-100 border border-red-500 p-3 text-red-700 text-[10px] font-bold">
                  HATA: {error}
                </div>
              )}
              {infoMessage && (
                <div className="bg-blue-100 border border-blue-500 p-3 text-blue-700 text-[10px] font-bold">
                  BİLGİ: {infoMessage}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-600 uppercase">E-posta:</label>
                <input 
                  type="email" 
                  required
                  value={loginEmail}
                  onChange={e => setLoginEmail(e.target.value)}
                  className="w-full border-2 border-gray-400 p-2 text-xs outline-none focus:border-blue-800"
                  placeholder="isim@sirket.com"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-600 uppercase">Şifre:</label>
                <input 
                  type="password" 
                  required
                  value={loginPass}
                  onChange={e => setLoginPass(e.target.value)}
                  className="w-full border-2 border-gray-400 p-2 text-xs outline-none focus:border-blue-800"
                  placeholder="********"
                />
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-[#00ff99] text-black py-3 text-xs font-black uppercase hover:bg-white transition-all disabled:opacity-50"
              >
                {loading ? <Loader2 size={16} className="animate-spin mx-auto" /> : 'SİSTEME GİRİŞ YAP'}
              </button>

              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-400"></div></div>
                <div className="relative flex justify-center text-[9px] font-bold"><span className="bg-[#d4dce8] px-2 text-gray-500 uppercase">VEYA</span></div>
              </div>

              <div id="google-button-container" className="w-full min-h-[40px]"></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;
