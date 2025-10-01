import { Stack } from "expo-router";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { NotificationProvider } from "../contexts/NotificationContext";
import { OnboardingProvider } from "../contexts/OnboardingContext";
import { Colors } from "../constants/Colors";

export default function RootLayout() {
  return (
    <KeyboardProvider>
      <NotificationProvider>
        <OnboardingProvider>
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
          name="settings"
          options={{
            title: 'Settings',
            presentation: 'modal'
          }}
        />
        <Stack.Screen
          name="onboarding"
          options={{
            headerShown: false
          }}
        />
      </Stack>
        </OnboardingProvider>
      </NotificationProvider>
    </KeyboardProvider>
  );
}
