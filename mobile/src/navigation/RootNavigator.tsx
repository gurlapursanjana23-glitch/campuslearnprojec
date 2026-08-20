import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  useWindowDimensions,
  SafeAreaView,
  Platform,
  StatusBar,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../store/authStore';
import { darkTheme, lightTheme, spacing, borderRadius } from '../theme/theme';
import { Header } from '../components/common/Header';

// Screens
import { LandingScreen } from '../screens/auth/LandingScreen';
import { LoginScreen } from '../screens/auth/LoginScreen';

// Student Screens
import { StudentDashboardScreen } from '../screens/student/StudentDashboardScreen';
import { StudentCoursesScreen } from '../screens/student/StudentCoursesScreen';
import { CourseDetailScreen } from '../screens/student/CourseDetailScreen';
import { StudentAssignmentsScreen } from '../screens/student/StudentAssignmentsScreen';
import { StudentAttendanceScreen } from '../screens/student/StudentAttendanceScreen';
import { PlacementPrepScreen } from '../screens/student/PlacementPrepScreen';
import { AIAssistantScreen } from '../screens/student/AIAssistantScreen';
import { TimetableScreen } from '../screens/student/TimetableScreen';
import { StudentProfileScreen } from '../screens/student/StudentProfileScreen';

// Faculty Screens
import { FacultyDashboardScreen } from '../screens/faculty/FacultyDashboardScreen';
import { FacultyAttendanceScreen } from '../screens/faculty/FacultyAttendanceScreen';
import { FacultyAssignmentsScreen } from '../screens/faculty/FacultyAssignmentsScreen';

// Admin & HOD Screens
import { AdminDashboardScreen } from '../screens/admin/AdminDashboardScreen';
import { AdminUsersScreen } from '../screens/admin/AdminUsersScreen';
import { AdminAnnouncementsScreen } from '../screens/admin/AdminAnnouncementsScreen';
import { HODAnalyticsScreen } from '../screens/admin/HODAnalyticsScreen';

import { Course } from '../types';
import { MOCK_COURSES } from '../services/api';

interface NavSection {
  sectionTitle?: string;
  items: {
    key: string;
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
    activeIcon: keyof typeof Ionicons.glyphMap;
  }[];
}

