import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useAuthStore } from '../../store/authStore';
import { darkTheme, lightTheme, borderRadius } from '../../theme/theme';

interface ProgressBarProps {
  progress: number; // 0 to 100
  color?: string;
  height?: number;
  style?: ViewStyle;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  color,
  height = 8,
  style,
}) => {
  const { themeMode } = useAuthStore();
  const theme = themeMode === 'dark' ? darkTheme : lightTheme;

  const clampedProgress = Math.min(100, Math.max(0, progress));
  const fillColor = color || (clampedProgress >= 75 ? theme.primary : clampedProgress >= 65 ? theme.warning : theme.danger);

  return (
    <View
      style={[
        styles.track,
        { backgroundColor: theme.surface, height, borderRadius: borderRadius.full },
        style,
      ]}
    >
      <View
        style={[
          styles.fill,
          {
            backgroundColor: fillColor,
            width: `${clampedProgress}%`,
            borderRadius: borderRadius.full,
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  track: {
    width: '100%',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
  },
});
