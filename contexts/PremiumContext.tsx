import React, { createContext, useContext, useState, useEffect } from 'react';
import { Platform, Appearance } from 'react-native';
import Purchases, { LOG_LEVEL, CustomerInfo, PurchasesOffering } from 'react-native-purchases';
import RevenueCatUI, { PAYWALL_RESULT } from 'react-native-purchases-ui';
import { usePostHog } from 'posthog-react-native';
import { useTheme } from './ThemeContext';

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
  const posthog = usePostHog();
  const { effectiveColorScheme } = useTheme();

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

      // Identify user in PostHog with RevenueCat user ID
      const userId = info.originalAppUserId;
      const hasPremium = info.entitlements.active['Premium'] !== undefined;
      posthog.identify(userId, {
        platform: Platform.OS,
        isPremium: hasPremium,
      });

      // Set super properties that apply to all events
      posthog.register({
        platform: Platform.OS,
        isPremium: hasPremium,
      });
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

    // Update PostHog super properties when premium status changes
    posthog.register({
      isPremium: hasPremium,
    });
  };

  const showPaywall = async (): Promise<PAYWALL_RESULT> => {
    // Store the current system appearance
    const originalAppearance = Appearance.getColorScheme();

    try {
      // Temporarily set system appearance to match app's theme
      Appearance.setColorScheme(effectiveColorScheme);

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

        // Track premium purchase or restore event
        if (paywallResult === PAYWALL_RESULT.PURCHASED) {
          posthog.capture('Premium Purchased');
        } else if (paywallResult === PAYWALL_RESULT.RESTORED) {
          posthog.capture('Premium Restored');
        }
      } else if (paywallResult === PAYWALL_RESULT.CANCELLED) {
        posthog.capture('Paywall Cancelled');
      }

      return paywallResult;
    } catch (error) {
      console.error('Error showing paywall:', error);
      return PAYWALL_RESULT.ERROR;
    } finally {
      // Restore the original system appearance
      Appearance.setColorScheme(originalAppearance);
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
