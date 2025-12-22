"use client";

import { X, Save } from 'lucide-react';

interface AddTradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddTradeModal = ({ isOpen, onClose }: AddTradeModalProps) => {
  if (!isOpen) return null;

  return (
    // Backdrop (donkere achtergrond)
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      
      {/* Modal Card */}
      <div className="bg-pip-card border border-pip-border w-full max-w-2xl rounded-xl shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-pip-border">
          <h2 className="text-xl font-bold text-white">Log New Trade</h2>
          <button onClick={onClose} className="text-pip-muted hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Form Content */}
        <div className="p-6 space-y-6">
          
          {/* Rij 1: Pair & Richting */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-pip-muted">Pair / Asset</label>
              <input 
                type="text" 
                placeholder="EURUSD" 
                className="w-full bg-pip-dark border border-pip-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-pip-gold transition-colors"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-pip-muted">Direction</label>
              <div className="grid grid-cols-2 gap-4">
                <button className="bg-pip-green/20 text-pip-green border border-pip-green/50 py-2 rounded-lg font-bold hover:bg-pip-green hover:text-white transition-all">
                  LONG
                </button>
                <button className="bg-pip-card border border-pip-border text-pip-muted py-2 rounded-lg font-bold hover:border-pip-red hover:text-pip-red transition-all">
                  SHORT
                </button>
              </div>
            </div>
          </div>

          {/* Rij 2: Prijzen (Entry, SL, TP) */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-pip-muted">Entry Price</label>
              <input type="number" placeholder="0.0000" className="w-full bg-pip-dark border border-pip-border rounded-lg px-4 py-2 text-white focus:border-pip-gold outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-pip-muted">Stop Loss</label>
              <input type="number" placeholder="0.0000" className="w-full bg-pip-dark border border-pip-border rounded-lg px-4 py-2 text-white focus:border-pip-red outline-none" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-pip-muted">Take Profit</label>
              <input type="number" placeholder="0.0000" className="w-full bg-pip-dark border border-pip-border rounded-lg px-4 py-2 text-white focus:border-pip-green outline-none" />
            </div>
          </div>

          {/* Rij 3: Context (TradingView URL) */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-pip-muted">TradingView Chart URL</label>
            <input 
              type="url" 
              placeholder="https://www.tradingview.com/x/..." 
              className="w-full bg-pip-dark border border-pip-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-pip-gold transition-colors"
            />
          </div>

        </div>

        {/* Footer */}
        <div className="p-6 border-t border-pip-border flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-pip-muted hover:text-white font-medium transition-colors">
            Cancel
          </button>
          <button className="bg-pip-gold hover:bg-pip-gold-dim text-pip-dark font-bold px-6 py-2 rounded-lg flex items-center gap-2 transition-transform active:scale-95">
            <Save size={18} />
            Save Trade
          </button>
        </div>

      </div>
    </div>
  );
};

export default AddTradeModal;