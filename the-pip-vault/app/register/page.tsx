"use client";

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, LogIn, TrendingUp, AlertCircle, CheckCircle, ShieldCheck } from 'lucide-react';

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

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

        // 1. Validatie
        if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
            setError("Please fill in all fields.");
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
                // 3. Profiel Update (Direct na registratie)
                // We proberen het profiel te updaten/inserten.
                // Omdat Supabase vaak automatisch een trigger heeft, gebruiken we upsert.
                // Als je GEEN trigger hebt, is dit noodzakelijk.
                const { error: profileError } = await supabase
                    .from('profiles')
                    .upsert({
                        id: authData.user.id,
                        first_name: formData.firstName,
                        last_name: formData.lastName,
                        starting_equity: 10000, // Default start
                        currency: 'USD'
                    });

                if (profileError) {
                    console.error("Profile creation failed:", profileError);
                    // We falen hier niet hard, omdat de user wel is aangemaakt.
                }

                setSuccess(true);
            }

        } catch (err: any) {
            console.error("Registratie fout:", err);
            setError(err.message || "Registration failed.");
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-pip-dark flex items-center justify-center p-6">
                <div className="bg-pip-card border border-pip-border p-8 rounded-2xl max-w-md w-full text-center space-y-6">
                    <div className="w-20 h-20 bg-pip-green/20 rounded-full flex items-center justify-center mx-auto text-pip-green animate-in zoom-in">
                        <CheckCircle size={40} />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-2xl font-bold text-white">Check Your Email</h2>
                        <p className="text-pip-muted">
                            We've sent a verification link to <span className="text-white font-medium">{formData.email}</span>.
                        </p>
                    </div>
                    <p className="text-sm text-pip-muted/70">
                        Please verify your email address to activate your account and access The PipVault.
                    </p>
                    <div className="pt-4 border-t border-pip-border">
                        <Link href="/login" className="text-pip-gold font-bold hover:underline">
                            Back to Login
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-pip-dark">

            {/* Branding Section */}
            <div className="hidden lg:flex flex-col justify-between p-12 bg-linear-to-br from-pip-dark via-pip-dark to-pip-gold/10 border-r border-pip-border">
                <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-pip-gold rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(212,175,55,0.3)]">
                        <TrendingUp className="text-pip-dark" size={24} />
                    </div>
                    <span className="text-2xl font-black tracking-tighter text-white uppercase">The PipVault</span>
                </div>

                <div className="space-y-6">
                    <h2 className="text-5xl font-bold text-white leading-tight">
                        Join the elite.<br />
                        <span className="text-pip-gold text-4xl">Master your psychology.</span>
                    </h2>
                    <p className="text-pip-muted max-w-md text-lg">
                        Create your account today and start journaling your way to consistent profitability.
                    </p>
                </div>

                <p className="text-pip-muted/50 text-sm">
                    &copy; 2025 The PipVault. All rights reserved.
                </p>
            </div>

            {/* Form Section */}
            <div className="flex items-center justify-center p-6 sm:p-12 relative overflow-hidden">
                <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-pip-gold/5 rounded-full blur-[100px]" />

                <div className="w-full max-w-100 space-y-8 relative z-10">
                    <div className="space-y-2">
                        <h3 className="text-2xl font-bold text-white">Create Account</h3>
                        <p className="text-pip-muted">Enter your details to register.</p>
                    </div>

                    <form onSubmit={handleRegister} className="space-y-5">
                        {/* Name Fields */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-pip-muted uppercase tracking-wider mb-1 block">First Name</label>
                                <input
                                    name="firstName"
                                    type="text"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    className="w-full bg-pip-dark border border-pip-border rounded-xl px-4 py-3 text-white outline-none focus:border-pip-gold transition-colors placeholder:text-pip-muted/30"
                                    placeholder="John"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-pip-muted uppercase tracking-wider mb-1 block">Last Name</label>
                                <input
                                    name="lastName"
                                    type="text"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    className="w-full bg-pip-dark border border-pip-border rounded-xl px-4 py-3 text-white outline-none focus:border-pip-gold transition-colors placeholder:text-pip-muted/30"
                                    placeholder="Doe"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-pip-muted uppercase tracking-wider mb-1 block">Email</label>
                            <input
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full bg-pip-dark border border-pip-border rounded-xl px-4 py-3 text-white outline-none focus:border-pip-gold transition-colors placeholder:text-pip-muted/30"
                                placeholder="trader@example.com"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-pip-muted uppercase tracking-wider mb-1 block">Password</label>
                            <input
                                name="password"
                                type="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full bg-pip-dark border border-pip-border rounded-xl px-4 py-3 text-white outline-none focus:border-pip-gold transition-colors placeholder:text-pip-muted/30"
                                placeholder="Min. 6 characters"
                            />
                        </div>

                        {error && (
                            <div className="p-4 bg-pip-red/10 border border-pip-red/20 rounded-xl text-pip-red text-sm flex items-center gap-2 animate-in fade-in">
                                <AlertCircle size={16} />
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-pip-gold hover:bg-pip-gold-dim text-pip-dark font-black px-6 py-3 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 shadow-lg shadow-pip-gold/10 w-full"
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : "REGISTER"}
                        </button>
                    </form>

                    <p className="text-center text-pip-muted text-xs">
                        By registering, you agree to our <Link href="/privacy" className="text-pip-gold hover:underline">Privacy Policy</Link>.
                    </p>

                    <div className="text-center pt-4 border-t border-pip-border/50">
                        <p className="text-pip-muted text-sm">
                            Already have an account? <Link href="/login" className="text-pip-gold font-bold hover:underline">Login here</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
