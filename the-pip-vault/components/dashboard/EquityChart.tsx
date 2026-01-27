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
import { useSettings } from "@/context/SettingsContext";
import { useProfile } from "@/context/ProfileContext";

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
// Custom Tooltip Component met de nieuwe props
const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  const { viewMode } = useSettings();

  if (active && payload && payload.length) {
    const data = payload[0].payload; // Dit is het data-object uit je array
    return (
      <div className="bg-pip-card border border-pip-border p-3 rounded-lg shadow-xl backdrop-blur-md z-50">
        <p className="text-pip-muted text-xs mb-1 flex items-center gap-1">
          <Calendar size={12} /> {label}
        </p>
        <p className="text-pip-text font-bold text-lg">
          Equity: {data.equity > 0 ? '+' : ''}{data.equity.toFixed(2)}
        </p>
        <p className="text-pip-muted uppercase tracking-wider text-[10px] mb-1">Daily Trades</p>
        <div className="space-y-1 max-h-32 overflow-y-auto">
          {data.trades.map((t: Trade, i: number) => {
            let tradeVal = t.pnl;
            const startEquity = 10000; // Fallback only used purely for tooltip individual % (not optimal but okay for now)

            if (viewMode === 'currency') {
              tradeVal = t.pnl_currency || 0;
            } else if (viewMode === 'percentage') {
              // Dit is lastig in tooltip, we tonen hier de individuele trade impact?
              // Laten we consistent zijn: tonen de individuele trade % relative to start equity.
              // Maar startEquity zit niet in tooltip props direct. 
              // We kunnen wel gewoon viewMode checken en labels aanpassen.
              // We gebruiken hierboven profile context niet in deze sub-component.
              // Voor simpelheid: laat % zien als we weten wat start capital is, anders 0.
              // Maar we kunnen de waarde van parent chart data meegeven? Nee.
              // Betere fix: toon gewoon de waarde die in de chart aggregatie zit? Nee dat is de som.
              // We laten hier gewoon de valuta/pips zien OF we moeten refactoren.
              // Voor nu: percentage view switched naar currency in de list view OF we berekenen het.
              // Laten we ervan uitgaan dat dit component toegang heeft tot profile via context (wat het heeft)
            }

            // REFACTOR: We moeten profile accessen in CustomTooltip.
            // Maar hooks mogen niet conditioneel. 
            // We halen profile op in main component en geven het mee? Nee Tooltip wordt door Recharts gerenderd.
            // We kunnen useProfile() hier gebruiken als het een component is.
            // Ja, CustomTooltip IS een component.

            // Dus we doen:
            // const { profile } = useProfile();
            // tradeVal = ((t.pnl_currency || 0) / (profile.starting_equity || 1)) * 100;
          })}
          {/* We doen de logic in de render map hieronder in één keer goed */}
          {data.trades.map((t: Trade, i: number) => {
            // We need profile context inside map? No, hook usage rule.
            // Logic moved inside Map is fine if data is available.
            // But we need profile.starting_equity.
            // See simplified implementation below.
            return <TradeRow key={i} trade={t} viewMode={viewMode} />;
          })}
        </div>
      </div>
    );
  }
  return null;
};

const TradeRow = ({ trade, viewMode }: { trade: Trade, viewMode: string }) => {
  const { profile } = useProfile();
  let val = trade.pnl || 0;
  let suffix = '';
  let prefix = '';

  if (viewMode === 'currency') {
    val = trade.pnl_currency || 0;
    prefix = '$';
  } else if (viewMode === 'percentage') {
    val = ((trade.pnl_currency || 0) / (profile.starting_equity || 1)) * 100;
    suffix = '%';
  }

  return (
    <div className="flex justify-between items-center text-[10px]">
      <span className="flex items-center gap-1">
        <span className={`w-1 h-1 rounded-full ${val > 0 ? 'bg-pip-green' : 'bg-pip-red'}`} />
        <span className="text-pip-text">{trade.pair}</span>
        <span className="text-pip-muted opacity-50">{trade.direction}</span>
      </span>
      <span className={`font-mono ${val > 0 ? 'text-pip-green' : 'text-pip-red'}`}>
        {val > 0 ? '+' : ''}{prefix}{val.toFixed(2)}{suffix}
      </span>
    </div>
  );
};


