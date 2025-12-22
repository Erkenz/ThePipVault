"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Trade {
  id: string;
  pair: string;
  direction: 'LONG' | 'SHORT';
  entryPrice: number;
  stopLoss: number;
  takeProfit: number;
  riskPips: number;
  rewardPips: number;
  rrRatio: number;
  chartUrl: string;
  date: string;
  pnl: number; 
}

interface TradeContextType {
  trades: Trade[];
  // Update: date is nu optioneel in de input
  addTrade: (trade: Omit<Trade, 'id' | 'date'> & { date?: string }) => void;
  deleteTrade: (id: string) => void;
}

const TradeContext = createContext<TradeContextType | undefined>(undefined);

export const TradeProvider = ({ children }: { children: ReactNode }) => {
  const [trades, setTrades] = useState<Trade[]>([]);

  // Update: We kijken of er een datum in 'newTradeData' zit
  const addTrade = (newTradeData: Omit<Trade, 'id' | 'date'> & { date?: string }) => {
    const newTrade: Trade = {
      ...newTradeData,
      id: Math.random().toString(36).substr(2, 9),
      // Als er een datum is meegegeven (demo data), gebruik die. Anders: nu.
      date: newTradeData.date || new Date().toISOString(),
    };
    setTrades((prev) => [newTrade, ...prev]);
  };

  const deleteTrade = (id: string) => {
    setTrades((prev) => prev.filter((trade) => trade.id !== id));
  };

  return (
    <TradeContext.Provider value={{ trades, addTrade, deleteTrade }}>
      {children}
    </TradeContext.Provider>
  );
};

export const useTrades = () => {
  const context = useContext(TradeContext);
  if (!context) {
    throw new Error('useTrades must be used within a TradeProvider');
  }
  return context;
};