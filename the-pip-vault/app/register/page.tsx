"use client";

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, TrendingUp, AlertCircle, CheckCircle, User, Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const router = useRouter();
    const supabase = createClient();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
        if (error) setError(null);
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // 1. Validation
        if (!formData.firstName || !formData.lastName || !formData.email || !formData.password || !formData.confirmPassword) {
            setError("All fields are required.");
            setLoading(false);
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match.");
            setLoading(false);
            return;
        }

        if (formData.password.length < 6) {
            setError("Password must be at least 6 characters.");
            setLoading(false);
            return;
        }

        try {
            // 2. Supabase Auth SignUp
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    emailRedirectTo: `${location.origin}/auth/callback`,
                }
            });

            if (authError) throw authError;

            if (authData.user) {
                // 3. Profile Update
                const { error: profileError } = await supabase
                    .from('profiles')
                    .upsert({
                        id: authData.user.id,
                        first_name: formData.firstName,
                        last_name: formData.lastName,
                        starting_equity: 10000,
                        currency: 'USD'
                    });

                if (profileError) {
                    console.error("Profile creation failed:", profileError);
                }

                setSuccess(true);
            }

        } catch (err: any) {
            console.error("Registration error:", err);
            setError(err.message || "Registration failed.");
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen w-full flex items-center justify-center bg-[#0f172a] p-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/20 rounded-full blur-[120px] animate-pulse" />
                </div>

                <div className="backdrop-blur-2xl bg-slate-900/40 border border-emerald-500/20 p-10 rounded-3xl max-w-md w-full text-center space-y-8 shadow-2xl relative z-10 animate-in zoom-in-95 duration-500">
                    <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/30 animate-in scale-in-0 duration-500 delay-150">
                        <CheckCircle className="text-white" size={48} />
                    </div>
                    <div className="space-y-4">
                        <h2 className="text-3xl font-black text-white tracking-tight">Access Granted</h2>
                        <p className="text-slate-400 text-lg leading-relaxed">
                            Verification link sent to <span className="text-emerald-400 font-bold">{formData.email}</span>
                        </p>
                    </div>

                    <Link href="/login" className="block w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-4 rounded-xl border border-white/5 transition-all hover:scale-[1.02]">
                        Return to Login
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-[#0f172a]">
            {/* Dynamic Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-[100px] animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px]" />
            </div>

            <div className="w-full max-w-lg relative z-10 p-6 my-10">
                {/* Brand Header */}
                <div className="flex flex-col items-center mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 mb-4">
                        <TrendingUp className="text-white" size={28} />
                    </div>
                    <h1 className="text-3xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
                        JOIN PIPVAULT
                    </h1>
                    <p className="text-slate-400 font-medium text-sm mt-2">Begin your journey to consistency</p>
                </div>

                {/* Glass Card */}
                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-500">
                    <form onSubmit={handleRegister} className="space-y-5">

                        {/* Name Fields Row */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5 group">
                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-1">First Name</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={18} />
                                    <input
                                        name="firstName"
                                        type="text"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        className="w-full bg-slate-900/50 border border-white/10 rounded-2xl pl-12 pr-4 py-3.5 text-white outline-none focus:border-blue-500/50 focus:bg-slate-900/80 transition-all placeholder:text-slate-600"
                                        placeholder="John"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5 group">
                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-1">Last Name</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={18} />
                                    <input
                                        name="lastName"
                                        type="text"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        className="w-full bg-slate-900/50 border border-white/10 rounded-2xl pl-12 pr-4 py-3.5 text-white outline-none focus:border-blue-500/50 focus:bg-slate-900/80 transition-all placeholder:text-slate-600"
                                        placeholder="Doe"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Email Input */}
                        <div className="space-y-1.5 group">
                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-1">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={18} />
                                <input
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full bg-slate-900/50 border border-white/10 rounded-2xl pl-12 pr-4 py-3.5 text-white outline-none focus:border-blue-500/50 focus:bg-slate-900/80 transition-all placeholder:text-slate-600"
                                    placeholder="trader@example.com"
                                />
                            </div>
                        </div>

                        {/* Password Fields */}
                        <div className="space-y-4">
                            <div className="space-y-1.5 group">
                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-1">Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
                                    <input
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="w-full bg-slate-900/50 border border-white/10 rounded-2xl pl-12 pr-12 py-3.5 text-white outline-none focus:border-indigo-500/50 focus:bg-slate-900/80 transition-all placeholder:text-slate-600"
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
                                <p className="text-[10px] text-slate-500 pl-1">At least 6 characters strong.</p>
                            </div>

                            <div className="space-y-1.5 group">
                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-1">Confirm Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
                                    <input
                                        name="confirmPassword"
                                        type={showConfirmPassword ? "text" : "password"}
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        className="w-full bg-slate-900/50 border border-white/10 rounded-2xl pl-12 pr-12 py-3.5 text-white outline-none focus:border-indigo-500/50 focus:bg-slate-900/80 transition-all placeholder:text-slate-600"
                                        placeholder="Confirm ••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                                    >
                                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-sm flex items-center gap-2 animate-in fade-in zoom-in-95">
                                <AlertCircle size={16} />
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="group w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : (
                                <>
                                    <span className="tracking-wide">CREATE ACCOUNT</span>
                                    <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
                                </>
                            )}
                        </button>
                    </form>

                    <p className="text-center mt-6 text-xs text-slate-500 leading-relaxed">
                        By joining, you agree to our{' '}
                        <Link href="/privacy" className="text-slate-400 hover:text-white underline transition-colors">Privacy Policy</Link>
                        {' '}and Terms of Service.
                    </p>
                </div>

                {/* Footer */}
                <p className="text-center mt-8 text-sm text-slate-500">
                    Already a member?{' '}
                    <Link href="/login" className="text-blue-400 hover:text-blue-300 font-semibold hover:underline decoration-blue-400/30 underline-offset-4 transition-all">
                        Login here
                    </Link>
                </p>
            </div>
        </div>
    );
}
