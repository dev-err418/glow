# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Glow is a React Native mobile app built with Expo that provides mindful daily reminders through scheduled notifications. The app uses file-based routing via `expo-router` and targets iOS, Android, and web platforms.

## Key Commands

```bash
# Start development server
npx expo start

# Platform-specific builds
npm run android           # Start on Android emulator
npm run ios              # Start on iOS simulator
npm run web              # Start web version

# Widget development (iOS)
npm run build-widget     # Prebuild widget target for iOS

# Code quality
npm run lint             # Run ESLint

# Dependencies
npm install              # Install dependencies
npx expo install         # Install Expo SDK packages
```

## Architecture

### Routing (File-based with expo-router)
- **app/_layout.tsx**: Root layout with Stack navigator wrapping provider hierarchy; handles widget deep links (`glow://?id=xyz`) and dismisses modals on background
- **app/index.tsx**: Main home screen; auto-redirects to onboarding if not completed
- **app/onboarding/**: Multi-screen onboarding flow (welcome, name, age, sex, mental-health, streak-intro, streak-goal, benefits, notifications, notification-permission, widget, premium, categories)
- **app/categories/**: Category browsing and management
  - **index.tsx**: Main categories browser
  - **custom-quotes.tsx**: Create and manage custom user quotes
  - **create-mix.tsx**: Create custom category mixes
- **app/settings/**: Settings screens with nested routes
  - **index.tsx**: Main settings screen
  - **notifications.tsx**: Notification preferences
  - **customer-center.tsx**: RevenueCat customer center (subscription management)
  - **feedback.tsx**: User feedback submission
  - **widget.tsx**: Widget installation instructions
  - **edit-name.tsx**: Edit user name
  - **edit-gender.tsx**: Edit user gender
- **app/mix-modal.tsx**: Modal for category mixing/selection
- **app/share-modal.tsx**: Modal for sharing affirmations (image export with quotes)

Routes use Expo Router's file-based system where file structure defines navigation hierarchy.

### State Management (React Context)
The app uses multiple context providers that wrap the entire application in a specific order (see `app/_layout.tsx`):

**Provider Hierarchy** (outermost to innermost):
1. **PostHogProvider** - Analytics and session replay
2. **KeyboardProvider** - React Native Keyboard Controller
3. **PremiumProvider** - RevenueCat integration
4. **StreakProvider** - Daily activity streak tracking
5. **CategoriesProvider** - Selected affirmation categories
6. **NotificationProvider** - Notification scheduling
7. **OnboardingProvider** - Onboarding flow state
8. **FavoritesProvider** - Favorited quotes management
9. **CustomQuotesProvider** - User-created custom quotes
10. **InAppUpdatesProvider** - In-app update prompts

**PremiumContext** (`contexts/PremiumContext.tsx`):
- Manages RevenueCat integration for premium subscriptions
- Checks premium entitlement status (`entitlements.active['Premium']`)
- Presents paywall via `RevenueCatUI.presentPaywallIfNeeded()`
- Access via `usePremium()` hook
- Requires `EXPO_PUBLIC_RC_API_KEY_IOS` environment variable

**OnboardingContext** (`contexts/OnboardingContext.tsx`):
- Manages multi-screen onboarding flow and data collection
- Persists onboarding state to AsyncStorage (key: 'onboardingData')
- Submits completed onboarding data to Supabase using RevenueCat user ID on completion
- Tracks completion status; `app/index.tsx` uses this to redirect incomplete users
- Collects: name, age, sex, mental health methods, streak goal, categories, notification preferences, widget install status, premium trial data
- Access via `useOnboarding()` hook

**NotificationContext** (`contexts/NotificationContext.tsx`):
- Manages global notification state using React Context
- Persists settings to AsyncStorage (notifications enabled, count per day, time windows)
- Handles permission requests and notification scheduling
- Schedules notifications distributed between configurable time windows (default: 6 AM - 10 PM)
- Access via `useNotifications()` hook

**StreakContext** (`contexts/StreakContext.tsx`):
- Manages daily activity streak tracking
- Persists streak data to AsyncStorage (key: 'streakData')
- Tracks consecutive days of user activity
- Calculates current streak based on consecutive daily activity (today or yesterday counts as active)
- Uses local timezone for date tracking (YYYY-MM-DD format)
- Access via `useStreak()` hook

**CategoriesContext** (`contexts/CategoriesContext.tsx`):
- Manages selected affirmation categories for the user
- Persists to AsyncStorage (key: 'selectedCategories')
- Shares category data with iOS widget via ExtensionStorage (app group: 'group.com.arthurbuildsstuff.glow.widget')
- Enforces at least one category must be selected (defaults to 'general')
- Triggers widget reload when categories change
- Access via `useCategories()` hook

**FavoritesContext** (`contexts/FavoritesContext.tsx`):
- Manages user's favorited quotes
- Persists to AsyncStorage (key: 'favoriteQuotes')
- Shares favorites with iOS widget via ExtensionStorage
- Favorites identified by text + category combination
- Access via `useFavorites()` hook

**CustomQuotesContext** (`contexts/CustomQuotesContext.tsx`):
- Manages user-created custom quotes
- Persists to AsyncStorage (key: 'customQuotes')
- Shares custom quotes with iOS widget via ExtensionStorage
- Each quote has unique ID, text, creation timestamp, and favorite status
- Access via `useCustomQuotes()` hook

### Third-Party Integrations

**PostHog Analytics** (analytics and session replay):
- Configured in `app/_layout.tsx` with PostHogProvider
- API key and host configured directly in code (EU instance)
- Session replay enabled via `enableSessionReplay: true`
- Autocapture enabled for automatic event tracking
- **Important rules** (from `.cursor/rules/posthog-integration.mdc`):
  - Feature flags: Use sparingly and in as few places as possible; store flag names in TypeScript enums or const objects with UPPERCASE_WITH_UNDERSCORE naming
  - Custom properties: Use enums/const objects when referenced in multiple files or callsites
  - Never hallucinate API keys; always use keys from `.env` file
  - Consult with developer before creating new event/property names to maintain naming consistency

**Sentry Error Tracking**:
- Initialized in `app/_layout.tsx` with DSN for error monitoring
- Root layout wrapped with `Sentry.wrap()` for error capture
- `sendDefaultPii: true` adds additional context (IP, cookies, user data)
- DSN points to DE region Sentry instance

### Backend Services

**Supabase Integration** (`services/supabaseService.ts`):
- Client initialization requires `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` environment variables
- Singleton pattern for client instance via `getSupabaseClient()`
- Tables:
  - `onboarding_responses`: Stores onboarding data (upsert by `revenuecat_user_id`)
  - `feedback`: Stores user feedback submissions
- All submissions are non-blocking and fail silently to avoid blocking user flow
- Uses snake_case for database columns (converted from camelCase in contexts)

**Notifications System**:
Two notification implementations exist (architectural note):
1. **NotificationContext** (contexts/NotificationContext.tsx) - Context-based, integrated with app state (primary)
2. **NotificationService** (services/notificationService.ts) - Standalone service class (legacy/unused)

Both schedule daily notifications distributed with randomization. The Context is currently the primary implementation used throughout the app.

### Design System
- **constants/Colors.tsx**: Complete color palette including primary (#FF7B54), secondary (#2C3E5B), neutral grays, status colors, and semantic tokens
- **constants/Typography.tsx**: Typography scale with predefined TextStyle objects for headings, body text, buttons, and status text

Path alias `@/*` maps to root directory (configured in tsconfig.json).

## Important Patterns

### Navigation
Use Expo Router's Link component or router hooks for navigation:
```tsx
import { Link, useRouter } from 'expo-router';

// Using Link
<Link href="/categories-modal" asChild>
  <TouchableOpacity>...</TouchableOpacity>
</Link>

// Using router
const router = useRouter();
router.push('/onboarding/welcome');
router.replace('/onboarding/welcome'); // For redirects
```

### Styling
- Use predefined Colors and Typography constants for consistency
- StyleSheet.create() for component-specific styles
- Expo Router provides automatic dark mode support (`userInterfaceStyle: "automatic"`)
- Haptics feedback via `expo-haptics` on button interactions

### Onboarding Flow
- Check `useOnboarding().isOnboardingComplete` to determine if user should be redirected
- Update onboarding data progressively with `updateOnboardingData(partialData)`
- Call `completeOnboarding()` at the end of the flow to mark completion and submit to Supabase
- OnboardingContext automatically persists data to AsyncStorage on every update

### Notifications
- Always check permissions via `useNotifications().requestPermissions()` before scheduling
- Notifications are canceled and rescheduled when settings change (via useEffect in context)
- AsyncStorage persists settings across app sessions

### Premium/Monetization
- Check `usePremium().isPremium` to determine if user has active subscription
- Display paywall with `await usePremium().showPaywall()`
- RevenueCat user ID is used as the primary identifier across Supabase tables
- Trial tracking occurs during onboarding flow (premium screen)

## Technical Configuration

- **TypeScript**: Strict mode enabled
- **New Architecture**: Expo's new architecture enabled (`newArchEnabled: true`)
- **React Compiler**: Experimental React compiler enabled (`experiments.reactCompiler: true`)
- **Typed Routes**: Expo Router typed routes enabled for type-safe navigation
- **Edge-to-edge**: Android edge-to-edge enabled
- **iOS Widget**: iOS widget extension configured via `@bacons/apple-targets` plugin
  - Widget bundle ID: `com.arthurbuildsstuff.glow.widget`
  - Shared app group: `group.com.arthurbuildsstuff.glow.widget`
  - Build with: `npm run build-widget`

## Environment Variables

Required environment variables (create a `.env` file):

```bash
# RevenueCat (for premium subscriptions)
EXPO_PUBLIC_RC_API_KEY_IOS=your_revenuecat_ios_key

# Supabase (for data storage)
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```
