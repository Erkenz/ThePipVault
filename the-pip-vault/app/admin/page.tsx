import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import {
    Users,
    Activity,
    TrendingUp,
    ShieldAlert
} from "lucide-react";

// Types for our dashboard data
interface DashboardStats {
    totalUsers: number;
    totalTrades: number;
    platformPnl: number; // Placeholder for now
}

export default async function AdminDashboard() {
    const supabase = await createClient();

    // 1. Auth Check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        redirect("/login");
    }

    // 2. Role Check
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

    if (!profile || profile.role !== 'admin') {
        redirect("/");
    }

    // 3. Fetch Stats
    // User Count
    const { count: userCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

    // Trade Count
    const { count: tradeCount } = await supabase
        .from('trades')
        .select('*', { count: 'exact', head: true });

    // Fetch Recent Users
    const { data: recentUsers } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-pip-text flex items-center gap-2">
                        <ShieldAlert className="text-pip-gold" />
                        Admin Command Center
                    </h1>
                    <p className="text-pip-muted text-sm mt-1">
                        Platform Overview & User Management
                    </p>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Total Users */}
                <div className="bg-pip-card border border-pip-border p-6 rounded-2xl relative overflow-hidden group hover:border-pip-gold/50 transition-colors">
                    <div className="relative z-10">
                        <h3 className="text-pip-muted text-sm font-medium mb-1">Total Users</h3>
                        <div className="text-3xl font-bold text-white mb-2">{userCount || 0}</div>
                    </div>
                    <Users className="absolute right-4 top-4 text-pip-muted/10 group-hover:text-pip-gold/20 transition-colors" size={64} />
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-pip-gold/0 via-pip-gold/50 to-pip-gold/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                {/* Total Trades */}
                <div className="bg-pip-card border border-pip-border p-6 rounded-2xl relative overflow-hidden group hover:border-pip-blue/50 transition-colors">
                    <div className="relative z-10">
                        <h3 className="text-pip-muted text-sm font-medium mb-1">Total Trades Logged</h3>
                        <div className="text-3xl font-bold text-white mb-2">{tradeCount || 0}</div>
                    </div>
                    <Activity className="absolute right-4 top-4 text-pip-muted/10 group-hover:text-pip-blue/20 transition-colors" size={64} />
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-pip-blue/0 via-pip-blue/50 to-pip-blue/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                {/* System Status (Static for now) */}
                <div className="bg-pip-card border border-pip-border p-6 rounded-2xl relative overflow-hidden group hover:border-pip-green/50 transition-colors">
                    <div className="relative z-10">
                        <h3 className="text-pip-muted text-sm font-medium mb-1">System Status</h3>
                        <div className="text-3xl font-bold text-pip-green mb-2">Healthy</div>
                    </div>
                    <TrendingUp className="absolute right-4 top-4 text-pip-muted/10 group-hover:text-pip-green/20 transition-colors" size={64} />
                </div>
            </div>

            {/* Recent Users Table */}
            <div className="pt-6 border-t border-pip-border space-y-4">
                <h2 className="text-xl font-bold text-white">Recent Users</h2>
                <div className="bg-pip-card border border-pip-border rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-pip-active/50 text-pip-muted text-sm">
                                <tr>
                                    <th className="p-4 font-medium">User ID</th>
                                    <th className="p-4 font-medium">Role</th>
                                    <th className="p-4 font-medium">Joined</th>
                                    <th className="p-4 font-medium">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-pip-border">
                                {recentUsers?.map((user) => (
                                    <tr key={user.id} className="hover:bg-pip-active/20 transition-colors text-sm">
                                        <td className="p-4 text-pip-text font-mono truncate max-w-[200px]" title={user.id}>
                                            {user.id}
                                        </td>
                                        <td className="p-4 text-pip-text">
                                            <span className={`px-2 py-1 rounded-full text-xs border ${user.role === 'admin'
                                                    ? 'bg-pip-gold/10 border-pip-gold/30 text-pip-gold'
                                                    : 'bg-pip-border/50 border-pip-border text-pip-muted'
                                                }`}>
                                                {user.role || 'user'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-pip-muted">
                                            {new Date(user.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="p-4">
                                            <span className="text-pip-green flex items-center gap-1 text-xs">
                                                <div className="w-1.5 h-1.5 rounded-full bg-pip-green animate-pulse" />
                                                Active
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {(!recentUsers || recentUsers.length === 0) && (
                                    <tr>
                                        <td colSpan={4} className="p-8 text-center text-pip-muted">
                                            No users found.
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
