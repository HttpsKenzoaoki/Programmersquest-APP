import { Platform } from 'react-native';

export const colors = {
  bg: '#0B0618',
  surface: '#1E1440',
  surfaceAlt: '#251A4E',
  border: '#3A2B72',

  primary: '#7C3AED',
  primaryLight: '#A78BFA',
  violet: '#8B5CF6',

  blue: '#3B82F6',
  cyan: '#38BDF8',
  indigo: '#6366F1',

  glowPurple: '#C084FC',
  glowBlue: '#60A5FA',

  gold: '#FACC15',
  goldDark: '#B45309',

  text: '#F4F1FF',
  textMuted: '#A99BD1',
  textFaint: '#6E6196',

  success: '#34D399',
  danger: '#F87171',
  warning: '#FBBF24',

  white: '#FFFFFF',
  black: '#000000',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const radii = {
  sm: 8,
  md: 14,
  lg: 20,
  xl: 28,
  pill: 999,
};

export const typography = {
  display: 34,
  title: 24,
  heading: 20,
  subheading: 16,
  body: 15,
  caption: 13,
  small: 11,
};

export const fonts = {
  bold: '700',
  semibold: '600',
  medium: '500',
  regular: '400',
};

export const shadow = {
  glowPurple: {
    shadowColor: colors.glowPurple,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 8,
  },
  glowBlue: {
    shadowColor: colors.glowBlue,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  card: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 6,
  },
};

export const gradients = {
  bg: ['#0B0618', '#140B2E', '#1A0F3A'],
  primaryButton: ['#7C3AED', '#3B82F6'],
  header: ['#140B2E', '#1A0F3A'],
  card: ['#241A4A', '#1B1240'],
  gold: ['#FACC15', '#F59E0B'],
};

export function isIos() {
  return Platform.OS === 'ios';
}
