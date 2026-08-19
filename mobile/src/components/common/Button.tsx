import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  Platform,
} from 'react-native';
import { useAuthStore } from '../../store/authStore';
import { darkTheme, lightTheme, borderRadius, spacing } from '../../theme/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'success';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  icon,
  style,
  textStyle,
}) => {
  const { themeMode } = useAuthStore();
  const theme = themeMode === 'dark' ? darkTheme : lightTheme;

  const getVariantStyles = (): { button: ViewStyle; text: TextStyle } => {
    switch (variant) {
      case 'primary':
        return {
          button: {
            backgroundColor: theme.primary,
            borderWidth: 0,
          },
          text: { color: '#FFFFFF' },
        };
      case 'secondary':
        return {
          button: {
            backgroundColor: theme.surface,
            borderWidth: 1,
            borderColor: theme.border,
          },
          text: { color: theme.textPrimary },
        };
      case 'outline':
        return {
          button: {
            backgroundColor: 'transparent',
            borderWidth: 1.5,
            borderColor: theme.primary,
          },
          text: { color: theme.primary },
        };
      case 'success':
        return {
          button: {
            backgroundColor: theme.success,
            borderWidth: 0,
          },
          text: { color: '#FFFFFF' },
        };
      case 'danger':
        return {
          button: {
            backgroundColor: theme.danger,
            borderWidth: 0,
          },
          text: { color: '#FFFFFF' },
        };
      case 'ghost':
        return {
          button: {
            backgroundColor: 'transparent',
            borderWidth: 0,
          },
          text: { color: theme.primary },
        };
    }
  };

  const getSizeStyles = (): { button: ViewStyle; text: TextStyle } => {
    switch (size) {
      case 'small':
        return {
          button: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: borderRadius.sm },
          text: { fontSize: 12, fontWeight: '600' },
        };
      case 'medium':
        return {
          button: { paddingVertical: 10, paddingHorizontal: 18, borderRadius: borderRadius.md },
          text: { fontSize: 14, fontWeight: '600' },
        };
      case 'large':
        return {
          button: { paddingVertical: 14, paddingHorizontal: 24, borderRadius: borderRadius.lg },
          text: { fontSize: 16, fontWeight: '700' },
        };
    }
  };

  const variantStyle = getVariantStyles();
  const sizeStyle = getSizeStyles();

  return (
    <TouchableOpacity
      style={[
        styles.base,
        variantStyle.button,
        sizeStyle.button,
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' || variant === 'ghost' ? theme.primary : '#FFFFFF'}
        />
      ) : (
        <>
          {icon}
          <Text style={[variantStyle.text, sizeStyle.text, icon ? { marginLeft: 8 } : null, textStyle]}>
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: { cursor: 'pointer', userSelect: 'none' },
    }),
  },
  disabled: {
    opacity: 0.5,
  },
});
