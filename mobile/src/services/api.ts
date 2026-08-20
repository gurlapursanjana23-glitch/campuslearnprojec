import axios, { AxiosInstance } from 'axios';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Course,
  Assignment,
  AttendanceRecord,
  QuizQuestion,
  PlacementOpportunity,
  Announcement,
  TimetableSlot,
} from '../types';

// Default base URL determination
// Physical phone uses the PC's Wi-Fi IP address (10.185.107.20), Web uses localhost
export const DEFAULT_API_URL = Platform.select({
  web: 'http://localhost:5001/api',
  android: 'http://10.185.107.20:5001/api',
  ios: 'http://10.185.107.20:5001/api',
  default: 'http://10.185.107.20:5001/api',
});

let currentBaseUrl = DEFAULT_API_URL;

export const api: AxiosInstance = axios.create({
  baseURL: currentBaseUrl,
  timeout: 8000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Load saved custom server URL from storage
export const initApiConfig = async (): Promise<string> => {
  try {
    const savedUrl = await AsyncStorage.getItem('@campuslearn_api_url');
    if (savedUrl) {
      currentBaseUrl = savedUrl;
      api.defaults.baseURL = savedUrl;
    }
  } catch (e) {}
  return currentBaseUrl;
};

export const setServerUrl = async (newUrl: string): Promise<void> => {
  let formatted = newUrl.trim();
  if (formatted.endsWith('/')) formatted = formatted.slice(0, -1);
  if (!formatted.endsWith('/api')) formatted = `${formatted}/api`;

  currentBaseUrl = formatted;
  api.defaults.baseURL = formatted;
  try {
    await AsyncStorage.setItem('@campuslearn_api_url', formatted);
  } catch (e) {}
};

export const getServerUrl = (): string => currentBaseUrl;

// Request Interceptor: Attach JWT token from AsyncStorage
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('@campuslearn_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {}
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Auto token refresh & Session Revocation Handler
let onSessionRevokedCallback: (() => void) | null = null;

export const setOnSessionRevoked = (callback: () => void) => {
  onSessionRevokedCallback = callback;
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 1-Web + 1-Mobile Session Revocation (login on another mobile device)
    if (error.response?.data?.code === 'SESSION_REVOKED') {
      try {
        await AsyncStorage.removeItem('@campuslearn_token');
        await AsyncStorage.removeItem('@campuslearn_user');
        await AsyncStorage.removeItem('@campuslearn_refresh_token');
      } catch (e) {}

      if (onSessionRevokedCallback) {
        onSessionRevokedCallback();
      }
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = await AsyncStorage.getItem('@campuslearn_refresh_token');
        if (refreshToken) {
          const { data } = await axios.post(`${currentBaseUrl}/auth/refresh`, { refreshToken });
          const newToken = data.data?.accessToken;
          if (newToken) {
            await AsyncStorage.setItem('@campuslearn_token', newToken);
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return api(originalRequest);
          }
        }
      } catch (err) {
        await AsyncStorage.removeItem('@campuslearn_token');
        await AsyncStorage.removeItem('@campuslearn_user');
      }
    }
    return Promise.reject(error);
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// LIVE BACKEND API SERVICE DEFINITIONS
// ─────────────────────────────────────────────────────────────────────────────

export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login', {
      email,
      password,
      platform: 'mobile',
      deviceInfo: `${Platform.OS.toUpperCase()} Device (${Platform.Version})`,
    }),
  register: (data: Record<string, unknown>) =>
    api.post('/auth/register', {
      ...data,
      platform: 'mobile',
      deviceInfo: `${Platform.OS.toUpperCase()} Device (${Platform.Version})`,
    }),
  getMe: () => api.get('/auth/me'),
  getSessions: () => api.get('/auth/sessions'),
  logout: () => api.post('/auth/logout'),
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
};

export const courseAPI = {
  getAll: (params?: Record<string, unknown>) => api.get('/courses', { params }),
  getOne: (id: string) => api.get(`/courses/${id}`),
  create: (data: FormData | Record<string, unknown>) => api.post('/courses', data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/courses/${id}`, data),
  delete: (id: string) => api.delete(`/courses/${id}`),
  enroll: (id: string) => api.post(`/courses/${id}/enroll`),
  approve: (id: string) => api.patch(`/courses/${id}/approve`),
  getStudents: (id: string) => api.get(`/courses/${id}/students`),
};

export const assignmentAPI = {
  getAll: (params?: Record<string, unknown>) => api.get('/assignments', { params }),
  create: (data: Record<string, unknown>) => api.post('/assignments', data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/assignments/${id}`, data),
  delete: (id: string) => api.delete(`/assignments/${id}`),
  submit: (id: string, data: Record<string, unknown>) => api.post(`/assignments/${id}/submit`, data),
  getSubmissions: (id: string) => api.get(`/assignments/${id}/submissions`),
  grade: (submissionId: string, data: Record<string, unknown>) => api.put(`/assignments/submissions/${submissionId}/grade`, data),
};

