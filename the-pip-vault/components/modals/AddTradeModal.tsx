"use client";

import { useState, useEffect } from 'react';
import { X, Save, Calculator, AlertCircle, CheckCircle } from 'lucide-react';
import { useTrades } from '@/context/TradeContext';

interface AddTradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface TradeFormData {
  pair: string;
  direction: 'LONG' | 'SHORT';
  entryPrice: string;
  stopLoss: string;
  takeProfit: string;
  chartUrl: string;
  pnl: string;
  setup: string;   // <--- NIEUW
  emotion: string; // <--- NIEUW
}

interface FormErrors {
  pair?: string;
  entryPrice?: string;
  stopLoss?: string;
  pnl?: string;
}

const SETUPS = ['Trend Continuation', 'Breakout', 'Reversal', 'Range Bounce', 'News Event'];
const EMOTIONS = ['Confident', 'Neutral', 'FOMO', 'Greedy', 'Hesitant', 'Revenge'];

const AddTradeModal = ({ isOpen, onClose }: AddTradeModalProps) => {
  const { addTrade } = useTrades();

  const [formData, setFormData] = useState<TradeFormData>({
    pair: '',
    direction: 'LONG',
    entryPrice: '',
    stopLoss: '',
    takeProfit: '',
    chartUrl: '',
    pnl: '',
    setup: 'Trend Continuation', // Default
    emotion: 'Neutral'           // Default
  });

  const [calculations, setCalculations] = useState({
    risk: 0,
    reward: 0,
    rrRatio: 0
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setFormData({
        pair: '',
        direction: 'LONG',
        entryPrice: '',
        stopLoss: '',
        takeProfit: '',
        chartUrl: '',
        pnl: '',
        setup: 'Trend Continuation',
        emotion: 'Neutral'
      });
      setCalculations({ risk: 0, reward: 0, rrRatio: 0 });
      setErrors({});
      setShowSuccess(false);
    }
  }, [isOpen]);

  // Automatische berekeningen (ongewijzigd)
  useEffect(() => {
    const entry = parseFloat(formData.entryPrice);
    const sl = parseFloat(formData.stopLoss);
    const tp = parseFloat(formData.takeProfit);

    if (!isNaN(entry) && !isNaN(sl) && !isNaN(tp)) {
      let riskVal, rewardVal;
      if (formData.direction === 'LONG') {
        riskVal = entry - sl;
        rewardVal = tp - entry;
      } else {
        riskVal = sl - entry;
        rewardVal = entry - tp;
      }
      const isJPY = formData.pair.toUpperCase().includes('JPY');
      const multiplier = isJPY ? 100 : 10000;
      const riskPips = riskVal * multiplier;
      const rewardPips = rewardVal * multiplier;

      if (riskVal > 0) {
        const rr = rewardVal / riskVal;
        setCalculations({
          risk: parseFloat(riskPips.toFixed(1)), 
          reward: parseFloat(rewardPips.toFixed(1)),
          rrRatio: parseFloat(rr.toFixed(2))
        });
      }
    }
  }, [formData.entryPrice, formData.stopLoss, formData.takeProfit, formData.direction, formData.pair]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSave = () => {
    const newErrors: FormErrors = {};
    if (!formData.pair) newErrors.pair = "Pair is verplicht";
    if (!formData.entryPrice) newErrors.entryPrice = "Vul een entry prijs in";
    if (!formData.stopLoss) newErrors.stopLoss = "Vul een stop loss in";
    if (!formData.pnl) newErrors.pnl = "Vul resultaat in";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    addTrade({
      pair: formData.pair.toUpperCase(),
      direction: formData.direction,
      entryPrice: parseFloat(formData.entryPrice),
      stopLoss: parseFloat(formData.stopLoss),
      takeProfit: parseFloat(formData.takeProfit),
      chartUrl: formData.chartUrl,
      riskPips: calculations.risk,
      rewardPips: calculations.reward,
      rrRatio: calculations.rrRatio,
      pnl: parseFloat(formData.pnl),
      setup: formData.setup,    // <--- Opslaan
      emotion: formData.emotion // <--- Opslaan
    });

    setShowSuccess(true);
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-pip-card border border-pip-border w-full max-w-2xl rounded-xl shadow-2xl animate-in fade-in zoom-in-95 duration-200 overflow-hidden relative">
        
        {showSuccess ? (
          <div className="flex flex-col items-center justify-center p-12 space-y-4 text-center animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="w-20 h-20 bg-pip-green/20 rounded-full flex items-center justify-center text-pip-green mb-2">
              <CheckCircle size={48} />
            </div>
            <h3 className="text-2xl font-bold text-white">Trade Saved!</h3>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between p-6 border-b border-pip-border">
              <h2 className="text-xl font-bold text-white">Log Trade</h2>
              <button onClick={onClose} className="text-pip-muted hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Rij 1: Pair & Direction (Dezelfde code als voorheen, maar ingekort voor leesbaarheid) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-pip-muted">Pair *</label>
                  <input name="pair" value={formData.pair} onChange={handleChange} type="text" placeholder="EURUSD" className={`w-full bg-pip-dark border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-pip-gold uppercase ${errors.pair ? 'border-pip-red' : 'border-pip-border'}`} />
                  {errors.pair && <p className="text-xs text-pip-red">{errors.pair}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-pip-muted">Direction</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button onClick={() => setFormData(prev => ({ ...prev, direction: 'LONG' }))} className={`py-2 rounded-lg font-bold border ${formData.direction === 'LONG' ? 'bg-pip-green/20 text-pip-green border-pip-green' : 'bg-pip-card text-pip-muted border-pip-border'}`}>LONG</button>
                    <button onClick={() => setFormData(prev => ({ ...prev, direction: 'SHORT' }))} className={`py-2 rounded-lg font-bold border ${formData.direction === 'SHORT' ? 'bg-pip-red/20 text-pip-red border-pip-red' : 'bg-pip-card text-pip-muted border-pip-border'}`}>SHORT</button>
                  </div>
                </div>
              </div>

              {/* Rij 2: Prijzen (Entry, SL, TP) */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-pip-muted">Entry *</label>
                  <input name="entryPrice" value={formData.entryPrice} onChange={handleChange} type="number" step="0.00001" className={`w-full bg-pip-dark border rounded-lg px-4 py-2 text-white ${errors.entryPrice ? 'border-pip-red' : 'border-pip-border'}`} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-pip-muted">SL *</label>
                  <input name="stopLoss" value={formData.stopLoss} onChange={handleChange} type="number" step="0.00001" className={`w-full bg-pip-dark border rounded-lg px-4 py-2 text-white ${errors.stopLoss ? 'border-pip-red' : 'border-pip-border'}`} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-pip-muted">TP</label>
                  <input name="takeProfit" value={formData.takeProfit} onChange={handleChange} type="number" step="0.00001" className="w-full bg-pip-dark border border-pip-border rounded-lg px-4 py-2 text-white" />
                </div>
              </div>

              {/* Rij 3: PnL + NIEUW: Setup & Emotion */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <div className="space-y-2">
                    <label className="text-sm font-medium text-pip-muted">Realized PnL *</label>
                    <input name="pnl" value={formData.pnl} onChange={handleChange} type="number" placeholder="+/-" className={`w-full bg-pip-dark border rounded-lg px-4 py-2 text-white ${errors.pnl ? 'border-pip-red' : 'border-pip-border'} ${formData.pnl && parseFloat(formData.pnl) > 0 ? 'text-pip-green' : formData.pnl ? 'text-pip-red' : ''}`} />
                 </div>

                 {/* SETUP SELECTOR */}
                 <div className="space-y-2">
                    <label className="text-sm font-medium text-pip-muted">Strategy / Setup</label>
                    <select name="setup" value={formData.setup} onChange={handleChange} className="w-full bg-pip-dark border border-pip-border rounded-lg px-4 py-2 text-white focus:border-pip-gold outline-none">
                        {SETUPS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                 </div>

                 {/* EMOTION SELECTOR */}
                 <div className="space-y-2">
                    <label className="text-sm font-medium text-pip-muted">Emotion</label>
                    <select name="emotion" value={formData.emotion} onChange={handleChange} className="w-full bg-pip-dark border border-pip-border rounded-lg px-4 py-2 text-white focus:border-pip-gold outline-none">
                        {EMOTIONS.map(e => <option key={e} value={e}>{e}</option>)}
                    </select>
                 </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-pip-muted">Chart URL</label>
                <input name="chartUrl" value={formData.chartUrl} onChange={handleChange} type="url" className="w-full bg-pip-dark border border-pip-border rounded-lg px-4 py-2 text-white" />
              </div>
            </div>

            <div className="p-6 border-t border-pip-border flex justify-end gap-3">
              <button onClick={onClose} className="px-4 py-2 text-pip-muted hover:text-white transition-colors">Cancel</button>
              <button onClick={handleSave} className="bg-pip-gold hover:bg-pip-gold-dim text-pip-dark font-bold px-6 py-2 rounded-lg flex items-center gap-2 transition-transform active:scale-95"><Save size={18} /> Save</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AddTradeModal;