import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useAuthStore } from '../../store/authStore';
import { darkTheme, lightTheme, borderRadius, spacing } from '../../theme/theme';

interface TabItem {
  key: string;
  label: string;
  count?: number;
}

interface TabSelectorProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (key: string) => void;
}

export const TabSelector: React.FC<TabSelectorProps> = ({
  tabs,
  activeTab,
  onTabChange,
}) => {
  const { themeMode } = useAuthStore();
  const theme = themeMode === 'dark' ? darkTheme : lightTheme;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContainer}
      style={[styles.container, { backgroundColor: theme.surface }]}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        return (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tab,
              isActive && { backgroundColor: theme.card, borderColor: theme.border },
            ]}
            onPress={() => onTabChange(tab.key)}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.tabText,
                { color: isActive ? theme.primary : theme.textSecondary },
                isActive && { fontWeight: '700' },
              ]}
            >
              {tab.label}
            </Text>
            {tab.count !== undefined && (
              <View
                style={[
                  styles.countBadge,
                  {
                    backgroundColor: isActive ? theme.primaryLight : theme.surfaceHover,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.countText,
                    { color: isActive ? theme.primary : theme.textMuted },
                  ]}
                >
                  {tab.count}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.lg,
    padding: 4,
    marginBottom: spacing.md,
    maxHeight: 52,
  },
  scrollContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: 'transparent',
    gap: 6,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '500',
  },
  countBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  countText: {
    fontSize: 11,
    fontWeight: '700',
  },
});
