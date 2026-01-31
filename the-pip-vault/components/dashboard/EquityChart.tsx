"use client";

import { useMemo } from 'react';
import { Trade } from "@/context/TradeContext";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { TrendingUp, Activity, Calendar } from "lucide-react";
import { useProfile } from "@/context/ProfileContext";
import { cn } from "@/lib/utils";

interface EquityChartProps {
  trades: Trade[];
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {

  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="glass-panel p-3 rounded-xl shadow-2xl z-50 min-w-[200px]">
        <p className="text-muted-foreground text-xs mb-2 flex items-center gap-1.5 font-medium border-b border-border/50 pb-2">
          <Calendar size={12} /> {label}
        </p>
        <div className="mb-3">
          <p className="text-[10px] uppercase font-bold text-muted-foreground">Equity</p>
          <p className="text-foreground font-black text-xl tracking-tight">
            ${data.equity.toFixed(2)}
          </p>
        </div>

        <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
          {data.trades.map((t: Trade, i: number) => (
            <TradeRow key={i} trade={t} />
          ))}
        </div>
      </div>
    );
  }
  return null;
};

const TradeRow = ({ trade }: { trade: Trade }) => {
  const val = trade.pnl_currency || 0;
  const prefix = '$';

  const isWin = val > 0;

  return (
    <div className="flex justify-between items-center text-xs group">
      <span className="flex items-center gap-2">
        <span className={cn("w-1.5 h-1.5 rounded-full", isWin ? 'bg-emerald-500' : 'bg-red-500')} />
        <span className="text-foreground/80 font-semibold">{trade.pair}</span>
        <span className="text-muted-foreground text-[10px] opacity-70">{trade.direction}</span>
      </span>
      <span className={cn("font-mono font-bold", isWin ? 'text-emerald-500' : 'text-red-500')}>
        {isWin ? '+' : ''}{prefix}{val.toFixed(2)}
      </span>
    </div>
  );
};


const EquityChart = ({ trades }: EquityChartProps) => {
  const { profile } = useProfile();

  const chartData = useMemo(() => {
    if (trades.length === 0) return [];

    const sortedTrades = [...trades].sort((a, b) =>
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const dailyMap: Record<string, { date: string, pnl: number, trades: Trade[] }> = {};

    sortedTrades.forEach(trade => {
      const dateKey = new Date(trade.date).toLocaleDateString('en-US', { day: '2-digit', month: '2-digit' });

      if (!dailyMap[dateKey]) {
        dailyMap[dateKey] = { date: dateKey, pnl: 0, trades: [] };
      }

      const tradeValue = trade.pnl_currency || 0;

      dailyMap[dateKey].pnl += tradeValue;
      dailyMap[dateKey].trades.push(trade);
    });

    let runningBalance = profile.starting_equity || 0;

    const dataPoints = [{
      name: 'Start',
      date: 'Start',
      equity: runningBalance,
      pnl: 0,
      trades: [] as Trade[]
    }];

    Object.values(dailyMap).forEach(day => {
      const dayValue = day.pnl;

      runningBalance += dayValue;

      dataPoints.push({
        name: day.date,
        date: day.date,
        equity: runningBalance,
        pnl: day.pnl,
        trades: day.trades
      });
    });

    return dataPoints;
  }, [trades, profile.starting_equity]);

  const currentEquity = chartData.length > 0 ? chartData[chartData.length - 1].equity : 0;
  const isPositiveWindow = currentEquity >= (profile.starting_equity || 0);

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex-1 w-full min-h-0">
        {chartData.length > 1 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorEquity" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} opacity={0.3} />
              <XAxis
                dataKey="date"
                stroke="var(--muted-fg)"
                tick={{ fill: 'var(--muted-fg)', fontSize: 10 }}
                tickLine={false} axisLine={false} minTickGap={30}
              />
              <YAxis
                stroke="var(--muted-fg)"
                tick={{ fill: 'var(--muted-fg)', fontSize: 10 }}
                tickLine={false} axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'var(--muted-fg)', strokeWidth: 1, strokeDasharray: '4 4' }} />
              <Area
                type="monotone"
                dataKey="equity"
                stroke="var(--primary)"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorEquity)"
                activeDot={{ r: 4, strokeWidth: 2, stroke: "var(--background)", fill: "var(--primary)" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground/30 border-2 border-dashed border-border/30 rounded-xl">
            <Activity size={48} className="mb-4 opacity-50" />
            <p className="font-bold text-sm">No equity data</p>
            <p className="text-xs mt-1">Start trading to generate your curve.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EquityChart;