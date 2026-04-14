"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  BarChart3,
  FileText,
  Calendar,
  Bell,
  TrendingUp,
  ChevronRight,
  CheckCircle2,
  XCircle,
  GraduationCap,
  Clock,
  CalendarX
} from 'lucide-react';

interface TeacherStats {
  totalSessions: number;
  totalRecords: number;
  present: number;
  absent: number;
  attendanceRate: number;
  classrooms: any[];
}

interface TimetableSlot {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  subject?: { id: string; name: string };
  classroom?: { 
    id: string; 
    grade: { name: string }; 
    section: { label: string } 
  };
  room?: string;
}

export default function TeacherDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<TeacherStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [teacherName, setTeacherName] = useState('Teacher');
  const [notifications, setNotifications] = useState<any[]>([]);
  const [todaySchedule, setTodaySchedule] = useState<TimetableSlot[]>([]);
  const backendUrl = (process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:4000').replace(/\/$/, '');

  useEffect(() => {
    const savedName = localStorage.getItem("pragati_name");
    if (savedName) setTeacherName(savedName);

    const fetchData = async () => {
      try {
        const token = localStorage.getItem('pragati_token');
        if (!token) return;

        const headers = { Authorization: `Bearer ${token}` };

        // Fetch Attendance Stats
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

        const statsRes = await fetch(`${backendUrl}/api/reports/attendance/teacher?start=${startOfMonth}&end=${endOfMonth}`, { headers });
        if (statsRes.ok) {
          const data = await statsRes.json();
          let totalSessions = 0;
          let totalRecords = 0;
          let present = 0;
          let absent = 0;
          
          if (data.classrooms) {
            data.classrooms.forEach((c: any) => {
              totalSessions += c.totalSessions || 0;
              totalRecords += c.totalRecords || 0;
              present += c.present || 0;
              absent += c.absent || 0;
            });
          }

          setStats({
            totalSessions,
            totalRecords,
            present,
            absent,
            attendanceRate: totalRecords > 0 ? present / totalRecords : 0,
            classrooms: data.classrooms || []
          });
        }

        // Fetch Notifications
        const notifRes = await fetch(`${backendUrl}/api/communications/notifications/active`, { headers });
        if (notifRes.ok) {
          const data = await notifRes.json();
          setNotifications(data.slice(0, 3));
        }

        // Fetch Today's Timetable
        const teacherId = localStorage.getItem('pragati_teacherId');
        if (teacherId) {
          const timetableRes = await fetch(`${backendUrl}/api/timetables/teachers/${teacherId}`, { headers });
          if (timetableRes.ok) {
            const timetableData = await timetableRes.json();
            // Filter for today's schedule
            const today = new Date().getDay(); // 0 = Sunday, 1 = Monday, etc.
            const todaySlots = (Array.isArray(timetableData) ? timetableData : [])
              .filter((slot: TimetableSlot) => slot.dayOfWeek === today)
              .sort((a: TimetableSlot, b: TimetableSlot) => a.startTime.localeCompare(b.startTime));
            setTodaySchedule(todaySlots.slice(0, 3)); // Show max 3 slots
          }
        }

      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [backendUrl]);

  const statCards = [
    {
      label: 'Total Sessions',
      value: stats?.totalSessions || 0,
      icon: FileText,
      color: 'from-blue-500 to-blue-600',
      subtext: 'This month'
    },
    {
      label: 'Attendance Rate',
      value: `${stats ? (stats.attendanceRate * 100).toFixed(1) : 0}%`,
      icon: TrendingUp,
      color: 'from-purple-500 to-purple-600',
      subtext: 'Average presence'
    },
    {
      label: 'Present',
      value: stats?.present || 0,
      icon: CheckCircle2,
      color: 'from-emerald-500 to-emerald-600',
      subtext: 'Student records'
    },
    {
      label: 'Absent',
      value: stats?.absent || 0,
      icon: XCircle,
      color: 'from-red-500 to-red-600',
      subtext: 'Student records'
    }
  ];

  const quickActions = [
    {
      id: 'attendance',
      title: 'Mark Attendance',
      description: 'Record daily attendance',
      icon: FileText,
      href: '/teacher/attendance',
      gradient: 'from-blue-500 to-blue-600'
    },
    {
      id: 'analytics',
      title: 'View Analytics',
      description: 'Check attendance trends',
      icon: BarChart3,
      href: '/teacher/analytics',
      gradient: 'from-purple-500 to-purple-600'
    },
    {
      id: 'exams',
      title: 'Exam Results',
      description: 'Upload student marks',
      icon: GraduationCap,
      href: '/teacher/exams',
      gradient: 'from-emerald-500 to-emerald-600'
    },
    {
      id: 'timetables',
      title: 'Timetables',
      description: 'View class schedule',
      icon: Calendar,
      href: '/teacher/timetables',
      gradient: 'from-orange-500 to-orange-600'
    }
  ];

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        
        <div className="relative z-10">
          <p className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] border border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/30 dark:bg-blue-900/10 dark:text-blue-400 mb-3">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
            Academic Session 2025-26
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold mb-2">
            Welcome back, <span className="gradient-text">{teacherName}</span>
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            Here's an overview of your classes and student performance today.
          </p>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-900 p-4 sm:p-5 hover:border-primary hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`p-2 rounded-lg bg-gradient-to-br ${stat.color} text-white shadow-sm`}>
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
                <p className="text-xl sm:text-2xl font-bold">{loading ? '...' : stat.value}</p>
                <p className="text-[10px] text-muted-foreground mt-1">{stat.subtext}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-lg sm:text-xl font-bold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <motion.button
                key={action.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                onClick={() => router.push(action.href)}
                className="group relative overflow-hidden rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-900 p-5 text-left hover:border-primary hover:shadow-md transition-all duration-200"
              >
                <div className={`inline-flex p-3 rounded-lg bg-gradient-to-br ${action.gradient} text-white mb-3 group-hover:scale-110 transition-transform`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-semibold mb-1 flex items-center justify-between">
                  {action.title}
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 group-hover:text-primary transition" />
                </h4>
                <p className="text-xs text-muted-foreground">{action.description}</p>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Recent Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8 }}
          className="rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base sm:text-lg font-semibold">Recent Notifications</h3>
            <button
              onClick={() => router.push('/teacher/notifications')}
              className="text-xs text-primary hover:underline"
            >
              View all
            </button>
          </div>
          {notifications.length > 0 ? (
            <div className="space-y-3">
              {notifications.map((notif) => (
                <div key={notif.id} className="flex gap-3 p-3 rounded-lg bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-gray-800">
                  <Bell className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">{notif.title}</p>
                    <p className="text-xs text-muted-foreground line-clamp-1">{notif.message}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No new notifications
            </div>
          )}
        </motion.div>

        {/* Today's Schedule */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.9 }}
          className="rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base sm:text-lg font-semibold">Today's Schedule</h3>
            <button
              onClick={() => router.push('/teacher/timetables')}
              className="text-xs text-primary hover:underline"
            >
              View full
            </button>
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="inline-block w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
          ) : todaySchedule.length > 0 ? (
            <div className="space-y-3">
              {todaySchedule.map((slot, index) => {
                const colors = ['text-orange-500', 'text-blue-500', 'text-emerald-500', 'text-purple-500'];
                return (
                  <div 
                    key={slot.id || index} 
                    className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-gray-700"
                  >
                    <Clock className={`w-4 h-4 ${colors[index % colors.length]}`} />
                    <div>
                      <p className="text-sm font-medium">
                        {slot.startTime?.slice(0, 5)} - {slot.subject?.name || 'Class'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {slot.classroom ? `${slot.classroom.grade.name}-${slot.classroom.section.label}` : 'Class'} 
                        {slot.room ? ` • ${slot.room}` : ''}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <CalendarX className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No classes scheduled for today</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
