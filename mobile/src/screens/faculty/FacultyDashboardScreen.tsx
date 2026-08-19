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
import { Button } from '../../components/common/Button';
import { MOCK_COURSES } from '../../services/api';

interface FacultyDashboardProps {
  onNavigateTab: (tabKey: string) => void;
}

export const FacultyDashboardScreen: React.FC<FacultyDashboardProps> = ({ onNavigateTab }) => {
  const { width } = useWindowDimensions();
  const { user, themeMode } = useAuthStore();
  const theme = themeMode === 'dark' ? darkTheme : lightTheme;
  const isLargeScreen = width >= 768;

  const todayFacultySchedule = [
    { time: '09:00 AM - 10:00 AM', course: 'Design & Analysis of Algorithms', code: 'CS301', room: 'LH-302', students: 64, type: 'Lecture' },
    { time: '11:30 AM - 01:30 PM', course: 'Algorithms Laboratory (Batch A)', code: 'CS301L', room: 'Computing Lab 3', students: 32, type: 'Lab' },
    { time: '03:45 PM - 04:45 PM', course: 'Faculty Research & Mentoring Hour', code: 'R&D', room: 'Cabin 402', students: 8, type: 'Tutorial' },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={[styles.content, { paddingHorizontal: isLargeScreen ? spacing.xl : spacing.md }]}
    >
      {/* Header */}
      <View style={styles.welcomeRow}>
        <View>
          <Text style={[styles.welcomeGreeting, { color: theme.textSecondary }]}>Faculty Portal</Text>
          <Text style={[styles.facultyName, { color: theme.textPrimary }]}>{user?.name} 👨‍🏫</Text>
          <Text style={[styles.facultyDept, { color: theme.textMuted }]}>
            {user?.designation} • {user?.department}
          </Text>
        </View>

        <Badge label="Faculty Mode" variant="primary" size="md" />
      </View>

      {/* KPI Stats */}
      <View style={styles.statsGrid}>
        <StatCard
          title="Active Courses"
          value="3 Subjects"
          subtitle="120 Total Lectures"
          icon={<Ionicons name="school" size={20} color="#6366F1" />}
          iconBgColor="rgba(99, 102, 241, 0.15)"
        />
        <StatCard
          title="Enrolled Students"
          value="184"
          subtitle="Across all sections"
          icon={<Ionicons name="people" size={20} color="#10B981" />}
          iconBgColor="rgba(16, 185, 129, 0.15)"
        />
        <StatCard
          title="Pending to Grade"
          value="14 Submissions"
          subtitle="Assignment 3"
          trend="Needs Review"
          trendPositive={false}
          icon={<Ionicons name="clipboard" size={20} color="#F59E0B" />}
          iconBgColor="rgba(245, 158, 11, 0.15)"
        />
        <StatCard
          title="Avg Class Attendance"
          value="85.4%"
          subtitle="Dept Target: 75%"
          trend="+3.2%"
          icon={<Ionicons name="analytics" size={20} color="#38BDF8" />}
          iconBgColor="rgba(56, 189, 248, 0.15)"
        />
      </View>

      {/* Quick Launch Action Banner */}
      <Card style={styles.quickLaunchBanner} variant="elevated">
        <View style={styles.bannerLeft}>
          <Ionicons name="checkbox" size={28} color="#10B981" />
          <View style={{ flex: 1 }}>
            <Text style={[styles.bannerTitle, { color: theme.textPrimary }]}>Take Today's Class Roll Call</Text>
            <Text style={[styles.bannerSub, { color: theme.textSecondary }]}>
              Mark student attendance for CS301 (Design & Analysis of Algorithms)
            </Text>
          </View>
        </View>
        <Button
          title="Open Roll Marker"
          variant="success"
          size="medium"
          icon={<Ionicons name="checkmark-done" size={16} color="#FFFFFF" />}
          onPress={() => onNavigateTab('faculty_attendance')}
        />
      </Card>

      {/* Today's Schedule & Pending Work */}
      <View style={[styles.dualGrid, { flexDirection: isLargeScreen ? 'row' : 'column' }]}>
        {/* Left: Schedule */}
        <View style={{ flex: 1.2 }}>
          <Text style={[styles.sectionHeading, { color: theme.textPrimary }]}>Today's Lecture Schedule</Text>

          {todayFacultySchedule.map((slot, i) => (
            <Card key={i} style={styles.scheduleCard}>
              <View style={styles.scheduleHeader}>
                <Badge label={slot.code} variant="primary" size="sm" />
                <Badge label={slot.type} variant={slot.type === 'Lab' ? 'purple' : 'info'} size="sm" />
              </View>

              <Text style={[styles.scheduleCourse, { color: theme.textPrimary }]}>{slot.course}</Text>

              <View style={styles.scheduleMeta}>
                <Text style={[styles.scheduleTime, { color: theme.primary }]}>⏰ {slot.time}</Text>
                <Text style={[styles.scheduleRoom, { color: theme.textSecondary }]}>📍 {slot.room}</Text>
                <Text style={[styles.scheduleStudents, { color: theme.textMuted }]}>👥 {slot.students} Students</Text>
              </View>
            </Card>
          ))}
        </View>

        {/* Right: Assigned Courses & Actions */}
        <View style={{ flex: 1 }}>
          <Text style={[styles.sectionHeading, { color: theme.textPrimary }]}>Assigned Courses</Text>

          {MOCK_COURSES.slice(0, 2).map((c) => (
            <Card key={c._id} style={styles.courseItemCard}>
              <View style={{ flex: 1 }}>
                <Badge label={c.code} variant="primary" size="sm" />
                <Text style={[styles.courseItemTitle, { color: theme.textPrimary }]}>{c.title}</Text>
                <Text style={[styles.courseItemStats, { color: theme.textSecondary }]}>
                  {c.totalStudents} Enrolled • 24 Lectures
                </Text>
              </View>

              <Button
                title="Grade Work"
                variant="outline"
                size="small"
                onPress={() => onNavigateTab('faculty_assignments')}
              />
            </Card>
          ))}
        </View>
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
  facultyName: {
    fontSize: 22,
    fontWeight: '800',
  },
  facultyDept: {
    fontSize: 12,
    marginTop: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  quickLaunchBanner: {
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
  dualGrid: {
    gap: spacing.lg,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  scheduleCard: {
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  scheduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  scheduleCourse: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 6,
  },
  scheduleMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  scheduleTime: {
    fontSize: 12,
    fontWeight: '600',
  },
  scheduleRoom: {
    fontSize: 12,
  },
  scheduleStudents: {
    fontSize: 12,
  },
  courseItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.md,
  },
  courseItemTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 4,
  },
  courseItemStats: {
    fontSize: 12,
    marginTop: 2,
  },
});
