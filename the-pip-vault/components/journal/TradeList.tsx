"use client";

import { useTrades, Trade } from "@/context/TradeContext";
import { useSettings } from "@/context/SettingsContext";
import { useProfile } from "@/context/ProfileContext";
import { LoadingCard } from "../ui/Loadingcard";
import { Activity, Calendar, Trash2, ExternalLink, Hash, Maximize2, AlertTriangle, CheckCircle, XCircle, MinusCircle, Clock, Edit2, MessageSquare } from "lucide-react";
import { useState } from "react";
import AddTradeModal from "@/components/modals/AddTradeModal";

const TradeList = () => {
  const { trades, deleteTrade, loading } = useTrades();
  const [editingTrade, setEditingTrade] = useState<Trade | null>(null);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 bg-pip-card border border-pip-border rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }
  const sortedTrades = [...trades].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (trades.length === 0) {
    return (
      <div className="text-center py-16 bg-pip-card border border-dashed border-pip-border rounded-xl">
        <div className="bg-pip-dark w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-pip-border">
          <Activity className="text-pip-muted" size={24} />
        </div>
        <h3 className="text-lg font-medium text-white">Journal Empty</h3>
        <p className="text-pip-muted mt-2 text-sm">No trades logged yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sortedTrades.map((trade) => (
        <TradeCard key={trade.id} trade={trade} onDelete={deleteTrade} onEdit={setEditingTrade} />
      ))}

      {editingTrade && (
        <AddTradeModal
          isOpen={!!editingTrade}
          onClose={() => setEditingTrade(null)}
          tradeToEdit={editingTrade}
        />
      )}
    </div>
  );
};

