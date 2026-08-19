import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
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
import {
  MOCK_COURSES,
  MOCK_ASSIGNMENTS,
  MOCK_ATTENDANCE,
  MOCK_ANNOUNCEMENTS,
  MOCK_TIMETABLE,
} from '../../services/api';

interface StudentDashboardProps {
  onNavigateTab: (tabKey: string, params?: any) => void;
}

export const StudentDashboardScreen: React.FC<StudentDashboardProps> = ({ onNavigateTab }) => {
  const { width } = useWindowDimensions();
  const { user, themeMode } = useAuthStore();
  const theme = themeMode === 'dark' ? darkTheme : lightTheme;
  const isLargeScreen = width >= 768;

  // Check for attendance shortage (< 75%)
  const lowAttendanceSubject = MOCK_ATTENDANCE.find((a) => a.percentage < 75);
  const pendingAssignments = MOCK_ASSIGNMENTS.filter((a) => a.status === 'pending');
  const todayClasses = MOCK_TIMETABLE.filter((t) => t.day === 'Monday');

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={[styles.content, { paddingHorizontal: isLargeScreen ? spacing.xl : spacing.md }]}
    >
      {/* Attendance Shortage Alert Banner (Sinchana Feature) */}
      {lowAttendanceSubject && (
        <TouchableOpacity
          style={[styles.alertBanner, { backgroundColor: theme.dangerLight, borderColor: theme.danger }]}
          onPress={() => onNavigateTab('attendance')}
          activeOpacity={0.85}
        >
          <View style={styles.alertIconCircle}>
            <Ionicons name="warning" size={20} color="#EF4444" />
          </View>
          <View style={{ flex: 1 }}>
            <View style={styles.alertHeaderRow}>
              <Text style={[styles.alertTitle, { color: theme.danger }]}>
                Attendance Shortage Alert: {lowAttendanceSubject.courseName}
              </Text>
              <Badge label={`${lowAttendanceSubject.percentage}%`} variant="danger" size="sm" />
            </View>
            <Text style={[styles.alertSubtitle, { color: theme.textSecondary }]}>
              Your attendance is below the 75% mandatory threshold ({lowAttendanceSubject.attendedClasses}/{lowAttendanceSubject.totalClasses} classes). Tap to view history.
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={theme.danger} />
        </TouchableOpacity>
      )}

      {/* Hero Welcome & Stats */}
      <View style={styles.welcomeRow}>
        <View>
          <Text style={[styles.welcomeGreeting, { color: theme.textSecondary }]}>Welcome Back,</Text>
          <Text style={[styles.studentName, { color: theme.textPrimary }]}>{user?.name} 🎓</Text>
          <Text style={[styles.studentDept, { color: theme.textMuted }]}>
            {user?.department} • Sem {user?.semester}
          </Text>
        </View>

        <View style={styles.streakPillGroup}>
          <View style={[styles.streakPill, { backgroundColor: 'rgba(245, 158, 11, 0.15)', borderColor: 'rgba(245, 158, 11, 0.3)' }]}>
            <Text style={{ fontSize: 16 }}>🔥</Text>
            <Text style={[styles.streakText, { color: '#F59E0B' }]}>{user?.streak || 14} Day Streak</Text>
          </View>
          <View style={[styles.streakPill, { backgroundColor: 'rgba(99, 102, 241, 0.15)', borderColor: 'rgba(99, 102, 241, 0.3)' }]}>
            <Text style={{ fontSize: 16 }}>🪙</Text>
            <Text style={[styles.streakText, { color: '#818CF8' }]}>{user?.points || 1250} Pts</Text>
          </View>
        </View>
      </View>

      {/* KPI Stats Grid */}
      <View style={styles.statsGrid}>
        <StatCard
          title="Overall Attendance"
          value={`${user?.attendanceRate || 82.5}%`}
          subtitle="Target: >= 75%"
          trend="+2.1%"
          trendPositive={true}
          icon={<Ionicons name="stats-chart" size={20} color="#10B981" />}
          iconBgColor="rgba(16, 185, 129, 0.15)"
        />
        <StatCard
          title="Active Courses"
          value={MOCK_COURSES.length}
          subtitle="4 Major Credits"
          icon={<Ionicons name="book" size={20} color="#6366F1" />}
          iconBgColor="rgba(99, 102, 241, 0.15)"
        />
        <StatCard
          title="Pending Submissions"
          value={pendingAssignments.length}
          subtitle="Next due tomorrow"
          trend="2 Due Soon"
          trendPositive={false}
          icon={<Ionicons name="document-text" size={20} color="#F59E0B" />}
          iconBgColor="rgba(245, 158, 11, 0.15)"
        />
        <StatCard
          title="Placement Prep"
          value="85% Ready"
          subtitle="Aptitude & Resume"
          trend="Google/MS Ready"
          icon={<Ionicons name="briefcase" size={20} color="#EC4899" />}
          iconBgColor="rgba(236, 72, 153, 0.15)"
        />
      </View>

      {/* Quick Action Shortcuts */}
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
          onPress={() => onNavigateTab('ai_assistant')}
          activeOpacity={0.8}
        >
          <View style={[styles.actionIcon, { backgroundColor: 'rgba(236, 72, 153, 0.15)' }]}>
            <Ionicons name="sparkles" size={18} color="#EC4899" />
          </View>
          <Text style={[styles.actionTitle, { color: theme.textPrimary }]}>Ask AI Tutor</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
          onPress={() => onNavigateTab('placement')}
          activeOpacity={0.8}
        >
          <View style={[styles.actionIcon, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
            <Ionicons name="speedometer" size={18} color="#F59E0B" />
          </View>
          <Text style={[styles.actionTitle, { color: theme.textPrimary }]}>Mock Aptitude</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
          onPress={() => onNavigateTab('assignments')}
          activeOpacity={0.8}
        >
          <View style={[styles.actionIcon, { backgroundColor: 'rgba(99, 102, 241, 0.15)' }]}>
            <Ionicons name="cloud-upload" size={18} color="#6366F1" />
          </View>
          <Text style={[styles.actionTitle, { color: theme.textPrimary }]}>Upload Work</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
          onPress={() => onNavigateTab('timetable')}
          activeOpacity={0.8}
        >
          <View style={[styles.actionIcon, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
            <Ionicons name="calendar" size={18} color="#10B981" />
          </View>
          <Text style={[styles.actionTitle, { color: theme.textPrimary }]}>Timetable</Text>
        </TouchableOpacity>
      </View>

      {/* Main Grid: Courses & Today's Schedule */}
      <View style={[styles.dualColumnGrid, { flexDirection: isLargeScreen ? 'row' : 'column' }]}>
        {/* Left Column: Enrolled Courses */}
        <View style={{ flex: 1.2 }}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Active Courses</Text>
            <TouchableOpacity onPress={() => onNavigateTab('courses')}>
              <Text style={[styles.seeAllText, { color: theme.primary }]}>View All ({MOCK_COURSES.length})</Text>
            </TouchableOpacity>
          </View>

          {MOCK_COURSES.slice(0, 3).map((course) => (
            <Card
              key={course._id}
              style={styles.courseCard}
              onPress={() => onNavigateTab('course_detail', { courseId: course._id })}
            >
              <Image source={{ uri: course.thumbnail }} style={styles.courseThumb} />
              <View style={styles.courseInfo}>
                <View style={styles.courseTopRow}>
                  <Badge label={course.code} variant="primary" size="sm" />
                  <View style={styles.ratingRow}>
                    <Ionicons name="star" size={13} color="#FBBF24" />
                    <Text style={[styles.ratingText, { color: theme.textSecondary }]}>{course.rating}</Text>
                  </View>
                </View>
                <Text style={[styles.courseTitle, { color: theme.textPrimary }]} numberOfLines={1}>
                  {course.title}
                </Text>
                <Text style={[styles.courseInstructor, { color: theme.textMuted }]}>
                  {course.instructor}
                </Text>

                <View style={styles.progressSection}>
                  <View style={styles.progressTextRow}>
                    <Text style={[styles.progressLabel, { color: theme.textSecondary }]}>
                      {course.completedLessons}/{course.totalLessons} Lessons
                    </Text>
                    <Text style={[styles.progressPercent, { color: theme.primary }]}>
                      {course.progress}%
                    </Text>
                  </View>
                  <ProgressBar progress={course.progress || 0} height={6} />
                </View>
              </View>
            </Card>
          ))}
        </View>

        {/* Right Column: Today's Schedule & Announcements */}
        <View style={{ flex: 1 }}>
          {/* Today's Classes */}
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Today's Schedule</Text>
            <Badge label="Monday" variant="info" size="sm" />
          </View>

          <Card style={styles.scheduleCard}>
            {todayClasses.map((item, idx) => (
              <View
                key={item.id}
                style={[
                  styles.scheduleItem,
                  idx < todayClasses.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.border },
                ]}
              >
                <View style={styles.timeBadge}>
                  <Text style={[styles.timeText, { color: theme.primary }]}>{item.startTime}</Text>
                  <Text style={[styles.timeSub, { color: theme.textMuted }]}>{item.endTime}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.classCourse, { color: theme.textPrimary }]}>{item.courseName}</Text>
                  <Text style={[styles.classDetails, { color: theme.textSecondary }]}>
                    {item.room} • {item.faculty}
                  </Text>
                </View>
                <Badge
                  label={item.type}
                  variant={item.type === 'Lab' ? 'purple' : 'primary'}
                  size="sm"
                />
              </View>
            ))}
          </Card>

          {/* Campus Broadcast Notices */}
          <View style={[styles.sectionHeader, { marginTop: spacing.lg }]}>
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Campus Notices</Text>
            <Badge label="New" variant="warning" size="sm" />
          </View>

          {MOCK_ANNOUNCEMENTS.slice(0, 2).map((ann) => (
            <Card key={ann._id} style={styles.noticeCard}>
              <View style={styles.noticeHeader}>
                <Badge
                  label={ann.priority.toUpperCase()}
                  variant={ann.priority === 'urgent' ? 'danger' : 'warning'}
                  size="sm"
                />
                <Text style={[styles.noticeDate, { color: theme.textMuted }]}>{ann.date}</Text>
              </View>
              <Text style={[styles.noticeTitle, { color: theme.textPrimary }]}>{ann.title}</Text>
              <Text style={[styles.noticeContent, { color: theme.textSecondary }]} numberOfLines={2}>
                {ann.content}
              </Text>
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
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  alertIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: '700',
    flex: 1,
    marginRight: 6,
  },
  alertSubtitle: {
    fontSize: 12,
    lineHeight: 16,
  },
  welcomeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  welcomeGreeting: {
    fontSize: 13,
    fontWeight: '500',
  },
  studentName: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  studentDept: {
    fontSize: 12,
    marginTop: 2,
  },
  streakPillGroup: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  streakPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    gap: 6,
  },
  streakText: {
    fontSize: 12,
    fontWeight: '700',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xl,
    flexWrap: 'wrap',
  },
  actionBtn: {
    flex: 1,
    minWidth: 130,
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    gap: spacing.sm,
  },
  actionIcon: {
    width: 34,
    height: 34,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionTitle: {
    fontSize: 13,
    fontWeight: '600',
  },
  dualColumnGrid: {
    gap: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '600',
  },
  courseCard: {
    flexDirection: 'row',
    padding: spacing.sm,
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  courseThumb: {
    width: 85,
    height: 85,
    borderRadius: borderRadius.md,
  },
  courseInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  courseTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
  },
  courseTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 2,
  },
  courseInstructor: {
    fontSize: 12,
  },
  progressSection: {
    marginTop: 4,
  },
  progressTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  progressLabel: {
    fontSize: 11,
  },
  progressPercent: {
    fontSize: 11,
    fontWeight: '700',
  },
  scheduleCard: {
    padding: 0,
  },
  scheduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.sm,
  },
  timeBadge: {
    alignItems: 'center',
    minWidth: 65,
  },
  timeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  timeSub: {
    fontSize: 10,
  },
  classCourse: {
    fontSize: 13,
    fontWeight: '700',
  },
  classDetails: {
    fontSize: 11,
    marginTop: 2,
  },
  noticeCard: {
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  noticeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  noticeDate: {
    fontSize: 11,
  },
  noticeTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  noticeContent: {
    fontSize: 12,
    lineHeight: 17,
  },
});
