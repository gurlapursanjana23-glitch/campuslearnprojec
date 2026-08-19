import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { darkTheme, lightTheme, spacing, borderRadius } from '../../theme/theme';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { StatCard } from '../../components/common/StatCard';
import { ProgressBar } from '../../components/common/ProgressBar';
import { Button } from '../../components/common/Button';

interface AdminDashboardProps {
  onNavigateTab: (tabKey: string) => void;
}

export const AdminDashboardScreen: React.FC<AdminDashboardProps> = ({ onNavigateTab }) => {
  const { width } = useWindowDimensions();
  const { user, themeMode } = useAuthStore();
  const theme = themeMode === 'dark' ? darkTheme : lightTheme;
  const isLargeScreen = width >= 768;

  const departments = [
    { name: 'Computer Science & Engineering', code: 'CSE', students: 480, faculty: 28, placementRate: 94 },
    { name: 'Electronics & Communication', code: 'ECE', students: 360, faculty: 22, placementRate: 88 },
    { name: 'Artificial Intelligence & Data Science', code: 'AI&DS', students: 240, faculty: 16, placementRate: 92 },
    { name: 'Mechanical Engineering', code: 'MECH', students: 200, faculty: 14, placementRate: 78 },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={[styles.content, { paddingHorizontal: isLargeScreen ? spacing.xl : spacing.md }]}
    >
      {/* Header */}
      <View style={styles.welcomeRow}>
        <View>
          <Text style={[styles.welcomeGreeting, { color: theme.textSecondary }]}>Institutional Command Center</Text>
          <Text style={[styles.adminName, { color: theme.textPrimary }]}>{user?.name} 🛡️</Text>
          <Text style={[styles.adminDept, { color: theme.textMuted }]}>
            {user?.designation || 'System Administrator'} • CampusLearn Central
          </Text>
        </View>

        <Badge label="Super Admin" variant="danger" size="md" />
      </View>

      {/* KPI Stats */}
      <View style={styles.statsGrid}>
        <StatCard
          title="Total Students"
          value="1,420"
          subtitle="Active Enrolled"
          trend="+120 this year"
          icon={<Ionicons name="people" size={20} color="#6366F1" />}
          iconBgColor="rgba(99, 102, 241, 0.15)"
        />
        <StatCard
          title="Faculty Members"
          value="86"
          subtitle="Across 6 Departments"
          icon={<Ionicons name="school" size={20} color="#10B981" />}
          iconBgColor="rgba(16, 185, 129, 0.15)"
        />
        <StatCard
          title="Placement Rate"
          value="89.4%"
          subtitle="Highest: ₹42 LPA"
          trend="+4.2% YoY"
          icon={<Ionicons name="briefcase" size={20} color="#F59E0B" />}
          iconBgColor="rgba(245, 158, 11, 0.15)"
        />
        <StatCard
          title="System Health"
          value="99.98%"
          subtitle="Latency: 28ms"
          trend="All Green"
          icon={<Ionicons name="shield-checkmark" size={20} color="#38BDF8" />}
          iconBgColor="rgba(56, 189, 248, 0.15)"
        />
      </View>

      {/* Action Banner */}
      <Card style={styles.actionBanner} variant="elevated">
        <View style={styles.bannerLeft}>
          <Ionicons name="megaphone" size={26} color="#EC4899" />
          <View style={{ flex: 1 }}>
            <Text style={[styles.bannerTitle, { color: theme.textPrimary }]}>Campus-Wide Broadcast Notice</Text>
            <Text style={[styles.bannerSub, { color: theme.textSecondary }]}>
              Publish announcements, exam notices, or emergency alerts to all students & faculty.
            </Text>
          </View>
        </View>
        <Button
          title="New Announcement"
          variant="primary"
          size="medium"
          onPress={() => onNavigateTab('admin_announcements')}
        />
      </Card>

      {/* Departments Overview */}
      <Text style={[styles.sectionHeading, { color: theme.textPrimary }]}>Academic Departments Overview</Text>

      <View style={styles.deptList}>
        {departments.map((dept) => (
          <Card key={dept.code} style={styles.deptCard}>
            <View style={styles.deptTop}>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', gap: 6, marginBottom: 4 }}>
                  <Badge label={dept.code} variant="primary" size="sm" />
                  <Badge label={`${dept.placementRate}% Placement`} variant="success" size="sm" />
                </View>
                <Text style={[styles.deptName, { color: theme.textPrimary }]}>{dept.name}</Text>
              </View>
            </View>

            <View style={styles.deptStatsRow}>
              <View style={styles.deptStat}>
                <Text style={[styles.deptStatVal, { color: theme.textPrimary }]}>{dept.students}</Text>
                <Text style={[styles.deptStatLabel, { color: theme.textMuted }]}>Students</Text>
              </View>
              <View style={styles.deptStat}>
                <Text style={[styles.deptStatVal, { color: theme.textPrimary }]}>{dept.faculty}</Text>
                <Text style={[styles.deptStatLabel, { color: theme.textMuted }]}>Faculty</Text>
              </View>
              <View style={styles.deptStat}>
                <Text style={[styles.deptStatVal, { color: '#10B981', fontWeight: '800' }]}>{dept.placementRate}%</Text>
                <Text style={[styles.deptStatLabel, { color: theme.textMuted }]}>Placement</Text>
              </View>
            </View>

            <ProgressBar progress={dept.placementRate} color="#10B981" height={6} style={{ marginTop: spacing.sm }} />
          </Card>
        ))}
      </View>
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
  welcomeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  welcomeGreeting: {
    fontSize: 13,
    fontWeight: '500',
  },
  adminName: {
    fontSize: 22,
    fontWeight: '800',
  },
  adminDept: {
    fontSize: 12,
    marginTop: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  actionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    marginBottom: spacing.xl,
    gap: spacing.md,
    flexWrap: 'wrap',
  },
  bannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
    minWidth: 240,
  },
  bannerTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  bannerSub: {
    fontSize: 12,
    marginTop: 2,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  deptList: {
    gap: spacing.sm,
  },
  deptCard: {
    padding: spacing.md,
  },
  deptTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  deptName: {
    fontSize: 15,
    fontWeight: '700',
  },
  deptStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  deptStat: {
    alignItems: 'center',
  },
  deptStatVal: {
    fontSize: 16,
    fontWeight: '800',
  },
  deptStatLabel: {
    fontSize: 11,
    marginTop: 2,
  },
});
