"use client";

import { useState, useEffect } from 'react';
import { useProfile } from '@/context/ProfileContext';
import { useTrades } from '@/context/TradeContext';
import ResetVaultModal from '@/components/modals/ResetVaultModal';
import { 
  Save, 
  Download, 
  Trash2, 
  DollarSign, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  Loader2,
  AlertCircle,
  Hash,
  Plus,
  X
} from 'lucide-react';

export default function SettingsPage() {
  const { profile, updateProfile, loading: profileLoading, resetTradesOnly, resetSettingsOnly, resetFullAccount } = useProfile();
  const { trades, loading: tradesLoading } = useTrades();
  
  // Lokale states voor formulierbeheer
  const [equity, setEquity] = useState(profile.starting_equity.toString());
  const [currency, setCurrency] = useState(profile.currency);
  const [selectedSessions, setSelectedSessions] = useState<string[]>(profile.sessions);
  const [strategies, setStrategies] = useState<string[]>(profile.strategies || []);
  const [newStrategy, setNewStrategy] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  // Zorg dat lokale state synchroniseert als het profiel geladen is
  useEffect(() => {
    setEquity(profile.starting_equity.toString());
    setCurrency(profile.currency);
    setSelectedSessions(profile.sessions);
    setStrategies(profile.strategies || []);
  }, [profile]);

  // --- Handlers ---

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      await updateProfile({
        starting_equity: parseFloat(equity),
        currency: currency,
        sessions: selectedSessions,
        strategies: strategies
      });
      setShowSaved(true);
      setTimeout(() => setShowSaved(false), 3000);
    } catch (err) {
      console.error(err);
      alert("Fout bij opslaan profiel.");
    } finally {
      setIsSaving(false);
    }
  };

  const addStrategy = () => {
    if (newStrategy.trim() && !strategies.includes(newStrategy.trim())) {
      setStrategies([...strategies, newStrategy.trim()]);
      setNewStrategy('');
    }
  };

  const removeStrategy = (stratToRemove: string) => {
    setStrategies(strategies.filter(s => s !== stratToRemove));
  };

  const handleExportCSV = () => {
    if (trades.length === 0) return alert("Geen trades om te exporteren.");
    
    // 1. Headers definiëren (Uitgebreide set)
    const headers = [
      "Date", 
      "Pair", 
      "Direction", 
      "Entry Price", 
      "Stop Loss", 
      "Take Profit", 
      "PnL (Pips)", 
      "R:R Ratio",
      "Setup", 
      "Emotion", 
      "Chart URL"
    ];
    
    // 2. Data transformeren naar CSV rijen
    const csvRows = trades.map(t => [
      new Date(t.date).toISOString().split('T')[0],
      t.pair,
      t.direction,
      t.entryPrice.toString().replace('.', ','), 
      (t.stopLoss || 0).toString().replace('.', ','),
      (t.takeProfit || 0).toString().replace('.', ','),
      t.pnl.toString().replace('.', ','),
      (t.rrRatio || 0).toString().replace('.', ','),
      `"${t.setup || ""}"`, 
      `"${t.emotion || ""}"`,
      t.chartUrl || ""
    ]);

    // 3. Samenvoegen tot CSV string
    const csvString = [
      headers.join(";"), 
      ...csvRows.map(row => row.join(";"))
    ].join("\n");

    // 4. Download proces
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    
    const today = new Date().toISOString().split('T')[0];
    link.setAttribute("download", `PipVault_Backup_${today}.csv`);
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFullReset = () => {
    setIsResetModalOpen(true);
  };

  const toggleSession = (session: string) => {
    setSelectedSessions(prev => 
      prev.includes(session) ? prev.filter(s => s !== session) : [...prev, session]
    );
  };

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-pip-muted">
        <Loader2 className="animate-spin mr-2" /> Loading Command Center...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-8 space-y-10 pb-20 font-sans">
      <header>
        <h1 className="text-3xl font-black text-white uppercase tracking-tighter italic">Command Center</h1>
        <p className="text-pip-muted">Beheer je handelskapitaal en systeemvoorkeuren.</p>
      </header>

      {/* Melding als er nog geen database record is */}
      {profile.starting_equity === 10000 && (
        <div className="bg-pip-gold/10 border border-pip-gold/20 p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
          <AlertCircle className="text-pip-gold shrink-0" size={20} />
          <p className="text-sm text-white/90">
            <strong>Eerste keer?</strong> Pas je startkapitaal aan en klik op Save om je profiel in de database te activeren.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* FINANCIAL SETTINGS */}
        <div className="bg-pip-card border border-pip-border rounded-2xl p-6 space-y-6 shadow-xl">
          <h3 className="text-sm font-bold text-pip-gold uppercase flex items-center gap-2 tracking-widest">
            <DollarSign size={16} /> Account Capital
          </h3>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-pip-muted uppercase">Starting Equity</label>
              <div className="relative">
                <input 
                  type="number" 
                  value={equity}
                  onChange={(e) => setEquity(e.target.value)}
                  className="w-full bg-pip-dark border border-pip-border rounded-xl px-4 py-3 text-white focus:border-pip-gold outline-none transition-colors"
                  placeholder="10000"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-pip-muted uppercase">Currency Display</label>
              <select 
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full bg-pip-dark border border-pip-border rounded-xl px-4 py-3 text-white focus:border-pip-gold outline-none appearance-none"
              >
                <option value="USD">USD ($) - US Dollar</option>
                <option value="EUR">EUR (€) - Euro</option>
                <option value="GBP">GBP (£) - British Pound</option>
              </select>
            </div>
          </div>
        </div>

        {/* SESSION SETTINGS */}
        <div className="bg-pip-card border border-pip-border rounded-2xl p-6 space-y-6 shadow-xl">
          <h3 className="text-sm font-bold text-pip-gold uppercase flex items-center gap-2 tracking-widest">
            <Clock size={16} /> Trading Sessions
          </h3>
          <div className="grid grid-cols-1 gap-3">
            {['London', 'New York', 'Asia'].map(session => (
              <button
                key={session}
                onClick={() => toggleSession(session)}
                className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-200 ${
                  selectedSessions.includes(session) 
                  ? 'border-pip-gold bg-pip-gold/5 text-white' 
                  : 'border-pip-border bg-pip-dark text-pip-muted hover:border-white/20'
                }`}
              >
                <span className="font-bold tracking-tight">{session} Session</span>
                {selectedSessions.includes(session) ? (
                  <CheckCircle size={18} className="text-pip-gold" />
                ) : (
                  <div className="w-4 h-4 rounded-full border border-pip-border" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* STRATEGY MANAGEMENT - NEW SECTION */}
      <div className="bg-pip-card border border-pip-border rounded-2xl p-6 space-y-6 shadow-xl">
        <h3 className="text-sm font-bold text-pip-gold uppercase flex items-center gap-2 tracking-widest">
          <Hash size={16} /> Strategy Playbook
        </h3>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <input 
            type="text" 
            value={newStrategy}
            onChange={(e) => setNewStrategy(e.target.value)}
            placeholder="Bijv. ICT Silver Bullet..."
            className="flex-1 bg-pip-dark border border-pip-border rounded-xl px-4 py-2 text-white outline-none focus:border-pip-gold"
          />
          <button 
            onClick={addStrategy}
            className="bg-pip-gold hover:bg-pip-gold-dim text-pip-dark font-black px-6 py-2 rounded-xl flex items-center justify-center gap-2 transition-all"
          >
            <Plus size={18} /> ADD STRATEGY
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {strategies.map((strat) => (
            <div 
              key={strat} 
              className="flex items-center gap-2 bg-pip-dark border border-pip-border px-3 py-2 rounded-xl group"
            >
              <span className="text-sm font-medium text-white">{strat}</span>
              <button 
                onClick={() => removeStrategy(strat)}
                className="text-pip-muted hover:text-pip-red transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* SAVE ACTIONS */}
      <div className="flex flex-col sm:flex-row items-center justify-between bg-pip-card border border-pip-border p-6 rounded-2xl gap-4 shadow-lg">
        <div className="text-center sm:text-left">
          <p className="text-sm font-bold text-white uppercase italic">Systeem Update</p>
          <p className="text-xs text-pip-muted">Wijzigingen hebben direct invloed op Dashboard metrics.</p>
        </div>
        <button 
          onClick={handleSaveProfile}
          disabled={isSaving}
          className="w-full sm:w-auto bg-pip-gold hover:bg-pip-gold-dim text-pip-dark font-black px-10 py-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 shadow-lg shadow-pip-gold/20"
        >
          {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
          {showSaved ? "PROFIEL BIJGEWERKT!" : "SAVE CONFIGURATION"}
        </button>
      </div>

      {/* TOOLS & MAINTENANCE */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-pip-border/50">
        <div className="space-y-4">
          <h3 className="font-bold text-white uppercase flex items-center gap-2 italic">
            <Download size={18} className="text-pip-muted" /> Data Intelligence
          </h3>
          <p className="text-xs text-pip-muted">Exporteer je volledige handelsgeschiedenis naar een CSV bestand voor externe analyse in Excel of Sheets.</p>
          <button 
            onClick={handleExportCSV}
            className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
          >
            <Download size={18} /> DOWNLOAD CSV EXPORT
          </button>
        </div>

        <div className="space-y-4">
          <h3 className="font-bold text-pip-red uppercase flex items-center gap-2 italic">
            <AlertTriangle size={18} /> Danger Zone
          </h3>
          <p className="text-xs text-pip-muted font-medium">Wis alle opgeslagen trades in je kluis. Je profielinstellingen en account blijven bestaan. Actie is permanent.</p>
          <button 
            onClick={handleFullReset}
            className="w-full bg-pip-red/10 hover:bg-pip-red/20 border border-pip-red/30 text-pip-red py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
          >
            <Trash2 size={18} /> RESET TRADE HISTORY
          </button>
        </div>
      </div>

      {/* RESET MODAL */}
      <ResetVaultModal 
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onResetTrades={resetTradesOnly}
        onResetSettings={resetSettingsOnly}
        onResetAll={resetFullAccount}
      />
    </div>
  );
}