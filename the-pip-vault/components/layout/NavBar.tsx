"use client";

import Link from 'next/link';
import { LayoutDashboard, PlusCircle, LineChart, BookOpen, User } from 'lucide-react';
import { usePathname } from 'next/navigation';

const Navbar = () => {
  const pathname = usePathname();

  return (
    <nav className="border-b border-pip-border bg-pip-card/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* LOGO */}
          <div className="shrink-0 flex items-center gap-2">
            <div className="w-8 h-8 bg-pip-gold rounded-md flex items-center justify-center">
              <span className="text-pip-dark font-bold text-lg">P</span>
            </div>
            <Link href="/" className="text-xl font-bold tracking-wider text-white">
              THE <span className="text-pip-gold">PIPLAB</span>
            </Link>
          </div>

          {/* DESKTOP MENU */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-6">
              <NavLink href="/" icon={<LayoutDashboard size={18} />} label="Dashboard" active={pathname === "/"} />
              <NavLink href="/journal" icon={<BookOpen size={18} />} label="Journal" active={pathname === "/journal"} />
              <NavLink href="/analytics" icon={<LineChart size={18} />} label="Analytics" active={pathname === "/analytics"} />
            </div>
          </div>

          {/* RIGHT: ACTIONS & PROFILE */}
          <div className="flex items-center gap-4">
            <button className="bg-pip-gold hover:bg-pip-gold-dim text-pip-dark font-bold py-2 px-4 rounded-md flex items-center gap-2 transition-all shadow-[0_0_10px_rgba(212,175,55,0.2)] hover:shadow-[0_0_15px_rgba(212,175,55,0.4)]">
              <PlusCircle size={18} />
              <span className="hidden sm:inline">New Trade</span>
            </button>
            
            <div className="w-9 h-9 rounded-full bg-pip-border flex items-center justify-center text-pip-muted hover:text-pip-gold cursor-pointer transition-colors">
               <User size={20} />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

const NavLink = ({ href, icon, label, active }: { href: string; icon: React.ReactNode; label: string; active: boolean }) => (
  <Link 
    href={href} 
    className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200
      ${active 
        ? 'text-pip-gold bg-pip-gold/10' 
        : 'text-pip-muted hover:text-pip-text hover:bg-white/5'
      }`}
  >
    {icon}
    <span>{label}</span>
  </Link>
);

export default Navbar;