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
  pnl: string; // <--- NIEUW: String input, parsen we later naar number
}

interface FormErrors {
  pair?: string;
  entryPrice?: string;
  stopLoss?: string;
  pnl?: string;
}

const AddTradeModal = ({ isOpen, onClose }: AddTradeModalProps) => {
  const { addTrade } = useTrades();

  // State
  const [formData, setFormData] = useState<TradeFormData>({
    pair: '',
    direction: 'LONG',
    entryPrice: '',
    stopLoss: '',
    takeProfit: '',
    chartUrl: '',
    pnl: '' // Leeg beginnen
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
        pnl: ''
      });
      setCalculations({ risk: 0, reward: 0, rrRatio: 0 });
      setErrors({});
      setShowSuccess(false);
    }
  }, [isOpen]);

  // Automatische berekeningen (Pips & RR voor de planning)
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    if (!formData.pnl) newErrors.pnl = "Vul het resultaat in";

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
      pnl: parseFloat(formData.pnl) // <--- Opslaan als getal (+ of -)
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
            <h3 className="text-2xl font-bold text-white">Trade Logged!</h3>
            <p className="text-pip-muted">Succesvol toegevoegd aan journal.</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between p-6 border-b border-pip-border">
              <h2 className="text-xl font-bold text-white flex items-center gap-3">
                Log Past Trade
              </h2>
              <button onClick={onClose} className="text-pip-muted hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              
              {/* Rij 1: Pair & Direction */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-pip-muted">Pair <span className="text-pip-red">*</span></label>
                  <input 
                    name="pair"
                    value={formData.pair}
                    onChange={handleChange}
                    type="text" 
                    placeholder="EURUSD" 
                    className={`w-full bg-pip-dark border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-pip-gold transition-colors uppercase 
                      ${errors.pair ? 'border-pip-red' : 'border-pip-border'}`}
                  />
                  {errors.pair && <p className="text-xs text-pip-red flex items-center gap-1"><AlertCircle size={12}/> {errors.pair}</p>}
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-pip-muted">Direction</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      onClick={() => setFormData(prev => ({ ...prev, direction: 'LONG' }))}
                      className={`py-2 rounded-lg font-bold border transition-all ${
                        formData.direction === 'LONG' 
                          ? 'bg-pip-green/20 text-pip-green border-pip-green' 
                          : 'bg-pip-card text-pip-muted border-pip-border hover:border-pip-green'
                      }`}
                    >
                      LONG
                    </button>
                    <button 
                      onClick={() => setFormData(prev => ({ ...prev, direction: 'SHORT' }))}
                      className={`py-2 rounded-lg font-bold border transition-all ${
                        formData.direction === 'SHORT' 
                          ? 'bg-pip-red/20 text-pip-red border-pip-red' 
                          : 'bg-pip-card text-pip-muted border-pip-border hover:border-pip-red'
                      }`}
                    >
                      SHORT
                    </button>
                  </div>
                </div>
              </div>

              {/* Rij 2: Prijzen */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-pip-muted">Entry <span className="text-pip-red">*</span></label>
                  <input 
                    name="entryPrice"
                    value={formData.entryPrice}
                    onChange={handleChange}
                    type="number" step="0.00001" 
                    className={`w-full bg-pip-dark border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-pip-gold transition-colors
                       ${errors.entryPrice ? 'border-pip-red' : 'border-pip-border'}`}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-pip-muted">SL <span className="text-pip-red">*</span></label>
                  <input 
                    name="stopLoss"
                    value={formData.stopLoss}
                    onChange={handleChange}
                    type="number" step="0.00001" 
                    className={`w-full bg-pip-dark border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-pip-red transition-colors
                      ${errors.stopLoss ? 'border-pip-red' : 'border-pip-border'}`}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-pip-muted">TP</label>
                  <input 
                    name="takeProfit"
                    value={formData.takeProfit}
                    onChange={handleChange}
                    type="number" step="0.00001" 
                    className="w-full bg-pip-dark border border-pip-border rounded-lg px-4 py-2 text-white focus:border-pip-green outline-none" 
                  />
                </div>
              </div>

              {/* NIEUW: PnL Input Field */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-pip-muted">Realized PnL <span className="text-pip-red">*</span></label>
                <div className="relative">
                    <input 
                      name="pnl"
                      value={formData.pnl}
                      onChange={handleChange}
                      type="number" 
                      placeholder="+/- 0.00" 
                      className={`w-full bg-pip-dark border rounded-lg px-4 py-3 text-lg font-bold focus:outline-none focus:border-pip-gold transition-colors
                         ${errors.pnl ? 'border-pip-red' : 'border-pip-border'}
                         ${formData.pnl && parseFloat(formData.pnl) > 0 ? 'text-pip-green' : formData.pnl && parseFloat(formData.pnl) < 0 ? 'text-pip-red' : 'text-white'}
                      `}
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-pip-muted">
                        (Use - for loss)
                    </div>
                </div>
                {errors.pnl && <p className="text-xs text-pip-red flex items-center gap-1"><AlertCircle size={12}/> {errors.pnl}</p>}
              </div>

              {/* Calculations Display (Ter info) */}
              {(calculations.rrRatio > 0) && (
                <div className="bg-pip-dark/50 border border-pip-border rounded-lg p-3 flex items-center justify-between text-sm">
                    <div className="flex items-center gap-6 text-pip-muted">
                      <div className="flex items-center gap-2">
                        <Calculator size={16} />
                        <span>Planned Risk: <span className="text-pip-red font-medium">-{calculations.risk}</span></span>
                      </div>
                      <div>
                        <span>Target: <span className="text-pip-green font-medium">+{calculations.reward}</span></span>
                      </div>
                    </div>
                    <div className="text-pip-gold font-bold text-lg">
                      {calculations.rrRatio} R
                    </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-pip-muted">Chart URL</label>
                <input 
                  name="chartUrl"
                  value={formData.chartUrl}
                  onChange={handleChange}
                  type="url" 
                  placeholder="https://..." 
                  className="w-full bg-pip-dark border border-pip-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-pip-gold transition-colors"
                />
              </div>

            </div>

            <div className="p-6 border-t border-pip-border flex justify-end gap-3">
              <button onClick={onClose} className="px-4 py-2 text-pip-muted hover:text-white font-medium transition-colors">
                Cancel
              </button>
              <button onClick={handleSave} className="bg-pip-gold hover:bg-pip-gold-dim text-pip-dark font-bold px-6 py-2 rounded-lg flex items-center gap-2 transition-transform active:scale-95">
                <Save size={18} />
                Save Trade
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AddTradeModal;