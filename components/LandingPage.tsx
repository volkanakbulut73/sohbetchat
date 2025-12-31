
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
  // Added X to imports to resolve the "Cannot find name 'X'" error
  X
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
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Header / Navbar */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-2">
          <Shield className="text-blue-700" size={24} />
          <span className="font-black text-xl text-slate-800 tracking-tighter">WORKIGOM<span className="text-blue-600">CHAT</span></span>
        </div>
        <div className="flex gap-4">
          <button onClick={onAdminClick} className="text-[10px] font-bold text-gray-400 hover:text-blue-600 uppercase tracking-widest">Yönetici</button>
        </div>
      </nav>

      {/* Main Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-4xl mx-auto space-y-8">
        <div className="space-y-4">
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight">
            Güvenli ve Profesyonel <br/>
            <span className="text-blue-600 underline decoration-blue-200 underline-offset-4">İletişim Portalı</span>
          </h2>
          <p className="text-gray-500 text-sm md:text-base font-medium max-w-2xl mx-auto">
            Workigom Secure Network üzerinden gerçek ve doğrulanmış kullanıcılarla, 
            klasik mIRC ruhunu modern bir arayüzle deneyimleyin.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
          <button 
            onClick={() => setShowLoginForm(true)}
            className="flex-1 bg-blue-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2"
          >
            <LogIn size={18} /> Giriş Yap
          </button>
          <button 
            onClick={onRegisterClick}
            className="flex-1 bg-white text-blue-600 border-2 border-blue-100 px-8 py-4 rounded-xl font-bold hover:border-blue-600 transition-all flex items-center justify-center gap-2"
          >
            <UserPlus size={18} /> Kayıt Ol
          </button>
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm text-left space-y-2">
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center"><Lock size={20}/></div>
            <h4 className="font-bold text-slate-800">Uçtan Uca Güvenli</h4>
            <p className="text-xs text-gray-400">Tüm kullanıcılar resmi belgelerle doğrulanır.</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm text-left space-y-2">
            <div className="w-10 h-10 bg-pink-50 text-pink-600 rounded-lg flex items-center justify-center"><Globe size={20}/></div>
            <h4 className="font-bold text-slate-800">Yapay Zeka Botları</h4>
            <p className="text-xs text-gray-400">Lara ve Sokrates ile kesintisiz etkileşim.</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm text-left space-y-2">
            <div className="w-10 h-10 bg-green-50 text-green-600 rounded-lg flex items-center justify-center"><MessageSquare size={20}/></div>
            <h4 className="font-bold text-slate-800">Klasik Ruh</h4>
            <p className="text-xs text-gray-400">mIRC komutları ve jargonuna tam uyum.</p>
          </div>
        </div>
      </main>

      <footer className="p-6 text-center text-gray-400 text-[10px] font-bold uppercase tracking-widest border-t border-gray-100">
        Workigom Network System &copy; 2024 - Tüm Hakları Saklıdır
      </footer>

      {/* Login Modal */}
      {showLoginForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-md">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
            <div className="bg-blue-600 text-white px-6 py-5 flex justify-between items-center">
              <span className="font-bold flex items-center gap-2">
                <Shield size={18} /> Kullanıcı Girişi
              </span>
              <button onClick={() => setShowLoginForm(false)} className="hover:bg-blue-500 rounded-full p-1">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleLogin} className="p-8 space-y-5">
              {error && (
                <div className="bg-red-50 border border-red-100 p-3 rounded-xl text-red-600 text-xs font-bold text-center">
                  HATA: {error}
                </div>
              )}
              {infoMessage && (
                <div className="bg-blue-50 border border-blue-100 p-3 rounded-xl text-blue-600 text-xs font-bold text-center">
                  BİLGİ: {infoMessage}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase ml-1">E-posta:</label>
                <input 
                  type="email" 
                  required
                  value={loginEmail}
                  onChange={e => setLoginEmail(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm outline-none focus:border-blue-400 transition-all"
                  placeholder="isim@sirket.com"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-400 uppercase ml-1">Şifre:</label>
                <input 
                  type="password" 
                  required
                  value={loginPass}
                  onChange={e => setLoginPass(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm outline-none focus:border-blue-400 transition-all"
                  placeholder="********"
                />
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition-all disabled:opacity-50"
              >
                {loading ? <Loader2 size={20} className="animate-spin mx-auto" /> : 'GİRİŞ YAP'}
              </button>

              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100"></div></div>
                <div className="relative flex justify-center text-[9px] font-bold"><span className="bg-white px-2 text-gray-300 uppercase">Veya Sosyal Hesapla</span></div>
              </div>

              <div id="google-button-container" className="flex justify-center"></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;
