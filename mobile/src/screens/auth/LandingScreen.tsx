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
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';

interface LandingScreenProps {
  onNavigateLogin: () => void;
}

export const LandingScreen: React.FC<LandingScreenProps> = ({ onNavigateLogin }) => {
  const { width } = useWindowDimensions();
  const { themeMode, toggleTheme } = useAuthStore();
  const theme = themeMode === 'dark' ? darkTheme : lightTheme;
  const isLargeScreen = width >= 768;

  const stats = [
    { label: 'Active Students', value: '4,200+' },
    { label: 'Course Completion', value: '94.2%' },
    { label: 'Avg Placement Package', value: '₹14.8 LPA' },
    { label: 'Partner Recruiters', value: '120+' },
  ];

  const features = [
    {
      icon: 'school-outline',
      title: 'Smart Course Management',
      desc: 'Structured video lectures, PDF notes, and interactive quizzes in one unified hub.',
      color: '#F97316',
    },
    {
      icon: 'checkmark-done-circle-outline',
      title: 'Real-Time Attendance & Alerts',
      desc: 'Instant attendance calculation with automated shortage warnings and logs.',
      color: '#10B981',
    },
    {
      icon: 'briefcase-outline',
      title: 'Placement & Career Suite',
      desc: 'Aptitude test simulators, AI resume analyzer, mock interviews & corporate drives.',
      color: '#8B5CF6',
    },
    {
      icon: 'sparkles-outline',
      title: 'AI Academic Assistant',
      desc: '24/7 AI tutor for doubt clarification, formula recaps, and problem breakdowns.',
      color: '#EC4899',
    },
  ];

  const stakeholders = [
    { label: 'Students', desc: 'Assignments, courses, attendance & placement test engines', icon: 'person-outline', color: '#F97316' },
    { label: 'Faculty', desc: 'Attendance marking, coursework grading & lecture management', icon: 'easel-outline', color: '#10B981' },
    { label: 'HODs', desc: 'Department analytics, curriculum metrics & faculty workload', icon: 'pie-chart-outline', color: '#F59E0B' },
    { label: 'Administrators', desc: 'Campus broadcast circulars, user rosters & institutional reports', icon: 'shield-checkmark-outline', color: '#EF4444' },
  ];

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Top Navbar */}
      <View style={[styles.topBar, { borderBottomColor: theme.border }]}>
        <View style={styles.brandRow}>
          <View style={[styles.logoBadge, { backgroundColor: '#F97316' }]}>
            <Ionicons name="school" size={20} color="#FFFFFF" />
          </View>
          <Text style={[styles.brandTitle, { color: theme.textPrimary }]}>CampusLearn</Text>
          <Badge label="Expo SDK 54" variant="primary" size="sm" style={{ marginLeft: 8 }} />
        </View>

        <View style={styles.topActions}>
          <TouchableOpacity
            style={[styles.themeBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
            onPress={toggleTheme}
            activeOpacity={0.7}
          >
            <Ionicons
              name={themeMode === 'dark' ? 'sunny' : 'moon'}
              size={18}
              color={themeMode === 'dark' ? '#FBBF24' : '#F97316'}
            />
          </TouchableOpacity>
          <Button
            title="Sign In"
            variant="primary"
            size="small"
            onPress={onNavigateLogin}
          />
        </View>
      </View>

      {/* Hero Section */}
      <View style={[styles.heroSection, { paddingHorizontal: isLargeScreen ? spacing.xxl : spacing.md }]}>
        <View style={styles.heroBadgeRow}>
          <Badge label="✨ Android • iOS • Web" variant="primary" />
        </View>
        <Text style={[styles.heroHeading, { color: theme.textPrimary, fontSize: isLargeScreen ? 44 : 30 }]}>
          One Unified Platform for{' '}
          <Text style={{ color: '#F97316' }}>Academics, Attendance & Placements</Text>
        </Text>
        <Text style={[styles.heroSubtext, { color: theme.textSecondary, fontSize: isLargeScreen ? 18 : 15 }]}>
          Empowering modern universities with real-time academic workflows, AI tutoring, compliance tracking, and placement readiness.
        </Text>

        <View style={styles.heroBtnRow}>
          <Button
            title="Access Institutional Portal"
            variant="primary"
            size="large"
            icon={<Ionicons name="arrow-forward" size={18} color="#FFFFFF" />}
            onPress={onNavigateLogin}
          />
        </View>

        {/* Stakeholder Capabilities Overview */}
        <View style={styles.stakeholderGrid}>
          {stakeholders.map((s, i) => (
            <Card key={i} style={styles.stakeholderCard} variant="elevated">
              <View style={[styles.stakeholderIconCircle, { backgroundColor: `${s.color}20` }]}>
                <Ionicons name={s.icon as any} size={24} color={s.color} />
              </View>
              <Text style={[styles.stakeholderTitle, { color: theme.textPrimary }]}>{s.label}</Text>
              <Text style={[styles.stakeholderDesc, { color: theme.textSecondary }]}>{s.desc}</Text>
            </Card>
          ))}
        </View>
      </View>

      {/* Institutional Stats Banner */}
      <View style={[styles.statsBanner, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        {stats.map((st, i) => (
          <View key={i} style={styles.statCol}>
            <Text style={[styles.statBigVal, { color: '#F97316' }]}>{st.value}</Text>
            <Text style={[styles.statLabelText, { color: theme.textSecondary }]}>{st.label}</Text>
          </View>
        ))}
      </View>

      {/* Features Grid */}
      <View style={[styles.featuresSection, { backgroundColor: theme.background, borderTopColor: theme.border }]}>
        <Text style={[styles.sectionHeading, { color: theme.textPrimary }]}>
          Engineered for Modern Universities
        </Text>
        <Text style={[styles.sectionSub, { color: theme.textSecondary }]}>
          Everything your institution needs to accelerate student success, track attendance compliance, and streamline placements.
        </Text>

        <View style={styles.featuresGrid}>
          {features.map((f, i) => (
            <Card key={i} style={styles.featureCard}>
              <View style={[styles.featureIcon, { backgroundColor: `${f.color}15` }]}>
                <Ionicons name={f.icon as any} size={24} color={f.color} />
              </View>
              <Text style={[styles.featureTitle, { color: theme.textPrimary }]}>{f.title}</Text>
              <Text style={[styles.featureDesc, { color: theme.textSecondary }]}>{f.desc}</Text>
            </Card>
          ))}
        </View>
      </View>

      {/* Footer */}
      <View style={[styles.footer, { borderTopColor: theme.border }]}>
        <Text style={[styles.footerText, { color: theme.textMuted }]}>
          © 2026 CampusLearn Platform • Built with React Native (Expo SDK 54) for Android, iOS & Web
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoBadge: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  topActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  themeBtn: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroSection: {
    paddingVertical: spacing.xxl,
    alignItems: 'center',
    textAlign: 'center',
  },
  heroBadgeRow: {
    marginBottom: spacing.md,
  },
  heroHeading: {
    fontWeight: '900',
    textAlign: 'center',
    lineHeight: 48,
    maxWidth: 850,
    marginBottom: spacing.md,
  },
  heroSubtext: {
    textAlign: 'center',
    maxWidth: 680,
    lineHeight: 24,
    marginBottom: spacing.xl,
  },
  heroBtnRow: {
    marginBottom: spacing.xxl,
  },
  stakeholderGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.md,
    width: '100%',
    maxWidth: 1080,
  },
  stakeholderCard: {
    width: '100%',
    maxWidth: 250,
    padding: spacing.lg,
  },
  stakeholderIconCircle: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  stakeholderTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  stakeholderDesc: {
    fontSize: 12,
    lineHeight: 18,
  },
  statsBanner: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    borderTopWidth: 1,
    borderBottomWidth: 1,
  },
  statCol: {
    alignItems: 'center',
    padding: spacing.sm,
    minWidth: 140,
  },
  statBigVal: {
    fontSize: 28,
    fontWeight: '900',
  },
  statLabelText: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  featuresSection: {
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  sectionHeading: {
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
  },
  sectionSub: {
    fontSize: 15,
    textAlign: 'center',
    maxWidth: 600,
    marginBottom: spacing.xl,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.md,
    maxWidth: 1000,
  },
  featureCard: {
    width: '100%',
    maxWidth: 480,
    padding: spacing.lg,
  },
  featureIcon: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  featureDesc: {
    fontSize: 13,
    lineHeight: 20,
  },
  footer: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
    borderTopWidth: 1,
  },
  footerText: {
    fontSize: 12,
    textAlign: 'center',
  },
});
