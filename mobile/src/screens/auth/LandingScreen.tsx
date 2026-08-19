import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { darkTheme, lightTheme, spacing, borderRadius } from '../../theme/theme';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Role } from '../../types';

interface LandingScreenProps {
  onNavigateLogin: (prefilledRole?: Role) => void;
}

export const LandingScreen: React.FC<LandingScreenProps> = ({ onNavigateLogin }) => {
  const { width } = useWindowDimensions();
  const { themeMode, toggleTheme } = useAuthStore();
  const theme = themeMode === 'dark' ? darkTheme : lightTheme;
  const isLargeScreen = width >= 768;

  const features = [
    {
      icon: 'school-outline',
      title: 'Smart Course Management',
      desc: 'Structured video lectures, PDF notes, and interactive quizzes in one unified hub.',
      color: '#6366F1',
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
      color: '#F59E0B',
    },
    {
      icon: 'sparkles-outline',
      title: 'AI Academic Assistant',
      desc: '24/7 AI tutor for doubt clarification, formula recaps, and problem breakdowns.',
      color: '#EC4899',
    },
  ];

  const rolePills: { role: Role; label: string; desc: string; icon: keyof typeof Ionicons.glyphMap; color: string }[] = [
    { role: 'student', label: 'Student Hub', desc: 'Assignments, courses, attendance & placement tests', icon: 'person-outline', color: '#38BDF8' },
    { role: 'faculty', label: 'Faculty Portal', desc: 'Attendance marking, assignment grading & course creation', icon: 'easel-outline', color: '#818CF8' },
    { role: 'hod', label: 'HOD Analytics', desc: 'Department oversight, faculty workload & student reports', icon: 'pie-chart-outline', color: '#F59E0B' },
    { role: 'admin', label: 'Institute Admin', desc: 'Campus broadcasts, user rosters & institutional metrics', icon: 'shield-checkmark-outline', color: '#EF4444' },
  ];

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Top Bar */}
      <View style={[styles.topBar, { borderBottomColor: theme.border }]}>
        <View style={styles.brandRow}>
          <View style={[styles.logoBadge, { backgroundColor: theme.primary }]}>
            <Ionicons name="school" size={20} color="#FFFFFF" />
          </View>
          <Text style={[styles.brandTitle, { color: theme.textPrimary }]}>CampusLearn</Text>
          <Badge label="Universal React Native" variant="primary" size="sm" style={{ marginLeft: 8 }} />
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
              color={themeMode === 'dark' ? '#FBBF24' : '#6366F1'}
            />
          </TouchableOpacity>
          <Button
            title="Sign In"
            variant="primary"
            size="small"
            onPress={() => onNavigateLogin()}
          />
        </View>
      </View>

      {/* Hero Section */}
      <View style={[styles.heroSection, { paddingHorizontal: isLargeScreen ? spacing.xxl : spacing.md }]}>
        <View style={styles.heroBadgeRow}>
          <Badge label="✨ Multi-Platform: Android • iOS • Web" variant="info" />
        </View>
        <Text style={[styles.heroHeading, { color: theme.textPrimary, fontSize: isLargeScreen ? 44 : 30 }]}>
          One Unified Platform for{' '}
          <Text style={{ color: theme.primary }}>Academics, Attendance & Placements</Text>
        </Text>
        <Text style={[styles.heroSubtext, { color: theme.textSecondary, fontSize: isLargeScreen ? 18 : 15 }]}>
          Replace scattered WhatsApp groups and chaotic emails. CampusLearn streamlines academic workflows for Students, Faculty, HODs, and Administrators.
        </Text>

        {/* 1-Tap Quick Explore Role Cards */}
        <View style={styles.roleGrid}>
          {rolePills.map((p) => (
            <Card
              key={p.role}
              style={styles.roleCard}
              onPress={() => onNavigateLogin(p.role)}
              variant="elevated"
            >
              <View style={[styles.roleIconCircle, { backgroundColor: `${p.color}20` }]}>
                <Ionicons name={p.icon} size={24} color={p.color} />
              </View>
              <Text style={[styles.roleCardTitle, { color: theme.textPrimary }]}>{p.label}</Text>
              <Text style={[styles.roleCardDesc, { color: theme.textSecondary }]}>{p.desc}</Text>
              <View style={styles.launchRow}>
                <Text style={[styles.launchText, { color: p.color }]}>Enter as {p.role.toUpperCase()}</Text>
                <Ionicons name="arrow-forward" size={14} color={p.color} />
              </View>
            </Card>
          ))}
        </View>
      </View>

      {/* Features Grid */}
      <View style={[styles.featuresSection, { backgroundColor: theme.surface, borderTopColor: theme.border }]}>
        <Text style={[styles.sectionHeading, { color: theme.textPrimary }]}>
          Engineered for Modern Universities
        </Text>
        <Text style={[styles.sectionSub, { color: theme.textSecondary }]}>
          Everything your institution needs to accelerate student success and simplify governance.
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
          © 2026 CampusLearn Platform • Built with React Native & Expo for Android, iOS & Web
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
  roleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.md,
    width: '100%',
    maxWidth: 1080,
  },
  roleCard: {
    width: '100%',
    maxWidth: 250,
    padding: spacing.lg,
  },
  roleIconCircle: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  roleCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  roleCardDesc: {
    fontSize: 12,
    lineHeight: 18,
    marginBottom: spacing.md,
    flex: 1,
  },
  launchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  launchText: {
    fontSize: 12,
    fontWeight: '700',
  },
  featuresSection: {
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    borderTopWidth: 1,
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
