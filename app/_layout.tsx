import * as Sentry from '@sentry/react-native';
import { Stack, useGlobalSearchParams, usePathname, useRouter } from "expo-router";
import * as SplashScreen from 'expo-splash-screen';
import { PostHogProvider, usePostHog } from 'posthog-react-native';
import { useEffect } from "react";
import { AppState, StatusBar, useColorScheme } from "react-native";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from "react-native-keyboard-controller";
import { UpdateBottomSheet } from "../components/UpdateBottomSheet";
import { useColors } from "../constants/Colors";
import { CategoriesProvider } from "../contexts/CategoriesContext";
import { CustomQuotesProvider } from "../contexts/CustomQuotesContext";
import { FavoritesProvider } from "../contexts/FavoritesContext";
import { InAppUpdatesProvider, useInAppUpdates } from "../contexts/InAppUpdatesContext";
import { NotificationProvider } from "../contexts/NotificationContext";
import { OnboardingProvider } from "../contexts/OnboardingContext";
import { PremiumProvider } from "../contexts/PremiumContext";
import { StreakProvider } from "../contexts/StreakContext";
import { ThemeProvider, useTheme } from "../contexts/ThemeContext";
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
  const Colors = useColors();
  const { effectiveColorScheme } = useTheme();

  // Track screen views in PostHog
  useEffect(() => {
    const screenName = normalizeScreenName(pathname);
    posthog.screen(screenName, params);
  }, [pathname, params, posthog]);

  // Dismiss modals when app goes to background
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'background') {
        // Don't dismiss if user is on notification-denied screen (they may be going to settings)
        if (pathname !== '/onboarding/notification-denied') {
          router.dismissAll();
        }
      }
    });

    return () => {
      subscription.remove();
    };
  }, [router, pathname]);


  return (
    <>
      <StatusBar barStyle={effectiveColorScheme === 'dark' ? 'light-content' : 'dark-content'} />
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
      <ThemeProvider>
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
      </ThemeProvider>
    </GestureHandlerRootView>
  );
});