"use client";

import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { useTrades, Trade } from "@/context/TradeContext";
import { useProfile } from "@/context/ProfileContext";
import {
  Trash2, ExternalLink, Hash, Edit2,
  AlertTriangle, CheckCircle, XCircle, MinusCircle,
  ArrowUpRight, ArrowDownRight, Minus, Calendar, Clock, DollarSign, Activity, Maximize2, Share2, MessageSquare,
  Filter
} from "lucide-react";
import { useState } from "react";
import AddTradeModal from "@/components/modals/AddTradeModal";
import { cn } from "@/lib/utils";
import CustomSelect from "@/components/ui/CustomSelect";

const MySwal = withReactContent(Swal);

const TradeList = () => {
  const { trades, deleteTrade, loading } = useTrades();
  const { profile } = useProfile();
  const [editingTrade, setEditingTrade] = useState<Trade | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Filters State
  const [filters, setFilters] = useState({
    outcome: 'ALL', // ALL, WIN, LOSS, BE

    session: 'ALL',
    pair: '',
    startDate: '',
    endDate: ''
  });

  if (loading) {
    return (
      <div className="w-full space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-48 w-full bg-card/20 animate-pulse rounded-3xl border border-border/10" />
        ))}
      </div>
    );
  }

  // Filter Logic
  const filteredTrades = trades.filter(trade => {
    // 1. Outcome
    if (filters.outcome !== 'ALL') {
      const pnl = trade.pnl || 0;
      if (filters.outcome === 'WIN' && pnl <= 0) return false;
      if (filters.outcome === 'LOSS' && pnl >= 0) return false;
      if (filters.outcome === 'BE' && pnl !== 0) return false;
    }



    // 3. Session
    if (filters.session !== 'ALL' && trade.session !== filters.session) return false;

    // 4. Pair
    if (filters.pair && !trade.pair.toLowerCase().includes(filters.pair.toLowerCase())) return false;

    // 5. Date Range
    if (filters.startDate) {
      // Create date objects for comparison (ignoring time for the start date comparison generally, 
      // but trade.date has time. Let's compare simplified YYYY-MM-DD or timestamps)
      const tradeDate = new Date(trade.date);
      const start = new Date(filters.startDate);
      // Reset start to 00:00:00 local
      if (tradeDate < start) return false;
    }
    if (filters.endDate) {
      const tradeDate = new Date(trade.date);
      const end = new Date(filters.endDate);
      end.setHours(23, 59, 59, 999); // Include the whole end day
      if (tradeDate > end) return false;
    }

    return true;
  });

  const sortedTrades = [...filteredTrades].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());



  const uniqueSessions = Array.from(new Set(trades.map(t => t.session).filter(Boolean)));
  const sessionOptions = profile.sessions && profile.sessions.length > 0 ? profile.sessions : uniqueSessions;

  return (
    <div className="space-y-6">

      {/* FILTER BAR */}
      <div className="glass-panel p-4 rounded-2xl border border-border/50 flex flex-wrap items-center gap-4 sticky top-4 z-40 backdrop-blur-xl shadow-lg">
        <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider border-r border-border/50 pr-4">
          <Filter size={14} className="text-primary" /> Filters
        </div>

        {/* Outcome Filter */}
        <div className="flex bg-background/50 rounded-lg p-1 border border-border/50">
          {['ALL', 'WIN', 'LOSS'].map(opt => (
            <button
              key={opt}
              onClick={() => setFilters(prev => ({ ...prev, outcome: opt }))}
              className={cn(
                "px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-wider transition-all",
                filters.outcome === opt
                  ? opt === 'WIN' ? "bg-emerald-500/20 text-emerald-500 shadow-sm"
                    : opt === 'LOSS' ? "bg-red-500/20 text-red-500 shadow-sm"
                      : "bg-primary/20 text-primary shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              {opt}
            </button>
          ))}
        </div>

        {/* Date Inputs */}
        <div className="flex items-center gap-2 bg-background/30 p-1 rounded-lg border border-border/30">
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
            className="bg-transparent text-xs text-foreground focus:outline-none p-1 [color-scheme:dark]"
            placeholder="From"
          />
          <span className="text-muted-foreground">-</span>
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
            className="bg-transparent text-xs text-foreground focus:outline-none p-1 [color-scheme:dark]"
            placeholder="To"
          />
        </div>



        {/* Session Filter */}
        <div className="w-[140px]">
          <CustomSelect
            value={filters.session}
            onChange={(val) => setFilters(prev => ({ ...prev, session: val }))}
            options={[
              { value: 'ALL', label: 'All Sessions' },
              ...sessionOptions.filter(Boolean).map(s => ({ value: s || '', label: s || '' }))
            ]}
          />
        </div>

        {/* Pair Search */}
        <input
          placeholder="Search Pair..."
          value={filters.pair}
          onChange={(e) => setFilters(prev => ({ ...prev, pair: e.target.value }))}
          className="bg-background/50 border border-border/50 rounded-lg px-3 py-1.5 text-xs text-foreground focus:border-primary outline-none h-9 placeholder:text-muted-foreground/50 w-32 ml-auto"
        />

        {/* Reset */}
        {(filters.outcome !== 'ALL' || filters.session !== 'ALL' || filters.pair !== '' || filters.startDate !== '' || filters.endDate !== '') && (
          <button
            onClick={() => setFilters({ outcome: 'ALL', session: 'ALL', pair: '', startDate: '', endDate: '' })}
            className="p-2 text-muted-foreground hover:text-destructive transition-colors ml-2"
            title="Reset Filters"
          >
            <XCircle size={16} />
          </button>
        )}
      </div>

      {sortedTrades.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-80 border-2 border-dashed border-border/30 rounded-3xl bg-muted/5">
          <div className="p-4 rounded-full bg-background/50 border border-border/50 mb-4">
            <Activity size={32} className="text-muted-foreground" />
          </div>
          <div className="text-muted-foreground font-black text-lg uppercase tracking-widest opacity-70">No Trades Found</div>
          <div className="text-xs text-muted-foreground/50 mt-1">Try adjusting your filters</div>
        </div>
      ) : (
        <div className="space-y-6">
          {sortedTrades.map((trade) => (
            <TradeCard
              key={trade.id}
              trade={trade}
              onEdit={setEditingTrade}
              onDelete={deleteTrade}
              onPreview={setPreviewImage}
            />
          ))}
        </div>
      )}

      <AddTradeModal
        isOpen={!!editingTrade}
        onClose={() => setEditingTrade(null)}
        tradeToEdit={editingTrade || undefined}
      />

      {/* Lightbox */}
      {previewImage && (
        <div
          className="fixed inset-0 z-[200] bg-background/95 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-300"
          onClick={() => setPreviewImage(null)}
        >
          <img
            src={previewImage}
            alt="Trade Chart"
            className="max-w-full max-h-[90vh] rounded-2xl shadow-2xl border border-border/20 object-contain ring-4 ring-black/50"
          />
          <button
            onClick={() => setPreviewImage(null)}
            className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors p-3 hover:bg-white/10 rounded-full"
          >
            <XCircle size={32} />
          </button>
        </div>
      )}
    </div>
  );
};

