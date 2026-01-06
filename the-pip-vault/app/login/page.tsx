"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { LogIn, Loader2, TrendingUp, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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

    // Email validatie
    if (email && !/^\S+@\S+\.\S+$/.test(email)) {
      newErrors.email = "Please enter a valid email address.";
    }

    // Wachtwoord validatie
    if (password && password.length < 6) {
      newErrors.password = "Password must be at least 6 characters.";
    }

    setErrors(newErrors);
  }, [email, password]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    // Markeer alles als 'touched' bij submit poging
    setTouched({ email: true, password: true });

    // Stop als er validatie fouten zijn
    if (Object.keys(errors).length > 0) return;

    setLoading(true);
    setServerError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setServerError("Login failed. Please check your credentials.");
      setLoading(false);
    } else {
      router.push('/');
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-pip-dark">

      {/* Linker Kant: Branding */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-linear-to-br from-pip-dark via-pip-dark to-pip-gold/10 border-r border-pip-border">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-pip-gold rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(212,175,55,0.3)]">
            <TrendingUp className="text-pip-dark" size={24} />
          </div>
          <span className="text-2xl font-black tracking-tighter text-white uppercase">The PipVault</span>
        </div>

        <div className="space-y-6">
          <h2 className="text-5xl font-bold text-white leading-tight">
            Secure your trades.<br />
            <span className="text-pip-gold text-4xl">Optimize your edge.</span>
          </h2>
          <p className="text-pip-muted max-w-md text-lg">
            The only place where data, emotion, and strategy come together to make you a consistent trader.
          </p>
        </div>

        <p className="text-pip-muted/50 text-sm">
          &copy; 2025 The PipVault. All rights reserved.
        </p>
      </div>

      {/* Rechter Kant: Formulier */}
      <div className="flex items-center justify-center p-6 sm:p-12 relative overflow-hidden">
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-pip-gold/5 rounded-full blur-[100px]" />

        <div className="w-full max-w-100 space-y-8 relative z-10">
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-white">Welcome Back</h3>
            <p className="text-pip-muted">Enter your details to access your vault.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email Input */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-pip-muted uppercase tracking-wider mb-1 block">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => setTouched(prev => ({ ...prev, email: true }))}
                className={`w-full bg-pip-dark border border-pip-border rounded-xl px-4 py-3 text-white outline-none focus:border-pip-gold transition-colors placeholder:text-pip-muted/30 ${touched.email && errors.email ? '!border-pip-red' : ''}`}
                placeholder="trader@piplab.com"
              />
              {touched.email && errors.email && (
                <p className="text-pip-red text-xs flex items-center gap-1 animate-in slide-in-from-top-1">
                  <AlertCircle size={12} /> {errors.email}
                </p>
              )}
            </div>

            {/* Password Input */}
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold text-pip-muted uppercase tracking-wider mb-1 block">Password</label>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => setTouched(prev => ({ ...prev, password: true }))}
                className={`w-full bg-pip-dark border border-pip-border rounded-xl px-4 py-3 text-white outline-none focus:border-pip-gold transition-colors placeholder:text-pip-muted/30 ${touched.password && errors.password ? '!border-pip-red' : ''}`}
                placeholder="••••••••"
              />
              {touched.password && errors.password && (
                <p className="text-pip-red text-xs flex items-center gap-1 animate-in slide-in-from-top-1">
                  <AlertCircle size={12} /> {errors.password}
                </p>
              )}
            </div>

            {/* Server Error Message */}
            {serverError && (
              <div className="p-4 bg-pip-red/10 border border-pip-red/20 rounded-xl text-pip-red text-sm flex items-center gap-2 animate-in fade-in zoom-in-95">
                <AlertCircle size={16} />
                {serverError}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || (touched.email && !!errors.email) || (touched.password && !!errors.password)}
              className="bg-pip-gold hover:bg-pip-gold-dim text-pip-dark font-black px-6 py-3 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 shadow-lg shadow-pip-gold/10 w-full"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  <span>LOGIN</span>
                  <LogIn size={20} />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-pip-muted text-sm">
            Don't have an account yet? <Link href="/register" className="text-pip-gold font-bold hover:underline">Register Here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}