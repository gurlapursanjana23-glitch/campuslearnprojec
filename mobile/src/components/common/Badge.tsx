import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { borderRadius, spacing } from '../../theme/theme';

export type BadgeVariant = 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'purple';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  style?: ViewStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'primary',
  size = 'md',
  style,
}) => {
  const getBadgeColors = () => {
    switch (variant) {
      case 'primary':
        return { bg: 'rgba(99, 102, 241, 0.18)', text: '#818CF8', border: 'rgba(99, 102, 241, 0.35)' };
      case 'success':
        return { bg: 'rgba(16, 185, 129, 0.18)', text: '#34D399', border: 'rgba(16, 185, 129, 0.35)' };
      case 'warning':
        return { bg: 'rgba(245, 158, 11, 0.18)', text: '#FBBF24', border: 'rgba(245, 158, 11, 0.35)' };
      case 'danger':
        return { bg: 'rgba(239, 68, 68, 0.18)', text: '#F87171', border: 'rgba(239, 68, 68, 0.35)' };
      case 'info':
        return { bg: 'rgba(14, 165, 233, 0.18)', text: '#38BDF8', border: 'rgba(14, 165, 233, 0.35)' };
      case 'purple':
        return { bg: 'rgba(139, 92, 246, 0.18)', text: '#C084FC', border: 'rgba(139, 92, 246, 0.35)' };
    }
  };

  const colors = getBadgeColors();
  const isSmall = size === 'sm';

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.bg,
          borderColor: colors.border,
          paddingVertical: isSmall ? 2 : 4,
          paddingHorizontal: isSmall ? 6 : 10,
        },
        style,
      ]}
    >
      <Text style={[styles.text, { color: colors.text, fontSize: isSmall ? 10 : 12 }]}>
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.full,
    borderWidth: 1,
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
