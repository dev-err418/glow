import { Stack, useRouter } from "expo-router";
import { useEffect } from "react";
import { StatusBar, AppState, Linking } from "react-native";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { Colors } from "../constants/Colors";
import { NotificationProvider } from "../contexts/NotificationContext";
import { OnboardingProvider } from "../contexts/OnboardingContext";
import { PremiumProvider } from "../contexts/PremiumContext";
import { CategoriesProvider } from "../contexts/CategoriesContext";
import { FavoritesProvider } from "../contexts/FavoritesContext";
import { CustomQuotesProvider } from "../contexts/CustomQuotesContext";
import { StreakProvider } from "../contexts/StreakContext";
import "../services/notificationService"; // Configure notification handler

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

export default function RootLayout() {
  return (
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
  );
}
