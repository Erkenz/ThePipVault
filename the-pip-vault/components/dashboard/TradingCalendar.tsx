"use client";

import { useState, useMemo } from 'react';
import { Trade } from "@/context/TradeContext";
import { useProfile } from "@/context/ProfileContext";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Activity } from 'lucide-react';
import { cn } from "@/lib/utils";

interface TradingCalendarProps {
  trades: Trade[];
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const TradingCalendar = ({ trades }: TradingCalendarProps) => {
  const { profile } = useProfile();
  const [currentDate, setCurrentDate] = useState(new Date());

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const resetToToday = () => setCurrentDate(new Date());

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  // Grid start correction (Mon=0 in refined logic, or standard US Sun=0. Let's stick to standard US Sun=0 for now to match Date.getDay)
  const startingSlot = firstDayOfMonth;

  const dailyStats = useMemo(() => {
    const stats: Record<number, { pnl: number; count: number }> = {};
    trades.forEach(trade => {
      const tDate = new Date(trade.date);
      if (tDate.getMonth() === currentDate.getMonth() && tDate.getFullYear() === currentDate.getFullYear()) {
        const day = tDate.getDate();
        if (!stats[day]) stats[day] = { pnl: 0, count: 0 };

        const val = trade.pnl_currency || 0;

        stats[day].pnl += val;
        stats[day].count += 1;
      }
    });
    return stats;
  }, [trades, currentDate]);

  const renderDays = () => {
    const slots = [];
    for (let i = 0; i < startingSlot; i++) {
      slots.push(<div key={`empty-${i}`} className="aspect-square bg-transparent" />);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const stat = dailyStats[day];
      const isToday = day === new Date().getDate() && currentDate.getMonth() === new Date().getMonth() && currentDate.getFullYear() === new Date().getFullYear();

      let bg = "bg-muted/10";
      let text = "text-muted-foreground";

      if (stat) {
        if (stat.pnl > 0) {
          bg = "bg-emerald-500/20 border-emerald-500/30";
          text = "text-emerald-500";
        } else if (stat.pnl < 0) {
          bg = "bg-red-500/20 border-red-500/30";
          text = "text-red-500";
        } else {
          bg = "bg-muted/40";
          text = "text-foreground";
        }
      }

      slots.push(
        <div key={day} className={cn(
          "aspect-square rounded-lg border flex flex-col items-center justify-center relative group transition-all hover:scale-105 hover:shadow-lg cursor-default",
          bg,
          stat ? "border-solid" : "border-dashed border-border/30",
          isToday ? "ring-2 ring-primary ring-offset-2 ring-offset-background" : ""
        )}>
          <span className={cn("text-xs font-bold", text)}>{day}</span>
          {stat && (
            <span className={cn("text-[9px] font-bold mt-1", text)}>
              {stat.pnl > 0 ? '+' : ''}{stat.pnl.toFixed(0)}
            </span>
          )}

          {/* Tooltip */}
          {stat && (
            <div className="absolute bottom-full mb-2 bg-popover text-popover-foreground text-xs px-2 py-1 rounded shadow-xl border border-border opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
              {stat.count} trades • ${stat.pnl.toFixed(2)}
            </div>
          )}
        </div>
      );
    }
    return slots;
  };

  return (
    <div className="glass-panel rounded-2xl p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <Activity size={20} className="text-primary" />
          Performance Map
        </h3>
        <div className="flex items-center gap-2 bg-background/50 rounded-lg p-1 border border-border/50">
          <button onClick={prevMonth} className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-primary"><ChevronLeft size={16} /></button>
          <span className="text-xs font-bold w-20 text-center">{MONTHS[currentDate.getMonth()]}</span>
          <button onClick={nextMonth} className="p-1 hover:bg-muted rounded text-muted-foreground hover:text-primary"><ChevronRight size={16} /></button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-3 mb-2">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
          <div key={d} className="text-center text-[10px] uppercase font-bold text-muted-foreground/50">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-3 flex-1">
        {renderDays()}
      </div>
    </div>
  );
};

export default TradingCalendar;