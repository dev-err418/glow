import React, { createContext, useContext, useState, useEffect } from 'react';
import { Platform } from 'react-native';
import Purchases, { LOG_LEVEL, CustomerInfo, PurchasesOffering } from 'react-native-purchases';
import RevenueCatUI, { PAYWALL_RESULT } from 'react-native-purchases-ui';

interface PremiumContextType {
  isPremium: boolean;
  isLoading: boolean;
  customerInfo: CustomerInfo | null;
  showPaywall: () => Promise<PAYWALL_RESULT>;
  restorePurchases: () => Promise<void>;
}

const PremiumContext = createContext<PremiumContextType | undefined>(undefined);

export function PremiumProvider({ children }: { children: React.ReactNode }) {
  const [isPremium, setIsPremium] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);

  useEffect(() => {
    initializePurchases();
  }, []);

  const initializePurchases = async () => {
    try {
      // Configure RevenueCat
      Purchases.setLogLevel(LOG_LEVEL.VERBOSE);

      if (Platform.OS === 'ios') {
        await Purchases.configure({ apiKey: process.env.EXPO_PUBLIC_RC_API_KEY_IOS! });
      } else if (Platform.OS === 'android') {
        // Add Android key if needed
        // await Purchases.configure({ apiKey: process.env.EXPO_PUBLIC_RC_API_KEY_ANDROID! });
      }

      // Get initial customer info
      const info = await Purchases.getCustomerInfo();
      updateCustomerInfo(info);
    } catch (error) {
      console.error('Error initializing purchases:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateCustomerInfo = (info: CustomerInfo) => {
    setCustomerInfo(info);
    // Check if user has premium entitlement
    const hasPremium = info.entitlements.active['Premium'] !== undefined;
    setIsPremium(hasPremium);
  };

  const showPaywall = async (): Promise<PAYWALL_RESULT> => {
    try {
      const paywallResult = await RevenueCatUI.presentPaywallIfNeeded({
        requiredEntitlementIdentifier: 'Premium',
        options: {
          displayCloseButton: true,
          fontFamily: 'UncutSans-Variable',
        },
      });

      // Refresh customer info after paywall interaction
      if (paywallResult === PAYWALL_RESULT.PURCHASED || paywallResult === PAYWALL_RESULT.RESTORED) {
        const info = await Purchases.getCustomerInfo();
        updateCustomerInfo(info);
      }

      return paywallResult;
    } catch (error) {
      console.error('Error showing paywall:', error);
      return PAYWALL_RESULT.ERROR;
    }
  };

  const restorePurchases = async () => {
    try {
      const info = await Purchases.restorePurchases();
      updateCustomerInfo(info);
    } catch (error) {
      console.error('Error restoring purchases:', error);
      throw error;
    }
  };

  const value = {
    isPremium,
    isLoading,
    customerInfo,
    showPaywall,
    restorePurchases,
  };

  return (
    <PremiumContext.Provider value={value}>
      {children}
    </PremiumContext.Provider>
  );
}

export function usePremium() {
  const context = useContext(PremiumContext);
  if (context === undefined) {
    throw new Error('usePremium must be used within a PremiumProvider');
  }
  return context;
}
