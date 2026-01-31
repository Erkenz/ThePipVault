"use client";

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Save, CheckCircle, Loader2, Calculator, AlertCircle, Clock, Calendar, Wallet, TrendingUp, TrendingDown, Hash, Users, Activity } from 'lucide-react';
import { useTrades } from '@/context/TradeContext';
import { useProfile } from '@/context/ProfileContext';
import { useAccounts } from '@/context/AccountContext';
import { Trade } from '@/context/TradeContext';
import { cn } from '@/lib/utils';
import CustomSelect from '@/components/ui/CustomSelect';

interface AddTradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  tradeToEdit?: Trade;
}

const EMOTIONS = ['Confident', 'Neutral', 'FOMO', 'Greedy', 'Hesitant', 'Revenge'];

const AddTradeModal = ({ isOpen, onClose, tradeToEdit }: AddTradeModalProps) => {
  const { addTrade, updateTrade } = useTrades();
  const { profile } = useProfile();
  const { accounts, selectedAccount } = useAccounts();

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
    exitPrice: '',
    chartUrl: '',
    grossPnl: '',
    commission: '',
    swap: '',
    netPnl: 0,
    setup: 'Trend Continuation',
    emotion: 'Neutral',
    session: '',
    comment: '',
    assetType: 'forex' as 'forex' | 'futures',
    accountType: '',
    accountId: '',
    date: '',
    exitDate: '',
  });

  const [calculations, setCalculations] = useState({
    risk: 0,
    reward: 0,
    rrRatio: 0,
    realizedRR: 0
  });

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
        exitPrice: '',
        chartUrl: '',
        grossPnl: '',
        commission: '',
        swap: '',
        netPnl: 0,
        setup: 'Trend Continuation',
        emotion: 'Neutral',
        session: profile?.sessions?.[0] || '',
        comment: '',
        assetType: profile?.asset_class || 'forex',
        accountType: profile?.account_types?.[0] || 'Demo',
        accountId: selectedAccount?.id || (accounts.length > 0 ? accounts[0].id : ''),
        date: localIso,
        exitDate: localIso,
      });
      setShowSuccess(false);
      setLoading(false);
      setInlineError(null);
    } else if (tradeToEdit) {
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
        exitPrice: tradeToEdit.exitPrice ? String(tradeToEdit.exitPrice) : '',
        chartUrl: tradeToEdit.chartUrl || '',
        grossPnl: tradeToEdit.pnl_currency ? String(tradeToEdit.pnl_currency) : '',
        commission: tradeToEdit.commission ? String(tradeToEdit.commission) : '',
        swap: tradeToEdit.swap ? String(tradeToEdit.swap) : '',
        netPnl: tradeToEdit.pnl || 0,
        setup: tradeToEdit.setup || 'Trend Continuation',
        emotion: tradeToEdit.emotion || 'Neutral',
        session: tradeToEdit.session || profile?.sessions?.[0] || '',
        comment: tradeToEdit.comment || '',
        assetType: tradeToEdit.asset_type || profile?.asset_class || 'forex',
        accountType: tradeToEdit.account_type || profile?.account_types?.[0] || 'Standard',
        accountId: tradeToEdit.account_id || selectedAccount?.id || (accounts.length > 0 ? accounts[0].id : ''),
        date: toLocalIso(tradeToEdit.date),
        exitDate: toLocalIso(tradeToEdit.exit_date),
      });
    }
  }, [isOpen, profile, tradeToEdit, accounts, selectedAccount]);

  // Calculations
  useEffect(() => {
    const g = parseFloat(formData.grossPnl) || 0;
    const c = parseFloat(formData.commission) || 0;
    const s = parseFloat(formData.swap) || 0;
    const net = g - c - s;
    setFormData(prev => ({ ...prev, netPnl: parseFloat(net.toFixed(2)) }));
  }, [formData.grossPnl, formData.commission, formData.swap]);

  useEffect(() => {
    const entry = parseFloat(formData.entryPrice);
    const sl = parseFloat(formData.stopLoss);
    const tp = parseFloat(formData.takeProfit);
    const exit = parseFloat(formData.exitPrice);

    if (!isNaN(entry) && !isNaN(sl)) {
      const riskVal = Math.abs(entry - sl);
      const rewardVal = !isNaN(tp) ? Math.abs(tp - entry) : 0;

      // Realized Calculation
      let realizedRewardVal = 0;
      if (!isNaN(exit)) {
        realizedRewardVal = Math.abs(exit - entry);
      }

      const isJPY = (formData.pair || '').toUpperCase().includes('JPY');
      let multiplier = 10000;
      if (formData.assetType === 'futures') multiplier = 1;
      else if (isJPY) multiplier = 100;

      setCalculations({
        risk: parseFloat((riskVal * multiplier).toFixed(2)),
        reward: parseFloat((rewardVal * multiplier).toFixed(2)),
        rrRatio: riskVal > 0 ? parseFloat((rewardVal / riskVal).toFixed(2)) : 0,
        realizedRR: (riskVal > 0 && !isNaN(exit)) ? parseFloat((realizedRewardVal / riskVal).toFixed(2)) : 0
      });
    }
  }, [formData.entryPrice, formData.stopLoss, formData.takeProfit, formData.exitPrice, formData.pair, formData.assetType]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (inlineError) setInlineError(null);
  };

  const handleSave = async () => {
    if (!formData.pair || !formData.entryPrice || !formData.session) {
      setInlineError("Please fill in required fields (Pair, Entry, Session).");
      return;
    }
    setLoading(true);
    try {
      const tradeData = {
        pair: formData.pair.toUpperCase(),
        direction: formData.direction,
        entryPrice: parseFloat(formData.entryPrice),
        stopLoss: parseFloat(formData.stopLoss),
        takeProfit: formData.takeProfit ? parseFloat(formData.takeProfit) : undefined,
        exitPrice: formData.exitPrice ? parseFloat(formData.exitPrice) : undefined,
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
        account_id: formData.accountId,
        date: new Date(formData.date).toISOString(),
        exit_date: formData.exitDate ? new Date(formData.exitDate).toISOString() : undefined,
      };

      if (tradeToEdit) await updateTrade(tradeToEdit.id, tradeData);
      else await addTrade(tradeData);

      setShowSuccess(true);
      setTimeout(() => onClose(), 1500);
    } catch (error: any) {
      setInlineError(error.message || "Could not save trade.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !mounted) return null;
  // Safe check
  if (!profile) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="glass-panel w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden relative flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="p-6 border-b border-border/50 bg-muted/20 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-lg shadow-primary/20">
              <Calculator className="text-white" size={20} />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight uppercase">{tradeToEdit ? 'Edit Trade' : 'Log New Trade'}</h2>
              <p className="text-xs text-muted-foreground font-medium">Record your execution details</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted/50 rounded-lg text-muted-foreground hover:text-foreground transition-colors" aria-label="Close Modal">
            <X size={20} />
          </button>
        </div>

        {showSuccess ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 space-y-6 animate-in fade-in zoom-in-95 duration-300">
            <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500 mb-2">
              <CheckCircle size={48} />
            </div>
            <div className="text-center">
              <h3 className="text-2xl font-black text-foreground mb-2">Trade Saved</h3>
              <p className="text-muted-foreground">Your performance data has been updated.</p>
            </div>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
              {inlineError && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-500 text-sm font-bold animate-in slide-in-from-top-2">
                  <AlertCircle size={18} /> {inlineError}
                </div>
              )}

              {/* SECTION 1: CONTEXT */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                  <Activity size={12} className="text-primary" /> Market Context
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">Pair / Ticker</label>
                    <input
                      name="pair"
                      value={formData.pair}
                      onChange={handleChange}
                      placeholder="EURUSD"
                      className="w-full bg-background/50 border border-border/50 rounded-xl px-4 py-3 text-foreground font-black uppercase tracking-wide focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none transition-all placeholder:text-muted-foreground/30"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground">Direction</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setFormData(prev => ({ ...prev, direction: 'LONG' }))}
                        className={cn(
                          "py-3 rounded-xl text-xs font-black uppercase tracking-wider border transition-all flex items-center justify-center gap-2",
                          formData.direction === 'LONG'
                            ? "bg-emerald-500/10 border-emerald-500 text-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.15)]"
                            : "bg-background/50 border-border/50 text-muted-foreground hover:bg-muted/50"
                        )}
                      >
                        <TrendingUp size={14} /> Long
                      </button>
                      <button
                        onClick={() => setFormData(prev => ({ ...prev, direction: 'SHORT' }))}
                        className={cn(
                          "py-3 rounded-xl text-xs font-black uppercase tracking-wider border transition-all flex items-center justify-center gap-2",
                          formData.direction === 'SHORT'
                            ? "bg-red-500/10 border-red-500 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.15)]"
                            : "bg-background/50 border-border/50 text-muted-foreground hover:bg-muted/50"
                        )}
                      >
                        <TrendingDown size={14} /> Short
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Account</label>
                    <CustomSelect
                      value={formData.accountId}
                      onChange={(val) => setFormData(prev => ({ ...prev, accountId: val }))}
                      options={accounts.map(a => ({ value: a.id, label: `${a.name} (${a.type})` }))}
                      placeholder="Select Account"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Session</label>
                    <CustomSelect
                      value={formData.session}
                      onChange={(val) => setFormData(prev => ({ ...prev, session: val }))}
                      options={(profile.sessions && Array.isArray(profile.sessions) ? profile.sessions : []).map(s => ({ value: s, label: s }))}
                      placeholder="Select Session"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Asset Class</label>
                    <CustomSelect
                      value={formData.assetType}
                      onChange={(val) => setFormData(prev => ({ ...prev, assetType: val as 'forex' | 'futures' }))}
                      options={[
                        { value: 'forex', label: 'Forex' },
                        { value: 'futures', label: 'Futures' }
                      ]}
                    />
                  </div>
                </div>

                {/* Timing Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Entry Time</label>
                    <input name="date" type="datetime-local" value={formData.date} onChange={handleChange} className="w-full bg-background/50 border border-border/50 rounded-xl px-3 py-2.5 text-xs font-mono text-foreground focus:border-primary outline-none transition-colors [color-scheme:dark]" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Exit Time</label>
                    <input name="exitDate" type="datetime-local" value={formData.exitDate} onChange={handleChange} className="w-full bg-background/50 border border-border/50 rounded-xl px-3 py-2.5 text-xs font-mono text-foreground focus:border-primary outline-none transition-colors [color-scheme:dark]" />
                  </div>
                </div>
              </div>

              {/* SECTION 2: EXECUTION */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                  <Activity size={12} className="text-primary" /> Execution & Risk
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-1.5">
                    <label htmlFor="entryPrice" className="text-[10px] font-bold text-muted-foreground uppercase">Entry Price</label>
                    <input id="entryPrice" name="entryPrice" type="number" step="0.00001" value={formData.entryPrice} onChange={handleChange} className="w-full bg-background/50 border border-border/50 rounded-xl px-3 py-2.5 text-sm font-mono focus:border-primary outline-none transition-colors" />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="stopLoss" className="text-[10px] font-bold text-muted-foreground uppercase">Stop Loss</label>
                    <input id="stopLoss" name="stopLoss" type="number" step="0.00001" value={formData.stopLoss} onChange={handleChange} className="w-full bg-background/50 border border-border/50 rounded-xl px-3 py-2.5 text-sm font-mono focus:border-primary outline-none transition-colors border-l-2 border-l-red-500" />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="takeProfit" className="text-[10px] font-bold text-muted-foreground uppercase">Take Profit</label>
                    <input id="takeProfit" name="takeProfit" type="number" step="0.00001" value={formData.takeProfit} onChange={handleChange} className="w-full bg-background/50 border border-border/50 rounded-xl px-3 py-2.5 text-sm font-mono focus:border-primary outline-none transition-colors border-l-2 border-l-emerald-500" />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="exitPrice" className="text-[10px] font-bold text-muted-foreground uppercase">Exit Price</label>
                    <input id="exitPrice" name="exitPrice" type="number" step="0.00001" value={formData.exitPrice} onChange={handleChange} className="w-full bg-background/50 border border-border/50 rounded-xl px-3 py-2.5 text-sm font-mono focus:border-primary outline-none transition-colors border-l-2 border-l-blue-500" placeholder="Optional" />
                  </div>
                </div>

                <div className="glass-panel p-3 rounded-xl flex justify-between items-center text-xs">
                  <span className="text-muted-foreground font-medium">Risk: <span className="text-foreground font-bold">{calculations.risk}</span></span>
                  <span className="text-muted-foreground font-medium">Reward: <span className="text-foreground font-bold">{calculations.reward}</span></span>
                  <span className="text-muted-foreground font-medium">Plan R:R: <span className="text-primary font-black">{calculations.rrRatio}</span></span>
                  {calculations.realizedRR > 0 && (
                    <span className="text-muted-foreground font-medium border-l border-border/50 pl-3">Realized: <span className={cn("font-black", calculations.realizedRR >= 1 ? "text-emerald-500" : "text-foreground")}>{calculations.realizedRR}R</span></span>
                  )}
                </div>
              </div>

              {/* SECTION 3: OUTCOME */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                  <Wallet size={12} className="text-primary" /> Outcome (USD)
                </h3>
                <div className="p-4 rounded-xl border border-dashed border-border/50 bg-background/30 grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Gross P&L</label>
                    <input name="grossPnl" type="number" value={formData.grossPnl} onChange={handleChange} placeholder="0.00" className="w-full bg-transparent border-b border-border/50 pb-1 text-sm outline-none focus:border-primary transition-colors" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Comm.</label>
                    <input name="commission" type="number" value={formData.commission} onChange={handleChange} placeholder="0.00" className="w-full bg-transparent border-b border-border/50 pb-1 text-sm outline-none focus:border-primary transition-colors" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Swap</label>
                    <input name="swap" type="number" value={formData.swap} onChange={handleChange} placeholder="0.00" className="w-full bg-transparent border-b border-border/50 pb-1 text-sm outline-none focus:border-primary transition-colors" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Net P&L</label>
                    <div className={cn(
                      "text-lg font-black tracking-tight",
                      formData.netPnl > 0 ? "text-emerald-500" : formData.netPnl < 0 ? "text-red-500" : "text-muted-foreground"
                    )}>
                      ${formData.netPnl.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 4: PSYCHOLOGY & NOTES */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5 relative z-20">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Setup</label>
                  <CustomSelect
                    value={formData.setup}
                    onChange={(val) => setFormData(prev => ({ ...prev, setup: val }))}
                    options={profile.strategies.map(s => ({ value: s, label: s }))}
                    placeholder="Select Strategy"
                  />
                </div>
                <div className="space-y-1.5 relative z-20">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Emotion</label>
                  <CustomSelect
                    value={formData.emotion}
                    onChange={(val) => setFormData(prev => ({ ...prev, emotion: val }))}
                    options={EMOTIONS.map(e => ({ value: e, label: e }))}
                    placeholder="Select Emotion"
                  />
                </div>
                <div className="col-span-2 space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Chart URL</label>
                  <input name="chartUrl" type="url" value={formData.chartUrl} onChange={handleChange} className="w-full bg-background/50 border border-border/50 rounded-xl px-4 py-3 text-sm focus:border-primary outline-none transition-colors" placeholder="https://www.tradingview.com/x/..." />
                </div>
                <div className="col-span-2 space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase">Notes</label>
                  <textarea name="comment" value={formData.comment} onChange={handleChange} className="w-full bg-background/50 border border-border/50 rounded-xl px-4 py-3 text-sm focus:border-primary outline-none transition-colors min-h-[80px]" placeholder="Trade execution notes..." />
                </div>
              </div>

            </div>

            <div className="p-6 border-t border-border/50 bg-muted/20 flex items-center justify-end gap-3 shrink-0">
              <button onClick={onClose} className="px-6 py-3 rounded-xl font-bold bg-transparent hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-all">
                Cancel
              </button>
              <button onClick={handleSave} disabled={loading} className="px-8 py-3 rounded-xl font-bold bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2">
                {loading && <Loader2 className="animate-spin" size={16} />}
                Save Trade
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