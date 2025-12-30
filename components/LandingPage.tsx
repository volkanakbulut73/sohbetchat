
import React, { useState } from 'react';
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
  Settings,
  Mail,
  Loader2,
  X,
  AlertCircle
} from 'lucide-react';
import { storageService } from '../services/storageService';

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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
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

  const handleGoogleLogin = () => {
    alert("Google Login servisi şu an Workigom Network üzerinde bakımda. Lütfen email/şifre kullanın.");
  };

  return (
    <div className="min-h-screen bg-[#0b0f14] text-gray-300 font-mono flex flex-col selection:bg-[#00ff99] selection:text-black relative">
      <section className="relative min-h-[95vh] flex flex-col items-center justify-center px-6 py-12 overflow-hidden border-b border-gray-900">
        <div className="absolute inset-0 z-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#00ff99 0.5px, transparent 0.5px)', backgroundSize: '30px 30px' }}></div>
        <div className="max-w-5xl w-full text-center space-y-10 z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-sm border border-[#00ff99]/30 bg-gray-900/80 text-[10px] font-bold text-[#00ff99] mb-4 shadow-[0_0_15px_rgba(0,255,153,0.1)]">
            <Shield size={12} className="animate-pulse" />
            SİSTEM DURUMU: GÜVENLİ ERİŞİM AKTİF
          </div>
          <h1 className="text-4xl md:text-8xl font-black text-white leading-tight tracking-tighter uppercase italic">
            Gerçek İnsanlarla,<br/>
            <span className="text-[#00ff99] drop-shadow-[0_0_10px_rgba(0,255,153,0.3)]">Güvenli Sohbet</span>
          </h1>
          <p className="text-sm md:text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed border-l-2 border-[#00ff99] pl-6 py-2 bg-gray-900/20">
            Sabıka kaydı temiz, çalışan ve kimliği doğrulanmış kişilerle 
            huzurlu, seviyeli ve <span className="text-white">gerçek sohbet ortamı.</span>
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center pt-8">
            <button 
              onClick={() => setShowLoginForm(true)}
              className="group bg-[#00ff99] text-black px-12 py-5 text-sm font-black shadow-[6px_6px_0px_0px_rgba(255,255,255,0.1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all flex items-center justify-center gap-3"
            >
              <LogIn size={20} /> GİRİŞ YAP
            </button>
            <button 
              onClick={onRegisterClick}
              className="border-2 border-[#00ff99] text-[#00ff99] hover:bg-[#00ff99] hover:text-black px-12 py-5 text-sm font-black transition-all flex items-center justify-center gap-3 bg-gray-900/5"
            >
              <UserPlus size={20} /> KAYIT OL
            </button>
          </div>
        </div>
      </section>

      {/* Login Modal */}
      {showLoginForm && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-md p-6">
          <div className="bg-[#1a1f26] border border-gray-800 w-full max-w-md p-8 shadow-2xl relative">
            <button 
              onClick={() => setShowLoginForm(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-white"
            >
              <X size={20} />
            </button>
            
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-2">Sisteme Giriş</h2>
              <p className="text-xs text-gray-500 uppercase font-bold tracking-widest">Workigom Secure Network</p>
            </div>

            {error && (
              <div className="mb-6 bg-red-900/20 border border-red-500/50 p-4 flex items-start gap-3 text-red-400 text-xs font-bold leading-relaxed">
                <AlertCircle size={16} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">E-Posta Adresi</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" size={16} />
                  <input 
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full bg-gray-900/50 border border-gray-800 focus:border-[#00ff99] py-3 pl-10 pr-4 text-sm text-white outline-none transition-all"
                    placeholder="ornek@email.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Şifre</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" size={16} />
                  <input 
                    type="password"
                    required
                    value={loginPass}
                    onChange={(e) => setLoginPass(e.target.value)}
                    className="w-full bg-gray-900/50 border border-gray-800 focus:border-[#00ff99] py-3 pl-10 pr-4 text-sm text-white outline-none transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-[#00ff99] text-black py-4 text-sm font-black uppercase flex items-center justify-center gap-3 hover:bg-white transition-all disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle2 size={20} />}
                ERİŞİM İZNİ İSTE
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-800 text-center">
              <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest mb-4">Alternatif Erişim</p>
              <button 
                onClick={handleGoogleLogin}
                className="w-full bg-transparent border border-gray-800 text-gray-400 py-3 text-[10px] font-black uppercase hover:bg-gray-800 hover:text-white transition-all flex items-center justify-center gap-2"
              >
                Google ile Devam Et
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-auto border-t border-gray-900 p-8 text-center text-[10px] font-bold text-gray-600 uppercase tracking-[0.2em] bg-black/40">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <span className="hover:text-white cursor-pointer transition-colors">Kullanım Şartları</span>
            <span className="hover:text-white cursor-pointer transition-colors">Gizlilik Politikası</span>
            <span className="hover:text-white cursor-pointer transition-colors" onClick={onAdminClick}>Admin Paneli</span>
          </div>
          <p>© 2024 Workigom Network. Tüm Hakları Saklıdır.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
