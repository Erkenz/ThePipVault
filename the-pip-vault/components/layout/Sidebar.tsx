"use client";

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
    LayoutDashboard,
    BookOpen,
    BarChart2,
    ShieldAlert,
    Settings,
    LogOut,
    Plus,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import { useProfile } from '@/context/ProfileContext';
import { ThemeToggle } from '../ui/ThemeToggle';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import AddTradeModal from '../modals/AddTradeModal';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

export default function Sidebar() {
    const pathname = usePathname();
    const { profile } = useProfile();
    const [collapsed, setCollapsed] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    // Hide on auth pages
    if (pathname === '/login' || pathname === '/register') return null;

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push('/login');
    };

    return (
        <>
            <aside
                className={cn(
                    "fixed left-0 top-0 z-40 h-screen border-r border-border bg-card/95 backdrop-blur-sm transition-all duration-300 flex flex-col",
                    collapsed ? "w-[80px]" : "w-[280px]"
                )}
            >
                {/* Header */}
                <div className="h-20 flex items-center px-6 border-b border-border/50">
                    <Link href="/" className="flex items-center gap-3 overflow-hidden">
                        <div className="w-9 h-9 bg-gradient-to-br from-primary to-blue-600 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-blue-900/20">
                            <span className="text-white font-black text-xl">P</span>
                        </div>
                        {!collapsed && (
                            <span className="font-bold text-xl tracking-tight text-foreground whitespace-nowrap">
                                PipVault <span className="text-primary text-xs align-top">PRO</span>
                            </span>
                        )}
                    </Link>
                </div>

                {/* Action Button */}
                <div className="p-4">
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className={cn(
                            "w-full bg-primary hover:bg-primary/90 text-white font-bold rounded-xl transition-all shadow-lg shadow-primary/20 flex items-center justify-center",
                            collapsed ? "h-12 w-12 p-0" : "h-12 px-4 gap-2"
                        )}
                    >
                        <Plus size={20} />
                        {!collapsed && <span>NEW TRADE</span>}
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                    <SidebarLink
                        href="/"
                        icon={<LayoutDashboard size={20} />}
                        label="Dashboard"
                        active={pathname === '/'}
                        collapsed={collapsed}
                    />
                    <SidebarLink
                        href="/journal"
                        icon={<BookOpen size={20} />}
                        label="Journal"
                        active={pathname === '/journal'}
                        collapsed={collapsed}
                    />
                    <SidebarLink
                        href="/analytics"
                        icon={<BarChart2 size={20} />}
                        label="Analytics"
                        active={pathname === '/analytics'}
                        collapsed={collapsed}
                    />

                    {profile.role === 'admin' && (
                        <SidebarLink
                            href="/admin"
                            icon={<ShieldAlert size={20} />}
                            label="Admin Panel"
                            active={pathname === '/admin'}
                            collapsed={collapsed}
                        />
                    )}

                    <div className="my-4 h-px bg-border/50 mx-2" />

                    <SidebarLink
                        href="/settings"
                        icon={<Settings size={20} />}
                        label="Settings"
                        active={pathname === '/settings'}
                        collapsed={collapsed}
                    />
                </nav>

                {/* Footer */}
                <div className="p-4 border-t border-border/50 space-y-4">
                    {/* Collapse Toggle */}
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="w-full flex items-center justify-center p-2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                        {collapsed ? <ChevronRight size={16} /> : (
                            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider">
                                <ChevronLeft size={16} /> Collapse
                            </div>
                        )}
                    </button>

                    <div className={cn("flex items-center gap-3", collapsed ? "flex-col" : "justify-between")}>
                        <ThemeToggle />
                        <button
                            onClick={handleSignOut}
                            className="p-2 text-muted-foreground hover:text-destructive transition-colors rounded-lg hover:bg-muted"
                            title="Sign Out"
                        >
                            <LogOut size={20} />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Spacer for main content to sit right of fixed sidebar */}
            <div className={cn("transition-all duration-300", collapsed ? "w-[80px]" : "w-[280px]")} />

            <AddTradeModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </>
    );
}

function SidebarLink({ href, icon, label, active, collapsed }: { href: string, icon: React.ReactNode, label: string, active: boolean, collapsed: boolean }) {
    return (
        <Link
            href={href}
            className={cn(
                "flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative",
                active
                    ? "bg-primary/10 text-primary font-semibold"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
        >
            <div className={cn("transition-colors", active ? "text-primary" : "text-muted-foreground group-hover:text-foreground")}>
                {icon}
            </div>

            {!collapsed && <span>{label}</span>}

            {/* Active Indicator Strip */}
            {active && !collapsed && (
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-l-full" />
            )}

            {/* Tooltip for collapsed state */}
            {collapsed && (
                <div className="absolute left-full ml-4 px-2 py-1 bg-popover text-popover-foreground text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 border border-border">
                    {label}
                </div>
            )}
        </Link>
    );
}
