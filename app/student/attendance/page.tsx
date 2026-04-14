'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Calendar,
  Check,
  X,
  Clock,
  AlertCircle,
  TrendingUp,
  Download,
  Target,
  Award,
  CalendarDays,
  BarChart3,
  Info,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
  Area,
  AreaChart,
} from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';

interface AttendanceRecord {
  sessionId: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  attendanceSession: {
    sessionDate: string;
    startsAt: string;
    endsAt: string;
  };
}

interface AttendanceSummary {
  studentId: string;
  today: {
    total: number;
    present: number;
    absent: number;
    late: number;
    excused: number;
    attendanceRate: number;
  };
  thisWeek: {
    total: number;
    present: number;
    absent: number;
    late: number;
    excused: number;
    attendanceRate: number;
  };
  overall: {
    total: number;
    present: number;
    absent: number;
    late: number;
    excused: number;
    attendanceRate: number;
  };
}

// School attendance criteria (75% minimum required)
const SCHOOL_ATTENDANCE_CRITERIA = 75;
const ACADEMIC_YEAR_TOTAL_DAYS = 220; // Approximate school days in a year

export default function StudentAttendancePage() {
  const router = useRouter();
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [summary, setSummary] = useState<AttendanceSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    const token = localStorage.getItem('pragati_token');
    const role = localStorage.getItem('pragati_role');

    if (!token || role !== 'STUDENT') {
      router.push('/login/student');
      return;
    }

    fetchData(token);
  }, [router, dateRange]);

  const fetchData = async (token: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const studentId = localStorage.getItem('pragati_studentId');
      if (!studentId) throw new Error('Student ID not found');

      const backendUrl = (process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:4000').replace(/\/$/, '');

      const [recordsRes, summaryRes] = await Promise.all([
        fetch(`${backendUrl}/api/attendance/students/${studentId}?from=${dateRange.from}&to=${dateRange.to}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${backendUrl}/api/attendance/students/summary?studentId=${studentId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (!recordsRes.ok || !summaryRes.ok) {
        throw new Error('Failed to fetch attendance data');
      }

      const recordsData = await recordsRes.json();
      const summaryData = await summaryRes.json();

      setRecords(Array.isArray(recordsData) ? recordsData : []);
      setSummary(summaryData);
    } catch (err: any) {
      console.error('Error fetching attendance:', err);
      setError(err.message || 'Unable to load attendance data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('pragati_token');
    localStorage.removeItem('pragati_role');
    localStorage.removeItem('pragati_userId');
    router.push('/login/student');
  };

  // Chart configurations
  const pieChartConfig: ChartConfig = {
    present: { label: 'Present', color: '#10b981' },
    absent: { label: 'Absent', color: '#ef4444' },
    late: { label: 'Late', color: '#f59e0b' },
    excused: { label: 'Excused', color: '#3b82f6' },
  };

  // Calculate attendance data for charts
  const attendanceChartData = useMemo(() => {
    if (!summary) return [];
    return [
      { name: 'Present', value: summary.overall.present, fill: '#10b981' },
      { name: 'Absent', value: summary.overall.absent, fill: '#ef4444' },
      { name: 'Late', value: summary.overall.late, fill: '#f59e0b' },
      { name: 'Excused', value: summary.overall.excused, fill: '#3b82f6' },
    ].filter(item => item.value > 0);
  }, [summary]);

  // Calculate monthly attendance trends
  const monthlyTrendData = useMemo(() => {
    if (!records.length) return [];
    
    const monthlyData: { [key: string]: { present: number; absent: number; late: number; total: number } } = {};
    
    records.forEach(record => {
      const date = new Date(record.attendanceSession.sessionDate);
      const monthKey = date.toLocaleDateString('en-US', { month: 'short' });
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { present: 0, absent: 0, late: 0, total: 0 };
      }
      
      monthlyData[monthKey].total++;
      if (record.status === 'present') monthlyData[monthKey].present++;
      else if (record.status === 'absent') monthlyData[monthKey].absent++;
      else if (record.status === 'late') monthlyData[monthKey].late++;
    });
    
    return Object.entries(monthlyData).map(([month, data]) => ({
      month,
      present: data.present,
      absent: data.absent,
      late: data.late,
      rate: Math.round((data.present / data.total) * 100),
    }));
  }, [records]);

  // Calculate attendance rate trend over time (cumulative)
  const attendanceRateTrend = useMemo(() => {
    if (!records.length) return [];
    
    // Sort records by date
    const sortedRecords = [...records].sort(
      (a, b) => new Date(a.attendanceSession.sessionDate).getTime() - new Date(b.attendanceSession.sessionDate).getTime()
    );
    
    let cumulativePresent = 0;
    let cumulativeTotal = 0;
    
    const trendData: { date: string; rate: number; present: number; total: number }[] = [];
    
    sortedRecords.forEach((record, index) => {
      cumulativeTotal++;
      if (record.status === 'present' || record.status === 'late') {
        cumulativePresent++;
      }
      
      const date = new Date(record.attendanceSession.sessionDate);
      const dateKey = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      // Only add data points at regular intervals or for the last record to avoid too many points
      if (index % Math.max(1, Math.floor(sortedRecords.length / 15)) === 0 || index === sortedRecords.length - 1) {
        trendData.push({
          date: dateKey,
          rate: Math.round((cumulativePresent / cumulativeTotal) * 100),
          present: cumulativePresent,
          total: cumulativeTotal,
        });
      }
    });
    
    return trendData;
  }, [records]);

  // Weekly attendance pattern - REPLACED with recent attendance data
  const recentAttendance = useMemo(() => {
    if (!records.length) return [];
    
    // Get last 14 days of attendance
    const sortedRecords = [...records].sort(
      (a, b) => new Date(b.attendanceSession.sessionDate).getTime() - new Date(a.attendanceSession.sessionDate).getTime()
    );
    
    return sortedRecords.slice(0, 14).reverse().map(record => {
      const date = new Date(record.attendanceSession.sessionDate);
      return {
        date: date.toLocaleDateString('en-US', { day: 'numeric' }),
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        status: record.status,
        fullDate: date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }),
      };
    });
  }, [records]);

  // Calculate classes needed to meet criteria
  const criteriaAnalysis = useMemo(() => {
    if (!summary) return null;
    
    const { present, total, absent, late } = summary.overall;
    const currentRate = total > 0 ? (present / total) * 100 : 0;
    const requiredRate = SCHOOL_ATTENDANCE_CRITERIA;
    
    // Calculate remaining days in academic year (approximate)
    const remainingDays = Math.max(0, ACADEMIC_YEAR_TOTAL_DAYS - total);
    
    // Calculate how many classes need to be attended to reach criteria
    // If current rate is below required, calculate classes needed
    let classesNeeded = 0;
    let canMeetCriteria = true;
    let daysCanMiss = 0;
    
    if (currentRate < requiredRate) {
      // Need to attend more classes to meet criteria
      // (present + x) / (total + x) >= requiredRate / 100
      // present + x >= (total + x) * requiredRate / 100
      // present + x >= total * requiredRate / 100 + x * requiredRate / 100
      // x - x * requiredRate / 100 >= total * requiredRate / 100 - present
      // x * (1 - requiredRate / 100) >= total * requiredRate / 100 - present
      // x >= (total * requiredRate / 100 - present) / (1 - requiredRate / 100)
      
      const numerator = (total * requiredRate / 100) - present;
      const denominator = 1 - (requiredRate / 100);
      classesNeeded = Math.ceil(numerator / denominator);
      
      if (classesNeeded > remainingDays) {
        canMeetCriteria = false;
      }
    } else {
      // Already meeting criteria, calculate how many days can be missed
      // (present) / (total + y) >= requiredRate / 100
      // present >= (total + y) * requiredRate / 100
      // present * 100 / requiredRate >= total + y
      // y <= present * 100 / requiredRate - total
      
      daysCanMiss = Math.floor((present * 100 / requiredRate) - total);
      daysCanMiss = Math.min(daysCanMiss, remainingDays);
    }
    
    return {
      currentRate: Math.round(currentRate),
      requiredRate,
      classesNeeded,
      canMeetCriteria,
      daysCanMiss,
      remainingDays,
      isMeetingCriteria: currentRate >= requiredRate,
      progressToGoal: Math.min(100, (currentRate / requiredRate) * 100),
    };
  }, [summary]);

  // Weekly attendance streak calculation
  const attendanceStreak = useMemo(() => {
    if (!records.length) return { current: 0, longest: 0 };
    
    const sortedRecords = [...records].sort(
      (a, b) => new Date(b.attendanceSession.sessionDate).getTime() - new Date(a.attendanceSession.sessionDate).getTime()
    );
    
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    
    for (const record of sortedRecords) {
      if (record.status === 'present' || record.status === 'late') {
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        if (currentStreak === 0) currentStreak = tempStreak;
        tempStreak = 0;
      }
    }
    
    if (currentStreak === 0) currentStreak = tempStreak;
    longestStreak = Math.max(longestStreak, tempStreak);
    
    return { current: currentStreak, longest: longestStreak };
  }, [records]);

  const getStatusBadge = (status: string) => {
    const badges = {
      present: {
        icon: <Check className="w-3 h-3" />,
        className: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
        label: 'Present',
      },
      absent: {
        icon: <X className="w-3 h-3" />,
        className: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
        label: 'Absent',
      },
      late: {
        icon: <Clock className="w-3 h-3" />,
        className: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20',
        label: 'Late',
      },
      excused: {
        icon: <AlertCircle className="w-3 h-3" />,
        className: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
        label: 'Excused',
      },
    };

    const badge = badges[status as keyof typeof badges] || badges.absent;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border ${badge.className}`}>
        {badge.icon}
        {badge.label}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:4rem_4rem] dark:bg-slate-950">
      {/* Top Government Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-orange-600 to-orange-500 text-white px-4 py-2 text-xs sm:text-sm shadow-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-white/20 rounded flex items-center justify-center text-xs font-bold">
              ðŸ‡®ðŸ‡³
            </div>
            <span className="font-semibold hidden sm:inline">GOVERNMENT OF INDIA</span>
            <span className="font-semibold sm:hidden">GOI</span>
          </div>
          <span className="text-[10px] sm:text-xs font-medium">SIH 2026 • MoE & Govt. of Punjab Â· PRAGATI Portal</span>
        </div>
      </div>

      {/* Main Header */}
      <header className="fixed top-8 sm:top-10 left-0 right-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => router.back()}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <div className="p-2 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-sm sm:text-lg font-bold text-gray-900 dark:text-white">Attendance Record</h1>
                <p className="text-[10px] sm:text-xs text-muted-foreground">
                  Track your daily attendance
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="pt-[88px] sm:pt-24 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-4 sm:space-y-5">
          {/* Summary Cards */}
          {summary && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900 p-6"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Today</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Attendance Rate</span>
                    <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                      {(summary.today.attendanceRate * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs">
                    <span className="text-emerald-600 dark:text-emerald-400">âœ“ {summary.today.present}</span>
                    <span className="text-red-600 dark:text-red-400">âœ— {summary.today.absent}</span>
                    <span className="text-amber-600 dark:text-amber-400">â° {summary.today.late}</span>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900 p-6"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">This Week</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Attendance Rate</span>
                    <span className="text-lg font-bold text-purple-600 dark:text-purple-400">
                      {(summary.thisWeek.attendanceRate * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs">
                    <span className="text-emerald-600 dark:text-emerald-400">âœ“ {summary.thisWeek.present}</span>
                    <span className="text-red-600 dark:text-red-400">âœ— {summary.thisWeek.absent}</span>
                    <span className="text-amber-600 dark:text-amber-400">â° {summary.thisWeek.late}</span>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900 p-6"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400">
                    <Check className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Overall</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Attendance Rate</span>
                    <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                      {(summary.overall.attendanceRate * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs">
                    <span className="text-emerald-600 dark:text-emerald-400">âœ“ {summary.overall.present}</span>
                    <span className="text-red-600 dark:text-red-400">âœ— {summary.overall.absent}</span>
                    <span className="text-amber-600 dark:text-amber-400">â° {summary.overall.late}</span>
                  </div>
                </div>
              </motion.div>
            </div>
          )}

          {/* Attendance Charts Section */}
          {summary && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Pie Chart - Attendance Distribution */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900 p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
                    <BarChart3 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Attendance Distribution</h3>
                    <p className="text-xs text-muted-foreground">Present vs Total Days</p>
                  </div>
                </div>
                
                {attendanceChartData.length > 0 ? (
                  <div className="h-[250px] sm:h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={attendanceChartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          paddingAngle={3}
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          labelLine={false}
                        >
                          {attendanceChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                          }}
                        />
                        <Legend 
                          verticalAlign="bottom" 
                          height={36}
                          formatter={(value) => <span className="text-xs text-gray-600 dark:text-gray-400">{value}</span>}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-[250px] flex items-center justify-center">
                    <p className="text-sm text-muted-foreground">No data available</p>
                  </div>
                )}

                {/* Summary below chart */}
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
                  <div className="text-center">
                    <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{summary.overall.present}</div>
                    <div className="text-[10px] sm:text-xs text-muted-foreground">Present</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-red-600 dark:text-red-400">{summary.overall.absent}</div>
                    <div className="text-[10px] sm:text-xs text-muted-foreground">Absent</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-amber-600 dark:text-amber-400">{summary.overall.late}</div>
                    <div className="text-[10px] sm:text-xs text-muted-foreground">Late</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-blue-600 dark:text-blue-400">{summary.overall.total}</div>
                    <div className="text-[10px] sm:text-xs text-muted-foreground">Total Days</div>
                  </div>
                </div>
              </motion.div>

              {/* School Criteria Progress */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900 p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                    <Target className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">School Criteria</h3>
                    <p className="text-xs text-muted-foreground">Minimum {SCHOOL_ATTENDANCE_CRITERIA}% required</p>
                  </div>
                </div>

                {criteriaAnalysis && (
                  <div className="space-y-5">
                    {/* Progress Circle */}
                    <div className="flex items-center justify-center">
                      <div className="relative w-32 h-32 sm:w-40 sm:h-40">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                          {/* Background circle */}
                          <circle
                            cx="50"
                            cy="50"
                            r="42"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="8"
                            className="text-gray-200 dark:text-gray-700"
                          />
                          {/* Progress circle */}
                          <circle
                            cx="50"
                            cy="50"
                            r="42"
                            fill="none"
                            stroke={criteriaAnalysis.isMeetingCriteria ? '#10b981' : criteriaAnalysis.currentRate >= 60 ? '#f59e0b' : '#ef4444'}
                            strokeWidth="8"
                            strokeLinecap="round"
                            strokeDasharray={`${criteriaAnalysis.progressToGoal * 2.64} 264`}
                            className="transition-all duration-1000 ease-out"
                          />
                          {/* Goal marker */}
                          <circle
                            cx="50"
                            cy="8"
                            r="3"
                            fill="#613AF5"
                            className="origin-center"
                            style={{ transform: `rotate(${SCHOOL_ATTENDANCE_CRITERIA * 3.6}deg)`, transformOrigin: '50px 50px' }}
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className={`text-2xl sm:text-3xl font-bold ${
                            criteriaAnalysis.isMeetingCriteria ? 'text-emerald-600 dark:text-emerald-400' : 
                            criteriaAnalysis.currentRate >= 60 ? 'text-amber-600 dark:text-amber-400' : 
                            'text-red-600 dark:text-red-400'
                          }`}>
                            {criteriaAnalysis.currentRate}%
                          </span>
                          <span className="text-[10px] sm:text-xs text-muted-foreground">of {criteriaAnalysis.requiredRate}%</span>
                        </div>
                      </div>
                    </div>

                    {/* Status Message */}
                    <div className={`p-4 rounded-lg border ${
                      criteriaAnalysis.isMeetingCriteria 
                        ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-900/30' 
                        : 'bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-900/30'
                    }`}>
                      <div className="flex items-start gap-3">
                        <div className={`p-1.5 rounded-full ${
                          criteriaAnalysis.isMeetingCriteria 
                            ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400' 
                            : 'bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400'
                        }`}>
                          {criteriaAnalysis.isMeetingCriteria ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                        </div>
                        <div className="flex-1">
                          {criteriaAnalysis.isMeetingCriteria ? (
                            <>
                              <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                                You're meeting the attendance criteria! ðŸŽ‰
                              </p>
                              <p className="text-xs text-emerald-600 dark:text-emerald-500 mt-1">
                                You can miss up to <span className="font-bold">{criteriaAnalysis.daysCanMiss}</span> more days and still maintain the required {criteriaAnalysis.requiredRate}% attendance.
                              </p>
                            </>
                          ) : (
                            <>
                              <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
                                {criteriaAnalysis.canMeetCriteria 
                                  ? 'You need to improve your attendance'
                                  : 'At risk of not meeting criteria'}
                              </p>
                              <p className="text-xs text-amber-600 dark:text-amber-500 mt-1">
                                {criteriaAnalysis.canMeetCriteria 
                                  ? <>Attend the next <span className="font-bold">{criteriaAnalysis.classesNeeded}</span> classes to reach {criteriaAnalysis.requiredRate}% attendance.</>
                                  : 'Please speak with your teacher about improving attendance.'}
                              </p>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Additional Stats */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-lg bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-2 mb-1">
                          <CalendarDays className="w-4 h-4 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">Remaining Days</span>
                        </div>
                        <p className="text-lg font-bold text-gray-900 dark:text-white">{criteriaAnalysis.remainingDays}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-2 mb-1">
                          <Info className="w-4 h-4 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">Goal</span>
                        </div>
                        <p className="text-lg font-bold text-purple-600 dark:text-purple-400">{criteriaAnalysis.requiredRate}%</p>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </div>
          )}

          {/* Attendance Streaks & Trends */}
          {summary && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
              {/* Attendance Streak */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900 p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 text-white">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Attendance Streak</h3>
                    <p className="text-xs text-muted-foreground">Consecutive present days</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="text-center p-4 rounded-lg bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border border-orange-200 dark:border-orange-900/30">
                    <div className="text-4xl font-bold text-orange-600 dark:text-orange-400">{attendanceStreak.current}</div>
                    <div className="text-xs text-muted-foreground mt-1">Current Streak</div>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-gray-700">
                    <span className="text-sm text-muted-foreground">Best Streak</span>
                    <span className="text-lg font-bold text-gray-900 dark:text-white">{attendanceStreak.longest} days</span>
                  </div>

                  {attendanceStreak.current >= 5 && (
                    <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-900/30">
                      <p className="text-xs text-emerald-600 dark:text-emerald-400 text-center">
                        ðŸ”¥ Great job! Keep the streak going!
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Monthly Trend Chart */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="lg:col-span-2 rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900 p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-500 text-white">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Monthly Trend</h3>
                    <p className="text-xs text-muted-foreground">Attendance over time</p>
                  </div>
                </div>

                {monthlyTrendData.length > 0 ? (
                  <div className="h-[200px] sm:h-[220px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={monthlyTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis 
                          dataKey="month" 
                          tick={{ fontSize: 11, fill: '#6b7280' }}
                          axisLine={{ stroke: '#e5e7eb' }}
                        />
                        <YAxis 
                          tick={{ fontSize: 11, fill: '#6b7280' }}
                          axisLine={{ stroke: '#e5e7eb' }}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            fontSize: '12px'
                          }}
                        />
                        <Bar dataKey="present" name="Present" fill="#10b981" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="absent" name="Absent" fill="#ef4444" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="late" name="Late" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-[200px] flex items-center justify-center">
                    <p className="text-sm text-muted-foreground">No trend data available</p>
                  </div>
                )}

                {/* Legend */}
                <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-sm bg-emerald-500" />
                    <span className="text-xs text-muted-foreground">Present</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-sm bg-red-500" />
                    <span className="text-xs text-muted-foreground">Absent</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-sm bg-amber-500" />
                    <span className="text-xs text-muted-foreground">Late</span>
                  </div>
                </div>
              </motion.div>
            </div>
          )}

          {/* Attendance Rate Trend Line Chart */}
          {summary && attendanceRateTrend.length > 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-violet-500 to-purple-500 text-white">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Attendance Rate Over Time</h3>
                    <p className="text-xs text-muted-foreground">Your cumulative attendance trend</p>
                  </div>
                </div>
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400 border border-purple-100 dark:border-purple-900/30">
                  <span className="text-xs font-medium">
                    {attendanceRateTrend.length > 0 ? attendanceRateTrend[attendanceRateTrend.length - 1].rate : 0}% Current
                  </span>
                </div>
              </div>

              <div className="h-[250px] sm:h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={attendanceRateTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#613AF5" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#613AF5" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 10, fill: '#6b7280' }}
                      axisLine={{ stroke: '#e5e7eb' }}
                      interval="preserveStartEnd"
                    />
                    <YAxis 
                      domain={[0, 100]}
                      tick={{ fontSize: 11, fill: '#6b7280' }}
                      axisLine={{ stroke: '#e5e7eb' }}
                      tickFormatter={(value) => `${value}%`}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '12px'
                      }}
                      formatter={(value: number) => [`${value}%`, 'Attendance Rate']}
                    />
                    {/* Reference line for school criteria */}
                    <CartesianGrid 
                      horizontal={true}
                      vertical={false}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="rate" 
                      stroke="#613AF5" 
                      strokeWidth={2}
                      fill="url(#colorRate)"
                      dot={{ fill: '#613AF5', strokeWidth: 2, r: 3 }}
                      activeDot={{ r: 5, fill: '#4f2ed4' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey={() => SCHOOL_ATTENDANCE_CRITERIA} 
                      stroke="#ef4444" 
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={false}
                      name="Required (75%)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Legend and Info */}
              <div className="flex flex-wrap items-center justify-between gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-0.5 bg-primary rounded" />
                    <span className="text-xs text-muted-foreground">Your Rate</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-0.5 bg-red-500 rounded border-dashed" style={{ borderTop: '2px dashed #ef4444', height: 0 }} />
                    <span className="text-xs text-muted-foreground">Required ({SCHOOL_ATTENDANCE_CRITERIA}%)</span>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  {attendanceRateTrend.length > 0 && (
                    <span>
                      {attendanceRateTrend[attendanceRateTrend.length - 1].present} present out of {attendanceRateTrend[attendanceRateTrend.length - 1].total} days
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Recent Attendance Calendar */}
          {summary && recentAttendance.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900 p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 text-white">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Recent Attendance</h3>
                  <p className="text-xs text-muted-foreground">Last {recentAttendance.length} school days</p>
                </div>
              </div>

              {/* Attendance Grid */}
              <div className="grid grid-cols-7 sm:grid-cols-14 gap-2 mb-4">
                  {recentAttendance.map((day, index) => (
                    <div
                      key={index}
                      className="relative group"
                      title={`${day.fullDate}: ${day.status.charAt(0).toUpperCase() + day.status.slice(1)}`}
                    >
                      <div
                        className={`aspect-square rounded-lg flex flex-col items-center justify-center text-center transition-all cursor-pointer hover:scale-105 ${
                          day.status === 'present'
                            ? 'bg-emerald-100 dark:bg-emerald-900/30 border-2 border-emerald-300 dark:border-emerald-700'
                            : day.status === 'absent'
                            ? 'bg-red-100 dark:bg-red-900/30 border-2 border-red-300 dark:border-red-700'
                            : day.status === 'late'
                            ? 'bg-amber-100 dark:bg-amber-900/30 border-2 border-amber-300 dark:border-amber-700'
                            : 'bg-blue-100 dark:bg-blue-900/30 border-2 border-blue-300 dark:border-blue-700'
                        }`}
                      >
                        <span className={`text-[10px] font-medium ${
                          day.status === 'present'
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : day.status === 'absent'
                            ? 'text-red-600 dark:text-red-400'
                            : day.status === 'late'
                            ? 'text-amber-600 dark:text-amber-400'
                            : 'text-blue-600 dark:text-blue-400'
                        }`}>
                          {day.dayName}
                        </span>
                        <span className={`text-sm font-bold ${
                          day.status === 'present'
                            ? 'text-emerald-700 dark:text-emerald-300'
                            : day.status === 'absent'
                            ? 'text-red-700 dark:text-red-300'
                            : day.status === 'late'
                            ? 'text-amber-700 dark:text-amber-300'
                            : 'text-blue-700 dark:text-blue-300'
                        }`}>
                          {day.date}
                        </span>
                      </div>
                      {/* Status Icon */}
                      <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center ${
                        day.status === 'present'
                          ? 'bg-emerald-500'
                          : day.status === 'absent'
                          ? 'bg-red-500'
                          : day.status === 'late'
                          ? 'bg-amber-500'
                          : 'bg-blue-500'
                      }`}>
                        {day.status === 'present' && <Check className="w-2.5 h-2.5 text-white" />}
                        {day.status === 'absent' && <X className="w-2.5 h-2.5 text-white" />}
                        {day.status === 'late' && <Clock className="w-2.5 h-2.5 text-white" />}
                        {day.status === 'excused' && <AlertCircle className="w-2.5 h-2.5 text-white" />}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Legend */}
                <div className="flex flex-wrap items-center justify-center gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-sm bg-emerald-500" />
                    <span className="text-xs text-muted-foreground">Present</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-sm bg-red-500" />
                    <span className="text-xs text-muted-foreground">Absent</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-sm bg-amber-500" />
                    <span className="text-xs text-muted-foreground">Late</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-sm bg-blue-500" />
                    <span className="text-xs text-muted-foreground">Excused</span>
                  </div>
                </div>
            </motion.div>
          )}

          {/* Date Range Filter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900 p-6"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">From Date</label>
                  <input
                    type="date"
                    value={dateRange.from}
                    onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">To Date</label>
                  <input
                    type="date"
                    value={dateRange.to}
                    onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Attendance Records */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm"
          >
            <div className="p-6 border-b border-gray-200 dark:border-gray-800">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Attendance Records</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {records.length} records found
              </p>
            </div>

            {isLoading ? (
              <div className="p-12 text-center">
                <div className="inline-block w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                <p className="mt-4 text-sm text-muted-foreground">Loading records...</p>
              </div>
            ) : error ? (
              <div className="p-12 text-center">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            ) : records.length === 0 ? (
              <div className="p-12 text-center">
                <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-sm text-muted-foreground">No attendance records found for the selected date range</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-slate-800/50 border-b border-gray-200 dark:border-gray-800">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Session Time</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                    {records.map((record) => (
                      <tr key={record.sessionId} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                          {formatDate(record.attendanceSession.sessionDate)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                          {formatTime(record.attendanceSession.startsAt)} - {formatTime(record.attendanceSession.endsAt)}
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(record.status)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
