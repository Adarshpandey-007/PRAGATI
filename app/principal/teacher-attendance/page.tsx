'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Clock,
  Users,
  MapPin,
  LogIn,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Eye,
  X,
  RefreshCw,
  BarChart3,
  TrendingUp,
  Building2,
  Image as ImageIcon,
} from 'lucide-react';
import { Language, translations, getTranslation } from '@/lib/translations';

// Types
interface GeoAttendanceRecord {
  id: string;
  type: 'check-in' | 'check-out';
  timestamp: string;
  location: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  photoUrl?: string;
}

interface TeacherRecord {
  teacherId: string;
  teacherName: string;
  schoolName: string;
  firstCheckIn: string | null;
  lastCheckOut: string | null;
  isCurrentlyCheckedIn: boolean;
  totalHoursWorked: number;
  totalMinutesWorked: number;
  recordCount: number;
  records: GeoAttendanceRecord[];
}

interface AdminRecordsResponse {
  date: string;
  totalTeachers: number;
  teachers: TeacherRecord[];
}

interface TeacherSummary {
  teacherId: string;
  teacherName: string;
  daysPresent: number;
  totalHoursWorked: number;
  averageHoursPerDay?: number;
}

interface AdminSummaryResponse {
  startDate: string;
  endDate: string;
  totalTeachers: number;
  summary: TeacherSummary[];
}

type ViewMode = 'daily' | 'summary';

