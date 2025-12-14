import React, { useState } from 'react';
import { Lock, Mail, User as UserIcon, ArrowRight } from 'lucide-react';

interface AuthScreenProps {
  onLogin: (email: string, pass: string) => Promise<void>;
  onRegister: (name: string, email: string, pass: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  onErrorClear: () => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin, onRegister, isLoading, error, onErrorClear }) => {
  const [isLogin, setIsLogin] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) {
      await onLogin(email, password);
    } else {
      await onRegister(name, email, password);
    }
  };

  // Dedicated Loading View
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center p-4 transition-colors duration-500">
         <style>{`
           @keyframes spinner-fade {
             0% { opacity: 1; transform: scale(1); }
             100% { opacity: 0.25; transform: scale(0.8); }
           }
         `}</style>
         
         <div className="relative w-16 h-16 mb-8">
            {[...Array(12)].map((_, i) => {
               const rotation = i * 30;
               const delay = -1.1 + (i * 0.1); 
               return (
                 <div
                   key={i}
                   className="absolute top-0 left-0 w-full h-full"
                   style={{ transform: `rotate(${rotation}deg)` }}
                 >
                   <div 
                     className="w-3.5 h-3.5 bg-indigo-600 dark:bg-indigo-400 rounded-full mx-auto mt-0.5"
                     style={{ 
                       animation: `spinner-fade 1.2s linear infinite`, 
                       animationDelay: `${delay}s` 
                     }}
                   ></div>
                 </div>
               );
            })}
         </div>
         
         <h2 className="text-2xl font-bold text-slate-800 dark:text-white animate-pulse">
            {isLogin ? 'Signing In...' : 'Setting up your account...'}
         </h2>
         <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">Please wait while we secure your data</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4 transition-colors duration-500">
      <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col relative animate-fade-in">
        
        {/* Decorative Header */}
        <div className="h-32 bg-gradient-to-br from-indigo-600 to-purple-700 relative flex items-center justify-center">
            <div className="absolute inset-0 bg-white/10 opacity-50 backdrop-blur-[1px]"></div>
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-16 h-16 bg-white dark:bg-slate-800 rounded-2xl shadow-lg flex items-center justify-center text-2xl font-bold text-indigo-600">
                ₹
            </div>
            <div className="absolute top-0 left-0 w-full h-full opacity-20">
                <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <path d="M0 100 C 20 0 50 0 100 100 Z" fill="white" />
                </svg>
            </div>
        </div>

        <div className="pt-12 pb-8 px-8">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
                    {isLogin ? 'Welcome Back' : 'Create Account'}
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">
                    {isLogin ? 'Enter your credentials to access your finances' : 'Start your journey to financial freedom'}
                </p>
            </div>

            {error && (
                <div className="mb-6 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 text-sm rounded-lg border border-red-100 dark:border-red-800 text-center animate-pulse">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                    <div className="relative group">
                        <UserIcon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                        <input 
                            type="text"
                            placeholder="Full Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required={!isLogin}
                            className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-slate-800 dark:text-white transition-all"
                        />
                    </div>
                )}
                
                <div className="relative group">
                    <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                    <input 
                        type="email"
                        placeholder="Email Address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-slate-800 dark:text-white transition-all"
                    />
                </div>

                <div className="relative group">
                    <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                    <input 
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-slate-800 dark:text-white transition-all"
                    />
                </div>

                <button 
                    type="submit" 
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none transition-all flex items-center justify-center gap-2 group mt-2"
                >
                    {isLogin ? 'Sign In' : 'Create Account'}
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
            </form>

            <div className="mt-6 text-center">
                <button 
                    onClick={() => {
                        setIsLogin(!isLogin);
                        onErrorClear();
                    }}
                    className="text-sm text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium transition-colors"
                >
                    {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
                </button>
            </div>
        </div>
        
        {/* Footer info */}
        <div className="bg-slate-50 dark:bg-slate-700/30 py-3 text-center border-t border-slate-100 dark:border-slate-700">
            <p className="text-xs text-slate-400 flex items-center justify-center gap-1">
                <Lock size={10} /> Secure Encryption Simulation
            </p>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;