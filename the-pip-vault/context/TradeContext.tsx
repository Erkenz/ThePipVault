"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';

export interface Trade {
  id: string;
  user_id: string;
  date: string;
  pair: string;
  direction: 'LONG' | 'SHORT';
  entryPrice: number;
  stopLoss: number;
  takeProfit?: number;
  pnl: number;
  pnl_currency?: number;
  comment?: string;
  session: string;
  setup?: string;
  emotion?: string;
  chartUrl?: string;
  rrRatio?: number;
}

interface TradeContextType {
  trades: Trade[];
  addTrade: (trade: Omit<Trade, 'id' | 'user_id'>) => Promise<void>;
  updateTrade: (id: string, trade: Partial<Omit<Trade, 'id' | 'user_id'>>) => Promise<void>;
  deleteTrade: (id: string) => Promise<void>;
  loading: boolean;
}

const TradeContext = createContext<TradeContextType | undefined>(undefined);

export const TradeProvider = ({ children }: { children: ReactNode }) => {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  // De fetch functie is nu een useCallback zodat we deze kunnen aanroepen bij login events
  const fetchTrades = useCallback(async () => {
    try {
      setLoading(true);

      // Controleer eerst of er een user is
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setTrades([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('trades')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;

      const mappedTrades: Trade[] = (data || []).map(t => ({
        id: t.id,
        user_id: t.user_id,
        date: t.date,
        pair: t.pair,
        direction: t.direction,
        entryPrice: Number(t.entry_price),
        stopLoss: Number(t.stop_loss),
        takeProfit: t.take_profit ? Number(t.take_profit) : undefined,
        pnl: Number(t.pnl),
        pnl_currency: t.pnl_currency ? Number(t.pnl_currency) : undefined,
        session: t.session,
        comment: t.trade_comment, // Map comment from DB
        setup: t.setup,
        emotion: t.emotion,
        chartUrl: t.chart_url,
        rrRatio: t.rr_ratio ? Number(t.rr_ratio) : undefined,
      }));

      setTrades(mappedTrades);
    } catch (err) {
      console.error("Fout bij ophalen trades:", err);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  // Luister naar Auth veranderingen om data te laden/wissen
  useEffect(() => {
    // Haal initieel de trades op
    fetchTrades();

    // Luister naar inlog/uitlog events
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
        fetchTrades();
      } else if (event === 'SIGNED_OUT') {
        setTrades([]);
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, fetchTrades]);

  const addTrade = async (newTradeData: Omit<Trade, 'id' | 'user_id'>) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Niet ingelogd");

      const tradeToInsert = {
        user_id: userData.user.id,
        date: newTradeData.date,
        pair: newTradeData.pair,
        direction: newTradeData.direction,
        entry_price: newTradeData.entryPrice,
        stop_loss: newTradeData.stopLoss,
        take_profit: newTradeData.takeProfit,
        pnl: newTradeData.pnl,
        setup: newTradeData.setup,
        emotion: newTradeData.emotion,
        chart_url: newTradeData.chartUrl,
        rr_ratio: newTradeData.rrRatio,
        pnl_currency: newTradeData.pnl_currency,
        trade_comment: newTradeData.comment // Insert comment
      };

      const { data, error } = await supabase
        .from('trades')
        .insert([tradeToInsert])
        .select();

      if (error) {
        console.error("Supabase Error Details:", error.message);
        throw error;
      }

      if (!data || data.length === 0) throw new Error("Geen data teruggekregen");

      const savedTradeRaw = data[0];
      const savedTrade: Trade = {
        ...savedTradeRaw,
        entryPrice: Number(savedTradeRaw.entry_price),
        stopLoss: Number(savedTradeRaw.stop_loss),
        takeProfit: Number(savedTradeRaw.take_profit),
        chartUrl: savedTradeRaw.chart_url,
        rrRatio: Number(savedTradeRaw.rr_ratio),
        pnl_currency: Number(savedTradeRaw.pnl_currency),
        comment: savedTradeRaw.trade_comment
      };

      setTrades((prev) => [savedTrade, ...prev]);
    } catch (err: any) {
      console.error("Fout bij toevoegen trade:", err.message || err);
      throw err;
    }
  };

  const updateTrade = async (id: string, updatedData: Partial<Omit<Trade, 'id' | 'user_id'>>) => {
    try {
      const tradeToUpdate: any = {};
      if (updatedData.pair) tradeToUpdate.pair = updatedData.pair;
      if (updatedData.direction) tradeToUpdate.direction = updatedData.direction;
      if (updatedData.entryPrice) tradeToUpdate.entry_price = updatedData.entryPrice;
      if (updatedData.stopLoss) tradeToUpdate.stop_loss = updatedData.stopLoss;
      if (updatedData.takeProfit !== undefined) tradeToUpdate.take_profit = updatedData.takeProfit;
      if (updatedData.pnl) tradeToUpdate.pnl = updatedData.pnl;
      if (updatedData.pnl_currency !== undefined) tradeToUpdate.pnl_currency = updatedData.pnl_currency;
      if (updatedData.setup) tradeToUpdate.setup = updatedData.setup;
      if (updatedData.emotion) tradeToUpdate.emotion = updatedData.emotion;
      if (updatedData.session) tradeToUpdate.session = updatedData.session;
      if (updatedData.chartUrl) tradeToUpdate.chart_url = updatedData.chartUrl;
      if (updatedData.rrRatio) tradeToUpdate.rr_ratio = updatedData.rrRatio;
      if (updatedData.comment !== undefined) tradeToUpdate.trade_comment = updatedData.comment;
      if (updatedData.date) tradeToUpdate.date = updatedData.date;

      const { data, error } = await supabase
        .from('trades')
        .update(tradeToUpdate)
        .eq('id', id)
        .select();

      if (error) throw error;

      if (!data || data.length === 0) throw new Error("Update mislukt");

      const updatedTradeRaw = data[0];
      // Update local state
      setTrades(prev => prev.map(t => t.id === id ? {
        ...t,
        ...updatedData,
        // Merge any returned fields if needed, but simple overwrite here works if we trust the input
        // Better to use the returned data to be sure
        pair: updatedTradeRaw.pair,
        entryPrice: Number(updatedTradeRaw.entry_price),
        stopLoss: Number(updatedTradeRaw.stop_loss),
        pnl: Number(updatedTradeRaw.pnl),
        // ... map others properly potentially, or just optimistically update from updatedData + id/user_id preservation
        comment: updatedTradeRaw.trade_comment
      } : t));
    } catch (err) {
      console.error("Fout bij updaten trade:", err);
      throw err;
    }
  };

  const deleteTrade = async (id: string) => {
    try {
      const { error } = await supabase
        .from('trades')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setTrades((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      console.error("Fout bij verwijderen trade:", err);
    }
  };

  return (
    <TradeContext.Provider value={{ trades, addTrade, updateTrade, deleteTrade, loading }}>
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