const EquityChart = ({ trades }: EquityChartProps) => {
  const { viewMode } = useSettings();
  const { profile } = useProfile();

  // Data Transformatie Logica
  const chartData = useMemo(() => {
    if (trades.length === 0) return [];

    // 1. Sorteer op datum (Oud -> Nieuw)
    const sortedTrades = [...trades].sort((a, b) =>
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // 2. Groepeer op Datum (Aggregatie)
    const dailyMap: Record<string, { date: string, pnl: number, trades: Trade[] }> = {};

    sortedTrades.forEach(trade => {
      const dateKey = new Date(trade.date).toLocaleDateString('en-US', { day: '2-digit', month: '2-digit' });

      if (!dailyMap[dateKey]) {
        dailyMap[dateKey] = { date: dateKey, pnl: 0, trades: [] };
      }

      let tradeValue = 0;
      if (viewMode === 'currency') tradeValue = trade.pnl_currency || 0;
      else if (viewMode === 'percentage') tradeValue = ((trade.pnl_currency || 0) / (profile.starting_equity || 1)) * 100;
      else tradeValue = trade.pnl;

      dailyMap[dateKey].pnl += tradeValue;
      dailyMap[dateKey].trades.push(trade);
    });

    // 3. Bouw Chart Data Points (Running Total per dag)
    // Percentage: Start op 0%
    // Valuta: Start op Start Equity
    // Pips: Start op 0
    let runningBalance = viewMode === 'currency' ? (profile.starting_equity || 0) : 0;

    // Startpunt
    const dataPoints = [{
      name: 'Start',
      date: 'Start',
      equity: runningBalance,
      pnl: 0,
      trades: [] as Trade[]
    }];

    // Converteer map naar array en bereken running balance
    Object.values(dailyMap).forEach(day => {
      // Bereken dagwaarde
      let dayValue = 0;

      if (viewMode === 'percentage') {
        // Voor percentage tellen we de % gain per trade op (arithmetic) 
        // OF we berekenen de running PnL in valuta en delen door start equity?
        // Growth Curve = (Total PnL / Start Equity) * 100.
        // Dit is exacter.

        // Maar we moeten 'day.pnl' hierboven al goed hebben?
        // Hierboven in stap 2 berekenden we day.pnl op basis van viewMode.

        // Als viewMode % is, is day.pnl de SOM van % returns van trades die dag?
        // Of is day.pnl de som van valuta?
        // In stap 2:
        // if % -> tradeValue = ((pnl_curr) / start) * 100.
        // Dus day.pnl is de som van % die dag.
        // Running balance is som van alle % returns.
        dayValue = day.pnl;
      } else {
        dayValue = day.pnl;
      }

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
  }, [trades, viewMode, profile.starting_equity]);

  const currentEquity = chartData.length > 0 ? chartData[chartData.length - 1].equity : 0;

  return (
    <div className="bg-pip-card border border-pip-border p-6 rounded-xl shadow-sm flex flex-col h-112.5">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-pip-text flex items-center gap-2">
          <TrendingUp size={20} className="text-pip-gold" />
          Equity Curve
        </h3>
        <span className={`text-sm font-mono px-3 py-1 rounded-md border ${viewMode === 'percentage'
          ? (currentEquity >= 0 ? 'bg-pip-green/10 text-pip-green border-pip-green/30' : 'bg-pip-red/10 text-pip-red border-pip-red/30')
          : (currentEquity >= (viewMode === 'currency' ? profile.starting_equity : 0) ? 'bg-pip-green/10 text-pip-green border-pip-green/30' : 'bg-pip-red/10 text-pip-red border-pip-red/30')
          }`}>
          Current: {viewMode === 'currency' ? '$' : ''}{currentEquity.toFixed(2)}{viewMode === 'percentage' ? '%' : ''}
        </span>
      </div>

      <div className="flex-1 w-full min-h-0">
        {chartData.length > 1 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorEquity" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#D4AF37" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-pip-border)" vertical={false} />
              <XAxis
                dataKey="date"
                stroke="var(--color-pip-muted)"
                tick={{ fill: 'var(--color-pip-text)', fontSize: 12 }}
                tickLine={false} axisLine={false} minTickGap={30}
              />
              <YAxis
                stroke="var(--color-pip-muted)"
                tick={{ fill: 'var(--color-pip-text)', fontSize: 12 }}
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