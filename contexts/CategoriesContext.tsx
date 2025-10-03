import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface CategoriesContextType {
  selectedCategories: string[];
  updateSelectedCategories: (categories: string[]) => void;
  isLoading: boolean;
}

const CategoriesContext = createContext<CategoriesContextType | undefined>(undefined);

const STORAGE_KEY = 'selectedCategories';
const DEFAULT_CATEGORIES = ['general'];

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
        }
      }
    } catch (error) {
      console.error('Error loading categories:', error);
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
    if (categories.length === 0) {
      setSelectedCategories(DEFAULT_CATEGORIES);
    } else {
      setSelectedCategories(categories);
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
