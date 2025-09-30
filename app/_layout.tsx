import { Stack } from "expo-router";
import { NotificationProvider } from "../contexts/NotificationContext";

export default function RootLayout() {
  return (
    <NotificationProvider>
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: '#007AFF',
          },
          headerTintColor: '#fff',
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
      </Stack>
    </NotificationProvider>
  );
}
