import React, { createContext, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ExpoInAppUpdates from 'expo-in-app-updates';

const SAVED_VERSION_KEY = 'savedStoreVersion';

interface UpdateInfo {
  updateAvailable: boolean;
  storeVersion?: string;
}

interface InAppUpdatesContextType {
  isUpdateSheetVisible: boolean;
  updateInfo: UpdateInfo;
  handleUpdate: () => Promise<void>;
  handleLater: () => Promise<void>;
  showUpdateSheet: () => void;
}

const InAppUpdatesContext = createContext<InAppUpdatesContextType | undefined>(undefined);

export function InAppUpdatesProvider({ children }: { children: React.ReactNode }) {
  const [isUpdateSheetVisible, setIsUpdateSheetVisible] = useState(false);
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo>({ updateAvailable: false });
  const [isDebugMode, setIsDebugMode] = useState(false);

  useEffect(() => {
    // Skip in development and web
    if (__DEV__ || Platform.OS === 'web') return;

    checkForUpdates();
  }, []);

  const checkForUpdates = async () => {
    try {
      const result = await ExpoInAppUpdates.checkForUpdate();

      if (!result.updateAvailable) return;

      // Get the last saved storeVersion from AsyncStorage
      const savedStoreVersion = await AsyncStorage.getItem(SAVED_VERSION_KEY);

      // Check and return to prevent asking for updates again for the same storeVersion
      if (savedStoreVersion === result.storeVersion) return;

      // Store update info and show the bottom sheet
      setUpdateInfo({
        updateAvailable: true,
        storeVersion: result.storeVersion,
      });
      setIsUpdateSheetVisible(true);
    } catch (err) {
      console.error('Update check failed:', err);
    }
  };

  const handleUpdate = async () => {
    try {
      // If debug mode, just close the sheet without calling the real API
      if (isDebugMode) {
        console.log('Debug mode: Skipping actual update call');
        setIsUpdateSheetVisible(false);
        setIsDebugMode(false);
        return;
      }

      await ExpoInAppUpdates.startUpdate(Platform.OS === 'android');

      // Save the version after starting the update
      if (updateInfo.storeVersion) {
        await AsyncStorage.setItem(SAVED_VERSION_KEY, updateInfo.storeVersion);
      }

      setIsUpdateSheetVisible(false);
    } catch (err) {
      console.error('Failed to start update:', err);
    }
  };

  const handleLater = async () => {
    try {
      // If debug mode, just close without saving
      if (isDebugMode) {
        setIsUpdateSheetVisible(false);
        setIsDebugMode(false);
        return;
      }

      // Save the version so we don't ask again for the same version
      if (updateInfo.storeVersion) {
        await AsyncStorage.setItem(SAVED_VERSION_KEY, updateInfo.storeVersion);
      }

      setIsUpdateSheetVisible(false);
    } catch (err) {
      console.error('Failed to save version:', err);
    }
  };

  // Expose method for debug purposes
  const showUpdateSheet = () => {
    setUpdateInfo({
      updateAvailable: true,
      storeVersion: '1.0.1',
    });
    setIsDebugMode(true);
    setIsUpdateSheetVisible(true);
  };

  const value = {
    isUpdateSheetVisible,
    updateInfo,
    handleUpdate,
    handleLater,
    showUpdateSheet,
  };

  return (
    <InAppUpdatesContext.Provider value={value}>
      {children}
    </InAppUpdatesContext.Provider>
  );
}

export function useInAppUpdates() {
  const context = useContext(InAppUpdatesContext);
  if (context === undefined) {
    throw new Error('useInAppUpdates must be used within an InAppUpdatesProvider');
  }
  return context;
}
