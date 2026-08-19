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

export const darkTheme: ColorPalette = {
  background: '#0B0F19',
  card: '#131B2E',
  cardBorder: 'rgba(255, 255, 255, 0.08)',
  surface: '#1E293B',
  surfaceHover: '#334155',
  textPrimary: '#F8FAFC',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  border: 'rgba(255, 255, 255, 0.1)',
  primary: '#6366F1', // Indigo
  primaryLight: 'rgba(99, 102, 241, 0.15)',
  primaryGlow: 'rgba(99, 102, 241, 0.35)',
  secondary: '#8B5CF6', // Purple
  accent: '#38BDF8', // Cyan
  success: '#10B981', // Emerald
  successLight: 'rgba(16, 185, 129, 0.15)',
  warning: '#F59E0B', // Amber
  warningLight: 'rgba(245, 158, 11, 0.15)',
  danger: '#EF4444', // Rose
  dangerLight: 'rgba(239, 68, 68, 0.15)',
  info: '#0EA5E9', // Sky
  overlay: 'rgba(0, 0, 0, 0.75)',
  inputBg: '#182235',
  tabBar: '#0F1626',
  tabBarBorder: 'rgba(255, 255, 255, 0.06)',
};

export const lightTheme: ColorPalette = {
  background: '#F8FAFC',
  card: '#FFFFFF',
  cardBorder: '#E2E8F0',
  surface: '#F1F5F9',
  surfaceHover: '#E2E8F0',
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  border: '#CBD5E1',
  primary: '#4F46E5', // Deep Indigo
  primaryLight: 'rgba(79, 70, 229, 0.1)',
  primaryGlow: 'rgba(79, 70, 229, 0.25)',
  secondary: '#7C3AED', // Violet
  accent: '#0284C7', // Sky Blue
  success: '#059669', // Emerald
  successLight: 'rgba(5, 150, 105, 0.1)',
  warning: '#D97706', // Amber
  warningLight: 'rgba(217, 119, 6, 0.1)',
  danger: '#DC2626', // Red
  dangerLight: 'rgba(220, 38, 38, 0.1)',
  info: '#0284C7',
  overlay: 'rgba(15, 23, 42, 0.6)',
  inputBg: '#F8FAFC',
  tabBar: '#FFFFFF',
  tabBarBorder: '#E2E8F0',
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
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const typography = {
  titleLarge: {
    fontSize: 28,
    fontWeight: '700' as const,
    letterSpacing: -0.5,
  },
  titleMedium: {
    fontSize: 22,
    fontWeight: '700' as const,
    letterSpacing: -0.3,
  },
  titleSmall: {
    fontSize: 18,
    fontWeight: '600' as const,
  },
  bodyLarge: {
    fontSize: 16,
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
    fontWeight: '500' as const,
    textTransform: 'uppercase' as const,
  },
};
