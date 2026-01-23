"use client";

import { useMemo } from 'react';
import { useTrades } from "@/context/TradeContext";
import ProfitCard from '@/components/dashboard/ProfitsCard';
import EquityChart from "@/components/dashboard/EquityChart";
import SetupBreakdown from '@/components/dashboard/SetupBreakdown';
import EmotionAnalysis from '@/components/dashboard/EmotionAnalysis';
import CalendarHeatmap from '@/components/dashboard/TradingCalendar';
import { Activity, BarChart2, DollarSign, PieChart, Loader2, Percent } from "lucide-react";
import { useSettings } from "@/context/SettingsContext";
import { useProfile } from "@/context/ProfileContext";
import ViewToggle from "@/components/dashboard/ViewToggle";

const SkeletonBlock = ({ className }: { className?: string }) => (
  <div className={`bg-pip-card border border-pip-border rounded-xl animate-pulse flex items-center justify-center ${className}`}>
    <Loader2 className="text-pip-gold/20 animate-spin" size={24} />
  </div>
);

export default function Home() {
  const { trades, loading } = useTrades();
  const { viewMode } = useSettings();
  const { profile } = useProfile();

  // === KPI LOGICA ===
  const stats = useMemo(() => {
    let grossProfit = 0;
    let grossLoss = 0;
    let winCount = 0;
    let totalPnL = 0;

    // Voor percentage berekeningen
    const startingEquity = profile.starting_equity || 10000;

    trades.forEach(trade => {
      // Kies de juiste metric op basis van viewMode
      let value = 0;

      if (viewMode === 'pips') {
        value = trade.pnl || 0;
      } else if (viewMode === 'currency') {
        value = trade.pnl_currency || 0;
      } else if (viewMode === 'percentage') {
        // Percentage van start equity
        value = ((trade.pnl_currency || 0) / startingEquity) * 100;
      }

      totalPnL += value;

      // Bereken stats voor Profit Factor (Currency of Pips of %)
      if (value > 0) {
        grossProfit += value;
      } else if (value < 0) {
        grossLoss += Math.abs(value);
      }

      // Consistent Win Rate: Een trade is een 'Win' als Pips > 0 (of Currency > 0 als we dat willen, maar Pips is vaak cleaner)
      // Als PnL undefined is (0), is het geen win.
      if ((trade.pnl || 0) > 0) {
        winCount++;
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
  }, [trades, viewMode, profile.starting_equity]);

  // === LOADING STATE VIEW ===
  if (loading) {
    return (
      <div className="space-y-6 p-4 sm:p-0">
        <div className="h-12 w-48 bg-pip-card border border-pip-border rounded-lg animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <SkeletonBlock className="h-32" />
          <SkeletonBlock className="h-32" />
          <SkeletonBlock className="h-32" />
        </div>
        <SkeletonBlock className="h-100 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">

      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-pip-text uppercase tracking-tighter italic">Dashboard</h1>

          <p className="text-pip-muted mt-1">
            Performance Command Center
          </p>
        </div>

        <div className="flex items-center gap-3">
          <ViewToggle />
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
          title={viewMode === 'percentage' ? "Return" : "Net PnL"}
          value={`${stats.netPnL > 0 ? '+' : ''}${viewMode === 'currency' ? '$' : ''}${stats.netPnL}${viewMode === 'percentage' ? '%' : ''}`}
          subValue={
            viewMode === 'currency' ? "Total Profit ($)" :
              viewMode === 'percentage' ? "Total Return (%)" :
                "Total Pips"
          }
          icon={viewMode === 'percentage' ? Percent : DollarSign}
          trend={stats.netPnL >= 0 ? 'up' : 'down'}
          valueColor={stats.netPnL >= 0 ? 'text-pip-green' : 'text-pip-red'}
        />
        <ProfitCard
          title="Win Rate"
          value={`${stats.winRate}%`}
          subValue={`Based on ${stats.totalTrades} trades`}
          icon={Activity}
          trend={stats.winRate >= 50 ? 'up' : 'down'}
          valueColor="text-pip-text"
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
      {trades.length > 0 ? (
        <div className="pt-6 border-t border-pip-border space-y-6 animate-in slide-in-from-bottom-4 duration-700 delay-100">
          <h2 className="text-xl font-bold text-pip-text flex items-center gap-2">
            <PieChart size={20} className="text-pip-gold" />
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
      ) : (
        <div className="pt-12 text-center border-t border-pip-border border-dashed opacity-50">
          <p className="text-pip-muted">Add your first trade to unlock analytics.</p>
        </div>
      )}

    </div>
  );
}