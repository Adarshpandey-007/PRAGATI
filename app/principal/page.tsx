'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  BarChart3,
  Users,
  Calendar,
  Bell,
  AlertCircle,
  ChevronRight,
  School,
  GraduationCap,
  BookOpen,
  UserPlus,
  MapPin,
  Settings,
  TrendingUp,
  PieChart,
} from 'lucide-react';
import { Language, translations, getTranslation } from '@/lib/translations';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from 'recharts';

interface DashboardStats {
  totalStudents: number;
  totalTeachers: number;
  totalClassrooms: number;
  attendanceRate: number;
  activeComplaints: number;
  pendingNotifications: number;
  todayPresent: number;
  todayAbsent: number;
  todayTeachersPresent: number;
}

interface WeeklyAttendanceData {
  day: string;
  date: string;
  students: number;
  teachers: number;
}

interface AttendanceDistribution {
  name: string;
  value: number;
  color: string;
}

interface ClassroomPerformance {
  name: string;
  attendance: number;
  classroomId: string;
}

function normalizeAttendanceRate(value: unknown): number {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric < 0) return 0;
  if (numeric > 1) return Math.min(numeric / 100, 1);
  return numeric;
}

export default function PrincipalDashboard() {
  const router = useRouter();
  const [principalName, setPrincipalName] = useState('Principal');
  const [lang, setLang] = useState<Language>('en');
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    totalTeachers: 0,
    totalClassrooms: 0,
    attendanceRate: 0,
    activeComplaints: 0,
    pendingNotifications: 0,
    todayPresent: 0,
    todayAbsent: 0,
    todayTeachersPresent: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [chartsLoading, setChartsLoading] = useState(true);
  
  // Chart data states
  const [weeklyAttendanceData, setWeeklyAttendanceData] = useState<WeeklyAttendanceData[]>([]);
  const [attendanceDistribution, setAttendanceDistribution] = useState<AttendanceDistribution[]>([]);
  const [classroomPerformance, setClassroomPerformance] = useState<ClassroomPerformance[]>([]);

  // Helper function for translations
  const t = (section: keyof typeof translations, key: string) => getTranslation(section, key, lang);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('pragati_token');
      const role = localStorage.getItem('pragati_role');
      const name = localStorage.getItem('pragati_name') || 'Principal';
      const savedLang = localStorage.getItem('pragati_language') as Language;
      
      if (savedLang === 'en' || savedLang === 'pa' || savedLang === 'hi') {
        setLang(savedLang);
      }

      if (!token || role !== 'PRINCIPAL') {
        router.push('/login/principal');
        return;
      }

      setPrincipalName(name);
      fetchDashboardData(token);
      fetchChartData(token);
    }
  }, [router]);

  const fetchDashboardData = async (token: string) => {
    setIsLoading(true);
    try {
      const backendUrl = (process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:4000').replace(/\/$/, '');
      
      const [studentsRes, teachersRes, classroomsRes] = await Promise.all([
        fetch(`${backendUrl}/api/core/students`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${backendUrl}/api/core/teachers`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${backendUrl}/api/core/classrooms`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const students = studentsRes.ok ? await studentsRes.json() : [];
      const teachers = teachersRes.ok ? await teachersRes.json() : [];
      const classrooms = classroomsRes.ok ? await classroomsRes.json() : [];

      const complaintsRes = await fetch(`${backendUrl}/api/complaints`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const complaintsData = complaintsRes.ok ? await complaintsRes.json() : { items: [] };
      
      const complaintsArray = Array.isArray(complaintsData) 
        ? complaintsData 
        : (Array.isArray(complaintsData.items) ? complaintsData.items : []);
      
      const activeComplaintsCount = complaintsArray.filter(
        (c: { status: string }) => c.status === 'open' || c.status === 'in_progress'
      ).length;

      setStats({
        totalStudents: Array.isArray(students) ? students.length : 0,
        totalTeachers: Array.isArray(teachers) ? teachers.length : 0,
        totalClassrooms: Array.isArray(classrooms) ? classrooms.length : 0,
        attendanceRate: 0,
        activeComplaints: activeComplaintsCount,
        pendingNotifications: 0,
        todayPresent: 0,
        todayAbsent: 0,
        todayTeachersPresent: 0,
      });

      // Fetch today's attendance data
      const today = new Date().toISOString().split('T')[0];
      try {
        const [todayStudentRes, todayTeacherRes] = await Promise.all([
          fetch(`${backendUrl}/api/reports/attendance/principal?start=${today}&end=${today}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${backendUrl}/api/geo-attendance/admin/summary?startDate=${today}&endDate=${today}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        let todayPresent = 0;
        let todayAbsent = 0;
        let todayTeachersPresent = 0;
        let todayAttendanceRate = 0;

        if (todayStudentRes.ok) {
          const todayData = await todayStudentRes.json();
          if (todayData.totals) {
            todayPresent = todayData.totals.present || 0;
            todayAbsent = todayData.totals.absent || 0;
            todayAttendanceRate = normalizeAttendanceRate(todayData.totals.attendanceRate || 0);
          }
        }

        if (todayTeacherRes.ok) {
          const todayTeacherData = await todayTeacherRes.json();
          if (todayTeacherData.summary && Array.isArray(todayTeacherData.summary)) {
            todayTeachersPresent = todayTeacherData.summary.filter(
              (t: { daysPresent: number }) => t.daysPresent > 0
            ).length;
          }
        }

        setStats(prev => ({
          ...prev,
          todayPresent,
          todayAbsent,
          todayTeachersPresent,
          attendanceRate: todayAttendanceRate,
        }));
      } catch (error) {
        console.error('Error fetching today\'s attendance:', error);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchChartData = async (token: string) => {
    setChartsLoading(true);
    try {
      const backendUrl = (process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:4000').replace(/\/$/, '');
      
      // Get date range for last 7 days
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);
      
      const startStr = startDate.toISOString().split('T')[0];
      const endStr = endDate.toISOString().split('T')[0];

      // Fetch attendance report for student data
      const [attendanceReportRes, teacherSummaryRes] = await Promise.all([
        fetch(`${backendUrl}/api/reports/attendance/principal?start=${startStr}&end=${endStr}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${backendUrl}/api/geo-attendance/admin/summary?startDate=${startStr}&endDate=${endStr}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      // Process student attendance report
      if (attendanceReportRes.ok) {
        const reportData = await attendanceReportRes.json();
        
        // Set attendance distribution from totals
        if (reportData.totals) {
          const { present, absent, late, excused, totalRecords } = reportData.totals;
          const total = totalRecords || 1;
          setAttendanceDistribution([
            { name: 'Present', value: Math.round((present / total) * 100), color: '#22c55e' },
            { name: 'Absent', value: Math.round((absent / total) * 100), color: '#ef4444' },
            { name: 'Late', value: Math.round((late / total) * 100), color: '#f59e0b' },
            { name: 'Excused', value: Math.round((excused / total) * 100), color: '#6366f1' },
          ]);
        }

        // Set classroom performance from classrooms data
        if (reportData.classrooms && Array.isArray(reportData.classrooms)) {
          const classroomData = reportData.classrooms
            .slice(0, 8)
            .map((classroom: { classroomId: string; grade: { name: string }; section: { label: string }; attendanceRate: number }) => ({
              name: `${classroom.grade.name}-${classroom.section.label}`,
              attendance: Math.round(normalizeAttendanceRate(classroom.attendanceRate) * 100),
              classroomId: classroom.classroomId,
            }))
            .sort((a: ClassroomPerformance, b: ClassroomPerformance) => b.attendance - a.attendance);
          setClassroomPerformance(classroomData);
        }
      }

      // Process teacher attendance summary and build weekly data
      const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const weeklyData: WeeklyAttendanceData[] = [];
      
      // Generate data for last 7 days
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dayName = weekDays[date.getDay()];
        const dateStr = date.toISOString().split('T')[0];
        
        weeklyData.push({
          day: dayName,
          date: dateStr,
          students: 0,
          teachers: 0,
        });
      }

      // Fetch daily teacher attendance for each day
      if (teacherSummaryRes.ok) {
        const summaryData = await teacherSummaryRes.json();
        const totalTeachers = summaryData.totalTeachers || 1;
        
        if (summaryData.summary && Array.isArray(summaryData.summary)) {
          // Calculate average teacher attendance percentage
          const avgTeacherAttendance = summaryData.summary.reduce(
            (acc: number, t: { daysPresent: number }) => acc + (t.daysPresent / 7) * 100,
            0
          ) / (summaryData.summary.length || 1);
          
          // Update weekly data with teacher attendance
          weeklyData.forEach((day) => {
            day.teachers = Math.round(avgTeacherAttendance);
          });
        }
      }

      // Fetch daily student attendance for each day
      for (const day of weeklyData) {
        try {
          const dailyRes = await fetch(
            `${backendUrl}/api/reports/attendance/principal?start=${day.date}&end=${day.date}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          if (dailyRes.ok) {
            const dailyData = await dailyRes.json();
            if (dailyData.totals) {
              day.students = Math.round(normalizeAttendanceRate(dailyData.totals.attendanceRate) * 100);
            }
          }
        } catch {
          // Keep default value of 0
        }
      }

      setWeeklyAttendanceData(weeklyData);
    } catch (error) {
      console.error('Error fetching chart data:', error);
      // Set fallback data
      setWeeklyAttendanceData([
        { day: 'Mon', date: '', students: 0, teachers: 0 },
        { day: 'Tue', date: '', students: 0, teachers: 0 },
        { day: 'Wed', date: '', students: 0, teachers: 0 },
        { day: 'Thu', date: '', students: 0, teachers: 0 },
        { day: 'Fri', date: '', students: 0, teachers: 0 },
        { day: 'Sat', date: '', students: 0, teachers: 0 },
        { day: 'Sun', date: '', students: 0, teachers: 0 },
      ]);
      setAttendanceDistribution([
        { name: 'Present', value: 0, color: '#22c55e' },
        { name: 'Absent', value: 0, color: '#ef4444' },
        { name: 'Late', value: 0, color: '#f59e0b' },
        { name: 'Excused', value: 0, color: '#6366f1' },
      ]);
      setClassroomPerformance([]);
    } finally {
      setChartsLoading(false);
    }
  };

  const quickActions = [
    {
      id: 'reports',
      title: t('actions', 'attendanceReports'),
      description: t('actions', 'attendanceReportsDesc'),
      icon: BarChart3,
      gradient: 'from-blue-500 to-cyan-500',
      href: '/principal/reports',
    },
    {
      id: 'teacher-attendance',
      title: t('actions', 'teacherAttendance'),
      description: t('actions', 'teacherAttendanceDesc'),
      icon: MapPin,
      gradient: 'from-green-500 to-emerald-500',
      href: '/principal/teacher-attendance',
    },
    {
      id: 'complaints',
      title: t('actions', 'complaints'),
      description: t('actions', 'complaintsDesc'),
      icon: AlertCircle,
      gradient: 'from-orange-500 to-rose-500',
      href: '/principal/complaints',
    },
    {
      id: 'notifications',
      title: t('actions', 'notifications'),
      description: t('actions', 'notificationsDesc'),
      icon: Bell,
      gradient: 'from-purple-500 to-indigo-500',
      href: '/principal/notifications',
    },
  ];

  const statCards = [
    {
      label: t('stats', 'todayPresent'),
      value: stats.todayPresent,
      icon: GraduationCap,
      color: 'from-emerald-500 to-green-500',
      href: '/principal/reports',
      subtitle: `of ${stats.totalStudents} students`,
    },
    {
      label: t('stats', 'todayAbsent'),
      value: stats.todayAbsent,
      icon: Users,
      color: 'from-red-500 to-rose-500',
      href: '/principal/reports',
      subtitle: 'students absent',
    },
    {
      label: t('stats', 'todayTeachers'),
      value: stats.todayTeachersPresent,
      icon: Users,
      color: 'from-blue-500 to-cyan-500',
      href: '/principal/teacher-attendance',
      subtitle: `of ${stats.totalTeachers} teachers`,
    },
    {
      label: t('stats', 'todayAttendance'),
      value: `${Math.round(stats.attendanceRate * 100)}%`,
      icon: TrendingUp,
      color: 'from-purple-500 to-indigo-500',
      href: '/principal/reports',
      subtitle: 'attendance rate',
    },
  ];

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
          
          <div className="relative z-10">
            <p className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] border border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-900/30 dark:bg-orange-900/10 dark:text-orange-400 mb-3">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-orange-500 animate-pulse" />
              {t('dashboard', 'schoolAdministration')}
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold mb-2">
              {t('dashboard', 'goodMorning')}, <span className="gradient-text">{principalName}</span>
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground">
              {t('dashboard', 'overview')}
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
              >
                <Link
                  href={stat.href}
                  className="block rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-900 p-4 sm:p-5 hover:border-primary hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className={`p-2 rounded-lg bg-gradient-to-br ${stat.color} text-white shadow-sm`}>
                      <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
                    <p className="text-xl sm:text-2xl font-bold">{isLoading ? '...' : stat.value}</p>
                    {stat.subtitle && (
                      <p className="text-[10px] text-muted-foreground mt-0.5">{stat.subtitle}</p>
                    )}
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div>
          <h3 className="text-lg sm:text-xl font-bold mb-4">{t('dashboard', 'quickActions')}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <motion.div
                  key={action.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                >
                  <Link
                    href={action.href}
                    className="group block relative overflow-hidden rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-900 p-5 hover:border-primary hover:shadow-md transition-all duration-200"
                  >
                    <div className={`inline-flex p-3 rounded-lg bg-gradient-to-br ${action.gradient} text-white mb-3 group-hover:scale-110 transition-transform`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <h4 className="text-sm font-semibold mb-1 flex items-center justify-between">
                      {action.title}
                      <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 group-hover:text-primary transition" />
                    </h4>
                    <p className="text-xs text-muted-foreground">{action.description}</p>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Analytics Charts Section */}
        <div>
          <h3 className="text-lg sm:text-xl font-bold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Analytics Overview
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Weekly Attendance Trend */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-sm"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-base font-semibold">Weekly Attendance Trend</h4>
                  <p className="text-xs text-muted-foreground mt-1">Student vs Teacher attendance (last 7 days)</p>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-primary" />
                    <span>Students</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span>Teachers</span>
                  </div>
                </div>
              </div>
              <div className="h-[220px] w-full">
                {chartsLoading ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="inline-block w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                  </div>
                ) : weeklyAttendanceData.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
                    No attendance data available
                  </div>
                ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={weeklyAttendanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorTeachers" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                    <XAxis 
                      dataKey="day" 
                      tick={{ fontSize: 11 }} 
                      tickLine={false}
                      axisLine={false}
                      className="fill-muted-foreground"
                    />
                    <YAxis 
                      tick={{ fontSize: 11 }} 
                      tickLine={false}
                      axisLine={false}
                      domain={[0, 100]}
                      className="fill-muted-foreground"
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--background))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        fontSize: '12px'
                      }}
                      formatter={(value: number) => [`${value}%`, '']}
                    />
                    <Area
                      type="monotone"
                      dataKey="students"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorStudents)"
                      name="Students"
                    />
                    <Area
                      type="monotone"
                      dataKey="teachers"
                      stroke="#22c55e"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorTeachers)"
                      name="Teachers"
                    />
                  </AreaChart>
                </ResponsiveContainer>
                )}
              </div>
            </motion.div>

            {/* Attendance Distribution Pie Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-sm"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-base font-semibold">Attendance Distribution</h4>
                  <p className="text-xs text-muted-foreground mt-1">Overall attendance breakdown (last 7 days)</p>
                </div>
                <PieChart className="w-5 h-5 text-muted-foreground" />
              </div>
              {chartsLoading ? (
                <div className="h-[180px] flex items-center justify-center">
                  <div className="inline-block w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                </div>
              ) : attendanceDistribution.every(item => item.value === 0) ? (
                <div className="h-[180px] flex items-center justify-center text-sm text-muted-foreground">
                  No attendance data available
                </div>
              ) : (
              <div className="flex items-center gap-4">
                <div className="h-[180px] w-[180px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={attendanceDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {attendanceDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--background))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                          fontSize: '12px'
                        }}
                        formatter={(value: number) => [`${value}%`, '']}
                      />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex-1 space-y-2">
                  {attendanceDistribution.map((item) => (
                    <div key={item.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-sm">{item.name}</span>
                      </div>
                      <span className="text-sm font-semibold">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
              )}
            </motion.div>
          </div>

          {/* Classroom Performance Bar Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-4 sm:mt-6 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-base font-semibold">Classroom Attendance Comparison</h4>
                <p className="text-xs text-muted-foreground mt-1">Top performing classrooms by attendance rate</p>
              </div>
              <Link
                href="/principal/reports"
                className="text-xs text-primary hover:underline flex items-center gap-1"
              >
                View Details <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="h-[200px] w-full">
              {chartsLoading ? (
                <div className="h-full flex items-center justify-center">
                  <div className="inline-block w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                </div>
              ) : classroomPerformance.length === 0 ? (
                <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
                  No classroom data available
                </div>
              ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={classroomPerformance} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 10 }} 
                    tickLine={false}
                    axisLine={false}
                    className="fill-muted-foreground"
                  />
                  <YAxis 
                    tick={{ fontSize: 11 }} 
                    tickLine={false}
                    axisLine={false}
                    domain={[0, 100]}
                    className="fill-muted-foreground"
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                    formatter={(value: number) => [`${value}%`, 'Attendance']}
                  />
                  <Bar 
                    dataKey="attendance" 
                    fill="hsl(var(--primary))" 
                    radius={[4, 4, 0, 0]}
                    maxBarSize={50}
                  />
                </BarChart>
              </ResponsiveContainer>
              )}
            </div>
          </motion.div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Recent Complaints */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base sm:text-lg font-semibold">{t('dashboard', 'recentComplaints')}</h3>
              <Link
                href="/principal/complaints"
                className="text-xs text-primary hover:underline"
              >
                {t('common', 'viewAll')}
              </Link>
            </div>
            {stats.activeComplaints > 0 ? (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800">
                <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                <p className="text-sm text-orange-700 dark:text-orange-300">
                  {stats.activeComplaints} {stats.activeComplaints !== 1 ? t('dashboard', 'activeComplaints') : t('dashboard', 'activeComplaint')}
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">{t('dashboard', 'noActiveComplaints')}</p>
            )}
          </motion.div>

          {/* Quick Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
            className="rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-sm"
          >
            <h3 className="text-base sm:text-lg font-semibold mb-4">{t('dashboard', 'quickAccess')}</h3>
            <div className="space-y-3">
              <Link
                href="/principal/reports"
                className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-slate-700 transition"
              >
                <BarChart3 className="w-4 h-4 text-primary" />
                <span className="text-xs font-medium">{t('dashboard', 'viewAttendanceReports')}</span>
                <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto" />
              </Link>
              <Link
                href="/principal/timetables"
                className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-slate-700 transition"
              >
                <Calendar className="w-4 h-4 text-primary" />
                <span className="text-xs font-medium">{t('dashboard', 'manageTimetables')}</span>
                <ChevronRight className="w-4 h-4 text-muted-foreground ml-auto" />
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
