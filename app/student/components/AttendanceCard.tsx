'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ClipboardCheck, TrendingUp, Calendar, AlertCircle, ArrowRight, Target, Check } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

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

interface AttendanceCardProps {
  language: 'en' | 'pa' | 'hi';
}

// School attendance criteria
const SCHOOL_ATTENDANCE_CRITERIA = 75;

export function AttendanceCard({ language }: AttendanceCardProps) {
  const router = useRouter();
  const [attendanceData, setAttendanceData] = useState<AttendanceSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAttendanceSummary();
  }, []);

  const fetchAttendanceSummary = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('pragati_token');
      const studentId = localStorage.getItem('pragati_studentId');

      if (!token || !studentId) {
        setError('Authentication required');
        return;
      }

      const backendUrl = (process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:4000').replace(/\/$/, '');
      const response = await fetch(
        `${backendUrl}/api/attendance/students/summary?studentId=${studentId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 404) {
        // No attendance data yet - this is normal for new students
        setAttendanceData(null);
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch attendance data');
      }

      const data = await response.json();
      setAttendanceData(data);
    } catch (err) {
      console.error('Error fetching attendance:', err);
      setError('Attendance data will appear once your teacher starts marking attendance');
    } finally {
      setIsLoading(false);
    }
  };

  const translations = {
    en: {
      title: 'Attendance',
      today: 'Today',
      thisWeek: 'This Week',
      overall: 'Overall',
      present: 'Present',
      absent: 'Absent',
      late: 'Late',
      excused: 'Excused',
      viewDetails: 'View Details',
      noData: 'No attendance data available yet',
      loading: 'Loading attendance...',
      rate: 'Attendance Rate',
      meetingCriteria: 'Meeting criteria',
      needsImprovement: 'Needs improvement',
      classesNeeded: 'more classes needed',
    },
    pa: {
      title: 'ਹਾਜ਼ਰੀ',
      today: 'ਅੱਜ',
      thisWeek: 'ਇਸ ਹਫ਼ਤੇ',
      overall: 'ਕੁੱਲ',
      present: 'ਹਾਜ਼ਰ',
      absent: 'ਗੈਰ-ਹਾਜ਼ਰ',
      late: 'ਦੇਰੀ',
      excused: 'ਛੁੱਟੀ',
      viewDetails: 'ਵੇਰਵੇ ਵੇਖੋ',
      noData: 'ਅਜੇ ਕੋਈ ਹਾਜ਼ਰੀ ਡਾਟਾ ਉਪਲਬਧ ਨਹੀਂ ਹੈ',
      loading: 'ਹਾਜ਼ਰੀ ਲੋਡ ਹੋ ਰਹੀ ਹੈ...',
      rate: 'ਹਾਜ਼ਰੀ ਦਰ',
      meetingCriteria: 'ਮਾਪਦੰਡ ਪੂਰਾ ਕਰ ਰਹੇ ਹੋ',
      needsImprovement: 'ਸੁਧਾਰ ਦੀ ਲੋੜ ਹੈ',
      classesNeeded: 'ਹੋਰ ਕਲਾਸਾਂ ਦੀ ਲੋੜ ਹੈ',
    },
    hi: {
      title: 'उपस्थिति',
      today: 'आज',
      thisWeek: 'इस सप्ताह',
      overall: 'कुल',
      present: 'उपस्थित',
      absent: 'अनुपस्थित',
      late: 'देर से',
      excused: 'अवकाश',
      viewDetails: 'विवरण देखें',
      noData: 'अभी कोई उपस्थिति डेटा उपलब्ध नहीं है',
      loading: 'उपस्थिति लोड हो रही है...',
      rate: 'उपस्थिति दर',
      meetingCriteria: 'लक्ष्य पूरा कर रहे हैं',
      needsImprovement: 'सुधार की जरूरत है',
      classesNeeded: 'और कक्षाएं चाहिए',
    },
  };

  const t = translations[language];

  // Calculate pie chart data
  const pieChartData = useMemo(() => {
    if (!attendanceData) return [];
    return [
      { name: 'Present', value: attendanceData.overall.present, fill: '#10b981' },
      { name: 'Absent', value: attendanceData.overall.absent, fill: '#ef4444' },
      { name: 'Late', value: attendanceData.overall.late, fill: '#f59e0b' },
    ].filter(item => item.value > 0);
  }, [attendanceData]);

  // Calculate criteria status
  const criteriaStatus = useMemo(() => {
    if (!attendanceData) return null;
    
    const currentRate = Math.round((attendanceData.overall.attendanceRate || 0) * 100);
    const isMeeting = currentRate >= SCHOOL_ATTENDANCE_CRITERIA;
    
    let classesNeeded = 0;
    if (!isMeeting && attendanceData.overall.total > 0) {
      const { present, total } = attendanceData.overall;
      const numerator = (total * SCHOOL_ATTENDANCE_CRITERIA / 100) - present;
      const denominator = 1 - (SCHOOL_ATTENDANCE_CRITERIA / 100);
      classesNeeded = Math.max(0, Math.ceil(numerator / denominator));
    }
    
    return { currentRate, isMeeting, classesNeeded };
  }, [attendanceData]);

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-900 p-6 shadow-sm"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
            <ClipboardCheck className="w-5 h-5" />
          </div>
          <h3 className="text-base sm:text-lg font-semibold">{t.title}</h3>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="inline-block w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      </motion.div>
    );
  }

  if (error || !attendanceData) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-900 p-6 shadow-sm"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 text-white">
            <ClipboardCheck className="w-5 h-5" />
          </div>
          <h3 className="text-base sm:text-lg font-semibold">{t.title}</h3>
        </div>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <AlertCircle className="w-12 h-12 text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground">{error || t.noData}</p>
        </div>
      </motion.div>
    );
  }

  const overallRate = Math.round((attendanceData.overall.attendanceRate || 0) * 100);
  const weekRate = Math.round((attendanceData.thisWeek.attendanceRate || 0) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-900 p-6 hover:border-primary hover:shadow-md transition-all duration-200"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-sm">
            <ClipboardCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-semibold">{t.title}</h3>
            <p className="text-xs text-muted-foreground">{t.overall}: {overallRate}%</p>
          </div>
        </div>
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${
          criteriaStatus?.isMeeting 
            ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30' 
            : 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30'
        }`}>
          {criteriaStatus?.isMeeting ? <Check className="w-3.5 h-3.5" /> : <Target className="w-3.5 h-3.5" />}
          <span className="text-xs font-medium">{overallRate}%</span>
        </div>
      </div>

      {/* Mini Pie Chart + Progress */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Mini Pie Chart */}
        <div className="flex flex-col items-center justify-center">
          {pieChartData.length > 0 ? (
            <div className="w-20 h-20 sm:w-24 sm:h-24">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={20}
                    outerRadius={35}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="w-20 h-20 flex items-center justify-center">
              <Calendar className="w-8 h-8 text-muted-foreground" />
            </div>
          )}
          <span className="text-[10px] text-muted-foreground mt-1">{attendanceData.overall.total} {language === 'en' ? 'days' : language === 'pa' ? 'ਦਿਨ' : 'दिन'}</span>
        </div>

        {/* Criteria Progress */}
        <div className="flex flex-col justify-center">
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 mx-auto">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                className="text-gray-200 dark:text-gray-700"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke={criteriaStatus?.isMeeting ? '#10b981' : overallRate >= 60 ? '#f59e0b' : '#ef4444'}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${Math.min(100, (overallRate / SCHOOL_ATTENDANCE_CRITERIA) * 100) * 2.51} 251`}
                className="transition-all duration-500"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-sm sm:text-base font-bold ${
                criteriaStatus?.isMeeting ? 'text-emerald-600 dark:text-emerald-400' : 
                overallRate >= 60 ? 'text-amber-600 dark:text-amber-400' : 
                'text-red-600 dark:text-red-400'
              }`}>
                {overallRate}%
              </span>
            </div>
          </div>
          <span className="text-[10px] text-muted-foreground text-center mt-1">{SCHOOL_ATTENDANCE_CRITERIA}% {language === 'en' ? 'goal' : language === 'pa' ? 'ਟੀਚਾ' : 'लक्ष्य'}</span>
        </div>
      </div>

      {/* Criteria Status Message */}
      {criteriaStatus && (
        <div className={`p-3 rounded-lg mb-4 ${
          criteriaStatus.isMeeting 
            ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-900/30' 
            : 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/30'
        }`}>
          <div className="flex items-center gap-2">
            {criteriaStatus.isMeeting ? (
              <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
            ) : (
              <Target className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
            )}
            <p className={`text-xs ${
              criteriaStatus.isMeeting 
                ? 'text-emerald-700 dark:text-emerald-400' 
                : 'text-amber-700 dark:text-amber-400'
            }`}>
              {criteriaStatus.isMeeting 
                ? `✓ ${t.meetingCriteria}!` 
                : `${criteriaStatus.classesNeeded} ${t.classesNeeded}`
              }
            </p>
          </div>
        </div>
      )}

      {/* This Week Quick Stats */}
      <div className="grid grid-cols-4 gap-2 p-3 rounded-lg bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-gray-700 mb-4">
        <div className="text-center">
          <div className="text-base sm:text-lg font-bold text-emerald-600 dark:text-emerald-400">
            {attendanceData.thisWeek.present}
          </div>
          <div className="text-[9px] sm:text-[10px] text-muted-foreground">{t.present}</div>
        </div>
        <div className="text-center">
          <div className="text-base sm:text-lg font-bold text-red-600 dark:text-red-400">
            {attendanceData.thisWeek.absent}
          </div>
          <div className="text-[9px] sm:text-[10px] text-muted-foreground">{t.absent}</div>
        </div>
        <div className="text-center">
          <div className="text-base sm:text-lg font-bold text-yellow-600 dark:text-yellow-400">
            {attendanceData.thisWeek.late}
          </div>
          <div className="text-[9px] sm:text-[10px] text-muted-foreground">{t.late}</div>
        </div>
        <div className="text-center">
          <div className="text-base sm:text-lg font-bold text-blue-600 dark:text-blue-400">
            {attendanceData.thisWeek.excused}
          </div>
          <div className="text-[9px] sm:text-[10px] text-muted-foreground">{t.excused}</div>
        </div>
      </div>

      {/* View Details Button */}
      <button
        onClick={() => router.push('/student/attendance')}
        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 text-sm font-medium transition"
      >
        {t.viewDetails}
        <ArrowRight className="w-4 h-4" />
      </button>
    </motion.div>
  );
}
