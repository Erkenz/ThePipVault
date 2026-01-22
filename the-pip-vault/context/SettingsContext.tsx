"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type ViewMode = 'pips' | 'currency' | 'percentage';

interface SettingsContextType {
  viewMode: ViewMode;
  toggleViewMode: () => void;
  setViewMode: (mode: ViewMode) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [viewMode, setViewModeState] = useState<ViewMode>('pips');

  useEffect(() => {
    // Load preference from local storage
    const savedMode = localStorage.getItem('pip-vault-view-mode') as ViewMode;
    if (savedMode && (savedMode === 'pips' || savedMode === 'currency' || savedMode === 'percentage')) {
      setViewModeState(savedMode);
    }
  }, []);

  const setViewMode = (mode: ViewMode) => {
    setViewModeState(mode);
    localStorage.setItem('pip-vault-view-mode', mode);
  };

  const toggleViewMode = () => {
    if (viewMode === 'pips') setViewMode('currency');
    else if (viewMode === 'currency') setViewMode('percentage');
    else setViewMode('pips');
  };

  return (
    <SettingsContext.Provider value={{ viewMode, toggleViewMode, setViewMode }}>
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
