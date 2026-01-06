"use client";

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Save, CheckCircle, Loader2, Calculator, AlertCircle, Clock } from 'lucide-react';
import { useTrades } from '@/context/TradeContext';
import { useProfile } from '@/context/ProfileContext';

interface AddTradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const EMOTIONS = ['Confident', 'Neutral', 'FOMO', 'Greedy', 'Hesitant', 'Revenge'];

const AddTradeModal = ({ isOpen, onClose }: AddTradeModalProps) => {
  const { addTrade } = useTrades();
  const { profile } = useProfile();

  // States
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [inlineError, setInlineError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    pair: '',
    direction: 'LONG' as 'LONG' | 'SHORT',
    entryPrice: '',
    stopLoss: '',
    takeProfit: '',
    chartUrl: '',
    pnl: '',
    pnlCurrency: '',
    setup: 'Trend Continuation',
    emotion: 'Neutral',
    session: '',
  });

  const [calculations, setCalculations] = useState({
    risk: 0,
    reward: 0,
    rrRatio: 0
  });

  // Reset form bij openen/sluiten en zet standaard sessie
  useEffect(() => {
    setMounted(true);
    if (!isOpen) {
      setFormData({
        pair: '',
        direction: 'LONG',
        entryPrice: '',
        stopLoss: '',
        takeProfit: '',
        chartUrl: '',
        pnl: '',
        pnlCurrency: '',
        setup: 'Trend Continuation',
        emotion: 'Neutral',
        session: profile.sessions[0] || '', // Use first available session
      });
      setShowSuccess(false);
      setLoading(false);
      setInlineError(null);
    } else {
      // Ensure session is set when modal opens
      setFormData(prev => ({ ...prev, session: profile.sessions[0] || '' }));
    }
  }, [isOpen, profile.sessions]);

  // Automatische RR Calculaties
  useEffect(() => {
    const entry = parseFloat(formData.entryPrice);
    const sl = parseFloat(formData.stopLoss);
    const tp = parseFloat(formData.takeProfit);

    if (!isNaN(entry) && !isNaN(sl)) {
      const riskVal = Math.abs(entry - sl);
      const rewardVal = !isNaN(tp) ? Math.abs(tp - entry) : 0;

      const isJPY = formData.pair.toUpperCase().includes('JPY');
      const multiplier = isJPY ? 100 : 10000;

      setCalculations({
        risk: parseFloat((riskVal * multiplier).toFixed(1)),
        reward: parseFloat((rewardVal * multiplier).toFixed(1)),
        rrRatio: riskVal > 0 ? parseFloat((rewardVal / riskVal).toFixed(2)) : 0
      });
    }
  }, [formData.entryPrice, formData.stopLoss, formData.takeProfit, formData.pair]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (inlineError) setInlineError(null);
  };

  const handleSave = async () => {
    if (!formData.pair || !formData.entryPrice || !formData.pnl || !formData.session) {
      setInlineError("Please fill in required fields: Pair, Entry, PnL, and Session.");
      return;
    }

    setLoading(true);
    setInlineError(null);

    try {
      await addTrade({
        pair: formData.pair.toUpperCase(),
        direction: formData.direction,
        entryPrice: parseFloat(formData.entryPrice),
        stopLoss: parseFloat(formData.stopLoss),
        takeProfit: formData.takeProfit ? parseFloat(formData.takeProfit) : undefined,
        pnl: parseFloat(formData.pnl),
        pnl_currency: formData.pnlCurrency ? parseFloat(formData.pnlCurrency) : undefined,
        setup: formData.setup,
        emotion: formData.emotion,
        session: formData.session,
        chartUrl: formData.chartUrl,
        date: new Date().toISOString(),
        rrRatio: calculations.rrRatio
      });

      setShowSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error: any) {
      console.error("Fout bij opslaan:", error);
      setInlineError(error.message || "Could not save trade. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-pip-card border border-pip-border w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden relative">

        {showSuccess ? (
          <div className="flex flex-col items-center justify-center p-12 space-y-4 animate-in fade-in zoom-in-95 duration-300">
            <div className="w-20 h-20 bg-pip-green/20 rounded-full flex items-center justify-center text-pip-green">
              <CheckCircle size={48} />
            </div>
            <h3 className="text-2xl font-bold text-white">Trade Vaulted</h3>
            <p className="text-pip-muted text-sm">Saved securely to your PipVault.</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between p-6 border-b border-pip-border">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Calculator className="text-pip-gold" size={20} /> Log New Trade
              </h2>
              <button onClick={onClose} className="text-pip-muted hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-5 overflow-y-auto max-h-[80vh]">
              {inlineError && (
                <div className="p-4 bg-pip-red/10 border border-pip-red/20 rounded-lg flex items-center gap-3 text-pip-red animate-in slide-in-from-top-2">
                  <AlertCircle size={18} className="shrink-0" />
                  <span className="text-sm font-medium">{inlineError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-pip-muted uppercase tracking-wider mb-1 block">Pair</label>
                  <input name="pair" value={formData.pair} onChange={handleChange} type="text" placeholder="EURUSD" className="w-full bg-pip-dark border border-pip-border rounded-xl px-4 py-3 text-white outline-none focus:border-pip-gold transition-colors placeholder:text-pip-muted/30 uppercase" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-pip-muted uppercase tracking-wider">Direction</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button onClick={() => setFormData(prev => ({ ...prev, direction: 'LONG' }))} className={`py-2 rounded-lg font-bold border transition-all ${formData.direction === 'LONG' ? 'bg-pip-green/20 text-pip-green border-pip-green' : 'bg-pip-dark text-pip-muted border-pip-border'}`}>LONG</button>
                    <button onClick={() => setFormData(prev => ({ ...prev, direction: 'SHORT' }))} className={`py-2 rounded-lg font-bold border transition-all ${formData.direction === 'SHORT' ? 'bg-pip-red/20 text-pip-red border-pip-red' : 'bg-pip-dark text-pip-muted border-pip-border'}`}>SHORT</button>
                  </div>
                </div>
              </div>

              {/* SESSIE SELECTIE - NIEUWE SECTIE */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-pip-muted uppercase tracking-wider mb-1 block flex items-center gap-2">
                  <Clock size={14} /> Trading Session
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {profile.sessions.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setFormData({ ...formData, session: s })}
                      className={`py-2 rounded-lg font-bold border transition-all text-xs ${formData.session === s
                        ? 'bg-pip-gold/20 text-pip-gold border-pip-gold'
                        : 'bg-pip-dark text-pip-muted border-pip-border hover:border-white/10'
                        }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-pip-muted uppercase tracking-wider mb-1 block">Entry</label>
                  <input name="entryPrice" value={formData.entryPrice} onChange={handleChange} type="number" step="0.00001" className="w-full bg-pip-dark border border-pip-border rounded-xl px-4 py-3 text-white outline-none focus:border-pip-gold transition-colors placeholder:text-pip-muted/30" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-pip-muted uppercase tracking-wider mb-1 block">Stop Loss</label>
                  <input name="stopLoss" value={formData.stopLoss} onChange={handleChange} type="number" step="0.00001" className="w-full bg-pip-dark border border-pip-border rounded-xl px-4 py-3 text-white outline-none focus:border-pip-gold transition-colors placeholder:text-pip-muted/30" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-pip-muted uppercase tracking-wider mb-1 block">Take Profit</label>
                  <input name="takeProfit" value={formData.takeProfit} onChange={handleChange} type="number" step="0.00001" className="w-full bg-pip-dark border border-pip-border rounded-xl px-4 py-3 text-white outline-none focus:border-pip-gold transition-colors placeholder:text-pip-muted/30" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-pip-muted uppercase tracking-wider mb-1 block">Realized PnL (Pips)</label>
                  <input name="pnl" value={formData.pnl} onChange={handleChange} type="number" className="w-full bg-pip-dark border border-pip-border rounded-xl px-4 py-3 text-white outline-none focus:border-pip-gold transition-colors placeholder:text-pip-muted/30" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-pip-muted uppercase tracking-wider mb-1 block">Realized PnL ($)</label>
                  <input name="pnlCurrency" value={formData.pnlCurrency} onChange={handleChange} type="number" className="w-full bg-pip-dark border border-pip-border rounded-xl px-4 py-3 text-white outline-none focus:border-pip-gold transition-colors placeholder:text-pip-muted/30" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-pip-muted uppercase tracking-wider mb-1 block">Setup</label>
                  <select
                    name="setup"
                    value={formData.setup}
                    onChange={handleChange}
                    className="w-full bg-pip-dark border border-pip-border rounded-xl px-4 py-3 text-white outline-none focus:border-pip-gold transition-colors placeholder:text-pip-muted/30"
                  >
                    {profile.strategies.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-pip-muted uppercase tracking-wider mb-1 block">Emotion</label>
                  <select name="emotion" value={formData.emotion} onChange={handleChange} className="w-full bg-pip-dark border border-pip-border rounded-xl px-4 py-3 text-white outline-none focus:border-pip-gold transition-colors placeholder:text-pip-muted/30">
                    {EMOTIONS.map(e => <option key={e} value={e}>{e}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-pip-muted uppercase tracking-wider mb-1 block">TradingView Chart URL</label>
                <input name="chartUrl" value={formData.chartUrl} onChange={handleChange} type="url" placeholder="https://www.tradingview.com/x/..." className="w-full bg-pip-dark border border-pip-border rounded-xl px-4 py-3 text-white outline-none focus:border-pip-gold transition-colors placeholder:text-pip-muted/30" />
              </div>

              <div className="p-3 bg-pip-dark/50 border border-pip-border rounded-lg flex justify-around text-center">
                <div><p className="text-[10px] text-pip-muted uppercase">Planned R:R</p><p className="font-bold text-pip-gold">{calculations.rrRatio}</p></div>
                <div><p className="text-[10px] text-pip-muted uppercase">Risk (Pips)</p><p className="font-bold text-white">{calculations.risk}</p></div>
                <div><p className="text-[10px] text-pip-muted uppercase">Reward (Pips)</p><p className="font-bold text-white">{calculations.reward}</p></div>
              </div>
            </div>

            <div className="p-6 border-t border-pip-border flex justify-end gap-3">
              <button onClick={onClose} className="px-4 py-2 text-pip-muted hover:text-white transition-colors">Cancel</button>
              <button
                onClick={handleSave}
                disabled={loading}
                className="bg-pip-gold hover:bg-pip-gold-dim text-pip-dark font-black px-6 py-3 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 shadow-lg shadow-pip-gold/10"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                SAVE TRADE
              </button>
            </div>
          </>
        )}
      </div>
    </div>,
    document.body
  );
};

export default AddTradeModal;