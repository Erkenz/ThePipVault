"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { LogIn, Loader2, ShieldCheck, Lock, TrendingUp, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  
  // Inline validatie states
  const [errors, setErrors] = useState<{email?: string, password?: string}>({});
  const [touched, setTouched] = useState<{email?: boolean, password?: boolean}>({});

  const router = useRouter();
  const supabase = createClient();

  // Effect voor real-time validatie
  useEffect(() => {
    const newErrors: {email?: string, password?: string} = {};
    
    // Email validatie
    if (email && !/^\S+@\S+\.\S+$/.test(email)) {
      newErrors.email = "Voer een geldig e-mailadres in.";
    }

    // Wachtwoord validatie
    if (password && password.length < 6) {
      newErrors.password = "Wachtwoord moet minimaal 6 tekens bevatten.";
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
      setServerError("Inloggen mislukt. Controleer je gegevens.");
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
            Beveilig je trades.<br />
            <span className="text-pip-gold text-4xl">Optimaliseer je edge.</span>
          </h2>
          <p className="text-pip-muted max-w-md text-lg">
            De enige plek waar data, emotie en strategie samenkomen om van jou een consistente trader te maken.
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
            <h3 className="text-2xl font-bold text-white">Welkom terug</h3>
            <p className="text-pip-muted">Voer je gegevens in om toegang te krijgen tot je kluis.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email Input */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-pip-muted uppercase tracking-wider">Email</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => setTouched(prev => ({...prev, email: true}))}
                className={`w-full bg-pip-card/50 border rounded-xl px-4 py-3 text-white outline-none transition-all placeholder:text-pip-muted/30
                  ${touched.email && errors.email ? 'border-pip-red' : 'border-pip-border focus:border-pip-gold focus:ring-1 focus:ring-pip-gold'}
                `}
                placeholder="trader@piplab.com"
              />
              {touched.email && errors.email && (
                <p className="text-pip-red text-xs flex items-center gap-1 animate-in slide-in-from-top-1">
                  <AlertCircle size={12} /> {errors.email}
                </p>
              )}
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-semibold text-pip-muted uppercase tracking-wider">Wachtwoord</label>
              </div>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => setTouched(prev => ({...prev, password: true}))}
                className={`w-full bg-pip-card/50 border rounded-xl px-4 py-3 text-white outline-none transition-all placeholder:text-pip-muted/30
                  ${touched.password && errors.password ? 'border-pip-red' : 'border-pip-border focus:border-pip-gold focus:ring-1 focus:ring-pip-gold'}
                `}
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
              className="w-full bg-pip-gold hover:bg-pip-gold-dim text-pip-dark font-black py-4 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-30 disabled:cursor-not-allowed active:scale-[0.98] shadow-[0_10px_20px_rgba(212,175,55,0.15)]"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  <span>TOEGANG KRIJGEN</span>
                  <LogIn size={20} />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-pip-muted text-sm">
            Nog geen account? <button className="text-pip-gold font-bold hover:underline">Vraag toegang aan</button>
          </p>
        </div>
      </div>
    </div>
  );
}