"use client";

import { useMemo } from 'react';
import { useTrades, Trade } from "@/context/TradeContext";
import { useProfile } from "@/context/ProfileContext";
import {
    TrendingUp, TrendingDown, Activity, Wallet,
    BarChart2, Calendar, Target, Clock,
    MoreHorizontal, DollarSign, ArrowUpRight, ArrowDownRight
} from "lucide-react";
import { cn } from '@/lib/utils';
import EquityChart from './EquityChart';

const StatGrid = () => {
    const { trades } = useTrades();
    const { profile } = useProfile();

    const stats = useMemo(() => {
        if (!trades.length) return null;

        let grossProfit = 0;
        let grossLoss = 0;
        let winCount = 0;
        let lossCount = 0;
        let beCount = 0;
        let totalPnL = 0;
        let totalR = 0;

        // Streaks
        let currentStreak = 0; // + for wins, - for losses
        let maxWinStreak = 0;
        let maxLossStreak = 0;

        // Max Drawdown
        let peakEquity = 0;
        let currentEquityCalc = 0;
        let maxDrawdown = 0;

        const sortedByDate = [...trades].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        // Helper to get value
        const getValue = (t: Trade) => {
            return t.pnl_currency || 0;
        };

        let wins: number[] = [];
        let losses: number[] = [];

        // Advanced Metrics state
        let totalHoldingTime = 0;
        let holdingCount = 0;

        let longWins = 0, longLosses = 0, longPnL = 0;
        let shortWins = 0, shortLosses = 0, shortPnL = 0;

        let totalFees = 0;

        const pairStats: Record<string, number> = {};
        const sessionStats: Record<string, number> = {};

        sortedByDate.forEach(t => {
            const val = getValue(t);
            totalPnL += val;

            // Drawdown Calc
            currentEquityCalc += val;
            if (currentEquityCalc > peakEquity) peakEquity = currentEquityCalc;
            const dd = peakEquity - currentEquityCalc;
            if (dd > maxDrawdown) maxDrawdown = dd;

            if (val > 0) {
                grossProfit += val;
                winCount++;
                wins.push(val);
                if (currentStreak >= 0) currentStreak++;
                else currentStreak = 1;
            } else if (val < 0) {
                grossLoss += Math.abs(val);
                lossCount++;
                losses.push(Math.abs(val));
                if (currentStreak <= 0) currentStreak--;
                else currentStreak = -1;
            } else {
                beCount++;
            }

            if (currentStreak > maxWinStreak) maxWinStreak = currentStreak;
            if (Math.abs(currentStreak) > maxLossStreak && currentStreak < 0) maxLossStreak = Math.abs(currentStreak);

            totalR += t.rrRatio || 0;

            // === NEW METRICS ===
            // Holding Time
            if (t.exit_date && t.date) {
                const start = new Date(t.date).getTime();
                const end = new Date(t.exit_date).getTime();
                const diff = end - start;
                if (diff > 0) {
                    totalHoldingTime += diff;
                    holdingCount++;
                }
            }

            // Direction Stats
            if (t.direction === 'LONG') {
                longPnL += val;
                if (val > 0) longWins++; else if (val < 0) longLosses++;
            } else {
                shortPnL += val;
                if (val > 0) shortWins++; else if (val < 0) shortLosses++;
            }

            // Fees
            totalFees += (t.commission || 0) + (t.swap || 0);

            // Pair & Session Stats
            if (t.pair) {
                pairStats[t.pair] = (pairStats[t.pair] || 0) + val;
            }
            if (t.session) {
                sessionStats[t.session] = (sessionStats[t.session] || 0) + val;
            }
        });

        const totalTrades = trades.length;
        const winRate = totalTrades > 0 ? (winCount / totalTrades) * 100 : 0;
        const avgWin = wins.length ? wins.reduce((a, b) => a + b, 0) / wins.length : 0;
        const avgLoss = losses.length ? losses.reduce((a, b) => a + b, 0) / losses.length : 0;
        const profitFactor = grossLoss === 0 ? grossProfit : grossProfit / grossLoss;
        const expectancy = (winRate / 100 * avgWin) - ((1 - winRate / 100) * avgLoss);
        const largestWin = Math.max(...wins, 0);
        const largestLoss = Math.max(...losses, 0);

        // Time calculations
        const now = new Date();
        const currentMonthTrades = sortedByDate.filter(t => new Date(t.date).getMonth() === now.getMonth() && new Date(t.date).getFullYear() === now.getFullYear()).length;

        // Performance today
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const todayTrades = sortedByDate.filter(t => new Date(t.date) >= startOfDay);
        const todayPnL = todayTrades.reduce((acc, t) => acc + getValue(t), 0);

        // Holding Time Format
        const avgHoldingTimeMs = holdingCount > 0 ? totalHoldingTime / holdingCount : 0;
        const formatDuration = (ms: number) => {
            if (ms === 0) return "N/A";
            const hours = Math.floor(ms / (1000 * 60 * 60));
            const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
            return `${hours}hrs ${minutes}m`;
        };

        // Best Stuff
        const bestPair = Object.entries(pairStats).sort((a, b) => b[1] - a[1])[0] || ['-', 0];
        const bestSession = Object.entries(sessionStats).sort((a, b) => b[1] - a[1])[0] || ['-', 0];

        const longWR = (longWins + longLosses) > 0 ? (longWins / (longWins + longLosses) * 100) : 0;
        const shortWR = (shortWins + shortLosses) > 0 ? (shortWins / (shortWins + shortLosses) * 100) : 0;


        return {
            netPnL: totalPnL,
            totalTrades,
            winRate,
            profitFactor,
            avgWin,
            avgLoss,
            maxWinStreak,
            maxLossStreak,
            largestWin,
            largestLoss,
            maxDrawdown,
            expectancy,
            avgR: totalR / totalTrades,
            currentMonthTrades,
            todayPnL,
            todayCount: todayTrades.length,
            winsCount: winCount,
            lossesCount: lossCount,
            // NEW
            avgHoldingTime: formatDuration(avgHoldingTimeMs),
            longStats: { wr: longWR, pnl: longPnL },
            shortStats: { wr: shortWR, pnl: shortPnL },
            bestPair: { name: bestPair[0], pnl: bestPair[1] },
            bestSession: { name: bestSession[0], pnl: bestSession[1] },
            totalFees
        };
    }, [trades]);

    if (!stats) return <div className="p-8 text-center text-muted-foreground">Log trades to see analytics.</div>;

    const prefix = '$';
    const suffix = '';

    return (
        <div className="space-y-6">

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

                {/* ROW 1 */}
                <StatCard
                    title="Total Net P&L"
                    value={`${stats.netPnL > 0 ? '+' : ''}${prefix}${stats.netPnL.toFixed(2)}${suffix}`}
                    subValue={`Fees: $${stats.totalFees.toFixed(2)}`}
                    trend={stats.netPnL >= 0 ? 'up' : 'down'}
                    icon={Wallet}
                    accentColor={stats.netPnL >= 0 ? "text-emerald-500" : "text-red-500"}
                />

                <StatCard
                    title="Total Trades"
                    value={stats.totalTrades.toString()}
                    subValue={`Avg/Day: ${(stats.totalTrades / 30).toFixed(1)}`}
                    icon={BarChart2}
                    accentColor="text-blue-500"
                />

                <StatCard
                    title="Win Rate"
                    value={`${stats.winRate.toFixed(1)}%`}
                    subValue={`Target: 50%`}
                    icon={Activity}
                    accentColor={stats.winRate >= 50 ? "text-emerald-500" : "text-yellow-500"}
                    progress={stats.winRate}
                />

                <StatCard
                    title="Wins vs Losses"
                    value={`${stats.winsCount}W / ${stats.lossesCount}L`}
                    subValue={`${(stats.winsCount / (stats.lossesCount || 1)).toFixed(1)} ratio`}
                    icon={Target}
                    accentColor="text-indigo-500"
                />

                {/* ROW 2 */}
                <StatCard
                    title="Avg Win / Loss"
                    value={
                        <div className="flex items-center gap-1">
                            <span className="text-emerald-500">{prefix}{stats.avgWin.toFixed(2)}</span>
                            <span className="text-muted-foreground font-light">/</span>
                            <span className="text-red-500">-{prefix}{stats.avgLoss.toFixed(2)}</span>
                        </div>
                    }
                    subValue={`R:R Ratio: 1:${(stats.avgWin / (stats.avgLoss || 1)).toFixed(2)}`}
                    icon={TrendingUp}
                    accentColor="text-foreground" // Reset base color as we handle it inside
                    customContent={
                        <div className="w-full h-1 bg-muted/30 mt-3 rounded-full overflow-hidden flex">
                            <div className="h-full bg-emerald-500" style={{ width: `${(stats.avgWin / (stats.avgWin + stats.avgLoss || 1)) * 100}%` }} />
                            <div className="h-full bg-red-500" style={{ width: `${(stats.avgLoss / (stats.avgWin + stats.avgLoss || 1)) * 100}%` }} />
                        </div>
                    }
                />

                <StatCard
                    title="Best Streaks"
                    value={`${stats.maxWinStreak}W / ${stats.maxLossStreak}L`}
                    subValue="Consecutive results"
                    icon={TrendingDown}
                    accentColor="text-purple-500"
                />

                <StatCard
                    title="Largest Win / Loss"
                    value={`${prefix}${stats.largestWin.toFixed(0)}`}
                    subValue={`Max Loss: -${prefix}${stats.largestLoss.toFixed(0)}`}
                    icon={MoreHorizontal}
                    accentColor="text-emerald-500"
                />

                <StatCard
                    title="Expectancy"
                    value={`${prefix}${stats.expectancy.toFixed(2)}`}
                    subValue="Per trade"
                    icon={Target}
                    accentColor={stats.expectancy > 0 ? "text-emerald-500" : "text-red-500"}
                />

                {/* ROW 3: NEW METRICS */}
                <StatCard
                    title="Avg Hold Time"
                    value={stats.avgHoldingTime}
                    subValue="Entry to Exit"
                    icon={Clock}
                    accentColor="text-orange-400"
                />

                <StatCard
                    title="Best Performance"
                    value={stats.bestPair.name}
                    subValue={`+${prefix}${stats.bestPair.pnl.toFixed(2)}`}
                    icon={Target}
                    accentColor="text-purple-500"
                />

                <StatCard
                    title="Long vs Short"
                    value={`${stats.longStats.wr.toFixed(0)}% / ${stats.shortStats.wr.toFixed(0)}%`}
                    subValue="Win Rate"
                    icon={MoreHorizontal}
                    accentColor="text-foreground"
                    customContent={
                        <div className="flex gap-2 mt-2">
                            <span className="text-[10px] bg-emerald-500/10 text-emerald-500 px-1.5 py-0.5 rounded border border-emerald-500/20">L: ${stats.longStats.pnl.toFixed(0)}</span>
                            <span className="text-[10px] bg-red-500/10 text-red-500 px-1.5 py-0.5 rounded border border-red-500/20">S: ${stats.shortStats.pnl.toFixed(0)}</span>
                        </div>
                    }
                />

                <StatCard
                    title="Total Commissions"
                    value={`$${stats.totalFees.toFixed(2)}`}
                    subValue="Fees + Swap"
                    icon={DollarSign}
                    accentColor="text-red-400"
                />

            </div>

            {/* LARGE SECTIONS */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Account Balance Chart (Taking 2/3 width) */}
                <div className="lg:col-span-2 glass-panel p-6 rounded-3xl border border-border/50 relative overflow-hidden">
                    <div className="flex justify-between items-start mb-6 relative z-10">
                        <div>
                            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-1">Account Balance</h3>
                            <div className="text-4xl font-black tracking-tighter text-foreground">
                                ${(profile.starting_equity + stats.netPnL).toLocaleString()}
                                <span className={cn("text-lg ml-2 font-bold", stats.netPnL >= 0 ? "text-emerald-500" : "text-red-500")}>
                                    {stats.netPnL >= 0 ? '+' : ''}{stats.netPnL.toFixed(2)}
                                </span>
                            </div>
                        </div>
                        <div className="p-3 bg-muted/20 rounded-xl">
                            <Wallet className="text-primary" size={24} />
                        </div>
                    </div>

                    <div className="h-[300px] w-full relative z-10">
                        <EquityChart trades={trades} />
                    </div>

                    {/* Background Decoration */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
                </div>

                {/* Today's Performance & Breakdown */}
                <div className="space-y-6">
                    <div className="glass-panel p-6 rounded-3xl border border-border/50">
                        <div className="flex items-center gap-2 mb-4">
                            <Calendar size={18} className="text-muted-foreground" />
                            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Today's Session</h3>
                        </div>

                        <div className="mb-6">
                            <div className={cn("text-3xl font-black", stats.todayPnL >= 0 ? "text-emerald-500" : "text-red-500")}>
                                {stats.todayPnL > 0 ? '+' : ''}{prefix}{stats.todayPnL.toFixed(2)}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">{stats.todayCount} trades executed today</div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">Current Streak</span>
                                <span className="font-bold text-foreground">{stats.maxWinStreak > 0 ? `${stats.maxWinStreak} Wins` : '0 Wins'}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">Drawdown</span>
                                <span className="font-bold text-red-500">-${stats.maxDrawdown.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">Profit Factor</span>
                                <span className="font-bold text-foreground">{stats.profitFactor.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    <div className="glass-panel p-6 rounded-3xl border border-border/50 flex flex-col justify-center items-center text-center">
                        <div className="mb-2 p-4 bg-muted/20 rounded-full">
                            <Target size={32} className="text-primary" />
                        </div>
                        <h3 className="text-lg font-black mt-2">PipVault AI</h3>
                        <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">AI Analysis coming soon to help you optimize based on this data.</p>
                    </div>
                </div>

            </div>

        </div>
    );
};

interface StatCardProps {
    title: string;
    value: React.ReactNode;
    subValue?: string;
    icon: any;
    accentColor?: string;
    trend?: 'up' | 'down';
    progress?: number;
    customContent?: React.ReactNode;
}

const StatCard = ({ title, value, subValue, icon: Icon, accentColor, trend, progress, customContent }: StatCardProps) => {
    return (
        <div className="glass-panel p-5 rounded-2xl border border-border/40 hover:border-primary/30 transition-all duration-300 relative group overflow-hidden">
            <div className="flex justify-between items-start mb-3">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{title}</span>
                <Icon size={16} className="text-muted-foreground/50 group-hover:text-primary transition-colors" />
            </div>

            <div className={cn("text-2xl font-black tracking-tight", accentColor || "text-foreground")}>
                {value}
            </div>

            {customContent}

            {progress !== undefined && (
                <div className="w-full h-1.5 bg-muted/40 rounded-full mt-3 overflow-hidden">
                    <div className={cn("h-full rounded-full transition-all duration-1000", accentColor?.replace('text-', 'bg-'))} style={{ width: `${Math.min(progress, 100)}%` }} />
                </div>
            )}

            {subValue && !customContent && (
                <div className="flex items-center gap-2 mt-2">
                    {trend && (
                        <span className={cn(
                            "flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded",
                            trend === 'up' ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
                        )}>
                            {trend === 'up' ? <TrendingUp size={10} className="mr-1" /> : <TrendingDown size={10} className="mr-1" />}
                            {trend === 'up' ? '' : ''}
                        </span>
                    )}
                    <span className="text-[10px] text-muted-foreground font-medium">{subValue}</span>
                </div>
            )}
        </div>
    )
}

export default StatGrid;