export const attendanceAPI = {
  mark: (data: Record<string, unknown>) => api.post('/attendance', data),
  getAll: (params?: Record<string, unknown>) => api.get('/attendance', { params }),
  getMine: (params?: Record<string, unknown>) => api.get('/attendance/my-attendance', { params }),
  update: (id: string, data: Record<string, unknown>) => api.put(`/attendance/${id}`, data),
};

export const announcementAPI = {
  getAll: (params?: Record<string, unknown>) => api.get('/announcements', { params }),
  create: (data: Record<string, unknown>) => api.post('/announcements', data),
  delete: (id: string) => api.delete(`/announcements/${id}`),
};

export const placementAPI = {
  getDashboard: () => api.get('/placement/dashboard'),
  getAptitude: (params?: Record<string, unknown>) => api.get('/placement/aptitude', { params }),
  submitAptitudeTest: (data: Record<string, unknown>) => api.post('/placement/aptitude/test', data),
  getCodingQuestions: (params?: Record<string, unknown>) => api.get('/placement/coding', { params }),
  analyzeResume: (data: Record<string, unknown>) => api.post('/placement/resume/analyze', data),
  getCompanies: (params?: Record<string, unknown>) => api.get('/placement/companies', { params }),
};

export const aiAPI = {
  chat: (message: string, history: unknown[] = [], context?: Record<string, unknown>) =>
    api.post('/ai/chat', { message, history, context }),
};

export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getUsers: (params?: Record<string, unknown>) => api.get('/admin/users', { params }),
  bulkCreateUsers: (users: unknown[]) => api.post('/admin/users/bulk', users),
  updateUser: (id: string, data: Record<string, unknown>) => api.put(`/admin/users/${id}`, data),
};

export const hodAPI = {
  getStats: () => api.get('/hod/stats'),
  getFaculty: () => api.get('/hod/faculty'),
  getStudents: (params?: Record<string, unknown>) => api.get('/hod/students', { params }),
};

// ─────────────────────────────────────────────────────────────────────────────
// COMPREHENSIVE HIGH-FIDELITY MOCK DATA REPOSITORY
// Used for instant rendering and offline-resilience
// ─────────────────────────────────────────────────────────────────────────────

