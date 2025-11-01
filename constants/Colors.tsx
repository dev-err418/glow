import { useTheme } from '../contexts/ThemeContext';

export const useColors = () => {
  const { effectiveColorScheme } = useTheme();
  const isDark = effectiveColorScheme === 'dark';

  return {
    // Primary Colors
    primary: isDark ? '#2C3E5B' : '#f54e08',

    // Secondary Colors
    secondary: isDark ? '#f54e08' : '#2C3E5B',

    // Neutral Colors
    neutral: {
      white: isDark ? '#1a1a1a' : '#FFFFFF',
      gray50: isDark ? '#2a2a2a' : '#F8F9FA',
      gray100: isDark ? '#353535' : '#E9ECEF',
      gray200: isDark ? '#404040' : '#DEE2E6',
      gray300: isDark ? '#4a4a4a' : '#CED4DA',
      gray400: isDark ? '#6a6a6a' : '#ADB5BD',
      gray500: isDark ? '#8a8a8a' : '#6C757D',
      gray600: isDark ? '#a0a0a0' : '#495057',
      gray700: isDark ? '#b8b8b8' : '#343A40',
      gray800: isDark ? '#d0d0d0' : '#212529',
      black: isDark ? '#FFFFFF' : '#000000',
    },

    // Text Colors
    text: {
      primary: isDark ? '#e8e8e8' : '#2C3E5B',
      secondary: isDark ? '#b8b8b8' : '#495057',
      muted: isDark ? '#8a8a8a' : '#6C757D',
      light: isDark ? '#6a6a6a' : '#ADB5BD',
      white: '#FFFFFF', // Always white for text on colored backgrounds
    },

    // Background Colors
    background: {
      default: isDark ? '#1a1a1a' : '#FFF8F3',
      primary: isDark ? '#2a2a2a' : '#FFFFFF',
      secondary: isDark ? '#222222' : '#F8F9FA',
      tertiary: isDark ? '#303030' : '#E9ECEF',
    },

    // Status Colors
    status: {
      success: isDark ? '#34C759' : '#28A745',
      successLight: isDark ? '#1a3a24' : '#D4EDDA',
      warning: isDark ? '#FFD60A' : '#FFC107',
      warningLight: isDark ? '#3a3520' : '#FFF3CD',
      error: isDark ? '#FF453A' : '#DC3545',
      errorLight: isDark ? '#3a2020' : '#F8D7DA',
      info: isDark ? '#5AC8FA' : '#17A2B8',
      infoLight: isDark ? '#1a3540' : '#D1ECF1',
    },

    // Border Colors
    border: {
      light: isDark ? '#353535' : '#DEE2E6',
      medium: isDark ? '#4a4a4a' : '#CED4DA',
      dark: isDark ? '#6a6a6a' : '#ADB5BD',
    },

    // Shadow Colors
    shadow: {
      light: isDark ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.1)',
      medium: isDark ? 'rgba(0, 0, 0, 0.4)' : 'rgba(0, 0, 0, 0.15)',
      dark: isDark ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.25)',
    },
  };
};