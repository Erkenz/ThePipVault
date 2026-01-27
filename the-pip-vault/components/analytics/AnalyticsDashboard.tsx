"use client";

import { useTrades, Trade } from "@/context/TradeContext";
import { useProfile } from "@/context/ProfileContext";
import { useMemo } from "react";
import {
    TrendingUp, TrendingDown, Activity, Calendar, Clock,
    Target, Percent, Award, Briefcase, Wallet
} from "lucide-react";
import EquityChart from "../dashboard/EquityChart"; // Reuse chart for now

const MetricCard = ({ title, value, subtext, icon: Icon, trend }: { title: string, value: string, subtext?: string, icon?: any, trend?: 'up' | 'down' | 'neutral' }) => (
    <div className="bg-pip-card border border-pip-border rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start mb-2">
            <h3 className="text-pip-muted font-bold text-xs uppercase tracking-wider">{title}</h3>
            {Icon && <Icon size={16} className="text-pip-muted opacity-50" />}
        </div>
        <div className={`text-2xl font-black ${trend === 'up' ? 'text-pip-green' : trend === 'down' ? 'text-pip-red' : 'text-pip-text'}`}>
            {value}
        </div>
        {subtext && <p className="text-[10px] text-pip-muted mt-1">{subtext}</p>}
    </div>
);

