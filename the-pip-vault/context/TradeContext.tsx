"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

// 1. Definitie van hoe een Trade eruit ziet
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

// 2. Definitie van wat onze Context aanbiedt
interface TradeContextType {
  trades: Trade[];
  addTrade: (trade: Omit<Trade, 'id' | 'date'>) => void;
}

const TradeContext = createContext<TradeContextType | undefined>(undefined);

// 3. De Provider (De opslagcontainer)
export const TradeProvider = ({ children }: { children: ReactNode }) => {
  const [trades, setTrades] = useState<Trade[]>([]);

  const addTrade = (newTradeData: Omit<Trade, 'id' | 'date'>) => {
    const newTrade: Trade = {
      ...newTradeData,
      id: Math.random().toString(36).substr(2, 9), // Simpele unieke ID
      date: new Date().toISOString(),
    };

    setTrades((prev) => [newTrade, ...prev]); // Voeg toe bovenenaan de lijst
    console.log("Trade toegevoegd aan tijdelijke lijst:", newTrade);
  };

  return (
    <TradeContext.Provider value={{ trades, addTrade }}>
      {children}
    </TradeContext.Provider>
  );
};

// 4. Een simpele hook om de data te gebruiken
export const useTrades = () => {
  const context = useContext(TradeContext);
  if (!context) {
    throw new Error('useTrades must be used within a TradeProvider');
  }
  return context;
};