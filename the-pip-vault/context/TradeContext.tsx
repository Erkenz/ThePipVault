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
}

interface TradeContextType {
  trades: Trade[];
  addTrade: (trade: Omit<Trade, 'id' | 'date'>) => void;
  deleteTrade: (id: string) => void; // <--- NIEUW
}

const TradeContext = createContext<TradeContextType | undefined>(undefined);

export const TradeProvider = ({ children }: { children: ReactNode }) => {
  const [trades, setTrades] = useState<Trade[]>([]);

  const addTrade = (newTradeData: Omit<Trade, 'id' | 'date'>) => {
    const newTrade: Trade = {
      ...newTradeData,
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString(),
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