export default function AnalyticsDashboard() {
    const { trades, loading } = useTrades();
    const { profile } = useProfile();

    const metrics = useMemo(() => {
        if (!trades.length) return null;

        let totalTrades = 0;
        let wins = 0;
        let losses = 0;
        let breakEven = 0;
        let grossProfit = 0;
        let grossLoss = 0;
        let netPnl = 0;
        let totalHoldTimeMs = 0;
        let holdTimeCount = 0;

        // PnL Arrays for Best/Worst/Avg
        const winPnls: number[] = [];
        const lossPnls: number[] = [];

        // Streaks
        let currentStreak = 0; // + for wins, - for losses
        let maxWinStreak = 0;
        let maxLossStreak = 0;

        // Sort by date (Oldest first for streaks)
        const sortedTrades = [...trades].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        // Daily PnL Map for Best/Worst Day
        const dailyPnL: Record<string, number> = {};

        sortedTrades.forEach(t => {
            totalTrades++;

            // Financials
            const gPnl = t.pnl_currency || 0; // Gross stored here
            const comm = t.commission || 0;
            const swap = t.swap || 0;
            const nPnl = gPnl - comm - swap; // Net Calculated

            netPnl += nPnl;

            // Stats
            if (nPnl > 0) {
                wins++;
                grossProfit += nPnl; // Use Net gains for Profit Factor logic
                winPnls.push(nPnl);

                if (currentStreak > 0) currentStreak++;
                else currentStreak = 1;
                maxWinStreak = Math.max(maxWinStreak, currentStreak);

            } else if (nPnl < 0) {
                losses++;
                grossLoss += Math.abs(nPnl);
                lossPnls.push(nPnl);

                if (currentStreak < 0) currentStreak--;
                else currentStreak = -1;
                maxLossStreak = Math.max(maxLossStreak, Math.abs(currentStreak));
            } else {
                breakEven++;
                // Reset streak? Or ignore? Usually ignoreBE
            }

            // Hold Time
            if (t.date && t.exit_date) {
                const start = new Date(t.date).getTime();
                const end = new Date(t.exit_date).getTime();
                if (!isNaN(start) && !isNaN(end) && end > start) {
                    totalHoldTimeMs += (end - start);
                    holdTimeCount++;
                }
            }

            // Daily Map
            const dayKey = new Date(t.date).toLocaleDateString();
            dailyPnL[dayKey] = (dailyPnL[dayKey] || 0) + nPnl;
        });

        // Derived Metrics
        const winRate = totalTrades > 0 ? (wins / totalTrades) * 100 : 0;
        const profitFactor = grossLoss > 0 ? (grossProfit / grossLoss) : (grossProfit > 0 ? 999 : 0);

        const avgWin = winPnls.length ? (winPnls.reduce((a, b) => a + b, 0) / winPnls.length) : 0;
        const avgLoss = lossPnls.length ? (lossPnls.reduce((a, b) => a + b, 0) / lossPnls.length) : 0;

        const expectancy = (winRate / 100 * avgWin) + ((losses / totalTrades) * avgLoss);

        const avgHoldTimeHrs = holdTimeCount > 0 ? (totalHoldTimeMs / holdTimeCount) / (1000 * 60 * 60) : 0;

        const bestDayVal = Object.keys(dailyPnL).length ? Math.max(...Object.values(dailyPnL)) : 0;
        const worstDayVal = Object.keys(dailyPnL).length ? Math.min(...Object.values(dailyPnL)) : 0;

        const largestWin = winPnls.length ? Math.max(...winPnls) : 0;
        const largestLoss = lossPnls.length ? Math.min(...lossPnls) : 0;

        return {
            totalTrades,
            netPnl,
            winRate,
            profitFactor,
            avgWin,
            avgLoss,
            expectancy,
            avgHoldTimeHrs,
            maxWinStreak,
            maxLossStreak,
            bestDayVal,
            worstDayVal,
            largestWin,
            largestLoss,
            wins,
            losses
        };
    }, [trades]);

    if (loading) return <div className="flex h-96 items-center justify-center text-pip-muted"><Activity className="animate-pulse mr-2" /> Analyzing data...</div>;
    if (!metrics) return (
        <div className="flex flex-col items-center justify-center h-96 text-pip-muted border border-dashed border-pip-border rounded-xl">
            <Activity size={48} className="mb-4 opacity-30" />
            <p>No trades found. Log a trade to see your analytics.</p>
        </div>
    );

    return (
        <div className="space-y-6">

            {/* 1. Main Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                    title="Total Net P&L"
                    value={`$${metrics.netPnl.toFixed(2)}`}
                    icon={TrendingUp}
                    trend={metrics.netPnl >= 0 ? 'up' : 'down'}
                    subtext="All time realized profit"
                />

                <MetricCard
                    title="Account Balance"
                    value={`$${(profile.starting_equity + metrics.netPnl).toFixed(2)}`}
                    icon={Wallet}
                    subtext={`Started at $${profile.starting_equity}`}
                />

                <MetricCard
                    title="Profit Factor"
                    value={metrics.profitFactor.toFixed(2)}
                    icon={Activity}
                    trend={metrics.profitFactor >= 2 ? 'up' : metrics.profitFactor >= 1 ? 'neutral' : 'down'}
                    subtext="Gross Profit / Gross Loss"
                />

                <MetricCard
                    title="Win Rate"
                    value={`${metrics.winRate.toFixed(1)}%`}
                    icon={Percent}
                    trend={metrics.winRate >= 50 ? 'up' : 'down'}
                    subtext={`${metrics.wins}W - ${metrics.losses}L`}
                />
            </div>

            {/* 2. Secondary Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                    title="Avg Win / Loss"
                    value={`$${metrics.avgWin.toFixed(2)} / $${Math.abs(metrics.avgLoss).toFixed(2)}`}
                    icon={Target}
                    subtext="Average profit per winning/losing trade"
                />

                <MetricCard
                    title="Expectancy"
                    value={`$${metrics.expectancy.toFixed(2)}`}
                    icon={Briefcase}
                    trend={metrics.expectancy >= 0 ? 'up' : 'down'}
                    subtext="Expected value per trade"
                />

                <MetricCard
                    title="Best / Worst Streak"
                    value={`${metrics.maxWinStreak}W / ${metrics.maxLossStreak}L`}
                    icon={Award}
                    subtext="Consecutive Wins / Losses"
                />

                <MetricCard
                    title="Avg Hold Time"
                    value={`${metrics.avgHoldTimeHrs.toFixed(1)} hrs`}
                    icon={Clock}
                    subtext="Average duration per trade"
                />
            </div>

            {/* 3. Extremes */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                    title="Best Day"
                    value={`$${metrics.bestDayVal.toFixed(2)}`}
                    icon={Calendar}
                    trend="up"
                />
                <MetricCard
                    title="Worst Day"
                    value={`$${metrics.worstDayVal.toFixed(2)}`}
                    icon={Calendar}
                    trend="down"
                />
                <MetricCard
                    title="Largest Win"
                    value={`$${metrics.largestWin.toFixed(2)}`}
                    icon={TrendingUp}
                    trend="up"
                />
                <MetricCard
                    title="Largest Loss"
                    value={`$${metrics.largestLoss.toFixed(2)}`}
                    icon={TrendingDown}
                    trend="down"
                />
            </div>

            {/* 4. Equity Chart Reuse */}
            <div className="grid grid-cols-1 gap-6">
                <EquityChart trades={trades} />
            </div>

        </div>
    );
}
