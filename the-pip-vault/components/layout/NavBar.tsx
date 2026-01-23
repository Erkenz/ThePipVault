"use client";

import { usePathname } from 'next/navigation';
import { Plus, LayoutDashboard, BookOpen, ShieldAlert } from 'lucide-react';
import { useState } from 'react';
import AddTradeModal from '../modals/AddTradeModal';
import Link from 'next/link';
import UserMenu from './UserMenu';
import { useProfile } from '@/context/ProfileContext';
import { ThemeToggle } from '../ui/ThemeToggle';

const NavBar = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const pathname = usePathname();

  if (pathname === '/login' || pathname === '/register') return null;

  return (
    <nav className="border-b border-pip-border bg-pip-card/50 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">

          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-pip-gold rounded flex items-center justify-center">
                <span className="text-pip-dark font-black text-xl">P</span>
              </div>
              <span className="text-pip-text font-bold tracking-tighter hidden sm:block uppercase">The PipVault</span>
            </Link>

            <div className="hidden md:flex items-center gap-1">
              <NavLink href="/" icon={<LayoutDashboard size={18} />} label="Dashboard" active={pathname === '/'} />
              <NavLink href="/journal" icon={<BookOpen size={18} />} label="Journal" active={pathname === '/journal'} />
              <AdminLink />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-pip-gold hover:bg-pip-gold-dim text-pip-dark px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-all active:scale-95 text-sm"
            >
              <Plus size={18} />
              <span className="hidden sm:inline">New Trade</span>
            </button>

            {/* HET NIEUWE USER MENU */}
            <UserMenu />
            <ThemeToggle />
          </div>
        </div>
      </div>

      <AddTradeModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </nav>
  );
};

const NavLink = ({ href, icon, label, active }: { href: string; icon: React.ReactNode; label: string; active: boolean }) => (

  <Link
    href={href}
    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${active ? 'text-pip-gold bg-pip-gold/10' : 'text-pip-muted hover:text-pip-text hover:bg-pip-active'
      }`}
  >
    {icon}
    {label}
  </Link>
);

const AdminLink = () => {
  const { profile } = useProfile();
  const pathname = usePathname();

  if (profile.role !== 'admin') return null;

  return (
    <NavLink
      href="/admin"
      icon={<ShieldAlert size={18} />}
      label="Admin"
      active={pathname === '/admin'}
    />
  );
};

export default NavBar;