export const RootNavigator: React.FC = () => {
  const { width } = useWindowDimensions();
  const { user, isAuthenticated, themeMode, logout } = useAuthStore();
  const theme = themeMode === 'dark' ? darkTheme : lightTheme;
  const isLargeScreen = width >= 768;

  // Navigation State
  const [authView, setAuthView] = useState<'landing' | 'login'>('landing');
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  // Grouped Navigation Sections matching Web App Layout
  const getNavSections = (): NavSection[] => {
    if (!user) return [];

    if (user.role === 'student') {
      return [
        {
          sectionTitle: 'MAIN',
          items: [
            { key: 'dashboard', label: 'Home Dashboard', icon: 'home-outline', activeIcon: 'home' },
          ],
        },
        {
          sectionTitle: 'ACADEMICS & TASKS',
          items: [
            { key: 'courses', label: 'My Courses', icon: 'book-outline', activeIcon: 'book' },
            { key: 'assignments', label: 'Assignments', icon: 'document-text-outline', activeIcon: 'document-text' },
            { key: 'attendance', label: 'Attendance & Alerts', icon: 'stats-chart-outline', activeIcon: 'stats-chart' },
            { key: 'timetable', label: 'Schedule Matrix', icon: 'calendar-outline', activeIcon: 'calendar' },
          ],
        },
        {
          sectionTitle: 'CAREER & AI',
          items: [
            { key: 'placement', label: 'Placement Suite', icon: 'briefcase-outline', activeIcon: 'briefcase' },
            { key: 'ai_assistant', label: 'Campus AI Tutor', icon: 'sparkles-outline', activeIcon: 'sparkles' },
          ],
        },
        {
          sectionTitle: 'ACCOUNT',
          items: [
            { key: 'profile', label: 'Profile & Settings', icon: 'person-outline', activeIcon: 'person' },
          ],
        },
      ];
    } else if (user.role === 'faculty') {
      return [
        {
          sectionTitle: 'FACULTY HUB',
          items: [
            { key: 'dashboard', label: 'Faculty Overview', icon: 'grid-outline', activeIcon: 'grid' },
            { key: 'faculty_attendance', label: 'Class Roll Call', icon: 'checkbox-outline', activeIcon: 'checkbox' },
            { key: 'faculty_assignments', label: 'Coursework Grading', icon: 'clipboard-outline', activeIcon: 'clipboard' },
            { key: 'timetable', label: 'Teaching Schedule', icon: 'calendar-outline', activeIcon: 'calendar' },
          ],
        },
        {
          sectionTitle: 'ACCOUNT',
          items: [
            { key: 'profile', label: 'Profile & Preferences', icon: 'person-outline', activeIcon: 'person' },
          ],
        },
      ];
    } else if (user.role === 'hod') {
      return [
        {
          sectionTitle: 'DEPARTMENT',
          items: [
            { key: 'dashboard', label: 'HOD Analytics', icon: 'pie-chart-outline', activeIcon: 'pie-chart' },
            { key: 'admin_announcements', label: 'Department Circulars', icon: 'megaphone-outline', activeIcon: 'megaphone' },
            { key: 'timetable', label: 'Class Schedules', icon: 'calendar-outline', activeIcon: 'calendar' },
          ],
        },
        {
          sectionTitle: 'ACCOUNT',
          items: [
            { key: 'profile', label: 'Profile', icon: 'person-outline', activeIcon: 'person' },
          ],
        },
      ];
    } else {
      // admin
      return [
        {
          sectionTitle: 'ADMINISTRATION',
          items: [
            { key: 'dashboard', label: 'Institute Overview', icon: 'business-outline', activeIcon: 'business' },
            { key: 'admin_users', label: 'User Directory', icon: 'people-outline', activeIcon: 'people' },
            { key: 'admin_announcements', label: 'Broadcast Center', icon: 'megaphone-outline', activeIcon: 'megaphone' },
          ],
        },
        {
          sectionTitle: 'SYSTEM',
          items: [
            { key: 'profile', label: 'Settings', icon: 'settings-outline', activeIcon: 'settings' },
          ],
        },
      ];
    }
  };

  const navSections = getNavSections();

  // Flattened list for mobile bottom bar
  const flatNavItems = navSections.flatMap((s) => s.items);

  const handleTabChange = (key: string, params?: any) => {
    if (key === 'course_detail' && params?.courseId) {
      const found = MOCK_COURSES.find((c) => c._id === params.courseId);
      if (found) setSelectedCourse(found);
    }
    setActiveTab(key);
  };

  const handleConfirmLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
          setAuthView('landing');
        },
      },
    ]);
  };

  // Render Screen Content
  const renderScreenContent = () => {
    if (activeTab === 'course_detail' && selectedCourse) {
      return (
        <CourseDetailScreen
          course={selectedCourse}
          onBack={() => setActiveTab('courses')}
        />
      );
    }

    if (user?.role === 'student') {
      switch (activeTab) {
        case 'dashboard':
          return <StudentDashboardScreen onNavigateTab={handleTabChange} />;
        case 'courses':
          return (
            <StudentCoursesScreen
              onSelectCourse={(course) => {
                setSelectedCourse(course);
                setActiveTab('course_detail');
              }}
            />
          );
        case 'assignments':
          return <StudentAssignmentsScreen />;
        case 'attendance':
          return <StudentAttendanceScreen />;
        case 'placement':
          return <PlacementPrepScreen />;
        case 'ai_assistant':
          return <AIAssistantScreen />;
        case 'timetable':
          return <TimetableScreen />;
        case 'profile':
          return <StudentProfileScreen onLogout={handleConfirmLogout} />;
        default:
          return <StudentDashboardScreen onNavigateTab={handleTabChange} />;
      }
    } else if (user?.role === 'faculty') {
      switch (activeTab) {
        case 'dashboard':
          return <FacultyDashboardScreen onNavigateTab={handleTabChange} />;
        case 'faculty_attendance':
          return <FacultyAttendanceScreen />;
        case 'faculty_assignments':
          return <FacultyAssignmentsScreen />;
        case 'timetable':
          return <TimetableScreen />;
        case 'profile':
          return <StudentProfileScreen onLogout={handleConfirmLogout} />;
        default:
          return <FacultyDashboardScreen onNavigateTab={handleTabChange} />;
      }
    } else if (user?.role === 'hod') {
      switch (activeTab) {
        case 'dashboard':
          return <HODAnalyticsScreen />;
        case 'admin_announcements':
          return <AdminAnnouncementsScreen />;
        case 'timetable':
          return <TimetableScreen />;
        case 'profile':
          return <StudentProfileScreen onLogout={handleConfirmLogout} />;
        default:
          return <HODAnalyticsScreen />;
      }
    } else {
      // admin
      switch (activeTab) {
        case 'dashboard':
          return <AdminDashboardScreen onNavigateTab={handleTabChange} />;
        case 'admin_users':
          return <AdminUsersScreen />;
        case 'admin_announcements':
          return <AdminAnnouncementsScreen />;
        case 'profile':
          return <StudentProfileScreen onLogout={handleConfirmLogout} />;
        default:
          return <AdminDashboardScreen onNavigateTab={handleTabChange} />;
      }
    }
  };

  // If Not Authenticated -> Show Landing or Login
  if (!isAuthenticated || !user) {
    if (authView === 'login') {
      return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
          <LoginScreen
            onBackToLanding={() => setAuthView('landing')}
            onSuccess={() => setActiveTab('dashboard')}
          />
        </SafeAreaView>
      );
    }
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
        <LandingScreen
          onNavigateLogin={() => setAuthView('login')}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={themeMode === 'dark' ? 'light-content' : 'dark-content'} />

      {/* Top Header */}
      <Header />

      <View style={styles.mainShell}>
        {/* Desktop Sidebar Navigation matching Web App */}
        {isLargeScreen && (
          <View style={[styles.sidebar, { backgroundColor: theme.surface, borderRightColor: theme.border }]}>
            {/* Sidebar Brand Header */}
            <View style={styles.sidebarBrand}>
              <View style={[styles.sidebarLogo, { backgroundColor: '#F97316' }]}>
                <Ionicons name="school" size={20} color="#FFFFFF" />
              </View>
              <View>
                <Text style={[styles.sidebarTitle, { color: theme.textPrimary }]}>CampusLearn</Text>
                <Text style={[styles.sidebarRole, { color: '#F97316' }]}>
                  {user.role.toUpperCase()} PORTAL
                </Text>
              </View>
            </View>

            {/* Sidebar Grouped Navigation */}
            <ScrollView style={styles.sidebarScroll} contentContainerStyle={styles.sidebarList}>
              {navSections.map((sec, secIdx) => (
                <View key={secIdx} style={styles.sectionGroup}>
                  {sec.sectionTitle && (
                    <Text style={[styles.sectionTitleLabel, { color: theme.textMuted }]}>
                      {sec.sectionTitle}
                    </Text>
                  )}

                  {sec.items.map((item) => {
                    const isActive = activeTab === item.key;
                    return (
                      <TouchableOpacity
                        key={item.key}
                        style={[
                          styles.sidebarItem,
                          isActive && {
                            backgroundColor: 'rgba(249, 115, 22, 0.12)',
                            borderColor: '#F97316',
                          },
                        ]}
                        onPress={() => setActiveTab(item.key)}
                        activeOpacity={0.8}
                      >
                        <Ionicons
                          name={(isActive ? item.activeIcon : item.icon) as any}
                          size={18}
                          color={isActive ? '#F97316' : theme.textSecondary}
                        />
                        <Text
                          style={[
                            styles.sidebarItemText,
                            { color: isActive ? '#F97316' : theme.textPrimary },
                            isActive && { fontWeight: '700' },
                          ]}
                        >
                          {item.label}
                        </Text>
                        {isActive && (
                          <View style={[styles.activeIndicator, { backgroundColor: '#F97316' }]} />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ))}
            </ScrollView>

            {/* Sidebar User Footer */}
            <View style={[styles.sidebarFooter, { borderTopColor: theme.border, backgroundColor: theme.surface }]}>
              <View style={styles.userFooterRow}>
                <View style={[styles.avatarDot, { backgroundColor: '#F97316' }]}>
                  <Text style={styles.avatarDotText}>{user.name.charAt(0)}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.footerUserName, { color: theme.textPrimary }]} numberOfLines={1}>
                    {user.name}
                  </Text>
                  <Text style={[styles.footerUserRole, { color: theme.textMuted }]}>
                    {user.role}
                  </Text>
                </View>
                <TouchableOpacity onPress={handleConfirmLogout} activeOpacity={0.7}>
                  <Ionicons name="log-out-outline" size={20} color="#EF4444" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* Content Area */}
        <View style={styles.contentArea}>{renderScreenContent()}</View>
      </View>

      {/* Mobile Bottom Tab Bar (Visible on Phones) */}
      {!isLargeScreen && (
        <View style={[styles.bottomTabBar, { backgroundColor: theme.tabBar, borderTopColor: theme.tabBarBorder }]}>
          {flatNavItems.slice(0, 5).map((item) => {
            const isActive = activeTab === item.key;
            return (
              <TouchableOpacity
                key={item.key}
                style={styles.tabBtn}
                onPress={() => setActiveTab(item.key)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={(isActive ? item.activeIcon : item.icon) as any}
                  size={22}
                  color={isActive ? '#F97316' : theme.textMuted}
                />
                <Text
                  style={[
                    styles.tabBtnText,
                    { color: isActive ? '#F97316' : theme.textMuted },
                    isActive && { fontWeight: '700' },
                  ]}
                >
                  {item.label.split(' ')[0]}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  mainShell: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebar: {
    width: 250,
    borderRightWidth: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  sidebarBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  sidebarLogo: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sidebarTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  sidebarRole: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  sidebarScroll: {
    flex: 1,
  },
  sidebarList: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  sectionGroup: {
    gap: 4,
  },
  sectionTitleLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
    paddingHorizontal: spacing.sm,
    marginBottom: 4,
  },
  sidebarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: 'transparent',
    gap: 10,
    position: 'relative',
  },
  sidebarItemText: {
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  activeIndicator: {
    width: 4,
    height: 16,
    borderRadius: 2,
  },
  sidebarFooter: {
    padding: spacing.md,
    borderTopWidth: 1,
  },
  userFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatarDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarDotText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  footerUserName: {
    fontSize: 13,
    fontWeight: '700',
  },
  footerUserRole: {
    fontSize: 11,
    textTransform: 'capitalize',
  },
  contentArea: {
    flex: 1,
  },
  bottomTabBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    height: 60,
    borderTopWidth: 1,
    paddingBottom: Platform.OS === 'ios' ? 12 : 4,
    paddingTop: 6,
  },
  tabBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  tabBtnText: {
    fontSize: 10,
    marginTop: 2,
  },
});