export const MOCK_COURSES: Course[] = [
  {
    _id: 'CS301',
    title: 'Design & Analysis of Algorithms',
    code: 'CS301',
    description: 'Master advanced algorithm paradigms including Divide-and-Conquer, Dynamic Programming, Greedy approaches, and Graph Theory with real-world complexities.',
    instructor: 'Dr. Priya Ramanathan',
    department: 'Computer Science & Engineering',
    semester: 6,
    credits: 4,
    thumbnail: 'https://images.unsplash.com/photo-1516116211227-bbc141e97669?q=80&w=800&auto=format&fit=crop',
    totalLessons: 24,
    completedLessons: 18,
    progress: 75,
    rating: 4.9,
    totalStudents: 124,
    modules: [
      {
        _id: 'm1',
        title: 'Module 1: Asymptotic Analysis & Recurrences',
        duration: '3h 45m',
        lessons: [
          { _id: 'l1', title: 'Big-O, Big-Theta, Big-Omega Notations', type: 'video', duration: '35m', completed: true },
          { _id: 'l2', title: 'Master Theorem & Recursion Trees', type: 'video', duration: '45m', completed: true },
          { _id: 'l3', title: 'Lecture Notes: Asymptotic Bounds PDF', type: 'document', duration: '15m', completed: true },
        ],
      },
      {
        _id: 'm2',
        title: 'Module 2: Dynamic Programming & Memoization',
        duration: '5h 20m',
        lessons: [
          { _id: 'l4', title: '0/1 Knapsack & Fractional Knapsack', type: 'video', duration: '50m', completed: true },
          { _id: 'l5', title: 'Longest Common Subsequence (LCS)', type: 'video', duration: '40m', completed: true },
          { _id: 'l6', title: 'Matrix Chain Multiplication Problem', type: 'reading', duration: '30m', completed: false },
        ],
      },
    ],
  },
  {
    _id: 'CS302',
    title: 'Database Management Systems & Distributed DBs',
    code: 'CS302',
    description: 'Relational algebra, SQL tuning, ACID properties, B+ Tree indexing, NoSQL schemas, and distributed consensus.',
    instructor: 'Prof. Rajesh Kulkarni',
    department: 'Computer Science & Engineering',
    semester: 6,
    credits: 4,
    thumbnail: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?q=80&w=800&auto=format&fit=crop',
    totalLessons: 20,
    completedLessons: 14,
    progress: 70,
    rating: 4.8,
    totalStudents: 118,
    modules: [],
  },
  {
    _id: 'CS303',
    title: 'Full-Stack Cloud Application Engineering',
    code: 'CS303',
    description: 'Modern architectures with React/React Native, Node.js microservices, Docker containerization, and AWS serverless deployments.',
    instructor: 'Er. Ananya Sen',
    department: 'Computer Science & Engineering',
    semester: 6,
    credits: 3,
    thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=800&auto=format&fit=crop',
    totalLessons: 18,
    completedLessons: 16,
    progress: 88,
    rating: 4.95,
    totalStudents: 140,
    modules: [],
  },
  {
    _id: 'CS304',
    title: 'Computer Networks & Cybersecurity Protocols',
    code: 'CS304',
    description: 'TCP/IP internals, HTTP/3, TLS 1.3 handshake, DNSSEC, VPN tunneling, firewall configuration, and vulnerability auditing.',
    instructor: 'Dr. Priya Ramanathan',
    department: 'Computer Science & Engineering',
    semester: 6,
    credits: 4,
    thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=800&auto=format&fit=crop',
    totalLessons: 22,
    completedLessons: 11,
    progress: 50,
    rating: 4.7,
    totalStudents: 95,
    modules: [],
  },
];

export const MOCK_ASSIGNMENTS: Assignment[] = [
  {
    _id: 'asg_01',
    courseId: 'CS301',
    courseName: 'Design & Analysis of Algorithms',
    title: 'Assignment 3: Dynamic Programming on Graph Networks',
    description: 'Implement Floyd-Warshall and Bellman-Ford algorithms in Python/C++. Benchmark time complexities for dense vs sparse graphs with varying edge counts.',
    dueDate: 'Tomorrow at 11:59 PM',
    totalMarks: 25,
    status: 'pending',
  },
  {
    _id: 'asg_02',
    courseId: 'CS302',
    courseName: 'Database Management Systems',
    title: 'Assignment 2: Schema Normalization & B+ Index Profiling',
    description: 'Demonstrate conversion of un-normalized tables to 3NF and BCNF. Provide SQL script to index 1 million mock user records and evaluate EXPLAIN output.',
    dueDate: 'In 3 Days',
    totalMarks: 20,
    status: 'pending',
  },
  {
    _id: 'asg_03',
    courseId: 'CS303',
    courseName: 'Full-Stack Cloud Engineering',
    title: 'Mini Project 1: REST API with JWT Auth & Multer Uploads',
    description: 'Submit your GitHub repository and deployment URL implementing token authentication and file upload handling.',
    dueDate: 'Submitted on 14 Aug',
    totalMarks: 30,
    status: 'graded',
    grade: 29,
    feedback: 'Excellent clean modular structure. Error middleware and route rate-limiting are very well executed!',
    submittedFile: 'github.com/aarav-sharma/campuslearn-api-submission.zip',
    submissionDate: '14 Aug 2026, 08:30 PM',
  },
  {
    _id: 'asg_04',
    courseId: 'CS304',
    courseName: 'Computer Networks',
    title: 'Assignment 1: Wireshark Packet Capture Analysis',
    description: 'Capture and inspect TCP 3-way handshake, TLS 1.3 key exchange, and DNS query response streams.',
    dueDate: 'Submitted on 10 Aug',
    totalMarks: 15,
    status: 'submitted',
    submittedFile: 'wireshark_capture_report_aarav.pdf',
    submissionDate: '10 Aug 2026, 04:15 PM',
  },
];

