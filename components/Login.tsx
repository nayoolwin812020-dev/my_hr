import React, { useState } from 'react';
import { Shield, Mail, Lock, ArrowRight, Loader2, Smartphone, ArrowLeft } from 'lucide-react';
import { api } from '../services/api';
import { User } from '../types';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [step, setStep] = useState<'LOGIN' | '2FA'>('LOGIN');
  
  // Login State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 2FA State
  const [twoFACode, setTwoFACode] = useState('');
  const [twoFAError, setTwoFAError] = useState<string|null>(null);

  // Temp storage for user data during 2FA
  const [tempUser, setTempUser] = useState<User | null>(null);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await api.auth.login(email, password);
      localStorage.setItem('token', response.token);
      
      const is2FAEnabled = localStorage.getItem('is_2fa_enabled') === 'true';
      
      if (is2FAEnabled) {
          setTempUser(response.user);
          setStep('2FA');
      } else {
          onLogin(response.user);
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify2FA = (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      setTwoFAError(null);

      setTimeout(() => {
          setLoading(false);
          // Mock verification (accepts 123456)
          if (twoFACode === '123456' && tempUser) {
              onLogin(tempUser);
          } else {
              setTwoFAError("Invalid code. Use 123456 for demo.");
          }
      }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center p-4 transition-colors">
      <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        {step === 'LOGIN' ? (
            <>
                <div className="flex flex-col items-center mb-8">
                <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200 dark:shadow-blue-900/20 mb-4 transform rotate-3">
                    <Shield size={32} className="text-white" />
                </div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Welcome Back</h1>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Sign in to your organization account</p>
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg font-medium text-center">
                    {error}
                  </div>
                )}

                <form onSubmit={handleLoginSubmit} className="space-y-5">
                <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 ml-1">Email Address</label>
                    <div className="relative">
                    <input
                        type="email"
                        required
                        className="w-full p-3.5 pl-11 bg-slate-50 hover:bg-white focus:bg-white dark:bg-slate-700/50 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 outline-none transition-all font-medium placeholder:text-slate-400"
                        placeholder="name@company.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20} />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 ml-1">Password</label>
                    <div className="relative">
                    <input
                        type="password"
                        required
                        className="w-full p-3.5 pl-11 bg-slate-50 hover:bg-white focus:bg-white dark:bg-slate-700/50 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 outline-none transition-all font-medium placeholder:text-slate-400"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20} />
                    </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                    <label className="flex items-center gap-2 cursor-pointer text-slate-600 dark:text-slate-400">
                    <input type="checkbox" className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                    Remember me
                    </label>
                    <a href="#" className="text-blue-600 dark:text-blue-400 font-medium hover:underline">Forgot Password?</a>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3.5 rounded-xl font-bold shadow-lg shadow-blue-200 dark:shadow-none active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {loading ? (
                    <Loader2 size={20} className="animate-spin" />
                    ) : (
                    <>
                        Sign In <ArrowRight size={20} />
                    </>
                    )}
                </button>
                </form>

                <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-8">
                Don't have an account? <span className="text-blue-600 dark:text-blue-400 font-medium cursor-pointer">Contact HR</span>
                </p>
            </>
        ) : (
            <>
                <div className="flex flex-col items-center mb-6 animate-in slide-in-from-right duration-300">
                    <div className="w-16 h-16 bg-teal-100 dark:bg-teal-900/30 rounded-full flex items-center justify-center mb-4">
                        <Smartphone size={32} className="text-teal-600 dark:text-teal-400" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Verification</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 text-center">
                        Enter the 6-digit code from your authenticator app
                    </p>
                </div>

                <form onSubmit={handleVerify2FA} className="space-y-6 animate-in slide-in-from-right duration-300">
                    <div className="space-y-2">
                        <input
                            type="text"
                            required
                            maxLength={6}
                            autoFocus
                            className="w-full p-4 text-center text-2xl tracking-[0.5em] bg-slate-50 hover:bg-white focus:bg-white dark:bg-slate-700/50 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-600 focus:border-teal-500 focus:ring-2 focus:ring-teal-100 dark:focus:ring-teal-900 outline-none transition-all font-mono placeholder:text-slate-300"
                            placeholder="000000"
                            value={twoFACode}
                            onChange={(e) => {
                                // Only numbers
                                const val = e.target.value.replace(/\D/g, '');
                                setTwoFACode(val);
                            }}
                        />
                        {twoFAError && (
                            <p className="text-xs text-red-500 text-center font-bold">{twoFAError}</p>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={loading || twoFACode.length !== 6}
                        className="w-full bg-teal-600 hover:bg-teal-700 text-white p-3.5 rounded-xl font-bold shadow-lg shadow-teal-200 dark:shadow-none active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                        <Loader2 size={20} className="animate-spin" />
                        ) : (
                        <>
                            Verify <ArrowRight size={20} />
                        </>
                        )}
                    </button>
                    
                    <button 
                        type="button"
                        onClick={() => { setStep('LOGIN'); setTwoFACode(''); setTwoFAError(null); }}
                        className="w-full py-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 text-sm font-medium flex items-center justify-center gap-1"
                    >
                        <ArrowLeft size={16} /> Back to Login
                    </button>
                </form>
            </>
        )}
      </div>
      
      <div className="mt-8 text-center">
         <p className="text-xs text-slate-400 dark:text-slate-500">Or use: admin@technova.com / 123456</p>
      </div>
    </div>
  );
};

export default Login;