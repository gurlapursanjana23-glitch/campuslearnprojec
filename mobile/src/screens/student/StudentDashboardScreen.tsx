import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  useWindowDimensions,
  Alert,
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
  aiAPI,
} from '../../services/api';

interface StudentDashboardProps {
  onNavigateTab: (tabKey: string, params?: any) => void;
}

export const StudentDashboardScreen: React.FC<StudentDashboardProps> = ({ onNavigateTab }) => {
  const { width } = useWindowDimensions();
  const { user, themeMode } = useAuthStore();
  const theme = themeMode === 'dark' ? darkTheme : lightTheme;
  const isLargeScreen = width >= 768;

  const [aiQuery, setAiQuery] = useState('');
  const [isAILoading, setIsAILoading] = useState(false);

  // Time-of-day greeting
  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'Good morning' : currentHour < 18 ? 'Good afternoon' : 'Good evening';

  // Check for attendance shortage (< 75%)
  const lowAttendanceSubject = MOCK_ATTENDANCE.find((a) => a.percentage < 75);
  const pendingAssignments = MOCK_ASSIGNMENTS.filter((a) => a.status === 'pending');
  const todayClasses = MOCK_TIMETABLE.filter((t) => t.day === 'Monday');

  const handleAskAI = async () => {
    if (!aiQuery.trim()) return;
    setIsAILoading(true);
    try {
      await aiAPI.chat(aiQuery);
    } catch (e) {}
    setIsAILoading(false);
    Alert.alert(
      '🤖 Campus AI Tutor',
      `For your question "${aiQuery}":\n\nFocus on core algorithmic invariants and dynamic programming memoization. Opening full AI Assistant tab...`,
      [
        {
          text: 'Open AI Tutor',
          onPress: () => onNavigateTab('ai_assistant'),
        },
      ]
    );
    setAiQuery('');
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={[styles.content, { paddingHorizontal: isLargeScreen ? spacing.xl : spacing.md }]}
    >
      {/* ─── Web App Signature Orange Hero Welcome Banner ───────────────────── */}
      <View style={[styles.heroBanner, { backgroundColor: '#F97316' }]}>
        <View style={styles.heroTopRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.heroGreetingText}>{greeting},</Text>
            <Text style={styles.heroNameText}>{user?.name} 👋</Text>
            <Text style={styles.heroSubText}>
              {user?.department} • Sem {user?.semester || 6}
            </Text>
          </View>

          {/* Gamification Pills */}
          <View style={styles.heroGamifyGroup}>
            <View style={styles.heroGamifyPill}>
              <Text style={{ fontSize: 16 }}>🔥</Text>
              <Text style={styles.heroGamifyVal}>{user?.streak || 14} Days</Text>
            </View>
            <View style={styles.heroGamifyPill}>
              <Text style={{ fontSize: 16 }}>🪙</Text>
              <Text style={styles.heroGamifyVal}>{user?.points || 1250} Pts</Text>
            </View>
          </View>
        </View>

        {/* Dashboard Instant AI Assistant Query Input */}
        <View style={styles.heroAiSearch}>
          <Ionicons name="sparkles" size={18} color="#F97316" style={{ marginRight: 8 }} />
          <TextInput
            style={styles.heroAiInput}
            placeholder="Ask Campus AI (e.g., 'How to solve 0/1 Knapsack?')"
            placeholderTextColor="#71717A"
            value={aiQuery}
            onChangeText={setAiQuery}
            onSubmitEditing={handleAskAI}
          />
          <TouchableOpacity style={styles.heroAiBtn} onPress={handleAskAI} activeOpacity={0.8}>
            <Text style={styles.heroAiBtnText}>Ask</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ─── Sinchana's Attendance Shortage Risk Warning ────────────────────────── */}
      {lowAttendanceSubject && (
        <TouchableOpacity
          style={[styles.alertBanner, { backgroundColor: 'rgba(239, 68, 68, 0.12)', borderColor: '#EF4444' }]}
          onPress={() => onNavigateTab('attendance')}
          activeOpacity={0.85}
        >
          <View style={styles.alertIconCircle}>
            <Ionicons name="warning" size={20} color="#EF4444" />
          </View>
          <View style={{ flex: 1 }}>
            <View style={styles.alertHeaderRow}>
              <Text style={[styles.alertTitle, { color: '#EF4444' }]}>
                Attendance Shortage Risk: {lowAttendanceSubject.courseName}
              </Text>
              <Badge label={`${lowAttendanceSubject.percentage}%`} variant="danger" size="sm" />
            </View>
            <Text style={[styles.alertSubtitle, { color: theme.textSecondary }]}>
              Your attendance is below 75% ({lowAttendanceSubject.attendedClasses}/{lowAttendanceSubject.totalClasses} classes). Attend the next 2 lectures to restore eligibility.
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#EF4444" />
        </TouchableOpacity>
      )}

      {/* ─── Top KPI Metric Stat Cards ────────────────────────────────────────── */}
      <View style={styles.statsGrid}>
        <StatCard
          title="Overall Attendance"
          value={`${user?.attendanceRate || 82.5}%`}
          subtitle="Requirement: >= 75%"
          trend="+2.4% this month"
          trendPositive={true}
          icon={<Ionicons name="stats-chart" size={20} color="#10B981" />}
          iconBgColor="rgba(16, 185, 129, 0.15)"
        />
        <StatCard
          title="Active Courses"
          value={MOCK_COURSES.length}
          subtitle="4 Major Credits"
          icon={<Ionicons name="book" size={20} color="#F97316" />}
          iconBgColor="rgba(249, 115, 22, 0.15)"
        />
        <StatCard
          title="Pending Coursework"
          value={pendingAssignments.length}
          subtitle="Assignment 3 due"
          trend="2 Due Soon"
          trendPositive={false}
          icon={<Ionicons name="document-text" size={20} color="#F59E0B" />}
          iconBgColor="rgba(245, 158, 11, 0.15)"
        />
        <StatCard
          title="Placement Readiness"
          value="88% Score"
          subtitle="Top 10% Percentile"
          trend="Google/MS Ready"
          icon={<Ionicons name="briefcase" size={20} color="#8B5CF6" />}
          iconBgColor="rgba(139, 92, 246, 0.15)"
        />
      </View>

      {/* ─── Quick Feature Shortcuts ──────────────────────────────────────────── */}
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
          onPress={() => onNavigateTab('placement')}
          activeOpacity={0.8}
        >
          <View style={[styles.actionIcon, { backgroundColor: 'rgba(249, 115, 22, 0.15)' }]}>
            <Ionicons name="speedometer" size={18} color="#F97316" />
          </View>
          <Text style={[styles.actionTitle, { color: theme.textPrimary }]}>Aptitude Simulator</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
          onPress={() => onNavigateTab('assignments')}
          activeOpacity={0.8}
        >
          <View style={[styles.actionIcon, { backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
            <Ionicons name="cloud-upload" size={18} color="#10B981" />
          </View>
          <Text style={[styles.actionTitle, { color: theme.textPrimary }]}>Submit Tasks</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
          onPress={() => onNavigateTab('timetable')}
          activeOpacity={0.8}
        >
          <View style={[styles.actionIcon, { backgroundColor: 'rgba(56, 189, 248, 0.15)' }]}>
            <Ionicons name="calendar" size={18} color="#38BDF8" />
          </View>
          <Text style={[styles.actionTitle, { color: theme.textPrimary }]}>Timetable</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}
          onPress={() => onNavigateTab('ai_assistant')}
          activeOpacity={0.8}
        >
          <View style={[styles.actionIcon, { backgroundColor: 'rgba(139, 92, 246, 0.15)' }]}>
            <Ionicons name="sparkles" size={18} color="#8B5CF6" />
          </View>
          <Text style={[styles.actionTitle, { color: theme.textPrimary }]}>Ask AI Tutor</Text>
        </TouchableOpacity>
      </View>

      {/* ─── Placement Readiness & Career Roadmap (Nayana G. Naik) ─────────────── */}
      <Card style={styles.placementWidgetCard} variant="elevated">
        <View style={styles.placementWidgetTop}>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', gap: 6, marginBottom: 4 }}>
              <Badge label="Placement Module" variant="purple" size="sm" />
              <Badge label="Nayana G. Naik" variant="primary" size="sm" />
            </View>
            <Text style={[styles.placementWidgetHeading, { color: theme.textPrimary }]}>
              Career & Campus Placement Readiness
            </Text>
            <Text style={[styles.placementWidgetSub, { color: theme.textSecondary }]}>
              Target Role: Full-Stack Cloud Engineer • Target Package: ₹28-42 LPA
            </Text>
          </View>

          <Button
            title="Practice Mock Test"
            variant="primary"
            size="small"
            icon={<Ionicons name="play" size={14} color="#FFFFFF" />}
            onPress={() => onNavigateTab('placement')}
          />
        </View>

        <View style={styles.placementScoresRow}>
          <View style={styles.placementScoreCol}>
            <Text style={[styles.placementScoreVal, { color: '#F97316' }]}>80%</Text>
            <Text style={[styles.placementScoreLabel, { color: theme.textMuted }]}>Aptitude</Text>
          </View>
          <View style={styles.placementScoreCol}>
            <Text style={[styles.placementScoreVal, { color: '#10B981' }]}>75%</Text>
            <Text style={[styles.placementScoreLabel, { color: theme.textMuted }]}>Coding DSA</Text>
          </View>
          <View style={styles.placementScoreCol}>
            <Text style={[styles.placementScoreVal, { color: '#38BDF8' }]}>60%</Text>
            <Text style={[styles.placementScoreLabel, { color: theme.textMuted }]}>Interview</Text>
          </View>
          <View style={styles.placementScoreCol}>
            <Text style={[styles.placementScoreVal, { color: '#8B5CF6' }]}>88%</Text>
            <Text style={[styles.placementScoreLabel, { color: theme.textMuted }]}>Resume ATS</Text>
          </View>
        </View>

        <ProgressBar progress={82} color="#F97316" height={8} style={{ marginTop: spacing.md }} />
      </Card>

      {/* ─── Dual Column Grid: Active Courses & Schedule ──────────────────────── */}
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
                  <ProgressBar progress={course.progress || 0} color="#F97316" height={6} />
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
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Campus Circulars</Text>
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
  heroBanner: {
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    shadowColor: '#F97316',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  heroGreetingText: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 13,
    fontWeight: '600',
  },
  heroNameText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  heroSubText: {
    color: 'rgba(255, 255, 255, 0.75)',
    fontSize: 12,
    marginTop: 2,
  },
  heroGamifyGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  heroGamifyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    gap: 6,
  },
  heroGamifyVal: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  heroAiSearch: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    height: 48,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  heroAiInput: {
    flex: 1,
    fontSize: 13,
    color: '#09090B',
    height: '100%',
  },
  heroAiBtn: {
    backgroundColor: '#F97316',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: borderRadius.md,
  },
  heroAiBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
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
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
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
  placementWidgetCard: {
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  placementWidgetTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
    gap: spacing.md,
    flexWrap: 'wrap',
  },
  placementWidgetHeading: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: 2,
  },
  placementWidgetSub: {
    fontSize: 12,
    marginTop: 2,
  },
  placementScoresRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  placementScoreCol: {
    alignItems: 'center',
  },
  placementScoreVal: {
    fontSize: 20,
    fontWeight: '800',
  },
  placementScoreLabel: {
    fontSize: 11,
    marginTop: 2,
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
