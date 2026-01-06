"use client";

import { Trade } from "@/context/TradeContext";
import { useSettings } from "@/context/SettingsContext";
import { useProfile } from "@/context/ProfileContext";
import { AlertTriangle, CheckCircle, XCircle, HelpCircle, MinusCircle } from "lucide-react";

const EmotionAnalysis = ({ trades }: { trades: Trade[] }) => {
  const { viewMode } = useSettings();
  const { profile } = useProfile();

  // 1. Groepeer PnL en Aantal trades per emotie
  const emotionStats = trades.reduce((acc, trade) => {
    const emotion = trade.emotion || 'Neutral';
    if (!acc[emotion]) acc[emotion] = { pnl: 0, count: 0 };

    let tradeValue = 0;
    if (viewMode === 'currency') tradeValue = trade.pnl_currency || 0;
    else if (viewMode === 'percentage') tradeValue = ((trade.pnl_currency || 0) / (profile.starting_equity || 1)) * 100;
    else tradeValue = trade.pnl;

    acc[emotion].pnl += tradeValue;
    acc[emotion].count += 1;

    return acc;
  }, {} as Record<string, { pnl: number; count: number }>);

  // 2. Sorteer op impact (grootste absolute PnL bovenaan)
  const sortedEmotions = Object.entries(emotionStats).sort(([, a], [, b]) => Math.abs(b.pnl) - Math.abs(a.pnl));

  // 3. Helper voor Kleur & Icoon op basis van proces-kwaliteit
  const getEmotionConfig = (emotion: string) => {
    if (emotion === 'Confident') {
      return {
        bg: 'bg-pip-green/10',
        border: 'border-pip-green/50',
        iconColor: 'text-pip-green',
        Icon: CheckCircle,
        label: 'Good Mindset'
      };
    }
    if (emotion === 'Hesitant') {
      return {
        bg: 'bg-pip-gold/10',
        border: 'border-pip-gold/50',
        iconColor: 'text-pip-gold',
        Icon: AlertTriangle,
        label: 'Caution'
      };
    }
    if (emotion === 'Neutral') {
      return {
        bg: 'bg-pip-dark',
        border: 'border-pip-border',
        iconColor: 'text-pip-muted',
        Icon: MinusCircle,
        label: 'Objective'
      };
    }
    // Slechte emoties (FOMO, Revenge, Greedy, etc.)
    return {
      bg: 'bg-pip-red/10',
      border: 'border-pip-red/50',
      iconColor: 'text-pip-red',
      Icon: XCircle,
      label: 'Bad Process'
    };
  };

  return (
    <div className="bg-pip-card border border-pip-border rounded-xl p-6 h-full flex flex-col">
      <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
        Emotion Impact
      </h3>

      <div className="grid grid-cols-2 gap-4 flex-1 content-start">
        {sortedEmotions.length === 0 ? (
          <div className="col-span-2 flex flex-col items-center justify-center text-pip-muted py-8 border border-dashed border-pip-border rounded-lg">
            <HelpCircle size={24} className="mb-2 opacity-50" />
            <span className="text-sm">No emotion data yet.</span>
          </div>
        ) : (
          sortedEmotions.map(([emotion, stats]) => {
            const config = getEmotionConfig(emotion);
            const Icon = config.Icon;
            const isProfit = stats.pnl > 0;

            return (
              <div
                key={emotion}
                className={`p-4 rounded-lg border transition-all hover:brightness-110 flex flex-col justify-between gap-3 ${config.bg} ${config.border}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Icon size={18} className={config.iconColor} />
                    <span className="text-sm font-bold text-white tracking-wide">{emotion}</span>
                  </div>
                  <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border bg-pip-dark/50 ${config.iconColor} border-current opacity-70`}>
                    {config.label}
                  </span>
                </div>

                <div>
                  <div className="flex items-baseline gap-2">
                    <span className={`text-xl font-bold ${isProfit ? 'text-pip-green' : 'text-pip-red'}`}>
                      {stats.pnl > 0 ? '+' : ''}{viewMode === 'currency' ? '$' : ''}{stats.pnl.toFixed(viewMode === 'pips' ? 0 : 2)}{viewMode === 'percentage' ? '%' : ''}
                    </span>
                    <span className="text-xs text-pip-muted uppercase">{viewMode === 'currency' ? 'Profit' : (viewMode === 'percentage' ? 'Return' : 'Pips')}</span>
                  </div>

                  <div className="text-[10px] text-pip-muted mt-1 flex items-center gap-1">
                    <span>{stats.count} trades</span>
                    {config.label === 'Bad Process' && isProfit && (
                      <span className="ml-auto text-pip-gold font-bold flex items-center gap-1 animate-pulse">
                        <AlertTriangle size={10} /> Lucky?
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default EmotionAnalysis;