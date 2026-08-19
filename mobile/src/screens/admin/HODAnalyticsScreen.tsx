import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { darkTheme, lightTheme, spacing, borderRadius } from '../../theme/theme';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { StatCard } from '../../components/common/StatCard';
import { ProgressBar } from '../../components/common/ProgressBar';

export const HODAnalyticsScreen: React.FC = () => {
  const { width } = useWindowDimensions();
  const { user, themeMode } = useAuthStore();
  const theme = themeMode === 'dark' ? darkTheme : lightTheme;
  const isLargeScreen = width >= 768;

  const semesterAttendance = [
    { sem: 'Semester 8', attendance: 88, students: 120, status: 'good' },
    { sem: 'Semester 6', attendance: 82.5, students: 130, status: 'good' },
    { sem: 'Semester 4', attendance: 76.2, students: 115, status: 'warning' },
    { sem: 'Semester 2', attendance: 91.0, students: 115, status: 'good' },
  ];

  const facultyLoads = [
    { name: 'Dr. Priya Ramanathan', courses: 3, weeklyHours: 16, status: 'Optimal' },
    { name: 'Prof. Rajesh Kulkarni', courses: 2, weeklyHours: 12, status: 'Optimal' },
    { name: 'Er. Ananya Sen', courses: 3, weeklyHours: 18, status: 'High' },
    { name: 'Dr. Vikramaditya Rao', courses: 2, weeklyHours: 14, status: 'Optimal' },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={[styles.content, { paddingHorizontal: isLargeScreen ? spacing.xl : spacing.md }]}
    >
      {/* Header */}
      <View style={styles.headerRow}>
        <View>
          <Text style={[styles.heading, { color: theme.textPrimary }]}>HOD Departmental Analytics</Text>
          <Text style={[styles.subheading, { color: theme.textSecondary }]}>
            Department of Computer Science & Engineering • Academic Session 2026-27
          </Text>
        </View>

        <Badge label="HOD Insights" variant="purple" size="md" />
      </View>

      {/* KPI Stats */}
      <View style={styles.statsGrid}>
        <StatCard
          title="Dept Attendance"
          value="84.4%"
          subtitle="All Semesters"
          trend="+1.8%"
          icon={<Ionicons name="stats-chart" size={20} color="#10B981" />}
          iconBgColor="rgba(16, 185, 129, 0.15)"
        />
        <StatCard
          title="Placement Index"
          value="94.2%"
          subtitle="48 Offers / 51 Eligible"
          trend="Highest in College"
          icon={<Ionicons name="trophy" size={20} color="#F59E0B" />}
          iconBgColor="rgba(245, 158, 11, 0.15)"
        />
        <StatCard
          title="Coursework Submissions"
          value="96.5%"
          subtitle="On-time completion"
          icon={<Ionicons name="checkmark-done" size={20} color="#6366F1" />}
          iconBgColor="rgba(99, 102, 241, 0.15)"
        />
        <StatCard
          title="Active Research Grants"
          value="₹45 Lakhs"
          subtitle="3 Ongoing Projects"
          icon={<Ionicons name="flask" size={20} color="#EC4899" />}
          iconBgColor="rgba(236, 72, 153, 0.15)"
        />
      </View>

      {/* Semester Attendance Comparison */}
      <Text style={[styles.sectionHeading, { color: theme.textPrimary }]}>
        Semester-Wise Student Attendance Trends
      </Text>

      <View style={styles.semGrid}>
        {semesterAttendance.map((s, i) => (
          <Card key={i} style={styles.semCard}>
            <View style={styles.semTop}>
              <View>
                <Text style={[styles.semTitle, { color: theme.textPrimary }]}>{s.sem}</Text>
                <Text style={[styles.semSub, { color: theme.textMuted }]}>{s.students} Enrolled Students</Text>
              </View>
              <Text
                style={[
                  styles.semVal,
                  { color: s.attendance >= 80 ? '#10B981' : '#F59E0B' },
                ]}
              >
                {s.attendance}%
              </Text>
            </View>

            <ProgressBar
              progress={s.attendance}
              color={s.attendance >= 80 ? '#10B981' : '#F59E0B'}
              height={8}
              style={{ marginTop: spacing.md }}
            />
          </Card>
        ))}
      </View>

      {/* Faculty Teaching Workload Table */}
      <Text style={[styles.sectionHeading, { color: theme.textPrimary, marginTop: spacing.lg }]}>
        Faculty Workload & Allocation Matrix
      </Text>

      <Card style={styles.matrixCard}>
        {facultyLoads.map((f, i) => (
          <View
            key={i}
            style={[
              styles.matrixRow,
              i < facultyLoads.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.border },
            ]}
          >
            <View style={{ flex: 1.2 }}>
              <Text style={[styles.facultyName, { color: theme.textPrimary }]}>{f.name}</Text>
              <Text style={[styles.courseCount, { color: theme.textMuted }]}>{f.courses} Active Courses</Text>
            </View>

            <View style={styles.hoursBox}>
              <Text style={[styles.hoursVal, { color: theme.textPrimary }]}>{f.weeklyHours} hrs</Text>
              <Text style={[styles.hoursLabel, { color: theme.textMuted }]}>Weekly</Text>
            </View>

            <Badge
              label={f.status}
              variant={f.status === 'Optimal' ? 'success' : 'warning'}
              size="sm"
            />
          </View>
        ))}
      </Card>
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  heading: {
    fontSize: 22,
    fontWeight: '800',
  },
  subheading: {
    fontSize: 13,
    marginTop: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  semGrid: {
    gap: spacing.sm,
  },
  semCard: {
    padding: spacing.md,
  },
  semTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  semTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  semSub: {
    fontSize: 12,
    marginTop: 2,
  },
  semVal: {
    fontSize: 18,
    fontWeight: '800',
  },
  matrixCard: {
    padding: 0,
  },
  matrixRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
  },
  facultyName: {
    fontSize: 14,
    fontWeight: '700',
  },
  courseCount: {
    fontSize: 12,
    marginTop: 2,
  },
  hoursBox: {
    alignItems: 'center',
    marginRight: spacing.md,
  },
  hoursVal: {
    fontSize: 14,
    fontWeight: '700',
  },
  hoursLabel: {
    fontSize: 10,
  },
});
