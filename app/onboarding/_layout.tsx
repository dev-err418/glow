import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import { TouchableOpacity } from "react-native";
import { Colors } from "../../constants/Colors";

export default function OnboardingLayout() {
  const router = useRouter();

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
        headerBackTitle: '',
        headerShadowVisible: false,
        headerLeft: ({ canGoBack }) =>
          canGoBack ? (
            <TouchableOpacity
              onPress={() => router.back()}
              style={{ marginLeft: 2 }}
            >
              <Ionicons name="chevron-back" size={28} color={Colors.secondary} />
            </TouchableOpacity>
          ) : null,
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
        name="notification-permission"
        options={{
          title: 'Enable notifications',
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
      <Stack.Screen
        name="categories"
        options={{
          title: 'Categories',
        }}
      />
      <Stack.Screen
        name="widget"
        options={{
          title: 'Widget',
        }}
      />
      <Stack.Screen
        name="premium"
        options={{
          title: 'Offer',
        }}
      />
    </Stack>
  );
}