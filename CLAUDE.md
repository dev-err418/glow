# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Glow is a React Native mobile app built with Expo that provides mindful daily reminders through scheduled notifications. The app uses file-based routing via `expo-router` and targets iOS, Android, and web platforms.

## Key Commands

```bash
# Start development server
npx expo start

# Platform-specific builds
npm run android    # Start on Android emulator
npm run ios       # Start on iOS simulator
npm run web       # Start web version

# Code quality
npm run lint      # Run ESLint

# Dependencies
npm install       # Install dependencies
```

## Architecture

### Routing (File-based with expo-router)
- **app/_layout.tsx**: Root layout with Stack navigator and NotificationProvider wrapper
- **app/index.tsx**: Landing page with navigation to onboarding and settings
- **app/onboarding/**: Onboarding flow screens (welcome screen, etc.)
- **app/settings.tsx**: Settings modal for notification configuration

Routes use Expo Router's file-based system where file structure defines navigation hierarchy.

### State Management
**NotificationContext** (`contexts/NotificationContext.tsx`):
- Manages global notification state using React Context
- Persists settings to AsyncStorage (notifications enabled, count per day)
- Handles permission requests and notification scheduling
- Wraps entire app in `app/_layout.tsx`
- Access via `useNotifications()` hook

### Notifications System
Two notification implementations exist (architectural note):
1. **NotificationContext** (contexts/NotificationContext.tsx) - Context-based, integrated with app state
2. **NotificationService** (services/notificationService.ts) - Standalone service class

Both schedule daily notifications distributed between 6 AM - 10 PM with randomization. The Context is currently the primary implementation used throughout the app.

### Design System
- **constants/Colors.tsx**: Complete color palette including primary (#FF7B54), secondary (#2C3E5B), neutral grays, status colors, and semantic tokens
- **constants/Typography.tsx**: Typography scale with predefined TextStyle objects for headings, body text, buttons, and status text

Path alias `@/*` maps to root directory (configured in tsconfig.json).

## Important Patterns

### Navigation
Use Expo Router's Link component for navigation:
```tsx
import { Link } from 'expo-router';
<Link href="/settings" asChild>
  <TouchableOpacity>...</TouchableOpacity>
</Link>
```

### Styling
- Use predefined Colors and Typography constants for consistency
- StyleSheet.create() for component-specific styles
- Expo Router provides automatic dark mode support (`userInterfaceStyle: "automatic"`)

### Notifications
- Always check permissions via `useNotifications().requestPermissions()` before scheduling
- Notifications are canceled and rescheduled when settings change (via useEffect in context)
- AsyncStorage persists settings across app sessions

## Technical Configuration

- **TypeScript**: Strict mode enabled
- **New Architecture**: Expo's new architecture enabled (`newArchEnabled: true`)
- **React Compiler**: Experimental React compiler enabled
- **Typed Routes**: Expo Router typed routes enabled for type-safe navigation
- **Edge-to-edge**: Android edge-to-edge enabled
