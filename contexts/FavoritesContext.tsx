import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ExtensionStorage } from '@bacons/apple-targets';

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

// Create extension storage for sharing data with widget
const widgetStorage = new ExtensionStorage('group.com.arthurbuildsstuff.glow.widget');

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<FavoriteQuote[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load saved favorites on app start
  useEffect(() => {
    loadFavorites();
  }, []);

  // Save favorites when they change (both to AsyncStorage and widget storage)
  useEffect(() => {
    if (!isLoading) {
      saveFavorites();
      shareFavoritesWithWidget();
    }
  }, [favorites, isLoading]);

  const loadFavorites = async () => {
    try {
      const savedFavorites = await AsyncStorage.getItem(STORAGE_KEY);
      if (savedFavorites) {
        const parsed = JSON.parse(savedFavorites);
        if (Array.isArray(parsed)) {
          setFavorites(parsed);
          // Share initial favorites with widget
          try {
            console.log('📤 App: Loading initial favorites for widget, count:', parsed.length);
            widgetStorage.set('favoriteQuotes', JSON.stringify(parsed));
            console.log('✅ App: Initial favorites set in shared storage');
          } catch (error) {
            console.log('❌ App: Error sharing initial favorites with widget:', error);
          }
        }
      }
    } catch (error) {
      console.error('❌ App: Error loading favorites:', error);
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

  const shareFavoritesWithWidget = () => {
    try {
      console.log('📤 App: Sharing favorites with widget, count:', favorites.length);
      widgetStorage.set('favoriteQuotes', JSON.stringify(favorites));
      console.log('✅ App: Favorites successfully shared with widget');
      // Note: Widget reload removed to prevent app from reloading on every like/unlike
      // Widget will get updated data on its next natural refresh or when category changes
    } catch (error) {
      console.log('❌ App: Error sharing favorites with widget:', error);
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
