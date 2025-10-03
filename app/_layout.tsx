import { Stack, useRouter } from "expo-router";
import { PostHogProvider } from 'posthog-react-native';
import { useEffect } from "react";
import { AppState, Linking, StatusBar } from "react-native";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { Colors } from "../constants/Colors";
import { CategoriesProvider } from "../contexts/CategoriesContext";
import { CustomQuotesProvider } from "../contexts/CustomQuotesContext";
import { FavoritesProvider } from "../contexts/FavoritesContext";
import { NotificationProvider } from "../contexts/NotificationContext";
import { OnboardingProvider } from "../contexts/OnboardingContext";
import { PremiumProvider } from "../contexts/PremiumContext";
import { StreakProvider } from "../contexts/StreakContext";
import "../services/notificationService";
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: 'https://13a334d3dd9bd7fab7d14c26c2214c2b@o4510128131145728.ingest.de.sentry.io/4510128132522064',

  // Adds more context data to events (IP address, cookies, user, etc.)
  // For more information, visit: https://docs.sentry.io/platforms/react-native/data-management/data-collected/
  sendDefaultPii: true,

  // Enable Logs
  enableLogs: false,

  // uncomment the line below to enable Spotlight (https://spotlightjs.com)
  // spotlight: __DEV__,
});

function RootLayoutContent() {
  const router = useRouter();

  // Handle deep links from widget (glow://?id=xyz)
  useEffect(() => {
    // Check if app was opened from a deep link (cold start)
    const handleInitialURL = async () => {
      const initialUrl = await Linking.getInitialURL();
      if (initialUrl) {
        const url = new URL(initialUrl);
        const quoteId = url.searchParams.get('id');
        if (quoteId) {
          console.log('🔗 App opened from widget deep link with quote ID:', quoteId);
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
        router.setParams({ id: quoteId });
      }
    });

    return () => {
      subscription.remove();
    };
  }, [router]);

  // Dismiss modals when app goes to background
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'background') {
        router.dismissAll();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [router]);

  return (
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
  );
}

export default Sentry.wrap(function RootLayout() {
  return (
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
                      <StatusBar barStyle={"dark-content"} />
                      <RootLayoutContent />
                    </CustomQuotesProvider>
                  </FavoritesProvider>
                </OnboardingProvider>
              </NotificationProvider>
            </CategoriesProvider>
          </StreakProvider>
        </PremiumProvider>
      </KeyboardProvider>
    </PostHogProvider>
  );
});