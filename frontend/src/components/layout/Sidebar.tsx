'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
 LayoutDashboard, BookOpen, FileText, ClipboardList, BarChart2, Users,
 Calendar, Bell, MessageSquare, Bot, Trophy, Award, Settings, LogOut,
 GraduationCap, Building, UserCog, Database, ChevronRight, Home,
 Video, Clipboard, PieChart, UserCheck, X, Map, Clock, Briefcase, Target, Layers
} from 'lucide-react';
import { cn, getInitials } from '@/lib/utils';
import type { Role } from '@/types';
import { useAuthStore } from '@/store/authStore';
import { authAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

type NavItem = {
 label: string;
 href: string;
 icon: React.ReactNode;
 badge?: string;
};

const NAV_ITEMS: Record<Role, NavItem[]> = {
 student: [
 { label: 'Dashboard', href: '/student/dashboard', icon: <LayoutDashboard size={18} /> },
 { label: 'My Courses', href: '/student/courses', icon: <BookOpen size={18} /> },
 { label: 'Career Roadmap', href: '/student/career-roadmap', icon: <Map size={18} /> },
 { label: 'Timetable', href: '/student/timetable', icon: <Clock size={18} /> },
 { label: 'Exam Prep', href: '/student/exam-preparation', icon: <Target size={18} /> },
 { label: 'Placement', href: '/student/placement-preparation', icon: <Briefcase size={18} /> },
 { label: 'Assignments', href: '/student/assignments', icon: <ClipboardList size={18} /> },
 { label: 'Attendance', href: '/student/attendance', icon: <UserCheck size={18} /> },
 { label: 'Quiz', href: '/student/quiz', icon: <FileText size={18} /> },
 { label: 'Results', href: '/student/results', icon: <BarChart2 size={18} /> },
 { label: 'Certificates', href: '/student/certificates', icon: <Award size={18} /> },
 { label: 'Leaderboard', href: '/student/leaderboard', icon: <Trophy size={18} /> },
 { label: 'Discussion', href: '/student/forum', icon: <MessageSquare size={18} /> },
 { label: 'AI Assistant', href: '/student/ai-assistant', icon: <Bot size={18} /> },
 { label: 'Calendar', href: '/student/calendar', icon: <Calendar size={18} /> },
 { label: 'Live Classes', href: '/student/live', icon: <Video size={18} /> },
 ],
 faculty: [
 { label: 'Dashboard', href: '/faculty/dashboard', icon: <LayoutDashboard size={18} /> },
 { label: 'Timetable', href: '/faculty/timetable', icon: <Clock size={18} /> },
 { label: 'Exam Portions', href: '/faculty/exam-preparation', icon: <Layers size={18} /> },
 { label: 'Placement Prep', href: '/faculty/placement-preparation', icon: <Briefcase size={18} /> },
 { label: 'My Courses', href: '/faculty/courses', icon: <BookOpen size={18} /> },
 { label: 'Assignments', href: '/faculty/assignments', icon: <ClipboardList size={18} /> },
 { label: 'Attendance', href: '/faculty/attendance', icon: <UserCheck size={18} /> },
 { label: 'Quizzes', href: '/faculty/quiz', icon: <FileText size={18} /> },
 { label: 'Live Classes', href: '/faculty/live', icon: <Video size={18} /> },
 { label: 'Career Progress', href: '/faculty/career-analytics', icon: <Target size={18} /> },
 { label: 'Analytics', href: '/faculty/analytics', icon: <PieChart size={18} /> },
 { label: 'Calendar', href: '/faculty/calendar', icon: <Calendar size={18} /> },
 ],
 hod: [
 { label: 'Dashboard', href: '/hod/dashboard', icon: <LayoutDashboard size={18} /> },
 { label: 'Timetable', href: '/hod/timetable', icon: <Clock size={18} /> },
 { label: 'Faculty', href: '/hod/faculty', icon: <Users size={18} /> },
 { label: 'Students', href: '/hod/students', icon: <GraduationCap size={18} /> },
 { label: 'Courses', href: '/hod/courses', icon: <BookOpen size={18} /> },
 { label: 'Exam Analytics', href: '/hod/exam-analytics', icon: <Target size={18} /> },
 { label: 'Career Analytics', href: '/hod/career-analytics', icon: <Map size={18} /> },
 { label: 'Placement Analytics', href: '/hod/placement-analytics', icon: <Briefcase size={18} /> },
 { label: 'Reports', href: '/hod/reports', icon: <BarChart2 size={18} /> },
 ],
 admin: [
 { label: 'Dashboard', href: '/admin/dashboard', icon: <LayoutDashboard size={18} /> },
 { label: 'Timetable', href: '/admin/timetable', icon: <Clock size={18} /> },
 { label: 'Career Mgmt', href: '/admin/career', icon: <Map size={18} /> },
 { label: 'Exam Prep Mgmt', href: '/admin/exam-preparation', icon: <Target size={18} /> },
 { label: 'Placement Mgmt', href: '/admin/placement', icon: <Briefcase size={18} /> },
 { label: 'Companies', href: '/admin/companies', icon: <Building size={18} /> },
 { label: 'Users', href: '/admin/users', icon: <Users size={18} /> },
 { label: 'Departments', href: '/admin/departments', icon: <Building size={18} /> },
 { label: 'Courses', href: '/admin/courses', icon: <BookOpen size={18} /> },
 { label: 'Analytics', href: '/admin/analytics', icon: <PieChart size={18} /> },
 ],
};

const ROLE_LABELS: Record<Role, string> = {
 student: 'Student Portal',
 faculty: 'Faculty Portal',
 hod: 'HOD Portal',
 admin: 'Admin Portal',
};

interface SidebarProps {
 isOpen: boolean;
 onClose: () => void;
 role: Role;
}

export function Sidebar({ isOpen, onClose, role }: SidebarProps) {
 const pathname = usePathname();
 const { user, logout } = useAuthStore();
 const router = useRouter();
 const navItems = NAV_ITEMS[role] || [];

 const handleLogout = async () => {
 try {
 await authAPI.logout();
 } catch (_) {}
 logout();
 toast.success('Logged out successfully');
 router.push('/login');
 };

 return (
 <aside
 className={cn(
 'sidebar fixed left-0 top-0 h-full z-40 flex flex-col transition-transform duration-300',
 isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
 )}
 style={{ background: 'var(--sidebar-bg)', borderRight: '1px solid var(--sidebar-border)' }}
 >
 {/* Header */}
 <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: 'var(--border)' }}>
 <Link href={`/${role}/dashboard`} className="flex items-center gap-2">
 <div className="w-8 h-8 rounded-xl bg-orange-500 flex items-center justify-center">
 <GraduationCap size={16} className="text-white" />
 </div>
 <div>
 <p className="font-bold text-sm" style={{ color: 'var(--foreground)' }}>CampusLearn</p>
 <p className="text-xs" style={{ color: 'var(--muted)' }}>{ROLE_LABELS[role]}</p>
 </div>
 </Link>
 <button onClick={onClose} className="md:hidden btn-ghost p-1.5 rounded-lg">
 <X size={18} style={{ color: 'var(--muted)' }} />
 </button>
 </div>

 {/* User info */}
 {user && (
 <Link href={`/${role}/profile`} className="flex items-center gap-3 p-4 mx-3 mt-3 rounded-xl transition-all hover:bg-[var(--surface-2)]">
 {user.avatar ? (
 <img src={user.avatar} alt={user.name} className="w-9 h-9 rounded-full object-cover" />
 ) : (
 <div className="w-9 h-9 rounded-full gradient-primary flex items-center justify-center text-white text-sm font-bold">
 {getInitials(user.name)}
 </div>
 )}
 <div className="flex-1 min-w-0">
 <p className="text-sm font-semibold truncate" style={{ color: 'var(--foreground)' }}>{user.name}</p>
 <p className="text-xs truncate capitalize" style={{ color: 'var(--muted)' }}>
 {user.role} {user.rollNumber ? `· ${user.rollNumber}` : ''}
 </p>
 </div>
 <ChevronRight size={14} style={{ color: 'var(--subtle)' }} />
 </Link>
 )}

 {/* Navigation */}
 <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
 {navItems.map((item) => {
 const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
 return (
 <Link
 key={item.href}
 href={item.href}
 onClick={() => onClose()}
 className={cn('sidebar-item', isActive && 'active')}
 >
 {item.icon}
 <span className="flex-1">{item.label}</span>
 {item.badge && (
 <span className="badge text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--primary)', color: 'white' }}>
 {item.badge}
 </span>
 )}
 </Link>
 );
 })}
 </nav>

 {/* Bottom links */}
 <div className="p-3 border-t space-y-1" style={{ borderColor: 'var(--border)' }}>
 <Link href={`/${role}/settings`} className="sidebar-item">
 <Settings size={18} />
 <span>Settings</span>
 </Link>
 <button onClick={handleLogout} className="sidebar-item w-full text-left" style={{ color: 'var(--danger)' }}>
 <LogOut size={18} />
 <span>Logout</span>
 </button>
 </div>
 </aside>
 );
}
