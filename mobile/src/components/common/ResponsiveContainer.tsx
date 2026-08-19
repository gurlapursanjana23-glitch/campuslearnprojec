import React from 'react';
import { View, StyleSheet, ViewStyle, useWindowDimensions } from 'react-native';
import { useAuthStore } from '../../store/authStore';
import { darkTheme, lightTheme, spacing } from '../../theme/theme';

interface ResponsiveContainerProps {
  children: React.ReactNode;
  maxWidth?: number;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
}

export const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  maxWidth = 1200,
  style,
  contentStyle,
}) => {
  const { width } = useWindowDimensions();
  const { themeMode } = useAuthStore();
  const theme = themeMode === 'dark' ? darkTheme : lightTheme;
  const isLargeScreen = width >= 768;

  return (
    <View
      style={[
        styles.outer,
        { backgroundColor: theme.background },
        style,
      ]}
    >
      <View
        style={[
          styles.inner,
          {
            maxWidth: isLargeScreen ? maxWidth : '100%',
            paddingHorizontal: isLargeScreen ? spacing.lg : spacing.md,
          },
          contentStyle,
        ]}
      >
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outer: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
  },
  inner: {
    width: '100%',
    flex: 1,
  },
});
