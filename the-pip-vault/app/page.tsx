"use client";

import { useMemo } from 'react';
import { useTrades } from "@/context/TradeContext";
import ProfitCard from '@/components/dashboard/ProfitsCard';
import EquityChart from "@/components/dashboard/EquityChart";
import SetupBreakdown from '@/components/dashboard/SetupBreakdown';
import EmotionAnalysis from '@/components/dashboard/EmotionAnalysis';
import CalendarHeatmap from '@/components/dashboard/TradingCalendar';
import { Activity, BarChart2, DollarSign, PieChart, Loader2, Percent, TrendingUp, Wallet, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { useProfile } from "@/context/ProfileContext";
import { useAccounts } from "@/context/AccountContext";
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function Home() {
  const { trades, loading } = useTrades();
  const { profile } = useProfile();
  const { selectedAccount } = useAccounts();

  // === KPI LOGIC ===
  const stats = useMemo(() => {
    let grossProfit = 0;
    let grossLoss = 0;
    let winCount = 0;
    let totalPnL = 0;

    trades.forEach(trade => {
      let value = trade.pnl_currency || 0;

      totalPnL += value;

      if (value > 0) grossProfit += value;
      else if (value < 0) grossLoss += Math.abs(value);

      if ((trade.pnl || 0) > 0) winCount++;
    });

    const totalTrades = trades.length;
    const winRate = totalTrades > 0 ? (winCount / totalTrades) * 100 : 0;
    const profitFactor = grossLoss === 0 ? (grossProfit > 0 ? grossProfit : 0) : grossProfit / grossLoss;

    return {
      netPnL: parseFloat(totalPnL.toFixed(2)),
      winRate: Math.round(winRate),
      profitFactor: parseFloat(profitFactor.toFixed(2)),
      totalTrades,
      grossProfit,
      grossLoss
    };
  }, [trades]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-muted-foreground">
        <Loader2 className="animate-spin mr-2" /> Loading Dashboard...
      </div>
    );
  }

  const isProfitable = stats.netPnL >= 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-12">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tighter uppercase italic text-transparent bg-clip-text bg-gradient-to-r from-foreground to-muted-foreground">
            Overview
          </h1>
          <p className="text-muted-foreground font-medium">Welcome back, <span className="text-primary">{profile.first_name || 'Trader'}</span>. Here is your performance report.</p>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/journal">
            <button className="bg-primary hover:bg-primary/90 text-white font-bold px-4 py-2 rounded-xl text-sm transition-all active:scale-95 shadow-lg shadow-primary/20">
              + Quick Trade
            </button>
          </Link>
        </div>
      </div>

      {/* HERO METRICS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

        {/* BIG NET PNL CARD */}
        <div className="lg:col-span-2 relative overflow-hidden rounded-3xl border border-border bg-card shadow-2xl group">
          <div className={cn(
            "absolute top-0 left-0 w-full h-1",
            isProfitable ? "bg-gradient-to-r from-emerald-500 to-teal-400" : "bg-gradient-to-r from-red-500 to-orange-400"
          )} />
          <div className="p-8 relative z-10">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 rounded-2xl bg-background/50 border border-border/50 backdrop-blur-md">
                <Wallet size={24} className={isProfitable ? "text-emerald-500" : "text-red-500"} />
              </div>
              <div className={cn(
                "flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full border",
                isProfitable ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-red-500/10 text-red-500 border-red-500/20"
              )}>
                {isProfitable ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {isProfitable ? "PROFITABLE" : "DRAWDOWN"}
              </div>
            </div>
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-1">
              Net PnL
            </h3>
            <div className="text-5xl font-black tracking-tighter text-foreground tabular-nums">
              {stats.netPnL > 0 ? '+' : ''}${stats.netPnL}
            </div>
            <p className="text-xs text-muted-foreground mt-4 font-medium">
              Gross Profit: ${stats.grossProfit.toFixed(2)}
            </p>
          </div>
          {/* Background Glow */}
          <div className={cn(
            "absolute right-0 bottom-0 w-64 h-64 bg-gradient-to-br blur-3xl opacity-10 pointer-events-none rounded-full translate-x-1/3 translate-y-1/3",
            isProfitable ? "from-emerald-500 to-teal-400" : "from-red-500 to-orange-400"
          )} />
        </div>

        {/* WIN RATE */}
        <div className="rounded-3xl border border-border bg-card p-6 flex flex-col justify-between relative overflow-hidden group hover:border-primary/50 transition-colors">
          <div>
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 rounded-xl bg-background/50 border border-border/50">
                <Activity size={20} className="text-blue-500" />
              </div>
            </div>
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Win Rate</h3>
            <div className="text-4xl font-black mt-2 tracking-tight flex items-baseline gap-2">
              {stats.winRate}<span className="text-lg text-muted-foreground">%</span>
            </div>
          </div>
          <div className="w-full bg-muted/50 h-2 rounded-full mt-4 overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${stats.winRate}%` }} />
          </div>
          <p className="text-[10px] text-muted-foreground mt-2 text-right">Target: 50%+</p>
        </div>

        {/* PROFIT FACTOR */}
        <div className="rounded-3xl border border-border bg-card p-6 flex flex-col justify-between relative overflow-hidden group hover:border-yellow-500/50 transition-colors">
          <div>
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 rounded-xl bg-background/50 border border-border/50">
                <TrendingUp size={20} className="text-yellow-500" />
              </div>
            </div>
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Profit Factor</h3>
            <div className="text-4xl font-black mt-2 tracking-tight">
              {stats.profitFactor}
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs font-medium">
            <span className={cn(
              stats.profitFactor >= 2.0 ? "text-emerald-500" : stats.profitFactor >= 1.0 ? "text-yellow-500" : "text-red-500"
            )}>
              {stats.profitFactor >= 2.0 ? "Excellent" : stats.profitFactor >= 1.0 ? "Good" : "Needs Work"}
            </span>
          </div>
        </div>
      </div>

      {/* CHART SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-panel rounded-3xl p-6 border border-border/50 shadow-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-6 bg-primary rounded-full" />
            <h2 className="text-lg font-bold tracking-tight">Equity Curve</h2>
          </div>
          <div className="h-[450px] w-full">
            <EquityChart
              trades={trades}
              startingBalance={selectedAccount ? selectedAccount.start_amount : profile.starting_equity}
            />
          </div>
        </div>

        <div className="glass-panel rounded-3xl p-6 border border-border/50 shadow-xl flex flex-col">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-6 bg-purple-500 rounded-full" />
            <h2 className="text-lg font-bold tracking-tight">Performance Map</h2>
          </div>
          <CalendarHeatmap trades={trades} />
        </div>
      </div>

      {/* ANALYTICS BREAKDOWN */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-panel rounded-3xl p-6 border border-border/50">
          <SetupBreakdown trades={trades} />
        </div>
        <div className="glass-panel rounded-3xl p-6 border border-border/50">
          <EmotionAnalysis trades={trades} />
        </div>
      </div>
    </div>
  );
}