import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  useWindowDimensions,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { darkTheme, lightTheme, spacing, borderRadius } from '../../theme/theme';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';

interface StudentProfileProps {
  onLogout: () => void;
}

export const StudentProfileScreen: React.FC<StudentProfileProps> = ({ onLogout }) => {
  const { width } = useWindowDimensions();
  const { user, themeMode, toggleTheme, logout } = useAuthStore();
  const theme = themeMode === 'dark' ? darkTheme : lightTheme;
  const isLargeScreen = width >= 768;

  const [pushNotif, setPushNotif] = useState(true);
  const [emailNotif, setEmailNotif] = useState(true);

  const certificates = [
    {
      title: 'Advanced Algorithms & Graph Theory',
      issuer: 'CampusLearn Academic Board',
      issuedDate: 'July 2026',
      credentialId: 'CL-CERT-948271',
    },
    {
      title: 'Database Architecture & Indexing Specialist',
      issuer: 'Dept of Computer Science',
      issuedDate: 'May 2026',
      credentialId: 'CL-CERT-810394',
    },
  ];

  const handleLogoutPress = () => {
    logout();
    onLogout();
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={[styles.content, { paddingHorizontal: isLargeScreen ? spacing.xl : spacing.md }]}
    >
      {/* Profile Header Card */}
      <Card style={styles.profileCard} variant="elevated">
        <View style={styles.profileTop}>
          <View style={[styles.avatarCircle, { backgroundColor: theme.primary }]}>
            <Text style={styles.avatarLetter}>{user?.name?.charAt(0) || 'S'}</Text>
          </View>

          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={[styles.nameText, { color: theme.textPrimary }]}>{user?.name}</Text>
              <Badge label={user?.role?.toUpperCase() || 'STUDENT'} variant="primary" size="sm" />
            </View>
            <Text style={[styles.emailText, { color: theme.textSecondary }]}>{user?.email}</Text>
            <Text style={[styles.deptText, { color: theme.textMuted }]}>
              {user?.department} • Sem {user?.semester || 6}
            </Text>
          </View>
        </View>

        {/* Gamification Stats */}
        <View style={[styles.gamifyRow, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={styles.gamifyCol}>
            <Text style={styles.gamifyIcon}>🔥</Text>
            <Text style={[styles.gamifyVal, { color: '#F59E0B' }]}>{user?.streak || 14} Days</Text>
            <Text style={[styles.gamifyLabel, { color: theme.textMuted }]}>Study Streak</Text>
          </View>
          <View style={[styles.gamifyDivider, { backgroundColor: theme.border }]} />
          <View style={styles.gamifyCol}>
            <Text style={styles.gamifyIcon}>🪙</Text>
            <Text style={[styles.gamifyVal, { color: '#818CF8' }]}>{user?.points || 1250}</Text>
            <Text style={[styles.gamifyLabel, { color: theme.textMuted }]}>Learning Points</Text>
          </View>
          <View style={[styles.gamifyDivider, { backgroundColor: theme.border }]} />
          <View style={styles.gamifyCol}>
            <Text style={styles.gamifyIcon}>🎖️</Text>
            <Text style={[styles.gamifyVal, { color: '#10B981' }]}>{(user?.badges || []).length}</Text>
            <Text style={[styles.gamifyLabel, { color: theme.textMuted }]}>Badges Earned</Text>
          </View>
        </View>

        {/* Badges List */}
        <Text style={[styles.badgesHeading, { color: theme.textPrimary }]}>Achievements & Badges</Text>
        <View style={styles.badgesWrap}>
          {(user?.badges || ['Top Quizzer', '7-Day Streak', 'Code Master']).map((b, i) => (
            <Badge key={i} label={`🏆 ${b}`} variant="purple" size="md" />
          ))}
        </View>
      </Card>

      {/* Verified Certificates */}
      <Text style={[styles.sectionHeading, { color: theme.textPrimary }]}>Verified Course Certificates</Text>
      <View style={styles.certList}>
        {certificates.map((c, i) => (
          <Card key={i} style={styles.certCard}>
            <View style={styles.certIcon}>
              <Ionicons name="ribbon-outline" size={26} color="#F59E0B" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.certTitle, { color: theme.textPrimary }]}>{c.title}</Text>
              <Text style={[styles.certMeta, { color: theme.textSecondary }]}>
                {c.issuer} • Issued {c.issuedDate}
              </Text>
              <Text style={[styles.certId, { color: theme.textMuted }]}>ID: {c.credentialId}</Text>
            </View>
            <Button
              title="View PDF"
              variant="secondary"
              size="small"
              onPress={() => Alert.alert('Certificate Download', `Downloading verified digital certificate ${c.credentialId}`)}
            />
          </Card>
        ))}
      </View>

      {/* Preferences & Settings */}
      <Text style={[styles.sectionHeading, { color: theme.textPrimary, marginTop: spacing.lg }]}>
        App Preferences
      </Text>

      <Card style={styles.prefCard}>
        {/* Theme Row */}
        <View style={[styles.prefRow, { borderBottomColor: theme.border }]}>
          <View style={styles.prefLeft}>
            <Ionicons
              name={themeMode === 'dark' ? 'moon-outline' : 'sunny-outline'}
              size={20}
              color={theme.primary}
            />
            <View>
              <Text style={[styles.prefTitle, { color: theme.textPrimary }]}>Dark Appearance Mode</Text>
              <Text style={[styles.prefSubtitle, { color: theme.textSecondary }]}>
                {themeMode === 'dark' ? 'OLED Dark mode enabled' : 'Clean Light mode enabled'}
              </Text>
            </View>
          </View>
          <Switch
            value={themeMode === 'dark'}
            onValueChange={toggleTheme}
            trackColor={{ false: '#CBD5E1', true: theme.primary }}
            thumbColor="#FFFFFF"
          />
        </View>

        {/* Push Notifications */}
        <View style={[styles.prefRow, { borderBottomColor: theme.border }]}>
          <View style={styles.prefLeft}>
            <Ionicons name="notifications-outline" size={20} color={theme.primary} />
            <View>
              <Text style={[styles.prefTitle, { color: theme.textPrimary }]}>Push Notifications</Text>
              <Text style={[styles.prefSubtitle, { color: theme.textSecondary }]}>
                Alerts for assignment deadlines & attendance shortages
              </Text>
            </View>
          </View>
          <Switch
            value={pushNotif}
            onValueChange={setPushNotif}
            trackColor={{ false: '#CBD5E1', true: theme.primary }}
            thumbColor="#FFFFFF"
          />
        </View>

        {/* Email Digest */}
        <View style={styles.prefRow}>
          <View style={styles.prefLeft}>
            <Ionicons name="mail-outline" size={20} color={theme.primary} />
            <View>
              <Text style={[styles.prefTitle, { color: theme.textPrimary }]}>Email Summaries</Text>
              <Text style={[styles.prefSubtitle, { color: theme.textSecondary }]}>
                Weekly report card and placement notifications
              </Text>
            </View>
          </View>
          <Switch
            value={emailNotif}
            onValueChange={setEmailNotif}
            trackColor={{ false: '#CBD5E1', true: theme.primary }}
            thumbColor="#FFFFFF"
          />
        </View>
      </Card>

      {/* Logout Button */}
      <Button
        title="Log Out from Session"
        variant="danger"
        size="large"
        icon={<Ionicons name="log-out-outline" size={18} color="#FFFFFF" />}
        onPress={handleLogoutPress}
        style={{ marginTop: spacing.xl, marginBottom: spacing.xxl }}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingVertical: spacing.lg,
  },
  profileCard: {
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  profileTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '800',
  },
  nameText: {
    fontSize: 18,
    fontWeight: '800',
  },
  emailText: {
    fontSize: 12,
    marginTop: 2,
  },
  deptText: {
    fontSize: 12,
    marginTop: 2,
  },
  gamifyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    paddingVertical: spacing.md,
    marginBottom: spacing.md,
  },
  gamifyCol: {
    flex: 1,
    alignItems: 'center',
  },
  gamifyIcon: {
    fontSize: 18,
  },
  gamifyVal: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: 2,
  },
  gamifyLabel: {
    fontSize: 10,
    marginTop: 2,
  },
  gamifyDivider: {
    width: 1,
    height: 36,
  },
  badgesHeading: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  badgesWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  certList: {
    gap: spacing.sm,
  },
  certCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.md,
  },
  certIcon: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  certTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  certMeta: {
    fontSize: 12,
    marginTop: 2,
  },
  certId: {
    fontSize: 10,
    marginTop: 2,
  },
  prefCard: {
    padding: 0,
  },
  prefRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderBottomWidth: 1,
  },
  prefLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  prefTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  prefSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
});
