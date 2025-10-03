import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ExtensionStorage } from '@bacons/apple-targets';

interface CategoriesContextType {
  selectedCategories: string[];
  updateSelectedCategories: (categories: string[]) => void;
  isLoading: boolean;
}

const CategoriesContext = createContext<CategoriesContextType | undefined>(undefined);

const STORAGE_KEY = 'selectedCategories';
const DEFAULT_CATEGORIES = ['general'];

// Create extension storage for sharing data with widget
const widgetStorage = new ExtensionStorage('group.com.arthurbuildsstuff.glow.widget');

export function CategoriesProvider({ children }: { children: React.ReactNode }) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>(DEFAULT_CATEGORIES);
  const [isLoading, setIsLoading] = useState(true);

  // Load saved categories on app start
  useEffect(() => {
    loadCategories();
  }, []);

  // Save categories when they change
  useEffect(() => {
    if (!isLoading) {
      saveCategories();
    }
  }, [selectedCategories, isLoading]);

  const loadCategories = async () => {
    try {
      const savedCategories = await AsyncStorage.getItem(STORAGE_KEY);
      if (savedCategories) {
        const parsed = JSON.parse(savedCategories);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSelectedCategories(parsed);
          // Share initial categories with widget
          try {
            const categoriesJSON = JSON.stringify(parsed);
            console.log('📤 App: Loading initial categories for widget:', parsed);
            widgetStorage.set('selectedCategories', categoriesJSON);
            console.log('✅ App: Initial categories set in shared storage');
          } catch (error) {
            console.log('❌ App: Error sharing initial categories with widget:', error);
          }
        }
      }
    } catch (error) {
      console.error('❌ App: Error loading categories:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveCategories = async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(selectedCategories));
    } catch (error) {
      console.error('Error saving categories:', error);
    }
  };

  const updateSelectedCategories = (categories: string[]) => {
    // Ensure at least one category is selected
    const newCategories = categories.length === 0 ? DEFAULT_CATEGORIES : categories;
    setSelectedCategories(newCategories);

    // Share selected categories array with widget
    try {
      const categoriesJSON = JSON.stringify(newCategories);
      console.log('📤 App: Setting widget categories to:', newCategories);
      widgetStorage.set('selectedCategories', categoriesJSON);
      console.log('✅ App: Successfully set selectedCategories in shared storage');
      ExtensionStorage.reloadWidget();
      console.log('🔄 App: Widget reload triggered');
    } catch (error) {
      console.log('❌ App: Error sharing categories with widget:', error);
    }
  };

  const value = {
    selectedCategories,
    updateSelectedCategories,
    isLoading,
  };

  return (
    <CategoriesContext.Provider value={value}>
      {children}
    </CategoriesContext.Provider>
  );
}

export function useCategories() {
  const context = useContext(CategoriesContext);
  if (context === undefined) {
    throw new Error('useCategories must be used within a CategoriesProvider');
  }
  return context;
}
