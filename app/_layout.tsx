import { Stack, useRouter } from "expo-router";
import { useEffect } from "react";
import { StatusBar, AppState } from "react-native";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { Colors } from "../constants/Colors";
import { NotificationProvider } from "../contexts/NotificationContext";
import { OnboardingProvider } from "../contexts/OnboardingContext";
import { PremiumProvider } from "../contexts/PremiumContext";
import { CategoriesProvider } from "../contexts/CategoriesContext";
import { FavoritesProvider } from "../contexts/FavoritesContext";
import { CustomQuotesProvider } from "../contexts/CustomQuotesContext";
import { StreakProvider } from "../contexts/StreakContext";

function RootLayoutContent() {
  const router = useRouter();

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
      <NotificationProvider>
        <OnboardingProvider>
          <CategoriesProvider>
            <FavoritesProvider>
              <CustomQuotesProvider>
                <StreakProvider>
                  <StatusBar barStyle={"dark-content"} />
                  <RootLayoutContent />
                </StreakProvider>
              </CustomQuotesProvider>
            </FavoritesProvider>
          </CategoriesProvider>
        </OnboardingProvider>
      </NotificationProvider>
    </PremiumProvider>
  </KeyboardProvider>
  );
}
