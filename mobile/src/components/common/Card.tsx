import React from 'react';
import { View, StyleSheet, ViewStyle, TouchableOpacity, Platform } from 'react-native';
import { useAuthStore } from '../../store/authStore';
import { darkTheme, lightTheme, borderRadius, spacing } from '../../theme/theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  variant?: 'default' | 'elevated' | 'glass';
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  onPress,
  variant = 'default',
}) => {
  const { themeMode } = useAuthStore();
  const theme = themeMode === 'dark' ? darkTheme : lightTheme;

  const cardStyle: ViewStyle = {
    backgroundColor: theme.card,
    borderColor: theme.cardBorder,
    borderWidth: 1,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...Platform.select({
      web: {
        boxShadow:
          variant === 'elevated'
            ? '0 10px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.2)'
            : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
        backdropFilter: variant === 'glass' ? 'blur(12px)' : 'none',
        transition: 'all 0.2s ease',
      },
      default: {
        elevation: variant === 'elevated' ? 4 : 2,
      },
    }),
  };

  if (onPress) {
    return (
      <TouchableOpacity
        style={[styles.base, cardStyle, style]}
        onPress={onPress}
        activeOpacity={0.85}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={[styles.base, cardStyle, style]}>{children}</View>;
};

const styles = StyleSheet.create({
  base: {
    overflow: 'hidden',
  },
});