export const MOCK_ATTENDANCE: AttendanceRecord[] = [
  {
    courseId: 'CS301',
    courseName: 'Design & Analysis of Algorithms',
    courseCode: 'CS301',
    facultyName: 'Dr. Priya Ramanathan',
    totalClasses: 36,
    attendedClasses: 32,
    percentage: 88.8,
    status: 'good',
    history: [
      { date: '18 Aug 2026', status: 'present', topic: 'Dynamic Programming LCS' },
      { date: '16 Aug 2026', status: 'present', topic: 'Knapsack memoization' },
      { date: '14 Aug 2026', status: 'absent', topic: 'Greedy scheduling' },
      { date: '11 Aug 2026', status: 'present', topic: 'Divide and conquer' },
    ],
  },
  {
    courseId: 'CS302',
    courseName: 'Database Management Systems',
    courseCode: 'CS302',
    facultyName: 'Prof. Rajesh Kulkarni',
    totalClasses: 34,
    attendedClasses: 28,
    percentage: 82.3,
    status: 'good',
    history: [
      { date: '18 Aug 2026', status: 'present', topic: 'Query Optimization' },
      { date: '15 Aug 2026', status: 'present', topic: 'Index Structures' },
    ],
  },
  {
    courseId: 'CS303',
    courseName: 'Full-Stack Cloud Engineering',
    courseCode: 'CS303',
    facultyName: 'Er. Ananya Sen',
    totalClasses: 30,
    attendedClasses: 27,
    percentage: 90.0,
    status: 'good',
    history: [
      { date: '17 Aug 2026', status: 'present', topic: 'React Native architecture' },
      { date: '13 Aug 2026', status: 'present', topic: 'JWT state store' },
    ],
  },
  {
    courseId: 'CS304',
    courseName: 'Computer Networks & Security',
    courseCode: 'CS304',
    facultyName: 'Dr. Priya Ramanathan',
    totalClasses: 32,
    attendedClasses: 22,
    percentage: 68.7, // Shortage! Triggers Sinchana's attendance alert system
    status: 'critical',
    history: [
      { date: '18 Aug 2026', status: 'absent', topic: 'TLS 1.3 Key Exchange' },
      { date: '16 Aug 2026', status: 'absent', topic: 'TCP Sliding Window' },
      { date: '12 Aug 2026', status: 'present', topic: 'IP Routing Protocols' },
    ],
  },
];

export const MOCK_APTITUDE_QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    question: 'A train 240 m long passes a pole in 24 seconds. How long will it take to pass a platform 650 m long?',
    options: ['89 seconds', '100 seconds', '75 seconds', '65 seconds'],
    correctAnswer: 0,
    explanation: 'Speed = 240/24 = 10 m/s. Total distance = 240 + 650 = 890 m. Time = 890 / 10 = 89 seconds.',
  },
  {
    id: 'q2',
    question: 'What is the worst-case time complexity of QuickSort when the pivot is always chosen as the first element?',
    options: ['O(n log n)', 'O(n²)', 'O(n)', 'O(log n)'],
    correctAnswer: 1,
    explanation: 'If the array is already sorted or reverse sorted, picking the first element splits the list into 0 and n-1 elements, resulting in O(n²) time.',
  },
  {
    id: 'q3',
    question: 'Which normal form eliminates partial functional dependencies on candidate keys?',
    options: ['1NF', '2NF', '3NF', 'BCNF'],
    correctAnswer: 1,
    explanation: 'Second Normal Form (2NF) enforces that every non-prime attribute is fully functionally dependent on the entire primary key.',
  },
];

export const MOCK_PLACEMENTS: PlacementOpportunity[] = [
  {
    _id: 'job_01',
    companyName: 'Google Cloud India',
    companyLogo: 'https://cdn-icons-png.flaticon.com/512/2991/2991148.png',
    role: 'Software Engineer - Distributed Systems',
    location: 'Bengaluru / Hyderabad (Hybrid)',
    type: 'Full-Time',
    package: '₹34 - 42 LPA',
    minCgpa: 8.0,
    deadline: '28 Aug 2026',
    eligibility: ['B.Tech CSE/IT/ECE', 'CGPA >= 8.0', 'No active backlogs'],
    applied: true,
  },
  {
    _id: 'job_02',
    companyName: 'Microsoft R&D',
    companyLogo: 'https://cdn-icons-png.flaticon.com/512/732/732221.png',
    role: 'Software Development Engineer I',
    location: 'Bengaluru, KA',
    type: 'Full-Time',
    package: '₹28 - 36 LPA',
    minCgpa: 7.5,
    deadline: '02 Sep 2026',
    eligibility: ['B.Tech all streams', 'Strong DS/Algo proficiency'],
    applied: false,
  },
];

export const MOCK_ANNOUNCEMENTS: Announcement[] = [
  {
    _id: 'ann_01',
    title: '🚨 Mid-Semester Examination Schedule Published',
    content: 'The 6th Semester Mid-Term evaluations commence from September 15th. Check your student portal timetable and report any conflicts to the exam cell by August 25th.',
    priority: 'high',
    targetRole: 'student',
    author: 'Prof. Rajesh Kulkarni',
    authorRole: 'Head of Department',
    date: '18 Aug 2026',
    pinned: true,
  },
  {
    _id: 'ann_02',
    title: '💼 Campus Placement Drive: Microsoft & Amazon',
    content: 'Registration is now open for eligible students (CGPA >= 7.5). Complete your mock aptitude and resume verification on the Placement tab before Aug 28.',
    priority: 'urgent',
    targetRole: 'student',
    author: 'Placement & Training Cell',
    authorRole: 'T&P Officer',
    date: '17 Aug 2026',
    pinned: true,
  },
];

export const MOCK_TIMETABLE: TimetableSlot[] = [
  { id: 't1', day: 'Monday', startTime: '09:00 AM', endTime: '10:00 AM', courseName: 'Design & Analysis of Algorithms', courseCode: 'CS301', room: 'LH-302', faculty: 'Dr. Priya Ramanathan', type: 'Lecture' },
  { id: 't2', day: 'Monday', startTime: '10:15 AM', endTime: '11:15 AM', courseName: 'Database Management Systems', courseCode: 'CS302', room: 'LH-302', faculty: 'Prof. Rajesh Kulkarni', type: 'Lecture' },
  { id: 't3', day: 'Monday', startTime: '11:30 AM', endTime: '01:30 PM', courseName: 'Algorithms Lab (Batch A)', courseCode: 'CS301L', room: 'Computing Lab 3', faculty: 'Dr. Priya Ramanathan', type: 'Lab' },
  { id: 't4', day: 'Monday', startTime: '02:30 PM', endTime: '03:30 PM', courseName: 'Full-Stack Cloud Engineering', courseCode: 'CS303', room: 'LH-304', faculty: 'Er. Ananya Sen', type: 'Lecture' },
];

export const MOCK_AI_RESPONSES: Record<string, string> = {
  default: `Hello! I am your **CampusLearn AI Assistant** 🎓.\n\nI can help you with:\n- Explaining algorithmic concepts (Dynamic Programming, Graph traversals)\n- Debugging database queries, normalization, and ACID properties\n- Solving placement aptitude & coding interview puzzles\n- Summarizing lecture notes and generating quick flashcards\n\nWhat would you like to explore today?`,
  dp: `### 🧠 Dynamic Programming: 0/1 Knapsack Intuition\n\nIn the 0/1 Knapsack problem, you have $n$ items each with weight $w_i$ and value $v_i$. You want to maximize total value without exceeding capacity $W$.\n\n**Recurrence Relation:**\n\`\`\`text\nDP[i][w] = max(DP[i-1][w], DP[i-1][w - w_i] + v_i)\n\`\`\`\n- **Case 1:** Exclude item $i$ -> Value is $DP[i-1][w]$\n- **Case 2:** Include item $i$ (if $w_i \\le w$) -> Value is $DP[i-1][w - w_i] + v_i$\n\n**Time Complexity:** $O(n \\times W)$\n**Space Complexity:** $O(W)$ using 1D rolling array optimization!`,
  sql: `### ⚡ SQL Indexing & Optimization Pro-Tips\n\n1. **Composite Index Leftmost Prefix Rule:** If you create an index on \`(department_id, created_at)\`, queries filtering ONLY on \`department_id\` will use the index, but queries filtering ONLY on \`created_at\` will trigger a full table scan.\n2. **Avoid Functions on Indexed Columns:** Instead of \`WHERE YEAR(created_at) = 2026\`, use range queries: \`WHERE created_at >= '2026-01-01' AND created_at < '2027-01-01'\`.\n3. **Use EXPLAIN ANALYZE** to spot sequential scans and high-cost nested loop joins!`,
  placement: `### 🚀 Top 3 Placement Preparation Pillars (by Nayana G. Naik)\n\n1. **Aptitude Mastery:** Practice Quantitative (Time & Work, Speed & Distance, Permutations) and Logical Reasoning daily for 30 minutes.\n2. **DSA Core:** Master Arrays, HashMaps, Two-Pointers, Binary Search, Trees, and Graph BFS/DFS.\n3. **System Design & Core CS:** Be ready with OS (Process vs Thread, Deadlocks), DBMS (ACID, Normalization, Indexing), and Networks (TCP vs UDP, HTTP/HTTPS).`,
};
