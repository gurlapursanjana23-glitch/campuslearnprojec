export interface ColorPalette {
  background: string;
  card: string;
  cardBorder: string;
  surface: string;
  surfaceHover: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  primary: string;
  primaryDark: string;
  primaryLight: string;
  primaryGlow: string;
  secondary: string;
  accent: string;
  success: string;
  successLight: string;
  warning: string;
  warningLight: string;
  danger: string;
  dangerLight: string;
  info: string;
  overlay: string;
  inputBg: string;
  tabBar: string;
  tabBarBorder: string;
}

// Exact Web App Dark Mode Theme (Zinc-950 / Zinc-900 / Orange-500)
export const darkTheme: ColorPalette = {
  background: '#09090B', // zinc-950
  card: '#121215',
  cardBorder: '#27272A', // zinc-800
  surface: '#18181B', // zinc-900
  surfaceHover: '#27272A',
  textPrimary: '#FAFAFA', // neutral-50
  textSecondary: '#A1A1AA', // zinc-400
  textMuted: '#71717A', // zinc-500
  border: '#27272A', // zinc-800
  primary: '#F97316', // orange-500
  primaryDark: '#EA580C', // orange-600
  primaryLight: 'rgba(249, 115, 22, 0.15)',
  primaryGlow: 'rgba(249, 115, 22, 0.35)',
  secondary: '#E4E4E7', // zinc-200
  accent: '#F97316',
  success: '#10B981', // emerald-500
  successLight: 'rgba(16, 185, 129, 0.15)',
  warning: '#F59E0B', // amber-500
  warningLight: 'rgba(245, 158, 11, 0.15)',
  danger: '#EF4444', // red-500
  dangerLight: 'rgba(239, 68, 68, 0.15)',
  info: '#38BDF8', // sky-400
  overlay: 'rgba(9, 9, 11, 0.8)',
  inputBg: '#18181B',
  tabBar: '#09090B',
  tabBarBorder: '#27272A',
};

// Exact Web App Light Mode Theme
export const lightTheme: ColorPalette = {
  background: '#FFFFFF',
  card: '#FFFFFF',
  cardBorder: '#E4E4E7', // zinc-200
  surface: '#FAFAFA', // neutral-50
  surfaceHover: '#F4F4F5', // zinc-100
  textPrimary: '#09090B', // zinc-950
  textSecondary: '#71717A', // zinc-500
  textMuted: '#A1A1AA', // zinc-400
  border: '#E4E4E7', // zinc-200
  primary: '#F97316', // orange-500
  primaryDark: '#EA580C', // orange-600
  primaryLight: 'rgba(249, 115, 22, 0.1)',
  primaryGlow: 'rgba(249, 115, 22, 0.25)',
  secondary: '#27272A', // zinc-800
  accent: '#F97316',
  success: '#10B981',
  successLight: 'rgba(16, 185, 129, 0.1)',
  warning: '#F59E0B',
  warningLight: 'rgba(245, 158, 11, 0.1)',
  danger: '#EF4444',
  dangerLight: 'rgba(239, 68, 68, 0.1)',
  info: '#0284C7',
  overlay: 'rgba(0, 0, 0, 0.6)',
  inputBg: '#FAFAFA',
  tabBar: '#FFFFFF',
  tabBarBorder: '#E4E4E7',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  full: 9999,
};

export const typography = {
  titleLarge: {
    fontSize: 28,
    fontWeight: '800' as const,
    letterSpacing: -0.5,
  },
  titleMedium: {
    fontSize: 20,
    fontWeight: '700' as const,
    letterSpacing: -0.3,
  },
  titleSmall: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
  bodyLarge: {
    fontSize: 15,
    fontWeight: '400' as const,
  },
  bodyMedium: {
    fontSize: 14,
    fontWeight: '400' as const,
  },
  bodySmall: {
    fontSize: 12,
    fontWeight: '400' as const,
  },
  caption: {
    fontSize: 11,
    fontWeight: '600' as const,
    textTransform: 'uppercase' as const,
  },
};
