import { Stack } from "expo-router";
import { Colors } from "../../constants/Colors";

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.background.default,
        },
        headerTintColor: Colors.secondary,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerBackTitle: 'Back',
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="welcome"
        options={{
          title: 'Welcome',
          headerShown: false
        }}
      />
      <Stack.Screen
        name="name"
        options={{
          title: "What's your name?",
        }}
      />
      <Stack.Screen
        name="age"
        options={{
          title: 'Age',
        }}
      />
      <Stack.Screen
        name="sex"
        options={{
          title: 'Gender',
        }}
      />
      <Stack.Screen
        name="mental-health"
        options={{
          title: 'Mental health',
        }}
      />
      <Stack.Screen
        name="benefits"
        options={{
          title: 'Benefits',
        }}
      />
      <Stack.Screen
        name="notifications"
        options={{
          title: 'Notifications',
        }}
      />
      <Stack.Screen
        name="streak-intro"
        options={{
          title: 'Build your streak',
        }}
      />
      <Stack.Screen
        name="streak-goal"
        options={{
          title: 'Streak goal',
        }}
      />
    </Stack>
  );
}