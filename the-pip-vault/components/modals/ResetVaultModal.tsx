"use client";

import { useState } from 'react';
import { X, AlertTriangle, Trash2, RotateCcw, ShieldAlert, Loader2 } from 'lucide-react';

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

  const handleAction = async (action: string, fn: () => Promise<void>) => {
    setLoading(action);
    try {
      await fn();
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="bg-pip-card border border-pip-red/30 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-6 border-b border-pip-border flex items-center justify-between bg-pip-red/5">
          <div className="flex items-center gap-3 text-pip-red">
            <ShieldAlert size={24} />
            <h2 className="text-xl font-black uppercase italic tracking-tighter">Danger Zone: Reset Vault</h2>
          </div>
          <button onClick={onClose} className="text-pip-muted hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-sm text-pip-muted mb-6">
            Selecteer welke data je wilt wissen. Let op: deze acties zijn definitief en kunnen niet ongedaan worden gemaakt.
          </p>

          {/* Optie 1: Alleen Trades */}
          <button 
            disabled={!!loading}
            onClick={() => handleAction('trades', onResetTrades)}
            className="w-full group flex items-center justify-between p-4 rounded-xl border border-pip-border bg-pip-dark hover:border-pip-red/50 transition-all text-left"
          >
            <div className="flex items-center gap-4">
              <div className="p-2 bg-pip-red/10 rounded-lg text-pip-red group-hover:bg-pip-red group-hover:text-pip-dark transition-colors">
                <Trash2 size={20} />
              </div>
              <div>
                <p className="font-bold text-white uppercase text-xs">Reset Trade History</p>
                <p className="text-[10px] text-pip-muted">Wis alle trades, behoud je kapitaalinstellingen.</p>
              </div>
            </div>
            {loading === 'trades' && <Loader2 className="animate-spin text-pip-red" size={18} />}
          </button>

          {/* Optie 2: Alleen Settings */}
          <button 
            disabled={!!loading}
            onClick={() => handleAction('settings', onResetSettings)}
            className="w-full group flex items-center justify-between p-4 rounded-xl border border-pip-border bg-pip-dark hover:border-pip-gold/50 transition-all text-left"
          >
            <div className="flex items-center gap-4">
              <div className="p-2 bg-pip-gold/10 rounded-lg text-pip-gold group-hover:bg-pip-gold group-hover:text-pip-dark transition-colors">
                <RotateCcw size={20} />
              </div>
              <div>
                <p className="font-bold text-white uppercase text-xs">Reset Settings</p>
                <p className="text-[10px] text-pip-muted">Zet kapitaal en sessies terug naar basis (10k USD).</p>
              </div>
            </div>
            {loading === 'settings' && <Loader2 className="animate-spin text-pip-gold" size={18} />}
          </button>

          {/* Optie 3: Alles */}
          <button 
            disabled={!!loading}
            onClick={() => handleAction('all', onResetAll)}
            className="w-full group flex items-center justify-between p-4 rounded-xl border border-pip-red/50 bg-pip-red/10 hover:bg-pip-red/20 transition-all text-left"
          >
            <div className="flex items-center gap-4">
              <div className="p-2 bg-pip-red/20 rounded-lg text-pip-red">
                <AlertTriangle size={20} />
              </div>
              <div>
                <p className="font-bold text-pip-red uppercase text-xs">Full Account Reset</p>
                <p className="text-[10px] text-pip-red/70 font-medium">Wis ALLES. Begin met een compleet schone lei.</p>
              </div>
            </div>
            {loading === 'all' && <Loader2 className="animate-spin text-pip-red" size={18} />}
          </button>
        </div>

        <div className="p-4 bg-pip-dark/50 flex justify-center">
          <button onClick={onClose} className="text-xs font-bold text-pip-muted hover:text-white uppercase tracking-widest">
            Annuleren
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResetVaultModal;