"use client";

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Save, CheckCircle, Loader2, Calculator, AlertCircle, Clock } from 'lucide-react';
import { useTrades } from '@/context/TradeContext';
import { useProfile } from '@/context/ProfileContext';

import { Trade } from '@/context/TradeContext';

interface AddTradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  tradeToEdit?: Trade;
}

const EMOTIONS = ['Confident', 'Neutral', 'FOMO', 'Greedy', 'Hesitant', 'Revenge'];

const AddTradeModal = ({ isOpen, onClose, tradeToEdit }: AddTradeModalProps) => {
  const { addTrade, updateTrade } = useTrades();
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
    comment: '',
    assetType: 'forex' as 'forex' | 'futures', // Local state for asset type
    date: '', // [NEW] Date field
  });

  const [calculations, setCalculations] = useState({
    risk: 0,
    reward: 0,
    rrRatio: 0
  });

  // Reset form bij openen/sluiten en zet standaard sessie + asset class
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
        session: profile.sessions[0] || '',
        comment: '',
        assetType: profile.asset_class || 'forex', // Default to profile setting
        date: new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16) // Default to now (local)
      });
      setShowSuccess(false);
      setLoading(false);
      setInlineError(null);
    } else if (tradeToEdit) {
      // Pre-fill form if editing
      setFormData({
        pair: tradeToEdit.pair,
        direction: tradeToEdit.direction,
        entryPrice: String(tradeToEdit.entryPrice),
        stopLoss: String(tradeToEdit.stopLoss),
        takeProfit: tradeToEdit.takeProfit ? String(tradeToEdit.takeProfit) : '',
        chartUrl: tradeToEdit.chartUrl || '',
        pnl: String(tradeToEdit.pnl),
        pnlCurrency: tradeToEdit.pnl_currency ? String(tradeToEdit.pnl_currency) : '',
        setup: tradeToEdit.setup || 'Trend Continuation',
        emotion: tradeToEdit.emotion || 'Neutral',
        session: tradeToEdit.session || profile.sessions[0] || '',
        comment: tradeToEdit.comment || '',
        assetType: tradeToEdit.asset_type || profile.asset_class || 'forex',
        date: tradeToEdit.date ? new Date(new Date(tradeToEdit.date).getTime() - new Date(tradeToEdit.date).getTimezoneOffset() * 60000).toISOString().slice(0, 16) : new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16),
      });
    } else {
      // Ensure session and assetType are set when modal opens for new trade
      setFormData(prev => ({
        ...prev,
        session: profile.sessions[0] || '',
        assetType: profile.asset_class || 'forex'
      }));
    }
  }, [isOpen, profile.sessions, profile.asset_class, tradeToEdit]);

  // Automatische RR Calculaties
  useEffect(() => {
    const entry = parseFloat(formData.entryPrice);
    const sl = parseFloat(formData.stopLoss);
    const tp = parseFloat(formData.takeProfit);

    if (!isNaN(entry) && !isNaN(sl)) {
      const riskVal = Math.abs(entry - sl);
      const rewardVal = !isNaN(tp) ? Math.abs(tp - entry) : 0;

      const isJPY = formData.pair.toUpperCase().includes('JPY');

      let multiplier = 10000;
      if (formData.assetType === 'futures') {
        multiplier = 1; // 1 Point = 1.00 price difference (standard for indices)
      } else if (isJPY) {
        multiplier = 100;
      }

      setCalculations({
        risk: parseFloat((riskVal * multiplier).toFixed(1)),
        reward: parseFloat((rewardVal * multiplier).toFixed(1)),
        rrRatio: riskVal > 0 ? parseFloat((rewardVal / riskVal).toFixed(2)) : 0
      });
    }
  }, [formData.entryPrice, formData.stopLoss, formData.takeProfit, formData.pair]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (inlineError) setInlineError(null);
  };

  const handleSave = async () => {
    if (!formData.pair || !formData.entryPrice || !formData.session) {
      setInlineError("Please fill in required fields: Pair, Entry, and Session.");
      return;
    }

    setLoading(true);
    setInlineError(null);

    try {
      const tradeData = {
        pair: formData.pair.toUpperCase(),
        direction: formData.direction,
        entryPrice: parseFloat(formData.entryPrice),
        stopLoss: parseFloat(formData.stopLoss),
        takeProfit: formData.takeProfit ? parseFloat(formData.takeProfit) : undefined,
        pnl: formData.pnl ? parseFloat(formData.pnl) : 0,
        pnl_currency: formData.pnlCurrency ? parseFloat(formData.pnlCurrency) : undefined,
        setup: formData.setup,
        emotion: formData.emotion,
        session: formData.session,
        chartUrl: formData.chartUrl,
        rrRatio: calculations.rrRatio,
        comment: formData.comment,
        asset_type: formData.assetType,
      };

      if (tradeToEdit) {
        await updateTrade(tradeToEdit.id, tradeData);
      } else {
        await addTrade({
          ...tradeData,
          date: new Date(formData.date).toISOString(),
        });
      }

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
            <h3 className="text-2xl font-bold text-pip-text">Trade Vaulted</h3>
            <p className="text-pip-muted text-sm">Saved securely to your PipVault.</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between p-6 border-b border-pip-border">
              <h2 className="text-xl font-bold text-pip-text flex items-center gap-2">
                <Calculator className="text-pip-gold" size={20} /> Log New Trade
              </h2>
              <button onClick={onClose} className="text-pip-muted hover:text-pip-text transition-colors">
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

              {/* ASSET TYPE TOGGLE */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-pip-muted uppercase tracking-wider mb-1 block">Asset Type</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, assetType: 'forex' }))}
                    className={`flex-1 py-2 rounded-lg font-bold border transition-all text-xs ${formData.assetType === 'forex' ? 'bg-pip-gold/20 text-pip-gold border-pip-gold' : 'bg-pip-dark text-pip-muted border-pip-border'}`}
                  >
                    FOREX
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, assetType: 'futures' }))}
                    className={`flex-1 py-2 rounded-lg font-bold border transition-all text-xs ${formData.assetType === 'futures' ? 'bg-pip-gold/20 text-pip-gold border-pip-gold' : 'bg-pip-dark text-pip-muted border-pip-border'}`}
                  >
                    FUTURES / INDICES
                  </button>
                </div>
              </div>

              {/* DATE FIELD */}
              <div className="space-y-2">
                <label htmlFor="date" className="text-[10px] font-bold text-pip-muted uppercase tracking-wider mb-1 block">Date & Time</label>
                <input
                  id="date"
                  name="date"
                  type="datetime-local"
                  value={formData.date}
                  onChange={handleChange}
                  className="w-full bg-background border border-pip-border rounded-xl px-4 py-3 text-pip-text outline-none focus:border-pip-gold transition-colors placeholder:text-pip-muted/30 [color-scheme:dark]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* ... Pair and Direction ... */}
                <div className="space-y-1">
                  <label htmlFor="pair" className="text-[10px] font-bold text-pip-muted uppercase tracking-wider mb-1 block">Pair</label>
                  <input id="pair" name="pair" value={formData.pair} onChange={handleChange} type="text" placeholder="EURUSD" className="w-full bg-background border border-pip-border rounded-xl px-4 py-3 text-pip-text outline-none focus:border-pip-gold transition-colors placeholder:text-pip-muted/30 uppercase" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-pip-muted uppercase tracking-wider">Direction</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button onClick={() => setFormData(prev => ({ ...prev, direction: 'LONG' }))} className={`py-2 rounded-lg font-bold border transition-all ${formData.direction === 'LONG' ? 'bg-pip-green/20 text-pip-green border-pip-green' : 'bg-pip-dark text-pip-muted border-pip-border'}`}>LONG</button>
                    <button onClick={() => setFormData(prev => ({ ...prev, direction: 'SHORT' }))} className={`py-2 rounded-lg font-bold border transition-all ${formData.direction === 'SHORT' ? 'bg-pip-red/20 text-pip-red border-pip-red' : 'bg-pip-dark text-pip-muted border-pip-border'}`}>SHORT</button>
                  </div>
                </div>
              </div>

              {/* SESSIE SELECTIE */}
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
                  <label htmlFor="entryPrice" className="text-[10px] font-bold text-pip-muted uppercase tracking-wider mb-1 block">Entry</label>
                  <input id="entryPrice" name="entryPrice" value={formData.entryPrice} onChange={handleChange} type="number" step="0.00001" className="w-full bg-background border border-pip-border rounded-xl px-4 py-3 text-pip-text outline-none focus:border-pip-gold transition-colors placeholder:text-pip-muted/30" />
                </div>
                <div className="space-y-1">
                  <label htmlFor="stopLoss" className="text-[10px] font-bold text-pip-muted uppercase tracking-wider mb-1 block">Stop Loss</label>
                  <input id="stopLoss" name="stopLoss" value={formData.stopLoss} onChange={handleChange} type="number" step="0.00001" className="w-full bg-background border border-pip-border rounded-xl px-4 py-3 text-pip-text outline-none focus:border-pip-gold transition-colors placeholder:text-pip-muted/30" />
                </div>
                <div className="space-y-1">
                  <label htmlFor="takeProfit" className="text-[10px] font-bold text-pip-muted uppercase tracking-wider mb-1 block">Take Profit</label>
                  <input id="takeProfit" name="takeProfit" value={formData.takeProfit} onChange={handleChange} type="number" step="0.00001" className="w-full bg-background border border-pip-border rounded-xl px-4 py-3 text-pip-text outline-none focus:border-pip-gold transition-colors placeholder:text-pip-muted/30" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <label htmlFor="pnl" className="text-[10px] font-bold text-pip-muted uppercase tracking-wider mb-1 block">Realized PnL ({formData.assetType === 'futures' ? 'Points' : 'Pips'})</label>
                  <input id="pnl" name="pnl" value={formData.pnl} onChange={handleChange} type="number" className="w-full bg-background border border-pip-border rounded-xl px-4 py-3 text-pip-text outline-none focus:border-pip-gold transition-colors placeholder:text-pip-muted/30" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-pip-muted uppercase tracking-wider mb-1 block">Realized PnL ($)</label>
                  <input name="pnlCurrency" value={formData.pnlCurrency} onChange={handleChange} type="number" className="w-full bg-background border border-pip-border rounded-xl px-4 py-3 text-pip-text outline-none focus:border-pip-gold transition-colors placeholder:text-pip-muted/30" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-pip-muted uppercase tracking-wider mb-1 block">Setup</label>
                  <select
                    name="setup"
                    value={formData.setup}
                    onChange={handleChange}
                    className="w-full bg-background border border-pip-border rounded-xl px-4 py-3 text-pip-text outline-none focus:border-pip-gold transition-colors placeholder:text-pip-muted/30"
                  >
                    {profile.strategies.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-pip-muted uppercase tracking-wider mb-1 block">Emotion</label>
                  <select name="emotion" value={formData.emotion} onChange={handleChange} className="w-full bg-background border border-pip-border rounded-xl px-4 py-3 text-pip-text outline-none focus:border-pip-gold transition-colors placeholder:text-pip-muted/30">
                    {EMOTIONS.map(e => <option key={e} value={e}>{e}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-pip-muted uppercase tracking-wider mb-1 block">TradingView Chart URL</label>
                <input name="chartUrl" value={formData.chartUrl} onChange={handleChange} type="url" placeholder="https://www.tradingview.com/x/..." className="w-full bg-background border border-pip-border rounded-xl px-4 py-3 text-pip-text outline-none focus:border-pip-gold transition-colors placeholder:text-pip-muted/30" />
              </div>

              <div className="space-y-1">
                <label htmlFor="comment" className="text-[10px] font-bold text-pip-muted uppercase tracking-wider mb-1 block">Comment / Analysis</label>
                <textarea
                  id="comment"
                  name="comment"
                  value={formData.comment}
                  onChange={handleChange}
                  placeholder="Describe your thought process..."
                  className="w-full bg-background border border-pip-border rounded-xl px-4 py-3 text-pip-text outline-none focus:border-pip-gold transition-colors placeholder:text-pip-muted/30 min-h-[100px] resize-y"
                />
              </div>

              <div className="p-3 bg-pip-dark/50 border border-pip-border rounded-lg flex justify-around text-center">
                <div><p className="text-[10px] text-pip-muted uppercase">Planned R:R</p><p className="font-bold text-pip-gold">{calculations.rrRatio}</p></div>
                <div><p className="text-[10px] text-pip-muted uppercase">Risk ({formData.assetType === 'futures' ? 'Points' : 'Pips'})</p><p className="font-bold text-pip-text">{calculations.risk}</p></div>
                <div><p className="text-[10px] text-pip-muted uppercase">Reward ({formData.assetType === 'futures' ? 'Points' : 'Pips'})</p><p className="font-bold text-pip-text">{calculations.reward}</p></div>
              </div>
            </div >

            <div className="p-6 border-t border-pip-border flex justify-end gap-3">
              <button onClick={onClose} className="px-4 py-2 text-pip-muted hover:text-pip-text transition-colors">Cancel</button>
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
      </div >
    </div >,
    document.body
  );
};

export default AddTradeModal;