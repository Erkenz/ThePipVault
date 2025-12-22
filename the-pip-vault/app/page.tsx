"use client";

import { useMemo } from 'react';
import { useTrades } from "@/context/TradeContext";
import ProfitCard from '@/components/dashboard/ProfitsCard';
import EquityChart from "@/components/dashboard/EquityChart"; 
import SetupBreakdown from '@/components/dashboard/SetupBreakdown';
import EmotionAnalysis from '@/components/dashboard/EmotionAnalysis';
import CalendarHeatmap from '@/components/dashboard/TradingCalendar';
import { generateDummyTrades } from "@/utils/demoData";       
import { Activity, BarChart2, DollarSign, Database, PieChart } from "lucide-react";

export default function Home() {
  const { trades, addTrade } = useTrades();

  // === DEMO DATA LOADER ===
  const handleLoadDemoData = () => {
    const dummyData = generateDummyTrades(5); 
    dummyData.forEach(trade => addTrade(trade));
  };

  // === KPI LOGICA ===
  const stats = useMemo(() => {
    let grossProfit = 0;
    let grossLoss = 0;
    let winCount = 0;
    let totalPnL = 0;

    trades.forEach(trade => {
      totalPnL += trade.pnl;
      if (trade.pnl > 0) {
        grossProfit += trade.pnl;
        winCount++;
      } else if (trade.pnl < 0) {
        grossLoss += Math.abs(trade.pnl);
      }
    });

    const totalTrades = trades.length;
    const winRate = totalTrades > 0 ? (winCount / totalTrades) * 100 : 0;
    const profitFactor = grossLoss === 0 
      ? (grossProfit > 0 ? grossProfit : 0) 
      : grossProfit / grossLoss;

    return {
      netPnL: parseFloat(totalPnL.toFixed(2)),
      winRate: Math.round(winRate),
      profitFactor: parseFloat(profitFactor.toFixed(2)),
      totalTrades
    };
  }, [trades]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-pip-text">Dashboard</h1>
          <p className="text-pip-muted text-sm mt-1">
            Performance Command Center
          </p>
        </div>
        
        <div className="flex items-center gap-3">
            {/* Seed Data Button */}
            <button 
                onClick={handleLoadDemoData}
                className="flex items-center gap-2 bg-pip-dark hover:bg-pip-card border border-pip-border hover:border-pip-gold text-pip-muted hover:text-white px-3 py-2 rounded-lg text-xs transition-all"
            >
                <Database size={14} />
                <span>Seed Data</span>
            </button>

            <div className="hidden sm:flex items-center gap-2 bg-pip-dark border border-pip-border px-4 py-2 rounded-full">
                <Activity size={16} className="text-pip-gold" />
                <span className="text-sm font-mono text-pip-muted">
                    {stats.totalTrades} Trades
                </span>
            </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ProfitCard 
          title="Net PnL"
          value={`${stats.netPnL > 0 ? '+' : ''}${stats.netPnL}`}
          subValue="Total Pips"
          icon={DollarSign}
          trend={stats.netPnL >= 0 ? 'up' : 'down'}
          valueColor={stats.netPnL >= 0 ? 'text-pip-green' : 'text-pip-red'}
        />
        <ProfitCard 
          title="Win Rate"
          value={`${stats.winRate}%`}
          subValue={`Based on ${stats.totalTrades} trades`}
          icon={Activity}
          trend={stats.winRate >= 50 ? 'up' : 'down'}
          valueColor="text-white"
        />
        <ProfitCard 
          title="Profit Factor"
          value={stats.profitFactor}
          subValue="Target: > 1.5"
          icon={BarChart2}
          trend={stats.profitFactor >= 1.5 ? 'up' : 'neutral'}
          valueColor={stats.profitFactor >= 1.5 ? 'text-pip-gold' : 'text-pip-muted'}
        />
      </div>
      
      {/* === EQUITY CHART === */}
      <EquityChart trades={trades} />

      {/* === ANALYTICS SECTION === */}
      {trades.length > 0 && (
        <div className="pt-6 border-t border-pip-border space-y-6 animate-in slide-in-from-bottom-4 duration-700 delay-100">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <PieChart size={20} className="text-pip-gold"/>
                Analytics Overview
            </h2>
            
            {/* Heatmap Full Width */}
            <CalendarHeatmap trades={trades} />

            {/* Split View: Setups & Emotions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SetupBreakdown trades={trades} />
                <EmotionAnalysis trades={trades} />
            </div>
        </div>
      )}

    </div>
  );
}