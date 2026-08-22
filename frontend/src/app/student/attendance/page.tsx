'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { attendanceAPI } from '@/lib/api';
import {
  UserCheck, AlertTriangle, CheckCircle, Clock, TrendingUp, Bell, X,
  ChevronDown, ChevronUp, Mail, Smartphone, BookOpen, Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { LineChart } from '@/components/charts/Charts';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { PageHeaderSkeleton } from '@/components/shared/Skeleton';

interface AttendanceSummary {
  course: string;
  title: string;
  total: number;
  present: number;
  absent: number;
  late: number;
  percentage: number;
}

interface NotificationPrefs {
  attendanceAlerts: boolean;
  dailySummary: boolean;
  smsCritical: boolean;
  assignmentReminders: boolean;
  examAlerts: boolean;
}

const DEFAULT_PREFS: NotificationPrefs = {
  attendanceAlerts: true,
  dailySummary: false,
  smsCritical: true,
  assignmentReminders: true,
  examAlerts: true,
};

// Mock attendance data for Arjun — reflects his real low attendance situation
const MOCK_ATTENDANCE: AttendanceSummary[] = [
  { course: 'c1', title: 'Database Management Systems', total: 20, present: 12, absent: 8, late: 0, percentage: 60 },
  { course: 'c2', title: 'Operating Systems', total: 18, present: 11, absent: 7, late: 0, percentage: 61 },
  { course: 'c3', title: 'Data Structures & Algorithms', total: 22, present: 14, absent: 8, late: 0, percentage: 64 },
  { course: 'c4', title: 'Computer Networks', total: 16, present: 9, absent: 7, late: 0, percentage: 56 },
];

function prefsKey(userId: string) {
  return `notificationPrefs_${userId}`;
}

function loadPrefs(userId: string): NotificationPrefs {
  try {
    const raw = localStorage.getItem(prefsKey(userId));
    return raw ? { ...DEFAULT_PREFS, ...JSON.parse(raw) } : DEFAULT_PREFS;
  } catch {
    return DEFAULT_PREFS;
  }
}

// Calculate how many more classes Arjun needs to attend to reach 75%
// Formula: ceil((0.75 * total - present) / (1 - 0.75)) = ceil((0.75*total - present) / 0.25)
function classesNeededFor75(total: number, present: number): number {
  if (total === 0) return 0;
  // We need: (present + x) / (total + x) >= 0.75
  // Solving: x >= (0.75*total - present) / 0.25
  const needed = Math.ceil((0.75 * total - present) / 0.25);
  return Math.max(0, needed);
}

function ToggleSwitch({ enabled, onChange, disabled }: { enabled: boolean; onChange: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      disabled={disabled}
      onClick={onChange}
      className={`relative w-12 h-7 rounded-full transition-colors duration-200 shrink-0 ${
        enabled ? 'bg-orange-500' : 'bg-zinc-200 dark:bg-zinc-700'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <motion.div
        layout
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-sm ${
          enabled ? 'left-6' : 'left-1'
        }`}
      />
    </button>
  );
}

export default function StudentAttendancePage() {
  const { user } = useAuthStore();
  const [attendance, setAttendance] = useState<AttendanceSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'at-risk' | 'good'>('all');
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [prefs, setPrefs] = useState<NotificationPrefs>(DEFAULT_PREFS);
  const [prefsDraft, setPrefsDraft] = useState<NotificationPrefs>(DEFAULT_PREFS);
  const [isSavingPrefs, setIsSavingPrefs] = useState(false);

  useEffect(() => {
    if (user?._id) setPrefs(loadPrefs(user._id));
  }, [user?._id]);

  useEffect(() => {
    const fetchAttendance = async () => {
      setIsLoading(true);
      try {
        const res = await attendanceAPI.getMine();
        const data: AttendanceSummary[] = res.data?.data || [];
        setAttendance(data.length > 0 ? data : MOCK_ATTENDANCE);
      } catch {
        setAttendance(MOCK_ATTENDANCE);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAttendance();
  }, []);

  const overall = attendance.length > 0
    ? Math.round(attendance.reduce((s, a) => s + a.percentage, 0) / attendance.length)
    : 0;

  const totalPresent = attendance.reduce((s, a) => s + a.present, 0);
  const totalAbsent = attendance.reduce((s, a) => s + a.absent, 0);
  const totalLate = attendance.reduce((s, a) => s + a.late, 0);
  const shortageAlerts = attendance.filter(a => a.percentage < 75);

  const trendData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'],
    datasets: [{ label: 'Attendance %', data: [90, 85, 82, 88, 78, overall || 85], color: '#f97316' }],
  };

  const filtered = attendance.filter(a => {
    if (filter === 'at-risk') return a.percentage < 75;
    if (filter === 'good') return a.percentage >= 75;
    return true;
  });

  const openSettings = () => {
    setPrefsDraft(prefs);
    setIsSettingsOpen(true);
  };

  const savePrefs = () => {
    setIsSavingPrefs(true);
    setTimeout(() => {
      setPrefs(prefsDraft);
      if (user?._id) localStorage.setItem(prefsKey(user._id), JSON.stringify(prefsDraft));
      setIsSavingPrefs(false);
      setIsSettingsOpen(false);
      toast.success('Notification preferences saved!');
    }, 400);
  };

  const togglePref = (key: keyof NotificationPrefs) => {
    setPrefsDraft(p => ({ ...p, [key]: !p[key] }));
  };

  const getStatusBadge = (pct: number) => {
    if (pct >= 85) return { label: 'Excellent', className: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' };
    if (pct >= 75) return { label: 'Good', className: 'bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400' };
    if (pct >= 60) return { label: 'Warning', className: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400' };
    return { label: 'Critical', className: 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400' };
  };

  const getBarColor = (pct: number) =>
    pct >= 75 ? 'bg-emerald-500' : pct >= 60 ? 'bg-amber-500' : 'bg-red-500';

  const getRingColor = (pct: number) =>
    pct >= 75 ? 'text-emerald-500' : pct >= 60 ? 'text-amber-500' : 'text-red-500';

  const NOTIFICATION_OPTIONS: { key: keyof NotificationPrefs; icon: typeof Bell; title: string; desc: string }[] = [
    { key: 'attendanceAlerts', icon: AlertTriangle, title: 'Attendance Alerts', desc: 'Notify when any course drops below 75%' },
    { key: 'dailySummary', icon: Mail, title: 'Daily Summary', desc: 'Morning email with your attendance status' },
    { key: 'smsCritical', icon: Smartphone, title: 'SMS Alerts (Critical)', desc: 'SMS for severe shortage warnings' },
    { key: 'assignmentReminders', icon: BookOpen, title: 'Assignment Reminders', desc: 'Reminders for pending submissions' },
    { key: 'examAlerts', icon: Clock, title: 'Exam Alerts', desc: 'Upcoming exam and deadline notifications' },
  ];

  if (isLoading) {
    return (
      <DashboardLayout requiredRole="student">
        <PageHeaderSkeleton />
        <div className="grid lg:grid-cols-4 gap-5 mb-6">
          <div className="skeleton h-48 rounded-3xl lg:col-span-1" />
          <div className="skeleton h-48 rounded-3xl lg:col-span-2" />
          <div className="skeleton h-48 rounded-3xl lg:col-span-1" />
        </div>
        <div className="space-y-4">
          {Array(4).fill(null).map((_, i) => (
            <div key={i} className="skeleton h-24 rounded-3xl" />
          ))}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout requiredRole="student">
      {/* Notification Settings Modal */}
      <AnimatePresence>
        {isSettingsOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-zinc-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => !isSavingPrefs && setIsSettingsOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={e => e.stopPropagation()}
              className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-50 dark:bg-orange-500/10 rounded-xl flex items-center justify-center">
                      <Bell size={20} className="text-orange-500" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-zinc-900 dark:text-white">Notification Settings</h2>
                      <p className="text-xs text-zinc-500">Manage how you stay informed</p>
                    </div>
                  </div>
                  <button
                    onClick={() => !isSavingPrefs && setIsSettingsOpen(false)}
                    className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl text-zinc-400 transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-3 max-h-[60vh] overflow-y-auto">
                {NOTIFICATION_OPTIONS.map(({ key, icon: Icon, title, desc }) => (
                  <div
                    key={key}
                    className="flex items-center justify-between gap-4 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800 hover:border-orange-500/30 transition-colors"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="p-2 bg-zinc-50 dark:bg-zinc-800 rounded-xl shrink-0">
                        <Icon size={16} className="text-zinc-500" />
                      </div>
                      <div>
                        <p className="font-bold text-sm text-zinc-900 dark:text-white">{title}</p>
                        <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">{desc}</p>
                      </div>
                    </div>
                    <ToggleSwitch
                      enabled={prefsDraft[key]}
                      onChange={() => togglePref(key)}
                      disabled={isSavingPrefs}
                    />
                  </div>
                ))}
              </div>

              <div className="p-6 border-t border-zinc-100 dark:border-zinc-800 flex gap-3">
                <button
                  onClick={() => setIsSettingsOpen(false)}
                  disabled={isSavingPrefs}
                  className="flex-1 py-3 text-sm font-bold text-zinc-500 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-xl transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={savePrefs}
                  disabled={isSavingPrefs}
                  className="flex-1 py-3 text-sm font-bold bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white rounded-xl transition-colors shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2"
                >
                  {isSavingPrefs ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : 'Save Preferences'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">My Attendance</h1>
          <p className="text-sm mt-0.5 text-zinc-500">Track your presence across all enrolled courses</p>
        </div>
        <button
          onClick={openSettings}
          className="py-2.5 px-5 bg-zinc-100 dark:bg-zinc-800 hover:bg-orange-50 dark:hover:bg-orange-500/10 text-zinc-700 dark:text-zinc-300 hover:text-orange-600 dark:hover:text-orange-400 font-bold rounded-xl text-sm transition-colors flex items-center gap-2 border border-zinc-200 dark:border-zinc-700 hover:border-orange-500/30"
        >
          <Bell size={16} /> Notification Settings
        </button>
      </div>

      {/* Shortage Alert */}
      <AnimatePresence>
        {shortageAlerts.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 p-5 rounded-3xl border border-red-200 dark:border-red-500/20 bg-red-50/50 dark:bg-red-500/5"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 bg-red-100 dark:bg-red-500/10 text-red-500 rounded-2xl shrink-0">
                <AlertTriangle size={22} />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-red-700 dark:text-red-400">Attendance Shortage Detected</h3>
                <p className="text-sm text-red-600/80 dark:text-red-400/80 mt-1 leading-relaxed">
                  You&apos;re below the mandatory 75% threshold in {shortageAlerts.length} course{shortageAlerts.length > 1 ? 's' : ''}.
                  Attend upcoming classes to avoid exam debarment.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {shortageAlerts.map(c => (
                    <span key={c.course} className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-lg">
                      {c.title}: {c.percentage}%
                      <span className="font-medium opacity-70">· need {classesNeededFor75(c.total, c.present)} more</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-2xl border border-emerald-200 dark:border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-500/5 flex items-center gap-3"
          >
            <CheckCircle size={20} className="text-emerald-500 shrink-0" />
            <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
              Great job! Your attendance is above 75% in all subjects.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-zinc-900/40 p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 flex flex-col items-center text-center backdrop-blur-sm hover:border-orange-500/30 transition-all"
        >
          <div className="relative w-24 h-24 mb-3">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="8" className="text-zinc-100 dark:text-zinc-800" />
              <circle
                cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="8"
                strokeDasharray={`${overall * 2.64} 264`}
                strokeLinecap="round"
                className={getRingColor(overall)}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`text-2xl font-bold ${getRingColor(overall)}`}>{overall}%</span>
            </div>
          </div>
          <p className="font-bold text-zinc-900 dark:text-white text-sm">Overall</p>
          <p className="text-xs text-zinc-500 mt-0.5">{overall >= 75 ? 'Above minimum' : 'Below 75% threshold'}</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="bg-white dark:bg-zinc-900/40 p-5 rounded-3xl border border-zinc-200 dark:border-zinc-800 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl"><CheckCircle size={18} className="text-emerald-500" /></div>
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Present</p>
          </div>
          <p className="text-3xl font-bold text-zinc-900 dark:text-white">{totalPresent}</p>
          <p className="text-xs text-zinc-500 mt-1">classes attended</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-white dark:bg-zinc-900/40 p-5 rounded-3xl border border-zinc-200 dark:border-zinc-800 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-red-50 dark:bg-red-500/10 rounded-xl"><AlertTriangle size={18} className="text-red-500" /></div>
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Absent</p>
          </div>
          <p className="text-3xl font-bold text-zinc-900 dark:text-white">{totalAbsent}</p>
          <p className="text-xs text-zinc-500 mt-1">{totalLate} late arrivals</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="bg-white dark:bg-zinc-900/40 p-5 rounded-3xl border border-zinc-200 dark:border-zinc-800 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-orange-50 dark:bg-orange-500/10 rounded-xl"><TrendingUp size={18} className="text-orange-500" /></div>
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">At Risk</p>
          </div>
          <p className="text-3xl font-bold text-zinc-900 dark:text-white">{shortageAlerts.length}</p>
          <p className="text-xs text-zinc-500 mt-1">courses below 75%</p>
        </motion.div>
      </div>

      {/* ── Risk Level Detection Cards ────────────────────────────────────── */}
      <div className="mb-6">
        <h3 className="font-bold text-zinc-900 dark:text-white mb-3 flex items-center gap-2 text-sm">
          <AlertTriangle size={16} className="text-orange-500" /> Shortage Detection & Risk Levels
        </h3>
        <div className="grid sm:grid-cols-2 gap-3">
          {attendance.map(a => {
            const needed = classesNeededFor75(a.total, a.present);
            const canMiss = a.percentage >= 75 ? Math.floor((a.present - 0.75 * a.total) / 0.75) : 0;
            const risk: 'CRITICAL' | 'SHORTAGE RISK' | 'WARNING' | 'SAFE' =
              a.percentage < 70 ? 'CRITICAL' :
              a.percentage < 75 ? 'SHORTAGE RISK' :
              a.percentage < 85 ? 'WARNING' : 'SAFE';
            const riskStyle = {
              'CRITICAL':      { border: 'border-red-300 dark:border-red-500/40', bg: 'bg-red-50 dark:bg-red-500/5', badge: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400', dot: 'bg-red-500', msg: `Attend next ${needed} class${needed !== 1 ? 'es' : ''} immediately!` },
              'SHORTAGE RISK': { border: 'border-amber-300 dark:border-amber-500/40', bg: 'bg-amber-50 dark:bg-amber-500/5', badge: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400', dot: 'bg-amber-500', msg: `Need ${needed} more class${needed !== 1 ? 'es' : ''} to reach 75%` },
              'WARNING':       { border: 'border-orange-200 dark:border-orange-500/30', bg: 'bg-orange-50/50 dark:bg-orange-500/5', badge: 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400', dot: 'bg-orange-400', msg: `Can miss ${canMiss} more class${canMiss !== 1 ? 'es' : ''}` },
              'SAFE':          { border: 'border-emerald-200 dark:border-emerald-500/30', bg: 'bg-emerald-50/30 dark:bg-emerald-500/5', badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400', dot: 'bg-emerald-500', msg: `Can miss ${canMiss} more class${canMiss !== 1 ? 'es' : ''}` },
            }[risk];
            return (
              <motion.div key={a.course} initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
                className={`p-4 rounded-2xl border ${riskStyle.border} ${riskStyle.bg}`}>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-zinc-900 dark:text-white text-sm truncate">{a.title}</p>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 font-black rounded-full shrink-0 flex items-center gap-1 ${riskStyle.badge}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${riskStyle.dot} ${risk === 'CRITICAL' ? 'animate-pulse' : ''}`} />
                    {risk}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-zinc-500">{a.present}/{a.total} classes</span>
                  <span className="font-black text-zinc-900 dark:text-white">{a.percentage}%</span>
                </div>
                <div className="w-full bg-zinc-200/60 dark:bg-zinc-700/50 rounded-full h-1.5 mb-2">
                  <div className={`h-1.5 rounded-full transition-all ${getBarColor(a.percentage)}`} style={{ width: `${a.percentage}%` }} />
                </div>
                <p className="text-xs font-semibold text-zinc-500">{riskStyle.msg}</p>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Trend Chart */}

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-zinc-900/40 p-5 rounded-3xl border border-zinc-200 dark:border-zinc-800 mb-6 backdrop-blur-sm"
      >
        <h3 className="font-bold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
          <TrendingUp size={18} className="text-orange-500" /> Attendance Trend
        </h3>
        <LineChart labels={trendData.labels} datasets={trendData.datasets} height={180} />
      </motion.div>

      {/* Course Breakdown */}
      <div className="bg-white dark:bg-zinc-900/40 p-5 sm:p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <h3 className="font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <UserCheck size={18} className="text-orange-500" /> Course-wise Breakdown
          </h3>
          <div className="flex gap-1 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-800/50 w-fit">
            {(['all', 'at-risk', 'good'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                  filter === f
                    ? 'bg-white dark:bg-zinc-900 text-orange-500 shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                }`}
              >
                {f === 'at-risk' ? 'At Risk' : f}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <UserCheck size={48} className="mx-auto mb-3 text-zinc-300 dark:text-zinc-600" />
            <p className="font-bold text-zinc-900 dark:text-white">No courses in this filter</p>
            <p className="text-sm text-zinc-500 mt-1">Try switching to a different view</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((a, i) => {
              const status = getStatusBadge(a.percentage);
              const isExpanded = expandedCourse === a.course;
              const needed = classesNeededFor75(a.total, a.present);

              return (
                <motion.div
                  key={a.course}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="rounded-2xl border border-zinc-100 dark:border-zinc-800 overflow-hidden hover:border-orange-500/20 transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => setExpandedCourse(isExpanded ? null : a.course)}
                    className="w-full p-4 text-left"
                  >
                    <div className="flex items-center justify-between gap-4 mb-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-bold text-sm text-zinc-900 dark:text-white">{a.title}</p>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${status.className}`}>{status.label}</span>
                        </div>
                        <div className="flex items-center gap-3 mt-1.5 text-xs text-zinc-500 flex-wrap">
                          <span className="flex items-center gap-1"><CheckCircle size={11} className="text-emerald-500" /> {a.present} present</span>
                          <span className="flex items-center gap-1"><AlertTriangle size={11} className="text-red-400" /> {a.absent} absent</span>
                          {a.late > 0 && <span className="flex items-center gap-1"><Clock size={11} className="text-amber-400" /> {a.late} late</span>}
                          <span>{a.total} total classes</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <p className={`text-2xl font-bold ${a.percentage >= 75 ? 'text-emerald-500' : a.percentage >= 60 ? 'text-amber-500' : 'text-red-500'}`}>
                          {a.percentage}%
                        </p>
                        {isExpanded ? <ChevronUp size={16} className="text-zinc-400" /> : <ChevronDown size={16} className="text-zinc-400" />}
                      </div>
                    </div>
                    <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-2">
                      <div className={`h-2 rounded-full transition-all ${getBarColor(a.percentage)}`} style={{ width: `${a.percentage}%` }} />
                    </div>
                    <div className="mt-1.5 flex justify-between text-[10px] text-zinc-400 font-medium">
                      <span>0%</span>
                      <span className="text-orange-500">75% min</span>
                      <span>100%</span>
                    </div>
                  </button>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 pt-0 border-t border-zinc-100 dark:border-zinc-800">
                          <div className="grid sm:grid-cols-3 gap-3 mt-3">
                            <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl text-center">
                              <p className="text-xs text-zinc-400 font-bold">Present Rate</p>
                              <p className="text-lg font-bold text-emerald-500 mt-1">{Math.round((a.present / a.total) * 100)}%</p>
                            </div>
                            <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl text-center">
                              <p className="text-xs text-zinc-400 font-bold">Classes Left</p>
                              <p className="text-lg font-bold text-zinc-900 dark:text-white mt-1">{a.total - a.present - a.absent}</p>
                            </div>
                            <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl text-center">
                              <p className="text-xs text-zinc-400 font-bold">To Reach 75%</p>
                              <p className={`text-lg font-bold mt-1 ${needed > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                                {needed > 0 ? `${needed} more` : 'Safe ✓'}
                              </p>
                            </div>
                          </div>
                          {a.percentage < 75 && prefs.attendanceAlerts && (
                            <p className="text-xs text-amber-600 dark:text-amber-400 mt-3 flex items-center gap-1.5">
                              <Bell size={12} /> Alerts enabled — you&apos;ll be notified about this course
                            </p>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
