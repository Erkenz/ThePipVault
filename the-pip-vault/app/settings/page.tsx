"use client";

import { useState, useEffect } from 'react';
import { useProfile } from '@/context/ProfileContext';
import { useTrades } from '@/context/TradeContext';
import ResetVaultModal from '@/components/modals/ResetVaultModal';
import { cn } from '@/lib/utils';
import {
  Save,
  Download,
  Trash2,
  DollarSign,
  Clock,
  AlertTriangle,
  CheckCircle,
  Loader2,
  Sparkles,
  Hash,
  Plus,
  X,
  Activity,
  TrendingUp,
  Layers,
  ShieldCheck,
  Settings,
  User
} from 'lucide-react';

export default function SettingsPage() {
  const { profile, updateProfile, loading: profileLoading, resetTradesOnly, resetSettingsOnly, resetFullAccount } = useProfile();
  const { trades } = useTrades();

  const [firstName, setFirstName] = useState(profile.first_name || '');
  const [lastName, setLastName] = useState(profile.last_name || '');
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

  const handleFullReset = () => {
    setIsResetModalOpen(true);
  };

  useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name || '');
      setLastName(profile.last_name || '');
      setEquity(profile.starting_equity?.toString() || '10000');
      setCurrency(profile.currency || 'USD');
      setSelectedSessions(profile.sessions || []);
      setStrategies(profile.strategies || []);
      setAssetClass(profile.asset_class || 'forex');
      setAccountTypes(profile.account_types || ['Demo', 'Challenge', 'Funded', 'Live']);
    }
  }, [profile]);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      await updateProfile({
        first_name: firstName,
        last_name: lastName,
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

    const headers = [
      "Date", "Pair", "Direction", "Entry Price", "Stop Loss", "Take Profit",
      "PnL (Pips/Points)", "R:R Ratio", "Setup", "Emotion", "Chart URL",
      "Asset Class", "Comment"
    ];

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

    const csvString = [headers.join(";"), ...csvRows.map(row => row.join(";"))].join("\n");
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

  const toggleSession = (session: string) => {
    setSelectedSessions(prev =>
      prev.includes(session) ? prev.filter(s => s !== session) : [...prev, session]
    );
  };

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-muted-foreground">
        <Loader2 className="animate-spin mr-2" /> Loading Command Center...
      </div>
    );
  }

  const unitLabel = assetClass === 'futures' ? 'Points' : 'Pips';

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-24 animate-in fade-in duration-500">
      <header className="flex flex-col gap-2 border-b border-border/40 pb-6">
        <h1 className="text-3xl font-black tracking-tighter uppercase italic flex items-center gap-3">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-400">Command Center</span>
          <Settings className="text-muted-foreground w-6 h-6" />
        </h1>
        <p className="text-muted-foreground font-medium">Configure your vault environment and trading parameters.</p>
      </header>

      {/* PERSONAL PROFILE */}
      <section className="glass-panel p-6 rounded-2xl space-y-6">
        <div className="flex items-center gap-2 text-primary uppercase font-bold text-xs tracking-wider">
          <User size={14} /> Personal Profile
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase text-muted-foreground">First Name</label>
            <input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full bg-background/50 border border-border rounded-xl px-4 py-3 text-foreground outline-none focus:border-primary transition-colors"
              placeholder="Jordy"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase text-muted-foreground">Last Name</label>
            <input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full bg-background/50 border border-border rounded-xl px-4 py-3 text-foreground outline-none focus:border-primary transition-colors"
              placeholder="Erkens"
            />
          </div>
        </div>
      </section>

      {/* ASSET CLASS & PREFERENCES */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-panel p-6 rounded-2xl md:col-span-2 space-y-6 shadow-sm">
          <div className="flex items-center gap-2 text-primary uppercase font-bold text-xs tracking-wider mb-2">
            <Activity size={14} /> Core Trading Mode
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => setAssetClass('forex')}
              type="button"
              className={cn(
                "relative p-6 rounded-xl border transition-all duration-200 flex flex-col items-center gap-3 group text-center",
                assetClass === 'forex'
                  ? "bg-primary/10 border-primary text-primary shadow-lg shadow-primary/5"
                  : "bg-background/50 border-transparent hover:bg-muted/50 text-muted-foreground hover:text-foreground"
              )}
            >
              <DollarSign size={32} className={cn("transition-colors", assetClass === 'forex' ? "text-primary" : "text-muted-foreground group-hover:text-primary")} />
              <div>
                <span className="font-extrabold text-lg block tracking-tight">FOREX MARKETS</span>
                <span className="text-[10px] uppercase opacity-70 font-semibold">Pips Calculation System</span>
              </div>
              {assetClass === 'forex' && <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(59,130,246,0.6)]" />}
            </button>

            <button
              onClick={() => setAssetClass('futures')}
              type="button"
              className={cn(
                "relative p-6 rounded-xl border transition-all duration-200 flex flex-col items-center gap-3 group text-center",
                assetClass === 'futures'
                  ? "bg-primary/10 border-primary text-primary shadow-lg shadow-primary/5"
                  : "bg-background/50 border-transparent hover:bg-muted/50 text-muted-foreground hover:text-foreground"
              )}
            >
              <TrendingUp size={32} className={cn("transition-colors", assetClass === 'futures' ? "text-primary" : "text-muted-foreground group-hover:text-primary")} />
              <div>
                <span className="font-extrabold text-lg block tracking-tight">FUTURES / INDICES</span>
                <span className="text-[10px] uppercase opacity-70 font-semibold">Points/Ticks Calculation System</span>
              </div>
              {assetClass === 'futures' && <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(59,130,246,0.6)]" />}
            </button>
          </div>
        </div>

        {/* ACCOUNT CONFIG */}
        <div className="glass-panel p-6 rounded-2xl space-y-6">
          <div className="flex items-center gap-2 text-primary uppercase font-bold text-xs tracking-wider">
            <ShieldCheck size={14} /> Account Parameters
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase text-muted-foreground">Starting Balance</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">{currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '£'}</span>
                <input
                  type="number"
                  value={equity}
                  onChange={(e) => setEquity(e.target.value)}
                  className="w-full bg-background/50 border border-border rounded-xl pl-10 pr-4 py-3 text-foreground font-mono transition-all focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  placeholder="10000"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase text-muted-foreground">Base Currency</label>
              <div className="grid grid-cols-3 gap-2">
                {['USD', 'EUR', 'GBP'].map((curr) => (
                  <button
                    key={curr}
                    onClick={() => setCurrency(curr)}
                    className={cn(
                      "py-2 rounded-lg text-sm font-bold transition-all border",
                      currency === curr
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-transparent border-transparent hover:bg-muted text-muted-foreground"
                    )}
                  >
                    {curr}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* SESSIONS */}
        <div className="glass-panel p-6 rounded-2xl space-y-6">
          <div className="flex items-center gap-2 text-primary uppercase font-bold text-xs tracking-wider">
            <Clock size={14} /> Active Sessions
          </div>

          <div className="flex flex-col gap-2">
            {['London', 'New York', 'Asia'].map(session => (
              <button
                key={session}
                onClick={() => toggleSession(session)}
                className={cn(
                  "flex items-center justify-between p-3 rounded-xl border transition-all duration-200",
                  selectedSessions.includes(session)
                    ? "border-primary/50 bg-primary/5 text-foreground"
                    : "border-transparent bg-background/30 text-muted-foreground hover:bg-background/50"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className={cn("w-2 h-2 rounded-full", selectedSessions.includes(session) ? "bg-primary animate-pulse" : "bg-muted")} />
                  <span className="font-semibold text-sm">{session} Session</span>
                </div>
                {selectedSessions.includes(session) && <CheckCircle size={16} className="text-primary" />}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* STRATEGIES & TYPES */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* STRATEGIES */}
        <div className="glass-panel p-6 rounded-2xl space-y-6">
          <div className="flex items-center gap-2 text-primary uppercase font-bold text-xs tracking-wider">
            <Hash size={14} /> Strategy Playbook
          </div>

          <div className="flex gap-2">
            <input
              value={newStrategy}
              onChange={(e) => setNewStrategy(e.target.value)}
              placeholder="e.g. ICT Silver Bullet"
              className="flex-1 bg-background/50 border border-border rounded-xl px-4 py-2 text-sm outline-none focus:border-primary transition-colors"
            />
            <button onClick={addStrategy} className="bg-primary hover:bg-primary/90 text-white p-2.5 rounded-xl transition-colors">
              <Plus size={18} />
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {(Array.isArray(strategies) ? strategies : []).map((strat) => (
              <div key={strat} className="group flex items-center gap-2 bg-background/50 border border-border px-3 py-1.5 rounded-lg text-sm text-foreground/80 hover:border-primary/30 transition-colors">
                {strat}
                <button onClick={() => removeStrategy(strat)} className="text-muted-foreground hover:text-destructive transition-colors">
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* ACCOUNT TYPES */}
        <div className="glass-panel p-6 rounded-2xl space-y-6">
          <div className="flex items-center gap-2 text-primary uppercase font-bold text-xs tracking-wider">
            <Layers size={14} /> Account Tags
          </div>

          <div className="flex gap-2">
            <input
              value={newAccountType}
              onChange={(e) => setNewAccountType(e.target.value)}
              placeholder="e.g. Prop Firm - 100k"
              className="flex-1 bg-background/50 border border-border rounded-xl px-4 py-2 text-sm outline-none focus:border-primary transition-colors"
            />
            <button onClick={addAccountType} className="bg-primary hover:bg-primary/90 text-white p-2.5 rounded-xl transition-colors">
              <Plus size={18} />
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {(Array.isArray(accountTypes) ? accountTypes : []).map((type) => (
              <div key={type} className="group flex items-center gap-2 bg-background/50 border border-border px-3 py-1.5 rounded-lg text-sm text-foreground/80 hover:border-primary/30 transition-colors">
                {type}
                <button onClick={() => removeAccountType(type)} className="text-muted-foreground hover:text-destructive transition-colors">
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ACTION BAR */}
      <div className="fixed bottom-6 right-6 md:right-12 z-50">
        <button
          onClick={handleSaveProfile}
          disabled={isSaving}
          className="bg-primary hover:bg-primary/90 text-white font-bold px-8 py-4 rounded-full shadow-2xl shadow-primary/30 flex items-center gap-3 transition-all hover:-translate-y-1 active:scale-95 disabled:opacity-50 disabled:translate-y-0"
        >
          {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
          {showSaved ? "SAVED SUCCESSFULLY" : "SAVE CHANGES"}
        </button>
      </div>

      {/* DANGER & EXPORT */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8 border-t border-border/40 opacity-80 hover:opacity-100 transition-opacity">
        <div className="p-6 rounded-2xl border border-dashed border-border hover:bg-muted/30 transition-colors space-y-4">
          <h3 className="font-bold text-foreground flex items-center gap-2 text-sm uppercase">
            <Download size={16} /> Data Export
          </h3>
          <p className="text-xs text-muted-foreground">Download all trade data as CSV.</p>
          <button onClick={handleExportCSV} className="text-xs font-bold text-primary hover:underline">
            Download CSV
          </button>
        </div>

        <div className="p-6 rounded-2xl border border-dashed border-destructive/30 hover:bg-destructive/5 transition-colors space-y-4">
          <h3 className="font-bold text-destructive flex items-center gap-2 text-sm uppercase">
            <AlertTriangle size={16} /> Danger Zone
          </h3>
          <p className="text-xs text-muted-foreground">Permanent actions to reset your vault.</p>
          <button onClick={handleFullReset} className="text-xs font-bold text-destructive hover:underline">
            Reset All Data
          </button>
        </div>
      </div>

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