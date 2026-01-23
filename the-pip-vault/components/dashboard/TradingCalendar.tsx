"use client";

import { useState, useMemo } from 'react';
import { Trade } from "@/context/TradeContext";
import { useSettings } from "@/context/SettingsContext";
import { useProfile } from "@/context/ProfileContext";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

interface TradingCalendarProps {
  trades: Trade[];
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const TradingCalendar = ({ trades }: TradingCalendarProps) => {
  const { viewMode } = useSettings();
  const { profile } = useProfile();
  const [currentDate, setCurrentDate] = useState(new Date());

  // Helper: Navigatie
  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const resetToToday = () => setCurrentDate(new Date());

  // 1. Berekeningen voor de Grid
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  // Correctie: Maandag (1) moet index 0 zijn, Zondag (0) index 6
  const startingSlot = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  // 2. Data Aggregatie per Dag
  const dailyStats = useMemo(() => {
    const stats: Record<number, { pnl: number; count: number; trades: Trade[] }> = {};

    trades.forEach(trade => {
      const tDate = new Date(trade.date);
      // Check of trade in DEZE maand en DIT jaar valt
      if (
        tDate.getMonth() === currentDate.getMonth() &&
        tDate.getFullYear() === currentDate.getFullYear()
      ) {
        const day = tDate.getDate();
        if (!stats[day]) stats[day] = { pnl: 0, count: 0, trades: [] };

        let tradeValue = 0;
        if (viewMode === 'currency') tradeValue = trade.pnl_currency || 0;
        else if (viewMode === 'percentage') tradeValue = ((trade.pnl_currency || 0) / (profile.starting_equity || 1)) * 100;
        else tradeValue = trade.pnl;

        stats[day].pnl += tradeValue;
        stats[day].count += 1;
        stats[day].trades.push(trade);
      }
    });

    return stats;
  }, [trades, currentDate, viewMode]);

  // 3. Grid Genereren
  const renderCalendarDays = () => {
    const slots = [];

    // A. Lege slots voor de eerste dag
    for (let i = 0; i < startingSlot; i++) {
      slots.push(<div key={`empty-${i}`} className="bg-pip-dark/30 border border-pip-border/30 h-24 sm:h-32 rounded-md opacity-50"></div>);
    }

    // B. De dagen van de maand
    for (let day = 1; day <= daysInMonth; day++) {
      const data = dailyStats[day];
      const isToday =
        day === new Date().getDate() &&
        currentDate.getMonth() === new Date().getMonth() &&
        currentDate.getFullYear() === new Date().getFullYear();

      let bgClass = "bg-pip-card";
      let textClass = "text-pip-muted";
      let borderClass = "border-pip-border";

      if (data) {
        if (data.pnl > 0) {
          bgClass = "bg-pip-green/10";
          textClass = "text-pip-green";
          borderClass = "border-pip-green/50";
        } else if (data.pnl < 0) {
          bgClass = "bg-pip-red/10";
          textClass = "text-pip-red";
          borderClass = "border-pip-red/50";
        } else {
          // Breakeven
          textClass = "text-pip-text";
        }
      }

      slots.push(
        <div
          key={day}
          className={`relative p-2 h-24 sm:h-32 border rounded-md transition-all hover:brightness-110 flex flex-col justify-between group
            ${bgClass} ${borderClass} ${isToday ? 'ring-2 ring-pip-gold' : ''}
          `}
        >
          {/* Dag Nummer */}
          <div className="flex justify-between items-start">
            <span className={`text-sm font-mono ${isToday ? 'text-pip-gold font-bold' : 'text-pip-muted'}`}>
              {day}
            </span>
            {data && (
              <span className="text-[10px] bg-pip-dark/50 px-1.5 py-0.5 rounded text-pip-muted border border-pip-border/50">
                {data.count}x
              </span>
            )}
          </div>

          {/* PnL Resultaat */}
          {data ? (
            <div className="text-center">
              <p className={`text-lg sm:text-xl font-bold tracking-tight ${textClass}`}>
                {data.pnl > 0 ? '+' : ''}{viewMode === 'currency' ? '$' : ''}{data.pnl.toFixed(viewMode === 'pips' ? 0 : 2)}{viewMode === 'percentage' ? '%' : ''}
              </p>
              <p className="text-[10px] text-pip-muted uppercase hidden sm:block">{viewMode === 'currency' ? 'Profit' : (viewMode === 'percentage' ? 'Return' : 'Pips')}</p>
            </div>
          ) : (
            // Lege dag placeholder (optioneel icoontje bij hover)
            <div className="hidden group-hover:flex items-center justify-center h-full opacity-20">
              <div className="w-8 h-1 bg-pip-border rounded-full"></div>
            </div>
          )}
        </div>
      );
    }
    return slots;
  };

  return (
    <div className="bg-pip-card border border-pip-border rounded-xl overflow-hidden shadow-sm">
      {/* Header: Maand Navigatie */}
      <div className="flex items-center justify-between p-6 border-b border-pip-border bg-pip-card/50">
        <h3 className="text-xl font-bold text-pip-text flex items-center gap-3">
          <CalendarIcon className="text-pip-gold" size={24} />
          {MONTHS[currentDate.getMonth()]} <span className="text-pip-muted">{currentDate.getFullYear()}</span>
        </h3>

        <div className="flex items-center gap-2">
          <button onClick={prevMonth} className="p-2 hover:bg-pip-active rounded-lg text-pip-muted hover:text-pip-text transition-colors">
            <ChevronLeft size={20} />
          </button>
          <button onClick={resetToToday} className="text-xs font-bold px-3 py-1.5 bg-pip-card border border-pip-border rounded hover:border-pip-gold transition-colors text-pip-muted hover:text-pip-text">
            Today
          </button>
          <button onClick={nextMonth} className="p-2 hover:bg-pip-active rounded-lg text-pip-muted hover:text-pip-text transition-colors">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="p-4 sm:p-6">
        {/* Dagen Header (Mon - Sun) */}
        <div className="grid grid-cols-7 gap-2 sm:gap-4 mb-2 text-center">
          {DAYS.map(day => (
            <div key={day} className="text-xs font-bold text-pip-muted uppercase tracking-wider py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2 sm:gap-4">
          {renderCalendarDays()}
        </div>
      </div>
    </div>
  );
};

export default TradingCalendar;