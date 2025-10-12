import * as Sentry from '@sentry/react-native';
import * as SplashScreen from 'expo-splash-screen';
import { Stack, useRouter, usePathname, useGlobalSearchParams } from "expo-router";
import { PostHogProvider, usePostHog } from 'posthog-react-native';
import { useEffect } from "react";
import { AppState, Linking, StatusBar } from "react-native";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from "react-native-keyboard-controller";
import { UpdateBottomSheet } from "../components/UpdateBottomSheet";
import { Colors } from "../constants/Colors";
import { CategoriesProvider, useCategories } from "../contexts/CategoriesContext";
import { CustomQuotesProvider } from "../contexts/CustomQuotesContext";
import { FavoritesProvider } from "../contexts/FavoritesContext";
import { InAppUpdatesProvider, useInAppUpdates } from "../contexts/InAppUpdatesContext";
import { NotificationProvider } from "../contexts/NotificationContext";
import { OnboardingProvider, useOnboarding } from "../contexts/OnboardingContext";
import { PremiumProvider } from "../contexts/PremiumContext";
import { StreakProvider } from "../contexts/StreakContext";
import "../services/notificationService";
import { normalizeScreenName } from "../utils/analytics";

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync().catch(console.warn);

Sentry.init({
  dsn: 'https://13a334d3dd9bd7fab7d14c26c2214c2b@o4510128131145728.ingest.de.sentry.io/4510128132522064',

  // Adds more context data to events (IP address, cookies, user, etc.)
  // For more information, visit: https://docs.sentry.io/platforms/react-native/data-management/data-collected/
  sendDefaultPii: true,

  // Enable Logs
  // enableLogs: false,  

  // uncomment the line below to enable Spotlight (https://spotlightjs.com)
  // spotlight: __DEV__,
});

function RootLayoutContent() {
  const router = useRouter();
  const { isUpdateSheetVisible, updateInfo, handleUpdate, handleLater } = useInAppUpdates();
  const posthog = usePostHog();
  const pathname = usePathname();
  const params = useGlobalSearchParams();
  const { isOnboardingComplete, isLoading: isOnboardingLoading } = useOnboarding();
  const { isLoading: isCategoriesLoading } = useCategories();

  // Hide splash screen when all contexts are loaded
  useEffect(() => {
    if (!isOnboardingLoading && !isCategoriesLoading) {
      SplashScreen.hideAsync().catch(console.warn);
    }
  }, [isOnboardingLoading, isCategoriesLoading]);

  // Track screen views in PostHog
  useEffect(() => {
    const screenName = normalizeScreenName(pathname);
    posthog.screen(screenName, params);
  }, [pathname, params, posthog]);

  // Handle deep links from widget (glow://?id=xyz)
  useEffect(() => {
    // Only process deep links if onboarding is complete
    if (isOnboardingLoading || !isOnboardingComplete) {
      console.log('🔗 Ignoring deep link - onboarding not complete');
      return;
    }

    // Check if app was opened from a deep link (cold start)
    const handleInitialURL = async () => {
      const initialUrl = await Linking.getInitialURL();
      if (initialUrl) {
        const url = new URL(initialUrl);
        const quoteId = url.searchParams.get('id');
        if (quoteId) {
          console.log('🔗 App opened from widget deep link with quote ID:', quoteId);
          // Dismiss any modals back to index, then set the quote ID param
          router.dismissTo('/');
          router.setParams({ id: quoteId });
        }
      }
    };

    handleInitialURL();

    // Listen for deep links while app is running
    const subscription = Linking.addEventListener('url', (event) => {
      const url = new URL(event.url);
      const quoteId = url.searchParams.get('id');
      if (quoteId) {
        console.log('🔗 Widget deep link received with quote ID:', quoteId);
        // Dismiss any modals back to index, then set the quote ID param
        router.dismissTo('/');
        router.setParams({ id: quoteId });
      }
    });

    return () => {
      subscription.remove();
    };
  }, [router, isOnboardingLoading, isOnboardingComplete]);


  return (
    <>
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: Colors.secondary,
          },
          headerTintColor: Colors.text.white,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen
          name="index"
          getId={() => 'index'}
          options={{
            title: 'Glow App',
            headerShown: false
          }}
        />
        <Stack.Screen
          name="categories"
          options={{
            presentation: 'modal',
            headerShown: false
          }}
        />
        <Stack.Screen
          name="mix-modal"
          options={{
            presentation: 'modal',
            headerShown: false
          }}
        />
        <Stack.Screen
          name="share-modal"
          options={{
            presentation: 'modal',
            headerShown: false
          }}
        />
        <Stack.Screen
          name="settings"
          options={{
            presentation: 'modal',
            headerShown: false
          }}
        />
        <Stack.Screen
          name="onboarding"
          options={{
            headerShown: false
          }}
        />
      </Stack>

      {/* Update Bottom Sheet */}
      <UpdateBottomSheet
        isVisible={isUpdateSheetVisible}
        onUpdate={handleUpdate}
        onLater={handleLater}
        storeVersion={updateInfo.storeVersion}
      />
    </>
  );
}

export default Sentry.wrap(function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PostHogProvider
        apiKey="phc_4NPUazdcWH8ap7z40KAGmADw5yBlZZVtLng0i3e6a5u"
        options={{
          host: 'https://eu.i.posthog.com',
          enableSessionReplay: true,
        }}
        autocapture
      >
        <KeyboardProvider>
          <PremiumProvider>
            <StreakProvider>
              <CategoriesProvider>
                <NotificationProvider>
                  <OnboardingProvider>
                    <FavoritesProvider>
                      <CustomQuotesProvider>
                        <InAppUpdatesProvider>
                          <StatusBar barStyle={"dark-content"} />
                          <RootLayoutContent />
                        </InAppUpdatesProvider>
                      </CustomQuotesProvider>
                    </FavoritesProvider>
                  </OnboardingProvider>
                </NotificationProvider>
              </CategoriesProvider>
            </StreakProvider>
          </PremiumProvider>
        </KeyboardProvider>
      </PostHogProvider>
    </GestureHandlerRootView>
  );
});