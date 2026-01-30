import { LucideIcon, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProfitCardProps {
  title: string;
  value: string | number;
  subValue?: string;
  icon: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  valueColor?: string;
}

const ProfitCard = ({ title, value, subValue, icon: Icon, trend, valueColor }: ProfitCardProps) => {
  return (
    <div className="glass-panel rounded-2xl p-6 relative overflow-hidden group hover:border-primary/30 transition-all duration-300">
      <div className="flex justify-between items-start mb-2">
        <div className="p-2.5 bg-background/50 border border-border/50 rounded-xl">
          <Icon size={20} className="text-muted-foreground group-hover:text-primary transition-colors" />
        </div>
        {trend && (
          <div className={cn(
            "flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold border",
            trend === 'up' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
              : trend === 'down' ? "bg-red-500/10 text-red-500 border-red-500/20"
                : "bg-muted text-muted-foreground border-border"
          )}>
            {trend === 'up' ? <ArrowUpRight size={12} /> : trend === 'down' ? <ArrowDownRight size={12} /> : <Minus size={12} />}
            {trend === 'up' ? 'GOOD' : trend === 'down' ? 'POOR' : 'NEUTRAL'}
          </div>
        )}
      </div>

      <div className="space-y-1">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{title}</h3>
        <div className={cn(
          "text-2xl font-black tracking-tight tabular-nums",
          valueColor || "text-foreground"
        )}>
          {value}
        </div>
      </div>

      {subValue && (
        <p className="text-[10px] text-muted-foreground mt-3 font-medium opacity-80 group-hover:opacity-100 transition-opacity">
          {subValue}
        </p>
      )}
    </div>
  );
};

export default ProfitCard;