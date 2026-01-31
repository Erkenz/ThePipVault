"use client";

import { Trade } from "@/context/TradeContext";
import { useProfile } from "@/context/ProfileContext";
import { AlertTriangle, CheckCircle, XCircle, HelpCircle, MinusCircle, BrainCircuit } from "lucide-react";
import { cn } from "@/lib/utils";

const EmotionAnalysis = ({ trades }: { trades: Trade[] }) => {
  const { profile } = useProfile();

  const emotionStats = trades.reduce((acc, trade) => {
    const emotion = trade.emotion || 'Neutral';
    if (!acc[emotion]) acc[emotion] = { pnl: 0, count: 0 };

    const tradeValue = trade.pnl_currency || 0;

    acc[emotion].pnl += tradeValue;
    acc[emotion].count += 1;

    return acc;
  }, {} as Record<string, { pnl: number; count: number }>);

  const sortedEmotions = Object.entries(emotionStats).sort(([, a], [, b]) => Math.abs(b.pnl) - Math.abs(a.pnl));

  const getEmotionConfig = (emotion: string) => {
    if (emotion === 'Confident') {
      return {
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/20',
        iconColor: 'text-emerald-500',
        Icon: CheckCircle,
        label: 'Flow State'
      };
    }
    if (emotion === 'Hesitant') {
      return {
        bg: 'bg-yellow-500/10',
        border: 'border-yellow-500/20',
        iconColor: 'text-yellow-500',
        Icon: AlertTriangle,
        label: 'Hesitation'
      };
    }
    if (emotion === 'Neutral') {
      return {
        bg: 'bg-muted/50',
        border: 'border-border',
        iconColor: 'text-muted-foreground',
        Icon: MinusCircle,
        label: 'Objective'
      };
    }
    return {
      bg: 'bg-red-500/10',
      border: 'border-red-500/20',
      iconColor: 'text-red-500',
      Icon: XCircle,
      label: 'Tilt / Fear'
    };
  };

  return (
    <div className="h-full flex flex-col">
      <h3 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
        <BrainCircuit size={20} className="text-primary" />
        Psychology Matrix
      </h3>

      <div className="grid grid-cols-2 gap-4 flex-1 content-start">
        {sortedEmotions.length === 0 ? (
          <div className="col-span-2 flex flex-col items-center justify-center text-muted-foreground py-12 border border-dashed border-border/50 rounded-xl bg-background/50">
            <HelpCircle size={24} className="mb-2 opacity-50" />
            <span className="text-sm">No emotion data recorded.</span>
          </div>
        ) : (
          sortedEmotions.map(([emotion, stats]) => {
            const config = getEmotionConfig(emotion);
            const Icon = config.Icon;
            const isProfit = stats.pnl > 0;

            return (
              <div
                key={emotion}
                className={cn(
                  "p-4 rounded-xl border transition-all hover:scale-[1.02] flex flex-col justify-between gap-3 backdrop-blur-sm",
                  config.bg, config.border
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Icon size={16} className={config.iconColor} />
                    <span className="text-xs font-bold text-foreground tracking-wide truncate max-w-[80px]">{emotion}</span>
                  </div>
                </div>

                <div>
                  <div className="flex items-baseline gap-2">
                    <span className={cn("text-lg font-black tracking-tight", isProfit ? 'text-emerald-500' : 'text-red-500')}>
                      {stats.pnl > 0 ? '+' : ''}${stats.pnl.toFixed(2)}
                    </span>
                  </div>

                  <div className="text-[10px] text-muted-foreground mt-1 flex items-center justify-between">
                    <span>{stats.count} trades</span>
                    <span className={cn("px-1.5 py-0.5 rounded text-[9px] font-bold uppercase opacity-80", config.bg, config.iconColor)}>
                      {config.label}
                    </span>
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