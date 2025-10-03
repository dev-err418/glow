import { Stack } from "expo-router";
import { StatusBar } from "react-native";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { Colors } from "../constants/Colors";
import { NotificationProvider } from "../contexts/NotificationContext";
import { OnboardingProvider } from "../contexts/OnboardingContext";
import { PremiumProvider } from "../contexts/PremiumContext";
import { CategoriesProvider } from "../contexts/CategoriesContext";
import { FavoritesProvider } from "../contexts/FavoritesContext";
import { CustomQuotesProvider } from "../contexts/CustomQuotesContext";

export default function RootLayout() {

  return (
    <KeyboardProvider>
      <PremiumProvider>
        <NotificationProvider>
          <OnboardingProvider>
            <CategoriesProvider>
              <FavoritesProvider>
                <CustomQuotesProvider>
                  <StatusBar barStyle={"dark-content"} />
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
                      name="categories-modal"
                      options={{
                        presentation: 'modal',
                        headerShown: false
                      }}
                    />
                    <Stack.Screen
                      name="custom-quotes-modal"
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
                      name="onboarding"
                      options={{
                        headerShown: false
                      }}
                    />
                  </Stack>
                </CustomQuotesProvider>
              </FavoritesProvider>
            </CategoriesProvider>
          </OnboardingProvider>
        </NotificationProvider>
      </PremiumProvider>
    </KeyboardProvider>
  );
}
