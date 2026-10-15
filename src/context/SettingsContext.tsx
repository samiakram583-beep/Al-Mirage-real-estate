import React, { createContext, useContext, useState, useEffect } from 'react';
import { SiteSettings } from '../types';
import { getSiteSettings, updateSiteSettings as updateStoreSettings } from '../services/store';
import { INITIAL_SETTINGS } from '../data/seedData';

interface SettingsContextType {
  settings: SiteSettings;
  updateSettings: (newSettings: Partial<SiteSettings>) => Promise<void>;
  loading: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SiteSettings>(INITIAL_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSiteSettings()
      .then((data) => {
        if (data) setSettings(data);
      })
      .finally(() => setLoading(false));
  }, []);

  const updateSettings = async (newSettings: Partial<SiteSettings>) => {
    const updated = await updateStoreSettings(newSettings);
    setSettings(updated);
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, loading }}>
      {children}
    </SettingsContext.Provider>
  );
};

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return context;
}
