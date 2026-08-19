import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, Role, ThemeMode } from '../types';
import { authAPI, setServerUrl, initApiConfig, getServerUrl } from '../services/api';

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
  serverUrl: string;
  isBackendConnected: boolean;
  
  // Actions
  loginAsRole: (role: Role) => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<boolean>;
  logout: () => Promise<void>;
  toggleTheme: () => void;
  setThemeMode: (mode: ThemeMode) => void;
  updateUserProfile: (updates: Partial<User>) => void;
  initSession: () => Promise<void>;
  updateServerUrl: (url: string) => Promise<void>;
  markNotificationsAsRead: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: DEMO_USERS.student,
  token: 'mock_jwt_token_campuslearn',
  isAuthenticated: true,
  themeMode: 'dark',
  isLoading: false,
  unreadNotifications: 3,
  serverUrl: getServerUrl(),
  isBackendConnected: true,

  initSession: async () => {
    try {
      const activeUrl = await initApiConfig();
      set({ serverUrl: activeUrl });

      const savedUser = await AsyncStorage.getItem('@campuslearn_user');
      const savedToken = await AsyncStorage.getItem('@campuslearn_token');
      const savedTheme = await AsyncStorage.getItem('@campuslearn_theme');
      
      if (savedTheme) {
        set({ themeMode: savedTheme as ThemeMode });
      }
      if (savedUser && savedToken) {
        set({ user: JSON.parse(savedUser), token: savedToken, isAuthenticated: true });
        
        // Attempt live profile sync from MongoDB
        try {
          const { data } = await authAPI.getMe();
          if (data?.data) {
            set({ user: data.data, isBackendConnected: true });
            await AsyncStorage.setItem('@campuslearn_user', JSON.stringify(data.data));
          }
        } catch (err) {
          // Backend offline or local fallback
          console.log('Using cached session:', err);
        }
      }
    } catch (e) {
      console.log('Error initializing session:', e);
    }
  },

  loginAsRole: async (role: Role) => {
    set({ isLoading: true });
    const selectedUser = DEMO_USERS[role];

    // Attempt live backend login with default institutional credentials
    try {
      const res = await authAPI.login(selectedUser.email, 'CampusLearn@123');
      if (res.data?.data) {
        const { user, accessToken, refreshToken } = res.data.data;
        await AsyncStorage.setItem('@campuslearn_user', JSON.stringify(user));
        await AsyncStorage.setItem('@campuslearn_token', accessToken);
        if (refreshToken) {
          await AsyncStorage.setItem('@campuslearn_refresh_token', refreshToken);
        }
        set({
          user,
          token: accessToken,
          isAuthenticated: true,
          isLoading: false,
          isBackendConnected: true,
        });
        return;
      }
    } catch (e) {
      console.log('Live backend login fallback to demo:', e);
    }

    // Fallback to demo profile
    try {
      await AsyncStorage.setItem('@campuslearn_user', JSON.stringify(selectedUser));
      await AsyncStorage.setItem('@campuslearn_token', `mock_jwt_${role}`);
    } catch (e) {}

    setTimeout(() => {
      set({
        user: selectedUser,
        token: `mock_jwt_${role}`,
        isAuthenticated: true,
        isLoading: false,
      });
    }, 200);
  },

  loginWithEmail: async (email: string, pass: string) => {
    set({ isLoading: true });
    try {
      const res = await authAPI.login(email, pass);
      if (res.data?.data) {
        const { user, accessToken, refreshToken } = res.data.data;
        await AsyncStorage.setItem('@campuslearn_user', JSON.stringify(user));
        await AsyncStorage.setItem('@campuslearn_token', accessToken);
        if (refreshToken) {
          await AsyncStorage.setItem('@campuslearn_refresh_token', refreshToken);
        }
        set({
          user,
          token: accessToken,
          isAuthenticated: true,
          isLoading: false,
          isBackendConnected: true,
        });
        return true;
      }
    } catch (e) {
      console.log('Live auth failed, attempting role fallback:', e);
    }

    // Role matching fallback
    let matchedRole: Role = 'student';
    if (email.includes('faculty') || email.includes('prof')) matchedRole = 'faculty';
    else if (email.includes('hod')) matchedRole = 'hod';
    else if (email.includes('admin')) matchedRole = 'admin';

    const selectedUser = DEMO_USERS[matchedRole];
    try {
      await AsyncStorage.setItem('@campuslearn_user', JSON.stringify(selectedUser));
      await AsyncStorage.setItem('@campuslearn_token', `mock_jwt_${matchedRole}`);
    } catch (e) {}

    set({
      user: selectedUser,
      token: `mock_jwt_${matchedRole}`,
      isAuthenticated: true,
      isLoading: false,
    });
    return true;
  },

  logout: async () => {
    try {
      await authAPI.logout();
    } catch (e) {}
    try {
      await AsyncStorage.removeItem('@campuslearn_user');
      await AsyncStorage.removeItem('@campuslearn_token');
      await AsyncStorage.removeItem('@campuslearn_refresh_token');
    } catch (e) {}
    set({
      user: null,
      token: null,
      isAuthenticated: false,
    });
  },

  updateServerUrl: async (newUrl: string) => {
    await setServerUrl(newUrl);
    set({ serverUrl: newUrl });
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
