"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';

interface Profile {
  first_name?: string;
  last_name?: string;
  starting_equity: number;
  currency: string;
  sessions: string[];
  strategies: string[];
  role: 'admin' | 'user';
  asset_class: 'forex' | 'futures';
  account_types: string[];
}

interface ProfileContextType {
  profile: Profile;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  resetTradesOnly: () => Promise<void>;
  resetSettingsOnly: () => Promise<void>;
  resetFullAccount: () => Promise<void>;
  loading: boolean;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider = ({ children }: { children: React.ReactNode }) => {
  const [profile, setProfile] = useState<Profile>({
    first_name: '',
    last_name: '',
    starting_equity: 10000,
    currency: 'USD',
    sessions: ['London', 'New York', 'Asia'],
    strategies: ['Trend Continuation', 'Breakout', 'Reversal'],
    role: 'user',
    asset_class: 'forex',
    account_types: ['Demo', 'Challenge', 'Funded', 'Live']
  });
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (data) {
        setProfile({
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          starting_equity: Number(data.starting_equity),
          currency: data.currency,
          sessions: data.sessions || [],
          strategies: data.strategies || ['Trend Continuation', 'Breakout', 'Reversal'],
          role: data.role || 'user',
          asset_class: data.asset_class || 'forex',
          account_types: data.account_types || ['Demo', 'Challenge', 'Funded', 'Live']
        });
      }
    } catch (err) {
      console.error("Profile fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // UPDATE of INSERT (Upsert)
  const updateProfile = async (updates: Partial<Profile>) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const newProfileData = {
      id: user.id,
      ...profile,
      ...updates,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('profiles')
      .upsert(newProfileData);

    if (error) throw error;
    setProfile(prev => ({ ...prev, ...updates }));
  };

  // RESET LOGICA
  const resetTradesOnly = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from('trades').delete().eq('user_id', user.id);
    if (error) throw error;
    window.location.reload();
  };

  const resetSettingsOnly = async () => {
    await updateProfile({
      first_name: '',
      last_name: '',
      starting_equity: 10000,
      currency: 'USD',
      sessions: ['London', 'New York', 'Asia'],
      asset_class: 'forex',
      account_types: ['Demo', 'Challenge', 'Funded', 'Live']
    });
  };

  const resetFullAccount = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    // Verwijder trades en zet profiel terug
    await supabase.from('trades').delete().eq('user_id', user.id);
    await resetSettingsOnly();
    window.location.reload();
  };

  return (
    <ProfileContext.Provider value={{
      profile,
      updateProfile,
      resetTradesOnly,
      resetSettingsOnly,
      resetFullAccount,
      loading
    }}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (!context) throw new Error('useProfile must be used within ProfileProvider');
  return context;
};