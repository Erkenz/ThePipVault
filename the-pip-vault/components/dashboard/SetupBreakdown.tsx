"use client";

import { Trade } from "@/context/TradeContext";

const SetupBreakdown = ({ trades }: { trades: Trade[] }) => {
  // Groepeer trades per setup
  const setupStats = trades.reduce((acc, trade) => {
    const setup = trade.setup || 'Unknown';
    if (!acc[setup]) acc[setup] = { win: 0, total: 0, pnl: 0 };
    
    acc[setup].total += 1;
    acc[setup].pnl += trade.pnl;
    if (trade.pnl > 0) acc[setup].win += 1;
    
    return acc;
  }, {} as Record<string, { win: number; total: number; pnl: number }>);

  // Sorteer op aantal trades (meest gebruikt bovenaan)
  const sortedSetups = Object.entries(setupStats).sort(([,a], [,b]) => b.total - a.total);

  return (
    <div className="bg-pip-card border border-pip-border rounded-xl p-6">
      <h3 className="text-lg font-bold text-white mb-6">Best Performing Setups</h3>
      
      <div className="space-y-6">
        {sortedSetups.length === 0 ? (
          <p className="text-pip-muted text-sm">No setup data available.</p>
        ) : (
          sortedSetups.map(([setup, stats]) => {
            const winRate = Math.round((stats.win / stats.total) * 100);
            
            return (
              <div key={setup} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-white">{setup}</span>
                  <div className="flex gap-3">
                    <span className={stats.pnl > 0 ? 'text-pip-green' : 'text-pip-red'}>
                       {stats.pnl > 0 ? '+' : ''}{stats.pnl.toFixed(0)} pips
                    </span>
                    <span className="text-pip-muted">{stats.total} trades</span>
                  </div>
                </div>
                
                {/* Progress Bar Container */}
                <div className="h-2 w-full bg-pip-dark rounded-full overflow-hidden">
                   <div 
                     className={`h-full rounded-full ${winRate >= 50 ? 'bg-pip-green' : 'bg-pip-gold'}`}
                     style={{ width: `${winRate}%` }}
                   />
                </div>
                <div className="text-xs text-pip-muted text-right">
                    {winRate}% Win Rate
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