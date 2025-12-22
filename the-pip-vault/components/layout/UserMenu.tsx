"use client";

import { useState, useRef, useEffect } from 'react';
import { signOut } from '@/app/login/actions';
import { User, Settings, ShieldCheck, LogOut, ChevronDown } from 'lucide-react';
import Link from 'next/link';

const UserMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Sluit menu als je er buiten klikt
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-pip-dark border border-transparent hover:border-pip-border transition-all"
      >
        <div className="w-8 h-8 bg-pip-dark border border-pip-border rounded-full flex items-center justify-center text-pip-gold">
          <User size={18} />
        </div>
        <ChevronDown size={14} className={`text-pip-muted transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-pip-card border border-pip-border rounded-xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
          <div className="px-4 py-2 border-b border-pip-border mb-1">
            <p className="text-xs text-pip-muted uppercase font-bold tracking-widest">User Menu</p>
          </div>
          
          <MenuLink href="/account" icon={<ShieldCheck size={16} />} label="Account Info" />
          <MenuLink href="/settings" icon={<Settings size={16} />} label="Settings" />
          
          <div className="border-t border-pip-border mt-1 pt-1">
            <button 
              onClick={signOut}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-pip-red hover:bg-pip-red/10 transition-colors"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const MenuLink = ({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) => (
  <Link 
    href={href} 
    className="flex items-center gap-2 px-4 py-2 text-sm text-pip-muted hover:text-white hover:bg-pip-dark transition-colors"
  >
    {icon}
    {label}
  </Link>
);

export default UserMenu;