import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ExtensionStorage } from '@bacons/apple-targets';

export interface CustomQuote {
  id: string;
  text: string;
  createdAt: string; // ISO date string
  isFavorited: boolean;
}

interface CustomQuotesContextType {
  customQuotes: CustomQuote[];
  addCustomQuote: (text: string) => void;
  removeCustomQuote: (id: string) => void;
  updateCustomQuote: (id: string, text: string) => void;
  toggleFavorite: (id: string) => void;
  isLoading: boolean;
}

const CustomQuotesContext = createContext<CustomQuotesContextType | undefined>(undefined);

const STORAGE_KEY = 'customQuotes';

// Create extension storage for sharing data with widget
const widgetStorage = new ExtensionStorage('group.com.arthurbuildsstuff.glow.widget');

export function CustomQuotesProvider({ children }: { children: React.ReactNode }) {
  const [customQuotes, setCustomQuotes] = useState<CustomQuote[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load saved custom quotes on app start
  useEffect(() => {
    loadCustomQuotes();
  }, []);

  // Save custom quotes when they change (both to AsyncStorage and widget storage)
  useEffect(() => {
    if (!isLoading) {
      saveCustomQuotes();
      shareCustomQuotesWithWidget();
    }
  }, [customQuotes, isLoading]);

  const loadCustomQuotes = async () => {
    try {
      const savedQuotes = await AsyncStorage.getItem(STORAGE_KEY);
      if (savedQuotes) {
        const parsed = JSON.parse(savedQuotes);
        if (Array.isArray(parsed)) {
          setCustomQuotes(parsed);
          // Share initial custom quotes with widget
          try {
            console.log('📤 App: Loading initial custom quotes for widget, count:', parsed.length);
            widgetStorage.set('customQuotes', JSON.stringify(parsed));
            console.log('✅ App: Initial custom quotes set in shared storage');
          } catch (error) {
            console.log('❌ App: Error sharing initial custom quotes with widget:', error);
          }
        }
      }
    } catch (error) {
      console.error('❌ App: Error loading custom quotes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveCustomQuotes = async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(customQuotes));
    } catch (error) {
      console.error('Error saving custom quotes:', error);
    }
  };

  const shareCustomQuotesWithWidget = () => {
    try {
      console.log('📤 App: Sharing custom quotes with widget, count:', customQuotes.length);
      widgetStorage.set('customQuotes', JSON.stringify(customQuotes));
      console.log('✅ App: Custom quotes successfully shared with widget');
      // Note: Widget reload removed to prevent app from reloading
      // Widget will get updated data on its next natural refresh or when category changes
    } catch (error) {
      console.log('❌ App: Error sharing custom quotes with widget:', error);
    }
  };

  const addCustomQuote = (text: string) => {
    const newQuote: CustomQuote = {
      id: Date.now().toString(),
      text: text.trim(),
      createdAt: new Date().toISOString(),
      isFavorited: false,
    };
    setCustomQuotes((prev) => [newQuote, ...prev]); // Add to beginning
  };

  const removeCustomQuote = (id: string) => {
    setCustomQuotes((prev) => prev.filter((quote) => quote.id !== id));
  };

  const updateCustomQuote = (id: string, text: string) => {
    setCustomQuotes((prev) =>
      prev.map((quote) =>
        quote.id === id ? { ...quote, text: text.trim() } : quote
      )
    );
  };

  const toggleFavorite = (id: string) => {
    setCustomQuotes((prev) =>
      prev.map((quote) =>
        quote.id === id ? { ...quote, isFavorited: !quote.isFavorited } : quote
      )
    );
  };

  const value = {
    customQuotes,
    addCustomQuote,
    removeCustomQuote,
    updateCustomQuote,
    toggleFavorite,
    isLoading,
  };

  return (
    <CustomQuotesContext.Provider value={value}>
      {children}
    </CustomQuotesContext.Provider>
  );
}

export function useCustomQuotes() {
  const context = useContext(CustomQuotesContext);
  if (context === undefined) {
    throw new Error('useCustomQuotes must be used within a CustomQuotesProvider');
  }
  return context;
}
