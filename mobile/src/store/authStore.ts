import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, Role, ThemeMode } from '../types';

export const DEMO_USERS: Record<Role, User> = {
  student: {
    _id: 'student_001',
    name: 'Aarav Sharma',
    email: 'student@campuslearn.edu',
    role: 'student',
    rollNumber: 'CS2024-042',
    department: 'Computer Science & Engineering',
    semester: 6,
    year: 3,
    streak: 14,
    points: 1250,
    badges: ['Code Master', '7-Day Streak', 'Top Quizzer', 'Early Submitter'],
    attendanceRate: 82.5,
    enrolledCourses: ['CS301', 'CS302', 'CS303', 'CS304'],
  },
  faculty: {
    _id: 'faculty_001',
    name: 'Dr. Priya Ramanathan',
    email: 'priya.cs@campuslearn.edu',
    role: 'faculty',
    employeeId: 'FAC-2018-09',
    department: 'Computer Science & Engineering',
    designation: 'Associate Professor',
    streak: 28,
    points: 3400,
    badges: ['Distinguished Educator', '100+ Lectures', 'Research Mentor'],
    teachingCourses: ['CS301', 'CS304', 'CS502'],
  },
  hod: {
    _id: 'hod_001',
    name: 'Prof. Rajesh Kulkarni',
    email: 'hod.cs@campuslearn.edu',
    role: 'hod',
    employeeId: 'HOD-CS-01',
    department: 'Computer Science & Engineering',
    designation: 'Head of Department & Professor',
    streak: 45,
    points: 5200,
    badges: ['Department Leader', 'Excellence Award', 'Academic Board'],
  },
  admin: {
    _id: 'admin_001',
    name: 'Institute Administrator',
    email: 'admin@campuslearn.edu',
    role: 'admin',
    employeeId: 'ADM-CENTRAL-01',
    designation: 'System Administrator',
    streak: 60,
    points: 9999,
    badges: ['Super Admin', 'Security Lead'],
  },
};

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  themeMode: ThemeMode;
  isLoading: boolean;
  unreadNotifications: number;
  
  // Actions
  loginAsRole: (role: Role) => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<boolean>;
  logout: () => Promise<void>;
  toggleTheme: () => void;
  setThemeMode: (mode: ThemeMode) => void;
  updateUserProfile: (updates: Partial<User>) => void;
  initSession: () => Promise<void>;
  markNotificationsAsRead: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: DEMO_USERS.student, // Default active demo user for instant accessibility
  token: 'mock_jwt_token_campuslearn',
  isAuthenticated: true,
  themeMode: 'dark',
  isLoading: false,
  unreadNotifications: 3,

  initSession: async () => {
    try {
      const savedUser = await AsyncStorage.getItem('@campuslearn_user');
      const savedTheme = await AsyncStorage.getItem('@campuslearn_theme');
      
      if (savedTheme) {
        set({ themeMode: savedTheme as ThemeMode });
      }
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        set({ user: parsed, isAuthenticated: true, token: 'mock_jwt_token' });
      }
    } catch (e) {
      console.log('Error initializing session:', e);
    }
  },

  loginAsRole: async (role: Role) => {
    set({ isLoading: true });
    const selectedUser = DEMO_USERS[role];
    try {
      await AsyncStorage.setItem('@campuslearn_user', JSON.stringify(selectedUser));
    } catch (e) {}
    setTimeout(() => {
      set({
        user: selectedUser,
        token: `mock_jwt_${role}`,
        isAuthenticated: true,
        isLoading: false,
      });
    }, 300);
  },

  loginWithEmail: async (email: string, pass: string) => {
    set({ isLoading: true });
    // Determine matching role or default
    let matchedRole: Role = 'student';
    if (email.includes('faculty') || email.includes('prof')) matchedRole = 'faculty';
    else if (email.includes('hod')) matchedRole = 'hod';
    else if (email.includes('admin')) matchedRole = 'admin';

    const selectedUser = DEMO_USERS[matchedRole];
    try {
      await AsyncStorage.setItem('@campuslearn_user', JSON.stringify(selectedUser));
    } catch (e) {}

    return new Promise((resolve) => {
      setTimeout(() => {
        set({
          user: selectedUser,
          token: `mock_jwt_${matchedRole}`,
          isAuthenticated: true,
          isLoading: false,
        });
        resolve(true);
      }, 400);
    });
  },

  logout: async () => {
    try {
      await AsyncStorage.removeItem('@campuslearn_user');
    } catch (e) {}
    set({
      user: null,
      token: null,
      isAuthenticated: false,
    });
  },

  toggleTheme: () => {
    const nextMode = get().themeMode === 'dark' ? 'light' : 'dark';
    try {
      AsyncStorage.setItem('@campuslearn_theme', nextMode);
    } catch (e) {}
    set({ themeMode: nextMode });
  },

  setThemeMode: (mode: ThemeMode) => {
    try {
      AsyncStorage.setItem('@campuslearn_theme', mode);
    } catch (e) {}
    set({ themeMode: mode });
  },

  updateUserProfile: (updates: Partial<User>) => {
    const current = get().user;
    if (!current) return;
    const updated = { ...current, ...updates };
    try {
      AsyncStorage.setItem('@campuslearn_user', JSON.stringify(updated));
    } catch (e) {}
    set({ user: updated });
  },

  markNotificationsAsRead: () => {
    set({ unreadNotifications: 0 });
  },
}));
