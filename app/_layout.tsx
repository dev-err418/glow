import { Stack } from "expo-router";
import { NotificationProvider } from "../contexts/NotificationContext";
import { Colors } from "../constants/Colors";

export default function RootLayout() {
  return (
    <NotificationProvider>
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
    </NotificationProvider>
  );
}
