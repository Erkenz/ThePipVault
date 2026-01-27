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
  X,
  Settings,
  Activity,
  TrendingUp,
  ListChecks
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
  const [assetClass, setAssetClass] = useState<'forex' | 'futures'>(profile.asset_class || 'forex');
  const [accountTypes, setAccountTypes] = useState<string[]>(profile.account_types || ['Demo', 'Challenge', 'Funded', 'Live']);
  const [newAccountType, setNewAccountType] = useState('');

  // Zorg dat lokale state synchroniseert als het profiel geladen is
  useEffect(() => {
    setEquity(profile.starting_equity.toString());
    setCurrency(profile.currency);
    setSelectedSessions(profile.sessions);
    setStrategies(profile.strategies || []);
    setAssetClass(profile.asset_class || 'forex');
    setAccountTypes(profile.account_types || ['Demo', 'Challenge', 'Funded', 'Live']);
  }, [profile]);

  // --- Handlers ---

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      await updateProfile({
        starting_equity: parseFloat(equity),
        currency: currency,
        sessions: selectedSessions,
        strategies: strategies,
        asset_class: assetClass,
        account_types: accountTypes
      });
      setShowSaved(true);
      setTimeout(() => setShowSaved(false), 3000);
    } catch (err) {
      console.error(err);
      alert("Error saving profile.");
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

  const addAccountType = () => {
    if (newAccountType.trim() && !accountTypes.includes(newAccountType.trim())) {
      setAccountTypes([...accountTypes, newAccountType.trim()]);
      setNewAccountType('');
    }
  };

  const removeAccountType = (typeToRemove: string) => {
    setAccountTypes(accountTypes.filter(t => t !== typeToRemove));
  };

  const handleExportCSV = () => {
    if (trades.length === 0) return alert("No trades to export.");

    // 1. Headers definiëren
    const headers = [
      "Date",
      "Pair",
      "Direction",
      "Entry Price",
      "Stop Loss",
      "Take Profit",
      "PnL (Pips/Points)",
      "R:R Ratio",
      "Setup",
      "Emotion",
      "Chart URL",
      "Asset Class",
      "Comment"
    ];

    // 2. Data transformeren naar CSV rijen
    const csvRows = trades.map(t => [
      new Date(t.date).toISOString().split('T')[0],
      t.pair,
      t.direction,
      t.entryPrice.toString().replace('.', ','),
      (t.stopLoss || 0).toString().replace('.', ','),
      (t.takeProfit || 0).toString().replace('.', ','),
      (t.pnl || 0).toString().replace('.', ','),
      (t.rrRatio || 0).toString().replace('.', ','),
      `"${t.setup || ""}"`,
      `"${t.emotion || ""}"`,
      t.chartUrl || "",
      profile.asset_class || "forex",
      `"${t.comment || ""}"`
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

  const unitLabel = assetClass === 'futures' ? 'Points' : 'Pips';

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <header>
        <h1 className="text-3xl font-black text-pip-text uppercase tracking-tighter italic">Command Center</h1>
        <p className="text-pip-muted">Manage your trading capital and system preferences.</p>
      </header>

      {/* Melding als er nog geen database record is */}
      {profile.starting_equity === 10000 && (
        <div className="bg-pip-gold/10 border border-pip-gold/20 p-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
          <AlertCircle className="text-pip-gold shrink-0" size={20} />
          <p className="text-sm text-pip-text/90">
            <strong>First time?</strong> Adjust your starting capital and click Save to activate your profile in the database.
          </p>
        </div>
      )}

      {/* NEW: TRADING PREFERENCES (ASSET CLASS) */}
      <div className="bg-pip-card border border-pip-border rounded-2xl shadow-lg p-6 space-y-6">
        <h3 className="text-[10px] font-bold text-pip-muted uppercase tracking-wider mb-1 block text-pip-gold flex items-center gap-2 text-sm">
          <Activity size={16} /> Trading Preferences
        </h3>

        <div className="space-y-3">
          <label className="text-sm font-bold text-pip-text uppercase tracking-wider block">Asset Class Mode</label>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setAssetClass('forex')}
              type="button"
              className={`relative p-4 rounded-xl border-2 transition-all group ${assetClass === 'forex'
                ? 'bg-pip-gold/10 border-pip-gold text-pip-text shadow-lg shadow-pip-gold/10'
                : 'bg-background border-pip-border text-pip-muted hover:border-pip-gold/50'
                }`}
            >
              <div className="flex flex-col items-center gap-2">
                <DollarSign size={24} className={assetClass === 'forex' ? 'text-pip-gold' : 'text-pip-muted group-hover:text-pip-gold transition-colors'} />
                <span className="font-bold">FOREX</span>
                <span className="text-[10px] uppercase opacity-70">Pips Calculation</span>
              </div>
              {assetClass === 'forex' && (
                <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-pip-gold shadow-[0_0_10px_rgba(255,215,0,0.5)]" />
              )}
            </button>

            <button
              onClick={() => setAssetClass('futures')}
              type="button"
              className={`relative p-4 rounded-xl border-2 transition-all group ${assetClass === 'futures'
                ? 'bg-pip-gold/10 border-pip-gold text-pip-text shadow-lg shadow-pip-gold/10'
                : 'bg-background border-pip-border text-pip-muted hover:border-pip-gold/50'
                }`}
            >
              <div className="flex flex-col items-center gap-2">
                <TrendingUp size={24} className={assetClass === 'futures' ? 'text-pip-gold' : 'text-pip-muted group-hover:text-pip-gold transition-colors'} />
                <span className="font-bold">FUTURES / INDICES</span>
                <span className="text-[10px] uppercase opacity-70">Points Calculation</span>
              </div>
              {assetClass === 'futures' && (
                <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-pip-gold shadow-[0_0_10px_rgba(255,215,0,0.5)]" />
              )}
            </button>
          </div>
          <p className="text-xs text-pip-muted mt-2">
            Currently displaying: <strong className="text-pip-text">{unitLabel}</strong>. This setting affects labels across the dashboard and journal.
          </p>
        </div>
      </div>

      {/* ACCOUNT TYPES SETTINGS */}
      <div className="bg-pip-card border border-pip-border rounded-2xl shadow-lg p-6 space-y-6">
        <h3 className="text-[10px] font-bold text-pip-muted uppercase tracking-wider mb-1 block text-pip-gold flex items-center gap-2 text-sm">
          <ListChecks size={16} /> Account Types
        </h3>
        <p className="text-xs text-pip-muted">Manage the labels for your different trading accounts (e.g. Prop Firms, Personal).</p>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={newAccountType}
            onChange={(e) => setNewAccountType(e.target.value)}
            placeholder="e.g. My Forex Funds 50k..."
            className="w-full bg-background border border-pip-border rounded-xl px-4 py-3 text-pip-text outline-none focus:border-pip-gold transition-colors placeholder:text-pip-muted/30 flex-1"
            onKeyDown={(e) => e.key === 'Enter' && addAccountType()}
          />
          <button
            onClick={addAccountType}
            className="bg-pip-gold hover:bg-pip-gold-dim text-pip-dark font-black px-6 py-3 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 shadow-lg shadow-pip-gold/10"
          >
            <Plus size={18} /> ADD TYPE
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {accountTypes.map((type) => (
            <div
              key={type}
              className="flex items-center gap-2 bg-background border border-pip-border px-3 py-2 rounded-xl group"
            >
              <span className="text-sm font-medium text-pip-text">{type}</span>
              <button
                onClick={() => removeAccountType(type)}
                className="text-pip-muted hover:text-pip-red transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

        {/* FINANCIAL SETTINGS */}
        <div className="bg-pip-card border border-pip-border rounded-2xl shadow-lg p-6 space-y-6">
          <h3 className="text-[10px] font-bold text-pip-muted uppercase tracking-wider mb-1 block text-pip-gold flex items-center gap-2 text-sm">
            <DollarSign size={16} /> Account Capital
          </h3>

          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-pip-muted uppercase tracking-wider mb-1 block">Starting Equity</label>
              <input
                type="number"
                value={equity}
                onChange={(e) => setEquity(e.target.value)}
                className="w-full bg-background border border-pip-border rounded-xl px-4 py-3 text-pip-text outline-none focus:border-pip-gold transition-colors placeholder:text-pip-muted/30"
                placeholder="10000"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-pip-muted uppercase tracking-wider mb-1 block">Currency Display</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full bg-background border border-pip-border rounded-xl px-4 py-3 text-pip-text outline-none focus:border-pip-gold transition-colors placeholder:text-pip-muted/30 appearance-none"
              >
                <option value="USD">USD ($) - US Dollar</option>
                <option value="EUR">EUR (€) - Euro</option>
                <option value="GBP">GBP (£) - British Pound</option>
              </select>
            </div>
          </div>
        </div>

        {/* SESSION SETTINGS */}
        <div className="bg-pip-card border border-pip-border rounded-2xl shadow-lg p-6 space-y-6">
          <h3 className="text-[10px] font-bold text-pip-muted uppercase tracking-wider mb-1 block text-pip-gold flex items-center gap-2 text-sm">
            <Clock size={16} /> Trading Sessions
          </h3>
          <div className="grid grid-cols-1 gap-3">
            {['London', 'New York', 'Asia'].map(session => (
              <button
                key={session}
                onClick={() => toggleSession(session)}
                className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-200 ${selectedSessions.includes(session)
                  ? 'border-pip-gold bg-pip-gold/5 text-pip-text'
                  : 'border-pip-border bg-background text-pip-muted hover:border-pip-text/20'
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

      {/* STRATEGY MANAGEMENT */}
      <div className="bg-pip-card border border-pip-border rounded-2xl shadow-lg p-6 space-y-6">
        <h3 className="text-[10px] font-bold text-pip-muted uppercase tracking-wider mb-1 block text-pip-gold flex items-center gap-2 text-sm">
          <Hash size={16} /> Strategy Playbook
        </h3>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={newStrategy}
            onChange={(e) => setNewStrategy(e.target.value)}
            placeholder="e.g. ICT Silver Bullet..."
            className="w-full bg-background border border-pip-border rounded-xl px-4 py-3 text-pip-text outline-none focus:border-pip-gold transition-colors placeholder:text-pip-muted/30 flex-1"
          />
          <button
            onClick={addStrategy}
            className="bg-pip-gold hover:bg-pip-gold-dim text-pip-dark font-black px-6 py-3 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 shadow-lg shadow-pip-gold/10"
          >
            <Plus size={18} /> ADD STRATEGY
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {strategies.map((strat) => (
            <div
              key={strat}
              className="flex items-center gap-2 bg-background border border-pip-border px-3 py-2 rounded-xl group"
            >
              <span className="text-sm font-medium text-pip-text">{strat}</span>
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
      <div className="bg-pip-card border border-pip-border rounded-2xl shadow-lg p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-center sm:text-left">
          <p className="text-sm font-bold text-pip-text uppercase italic">System Update</p>
          <p className="text-xs text-pip-muted">Changes directly affect Dashboard metrics.</p>
        </div>
        <button
          onClick={handleSaveProfile}
          disabled={isSaving}
          className="bg-pip-gold hover:bg-pip-gold-dim text-pip-dark font-black px-6 py-3 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 shadow-lg shadow-pip-gold/10 w-full sm:w-auto px-10"
        >
          {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
          {showSaved ? "PROFILE UPDATED!" : "SAVE CONFIGURATION"}
        </button>
      </div>

      {/* TOOLS & MAINTENANCE */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-pip-border/50">
        <div className="space-y-4">
          <h3 className="font-bold text-pip-text uppercase flex items-center gap-2 italic">
            <Download size={18} className="text-pip-muted" /> Data Intelligence
          </h3>
          <p className="text-xs text-pip-muted">Export your full trading history to a CSV file for external analysis in Excel or Sheets.</p>
          <button
            onClick={handleExportCSV}
            className="w-full bg-pip-active hover:bg-pip-active/80 border border-pip-border text-pip-text py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
          >
            <Download size={18} /> DOWNLOAD CSV EXPORT
          </button>
        </div>

        <div className="space-y-4">
          <h3 className="font-bold text-pip-red uppercase flex items-center gap-2 italic">
            <AlertTriangle size={18} /> Danger Zone
          </h3>
          <p className="text-xs text-pip-muted font-medium">Delete all trades in your vault. Your profile settings and account details remain. This action is permanent.</p>
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