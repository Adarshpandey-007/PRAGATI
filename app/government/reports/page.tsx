'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  LogOut,
  UserCircle,
  Download,
  Calendar,
  TrendingUp,
  TrendingDown,
  School,
  Users,
  GraduationCap,
  BarChart3,
  PieChart,
  AlertCircle,
} from 'lucide-react';
import { AttendanceTrendsChart } from '../components/AttendanceTrendsChart';
import { DistributionPieChart } from '../components/DistributionPieChart';
import { RegionalHeatmap } from '../components/RegionalHeatmap';

interface SchoolReport {
  schoolId: string;
  schoolName: string;
  district: string;
  totalStudents: number;
  totalTeachers: number;
  attendanceRate: number;
  totalComplaints: number;
  openComplaints: number;
}

export default function GovernmentReportsPage() {
  const router = useRouter();
  const [governmentName, setGovernmentName] = useState('Government Official');
  const [schools, setSchools] = useState<SchoolReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('pragati_token');
      const role = localStorage.getItem('pragati_role');

      if (!token || role !== 'GOVERNMENT') {
        router.push('/login/government');
        return;
      }

      setGovernmentName('Government Official');
      fetchReportData(token);
    }
  }, [router, dateRange]);

  const fetchReportData = async (token: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const backendUrl = (process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:4000').replace(/\/$/, '');

      // Fetch all schools
      const schoolsRes = await fetch(`${backendUrl}/api/core/schools`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!schoolsRes.ok) throw new Error('Failed to fetch schools');
      const schoolsData = await schoolsRes.json();

      // For each school, fetch detailed report data
      const reportsPromises = schoolsData.map(async (school: any) => {
        try {
          const [studentsRes, teachersRes] = await Promise.all([
            fetch(`${backendUrl}/api/core/students?schoolId=${school.id}`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
            fetch(`${backendUrl}/api/core/teachers?schoolId=${school.id}`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
          ]);

          const students = studentsRes.ok ? await studentsRes.json() : [];
          const teachers = teachersRes.ok ? await teachersRes.json() : [];

          return {
            schoolId: school.id,
            schoolName: school.name,
            district: school.district,
            totalStudents: Array.isArray(students) ? students.length : 0,
            totalTeachers: Array.isArray(teachers) ? teachers.length : 0,
            attendanceRate: 0, // No attendance data available yet
            totalComplaints: 0, // No complaints API access for government
            openComplaints: 0,
          };
        } catch (err) {
          console.error(`Error fetching report for school ${school.id}:`, err);
          return null;
        }
      });

      const reports = (await Promise.all(reportsPromises)).filter(Boolean) as SchoolReport[];
      setSchools(reports);
    } catch (err) {
      console.error('Error fetching report data:', err);
      setError('Unable to load report data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('pragati_token');
    localStorage.removeItem('pragati_role');
    localStorage.removeItem('pragati_userId');
    localStorage.removeItem('pragati_schoolId');
    router.push('/login/government');
  };

  // Calculate overall metrics
  const totalStudents = schools.reduce((sum, s) => sum + s.totalStudents, 0);
  const totalTeachers = schools.reduce((sum, s) => sum + s.totalTeachers, 0);
  const avgAttendance = schools.length > 0
    ? schools.reduce((sum, s) => sum + s.attendanceRate, 0) / schools.length
    : 0;
  const totalComplaints = schools.reduce((sum, s) => sum + s.totalComplaints, 0);
  const openComplaints = schools.reduce((sum, s) => sum + s.openComplaints, 0);

  // Find top and bottom performers
  const topPerformers = [...schools]
    .sort((a, b) => b.attendanceRate - a.attendanceRate)
    .slice(0, 5);
  const bottomPerformers = [...schools]
    .sort((a, b) => a.attendanceRate - b.attendanceRate)
    .slice(0, 5);

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
      <header className="fixed top-10 sm:top-12 left-0 right-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => router.back()}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <div className="p-2 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-sm sm:text-lg font-bold text-gray-900 dark:text-white">System Reports</h1>
                <p className="text-[10px] sm:text-xs text-muted-foreground">
                  Analytics and performance metrics
                </p>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-gray-700">
                <UserCircle className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs font-medium text-gray-900 dark:text-white">{governmentName}</span>
              </div>

              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 text-xs font-medium hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="pt-32 sm:pt-36 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Date Range Filter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900 p-4"
          >
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <Calendar className="w-4 h-4" />
                <span>Date Range:</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                    className="rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  />
                </div>
                <span className="text-muted-foreground">to</span>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                  className="rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                />
              </div>
            </div>
          </motion.div>

          {/* Overall Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900 p-6"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                  <School className="w-4 h-4" />
                </div>
                <p className="text-sm text-muted-foreground">Schools</p>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{schools.length}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900 p-6"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <p className="text-sm text-muted-foreground">Students</p>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalStudents.toLocaleString()}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900 p-6"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400">
                  <Users className="w-4 h-4" />
                </div>
                <p className="text-sm text-muted-foreground">Teachers</p>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalTeachers}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900 p-6"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <p className="text-sm text-muted-foreground">Avg Attendance</p>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{(avgAttendance * 100).toFixed(1)}%</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900 p-6"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400">
                  <AlertCircle className="w-4 h-4" />
                </div>
                <p className="text-sm text-muted-foreground">Complaints</p>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalComplaints}</p>
              <p className="text-xs text-muted-foreground mt-1">{openComplaints} open</p>
            </motion.div>
          </div>

          {/* Attendance Trends Chart */}
          <AttendanceTrendsChart schools={schools} />

          {/* Charts Row - Pie Chart & Heatmap */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <DistributionPieChart schools={schools} />
            <RegionalHeatmap schools={schools} />
          </div>

          {/* Top Performers */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm"
            >
              <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Top Performing Schools</h3>
                </div>
                <p className="text-sm text-muted-foreground">Based on attendance rate</p>
              </div>
              <div className="p-6 space-y-4">
                {topPerformers.map((school, index) => (
                  <div key={school.schoolId} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-xs font-bold">
                        {index + 1}
                      </span>
                      <div>
                        <p className="font-medium text-sm text-gray-900 dark:text-white">{school.schoolName}</p>
                        <p className="text-xs text-muted-foreground">{school.district}</p>
                      </div>
                    </div>
                    <span className="px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-xs font-medium">
                      {(school.attendanceRate * 100).toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm"
            >
              <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Schools Needing Attention</h3>
                </div>
                <p className="text-sm text-muted-foreground">Lower attendance rates</p>
              </div>
              <div className="p-6 space-y-4">
                {bottomPerformers.map((school, index) => (
                  <div key={school.schoolId} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 text-xs font-bold">
                        {index + 1}
                      </span>
                      <div>
                        <p className="font-medium text-sm text-gray-900 dark:text-white">{school.schoolName}</p>
                        <p className="text-xs text-muted-foreground">{school.district}</p>
                      </div>
                    </div>
                    <span className="px-2 py-1 rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 text-xs font-medium">
                      {(school.attendanceRate * 100).toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* All Schools Report Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm"
          >
            <div className="p-6 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Detailed School Reports</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {schools.length} schools in the system
                  </p>
                </div>
                <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition shadow-sm">
                  <Download className="w-4 h-4" />
                  Export PDF
                </button>
              </div>
            </div>

            {isLoading ? (
              <div className="p-12 text-center">
                <div className="inline-block w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                <p className="mt-4 text-sm text-muted-foreground">Loading report data...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-slate-800/50 border-b border-gray-200 dark:border-gray-800">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">School</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">District</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Students</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Teachers</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Attendance</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Complaints</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                    {schools.map((school) => (
                      <tr key={school.schoolId} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-medium text-sm text-gray-900 dark:text-white">{school.schoolName}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{school.district}</td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{school.totalStudents}</td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{school.totalTeachers}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            school.attendanceRate >= 0.9
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                              : school.attendanceRate >= 0.75
                              ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                              : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                          }`}>
                            {(school.attendanceRate * 100).toFixed(1)}%
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                          <div className="flex items-center gap-2">
                            <span>{school.totalComplaints}</span>
                            {school.openComplaints > 0 && (
                              <span className="px-1.5 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 text-[10px] font-medium">
                                {school.openComplaints} open
                              </span>
                            )}
                          </div>
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
