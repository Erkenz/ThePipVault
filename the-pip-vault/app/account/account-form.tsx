"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { Loader2, Save, LogOut, Trash2, AlertTriangle, Shield, User, Lock, X } from "lucide-react";
import { useProfile } from "@/context/ProfileContext";

export default function AccountForm({ user, profile }: { user: any, profile: any }) {
    const supabase = createClient();
    const router = useRouter();
    const { updateProfile, resetFullAccount } = useProfile();

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

    return (
        <div className="space-y-8">

            {/* 1. Profile Section */}
            <div className="bg-pip-card border border-pip-border rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <User className="text-pip-gold" size={20} /> Identity
                </h2>

                <form onSubmit={handleUpdate} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-pip-muted uppercase">First Name</label>
                            <input
                                type="text"
                                value={formData.firstName}
                                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                className="w-full bg-pip-dark border border-pip-border rounded-lg px-4 py-2 text-white outline-none focus:border-pip-gold"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-pip-muted uppercase">Last Name</label>
                            <input
                                type="text"
                                value={formData.lastName}
                                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                className="w-full bg-pip-dark border border-pip-border rounded-lg px-4 py-2 text-white outline-none focus:border-pip-gold"
                            />
                        </div>
                    </div>

                    <div className="space-y-2 opacity-70 pointer-events-none">
                        <label className="text-xs font-bold text-pip-muted uppercase flex items-center gap-2">
                            Email <Shield size={10} /> <span className="text-[10px] font-normal normal-case opacity-70">(Read-only)</span>
                        </label>
                        <input
                            type="text"
                            value={user.email}
                            readOnly
                            className="w-full bg-pip-dark/50 border border-pip-border rounded-lg px-4 py-2 text-pip-muted outline-none cursor-not-allowed"
                        />
                    </div>

                    <div className="flex justify-end pt-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-pip-gold hover:bg-pip-gold-dim text-pip-dark font-bold px-6 py-2 rounded-lg flex items-center gap-2 transition-all disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                            Save Details
                        </button>
                    </div>
                </form>
            </div>

            {/* 2. Security Section (Change Password) */}
            <div className="bg-pip-card border border-pip-border rounded-xl p-6 shadow-sm">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Lock className="text-pip-gold" size={20} /> Security
                </h2>
                <form onSubmit={handlePasswordChange} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-pip-muted uppercase">New Password</label>
                            <input
                                type="password"
                                value={passData.password}
                                onChange={(e) => setPassData({ ...passData, password: e.target.value })}
                                placeholder="••••••••"
                                className="w-full bg-pip-dark border border-pip-border rounded-lg px-4 py-2 text-white outline-none focus:border-pip-gold"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-pip-muted uppercase">Confirm Password</label>
                            <input
                                type="password"
                                value={passData.confirm}
                                onChange={(e) => setPassData({ ...passData, confirm: e.target.value })}
                                placeholder="••••••••"
                                className="w-full bg-pip-dark border border-pip-border rounded-lg px-4 py-2 text-white outline-none focus:border-pip-gold"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end pt-2">
                        <button
                            type="submit"
                            disabled={passLoading || !passData.password}
                            className="bg-pip-dark border border-pip-border hover:border-pip-gold text-white font-bold px-6 py-2 rounded-lg flex items-center gap-2 transition-all disabled:opacity-50"
                        >
                            {passLoading ? <Loader2 className="animate-spin" size={16} /> : <ShieldCheck size={16} />}
                            Update Password
                        </button>
                    </div>
                </form>
            </div>

            {/* Global Message Display */}
            {message && (
                <div className={`p-4 rounded-xl flex items-center gap-3 animate-in slide-in-from-top-2 ${message.type === 'success' ? 'bg-pip-green/10 border border-pip-green/20 text-pip-green' : 'bg-pip-red/10 border border-pip-red/20 text-pip-red'}`}>
                    {message.type === 'success' ? <Shield size={20} /> : <AlertTriangle size={20} />}
                    <span className="font-medium">{message.text}</span>
                </div>
            )}

            {/* 3. Danger Zone */}
            <div className="bg-pip-red/5 border border-pip-red/20 rounded-xl p-6">
                <h2 className="text-xl font-bold text-pip-red mb-4 flex items-center gap-2">
                    <AlertTriangle size={20} /> Danger Zone
                </h2>

                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <h3 className="text-white font-medium">Delete Account</h3>
                        <p className="text-sm text-pip-muted">
                            This action is <span className="text-pip-red font-bold">irreversible</span>. It will permanently delete your profile, trades, and journal entries.
                        </p>
                    </div>

                    <button
                        onClick={() => setShowDeleteModal(true)}
                        className="bg-pip-red/10 hover:bg-pip-red/20 text-pip-red border border-pip-red/30 px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2"
                    >
                        <Trash2 size={16} /> Delete Account
                    </button>
                </div>
            </div>

            <div className="flex justify-center pt-8">
                <button onClick={handleSignOut} className="text-pip-muted hover:text-white flex items-center gap-2 transition-colors">
                    <LogOut size={16} /> Sign Out
                </button>
            </div>

            {/* DELETE MODAL (PORTAL) */}
            {showDeleteModal && portalRoot && createPortal(
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-pip-card border border-pip-border w-full max-w-md rounded-2xl shadow-2xl p-6 space-y-6 relative animate-in zoom-in-95 duration-200">
                        <button
                            onClick={() => setShowDeleteModal(false)}
                            className="absolute top-4 right-4 text-pip-muted hover:text-white transition-colors"
                        >
                            <X size={20} />
                        </button>

                        <div className="flex flex-col items-center text-center space-y-2">
                            <div className="w-16 h-16 bg-pip-red/20 text-pip-red rounded-full flex items-center justify-center mb-2">
                                <Trash2 size={32} />
                            </div>
                            <h3 className="text-2xl font-bold text-white">Delete Account?</h3>
                            <p className="text-pip-muted">
                                Are you absolutely sure? This action cannot be undone. All your data will be lost forever.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-3 pt-2">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="px-4 py-3 rounded-xl font-bold border border-pip-border hover:bg-pip-dark text-white transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteAccount}
                                disabled={deleteLoading}
                                className="px-4 py-3 rounded-xl font-bold bg-pip-red hover:bg-red-600 text-white transition-all flex items-center justify-center gap-2"
                            >
                                {deleteLoading ? <Loader2 className="animate-spin" size={18} /> : "Yes, Delete Everything"}
                            </button>
                        </div>
                    </div>
                </div>,
                portalRoot
            )}

        </div>
    );
}
// Import fix for ShieldCheck in password form
import { ShieldCheck } from "lucide-react";
