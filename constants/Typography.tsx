import { TextStyle } from 'react-native';

// Uncut Sans Variable - Embedded font using expo-font config plugin
const FONT_FAMILY = 'UncutSans-Variable';

const FONT_WEIGHTS = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

// Typography without color definitions - colors should be set in components using useColors()
export const Typography: Record<string, TextStyle> = {
  // Headings
  h1: {
    fontSize: 32,
    fontFamily: FONT_FAMILY,
    fontWeight: FONT_WEIGHTS.bold,
    lineHeight: 40,
  },
  h2: {
    fontSize: 28,
    fontFamily: FONT_FAMILY,
    fontWeight: FONT_WEIGHTS.bold,
    lineHeight: 36,
  },
  h3: {
    fontSize: 24,
    fontFamily: FONT_FAMILY,
    fontWeight: FONT_WEIGHTS.semibold,
    lineHeight: 32,
  },
  h4: {
    fontSize: 20,
    fontFamily: FONT_FAMILY,
    fontWeight: FONT_WEIGHTS.semibold,
    lineHeight: 28,
  },
  h5: {
    fontSize: 18,
    fontFamily: FONT_FAMILY,
    fontWeight: FONT_WEIGHTS.semibold,
    lineHeight: 24,
  },
  h6: {
    fontSize: 16,
    fontFamily: FONT_FAMILY,
    fontWeight: FONT_WEIGHTS.semibold,
    lineHeight: 22,
  },

  // Body Text
  body: {
    fontSize: 16,
    fontFamily: FONT_FAMILY,
    fontWeight: FONT_WEIGHTS.regular,
    lineHeight: 24,
  },
  bodySmall: {
    fontSize: 14,
    fontFamily: FONT_FAMILY,
    fontWeight: FONT_WEIGHTS.regular,
    lineHeight: 20,
  },
  bodyLarge: {
    fontSize: 18,
    fontFamily: FONT_FAMILY,
    fontWeight: FONT_WEIGHTS.regular,
    lineHeight: 26,
  },

  // Variants
  title: {
    fontSize: 34,
    fontFamily: FONT_FAMILY,
    fontWeight: FONT_WEIGHTS.bold,
    lineHeight: 40,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    fontFamily: FONT_FAMILY,
    fontWeight: FONT_WEIGHTS.regular,
    lineHeight: 24,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    fontFamily: FONT_FAMILY,
    fontWeight: FONT_WEIGHTS.regular,
    lineHeight: 24,
  },
  caption: {
    fontSize: 14,
    fontFamily: FONT_FAMILY,
    fontWeight: FONT_WEIGHTS.regular,
    lineHeight: 20,
  },
  label: {
    fontSize: 16,
    fontFamily: FONT_FAMILY,
    fontWeight: FONT_WEIGHTS.medium,
  },

  // Button Text
  buttonText: {
    fontSize: 16,
    fontFamily: FONT_FAMILY,
    fontWeight: FONT_WEIGHTS.semibold,
  },
  buttonTextLarge: {
    fontSize: 18,
    fontFamily: FONT_FAMILY,
    fontWeight: FONT_WEIGHTS.semibold,
  },
  buttonTextSecondary: {
    fontSize: 16,
    fontFamily: FONT_FAMILY,
    fontWeight: FONT_WEIGHTS.semibold,
  },

  // Navigation
  navTitle: {
    fontSize: 18,
    fontFamily: FONT_FAMILY,
    fontWeight: FONT_WEIGHTS.bold,
  },

  // Status Text (without colors - override in components)
  successText: {
    fontSize: 14,
    fontFamily: FONT_FAMILY,
    fontWeight: FONT_WEIGHTS.medium,
  },
  errorText: {
    fontSize: 14,
    fontFamily: FONT_FAMILY,
    fontWeight: FONT_WEIGHTS.medium,
  },
  warningText: {
    fontSize: 14,
    fontFamily: FONT_FAMILY,
    fontWeight: FONT_WEIGHTS.medium,
  },
  infoText: {
    fontSize: 14,
    fontFamily: FONT_FAMILY,
    fontWeight: FONT_WEIGHTS.medium,
  },
};