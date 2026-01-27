"use client";

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Save, CheckCircle, Loader2, Calculator, AlertCircle, Clock, Calendar, Wallet } from 'lucide-react';
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

    // Financials
    grossPnl: '', // This maps to pnl_currency (GROSS)
    commission: '',
    swap: '',
    netPnl: 0,    // This maps to pnl (NET) - Calculated

    setup: 'Trend Continuation',
    emotion: 'Neutral',
    session: '',
    comment: '',
    assetType: 'forex' as 'forex' | 'futures',
    accountType: '',

    // Dates
    date: '',      // Entry Date
    exitDate: '',  // Exit Date
  });

  const [calculations, setCalculations] = useState({
    risk: 0,
    reward: 0,
    rrRatio: 0
  });

  // Init
  useEffect(() => {
    setMounted(true);
    if (!isOpen) {
      const now = new Date();
      const localIso = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);

      setFormData({
        pair: '',
        direction: 'LONG',
        entryPrice: '',
        stopLoss: '',
        takeProfit: '',
        chartUrl: '',
        grossPnl: '',
        commission: '',
        swap: '',
        netPnl: 0,
        setup: 'Trend Continuation',
        emotion: 'Neutral',
        session: profile.sessions[0] || '',
        comment: '',
        assetType: profile.asset_class || 'forex',
        accountType: profile.account_types?.[0] || 'Demo',
        date: localIso,
        exitDate: localIso,
      });
      setShowSuccess(false);
      setLoading(false);
      setInlineError(null);
    } else if (tradeToEdit) {
      // Helper for date valid check
      const toLocalIso = (dStr?: string) => {
        if (!dStr) return '';
        const d = new Date(dStr);
        if (isNaN(d.getTime())) return '';
        return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
      };

      setFormData({
        pair: tradeToEdit.pair,
        direction: tradeToEdit.direction,
        entryPrice: String(tradeToEdit.entryPrice),
        stopLoss: String(tradeToEdit.stopLoss),
        takeProfit: tradeToEdit.takeProfit ? String(tradeToEdit.takeProfit) : '',
        chartUrl: tradeToEdit.chartUrl || '',

        grossPnl: tradeToEdit.pnl_currency ? String(tradeToEdit.pnl_currency) : '',
        commission: tradeToEdit.commission ? String(tradeToEdit.commission) : '',
        swap: tradeToEdit.swap ? String(tradeToEdit.swap) : '',
        netPnl: tradeToEdit.pnl || 0,

        setup: tradeToEdit.setup || 'Trend Continuation',
        emotion: tradeToEdit.emotion || 'Neutral',
        session: tradeToEdit.session || profile.sessions[0] || '',
        comment: tradeToEdit.comment || '',
        assetType: tradeToEdit.asset_type || profile.asset_class || 'forex',
        accountType: tradeToEdit.account_type || profile.account_types?.[0] || 'Standard',

        date: toLocalIso(tradeToEdit.date),
        exitDate: toLocalIso(tradeToEdit.exit_date),
      });
    }
  }, [isOpen, profile, tradeToEdit]);

  // Auto-Calculate Net PnL
  useEffect(() => {
    const g = parseFloat(formData.grossPnl) || 0;
    const c = parseFloat(formData.commission) || 0;
    const s = parseFloat(formData.swap) || 0;
    const net = g - c - s;
    setFormData(prev => ({ ...prev, netPnl: parseFloat(net.toFixed(2)) }));
  }, [formData.grossPnl, formData.commission, formData.swap]);

  // RR Calc
  useEffect(() => {
    const entry = parseFloat(formData.entryPrice);
    const sl = parseFloat(formData.stopLoss);
    const tp = parseFloat(formData.takeProfit);

    if (!isNaN(entry) && !isNaN(sl)) {
      const riskVal = Math.abs(entry - sl);
      const rewardVal = !isNaN(tp) ? Math.abs(tp - entry) : 0;
      const isJPY = formData.pair.toUpperCase().includes('JPY');
      let multiplier = 10000;
      if (formData.assetType === 'futures') multiplier = 1;
      else if (isJPY) multiplier = 100;

      setCalculations({
        risk: parseFloat((riskVal * multiplier).toFixed(1)),
        reward: parseFloat((rewardVal * multiplier).toFixed(1)),
        rrRatio: riskVal > 0 ? parseFloat((rewardVal / riskVal).toFixed(2)) : 0
      });
    }
  }, [formData.entryPrice, formData.stopLoss, formData.takeProfit, formData.pair, formData.assetType]);

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

        // MAPPING:
        // pnl (Net) -> Used for charts
        // pnl_currency (Gross) -> Used for display/calc
        pnl: formData.netPnl,
        pnl_currency: formData.grossPnl ? parseFloat(formData.grossPnl) : 0,
        commission: formData.commission ? parseFloat(formData.commission) : 0,
        swap: formData.swap ? parseFloat(formData.swap) : 0,

        setup: formData.setup,
        emotion: formData.emotion,
        session: formData.session,
        chartUrl: formData.chartUrl,
        rrRatio: calculations.rrRatio,
        comment: formData.comment,
        asset_type: formData.assetType,
        account_type: formData.accountType,

        // Dates
        // Need to be ISO strings for Supabase timestamptz
        // The input datetime-local gives "YYYY-MM-DDTHH:mm" which is valid to pass to Date constructor
        date: new Date(formData.date).toISOString(),
        exit_date: formData.exitDate ? new Date(formData.exitDate).toISOString() : undefined,
      };

      if (tradeToEdit) {
        await updateTrade(tradeToEdit.id, tradeData);
      } else {
        await addTrade(tradeData);
      }

      setShowSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error: any) {
      console.error("Save error:", error);
      setInlineError(error.message || "Could not save trade.");
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
            <div className="flex items-center justify-between p-6 border-b border-pip-border bg-pip-dark/50">
              <h2 className="text-xl font-bold text-pip-text flex items-center gap-2">
                <Calculator className="text-pip-gold" size={20} /> Trade Details
              </h2>
              <button onClick={onClose} className="text-pip-muted hover:text-pip-text transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto max-h-[80vh]">
              {inlineError && (
                <div className="p-4 bg-pip-red/10 border border-pip-red/20 rounded-lg flex items-center gap-3 text-pip-red text-sm font-medium">
                  <AlertCircle size={18} /> {inlineError}
                </div>
              )}

              {/* 1. Account & Instrument */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-pip-muted uppercase tracking-wider">Account Type</label>
                  <select name="accountType" value={formData.accountType} onChange={handleChange} className="w-full bg-background border border-pip-border rounded-xl px-4 py-3 text-pip-text outline-none focus:border-pip-gold transition-colors text-sm">
                    {profile.account_types?.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-pip-muted uppercase tracking-wider">Asset Class</label>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setFormData(prev => ({ ...prev, assetType: 'forex' }))} className={`flex-1 py-3 rounded-xl font-bold border text-xs transition-all ${formData.assetType === 'forex' ? 'bg-pip-gold/20 text-pip-gold border-pip-gold' : 'bg-background text-pip-muted border-pip-border'}`}>FOREX</button>
                    <button type="button" onClick={() => setFormData(prev => ({ ...prev, assetType: 'futures' }))} className={`flex-1 py-3 rounded-xl font-bold border text-xs transition-all ${formData.assetType === 'futures' ? 'bg-pip-gold/20 text-pip-gold border-pip-gold' : 'bg-background text-pip-muted border-pip-border'}`}>FUTURES</button>
                  </div>
                </div>
              </div>

              {/* 2. Timing */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label htmlFor="date" className="text-[10px] font-bold text-pip-muted uppercase tracking-wider flex items-center gap-1"><Calendar size={12} /> Entry Time</label>
                  <input id="date" name="date" type="datetime-local" value={formData.date} onChange={handleChange} className="w-full bg-background border border-pip-border rounded-xl px-4 py-3 text-pip-text outline-none focus:border-pip-gold transition-colors [color-scheme:dark]" />
                </div>
                <div className="space-y-1">
                  <label htmlFor="exitDate" className="text-[10px] font-bold text-pip-muted uppercase tracking-wider flex items-center gap-1"><Clock size={12} /> Exit Time</label>
                  <input id="exitDate" name="exitDate" type="datetime-local" value={formData.exitDate} onChange={handleChange} className="w-full bg-background border border-pip-border rounded-xl px-4 py-3 text-pip-text outline-none focus:border-pip-gold transition-colors [color-scheme:dark]" />
                </div>
              </div>

              {/* 3. Trade Specifics */}
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-12 md:col-span-4 space-y-1">
                  <label className="text-[10px] font-bold text-pip-muted uppercase tracking-wider">Pair</label>
                  <input name="pair" value={formData.pair} onChange={handleChange} type="text" placeholder="EURUSD" className="w-full bg-background border border-pip-border rounded-xl px-4 py-3 text-pip-text outline-none focus:border-pip-gold uppercase font-bold" />
                </div>
                <div className="col-span-12 md:col-span-4 space-y-1">
                  <label className="text-[10px] font-bold text-pip-muted uppercase tracking-wider">Direction</label>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setFormData(prev => ({ ...prev, direction: 'LONG' }))} className={`flex-1 py-3 rounded-xl font-bold border text-xs ${formData.direction === 'LONG' ? 'bg-pip-green/20 text-pip-green border-pip-green' : 'bg-background text-pip-muted border-pip-border'}`}>LONG</button>
                    <button type="button" onClick={() => setFormData(prev => ({ ...prev, direction: 'SHORT' }))} className={`flex-1 py-3 rounded-xl font-bold border text-xs ${formData.direction === 'SHORT' ? 'bg-pip-red/20 text-pip-red border-pip-red' : 'bg-background text-pip-muted border-pip-border'}`}>SHORT</button>
                  </div>
                </div>
                <div className="col-span-12 md:col-span-4 space-y-1">
                  <label className="text-[10px] font-bold text-pip-muted uppercase tracking-wider">Session</label>
                  <select name="session" value={formData.session} onChange={handleChange} className="w-full bg-background border border-pip-border rounded-xl px-4 py-3 text-pip-text outline-none focus:border-pip-gold text-sm">
                    {profile.sessions.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              {/* 4. Price & Risk */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-pip-muted uppercase tracking-wider">Entry Price</label>
                  <input name="entryPrice" value={formData.entryPrice} onChange={handleChange} type="number" step="0.00001" className="w-full bg-background border border-pip-border rounded-xl px-4 py-3 text-pip-text outline-none focus:border-pip-gold" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-pip-muted uppercase tracking-wider">Stop Loss</label>
                  <input name="stopLoss" value={formData.stopLoss} onChange={handleChange} type="number" step="0.00001" className="w-full bg-background border border-pip-border rounded-xl px-4 py-3 text-pip-text outline-none focus:border-pip-gold" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-pip-muted uppercase tracking-wider">Take Profit</label>
                  <input name="takeProfit" value={formData.takeProfit} onChange={handleChange} type="number" step="0.00001" className="w-full bg-background border border-pip-border rounded-xl px-4 py-3 text-pip-text outline-none focus:border-pip-gold" />
                </div>
              </div>

              {/* 5. Financials */}
              <div className="bg-pip-active/5 border border-dashed border-pip-border p-4 rounded-xl space-y-4">
                <h3 className="text-xs font-bold text-pip-text uppercase flex items-center gap-2"><Wallet size={14} className="text-pip-gold" /> Financial Results (USD)</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-pip-muted uppercase">Gross P&L</label>
                    <input name="grossPnl" value={formData.grossPnl} onChange={handleChange} type="number" placeholder="0.00" className="w-full bg-background border border-pip-border rounded-lg px-3 py-2 text-pip-text outline-none focus:border-pip-gold text-sm" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-pip-muted uppercase">Commission</label>
                    <input name="commission" value={formData.commission} onChange={handleChange} type="number" placeholder="0.00" className="w-full bg-background border border-pip-border rounded-lg px-3 py-2 text-pip-text outline-none focus:border-pip-gold text-sm" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-pip-muted uppercase">Swap / Fees</label>
                    <input name="swap" value={formData.swap} onChange={handleChange} type="number" placeholder="0.00" className="w-full bg-background border border-pip-border rounded-lg px-3 py-2 text-pip-text outline-none focus:border-pip-gold text-sm" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-pip-muted uppercase">Net P&L</label>
                    <div className={`w-full border border-transparent rounded-lg px-3 py-2 text-sm font-black ${formData.netPnl > 0 ? 'bg-pip-green/20 text-pip-green' : formData.netPnl < 0 ? 'bg-pip-red/20 text-pip-red' : 'bg-pip-dark text-pip-muted'}`}>
                      ${formData.netPnl.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>

              {/* 6. Meta */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-pip-muted uppercase tracking-wider">Strategy / Setup</label>
                  <select name="setup" value={formData.setup} onChange={handleChange} className="w-full bg-background border border-pip-border rounded-xl px-4 py-3 text-pip-text outline-none focus:border-pip-gold text-sm">
                    {profile.strategies.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-pip-muted uppercase tracking-wider">Emotion</label>
                  <select name="emotion" value={formData.emotion} onChange={handleChange} className="w-full bg-background border border-pip-border rounded-xl px-4 py-3 text-pip-text outline-none focus:border-pip-gold text-sm">
                    {EMOTIONS.map(e => <option key={e} value={e}>{e}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-pip-muted uppercase tracking-wider">Chart URL</label>
                <input name="chartUrl" value={formData.chartUrl} onChange={handleChange} type="url" placeholder="https://www.tradingview.com/x/..." className="w-full bg-background border border-pip-border rounded-xl px-4 py-3 text-pip-text outline-none focus:border-pip-gold text-sm" />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-pip-muted uppercase tracking-wider">Notes</label>
                <textarea name="comment" value={formData.comment} onChange={handleChange} placeholder="Analysis..." className="w-full bg-background border border-pip-border rounded-xl px-4 py-3 text-pip-text outline-none focus:border-pip-gold h-20 text-sm resize-none" />
              </div>

              <div className="p-3 bg-pip-dark/50 border border-pip-border rounded-lg flex justify-around text-center">
                <div><p className="text-[10px] text-pip-muted uppercase">Planned R:R</p><p className="font-bold text-pip-gold">{calculations.rrRatio}</p></div>
                <div><p className="text-[10px] text-pip-muted uppercase">Risk</p><p className="font-bold text-pip-text">{calculations.risk}</p></div>
                <div><p className="text-[10px] text-pip-muted uppercase">Reward</p><p className="font-bold text-pip-text">{calculations.reward}</p></div>
              </div>
            </div>

            <div className="p-6 border-t border-pip-border flex justify-end gap-3 bg-pip-dark/50">
              <button onClick={onClose} className="px-5 py-3 rounded-xl font-bold bg-background border border-pip-border text-pip-muted hover:text-pip-text hover:border-pip-text transition-all">Cancel</button>
              <button
                onClick={handleSave}
                disabled={loading}
                className="bg-pip-gold hover:bg-pip-gold-dim text-pip-dark font-black px-8 py-3 rounded-xl flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50 shadow-lg shadow-pip-gold/20"
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