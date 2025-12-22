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

interface EquityChartProps {
  trades: Trade[];
}

// FIX: Lokale interface om TS error te voorkomen
interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

// Custom Tooltip Component met de nieuwe props
const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload; // Dit is het data-object uit je array
    return (
      <div className="bg-pip-card border border-pip-border p-3 rounded-lg shadow-xl backdrop-blur-md z-50">
        <p className="text-pip-muted text-xs mb-1 flex items-center gap-1">
            <Calendar size={12} /> {label}
        </p>
        <p className="text-white font-bold text-lg">
           Equity: {data.equity > 0 ? '+' : ''}{data.equity.toFixed(2)}
        </p>
        <div className="mt-2 pt-2 border-t border-pip-border/50 text-xs">
            <p className="text-pip-muted uppercase tracking-wider text-[10px]">Trade Result</p>
            <p className={`font-mono font-medium ${data.pnl >= 0 ? 'text-pip-green' : 'text-pip-red'}`}>
                {data.pair}: {data.pnl > 0 ? '+' : ''}{data.pnl}
            </p>
        </div>
      </div>
    );
  }
  return null;
};

const EquityChart = ({ trades }: EquityChartProps) => {
  
  // Data Transformatie Logica
  const chartData = useMemo(() => {
    if (trades.length === 0) return [];

    // 1. Sorteer op datum (Oud -> Nieuw)
    const sortedTrades = [...trades].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // 2. Bereken Running Total
    let runningBalance = 0;
    
    // Startpunt (Dag 0)
    const dataPoints = [{
        name: 'Start',
        date: 'Start',
        equity: 0,
        pnl: 0,
        pair: '-'
    }];

    sortedTrades.forEach((trade) => {
        runningBalance += trade.pnl;
        dataPoints.push({
            name: trade.pair, 
            date: new Date(trade.date).toLocaleDateString('nl-NL', { day: '2-digit', month: '2-digit' }),
            equity: runningBalance,
            pnl: trade.pnl,
            pair: trade.pair
        });
    });

    return dataPoints;
  }, [trades]);

  const currentEquity = chartData.length > 0 ? chartData[chartData.length - 1].equity : 0;

  return (
    <div className="bg-pip-card border border-pip-border p-6 rounded-xl shadow-sm flex flex-col h-112.5">
        <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <TrendingUp size={20} className="text-pip-gold" />
                Equity Curve
            </h3>
            <span className={`text-sm font-mono px-3 py-1 rounded-md border ${
                currentEquity >= 0 
                ? 'bg-pip-green/10 text-pip-green border-pip-green/30' 
                : 'bg-pip-red/10 text-pip-red border-pip-red/30'
            }`}>
                Current: {currentEquity > 0 ? '+' : ''}{currentEquity.toFixed(2)}
            </span>
        </div>

        <div className="flex-1 w-full min-h-0">
            {chartData.length > 1 ? (
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorEquity" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                        <XAxis 
                            dataKey="date" 
                            stroke="#666" 
                            tick={{ fill: '#666', fontSize: 12 }} 
                            tickLine={false} axisLine={false} minTickGap={30}
                        />
                        <YAxis 
                            stroke="#666" 
                            tick={{ fill: '#666', fontSize: 12 }} 
                            tickLine={false} axisLine={false}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Area 
                            type="monotone" 
                            dataKey="equity" 
                            stroke="#D4AF37" 
                            strokeWidth={2}
                            fillOpacity={1} 
                            fill="url(#colorEquity)" 
                            activeDot={{ r: 6, strokeWidth: 0, fill: '#fff' }}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            ) : (
                <div className="h-full flex flex-col items-center justify-center text-pip-muted/40 border border-dashed border-pip-border/50 rounded-lg">
                    <Activity size={48} className="mb-4 opacity-50" />
                    <p className="font-medium">Not enough data yet</p>
                    <p className="text-xs mt-1">Add trades to see your curve.</p>
                </div>
            )}
        </div>
    </div>
  );
};

export default EquityChart;