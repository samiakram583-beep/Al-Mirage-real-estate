import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from './ToastContext';
import { recordFavoriteEvent } from '../services/store';

interface FavoritesContextType {
  favorites: string[];
  toggleFavorite: (propertyId: string, propertyCode?: string) => void;
  isFavorite: (propertyId: string) => boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('almiraj_favorites');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const { showToast } = useToast();

  useEffect(() => {
    try {
      localStorage.setItem('almiraj_favorites', JSON.stringify(favorites));
    } catch (e) {
      console.error(e);
    }
  }, [favorites]);

  const toggleFavorite = (propertyId: string, propertyCode?: string) => {
    setFavorites((prev) => {
      const exists = prev.includes(propertyId);
      if (exists) {
        showToast('Removed from Saved', propertyCode ? `Property ${propertyCode} removed.` : undefined, 'info');
        return prev.filter((id) => id !== propertyId);
      } else {
        recordFavoriteEvent(propertyId).catch(() => {});
        showToast('Saved to Favorites', propertyCode ? `Property ${propertyCode} saved.` : 'View in your saved listings.', 'success');
        return [...prev, propertyId];
      }
    });
  };

  const isFavorite = (propertyId: string) => favorites.includes(propertyId);

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within FavoritesProvider');
  }
  return context;
}