const TradeCard = ({ trade, onEdit, onDelete, onPreview }: { trade: Trade, onEdit: (t: Trade) => void, onDelete: (id: string) => void, onPreview: (url: string) => void }) => {
  const handleDelete = () => {
    MySwal.fire({
      title: <span className="text-xl font-black tracking-tight text-white">Delete Trade?</span>,
      html: <p className="text-sm text-muted-foreground/80 font-medium">This action cannot be undone. Are you sure you want to proceed?</p>,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',

      // Modern Glass Styling
      background: 'rgba(15, 23, 42, 0.6)', // dark slate with opacity
      color: '#f8fafc',
      backdrop: `rgba(0,0,0,0.6) backdrop-blur-sm`,

      customClass: {
        popup: 'border border-border/30 rounded-3xl backdrop-blur-xl shadow-2xl',
        confirmButton: 'bg-rose-500 hover:bg-rose-600 text-white font-bold py-2.5 px-6 rounded-xl text-sm transition-all transform hover:scale-105 shadow-lg shadow-rose-500/20',
        cancelButton: 'bg-muted/50 hover:bg-muted text-gray-300 font-bold py-2.5 px-6 rounded-xl text-sm transition-all hover:text-white',
        actions: 'gap-3',
        icon: 'border-none text-rose-500' // Custom icon color
      },
      buttonsStyling: false // Disable default Swal styles to use Tailwind
    }).then((result) => {
      if (result.isConfirmed) {
        onDelete(trade.id);
        MySwal.fire({
          title: 'Deleted!',
          text: 'Trade successfully removed.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false,

          background: 'rgba(15, 23, 42, 0.8)',
          color: '#fff',
          customClass: {
            popup: 'border border-emerald-500/20 rounded-3xl backdrop-blur-xl'
          }
        });
      }
    });
  };
  const tradeValue = trade.pnl_currency || 0;
  const prefix = '$';
  const suffix = '';

  const isWin = tradeValue > 0;
  const isLoss = tradeValue < 0;

  // Emotion Style
  const getEmotionConfig = (e = 'Neutral') => {
    if (e === 'Confident') return { text: 'text-emerald-500', bg: 'bg-emerald-500/10 border-emerald-500/20', icon: CheckCircle };
    if (e === 'Hesitant') return { text: 'text-amber-500', bg: 'bg-amber-500/10 border-amber-500/20', icon: AlertTriangle };
    if (e === 'Neutral') return { text: 'text-slate-400', bg: 'bg-slate-500/10 border-slate-500/20', icon: MinusCircle };
    return { text: 'text-rose-500', bg: 'bg-rose-500/10 border-rose-500/20', icon: XCircle };
  };
  const em = getEmotionConfig(trade.emotion);
  const EmIcon = em.icon;

  return (
    <div className="group relative overflow-hidden rounded-3xl border border-border/40 bg-card/60 hover:bg-card/90 backdrop-blur-md transition-all duration-300 shadow-sm hover:shadow-2xl hover:border-primary/20 flex flex-col md:flex-row">
      {/* Glow Effect */}
      <div className={cn(
        "absolute top-0 right-0 w-64 h-64 blur-[100px] rounded-full opacity-0 group-hover:opacity-20 transition-opacity pointer-events-none",
        isWin ? "bg-emerald-500" : isLoss ? "bg-rose-500" : "bg-blue-500"
      )} />

      {/* 1. Left: Chart Preview */}
      <div
        className="w-full md:w-72 md:min-h-[220px] bg-black/40 relative shrink-0 cursor-zoom-in border-b md:border-b-0 md:border-r border-border/50 group-image overflow-hidden"
        onClick={() => trade.chartUrl ? onPreview(trade.chartUrl) : null}
      >
        {trade.chartUrl ? (
          <>
            <img src={trade.chartUrl} alt="Chart" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100" onError={(e) => (e.target as HTMLImageElement).style.display = 'none'} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-90 group-hover:scale-100">
              <div className="bg-white/10 backdrop-blur-md p-3 rounded-full border border-white/20 shadow-xl">
                <Maximize2 className="text-white" size={24} />
              </div>
            </div>
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground/30 gap-2 bg-[url('/grid-pattern.svg')]">
            <Activity size={32} />
            <span className="text-[10px] font-black uppercase tracking-widest opacity-50">No Chart Data</span>
          </div>
        )}

        {/* Badge Overlay */}
        <div className="absolute top-4 left-4">
          <span className={cn(
            "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border shadow-lg backdrop-blur-xl",
            trade.direction === 'LONG' ? "bg-emerald-500/90 text-white border-emerald-400/50" : "bg-rose-500/90 text-white border-rose-400/50"
          )}>
            {trade.direction}
          </span>
        </div>
      </div>

      {/* 2. Right: Data Grid */}
      <div className="flex-1 p-6 flex flex-col justify-between relative z-10">

        {/* Top Row: Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h3 className="text-3xl font-black text-foreground tracking-tighter">{trade.pair}</h3>
              {trade.session && (
                <span className="px-2 py-0.5 rounded-md bg-muted/30 border border-border/50 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  {trade.session}
                </span>
              )}
            </div>
            <div className="flex items-center gap-4 text-xs font-mono text-muted-foreground">
              <span className="flex items-center gap-1.5"><Calendar size={12} className="text-primary/70" /> {new Date(trade.date).toLocaleDateString()}</span>
              <span className="flex items-center gap-1.5"><Clock size={12} className="text-primary/70" /> {new Date(trade.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>

          {/* PnL Display */}
          <div className="text-right">
            <div className={cn(
              "text-4xl font-black tracking-tighter drop-shadow-2xl",
              isWin ? "text-emerald-500" : isLoss ? "text-rose-500" : "text-muted-foreground"
            )}>
              {isWin ? '+' : ''}{prefix}{tradeValue.toFixed(2)}{suffix}
            </div>
          </div>
        </div>

        {/* Middle Row: Modern Stat Tiles */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">

          {/* R:R Tile */}
          <div className="bg-background/40 border border-border/50 rounded-xl p-3 flex flex-col justify-center gap-1 hover:border-primary/30 transition-colors">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Risk Reward</span>
            <div className="text-sm font-black text-foreground tracking-tight">{trade.rrRatio}<span className="text-muted-foreground text-xs font-medium ml-0.5">R</span></div>
          </div>

          {/* Setup Tile */}
          <div className="bg-background/40 border border-border/50 rounded-xl p-3 flex flex-col justify-center gap-1 hover:border-primary/30 transition-colors">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Strategy</span>
            <div className="text-sm font-bold text-foreground truncate">{trade.setup}</div>
          </div>

          {/* Emotion Tile */}
          <div className={cn("border rounded-xl p-3 flex flex-col justify-center gap-1 transition-colors", em.bg)}>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Psychology</span>
            <div className={cn("text-sm font-bold flex items-center gap-1.5", em.text)}>
              <EmIcon size={14} /> {trade.emotion}
            </div>
          </div>

          {/* Gross PnL Tile */}
          <div className="bg-background/40 border border-border/50 rounded-xl p-3 flex flex-col justify-center gap-1 hover:border-primary/30 transition-colors">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Gross PnL</span>
            <div className="text-sm font-mono font-medium text-foreground opacity-80">
              ${(trade.pnl_currency || 0).toFixed(2)}
            </div>
          </div>
        </div>

        {/* Price Flow - Modern Redesign */}
        <div className="mb-6 bg-background/30 border border-border/30 rounded-2xl p-4 flex flex-wrap gap-y-4 justify-between items-center relative overflow-hidden">
          {/* Decorative background gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent opacity-50 pointer-events-none" />

          {/* Entry */}
          <div className="flex flex-col gap-1 relative z-10 min-w-[60px]">
            <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 hover:text-primary transition-colors cursor-help" title="Entry Price">
              <ArrowUpRight size={10} className="text-foreground" /> ENTRY
            </span>
            <div className="text-sm font-mono font-bold text-foreground tracking-tight pl-0.5">
              {trade.entryPrice}
            </div>
          </div>

          {/* Divider */}
          <div className="hidden sm:block w-px h-8 bg-border/50 transform rotate-12" />

          {/* Stop Loss */}
          <div className="flex flex-col gap-1 relative z-10 min-w-[60px]">
            <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 hover:text-rose-500 transition-colors cursor-help" title="Stop Loss">
              <XCircle size={10} className="text-rose-500" /> SL
            </span>
            <div className="text-sm font-mono font-bold text-rose-400/90 tracking-tight pl-0.5">
              {trade.stopLoss}
            </div>
          </div>

          {/* Divider */}
          <div className="hidden sm:block w-px h-8 bg-border/50 transform rotate-12" />

          {/* Take Profit */}
          <div className="flex flex-col gap-1 relative z-10 min-w-[60px]">
            <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 hover:text-emerald-500 transition-colors cursor-help" title="Take Profit">
              <CheckCircle size={10} className="text-emerald-500" /> TP
            </span>
            <div className="text-sm font-mono font-bold text-emerald-400/90 tracking-tight pl-0.5">
              {trade.takeProfit || <span className="text-muted-foreground opacity-30 text-xs">---</span>}
            </div>
          </div>

          {/* Divider */}
          <div className="hidden sm:block w-px h-8 bg-border/50 transform rotate-12" />

          {/* Exit Price (Highlighted) */}
          <div className="flex flex-col gap-1 relative z-10 min-w-[60px]">
            <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 hover:text-blue-500 transition-colors cursor-help" title="Exit Price">
              <ArrowDownRight size={10} className="text-blue-500" /> EXIT
            </span>
            <div className={cn(
              "text-sm font-mono font-bold tracking-tight pl-0.5 transition-colors",
              trade.exitPrice ? "text-blue-400" : "text-muted-foreground/30"
            )}>
              {trade.exitPrice || "---"}
            </div>
          </div>
        </div>

        {/* Bottom Row: Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-border/30 border-dashed">
          <div className="flex items-center gap-2 text-xs text-muted-foreground max-w-[60%]">
            <MessageSquare size={14} className="shrink-0 opacity-50" />
            <p className="italic truncate opacity-70">
              {trade.comment || "No detailed notes recorded for this execution."}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {trade.chartUrl && (
              <a href={trade.chartUrl} target="_blank" rel="noreferrer" className="p-2.5 bg-background/50 border border-border/50 hover:bg-primary/10 hover:border-primary/30 hover:text-primary rounded-xl transition-all text-muted-foreground transform hover:scale-105" title="Open Link">
                <ExternalLink size={16} />
              </a>
            )}
            <button onClick={() => onEdit(trade)} className="p-2.5 bg-background/50 border border-border/50 hover:bg-muted hover:text-foreground rounded-xl transition-all text-muted-foreground transform hover:scale-105">
              <Edit2 size={16} />
            </button>
            <button onClick={handleDelete} className="p-2.5 bg-background/50 border border-border/50 hover:bg-rose-500/10 hover:border-rose-500/30 hover:text-rose-500 rounded-xl transition-all text-muted-foreground transform hover:scale-105" aria-label="Delete Trade">
              <Trash2 size={16} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default TradeList;