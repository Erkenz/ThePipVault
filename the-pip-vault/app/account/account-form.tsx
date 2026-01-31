"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { Loader2, Save, LogOut, Trash2, AlertTriangle, Shield, User, Lock, X, Plus, CreditCard, Activity, CheckCircle, Wallet, Settings2 } from "lucide-react";
import { useProfile } from "@/context/ProfileContext";
import { useAccounts, Account } from "@/context/AccountContext";
import { cn } from "@/lib/utils";
import CustomSelect from "@/components/ui/CustomSelect";

export default function AccountForm({ user, profile }: { user: any, profile: any }) {
    const supabase = createClient();
    const router = useRouter();
    const { updateProfile, resetFullAccount } = useProfile();
    const { accounts, addAccount, updateAccount, deleteAccount } = useAccounts();

    // ----- STATES -----
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        firstName: profile?.first_name || '',
        lastName: profile?.last_name || '',
    });

    // Password States
    const [passData, setPassData] = useState({ password: '', confirm: '' });
    const [passLoading, setPassLoading] = useState(false);

    // Messages
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Delete Modal States
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);

    // Account Modal States
    const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
    const [editingAccount, setEditingAccount] = useState<Account | null>(null);
    const [accForm, setAccForm] = useState({
        name: '',
        type: 'Funded',
        start_amount: '',
        currency: 'USD',
        status: 'Active'
    });
    const [accLoading, setAccLoading] = useState(false);

    // Ensure portal target exists
    useEffect(() => {
        setPortalRoot(document.body);
    }, []);

    // ----- HANDLERS -----

    // 1. Update Profile
    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            await updateProfile({
                first_name: formData.firstName,
                last_name: formData.lastName,
            });
            setMessage({ type: 'success', text: "Profile updated successfully." });
        } catch (error) {
            console.error(error);
            setMessage({ type: 'error', text: "Failed to update profile." });
        } finally {
            setLoading(false);
        }
    };

    // 2. Change Password
    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        setPassLoading(true);
        setMessage(null);

        if (passData.password !== passData.confirm) {
            setMessage({ type: 'error', text: "Passwords do not match." });
            setPassLoading(false);
            return;
        }

        if (passData.password.length < 6) {
            setMessage({ type: 'error', text: "Password must be at least 6 characters." });
            setPassLoading(false);
            return;
        }

        const { error } = await supabase.auth.updateUser({ password: passData.password });

        if (error) {
            setMessage({ type: 'error', text: error.message });
        } else {
            setMessage({ type: 'success', text: "Password updated successfully." });
            setPassData({ password: '', confirm: '' });
        }
        setPassLoading(false);
    };

    // 3. Delete Account
    const handleDeleteAccount = async () => {
        setDeleteLoading(true);
        try {
            await resetFullAccount(); // Wipes data from DB
            await supabase.auth.signOut();
            router.push("/login"); // Redirect
        } catch (error) {
            console.error("Delete failed", error);
            setMessage({ type: 'error', text: "Failed to delete account. Please try again." });
            setDeleteLoading(false);
            setShowDeleteModal(false);
        }
    };

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push("/login");
    };

    // 4. Account Management Handlers
    const openAddAccount = () => {
        setEditingAccount(null);
        setAccForm({
            name: '',
            type: 'Funded',
            start_amount: '10000',
            currency: 'USD',
            status: 'Active'
        });
        setIsAccountModalOpen(true);
    };

    const openEditAccount = (acc: Account) => {
        setEditingAccount(acc);
        setAccForm({
            name: acc.name,
            type: acc.type,
            start_amount: acc.start_amount.toString(),
            currency: acc.currency,
            status: acc.status
        });
        setIsAccountModalOpen(true);
    };

    const handleSaveAccount = async (e: React.FormEvent) => {
        e.preventDefault();
        setAccLoading(true);
        try {
            const dataToSave = {
                name: accForm.name,
                type: accForm.type,
                start_amount: parseFloat(accForm.start_amount),
                currency: accForm.currency,
                status: accForm.status as 'Active' | 'Passed' | 'Blown' | 'Failed',
                is_default: false
            };

            if (editingAccount) {
                await updateAccount(editingAccount.id, dataToSave);
            } else {
                await addAccount(dataToSave);
            }
            setIsAccountModalOpen(false);
        } catch (err) {
            console.error(err);
            alert("Failed to save account");
        } finally {
            setAccLoading(false);
        }
    };

    const handleDeleteTradingAccount = async (id: string) => {
        if (confirm("Are you sure you want to delete this trading account and all its trades?")) {
            try {
                await deleteAccount(id);
            } catch (err) {
                console.error(err);
                alert("Failed to delete account");
            }
        }
    }

    return (
        <div className="space-y-8 pb-20">

            {/* 1. Profile Section */}
            <section className="glass-panel p-6 rounded-2xl space-y-6">
                <div className="flex items-center gap-2 text-primary uppercase font-bold text-xs tracking-wider">
                    <User size={14} /> Personal Identity
                </div>

                <form onSubmit={handleUpdate} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-semibold uppercase text-muted-foreground">First Name</label>
                            <input
                                type="text"
                                value={formData.firstName}
                                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                className="w-full bg-background/50 border border-border rounded-xl px-4 py-3 text-foreground outline-none focus:border-primary transition-colors"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-semibold uppercase text-muted-foreground">Last Name</label>
                            <input
                                type="text"
                                value={formData.lastName}
                                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                className="w-full bg-background/50 border border-border rounded-xl px-4 py-3 text-foreground outline-none focus:border-primary transition-colors"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase text-muted-foreground flex items-center gap-2">
                            Email <span className="text-[10px] font-normal normal-case opacity-70">(Read-only)</span>
                        </label>
                        <div className="w-full bg-muted/20 border border-border rounded-xl px-4 py-3 text-muted-foreground flex items-center gap-2 cursor-not-allowed">
                            <Shield size={14} />
                            {user.email}
                        </div>
                    </div>

                    <div className="flex justify-end pt-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-primary hover:bg-primary/90 text-white font-bold px-6 py-3 rounded-xl flex items-center gap-2 transition-all disabled:opacity-50 shadow-lg shadow-primary/20"
                        >
                            {loading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                            Save Details
                        </button>
                    </div>
                </form>
            </section>

            {/* 2. Trading Accounts Section */}
            <section className="glass-panel p-6 rounded-2xl space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-primary uppercase font-bold text-xs tracking-wider">
                        <Wallet size={14} /> Trading Accounts
                    </div>
                    <button onClick={openAddAccount} className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-lg shadow-primary/20">
                        <Plus size={14} /> Add Account
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {accounts.map(acc => (
                        <div key={acc.id} className="relative group bg-background/50 border border-border hover:border-primary/50 rounded-xl p-5 transition-all shadow-sm">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
                                        {acc.name}
                                        {acc.status === 'Passed' && <CheckCircle size={16} className="text-emerald-500" />}
                                        {acc.status === 'Blown' && <Activity size={16} className="text-red-500" />}
                                    </h3>
                                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{acc.type} • {acc.currency}</p>
                                </div>
                                <div className={cn("px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border",
                                    acc.status === 'Active' ? "bg-blue-500/10 text-blue-500 border-blue-500/20" :
                                        acc.status === 'Passed' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                                            "bg-red-500/10 text-red-500 border-red-500/20"
                                )}>
                                    {acc.status}
                                </div>
                            </div>

                            <div className="flex items-end justify-between">
                                <div>
                                    <p className="text-[10px] uppercase font-bold text-muted-foreground mb-0.5 opacity-70">Starting Balance</p>
                                    <p className="text-2xl font-black text-foreground tracking-tight">
                                        {acc.currency === 'USD' ? '$' : acc.currency === 'EUR' ? '€' : '£'}
                                        {acc.start_amount.toLocaleString()}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => openEditAccount(acc)} className="p-2 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground transition-colors">
                                        <Settings2 size={16} />
                                    </button>
                                    <button onClick={() => handleDeleteTradingAccount(acc.id)} className="p-2 hover:bg-red-500/10 rounded-lg text-muted-foreground hover:text-red-500 transition-colors">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}

                    {accounts.length === 0 && (
                        <div className="col-span-full py-12 text-center border-2 border-dashed border-border/50 rounded-xl hover:bg-muted/5 transition-colors cursor-pointer" onClick={openAddAccount}>
                            <Wallet className="mx-auto text-muted-foreground mb-3 opacity-30" size={40} />
                            <h3 className="text-sm font-bold text-foreground">No accounts linked</h3>
                            <p className="text-xs text-muted-foreground mt-1">Add your first trading account to start tracking.</p>
                        </div>
                    )}
                </div>
            </section>

            {/* 3. Security Section (Change Password) */}
            <section className="glass-panel p-6 rounded-2xl space-y-6">
                <div className="flex items-center gap-2 text-primary uppercase font-bold text-xs tracking-wider">
                    <Lock size={14} /> Security
                </div>
                <form onSubmit={handlePasswordChange} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-semibold uppercase text-muted-foreground">New Password</label>
                            <input
                                type="password"
                                value={passData.password}
                                onChange={(e) => setPassData({ ...passData, password: e.target.value })}
                                placeholder="••••••••"
                                className="w-full bg-background/50 border border-border rounded-xl px-4 py-3 text-foreground outline-none focus:border-primary transition-colors"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-semibold uppercase text-muted-foreground">Confirm Password</label>
                            <input
                                type="password"
                                value={passData.confirm}
                                onChange={(e) => setPassData({ ...passData, confirm: e.target.value })}
                                placeholder="••••••••"
                                className="w-full bg-background/50 border border-border rounded-xl px-4 py-3 text-foreground outline-none focus:border-primary transition-colors"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end pt-2">
                        <button
                            type="submit"
                            disabled={passLoading || !passData.password}
                            className="bg-transparent border border-border hover:bg-muted text-foreground font-bold px-6 py-3 rounded-xl flex items-center gap-2 transition-all disabled:opacity-50"
                        >
                            {passLoading ? <Loader2 className="animate-spin" size={16} /> : <ShieldCheck size={16} />}
                            Update Password
                        </button>
                    </div>
                </form>
            </section>

            {/* Global Message Display */}
            {message && (
                <div className={`p-4 rounded-xl flex items-center gap-3 animate-in slide-in-from-top-2 border ${message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-red-500/10 border-red-500/20 text-red-500'}`}>
                    {message.type === 'success' ? <Shield size={20} /> : <AlertTriangle size={20} />}
                    <span className="font-medium">{message.text}</span>
                </div>
            )}

            {/* 4. Danger Zone */}
            <div className="p-6 rounded-2xl border border-dashed border-destructive/30 hover:bg-destructive/5 transition-colors space-y-4">
                <h3 className="font-bold text-destructive flex items-center gap-2 text-sm uppercase">
                    <AlertTriangle size={16} /> Danger Zone
                </h3>

                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <h3 className="text-foreground font-medium text-sm">Delete Account</h3>
                        <p className="text-xs text-muted-foreground">
                            This action is <span className="text-destructive font-bold">irreversible</span>. It will permanently delete your profile, trades, and journal entries.
                        </p>
                    </div>

                    <button
                        onClick={() => setShowDeleteModal(true)}
                        className="bg-destructive/10 hover:bg-destructive/20 text-destructive border border-destructive/30 px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2"
                    >
                        <Trash2 size={16} /> Delete Account
                    </button>
                </div>
            </div>

            <div className="flex justify-center pt-8">
                <button onClick={handleSignOut} className="text-muted-foreground hover:text-foreground flex items-center gap-2 transition-colors font-bold text-sm uppercase tracking-wider">
                    <LogOut size={16} /> Sign Out
                </button>
            </div>

            {/* DELETE MODAL (PORTAL) */}
            {showDeleteModal && portalRoot && createPortal(
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
                    <div className="bg-background/95 backdrop-blur-xl border border-destructive/20 w-full max-w-md rounded-3xl shadow-2xl p-6 space-y-6 relative animate-in zoom-in-95 duration-300 ring-1 ring-destructive/10">
                        <button
                            onClick={() => setShowDeleteModal(false)}
                            className="absolute top-4 right-4 text-pip-muted hover:text-pip-text transition-colors"
                        >
                            <X size={20} />
                        </button>

                        <div className="flex flex-col items-center text-center space-y-2">
                            <div className="w-16 h-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mb-2 animate-bounce">
                                <Trash2 size={32} />
                            </div>
                            <h3 className="text-2xl font-black text-foreground tracking-tight">Delete Account?</h3>
                            <p className="text-muted-foreground font-medium">
                                Are you absolutely sure? This action cannot be undone. All your data will be lost forever.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-3 pt-2">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="px-4 py-3 rounded-xl font-bold border border-border hover:bg-muted text-foreground transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteAccount}
                                disabled={deleteLoading}
                                className="px-4 py-3 rounded-xl font-bold bg-destructive hover:bg-destructive/90 text-white transition-all flex items-center justify-center gap-2 shadow-lg shadow-destructive/20"
                            >
                                {deleteLoading ? <Loader2 className="animate-spin" size={18} /> : "Yes, Delete Everything"}
                            </button>
                        </div>
                    </div>
                </div>,
                portalRoot
            )}

            {/* ACCOUNT MODAL (PORTAL) */}
            {isAccountModalOpen && portalRoot && createPortal(
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
                    <div className="bg-background/95 backdrop-blur-xl border border-border w-full max-w-lg rounded-3xl shadow-2xl p-0 overflow-hidden relative animate-in zoom-in-95 duration-300 flex flex-col">
                        <div className="p-6 border-b border-border/50 flex justify-between items-center bg-muted/30">
                            <h3 className="text-xl font-black uppercase italic flex items-center gap-2 tracking-tighter">
                                <CreditCard className="text-primary" size={20} /> {editingAccount ? 'Edit Account' : 'Add Account'}
                            </h3>
                            <button onClick={() => setIsAccountModalOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6">
                            <form id="accountForm" onSubmit={handleSaveAccount} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Account Name</label>
                                    <input
                                        required
                                        value={accForm.name}
                                        onChange={e => setAccForm({ ...accForm, name: e.target.value })}
                                        className="w-full bg-background/50 border border-border rounded-xl px-4 py-3 outline-none focus:border-primary transition-colors"
                                        placeholder="e.g. My FTMO Challenge"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Type</label>
                                        <CustomSelect
                                            value={accForm.type}
                                            onChange={val => setAccForm({ ...accForm, type: val })}
                                            options={['Funded', 'Challenge', 'Demo', 'Personal', 'Live']}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Status</label>
                                        <CustomSelect
                                            value={accForm.status}
                                            onChange={val => setAccForm({ ...accForm, status: val })}
                                            options={['Active', 'Passed', 'Blown', 'Failed']}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Start Balance</label>
                                        <input
                                            type="number"
                                            required
                                            value={accForm.start_amount}
                                            onChange={e => setAccForm({ ...accForm, start_amount: e.target.value })}
                                            className="w-full bg-background/50 border border-border rounded-xl px-4 py-3 outline-none focus:border-primary transition-colors"
                                            placeholder="10000"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Currency</label>
                                        <div className="flex bg-background/50 border border-border rounded-xl overflow-hidden">
                                            {['USD', 'EUR', 'GBP'].map(c => (
                                                <button
                                                    key={c}
                                                    type="button"
                                                    onClick={() => setAccForm({ ...accForm, currency: c })}
                                                    className={cn("flex-1 py-3 text-xs font-bold transition-colors", accForm.currency === c ? "bg-primary text-white" : "hover:bg-muted text-muted-foreground")}
                                                >
                                                    {c}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>

                        <div className="p-6 border-t border-border/50 bg-muted/20 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setIsAccountModalOpen(false)}
                                className="px-6 py-3 rounded-xl font-bold hover:bg-muted/50 text-muted-foreground"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                form="accountForm"
                                disabled={accLoading}
                                className="px-8 py-3 rounded-xl font-bold bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25 flex items-center gap-2"
                            >
                                {accLoading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                                Save Account
                            </button>
                        </div>
                    </div>
                </div>,
                portalRoot
            )}

        </div>
    );
}

// Import fix for ShieldCheck
import { ShieldCheck } from "lucide-react";