const TradeCard = ({ trade, onDelete, onEdit }: { trade: Trade; onDelete: (id: string) => void; onEdit: (trade: Trade) => void }) => {
  const { viewMode } = useSettings();
  const { profile } = useProfile();

  let tradeValue = trade.pnl;
  // Use trade-specific asset type if available, otherwise fallback (though fetch should ensure default)
  const assetType = trade.asset_type || 'forex';
  let label = assetType === 'futures' ? 'Points' : 'Pips';
  let prefix = '';
  let suffix = '';
  let decimals = 0;

  if (viewMode === 'currency') {
    tradeValue = trade.pnl_currency || 0;
    label = 'Profit';
    prefix = '$';
    decimals = 2;
  } else if (viewMode === 'percentage') {
    const startEquity = profile.starting_equity || 10000; // Fallback to 10k if 0
    const currencyPnl = trade.pnl_currency || 0;
    tradeValue = (currencyPnl / startEquity) * 100;
    label = 'Return';
    suffix = '%';
    decimals = 2;
  }

  const isWin = tradeValue > 0;
  const isLoss = tradeValue < 0;

  const statusColor = isWin ? 'bg-pip-green' : isLoss ? 'bg-pip-red' : 'bg-pip-muted';
  const textColor = isWin ? 'text-pip-green' : isLoss ? 'text-pip-red' : 'text-pip-muted';
  const borderColor = isWin ? 'group-hover:border-pip-green/50' : isLoss ? 'group-hover:border-pip-red/50' : 'group-hover:border-pip-gold/50';

  const getEmotionStyle = (emotion: string) => {
    const e = emotion || 'Neutral';

    if (e === 'Confident') {
      return { style: 'text-pip-green border-pip-green/30 bg-pip-green/10', icon: CheckCircle };
    }
    if (e === 'Hesitant') {
      return { style: 'text-pip-gold border-pip-gold/30 bg-pip-gold/10', icon: AlertTriangle };
    }
    if (e === 'Neutral') {
      return { style: 'text-pip-muted border-pip-border bg-pip-dark', icon: MinusCircle };
    }
    return { style: 'text-pip-red border-pip-red/30 bg-pip-red/10', icon: XCircle };
  };

  const emotionConfig = getEmotionStyle(trade.emotion || 'Neutral');
  const EmotionIcon = emotionConfig.icon;

  return (
    <div className={`group relative bg-pip-card border border-pip-border rounded-lg overflow-hidden transition-all duration-300 hover:shadow-lg ${borderColor}`}>
      <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${statusColor}`} />

      <div className="flex flex-col sm:flex-row p-4 pl-6 gap-6">
        <div className="shrink-0">
          {trade.chartUrl ? (
            <a href={trade.chartUrl} target="_blank" rel="noreferrer" className="block w-full sm:w-48 h-32 bg-pip-dark rounded-md overflow-hidden border border-pip-border relative group/image">
              <img
                src={trade.chartUrl}
                alt="Trade Chart"
                className="w-full h-full object-cover opacity-80 group-hover/image:opacity-100 transition-opacity"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                  (e.target as HTMLImageElement).parentElement!.classList.add('flex', 'items-center', 'justify-center');
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover/image:opacity-100 transition-all">
                <Maximize2 size={24} className="text-white transform scale-75 group-hover/image:scale-100 transition-transform" />
              </div>
            </a>
          ) : (
            <div className="w-full sm:w-48 h-32 bg-pip-dark rounded-md border border-pip-border border-dashed flex flex-col items-center justify-center text-pip-muted/40">
              <Activity size={24} />
              <span className="text-[10px] mt-2 uppercase tracking-wide">No Chart</span>
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-xl font-bold text-white tracking-wide">{trade.pair}</h3>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase border ${trade.direction === 'LONG' ? 'bg-pip-green/10 text-pip-green border-pip-green/20' : 'bg-pip-red/10 text-pip-red border-pip-red/20'}`}>
              {trade.direction}
            </span>
            <span className="text-pip-muted text-xs flex items-center gap-1 ml-auto sm:ml-0">
              <Calendar size={12} />
              {new Date(trade.date).toLocaleDateString('en-US', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {trade.setup && (
              <div className="flex items-center gap-1.5 text-xs text-pip-muted bg-pip-dark px-2 py-1 rounded border border-pip-border/50">
                <Hash size={12} className="text-pip-gold" />
                <span>{trade.setup}</span>
              </div>
            )}

            {/* SESSION BADGE - NEW */}
            {trade.session && (
              <div className="flex items-center gap-1.5 text-xs text-pip-muted bg-pip-dark px-2 py-1 rounded border border-pip-border/50">
                <Clock size={12} className="text-pip-gold" />
                <span>{trade.session} Session</span>
              </div>
            )}

            <div className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded border ${emotionConfig.style}`}>
              <EmotionIcon size={12} strokeWidth={2.5} />
              <span className="font-medium">{trade.emotion || 'Neutral'}</span>
            </div>
          </div>

          {trade.comment && (
            <div className="flex gap-2 mb-4 text-xs text-pip-muted/80 italic border-l-2 border-pip-border pl-3 py-1">
              <MessageSquare size={12} className="shrink-0 mt-0.5" />
              <p className="line-clamp-2">{trade.comment}</p>
            </div>
          )}

          <div className="grid grid-cols-3 gap-4 border-t border-pip-border pt-3">
            <div><span className="text-[10px] text-pip-muted uppercase font-semibold">Entry</span><p className="text-white font-mono text-sm">{trade.entryPrice}</p></div>
            <div><span className="text-[10px] text-pip-muted uppercase font-semibold">SL</span><p className="text-pip-muted font-mono text-sm">{trade.stopLoss}</p></div>
            <div><span className="text-[10px] text-pip-muted uppercase font-semibold">TP</span><p className="text-white font-mono text-sm">{trade.takeProfit || '-'}</p></div>
          </div>
        </div>

        <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-4 sm:pl-6 sm:border-l border-pip-border min-w-30">
          <div className="text-right">
            <div className={`text-2xl font-bold ${textColor}`}>
              {tradeValue > 0 ? '+' : ''}{prefix}{tradeValue.toFixed(decimals)}{suffix}
            </div>
            <div className="text-xs text-pip-muted uppercase tracking-wider font-medium">{label}</div>
          </div>
          {trade.rrRatio && (
            <div className={`text-xs px-2 py-1 rounded font-mono border ${isWin ? 'bg-pip-green/10 text-pip-green border-pip-green/30' : 'bg-pip-dark text-pip-muted border-pip-border'}`}>
              {trade.rrRatio}R Plan
            </div>
          )}
          <div className="flex items-center gap-3 mt-1">
            {trade.chartUrl && (
              <a href={trade.chartUrl} target="_blank" rel="noreferrer" className="text-pip-muted hover:text-pip-gold p-1"><ExternalLink size={16} /></a>
            )}
            <button onClick={() => onEdit(trade)} className="text-pip-muted hover:text-pip-green p-1 transition-opacity"><Edit2 size={16} /></button>
            <button onClick={() => onDelete(trade.id)} className="text-pip-muted hover:text-pip-red p-1 transition-opacity"><Trash2 size={16} /></button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradeList;