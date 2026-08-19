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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../store/authStore';
import { darkTheme, lightTheme, spacing, borderRadius } from '../theme/theme';
import { Header } from '../components/common/Header';
import { Badge } from '../components/common/Badge';

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

import { Course, Role } from '../types';
import { MOCK_COURSES } from '../services/api';

export const RootNavigator: React.FC = () => {
  const { width } = useWindowDimensions();
  const { user, isAuthenticated, themeMode, logout } = useAuthStore();
  const theme = themeMode === 'dark' ? darkTheme : lightTheme;
  const isLargeScreen = width >= 768;

  // Navigation State
  const [authView, setAuthView] = useState<'landing' | 'login'>('landing');
  const [prefilledRole, setPrefilledRole] = useState<Role>('student');
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  // Tab definitions based on user role
  const getNavItems = () => {
    if (!user) return [];
    if (user.role === 'student') {
      return [
        { key: 'dashboard', label: 'Home', icon: 'home-outline', activeIcon: 'home' },
        { key: 'courses', label: 'Courses', icon: 'book-outline', activeIcon: 'book' },
        { key: 'assignments', label: 'Tasks', icon: 'document-text-outline', activeIcon: 'document-text' },
        { key: 'attendance', label: 'Attendance', icon: 'stats-chart-outline', activeIcon: 'stats-chart' },
        { key: 'placement', label: 'Placement', icon: 'briefcase-outline', activeIcon: 'briefcase' },
        { key: 'ai_assistant', label: 'AI Tutor', icon: 'sparkles-outline', activeIcon: 'sparkles' },
        { key: 'timetable', label: 'Timetable', icon: 'calendar-outline', activeIcon: 'calendar' },
        { key: 'profile', label: 'Profile', icon: 'person-outline', activeIcon: 'person' },
      ];
    } else if (user.role === 'faculty') {
      return [
        { key: 'dashboard', label: 'Overview', icon: 'grid-outline', activeIcon: 'grid' },
        { key: 'faculty_attendance', label: 'Roll Call', icon: 'checkbox-outline', activeIcon: 'checkbox' },
        { key: 'faculty_assignments', label: 'Grading', icon: 'clipboard-outline', activeIcon: 'clipboard' },
        { key: 'timetable', label: 'Schedule', icon: 'calendar-outline', activeIcon: 'calendar' },
        { key: 'profile', label: 'Profile', icon: 'person-outline', activeIcon: 'person' },
      ];
    } else if (user.role === 'hod') {
      return [
        { key: 'dashboard', label: 'Department', icon: 'pie-chart-outline', activeIcon: 'pie-chart' },
        { key: 'admin_announcements', label: 'Circulars', icon: 'megaphone-outline', activeIcon: 'megaphone' },
        { key: 'timetable', label: 'Timetable', icon: 'calendar-outline', activeIcon: 'calendar' },
        { key: 'profile', label: 'Profile', icon: 'person-outline', activeIcon: 'person' },
      ];
    } else {
      // admin
      return [
        { key: 'dashboard', label: 'Institute', icon: 'business-outline', activeIcon: 'business' },
        { key: 'admin_users', label: 'Users', icon: 'people-outline', activeIcon: 'people' },
        { key: 'admin_announcements', label: 'Broadcasts', icon: 'megaphone-outline', activeIcon: 'megaphone' },
        { key: 'profile', label: 'Settings', icon: 'settings-outline', activeIcon: 'settings' },
      ];
    }
  };

  const navItems = getNavItems();

  const handleTabChange = (key: string, params?: any) => {
    if (key === 'course_detail' && params?.courseId) {
      const found = MOCK_COURSES.find((c) => c._id === params.courseId);
      if (found) setSelectedCourse(found);
    }
    setActiveTab(key);
  };

  // Render Screen Content
  const renderScreenContent = () => {
    // If on course detail
    if (activeTab === 'course_detail' && selectedCourse) {
      return (
        <CourseDetailScreen
          course={selectedCourse}
          onBack={() => setActiveTab('courses')}
        />
      );
    }

    // Role-based main screen dispatcher
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
          return <StudentProfileScreen onLogout={() => setAuthView('landing')} />;
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
          return <StudentProfileScreen onLogout={() => setAuthView('landing')} />;
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
          return <StudentProfileScreen onLogout={() => setAuthView('landing')} />;
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
          return <StudentProfileScreen onLogout={() => setAuthView('landing')} />;
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
            initialRole={prefilledRole}
            onBackToLanding={() => setAuthView('landing')}
            onSuccess={() => setActiveTab('dashboard')}
          />
        </SafeAreaView>
      );
    }
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
        <LandingScreen
          onNavigateLogin={(role) => {
            if (role) setPrefilledRole(role);
            setAuthView('login');
          }}
        />
      </SafeAreaView>
    );
  }

  // Authenticated Multi-Platform Shell
  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={themeMode === 'dark' ? 'light-content' : 'dark-content'} />

      {/* Top Header */}
      <Header />

      <View style={styles.mainShell}>
        {/* Desktop Sidebar Navigation (Visible on Large Screens / Desktop Web) */}
        {isLargeScreen && (
          <View style={[styles.sidebar, { backgroundColor: theme.surface, borderRightColor: theme.border }]}>
            <View style={styles.sidebarBrand}>
              <View style={[styles.sidebarLogo, { backgroundColor: theme.primary }]}>
                <Ionicons name="school" size={20} color="#FFFFFF" />
              </View>
              <View>
                <Text style={[styles.sidebarTitle, { color: theme.textPrimary }]}>CampusLearn</Text>
                <Text style={[styles.sidebarRole, { color: theme.textSecondary }]}>
                  {user.role.toUpperCase()} PORTAL
                </Text>
              </View>
            </View>

            <ScrollView style={styles.sidebarScroll} contentContainerStyle={styles.sidebarList}>
              {navItems.map((item) => {
                const isActive = activeTab === item.key;
                return (
                  <TouchableOpacity
                    key={item.key}
                    style={[
                      styles.sidebarItem,
                      isActive && { backgroundColor: theme.primaryLight, borderColor: theme.primary },
                    ]}
                    onPress={() => setActiveTab(item.key)}
                    activeOpacity={0.8}
                  >
                    <Ionicons
                      name={(isActive ? item.activeIcon : item.icon) as any}
                      size={20}
                      color={isActive ? theme.primary : theme.textSecondary}
                    />
                    <Text
                      style={[
                        styles.sidebarItemText,
                        { color: isActive ? theme.primary : theme.textPrimary },
                        isActive && { fontWeight: '700' },
                      ]}
                    >
                      {item.label}
                    </Text>
                    {isActive && (
                      <View style={[styles.activeIndicator, { backgroundColor: theme.primary }]} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Sidebar Footer */}
            <View style={[styles.sidebarFooter, { borderTopColor: theme.border }]}>
              <TouchableOpacity
                style={styles.sidebarLogoutBtn}
                onPress={() => {
                  logout();
                  setAuthView('landing');
                }}
              >
                <Ionicons name="log-out-outline" size={18} color="#EF4444" />
                <Text style={styles.sidebarLogoutText}>Sign Out</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Content Area */}
        <View style={styles.contentArea}>{renderScreenContent()}</View>
      </View>

      {/* Mobile Bottom Tab Bar (Visible on Mobile Screens / Android / iOS) */}
      {!isLargeScreen && (
        <View style={[styles.bottomTabBar, { backgroundColor: theme.tabBar, borderTopColor: theme.tabBarBorder }]}>
          {navItems.slice(0, 5).map((item) => {
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
                  color={isActive ? theme.primary : theme.textMuted}
                />
                <Text
                  style={[
                    styles.tabBtnText,
                    { color: isActive ? theme.primary : theme.textMuted },
                    isActive && { fontWeight: '700' },
                  ]}
                >
                  {item.label}
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
    width: 240,
    borderRightWidth: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  sidebarBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: 10,
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
    paddingVertical: spacing.sm,
    gap: 4,
  },
  sidebarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
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
    height: 18,
    borderRadius: 2,
  },
  sidebarFooter: {
    padding: spacing.md,
    borderTopWidth: 1,
  },
  sidebarLogoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sidebarLogoutText: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: '600',
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
