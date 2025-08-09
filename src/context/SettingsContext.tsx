import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { SettingsContextType } from '../types';

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

interface SettingsProviderProps {
  children: ReactNode;
}

export const SettingsProvider: React.FC<SettingsProviderProps> = ({ children }) => {
  const [openaiApiKey, setOpenaiApiKeyState] = useState<string | null>(null);

  useEffect(() => {
    const savedKey = localStorage.getItem('openai_api_key');
    if (savedKey) {
      setOpenaiApiKeyState(savedKey);
    }
  }, []);

  const setOpenaiApiKey = (key: string) => {
    setOpenaiApiKeyState(key);
    if (key) {
      localStorage.setItem('openai_api_key', key);
    } else {
      localStorage.removeItem('openai_api_key');
    }
  };

  const value: SettingsContextType = {
    openaiApiKey,
    setOpenaiApiKey,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};