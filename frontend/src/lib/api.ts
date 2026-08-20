import axios from 'axios';

let API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';
if (API_URL.endsWith('/')) {
 API_URL = API_URL.slice(0, -1);
}
if (!API_URL.endsWith('/api')) {
 API_URL = `${API_URL}/api`;
}
// ─── Axios Instance ───────────────────────────────────────────────────────────
const api = axios.create({
 baseURL: API_URL,
 headers: { 'Content-Type': 'application/json' },
 withCredentials: false,
});

// ─── Request Interceptor (attach token) ──────────────────────────────────────
api.interceptors.request.use(
 (config) => {
 if (typeof window !== 'undefined') {
 const token = localStorage.getItem('accessToken');
 if (token) {
 config.headers.Authorization = `Bearer ${token}`;
 }
 }
 return config;
 },
 (error) => Promise.reject(error)
);

// ─── Response Interceptor (auto refresh & session revocation check) ───────────
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle Session Revocation (e.g., user logged in on another web browser)
    if (error.response?.data?.code === 'SESSION_REVOKED') {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        alert('Session Expired: You have been logged out because a new login was detected on another web browser session.');
        window.location.href = '/login?reason=session_revoked';
      }
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) throw new Error('No refresh token');

        const { data } = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
        const newToken = data.data.accessToken;

        localStorage.setItem('accessToken', newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;

        return api(originalRequest);
      } catch (_) {
        // Clear tokens and redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }
    }

    return Promise.reject(error);
  }
);

// ─── Auth API ─────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data: Record<string, unknown>) => api.post('/auth/register', { ...data, platform: 'web' }),
  login: (email: string, password: string) => api.post('/auth/login', { email, password, platform: 'web' }),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  getSessions: () => api.get('/auth/sessions'),
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token: string, password: string) => api.put(`/auth/reset-password/${token}`, { password }),
  updatePassword: (data: Record<string, unknown>) => api.put('/auth/update-password', data),
};

// ─── Course API ───────────────────────────────────────────────────────────────
export const courseAPI = {
 getAll: (params?: Record<string, unknown>) => api.get('/courses', { params }),
 getOne: (id: string) => api.get(`/courses/${id}`),
 create: (data: FormData) => api.post('/courses', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
 update: (id: string, data: FormData | Record<string, unknown>) => api.put(`/courses/${id}`, data),
 delete: (id: string) => api.delete(`/courses/${id}`),
 enroll: (id: string) => api.post(`/courses/${id}/enroll`),
 approve: (id: string) => api.patch(`/courses/${id}/approve`),
 getStudents: (id: string) => api.get(`/courses/${id}/students`),
};

// ─── Assignment API ───────────────────────────────────────────────────────────
export const assignmentAPI = {
 getAll: (params?: Record<string, unknown>) => api.get('/assignments', { params }),
 create: (data: FormData) => api.post('/assignments', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
 update: (id: string, data: Record<string, unknown>) => api.put(`/assignments/${id}`, data),
 delete: (id: string) => api.delete(`/assignments/${id}`),
 submit: (id: string, data: FormData) => api.post(`/assignments/${id}/submit`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
 getSubmissions: (id: string) => api.get(`/assignments/${id}/submissions`),
 grade: (submissionId: string, data: Record<string, unknown>) => api.put(`/assignments/submissions/${submissionId}/grade`, data),
};

// ─── Quiz API ─────────────────────────────────────────────────────────────────
export const quizAPI = {
 getAll: (params?: Record<string, unknown>) => api.get('/quizzes', { params }),
 getOne: (id: string) => api.get(`/quizzes/${id}`),
 create: (data: Record<string, unknown>) => api.post('/quizzes', data),
 update: (id: string, data: Record<string, unknown>) => api.put(`/quizzes/${id}`, data),
 submit: (id: string, data: Record<string, unknown>) => api.post(`/quizzes/${id}/submit`, data),
 getResults: (id: string) => api.get(`/quizzes/${id}/results`),
};

// ─── Attendance API ───────────────────────────────────────────────────────────
export const attendanceAPI = {
 mark: (data: Record<string, unknown>) => api.post('/attendance', data),
 getAll: (params?: Record<string, unknown>) => api.get('/attendance', { params }),
 getMine: (params?: Record<string, unknown>) => api.get('/attendance/my-attendance', { params }),
 update: (id: string, data: Record<string, unknown>) => api.put(`/attendance/${id}`, data),
};

// ─── AI API ───────────────────────────────────────────────────────────────────
export const aiAPI = {
 chat: (message: string, history: unknown[], context?: Record<string, unknown>) =>
 api.post('/ai/chat', { message, history, context }),
 generateQuiz: (data: Record<string, unknown>) => api.post('/ai/generate-quiz', data),
 summarize: (text: string, length?: string) => api.post('/ai/summarize', { text, length }),
};

// ─── Notification API ─────────────────────────────────────────────────────────
export const notificationAPI = {
 getAll: (params?: Record<string, unknown>) => api.get('/notifications', { params }),
 markRead: (id: string) => api.patch(`/notifications/${id}/read`),
 markAllRead: () => api.patch('/notifications/read-all'),
 delete: (id: string) => api.delete(`/notifications/${id}`),
};

// ─── Discussion API ───────────────────────────────────────────────────────────
export const discussionAPI = {
 getAll: (params?: Record<string, unknown>) => api.get('/discussions', { params }),
 getOne: (id: string) => api.get(`/discussions/${id}`),
 create: (data: Record<string, unknown>) => api.post('/discussions', data),
 addComment: (postId: string, content: string, parentComment?: string) =>
 api.post(`/discussions/${postId}/comments`, { content, parentComment }),
 like: (id: string) => api.patch(`/discussions/${id}/like`),
 resolve: (id: string) => api.patch(`/discussions/${id}/resolve`),
};

// ─── Result API ───────────────────────────────────────────────────────────────
export const resultAPI = {
 getAll: (params?: Record<string, unknown>) => api.get('/results', { params }),
 create: (data: Record<string, unknown>) => api.post('/results', data),
 publish: (id: string) => api.patch(`/results/${id}/publish`),
};

// ─── Certificate API ──────────────────────────────────────────────────────────
export const certificateAPI = {
 getAll: () => api.get('/certificates'),
 create: (data: Record<string, unknown>) => api.post('/certificates', data),
 verify: (id: string) => api.get(`/certificates/verify/${id}`),
};

// ─── Admin API ────────────────────────────────────────────────────────────────
export const adminAPI = {
 getStats: () => api.get('/admin/stats'),
 getUsers: (params?: Record<string, unknown>) => api.get('/admin/users', { params }),
 bulkCreateUsers: (users: unknown[]) => api.post('/admin/users/bulk', users),
 updateUser: (id: string, data: Record<string, unknown>) => api.put(`/admin/users/${id}`, data),
 deleteUser: (id: string) => api.delete(`/admin/users/${id}`),
 getDepartments: () => api.get('/admin/departments'),
 getDepartment: (id: string) => api.get('/admin/departments/' + id),
 createDepartment: (data: Record<string, unknown>) => api.post('/admin/departments', data),
 updateDepartment: (id: string, data: Record<string, unknown>) => api.put(`/admin/departments/${id}`, data),
 sendNotification: (data: Record<string, unknown>) => api.post('/admin/notify', data),
};

// ─── User API ─────────────────────────────────────────────────────────────────
export const userAPI = {
 getProfile: () => api.get('/users/profile'),
 updateProfile: (data: FormData) => api.put('/users/profile', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
 getLeaderboard: (params?: Record<string, unknown>) => api.get('/users/leaderboard', { params }),
 search: (q: string, role?: string) => api.get('/users/search', { params: { q, role } }),
};

// ─── HOD API ──────────────────────────────────────────────────────────────────
export const hodAPI = {
 getStats: () => api.get('/hod/stats'),
 getFaculty: () => api.get('/hod/faculty'),
 getStudents: (params?: Record<string, unknown>) => api.get('/hod/students', { params }),
};

// ─── Announcement API ─────────────────────────────────────────────────────────
export const announcementAPI = {
 getAll: (params?: Record<string, unknown>) => api.get('/announcements', { params }),
 create: (data: Record<string, unknown>) => api.post('/announcements', data),
 delete: (id: string) => api.delete(`/announcements/${id}`),
};

// ─── Module API ───────────────────────────────────────────────────────────────
export const moduleAPI = {
 getAll: (courseId: string) => api.get('/modules', { params: { course: courseId } }),
 create: (data: Record<string, unknown>) => api.post('/modules', data),
 update: (id: string, data: Record<string, unknown>) => api.put(`/modules/${id}`, data),
 createVideoLesson: (data: FormData) => api.post('/modules/lessons/video', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
 createDocumentLesson: (data: FormData) => api.post('/modules/lessons/document', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
 completeLesson: (id: string) => api.patch(`/modules/lessons/${id}/complete`),
};
// ─── Live Class API ───────────────────────────────────────────────────────────

export const liveClassAPI = {
 getAll: (params?: Record<string, unknown>) => api.get('/live-classes', { params }),
 create: (data: Record<string, unknown>) => api.post('/live-classes', data),
};
// ─── Calendar API ─────────────────────────────────────────────────────────────

export const calendarAPI = {
 getAll: (params?: Record<string, unknown>) => api.get('/calendar', { params }),
 create: (data: Record<string, unknown>) => api.post('/calendar', data),
 delete: (id: string) => api.delete(`/calendar/${id}`),
};

// ─── Career API ───────────────────────────────────────────────────────────────
export const careerAPI = {
  getRoadmap: () => api.get('/career/roadmap'),
  createRoadmap: (data: Record<string, unknown>) => api.post('/career/roadmap', data),
  updateRoadmap: (data: Record<string, unknown>) => api.put('/career/roadmap', data),
  createGoal: (data: Record<string, unknown>) => api.post('/career/goals', data),
  getRecommendations: () => api.get('/career/recommendations'),
  addSkill: (data: Record<string, unknown>) => api.post('/career/skills', data),
  updateSkill: (id: string, data: Record<string, unknown>) => api.put(`/career/skills/${id}`, data),
};

// ─── Timetable API ────────────────────────────────────────────────────────────
export const timetableAPI = {
  getAll: (params?: Record<string, unknown>) => api.get('/timetable', { params }),
  create: (data: Record<string, unknown>) => api.post('/timetable', data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/timetable/${id}`, data),
  delete: (id: string) => api.delete(`/timetable/${id}`),
  checkConflict: (data: Record<string, unknown>) => api.post('/timetable/check-conflict', data),
  reschedule: (data: Record<string, unknown>) => api.post('/timetable/reschedule', data),
  cancel: (data: Record<string, unknown>) => api.post('/timetable/cancel', data),
};

// ─── Exam Preparation API ─────────────────────────────────────────────────────
export const examAPI = {
  getPortions: (params?: Record<string, unknown>) => api.get('/exams/portions', { params }),
  createPortion: (data: Record<string, unknown>) => api.post('/exams/portions', data),
  updatePortion: (id: string, data: Record<string, unknown>) => api.put(`/exams/portions/${id}`, data),
  getTopics: (params?: Record<string, unknown>) => api.get('/exams/topics', { params }),
  generateStudyPlan: (data: Record<string, unknown>) => api.post('/exams/study-plan', data),
  getProgress: () => api.get('/exams/study-progress'),
};

// ─── Attendance Intelligence API ──────────────────────────────────────────────
export const attendanceIntelAPI = {
  getRisk: () => api.get('/attendance-extra/risk'),
  getShortage: () => api.get('/attendance-extra/shortage'),
  getPrediction: (courseId: string) => api.get('/attendance-extra/prediction', { params: { courseId } }),
  getAlerts: () => api.get('/attendance-extra/alerts'),
  sendAlerts: () => api.post('/attendance-extra/alerts/send', {}),
};

// ─── Placement API (Extended) ─────────────────────────────────────────────────
export const placementAPI = {
  getDashboard: () => api.get('/placement/dashboard'),
  getAptitude: (params?: Record<string, unknown>) => api.get('/placement/aptitude', { params }),
  submitAptitudeTest: (data: Record<string, unknown>) => api.post('/placement/aptitude/test', data),
  getCodingQuestions: (params?: Record<string, unknown>) => api.get('/placement/coding', { params }),
  submitMockTest: (data: Record<string, unknown>) => api.post('/placement/mock-test', data),
  startInterview: (data: Record<string, unknown>) => api.post('/placement/interview/start', data),
  submitAnswer: (data: Record<string, unknown>) => api.post('/placement/interview/answer', data),
  completeInterview: (data: Record<string, unknown>) => api.post('/placement/interview/complete', data),
  analyzeResume: (data: Record<string, unknown>) => api.post('/placement/resume/analyze', data),
  getCompanies: (params?: Record<string, unknown>) => api.get('/placement/companies', { params }),
  getCompany: (id: string) => api.get(`/placement/companies/${id}`),
  getProgress: () => api.get('/placement/progress'),
};

export default api;
