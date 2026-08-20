import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { darkTheme, lightTheme, spacing, borderRadius } from '../../theme/theme';
import { Button } from './Button';
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
  const {
    user,
    themeMode,
    toggleTheme,
    logout,
    unreadNotifications,
    markNotificationsAsRead,
    serverUrl,
    updateServerUrl,
  } = useAuthStore();
  const theme = themeMode === 'dark' ? darkTheme : lightTheme;

  const [serverModalVisible, setServerModalVisible] = useState(false);
  const [inputUrl, setInputUrl] = useState(serverUrl);

  const getRoleBadgeColor = (role?: Role) => {
    switch (role) {
      case 'student': return '#F97316';
      case 'faculty': return '#10B981';
      case 'hod': return '#F59E0B';
      case 'admin': return '#EF4444';
      default: return '#64748B';
    }
  };

  const handleSaveServerUrl = async () => {
    if (!inputUrl.trim()) return;
    await updateServerUrl(inputUrl);
    setServerModalVisible(false);
    Alert.alert('Server URL Updated! 🔗', `Mobile app will now communicate directly with database at: ${inputUrl}`);
  };

  const handleConfirmLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out of your account?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: () => logout(),
      },
    ]);
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
              {user ? `Hello, ${user.name.split(' ')[0]} 👋` : 'Institutional Academic Portal'}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.rightSection}>
        {rightAction}

        {/* Database Connection Indicator */}
        <TouchableOpacity
          style={[styles.dbStatusPill, { backgroundColor: theme.surface, borderColor: theme.border }]}
          onPress={() => {
            setInputUrl(serverUrl);
            setServerModalVisible(true);
          }}
          activeOpacity={0.7}
        >
          <View style={styles.dbStatusDot} />
          <Text style={[styles.dbStatusText, { color: theme.textSecondary }]}>DB Sync</Text>
        </TouchableOpacity>

        {/* User Role Tag (Read-Only) */}
        {user && (
          <View
            style={[
              styles.roleTag,
              { backgroundColor: theme.surface, borderColor: getRoleBadgeColor(user.role) },
            ]}
          >
            <View style={[styles.roleDot, { backgroundColor: getRoleBadgeColor(user.role) }]} />
            <Text style={[styles.roleText, { color: theme.textPrimary }]}>
              {user.role.toUpperCase()}
            </Text>
          </View>
        )}

        {/* Theme Toggle */}
        <TouchableOpacity
          style={[styles.iconButton, { backgroundColor: theme.surface, borderColor: theme.border }]}
          onPress={toggleTheme}
          activeOpacity={0.7}
        >
          <Ionicons
            name={themeMode === 'dark' ? 'sunny' : 'moon'}
            size={18}
            color={themeMode === 'dark' ? '#FBBF24' : '#F97316'}
          />
        </TouchableOpacity>

        {/* Notifications */}
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

        {/* Logout Button */}
        {user && (
          <TouchableOpacity
            style={[styles.iconButton, { backgroundColor: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.3)' }]}
            onPress={handleConfirmLogout}
            activeOpacity={0.7}
          >
            <Ionicons name="log-out-outline" size={18} color="#EF4444" />
          </TouchableOpacity>
        )}
      </View>

      {/* Server & Database Connection Modal */}
      <Modal
        visible={serverModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setServerModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setServerModalVisible(false)}
        >
          <View style={[styles.modalCard, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <Ionicons name="server" size={20} color="#10B981" />
              <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>Database Connection</Text>
            </View>
            <Text style={[styles.modalDesc, { color: theme.textSecondary }]}>
              Configured Express & MongoDB API endpoint for live synchronization across Web and Mobile:
            </Text>

            <View style={{ marginBottom: spacing.md }}>
              <Text style={[styles.inputLabel, { color: theme.textPrimary }]}>Backend Server URL</Text>
              <TextInput
                style={[styles.serverInput, { backgroundColor: theme.inputBg, borderColor: theme.border, color: theme.textPrimary }]}
                value={inputUrl}
                onChangeText={setInputUrl}
                placeholder="http://10.185.107.20:5001/api"
                placeholderTextColor={theme.textMuted}
                autoCapitalize="none"
              />
            </View>

            <View style={styles.quickUrlsRow}>
              <TouchableOpacity
                style={[styles.quickUrlPill, { backgroundColor: theme.surface, borderColor: theme.border }]}
                onPress={() => setInputUrl('http://localhost:5001/api')}
              >
                <Text style={[styles.quickUrlText, { color: theme.textSecondary }]}>Localhost (Web)</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.quickUrlPill, { backgroundColor: theme.surface, borderColor: theme.border }]}
                onPress={() => setInputUrl('http://10.185.107.20:5001/api')}
              >
                <Text style={[styles.quickUrlText, { color: theme.textSecondary }]}>LAN IP (Phone)</Text>
              </TouchableOpacity>
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: spacing.sm, marginTop: spacing.md }}>
              <Button
                title="Cancel"
                variant="secondary"
                size="small"
                onPress={() => setServerModalVisible(false)}
              />
              <Button
                title="Save & Connect"
                variant="primary"
                size="small"
                onPress={handleSaveServerUrl}
              />
            </View>
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
  dbStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    gap: 5,
  },
  dbStatusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  dbStatusText: {
    fontSize: 11,
    fontWeight: '600',
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
    maxWidth: 440,
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
    lineHeight: 18,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  serverInput: {
    borderWidth: 1,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    height: 42,
    fontSize: 13,
  },
  quickUrlsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: spacing.xs,
  },
  quickUrlPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
  },
  quickUrlText: {
    fontSize: 11,
    fontWeight: '500',
  },
});
