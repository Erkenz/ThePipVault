"use client"; 

import { useMemo } from 'react';
import { useTrades } from "@/context/TradeContext";
import ProfitCard from '@/components/dashboard/ProfitsCard';
import { Activity, BarChart2, DollarSign, TrendingUp } from "lucide-react";

export default function Home() {
  const { trades } = useTrades();

  // === KPI LOGICA ===
  const stats = useMemo(() => {
    let grossProfit = 0;
    let grossLoss = 0;
    let winCount = 0;
    let totalPnL = 0;

    trades.forEach(trade => {
      // Gebruik de handmatige PnL input
      totalPnL += trade.pnl;

      if (trade.pnl > 0) {
        grossProfit += trade.pnl;
        winCount++;
      } else if (trade.pnl < 0) {
        // PnL is negatief (bijv -20), we willen de absolute waarde voor de 'Gross Loss' berekening
        grossLoss += Math.abs(trade.pnl);
      }
    });

    const totalTrades = trades.length;
    const winRate = totalTrades > 0 ? (winCount / totalTrades) * 100 : 0;
    
    // Profit Factor: Bruto Winst / Bruto Verlies
    const profitFactor = grossLoss === 0 
      ? (grossProfit > 0 ? grossProfit : 0) 
      : grossProfit / grossLoss;

    return {
      netPnL: parseFloat(totalPnL.toFixed(1)),
      winRate: Math.round(winRate),
      profitFactor: parseFloat(profitFactor.toFixed(2)),
      totalTrades
    };
  }, [trades]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Header section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-pip-text">Dashboard</h1>
          <p className="text-pip-muted text-sm mt-1">
            Performance Overview
          </p>
        </div>
        
        <div className="hidden sm:flex items-center gap-2 bg-pip-dark border border-pip-border px-4 py-2 rounded-full">
           <Activity size={16} className="text-pip-gold" />
           <span className="text-sm font-mono text-pip-muted">
             {stats.totalTrades} Journaled Trades
           </span>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* 1. Net PnL */}
        <ProfitCard 
          title="Net PnL"
          value={`${stats.netPnL > 0 ? '+' : ''}${stats.netPnL}`}
          subValue="Total Result"
          icon={DollarSign}
          trend={stats.netPnL >= 0 ? 'up' : 'down'}
          valueColor={stats.netPnL >= 0 ? 'text-pip-green' : 'text-pip-red'}
        />

        {/* 2. Win Rate */}
        <ProfitCard 
          title="Win Rate"
          value={`${stats.winRate}%`}
          subValue={`Based on ${stats.totalTrades} trades`}
          icon={Activity}
          trend={stats.winRate >= 50 ? 'up' : 'down'}
          valueColor="text-white"
        />

        {/* 3. Profit Factor */}
        <ProfitCard 
          title="Profit Factor"
          value={stats.profitFactor}
          subValue="Target: > 1.5"
          icon={BarChart2}
          trend={stats.profitFactor >= 1.5 ? 'up' : 'neutral'}
          valueColor={stats.profitFactor >= 1.5 ? 'text-pip-gold' : 'text-pip-muted'}
        />
      </div>
      
      {/* Chart Placeholder */}
      <div className="bg-pip-card border border-pip-border p-6 rounded-xl h-64 flex flex-col items-center justify-center text-pip-muted/50 border-dashed">
        <TrendingUp size={48} className="mb-4 opacity-50" />
        <span className="font-medium">Equity Curve Chart</span>
        <span className="text-xs">Coming in US7</span>
      </div>
    </div>
  );
}