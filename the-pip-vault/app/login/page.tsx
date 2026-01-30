"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { LogIn, Loader2, TrendingUp, AlertCircle, Lock, Mail, ArrowRight, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // Inline validatie states
  const [errors, setErrors] = useState<{ email?: string, password?: string }>({});
  const [touched, setTouched] = useState<{ email?: boolean, password?: boolean }>({});

  const router = useRouter();
  const supabase = createClient();

  // Effect voor real-time validatie
  useEffect(() => {
    const newErrors: { email?: string, password?: string } = {};
    if (email && !/^\S+@\S+\.\S+$/.test(email)) newErrors.email = "Invalid email format.";
    if (password && password.length < 6) newErrors.password = "Password too short.";
    setErrors(newErrors);
  }, [email, password]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ email: true, password: true });
    if (Object.keys(errors).length > 0) return;

    setLoading(true);
    setServerError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setServerError("Invalid credentials.");
      setLoading(false);
    } else {
      router.push('/');
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-[#0f172a]">
      {/* Dynamic Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px]" />
      </div>

      <div className="w-full max-w-md relative z-10 p-6">
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 mb-4 transform rotate-3 hover:rotate-6 transition-transform">
            <TrendingUp className="text-white" size={28} />
          </div>
          <h1 className="text-3xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
            THE PIPVAULT
          </h1>
          <p className="text-slate-400 font-medium text-sm mt-2">Access your trading command center</p>
        </div>

        {/* Glass Card */}
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-500">
          <form onSubmit={handleLogin} className="space-y-5">

            {/* Email Input */}
            <div className="space-y-1.5 group">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => setTouched(prev => ({ ...prev, email: true }))}
                  className={`w-full bg-slate-900/50 border border-white/10 rounded-2xl pl-12 pr-4 py-3.5 text-white outline-none focus:border-blue-500/50 focus:bg-slate-900/80 transition-all placeholder:text-slate-600 ${touched.email && errors.email ? 'border-rose-500/50 focus:border-rose-500' : ''}`}
                  placeholder="trader@example.com"
                />
              </div>
              {touched.email && errors.email && (
                <p className="text-rose-400 text-xs pl-1 font-medium">{errors.email}</p>
              )}
            </div>

            {/* Password Input */}
            <div className="space-y-1.5 group">
              <div className="flex justify-between items-center pl-1">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Password</label>
                <Link href="#" className="text-[11px] text-blue-400 hover:text-blue-300 transition-colors">Forgot?</Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() => setTouched(prev => ({ ...prev, password: true }))}
                  className={`w-full bg-slate-900/50 border border-white/10 rounded-2xl pl-12 pr-12 py-3.5 text-white outline-none focus:border-indigo-500/50 focus:bg-slate-900/80 transition-all placeholder:text-slate-600 ${touched.password && errors.password ? 'border-rose-500/50 focus:border-rose-500' : ''}`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Server Error Message */}
            {serverError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-sm flex items-center gap-2 animate-in fade-in zoom-in-95">
                <AlertCircle size={16} />
                {serverError}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="group w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : (
                <>
                  <span className="tracking-wide">AUTHENTICATE</span>
                  <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center mt-8 text-sm text-slate-500">
          Not a member?{' '}
          <Link href="/register" className="text-blue-400 hover:text-blue-300 font-semibold hover:underline decoration-blue-400/30 underline-offset-4 transition-all">
            Initiate Access
          </Link>
        </p>
      </div>
    </div>
  );
}