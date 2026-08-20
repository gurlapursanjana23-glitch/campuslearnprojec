import React from 'react';
import { View, Text, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { useAuthStore } from '../../store/authStore';
import { darkTheme, lightTheme, borderRadius, spacing } from '../../theme/theme';
import { Card } from './Card';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  iconBgColor?: string;
  trend?: string;
  trendPositive?: boolean;
  style?: StyleProp<ViewStyle>;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  iconBgColor = 'rgba(99, 102, 241, 0.15)',
  trend,
  trendPositive = true,
  style,
}) => {
  const { themeMode } = useAuthStore();
  const theme = themeMode === 'dark' ? darkTheme : lightTheme;

  return (
    <Card style={[{ flex: 1, minWidth: 150 }, style]}>
      <View style={styles.topRow}>
        <View style={[styles.iconWrapper, { backgroundColor: iconBgColor }]}>
          {icon}
        </View>
        {trend && (
          <View
            style={[
              styles.trendBadge,
              {
                backgroundColor: trendPositive ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
              },
            ]}
          >
            <Text
              style={[
                styles.trendText,
                { color: trendPositive ? '#10B981' : '#EF4444' },
              ]}
            >
              {trend}
            </Text>
          </View>
        )}
      </View>

      <Text style={[styles.value, { color: theme.textPrimary }]}>{value}</Text>
      <Text style={[styles.title, { color: theme.textSecondary }]}>{title}</Text>
      {subtitle && (
        <Text style={[styles.subtitle, { color: theme.textMuted }]}>{subtitle}</Text>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  iconWrapper: {
    width: 42,
    height: 42,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trendBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  trendText: {
    fontSize: 11,
    fontWeight: '700',
  },
  value: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  title: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 2,
  },
  subtitle: {
    fontSize: 11,
    marginTop: 4,
  },
});