export default function TeacherAttendancePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('daily');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [records, setRecords] = useState<AdminRecordsResponse | null>(null);
  const [summary, setSummary] = useState<AdminSummaryResponse | null>(null);
  const [selectedTeacher, setSelectedTeacher] = useState<TeacherRecord | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [photoLoading, setPhotoLoading] = useState(false);
  const [principalName, setPrincipalName] = useState('Principal');
  const [lang, setLang] = useState<Language>('en');
  const [error, setError] = useState<string | null>(null);

  const t = (section: keyof typeof translations, key: string) => getTranslation(section, key, lang);

  const handleLanguageChange = (newLang: Language) => {
    setLang(newLang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('pragati_language', newLang);
    }
  };

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
    }
  }, [router]);

  useEffect(() => {
    loadData();
  }, [selectedDate, viewMode]);

  const loadData = async () => {
    const token = localStorage.getItem('pragati_token');
    if (!token) return;

    setIsLoading(true);
    setError(null);

    try {
      const backendUrl = (process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:4000').replace(/\/$/, '');

      if (viewMode === 'daily') {
        const dateStr = selectedDate.toISOString().split('T')[0];
        const response = await fetch(
          `${backendUrl}/api/geo-attendance/admin/records?date=${dateStr}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (!response.ok) throw new Error('Failed to fetch records');
        const data = await response.json();
        setRecords(data);
      } else {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 6);

        const response = await fetch(
          `${backendUrl}/api/geo-attendance/admin/summary?startDate=${startDate.toISOString().split('T')[0]}&endDate=${endDate.toISOString().split('T')[0]}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (!response.ok) throw new Error('Failed to fetch summary');
        const data = await response.json();

        const normalizedSummary: AdminSummaryResponse = {
          startDate: data?.startDate || startDate.toISOString().split('T')[0],
          endDate: data?.endDate || endDate.toISOString().split('T')[0],
          totalTeachers: Number(data?.totalTeachers || 0),
          summary: Array.isArray(data?.summary)
            ? data.summary.map((teacher: any) => {
                const daysPresent = Number(teacher?.daysPresent || 0);
                const totalHoursWorked = Number(teacher?.totalHoursWorked || 0);
                const averageHoursPerDay =
                  typeof teacher?.averageHoursPerDay === 'number'
                    ? teacher.averageHoursPerDay
                    : daysPresent > 0
                      ? totalHoursWorked / daysPresent
                      : 0;

                return {
                  teacherId: String(teacher?.teacherId || ''),
                  teacherName: String(teacher?.teacherName || 'Unknown Teacher'),
                  daysPresent,
                  totalHoursWorked,
                  averageHoursPerDay,
                };
              })
            : [],
        };

        setSummary(normalizedSummary);
      }
    } catch (err) {
      console.error('Error loading teacher attendance:', err);
      setError('Unable to load attendance data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [selectedDate, viewMode]);

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString([], {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}m`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
  };

  const changeDate = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    if (newDate <= new Date()) {
      setSelectedDate(newDate);
    }
  };

  const viewPhoto = async (record: GeoAttendanceRecord) => {
    if (!record.photoUrl) return;

    try {
      setPhotoLoading(true);
      const token = localStorage.getItem('pragati_token');
      if (!token) {
        console.error('No auth token available');
        setPhotoLoading(false);
        return;
      }

      const backendUrl = (process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:4000').replace(/\/$/, '');
      const filename = record.photoUrl.split('/').pop();
      const photoUrl = `${backendUrl}/api/geo-attendance/photos/${filename}`;

      const response = await fetch(photoUrl, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to fetch photo');

      const blob = await response.blob();
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedPhoto(reader.result as string);
        setPhotoLoading(false);
      };
      reader.onerror = () => {
        console.error('Error converting photo');
        setPhotoLoading(false);
      };
      reader.readAsDataURL(blob);
    } catch (error) {
      console.error('Error getting photo:', error);
      setPhotoLoading(false);
    }
  };

  const presentTeachers = records?.teachers.filter(t => t.recordCount > 0).length || 0;
  const atSchoolNow = records?.teachers.filter(t => t.isCurrentlyCheckedIn).length || 0;

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              {t('teacherAttendance', 'title')}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {t('teacherAttendance', 'subtitle')}
            </p>
          </div>
          <button
            onClick={onRefresh}
            disabled={refreshing}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-slate-800 text-sm font-medium hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* View Mode Toggle */}
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center"
          >
            <div className="inline-flex rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900 p-1 shadow-sm">
              <button
                onClick={() => setViewMode('daily')}
                className={`px-4 sm:px-6 py-2 rounded-lg text-sm font-medium transition-all ${
                  viewMode === 'daily'
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {t('teacherAttendance', 'dailyView')}
                </span>
              </button>
              <button
                onClick={() => setViewMode('summary')}
                className={`px-4 sm:px-6 py-2 rounded-lg text-sm font-medium transition-all ${
                  viewMode === 'summary'
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800'
                }`}
              >
                <span className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  {t('teacherAttendance', 'weeklySummary')}
                </span>
              </button>
            </div>
          </motion.div>

          {/* Date Navigation (Daily View) */}
          {viewMode === 'daily' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-center"
            >
              <div className="inline-flex items-center gap-4 rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900 px-4 py-2 shadow-sm">
                <button
                  onClick={() => changeDate(-1)}
                  className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-primary" />
                </button>
                <div className="flex items-center gap-2 px-4">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {formatDate(selectedDate.toISOString())}
                  </span>
                </div>
                <button
                  onClick={() => changeDate(1)}
                  disabled={selectedDate.toDateString() === new Date().toDateString()}
                  className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-5 h-5 text-primary" />
                </button>
              </div>
            </motion.div>
          )}

          {/* Error State */}
          {error && (
            <div className="rounded-xl border-2 border-red-100 bg-red-50 dark:bg-red-900/20 dark:border-red-900/30 p-6 text-center">
              <p className="text-sm text-red-600 dark:text-red-400 font-medium">{error}</p>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900 p-12 text-center shadow-sm">
              <div className="inline-block w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
              <p className="mt-4 text-sm text-muted-foreground">{t('common', 'loading')}</p>
            </div>
          )}

          {/* Daily View Content */}
          {!isLoading && viewMode === 'daily' && (
            <>
              {/* Stats Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900 p-5 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {records?.totalTeachers || 0}
                      </p>
                      <p className="text-xs text-muted-foreground">{t('teacherAttendance', 'allTeachers')}</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900 p-5 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                      <LogIn className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{presentTeachers}</p>
                      <p className="text-xs text-muted-foreground">{t('teacherAttendance', 'presentTeachers')}</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900 p-5 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{atSchoolNow}</p>
                      <p className="text-xs text-muted-foreground">{t('teacherAttendance', 'currentlyAtSchool')}</p>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Teacher List */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden"
              >
                <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                  <h3 className="font-semibold text-gray-900 dark:text-white">{t('teacherAttendance', 'attendanceRecords')}</h3>
                </div>

                {records?.teachers && records.teachers.length > 0 ? (
                  <div className="divide-y divide-gray-100 dark:divide-gray-800">
                    {records.teachers.map((teacher, index) => (
                      <motion.div
                        key={teacher.teacherId}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => setSelectedTeacher(teacher)}
                        className="p-4 hover:bg-gray-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-white font-semibold">
                              {teacher.teacherName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">{teacher.teacherName}</p>
                              <p className="text-xs text-muted-foreground">{teacher.schoolName}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-4">
                            {teacher.firstCheckIn ? (
                              <div className="text-right">
                                <div className="flex items-center gap-2 text-sm">
                                  <LogIn className="w-3.5 h-3.5 text-green-500" />
                                  <span className="text-gray-700 dark:text-gray-300">
                                    {formatTime(teacher.firstCheckIn)}
                                  </span>
                                </div>
                                {teacher.lastCheckOut && (
                                  <div className="flex items-center gap-2 text-sm">
                                    <LogOut className="w-3.5 h-3.5 text-red-500" />
                                    <span className="text-gray-700 dark:text-gray-300">
                                      {formatTime(teacher.lastCheckOut)}
                                    </span>
                                  </div>
                                )}
                                <p className="text-xs font-medium text-primary mt-1">
                                  {formatDuration(teacher.totalMinutesWorked)}
                                </p>
                              </div>
                            ) : (
                              <span className="text-sm text-muted-foreground">{t('teacherAttendance', 'noRecords')}</span>
                            )}

                            <div
                              className={`w-3 h-3 rounded-full ${
                                teacher.isCurrentlyCheckedIn ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                              }`}
                            />
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="p-12 text-center">
                    <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">{t('teacherAttendance', 'noRecords')}</p>
                  </div>
                )}
              </motion.div>
            </>
          )}

          {/* Summary View Content */}
          {!isLoading && viewMode === 'summary' && (
            <>
              {/* Summary Period */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
              >
                <p className="text-sm text-muted-foreground">
                  {summary?.startDate ? formatDate(summary.startDate) : ''} - {summary?.endDate ? formatDate(summary.endDate) : ''}
                </p>
              </motion.div>

              {/* Summary Cards */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden"
              >
                <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                  <h3 className="font-semibold text-gray-900 dark:text-white">{t('teacherAttendance', 'weeklySummary')}</h3>
                </div>

                {summary?.summary && summary.summary.length > 0 ? (
                  <div className="divide-y divide-gray-100 dark:divide-gray-800">
                    {summary.summary.map((teacher, index) => (
                      <motion.div
                        key={teacher.teacherId}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="p-4"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center text-sm font-bold text-primary">
                              #{index + 1}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white">{teacher.teacherName}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2 text-sm">
                              <Calendar className="w-4 h-4 text-muted-foreground" />
                              <span className="text-gray-700 dark:text-gray-300">{teacher.daysPresent} {t('teacherAttendance', 'daysPresent')}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Clock className="w-4 h-4 text-muted-foreground" />
                              <span className="text-gray-700 dark:text-gray-300">{teacher.totalHoursWorked}h</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <TrendingUp className="w-4 h-4 text-muted-foreground" />
                              <span className="text-gray-700 dark:text-gray-300">
                                {Number(teacher.averageHoursPerDay || 0).toFixed(1)}h/day
                              </span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="p-12 text-center">
                    <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">{t('teacherAttendance', 'noRecords')}</p>
                  </div>
                )}
              </motion.div>
            </>
          )}

          {/* Government Footer */}
          <div className="flex h-1.5 rounded-full overflow-hidden">
            <div className="flex-1 bg-orange-500" />
            <div className="flex-1 bg-white border-y border-gray-200" />
            <div className="flex-1 bg-green-600" />
          </div>
        </div>

      {/* Teacher Detail Modal */}
      <AnimatePresence>
        {selectedTeacher && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setSelectedTeacher(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900 shadow-xl overflow-hidden"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-white font-semibold">
                    {selectedTeacher.teacherName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{selectedTeacher.teacherName}</h3>
                    <p className="text-xs text-muted-foreground">{selectedTeacher.schoolName}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedTeacher(null)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Stats */}
              <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-slate-800/50">
                <div className="text-center">
                  <div className="flex justify-center mb-1">
                    <LogIn className="w-5 h-5 text-green-500" />
                  </div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {selectedTeacher.firstCheckIn ? formatTime(selectedTeacher.firstCheckIn) : '-'}
                  </p>
                  <p className="text-xs text-muted-foreground">{t('teacherAttendance', 'checkIn')}</p>
                </div>
                <div className="text-center">
                  <div className="flex justify-center mb-1">
                    <LogOut className="w-5 h-5 text-red-500" />
                  </div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {selectedTeacher.lastCheckOut ? formatTime(selectedTeacher.lastCheckOut) : '-'}
                  </p>
                  <p className="text-xs text-muted-foreground">{t('teacherAttendance', 'checkOut')}</p>
                </div>
                <div className="text-center">
                  <div className="flex justify-center mb-1">
                    <Clock className="w-5 h-5 text-primary" />
                  </div>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {formatDuration(selectedTeacher.totalMinutesWorked)}
                  </p>
                  <p className="text-xs text-muted-foreground">{t('teacherAttendance', 'duration')}</p>
                </div>
              </div>

              {/* Status Badge */}
              <div className="px-4 py-3">
                <div
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${
                    selectedTeacher.isCurrentlyCheckedIn
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-gray-100 text-gray-600 dark:bg-slate-800 dark:text-gray-400'
                  }`}
                >
                  <div
                    className={`w-2 h-2 rounded-full ${
                      selectedTeacher.isCurrentlyCheckedIn ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
                    }`}
                  />
                  {selectedTeacher.isCurrentlyCheckedIn ? t('teacherAttendance', 'currentlyAtSchool') : t('common', 'notAtSchool')}
                </div>
              </div>

              {/* Records Timeline */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-800 max-h-64 overflow-y-auto">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">{t('teacherAttendance', 'attendanceRecords')}</h4>
                <div className="space-y-3">
                  {selectedTeacher.records.map((record, index) => (
                    <div key={record.id} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            record.type === 'check-in' ? 'bg-green-500' : 'bg-red-500'
                          }`}
                        />
                        {index < selectedTeacher.records.length - 1 && (
                          <div className="w-0.5 flex-1 bg-gray-200 dark:bg-gray-700 my-1" />
                        )}
                      </div>
                      <div className="flex-1 pb-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {record.type === 'check-in' ? t('teacherAttendance', 'checkIn') : t('teacherAttendance', 'checkOut')}
                          </span>
                          <span className="text-sm text-muted-foreground">{formatTime(record.timestamp)}</span>
                        </div>
                        {record.location.address && (
                          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {record.location.address}
                          </p>
                        )}
                        {record.photoUrl && (
                          <button
                            onClick={() => viewPhoto(record)}
                            className="mt-2 inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
                          >
                            <ImageIcon className="w-3.5 h-3.5" />
                            {t('teacherAttendance', 'viewPhoto')}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Photo Modal */}
      <AnimatePresence>
        {(selectedPhoto || photoLoading) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90"
            onClick={() => {
              setSelectedPhoto(null);
              setPhotoLoading(false);
            }}
          >
            <button
              onClick={() => {
                setSelectedPhoto(null);
                setPhotoLoading(false);
              }}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>

            {photoLoading ? (
              <div className="text-center">
                <div className="inline-block w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                <p className="mt-4 text-white">{t('common', 'loading')}</p>
              </div>
            ) : selectedPhoto ? (
              <motion.img
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                src={selectedPhoto}
                alt="Attendance Photo"
                className="max-w-full max-h-[80vh] rounded-lg object-contain"
                onClick={(e) => e.stopPropagation()}
              />
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
