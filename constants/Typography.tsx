import { TextStyle } from 'react-native';
import { Colors } from './Colors';

// Uncut Sans - Embedded fonts using expo-font config plugin
// Access via fontFamily + fontWeight combination
const FONT_FAMILY = 'UncutSans';

export const Typography: Record<string, TextStyle> = {
  // Headings
  h1: {
    fontSize: 32,
    fontFamily: FONT_FAMILY,
    fontWeight: '700',
    color: Colors.text.primary,
    lineHeight: 40,
  },
  h2: {
    fontSize: 28,
    fontFamily: FONT_FAMILY,
    fontWeight: '700',
    color: Colors.text.primary,
    lineHeight: 36,
  },
  h3: {
    fontSize: 24,
    fontFamily: FONT_FAMILY,
    fontWeight: '600',
    color: Colors.text.primary,
    lineHeight: 32,
  },
  h4: {
    fontSize: 20,
    fontFamily: FONT_FAMILY,
    fontWeight: '600',
    color: Colors.text.primary,
    lineHeight: 28,
  },
  h5: {
    fontSize: 18,
    fontFamily: FONT_FAMILY,
    fontWeight: '600',
    color: Colors.text.primary,
    lineHeight: 24,
  },
  h6: {
    fontSize: 16,
    fontFamily: FONT_FAMILY,
    fontWeight: '600',
    color: Colors.text.primary,
    lineHeight: 22,
  },

  // Body Text
  body: {
    fontSize: 16,
    fontFamily: FONT_FAMILY,
    fontWeight: '400',
    color: Colors.text.primary,
    lineHeight: 24,
  },
  bodySmall: {
    fontSize: 14,
    fontFamily: FONT_FAMILY,
    fontWeight: '400',
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  bodyLarge: {
    fontSize: 18,
    fontFamily: FONT_FAMILY,
    fontWeight: '400',
    color: Colors.text.primary,
    lineHeight: 26,
  },

  // Variants
  title: {
    fontSize: 34,
    fontFamily: FONT_FAMILY,
    fontWeight: '700',
    color: Colors.text.primary,
    lineHeight: 40,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    fontFamily: FONT_FAMILY,
    fontWeight: '400',
    color: Colors.text.secondary,
    lineHeight: 24,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    fontFamily: FONT_FAMILY,
    fontWeight: '400',
    color: Colors.text.secondary,
    lineHeight: 24,
  },
  caption: {
    fontSize: 14,
    fontFamily: FONT_FAMILY,
    fontWeight: '400',
    color: Colors.text.muted,
    lineHeight: 20,
  },
  label: {
    fontSize: 16,
    fontFamily: FONT_FAMILY,
    fontWeight: '500',
    color: Colors.text.primary,
  },

  // Button Text
  buttonText: {
    fontSize: 16,
    fontFamily: FONT_FAMILY,
    fontWeight: '600',
    color: Colors.text.white,
  },
  buttonTextLarge: {
    fontSize: 18,
    fontFamily: FONT_FAMILY,
    fontWeight: '600',
    color: Colors.text.white,
  },
  buttonTextSecondary: {
    fontSize: 16,
    fontFamily: FONT_FAMILY,
    fontWeight: '600',
    color: Colors.primary,
  },

  // Navigation
  navTitle: {
    fontSize: 18,
    fontFamily: FONT_FAMILY,
    fontWeight: '700',
    color: Colors.text.white,
  },

  // Status Text
  successText: {
    fontSize: 14,
    fontFamily: FONT_FAMILY,
    fontWeight: '500',
    color: Colors.status.success,
  },
  errorText: {
    fontSize: 14,
    fontFamily: FONT_FAMILY,
    fontWeight: '500',
    color: Colors.status.error,
  },
  warningText: {
    fontSize: 14,
    fontFamily: FONT_FAMILY,
    fontWeight: '500',
    color: Colors.status.warning,
  },
  infoText: {
    fontSize: 14,
    fontFamily: FONT_FAMILY,
    fontWeight: '500',
    color: Colors.status.info,
  },
};