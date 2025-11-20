
import React, { useState } from 'react';
import { User, Lock, Mail, Briefcase, ArrowRight, CheckCircle, Loader2, Database, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface AuthProps {
  onLogin: () => void;
}

export const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
      });

      if (error) throw error;
      if (data.user) {
          onLogin();
      }
    } catch (err: any) {
      setError(err.message || 'Giriş yapılırken bir hata oluştu. Bilgilerinizi kontrol ediniz.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!fullName || !companyName || !email || !password) {
        setError('Lütfen tüm alanları doldurunuz.');
        setLoading(false);
        return;
    }

    try {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                    company_name: companyName
                }
            }
        });

        if (error) throw error;

        if (data.user) {
            setSuccessMsg('Kayıt başarılı! Lütfen e-posta adresinize gelen onay linkine tıklayın, ardından giriş yapın.');
            setIsLogin(true);
        }
    } catch (err: any) {
        setError(err.message || 'Kayıt olurken bir hata oluştu.');
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
       <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-blue-600 p-8 text-center">
             <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm text-white">
                <span className="text-3xl font-bold">B</span>
             </div>
             <h1 className="text-2xl font-bold text-white">BizimHesap Lite</h1>
             <p className="text-blue-100 mt-2 text-sm">Bulut Tabanlı Ön Muhasebe</p>
          </div>

          <div className="p-8">
             <div className="flex gap-4 mb-6 border-b border-slate-100 pb-2">
                <button 
                  onClick={() => { setIsLogin(true); setError(''); setSuccessMsg(''); }}
                  className={`flex-1 pb-2 text-sm font-semibold transition-colors ${isLogin ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400'}`}
                >
                    Giriş Yap
                </button>
                <button 
                  onClick={() => { setIsLogin(false); setError(''); setSuccessMsg(''); }}
                  className={`flex-1 pb-2 text-sm font-semibold transition-colors ${!isLogin ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400'}`}
                >
                    Kayıt Ol
                </button>
             </div>

             {error && (
                 <div className="mb-4 p-3 bg-red-50 text-red-600 text-xs rounded-lg border border-red-100 flex items-start gap-2">
                     <AlertCircle size={16} className="flex-shrink-0 mt-0.5"/>
                     <span>{error}</span>
                 </div>
             )}
             
             {successMsg && (
                 <div className="mb-4 p-3 bg-emerald-50 text-emerald-600 text-xs rounded-lg border border-emerald-100 flex items-start gap-2">
                     <CheckCircle size={16} className="flex-shrink-0 mt-0.5"/>
                     <span>{successMsg}</span>
                 </div>
             )}

             {isLogin ? (
                 <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">E-Posta</label>
                        <div className="relative">
                            <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input 
                                type="email" 
                                required
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="w-full pl-10 p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                placeholder="ornek@sirket.com"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Şifre</label>
                        <div className="relative">
                            <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input 
                                type="password" 
                                required
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className="w-full pl-10 p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                placeholder="******"
                            />
                        </div>
                    </div>
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : <><span className="mr-2">Giriş Yap</span> <ArrowRight size={18} /></>}
                    </button>
                 </form>
             ) : (
                 <form onSubmit={handleRegister} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Ad Soyad</label>
                        <div className="relative">
                            <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input 
                                type="text" 
                                required
                                value={fullName}
                                onChange={e => setFullName(e.target.value)}
                                className="w-full pl-10 p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                placeholder="Adınız Soyadınız"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Şirket Adı</label>
                        <div className="relative">
                            <Briefcase size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input 
                                type="text" 
                                required
                                value={companyName}
                                onChange={e => setCompanyName(e.target.value)}
                                className="w-full pl-10 p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                placeholder="Şirketinizin Adı"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">E-Posta</label>
                        <div className="relative">
                            <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input 
                                type="email" 
                                required
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="w-full pl-10 p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                placeholder="ornek@sirket.com"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Şifre</label>
                        <div className="relative">
                            <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input 
                                type="password" 
                                required
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className="w-full pl-10 p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                placeholder="******"
                            />
                        </div>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-lg flex items-start gap-2 text-xs text-blue-700">
                        <Database size={14} className="mt-0.5 flex-shrink-0"/>
                        <p>Verileriniz Supabase bulut altyapısında güvenle saklanır. İstediğiniz cihazdan erişebilirsiniz.</p>
                    </div>
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                         {loading ? <Loader2 className="animate-spin" /> : <><span className="mr-2">Hesap Oluştur</span> <ArrowRight size={18} /></>}
                    </button>
                 </form>
             )}
          </div>
       </div>
    </div>
  );
};
