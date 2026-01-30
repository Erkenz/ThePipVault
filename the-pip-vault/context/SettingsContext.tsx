"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type ViewMode = 'pips' | 'currency' | 'percentage';

interface SettingsContextType {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  toggleViewMode: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [viewMode, setViewModeState] = useState<ViewMode>('pips');

  useEffect(() => {
    // Client-side only logic
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('pip-vault-view-mode') as ViewMode;
      if (saved && ['pips', 'currency', 'percentage'].includes(saved)) {
        setViewModeState(saved);
      }
    }
  }, []);

  const setViewMode = (mode: ViewMode) => {
    setViewModeState(mode);
    if (typeof window !== 'undefined') {
      localStorage.setItem('pip-vault-view-mode', mode);
    }
  };

  const toggleViewMode = () => {
    setViewModeState(prev => {
      const next = prev === 'pips' ? 'currency' : prev === 'currency' ? 'percentage' : 'pips';
      if (typeof window !== 'undefined') {
        localStorage.setItem('pip-vault-view-mode', next);
      }
      return next;
    });
  };

  return (
    <SettingsContext.Provider value={{ viewMode, setViewMode, toggleViewMode }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
