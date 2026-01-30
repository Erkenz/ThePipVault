"use client";

import { useState } from 'react';
import { X, AlertTriangle, Trash2, RotateCcw, ShieldAlert, Loader2 } from 'lucide-react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

interface ResetVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResetTrades: () => Promise<void>;
  onResetSettings: () => Promise<void>;
  onResetAll: () => Promise<void>;
}

const ResetVaultModal = ({ isOpen, onClose, onResetTrades, onResetSettings, onResetAll }: ResetVaultModalProps) => {
  const [loading, setLoading] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAction = async (action: string, fn: () => Promise<void>, title: string, text: string) => {
    onClose(); // Close the selection modal first

    MySwal.fire({
      title: <span className="text-xl font-black tracking-tight text-white">{title}</span>,
      html: <p className="text-sm text-muted-foreground/80 font-medium">{text}</p>,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Reset',
      cancelButtonText: 'Cancel',

      // Modern Glass Styling
      background: 'rgba(15, 23, 42, 0.6)',
      color: '#f8fafc',
      backdrop: `rgba(0,0,0,0.6) backdrop-blur-sm`,

      customClass: {
        popup: 'border border-border/30 rounded-3xl backdrop-blur-xl shadow-2xl',
        confirmButton: 'bg-rose-500 hover:bg-rose-600 text-white font-bold py-2.5 px-6 rounded-xl text-sm transition-all transform hover:scale-105 shadow-lg shadow-rose-500/20',
        cancelButton: 'bg-muted/50 hover:bg-muted text-gray-300 font-bold py-2.5 px-6 rounded-xl text-sm transition-all hover:text-white',
        actions: 'gap-3',
        icon: 'border-none text-rose-500'
      },
      buttonsStyling: false
    }).then(async (result) => {
      if (result.isConfirmed) {
        setLoading(action);
        try {
          await fn();
          MySwal.fire({
            title: 'Reset Complete!',
            text: 'Your vault data has been reset.',
            icon: 'success',
            timer: 1500,
            showConfirmButton: false,
            background: 'rgba(15, 23, 42, 0.8)',
            color: '#fff',
            customClass: {
              popup: 'border border-emerald-500/20 rounded-3xl backdrop-blur-xl'
            }
          });
        } catch (error) {
          console.error(error);
          MySwal.fire({
            title: 'Error',
            text: 'Failed to reset data.',
            icon: 'error',
            background: '#1e293b',
            color: '#fff'
          });
        } finally {
          setLoading(null);
        }
      } else {
        // If cancelled, reopen the main modal or just stay closed? 
        // User probably expects to just go back to the app if they cancelled the specific "Are you sure?"
        // But maybe we should re-open the selection modal? 
        // For now, let's just leave it closed or we can re-open.
        // Let's re-open for better UX if they mis-clicked.
        // Actually, re-opening might be annoying. Let's effectively "cancel" the whole flow.
        // But wait, the original modal was a "selection menu".
      }
    });
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-[#0f172a] border border-red-500/20 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-red-500/5">
          <div className="flex items-center gap-3 text-red-500">
            <ShieldAlert size={24} />
            <h2 className="text-xl font-black uppercase italic tracking-tighter">Danger Zone: Reset Vault</h2>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-sm text-muted-foreground mb-6">
            Select data to wipe. Note: these actions are final and cannot be undone.
          </p>

          {/* Optie 1: Alleen Trades */}
          <button
            disabled={!!loading}
            onClick={() => handleAction('trades', onResetTrades, 'Reset Trade History?', 'This will permanently delete all your logged trades. Your account settings and balance will remain.')}
            className="w-full group flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/5 hover:border-red-500/50 hover:bg-red-500/5 transition-all text-left"
          >
            <div className="flex items-center gap-4">
              <div className="p-2 bg-red-500/10 rounded-lg text-red-500 group-hover:bg-red-500 group-hover:text-white transition-colors">
                <Trash2 size={20} />
              </div>
              <div>
                <p className="font-bold text-white uppercase text-xs">Reset Trade History</p>
                <p className="text-[10px] text-muted-foreground">Delete all trades, keep capital settings.</p>
              </div>
            </div>
            {loading === 'trades' && <Loader2 className="animate-spin text-red-500" size={18} />}
          </button>

          {/* Optie 2: Alleen Settings */}
          <button
            disabled={!!loading}
            onClick={() => handleAction('settings', onResetSettings, 'Reset Settings?', 'This will revert your account balance, currency, and sessions to default values. Your trades will be preserved.')}
            className="w-full group flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/5 hover:border-yellow-500/50 hover:bg-yellow-500/5 transition-all text-left"
          >
            <div className="flex items-center gap-4">
              <div className="p-2 bg-yellow-500/10 rounded-lg text-yellow-500 group-hover:bg-yellow-500 group-hover:text-white transition-colors">
                <RotateCcw size={20} />
              </div>
              <div>
                <p className="font-bold text-white uppercase text-xs">Reset Settings</p>
                <p className="text-[10px] text-muted-foreground">Reset capital and sessions to default.</p>
              </div>
            </div>
            {loading === 'settings' && <Loader2 className="animate-spin text-yellow-500" size={18} />}
          </button>

          {/* Optie 3: Alles */}
          <button
            disabled={!!loading}
            onClick={() => handleAction('all', onResetAll, 'FULL ACCOUNT RESET?', 'This will delete EVERYTHING: all trades, settings, and profile data. There is no going back.')}
            className="w-full group flex items-center justify-between p-4 rounded-xl border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 transition-all text-left"
          >
            <div className="flex items-center gap-4">
              <div className="p-2 bg-red-500/20 rounded-lg text-red-500">
                <AlertTriangle size={20} />
              </div>
              <div>
                <p className="font-bold text-red-500 uppercase text-xs">Full Account Reset</p>
                <p className="text-[10px] text-red-400/70 font-medium">Delete EVERYTHING. Start fresh.</p>
              </div>
            </div>
            {loading === 'all' && <Loader2 className="animate-spin text-red-500" size={18} />}
          </button>
        </div>

        <div className="p-4 bg-black/20 flex justify-center">
          <button onClick={onClose} className="text-xs font-bold text-muted-foreground hover:text-white uppercase tracking-widest">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResetVaultModal;