export type Role = 'student' | 'faculty' | 'hod' | 'admin';
export type ThemeMode = 'light' | 'dark' | 'system';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  phone?: string;
  bio?: string;
  department?: string;
  rollNumber?: string;
  semester?: number;
  year?: number;
  employeeId?: string;
  designation?: string;
  streak: number;
  points: number;
  badges: string[];
  attendanceRate?: number;
  enrolledCourses?: string[];
  teachingCourses?: string[];
}

export interface Course {
  _id: string;
  title: string;
  code: string;
  description: string;
  instructor: string;
  instructorAvatar?: string;
  department: string;
  semester: number;
  credits: number;
  thumbnail: string;
  totalLessons: number;
  completedLessons?: number;
  progress?: number;
  rating: number;
  totalStudents: number;
  modules: Module[];
}

export interface Module {
  _id: string;
  title: string;
  duration: string;
  lessons: Lesson[];
}

export interface Lesson {
  _id: string;
  title: string;
  type: 'video' | 'document' | 'quiz' | 'reading';
  duration: string;
  completed: boolean;
  videoUrl?: string;
  content?: string;
  documentUrl?: string;
}

export interface Assignment {
  _id: string;
  courseId: string;
  courseName: string;
  title: string;
  description: string;
  dueDate: string;
  totalMarks: number;
  status: 'pending' | 'submitted' | 'graded' | 'late';
  submittedFile?: string;
  submissionDate?: string;
  grade?: number;
  feedback?: string;
}

export interface AttendanceRecord {
  courseId: string;
  courseName: string;
  courseCode: string;
  facultyName: string;
  totalClasses: number;
  attendedClasses: number;
  percentage: number;
  status: 'good' | 'warning' | 'critical'; // <75% is warning, <65% critical
  history: {
    date: string;
    status: 'present' | 'absent' | 'late' | 'excused';
    topic?: string;
  }[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

export interface PlacementOpportunity {
  _id: string;
  companyName: string;
  companyLogo: string;
  role: string;
  location: string;
  type: 'Full-Time' | 'Internship' | 'PPO';
  package: string;
  minCgpa: number;
  deadline: string;
  eligibility: string[];
  applied?: boolean;
}

export interface Announcement {
  _id: string;
  title: string;
  content: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  targetRole: 'all' | 'student' | 'faculty' | 'hod';
  author: string;
  authorRole: string;
  date: string;
  pinned?: boolean;
}

export interface TimetableSlot {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  courseName: string;
  courseCode: string;
  room: string;
  faculty: string;
  type: 'Lecture' | 'Lab' | 'Tutorial';
}
