import { createClient } from './client';

const supabase = createClient();

export const tradeService = {
  // Haal alle trades op voor de ingelogde gebruiker
  async getTrades() {
    const { data, error } = await supabase
      .from('trades')
      .select('*')
      .order('date', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // Voeg een nieuwe trade toe
  async addTrade(trade: any) {
    const { data, error } = await supabase
      .from('trades')
      .insert([trade])
      .select();
    
    if (error) throw error;
    return data[0];
  },

  // Verwijder een trade
  async deleteTrade(id: string) {
    const { error } = await supabase
      .from('trades')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};