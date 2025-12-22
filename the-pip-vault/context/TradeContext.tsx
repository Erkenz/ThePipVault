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
  setup?: string;   
  emotion?: string; 
}

interface TradeContextType {
  trades: Trade[];
  // Update type: setup en emotion zijn optioneel
  addTrade: (trade: Omit<Trade, 'id' | 'date'> & { date?: string }) => void;
  deleteTrade: (id: string) => void;
}

const TradeContext = createContext<TradeContextType | undefined>(undefined);

export const TradeProvider = ({ children }: { children: ReactNode }) => {
  const [trades, setTrades] = useState<Trade[]>([]);

  const addTrade = (newTradeData: Omit<Trade, 'id' | 'date'> & { date?: string }) => {
    const newTrade: Trade = {
      ...newTradeData,
      id: Math.random().toString(36).substr(2, 9),
      date: newTradeData.date || new Date().toISOString(),
      // Defaults als ze leeg zijn
      setup: newTradeData.setup || 'Unknown',
      emotion: newTradeData.emotion || 'Neutral'
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