"use client";

import { useTrades, Trade } from "@/context/TradeContext";
import { TrendingUp, Activity, Calendar, Trash2, ExternalLink } from "lucide-react";

const TradeList = () => {
  const { trades, deleteTrade } = useTrades();

  if (trades.length === 0) {
    return (
      <div className="text-center py-16 bg-pip-card border border-dashed border-pip-border rounded-xl">
        <div className="bg-pip-dark w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-pip-border">
          <Activity className="text-pip-muted" size={24} />
        </div>
        <h3 className="text-lg font-medium text-white">Trade Geschiedenis</h3>
        <p className="text-pip-muted mt-2">No trades yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3">
        {trades.map((trade) => (
          <TradeCard key={trade.id} trade={trade} onDelete={deleteTrade} />
        ))}
      </div>
    </div>
  );
};

const TradeCard = ({ trade, onDelete }: { trade: Trade; onDelete: (id: string) => void }) => {
  const isLong = trade.direction === 'LONG';
  const bgBadgeClass = isLong ? 'bg-pip-green/10 text-pip-green' : 'bg-pip-red/10 text-pip-red';

  return (
    <div className="group bg-pip-card border border-pip-border rounded-lg p-4 flex flex-col sm:flex-row gap-6 hover:border-pip-gold/30 transition-all duration-200 shadow-sm">
      
      {/* 1. CHART THUMBNAIL (Links) - NU MET AFBEELDING */}
      <div className="shrink-0">
        {trade.chartUrl ? (
           <a 
            href={trade.chartUrl} 
            target="_blank" 
            rel="noreferrer"
            className="block w-full sm:w-40 h-24 bg-pip-dark rounded-md overflow-hidden border border-pip-border relative group/image"
          >
            {/* De Chart Afbeelding */}
            <img 
              src={trade.chartUrl} 
              alt={`${trade.pair} Chart`}
              className="w-full h-full object-cover opacity-90 group-hover/image:opacity-100 transition-opacity duration-300"
            />
            
            {/* Hover Overlay met Icoon */}
            <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover/image:bg-black/40 transition-all duration-200">
                <ExternalLink size={24} className="text-transparent group-hover/image:text-white transform scale-75 group-hover/image:scale-100 transition-all duration-200" />
            </div>
          </a>
        ) : (
          <div className="w-full sm:w-40 h-24 bg-pip-dark rounded-md border border-pip-border flex flex-col items-center justify-center text-pip-muted/50">
            <Activity size={24} />
            <span className="text-[10px] mt-2 uppercase tracking-wide">No Chart</span>
          </div>
        )}
      </div>

      {/* 2. MIDDEN: Data Grid */}
      <div className="flex-1 flex flex-col justify-center">
        {/* Header Rij */}
        <div className="flex items-center gap-3 mb-4">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider ${bgBadgeClass}`}>
            {trade.direction}
          </span>
          <span className="text-white font-bold text-lg tracking-wide">
            {trade.pair}
          </span>
          <span className="text-pip-muted text-xs flex items-center gap-1">
            <Calendar size={12} />
            {new Date(trade.date).toLocaleDateString('nl-NL', { year: 'numeric', month: '2-digit', day: '2-digit' })}
          </span>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-2 gap-x-8">
            <div>
                <div className="text-[10px] text-pip-muted uppercase font-semibold">Risk (SL)</div>
                <div className="text-white text-sm font-medium">{trade.stopLoss}</div>
            </div>
            
            <div>
                <div className="text-[10px] text-pip-muted uppercase font-semibold">Target (TP)</div>
                <div className="text-white text-sm font-medium">{trade.takeProfit || "-"}</div>
            </div>

            <div>
                <div className="text-[10px] text-pip-muted uppercase font-semibold">Entry</div>
                <div className="text-white text-sm font-medium">{trade.entryPrice}</div>
            </div>

            <div>
                <div className="text-[10px] text-pip-muted uppercase font-semibold">Pips Risk</div>
                <div className="text-pip-muted text-sm font-medium">-{trade.riskPips}</div>
            </div>
        </div>
      </div>

      {/* 3. RECHTS: Resultaat */}
      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 sm:border-l border-pip-border pt-4 sm:pt-0 sm:pl-6 min-w-25">
         <div className="flex flex-col items-end">
             <span className={`text-xl font-bold ${trade.rrRatio >= 2 ? 'text-pip-green' : 'text-pip-gold'}`}>
                +{trade.rewardPips}
             </span>
             <span className="text-xs text-pip-muted font-mono mt-1 px-2 py-1 bg-pip-dark rounded border border-pip-border">
                {trade.rrRatio} R
             </span>
         </div>

         <button 
            onClick={() => onDelete(trade.id)}
            className="mt-0 sm:mt-4 text-pip-muted hover:text-pip-red transition-colors opacity-100 sm:opacity-0 group-hover:opacity-100"
            title="Verwijder trade"
         >
            <Trash2 size={16} />
         </button>
      </div>

    </div>
  );
};

export default TradeList;