import Link from 'next/link';
import { ArrowLeft, ShieldCheck, Lock, Eye, FileText, Scale } from 'lucide-react';

export default function PrivacyPage() {
    return (
        <div className="min-h-screen w-full bg-[#0f172a] relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px]" />
            </div>

            <div className="relative z-10 max-w-4xl mx-auto px-6 py-12 md:py-20">
                {/* Header - No Navigation */}
                <header className="mb-12 animate-in fade-in slide-in-from-top-4 duration-700">

                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/10">
                        <div>
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 mb-6">
                                <ShieldCheck className="text-white" size={32} />
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-2">Privacy Policy</h1>
                            <p className="text-slate-400 text-lg">Transparency regarding your data and rights.</p>
                        </div>
                        <div className="text-right">
                            <span className="inline-block px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest">
                                Updated Jan 2025
                            </span>
                        </div>
                    </div>
                </header>

                {/* Content */}
                <div className="space-y-6 animate-in fade-in run-in duration-1000 delay-150">

                    {/* Section 1 */}
                    <section className="backdrop-blur-md bg-white/5 border border-white/5 rounded-3xl p-8 hover:border-white/10 transition-colors">
                        <div className="flex items-start gap-4">
                            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 mt-1">
                                <Eye size={24} />
                            </div>
                            <div className="space-y-4">
                                <h2 className="text-2xl font-bold text-white">1. Introduction</h2>
                                <p className="text-slate-400 leading-relaxed">
                                    Welcome to The PipVault ("we," "our," or "us"). We respect your privacy and are committed to protecting your personal data.
                                    This privacy policy will inform you as to how we look after your personal data when you visit our website directly or use our application.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Section 2 */}
                    <section className="backdrop-blur-md bg-white/5 border border-white/5 rounded-3xl p-8 hover:border-white/10 transition-colors">
                        <div className="flex items-start gap-4">
                            <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 mt-1">
                                <FileText size={24} />
                            </div>
                            <div className="space-y-4">
                                <h2 className="text-2xl font-bold text-white">2. The Data We Collect</h2>
                                <p className="text-slate-400 leading-relaxed">
                                    We may collect, use, store and transfer different kinds of personal data about you which we have grouped together follows:
                                </p>
                                <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                                    {[
                                        { title: "Identity Data", desc: "First name, last name" },
                                        { title: "Contact Data", desc: "Email address" },
                                        { title: "Technical Data", desc: "IP address, login data, browser info" },
                                        { title: "Usage Data", desc: "Trading journal entries & stats" }
                                    ].map((item, i) => (
                                        <li key={i} className="flex flex-col p-4 rounded-xl bg-slate-900/50 border border-white/5">
                                            <strong className="text-white text-sm mb-1">{item.title}</strong>
                                            <span className="text-slate-500 text-xs">{item.desc}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* Section 3 */}
                    <section className="backdrop-blur-md bg-white/5 border border-white/5 rounded-3xl p-8 hover:border-white/10 transition-colors">
                        <div className="flex items-start gap-4">
                            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 mt-1">
                                <Lock size={24} />
                            </div>
                            <div className="space-y-4">
                                <h2 className="text-2xl font-bold text-white">3. Data Security & Usage</h2>
                                <p className="text-slate-400 leading-relaxed">
                                    We rely on Supabase for enterprise-grade authentication and database security. Your data is encrypted at rest and in transit.
                                    We use your data solely to provide functionality:
                                </p>
                                <ul className="list-disc pl-5 space-y-2 text-slate-400">
                                    <li>To register you as a new customer.</li>
                                    <li>To provide the trading journal service to you.</li>
                                    <li>To manage our relationship with you.</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* Section 4 */}
                    <section className="backdrop-blur-md bg-white/5 border border-white/5 rounded-3xl p-8 hover:border-white/10 transition-colors">
                        <div className="flex items-start gap-4">
                            <div className="p-3 rounded-xl bg-rose-500/10 text-rose-400 mt-1">
                                <Scale size={24} />
                            </div>
                            <div className="space-y-4">
                                <h2 className="text-2xl font-bold text-white">4. Your Rights (GDPR)</h2>
                                <p className="text-slate-400 leading-relaxed">
                                    Under certain circumstances, you have rights under data protection laws in relation to your personal data, including the right to request access, correction, erasure, or object to processing.
                                </p>
                                <div className="mt-4 p-4 bg-rose-500/5 border border-rose-500/10 rounded-xl">
                                    <p className="text-sm text-rose-200/80">
                                        <strong>Right to Delete:</strong> You can permanently delete your account and all data instantly via the Settings dashboard.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                </div>

                <footer className="mt-12 pt-8 border-t border-white/5 text-center text-slate-500 text-sm">
                    <p>Questions? Contact us at <a href="mailto:support@thepipvault.com" className="text-blue-400 hover:underline">support@thepipvault.com</a></p>
                    <p className="mt-2">&copy; {new Date().getFullYear()} The PipVault. All rights reserved.</p>
                </footer>
            </div>
        </div>
    );
}
