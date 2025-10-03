import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface FavoriteQuote {
  text: string;
  category: string;
}

interface FavoritesContextType {
  favorites: FavoriteQuote[];
  addFavorite: (quote: FavoriteQuote) => void;
  removeFavorite: (quote: FavoriteQuote) => void;
  isFavorite: (quote: FavoriteQuote) => boolean;
  isLoading: boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

const STORAGE_KEY = 'favoriteQuotes';

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<FavoriteQuote[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load saved favorites on app start
  useEffect(() => {
    loadFavorites();
  }, []);

  // Save favorites when they change
  useEffect(() => {
    if (!isLoading) {
      saveFavorites();
    }
  }, [favorites, isLoading]);

  const loadFavorites = async () => {
    try {
      const savedFavorites = await AsyncStorage.getItem(STORAGE_KEY);
      if (savedFavorites) {
        const parsed = JSON.parse(savedFavorites);
        if (Array.isArray(parsed)) {
          setFavorites(parsed);
        }
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveFavorites = async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
    } catch (error) {
      console.error('Error saving favorites:', error);
    }
  };

  const addFavorite = (quote: FavoriteQuote) => {
    setFavorites((prev) => {
      // Check if already exists (by text and category)
      const exists = prev.some(
        (fav) => fav.text === quote.text && fav.category === quote.category
      );
      if (exists) {
        return prev;
      }
      return [...prev, quote];
    });
  };

  const removeFavorite = (quote: FavoriteQuote) => {
    setFavorites((prev) =>
      prev.filter((fav) => !(fav.text === quote.text && fav.category === quote.category))
    );
  };

  const isFavorite = (quote: FavoriteQuote) => {
    return favorites.some(
      (fav) => fav.text === quote.text && fav.category === quote.category
    );
  };

  const value = {
    favorites,
    addFavorite,
    removeFavorite,
    isFavorite,
    isLoading,
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
}
