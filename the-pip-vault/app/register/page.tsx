"use client";

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, TrendingUp, AlertCircle, CheckCircle, User, Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

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
            <div className="min-h-screen w-full flex items-center justify-center bg-background p-6 relative overflow-hidden transition-colors duration-500">
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] animate-pulse dark:bg-emerald-500/20" />
                </div>

                <div className="glass-panel p-10 rounded-3xl max-w-md w-full text-center space-y-8 shadow-2xl relative z-10 animate-in zoom-in-95 duration-500">
                    <div className="w-24 h-24 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/30 animate-in scale-in-0 duration-500 delay-150">
                        <CheckCircle className="text-white" size={48} />
                    </div>
                    <div className="space-y-4">
                        <h2 className="text-3xl font-black text-foreground tracking-tight">Access Granted</h2>
                        <p className="text-muted-foreground text-lg leading-relaxed">
                            Verification link sent to <span className="text-emerald-500 font-bold">{formData.email}</span>
                        </p>
                    </div>

                    <Link href="/login" className="block w-full bg-secondary hover:bg-secondary/80 text-foreground font-bold py-4 rounded-xl border border-border/10 transition-all hover:scale-[1.02]">
                        Return to Login
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-background transition-colors duration-500">
            {/* Dynamic Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[100px] animate-pulse dark:bg-primary/20" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px] dark:bg-indigo-500/10" />
            </div>

            <div className="w-full max-w-lg relative z-10 p-6 my-10">
                {/* Brand Header */}
                <div className="flex flex-col items-center mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="w-14 h-14 bg-gradient-to-br from-primary to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 mb-4">
                        <TrendingUp className="text-white" size={28} />
                    </div>
                    <h1 className="text-3xl font-black tracking-tighter text-foreground">
                        JOIN PIPVAULT
                    </h1>
                    <p className="text-muted-foreground font-medium text-sm mt-2">Begin your journey to consistency</p>
                </div>

                {/* Glass Card */}
                <div className="glass-panel rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-500">
                    <form onSubmit={handleRegister} className="space-y-5">

                        {/* Name Fields Row */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5 group">
                                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest pl-1">First Name</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
                                    <input
                                        name="firstName"
                                        type="text"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        className="w-full bg-secondary/50 border border-border/50 rounded-2xl pl-12 pr-4 py-3.5 text-foreground outline-none focus:border-primary/50 focus:bg-background transition-all placeholder:text-muted-foreground/50"
                                        placeholder="John"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5 group">
                                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest pl-1">Last Name</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
                                    <input
                                        name="lastName"
                                        type="text"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        className="w-full bg-secondary/50 border border-border/50 rounded-2xl pl-12 pr-4 py-3.5 text-foreground outline-none focus:border-primary/50 focus:bg-background transition-all placeholder:text-muted-foreground/50"
                                        placeholder="Doe"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Email Input */}
                        <div className="space-y-1.5 group">
                            <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest pl-1">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
                                <input
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full bg-secondary/50 border border-border/50 rounded-2xl pl-12 pr-4 py-3.5 text-foreground outline-none focus:border-primary/50 focus:bg-background transition-all placeholder:text-muted-foreground/50"
                                    placeholder="trader@example.com"
                                />
                            </div>
                        </div>

                        {/* Password Fields */}
                        <div className="space-y-4">
                            <div className="space-y-1.5 group">
                                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest pl-1">Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
                                    <input
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="w-full bg-secondary/50 border border-border/50 rounded-2xl pl-12 pr-12 py-3.5 text-foreground outline-none focus:border-primary/50 focus:bg-background transition-all placeholder:text-muted-foreground/50"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                <p className="text-[10px] text-muted-foreground pl-1">At least 6 characters strong.</p>
                            </div>

                            <div className="space-y-1.5 group">
                                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest pl-1">Confirm Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
                                    <input
                                        name="confirmPassword"
                                        type={showConfirmPassword ? "text" : "password"}
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        className="w-full bg-secondary/50 border border-border/50 rounded-2xl pl-12 pr-12 py-3.5 text-foreground outline-none focus:border-primary/50 focus:bg-background transition-all placeholder:text-muted-foreground/50"
                                        placeholder="Confirm ••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-sm flex items-center gap-2 animate-in fade-in zoom-in-95">
                                <AlertCircle size={16} />
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="group w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-4 rounded-2xl shadow-lg shadow-primary/20 flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : (
                                <>
                                    <span className="tracking-wide">CREATE ACCOUNT</span>
                                    <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
                                </>
                            )}
                        </button>
                    </form>

                    <p className="text-center mt-6 text-xs text-muted-foreground leading-relaxed">
                        By joining, you agree to our{' '}
                        <Link href="/privacy" className="text-primary hover:text-primary/80 underline transition-colors">Privacy Policy</Link>
                        {' '}and Terms of Service.
                    </p>
                </div>

                {/* Footer */}
                <p className="text-center mt-8 text-sm text-muted-foreground">
                    Already a member?{' '}
                    <Link href="/login" className="text-primary hover:text-primary/80 font-semibold hover:underline decoration-primary/30 underline-offset-4 transition-all">
                        Login here
                    </Link>
                </p>
            </div>
        </div>
    );
}
