"use client";

import { Trade } from "@/context/TradeContext";
import { useProfile } from "@/context/ProfileContext";
import { cn } from "@/lib/utils";
import { Layers } from "lucide-react";

const SetupBreakdown = ({ trades }: { trades: Trade[] }) => {
  const { profile } = useProfile();

  const setupStats = trades.reduce((acc, trade) => {
    const setup = trade.setup || 'Unknown';
    if (!acc[setup]) acc[setup] = { win: 0, total: 0, pnl: 0 };

    const tradeValue = trade.pnl_currency || 0;

    acc[setup].total += 1;
    acc[setup].pnl += tradeValue;

    if ((trade.pnl || 0) > 0) acc[setup].win += 1;

    return acc;
  }, {} as Record<string, { win: number; total: number; pnl: number }>);

  const sortedSetups = Object.entries(setupStats).sort(([, a], [, b]) => b.total - a.total);

  return (
    <div className="h-full">
      <h3 className="text-lg font-bold text-foreground mb-6 flex items-center gap-2">
        <Layers size={20} className="text-primary" />
        Strategy Performance
      </h3>

      <div className="space-y-5">
        {sortedSetups.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-8">No setup data available.</p>
        ) : (
          sortedSetups.map(([setup, stats]) => {
            const winRate = stats.total > 0 ? Math.round((stats.win / stats.total) * 100) : 0;
            const isProfit = stats.pnl > 0;

            return (
              <div key={setup} className="space-y-2 group">
                <div className="flex justify-between text-sm items-end">
                  <span className="font-bold text-foreground/90">{setup}</span>
                  <div className="flex flex-col items-end">
                    <span className={cn("font-bold font-mono text-xs", isProfit ? 'text-emerald-500' : 'text-red-500')}>
                      {stats.pnl > 0 ? '+' : ''}${stats.pnl.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="relative h-2 w-full bg-muted/50 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-500",
                      winRate >= 50 ? 'bg-emerald-500' : 'bg-yellow-500'
                    )}
                    style={{ width: `${winRate}%` }}
                  />
                </div>

                <div className="flex justify-between text-[10px] text-muted-foreground uppercase font-medium">
                  <span>{stats.total} trades</span>
                  <span>{winRate}% Win Rate</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default SetupBreakdown;