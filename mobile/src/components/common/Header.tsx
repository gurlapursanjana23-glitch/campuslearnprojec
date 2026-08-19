import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore, DEMO_USERS } from '../../store/authStore';
import { darkTheme, lightTheme, spacing, borderRadius } from '../../theme/theme';
import { Role } from '../../types';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  showBack,
  onBack,
  rightAction,
}) => {
  const { user, themeMode, toggleTheme, loginAsRole, unreadNotifications, markNotificationsAsRead } = useAuthStore();
  const theme = themeMode === 'dark' ? darkTheme : lightTheme;
  const [roleModalVisible, setRoleModalVisible] = useState(false);

  const getRoleBadgeColor = (role?: Role) => {
    switch (role) {
      case 'student': return '#38BDF8';
      case 'faculty': return '#818CF8';
      case 'hod': return '#F59E0B';
      case 'admin': return '#EF4444';
      default: return '#64748B';
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background, borderBottomColor: theme.border }]}>
      <View style={styles.leftSection}>
        {showBack && (
          <TouchableOpacity
            style={[styles.iconButton, { backgroundColor: theme.surface, borderColor: theme.border }]}
            onPress={onBack}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={20} color={theme.textPrimary} />
          </TouchableOpacity>
        )}
        <View>
          <Text style={[styles.title, { color: theme.textPrimary }]}>
            {title || 'CampusLearn'}
          </Text>
          {subtitle ? (
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>{subtitle}</Text>
          ) : (
            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
              {user ? `Hello, ${user.name.split(' ')[0]} 👋` : 'Empowering Education'}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.rightSection}>
        {rightAction}

        {/* Quick Role Switcher Button */}
        {user && (
          <TouchableOpacity
            style={[
              styles.roleTag,
              { backgroundColor: theme.surface, borderColor: getRoleBadgeColor(user.role) },
            ]}
            onPress={() => setRoleModalVisible(true)}
            activeOpacity={0.8}
          >
            <View style={[styles.roleDot, { backgroundColor: getRoleBadgeColor(user.role) }]} />
            <Text style={[styles.roleText, { color: theme.textPrimary }]}>
              {user.role.toUpperCase()}
            </Text>
            <Ionicons name="chevron-down" size={14} color={theme.textSecondary} style={{ marginLeft: 4 }} />
          </TouchableOpacity>
        )}

        {/* Theme Toggle Button */}
        <TouchableOpacity
          style={[styles.iconButton, { backgroundColor: theme.surface, borderColor: theme.border }]}
          onPress={toggleTheme}
          activeOpacity={0.7}
        >
          <Ionicons
            name={themeMode === 'dark' ? 'sunny' : 'moon'}
            size={18}
            color={themeMode === 'dark' ? '#FBBF24' : '#6366F1'}
          />
        </TouchableOpacity>

        {/* Notifications Icon */}
        <TouchableOpacity
          style={[styles.iconButton, { backgroundColor: theme.surface, borderColor: theme.border }]}
          onPress={markNotificationsAsRead}
          activeOpacity={0.7}
        >
          <Ionicons name="notifications-outline" size={18} color={theme.textPrimary} />
          {unreadNotifications > 0 && (
            <View style={styles.badgeCount}>
              <Text style={styles.badgeText}>{unreadNotifications}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Role Switcher Dialog */}
      <Modal
        visible={roleModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setRoleModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setRoleModalVisible(false)}
        >
          <View style={[styles.modalCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
            <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>Switch Demo Role</Text>
            <Text style={[styles.modalDesc, { color: theme.textSecondary }]}>
              Instantly preview the app as different college stakeholders:
            </Text>

            {(['student', 'faculty', 'hod', 'admin'] as Role[]).map((r) => (
              <TouchableOpacity
                key={r}
                style={[
                  styles.roleOption,
                  {
                    backgroundColor: user?.role === r ? theme.primaryLight : theme.surface,
                    borderColor: user?.role === r ? theme.primary : theme.border,
                  },
                ]}
                onPress={() => {
                  loginAsRole(r);
                  setRoleModalVisible(false);
                }}
              >
                <View style={[styles.roleOptionDot, { backgroundColor: getRoleBadgeColor(r) }]} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.roleOptionName, { color: theme.textPrimary }]}>
                    {DEMO_USERS[r].name}
                  </Text>
                  <Text style={[styles.roleOptionRole, { color: theme.textSecondary }]}>
                    {r.toUpperCase()} • {DEMO_USERS[r].department || 'Institute Admin'}
                  </Text>
                </View>
                {user?.role === r && (
                  <Ionicons name="checkmark-circle" size={20} color={theme.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    zIndex: 10,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  badgeCount: {
    position: 'absolute',
    top: -3,
    right: -3,
    backgroundColor: '#EF4444',
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
  },
  roleTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },
  roleDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    ...Platform.select({
      web: { boxShadow: '0 20px 40px rgba(0,0,0,0.4)' },
      default: { elevation: 10 },
    }),
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  modalDesc: {
    fontSize: 13,
    marginBottom: spacing.md,
  },
  roleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  roleOptionDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  roleOptionName: {
    fontSize: 14,
    fontWeight: '600',
  },
  roleOptionRole: {
    fontSize: 12,
    marginTop: 2,
  },
});
