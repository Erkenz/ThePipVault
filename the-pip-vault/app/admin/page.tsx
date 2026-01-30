import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { redirect } from "next/navigation";
import {
    Users,
    Activity,
    TrendingUp,
    ShieldAlert,
    CheckCircle,
    Server,
    Search
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardStats {
    totalUsers: number;
    totalTrades: number;
    platformPnl: number;
}

export default async function AdminDashboard() {
    const supabase = await createClient();
    const adminAuthClient = createAdminClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        redirect("/login");
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (!profile || profile.role !== 'admin') {
        redirect("/");
    }

    const { count: userCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

    const { count: tradeCount } = await supabase
        .from('trades')
        .select('*', { count: 'exact', head: true });

    const { data: { users: authUsers }, error: authError } = await adminAuthClient.auth.admin.listUsers();

    const { data: profiles } = await supabase
        .from('profiles')
        .select('*');

    const mergedUsers = authUsers?.map(user => {
        const userProfile = profiles?.find(p => p.id === user.id);
        return {
            id: user.id,
            email: user.email,
            created_at: user.created_at,
            last_sign_in: user.last_sign_in_at,
            role: userProfile?.role || 'user',
            ...userProfile
        };
    }) || [];

    mergedUsers.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-12">
            <div>
                <h1 className="text-4xl font-black tracking-tighter uppercase italic text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500 flex items-center gap-3">
                    <ShieldAlert className="text-red-500" />
                    Admin Console
                </h1>
                <p className="text-muted-foreground font-medium mt-1">
                    Platform Overview & User Management Permissions.
                </p>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Total Users */}
                <div className="glass-panel group p-6 rounded-2xl relative overflow-hidden transition-all hover:border-emerald-500/30">
                    <div className="relative z-10">
                        <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Total Users</h3>
                        <div className="text-4xl font-black text-foreground">{userCount || 0}</div>
                        <div className="mt-2 text-xs text-emerald-500 font-bold flex items-center gap-1">
                            <TrendingUp size={12} /> +12% this month
                        </div>
                    </div>
                    <Users className="absolute right-4 top-4 text-emerald-500 opacity-10 group-hover:opacity-20 transition-opacity transform scale-150" />
                    <div className="absolute right-0 bottom-0 w-32 h-32 bg-emerald-500/5 blur-3xl rounded-full translate-x-10 translate-y-10" />
                </div>

                {/* Total Trades */}
                <div className="glass-panel group p-6 rounded-2xl relative overflow-hidden transition-all hover:border-blue-500/30">
                    <div className="relative z-10">
                        <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Trades Logged</h3>
                        <div className="text-4xl font-black text-foreground">{tradeCount || 0}</div>
                        <div className="mt-2 text-xs text-blue-500 font-bold flex items-center gap-1">
                            <Activity size={12} /> Active Platform
                        </div>
                    </div>
                    <Activity className="absolute right-4 top-4 text-blue-500 opacity-10 group-hover:opacity-20 transition-opacity transform scale-150" />
                    <div className="absolute right-0 bottom-0 w-32 h-32 bg-blue-500/5 blur-3xl rounded-full translate-x-10 translate-y-10" />
                </div>

                {/* System Status */}
                <div className="glass-panel group p-6 rounded-2xl relative overflow-hidden transition-all hover:border-primary/30">
                    <div className="relative z-10">
                        <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">System Status</h3>
                        <div className="text-4xl font-black text-emerald-500 flex items-center gap-3">
                            Healthy
                            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                        </div>
                        <div className="mt-2 text-xs text-muted-foreground font-mono">
                            v2.4.0-stable
                        </div>
                    </div>
                    <Server className="absolute right-4 top-4 text-primary opacity-10 group-hover:opacity-20 transition-opacity transform scale-150" />
                </div>
            </div>

            {/* Recent Users Table */}
            <div className="pt-6 border-t border-border/50 space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                        <Users size={20} className="text-primary" />
                        User Database
                    </h2>
                    <div className="relative max-w-sm w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                        <input
                            type="text"
                            placeholder="Search users..."
                            className="w-full bg-background/50 border border-border/50 rounded-xl pl-10 pr-4 py-2 text-sm outline-none focus:border-primary transition-colors"
                        />
                    </div>
                </div>

                <div className="glass-panel rounded-2xl overflow-hidden shadow-lg">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-muted/30 text-xs uppercase font-bold text-muted-foreground tracking-wider">
                                <tr>
                                    <th className="p-5 font-bold">User Identity</th>
                                    <th className="p-5 font-bold">Role</th>
                                    <th className="p-5 font-bold">Joined</th>
                                    <th className="p-5 font-bold text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/30">
                                {mergedUsers.map((user) => (
                                    <tr key={user.id} className="group hover:bg-muted/20 transition-colors text-sm">
                                        <td className="p-5">
                                            <div className="flex flex-col">
                                                <span className="text-foreground font-bold group-hover:text-primary transition-colors">{user.email}</span>
                                                <span className="text-muted-foreground text-[10px] font-mono opacity-70">{user.id}</span>
                                            </div>
                                        </td>
                                        <td className="p-5">
                                            <span className={cn(
                                                "px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wide border",
                                                user.role === 'admin'
                                                    ? "bg-red-500/10 text-red-500 border-red-500/20"
                                                    : "bg-blue-500/10 text-blue-500 border-blue-500/20"
                                            )}>
                                                {user.role || 'user'}
                                            </span>
                                        </td>
                                        <td className="p-5 text-muted-foreground font-medium">
                                            {new Date(user.created_at).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                                        </td>
                                        <td className="p-5 text-right">
                                            <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                                                <CheckCircle size={10} />
                                                <span className="text-[10px] font-bold uppercase">Active</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {mergedUsers.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="p-12 text-center text-muted-foreground">
                                            No users found in database.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

        </div>
    );
}
