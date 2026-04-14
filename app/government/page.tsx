'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import {
  BarChart3,
  School,
  Users,
  AlertCircle,
  TrendingUp,
  LogOut,
  UserCircle,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  GraduationCap,
  BookOpen,
  Calendar,
  TrendingDown,
  ArrowUpRight,
  Building2,
  Landmark,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ComposedChart,
  Line,
} from 'recharts';

interface SchoolStats {
  id: string;
  name: string;
  district: string;
  totalStudents: number;
  totalTeachers: number;
  totalClassrooms: number;
  attendanceRate: number;
  activeComplaints: number;
}

interface OverallStats {
  totalSchools: number;
  totalStudents: number;
  totalTeachers: number;
  totalClassrooms: number;
  averageAttendance: number;
  totalComplaints: number;
  openComplaints: number;
  resolvedComplaints: number;
}

export default function GovernmentDashboard() {
  const router = useRouter();
  const { language, setLanguage } = useLanguage();
  const [governmentName, setGovernmentName] = useState('Government Official');
  const [overallStats, setOverallStats] = useState<OverallStats>({
    totalSchools: 0,
    totalStudents: 0,
    totalTeachers: 0,
    totalClassrooms: 0,
    averageAttendance: 0,
    totalComplaints: 0,
    openComplaints: 0,
    resolvedComplaints: 0,
  });
  const [schools, setSchools] = useState<SchoolStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Translations for English and Punjabi
  const translations = {
    en: {
      govtOfIndia: 'GOVERNMENT OF INDIA',
      ministryOfEducation: 'SIH 2026 • MoE & Govt. of Punjab • PRAGATI Portal',
      governmentPortal: 'Government Portal',
      ministrySubtitle: 'Ministry of Education - India',
      logout: 'Logout',
      welcome: 'Welcome',
      monitorSchools: 'Monitor and manage education infrastructure across all registered schools',
      bharatSarkar: 'Bharat Sarkar · Government of India',
      totalSchools: 'Total Schools',
      totalStudents: 'Total Students',
      totalTeachers: 'Total Teachers',
      avgAttendance: 'Avg Attendance',
      quickAccess: 'Quick Access',
      allSchools: 'All Schools',
      viewAllSchools: 'View all registered schools',
      reportsAnalytics: 'Reports & Analytics',
      comprehensiveReports: 'Comprehensive reports and insights',
      complaintsOverview: 'Complaints Overview',
      monitorComplaints: 'Monitor complaints across all schools',
      userManagement: 'User Management',
      manageUsers: 'Manage system users',
      programManagement: 'Programs & Schemes',
      managePrograms: 'Add, edit, and remove scheme details',
      schoolComparisonAnalytics: 'School Comparison Analytics',
      studentsTeachersBySchool: 'Students & Teachers by School',
      top8Schools: 'Top 8 schools by student count',
      students: 'Students',
      teachers: 'Teachers',
      schoolSizeDistribution: 'School Size Distribution',
      categorizedByEnrollment: 'Categorized by student enrollment',
      studentTeacherRatio: 'Student-Teacher Ratio',
      lowerIsBetter: 'Lower is better (ideal: 20-30)',
      distributionByDistrict: 'Distribution by District',
      schoolsStudentsTeachersPerDistrict: 'Schools, students & teachers per district',
      largestSchools: 'Largest Schools',
      byStudentEnrollment: 'By student enrollment',
      mostStaff: 'Most Staff',
      byTeacherCount: 'By teacher count',
      schoolsOverview: 'Schools Overview',
      schoolsRegistered: 'schools registered',
      loadingSchools: 'Loading schools...',
      noSchoolsRegistered: 'No schools registered yet',
      schoolName: 'School Name',
      district: 'District',
      classrooms: 'Classrooms',
      attendance: 'Attendance',
      schools: 'Schools',
      small: 'Small (<100)',
      medium: 'Medium (100-300)',
      large: 'Large (300-500)',
      veryLarge: 'Very Large (500+)',
    },
    pa: {
      govtOfIndia: 'ਭਾਰਤ ਸਰਕਾਰ',
      ministryOfEducation: 'ਸਿੱਖਿਆ ਮੰਤਰਾਲਾ · ਪ੍ਰਗਤੀ ਪੋਰਟਲ',
      governmentPortal: 'ਸਰਕਾਰੀ ਪੋਰਟਲ',
      ministrySubtitle: 'ਸਿੱਖਿਆ ਮੰਤਰਾਲਾ - ਭਾਰਤ',
      logout: 'ਲੌਗ ਆਊਟ',
      welcome: 'ਸੁਆਗਤ ਹੈ',
      monitorSchools: 'ਸਾਰੇ ਰਜਿਸਟਰਡ ਸਕੂਲਾਂ ਵਿੱਚ ਸਿੱਖਿਆ ਬੁਨਿਆਦੀ ਢਾਂਚੇ ਦੀ ਨਿਗਰਾਨੀ ਅਤੇ ਪ੍ਰਬੰਧਨ ਕਰੋ',
      bharatSarkar: 'ਭਾਰਤ ਸਰਕਾਰ · ਗਵਰਨਮੈਂਟ ਆਫ ਇੰਡੀਆ',
      totalSchools: 'ਕੁੱਲ ਸਕੂਲ',
      totalStudents: 'ਕੁੱਲ ਵਿਦਿਆਰਥੀ',
      totalTeachers: 'ਕੁੱਲ ਅਧਿਆਪਕ',
      avgAttendance: 'ਔਸਤ ਹਾਜ਼ਰੀ',
      quickAccess: 'ਤੁਰੰਤ ਪਹੁੰਚ',
      allSchools: 'ਸਾਰੇ ਸਕੂਲ',
      viewAllSchools: 'ਸਾਰੇ ਰਜਿਸਟਰਡ ਸਕੂਲ ਦੇਖੋ',
      reportsAnalytics: 'ਰਿਪੋਰਟਾਂ ਅਤੇ ਵਿਸ਼ਲੇਸ਼ਣ',
      comprehensiveReports: 'ਵਿਆਪਕ ਰਿਪੋਰਟਾਂ ਅਤੇ ਜਾਣਕਾਰੀ',
      complaintsOverview: 'ਸ਼ਿਕਾਇਤਾਂ ਦੀ ਸੰਖੇਪ ਜਾਣਕਾਰੀ',
      monitorComplaints: 'ਸਾਰੇ ਸਕੂਲਾਂ ਵਿੱਚ ਸ਼ਿਕਾਇਤਾਂ ਦੀ ਨਿਗਰਾਨੀ ਕਰੋ',
      userManagement: 'ਉਪਭੋਗਤਾ ਪ੍ਰਬੰਧਨ',
      manageUsers: 'ਸਿਸਟਮ ਉਪਭੋਗਤਾਵਾਂ ਦਾ ਪ੍ਰਬੰਧਨ ਕਰੋ',
      programManagement: 'ਪ੍ਰੋਗਰਾਮ ਅਤੇ ਯੋਜਨਾਵਾਂ',
      managePrograms: 'ਯੋਜਨਾ ਦੇ ਵੇਰਵੇ ਜੋੜੋ, ਸੋਧੋ ਅਤੇ ਹਟਾਓ',
      schoolComparisonAnalytics: 'ਸਕੂਲ ਤੁਲਨਾ ਵਿਸ਼ਲੇਸ਼ਣ',
      studentsTeachersBySchool: 'ਸਕੂਲ ਅਨੁਸਾਰ ਵਿਦਿਆਰਥੀ ਅਤੇ ਅਧਿਆਪਕ',
      top8Schools: 'ਵਿਦਿਆਰਥੀ ਗਿਣਤੀ ਅਨੁਸਾਰ ਚੋਟੀ ਦੇ 8 ਸਕੂਲ',
      students: 'ਵਿਦਿਆਰਥੀ',
      teachers: 'ਅਧਿਆਪਕ',
      schoolSizeDistribution: 'ਸਕੂਲ ਆਕਾਰ ਵੰਡ',
      categorizedByEnrollment: 'ਦਾਖਲੇ ਅਨੁਸਾਰ ਵਰਗੀਕ੍ਰਿਤ',
      studentTeacherRatio: 'ਵਿਦਿਆਰਥੀ-ਅਧਿਆਪਕ ਅਨੁਪਾਤ',
      lowerIsBetter: 'ਘੱਟ ਬਿਹਤਰ ਹੈ (ਆਦਰਸ਼: 20-30)',
      distributionByDistrict: 'ਜ਼ਿਲ੍ਹੇ ਅਨੁਸਾਰ ਵੰਡ',
      schoolsStudentsTeachersPerDistrict: 'ਹਰ ਜ਼ਿਲ੍ਹੇ ਵਿੱਚ ਸਕੂਲ, ਵਿਦਿਆਰਥੀ ਅਤੇ ਅਧਿਆਪਕ',
      largestSchools: 'ਸਭ ਤੋਂ ਵੱਡੇ ਸਕੂਲ',
      byStudentEnrollment: 'ਵਿਦਿਆਰਥੀ ਦਾਖਲੇ ਅਨੁਸਾਰ',
      mostStaff: 'ਸਭ ਤੋਂ ਵੱਧ ਸਟਾਫ',
      byTeacherCount: 'ਅਧਿਆਪਕ ਗਿਣਤੀ ਅਨੁਸਾਰ',
      schoolsOverview: 'ਸਕੂਲਾਂ ਦੀ ਸੰਖੇਪ ਜਾਣਕਾਰੀ',
      schoolsRegistered: 'ਸਕੂਲ ਰਜਿਸਟਰਡ',
      loadingSchools: 'ਸਕੂਲ ਲੋਡ ਹੋ ਰਹੇ ਹਨ...',
      noSchoolsRegistered: 'ਅਜੇ ਕੋਈ ਸਕੂਲ ਰਜਿਸਟਰਡ ਨਹੀਂ ਹੈ',
      schoolName: 'ਸਕੂਲ ਦਾ ਨਾਮ',
      district: 'ਜ਼ਿਲ੍ਹਾ',
      classrooms: 'ਕਲਾਸਰੂਮ',
      attendance: 'ਹਾਜ਼ਰੀ',
      schools: 'ਸਕੂਲ',
      small: 'ਛੋਟਾ (<100)',
      medium: 'ਦਰਮਿਆਨਾ (100-300)',
      large: 'ਵੱਡਾ (300-500)',
      veryLarge: 'ਬਹੁਤ ਵੱਡਾ (500+)',
    },
  };

  const t = translations[language as keyof typeof translations] || translations.en;

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('pragati_token');
      const role = localStorage.getItem('pragati_role');

      if (!token || role !== 'GOVERNMENT') {
        router.push('/login/government');
        return;
      }

      setGovernmentName('Government Official');
      fetchDashboardData(token);
    }
  }, [router]);

  const fetchDashboardData = async (token: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const backendUrl = (process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:4000').replace(/\/$/, '');

      // Fetch schools
      const schoolsRes = await fetch(`${backendUrl}/api/core/schools`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!schoolsRes.ok) throw new Error('Failed to fetch schools');
      const schoolsData = await schoolsRes.json();

      // For each school, fetch detailed stats
      const schoolStatsPromises = schoolsData.map(async (school: any) => {
        try {
          const [studentsRes, teachersRes, classroomsRes] = await Promise.all([
            fetch(`${backendUrl}/api/core/students?schoolId=${school.id}`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
            fetch(`${backendUrl}/api/core/teachers?schoolId=${school.id}`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
            fetch(`${backendUrl}/api/core/classrooms?schoolId=${school.id}`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
          ]);

          const students = studentsRes.ok ? await studentsRes.json() : [];
          const teachers = teachersRes.ok ? await teachersRes.json() : [];
          const classrooms = classroomsRes.ok ? await classroomsRes.json() : [];

          return {
            id: school.id,
            name: school.name,
            district: school.district,
            totalStudents: Array.isArray(students) ? students.length : 0,
            totalTeachers: Array.isArray(teachers) ? teachers.length : 0,
            totalClassrooms: Array.isArray(classrooms) ? classrooms.length : 0,
            attendanceRate: 0, // No attendance data available yet
            activeComplaints: 0, // No complaints API access for government
          };
        } catch (err) {
          console.error(`Error fetching stats for school ${school.id}:`, err);
          return {
            id: school.id,
            name: school.name,
            district: school.district,
            totalStudents: 0,
            totalTeachers: 0,
            totalClassrooms: 0,
            attendanceRate: 0,
            activeComplaints: 0,
          };
        }
      });

      const schoolStats = await Promise.all(schoolStatsPromises);
      setSchools(schoolStats);

      // Calculate overall stats
      const overall: OverallStats = {
        totalSchools: schoolStats.length,
        totalStudents: schoolStats.reduce((sum, s) => sum + s.totalStudents, 0),
        totalTeachers: schoolStats.reduce((sum, s) => sum + s.totalTeachers, 0),
        totalClassrooms: schoolStats.reduce((sum, s) => sum + s.totalClassrooms, 0),
        averageAttendance: schoolStats.length > 0
          ? schoolStats.reduce((sum, s) => sum + s.attendanceRate, 0) / schoolStats.length
          : 0,
        totalComplaints: 0,
        openComplaints: 0,
        resolvedComplaints: 0,
      };

      setOverallStats(overall);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Unable to load dashboard data. Please try again.');
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

  const quickLinks = [
    {
      id: 'schools',
      title: t.allSchools,
      description: t.viewAllSchools,
      icon: School,
      gradient: 'from-blue-500 to-cyan-500',
      href: '/government/schools',
    },
    {
      id: 'reports',
      title: t.reportsAnalytics,
      description: t.comprehensiveReports,
      icon: BarChart3,
      gradient: 'from-purple-500 to-pink-500',
      href: '/government/reports',
    },
    {
      id: 'complaints',
      title: t.complaintsOverview,
      description: t.monitorComplaints,
      icon: AlertCircle,
      gradient: 'from-orange-500 to-red-500',
      href: '/government/complaints',
    },
    {
      id: 'users',
      title: t.userManagement,
      description: t.manageUsers,
      icon: Users,
      gradient: 'from-emerald-500 to-teal-500',
      href: '/government/users',
    },
    {
      id: 'programs',
      title: t.programManagement,
      description: t.managePrograms,
      icon: Landmark,
      gradient: 'from-indigo-500 to-blue-500',
      href: '/government/programs',
    },
  ];

  const statCards = [
    {
      label: t.totalSchools,
      value: overallStats.totalSchools,
      icon: School,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      label: t.totalStudents,
      value: overallStats.totalStudents.toLocaleString(),
      icon: GraduationCap,
      color: 'from-purple-500 to-indigo-500',
    },
    {
      label: t.totalTeachers,
      value: overallStats.totalTeachers,
      icon: Users,
      color: 'from-emerald-500 to-teal-500',
    },
    {
      label: t.avgAttendance,
      value: `${(overallStats.averageAttendance * 100).toFixed(1)}%`,
      icon: TrendingUp,
      color: 'from-orange-500 to-rose-500',
    },
  ];

  // UX4G compliant chart colors
  const CHART_COLORS = {
    primary: '#613AF5',      // UX4G Primary Purple
    secondary: '#938BB6',    // UX4G Secondary
    success: '#10b981',      // Emerald for success
    warning: '#f59e0b',      // Amber for warning
    danger: '#ef4444',       // Red for danger
    info: '#3b82f6',         // Blue for info
    cyan: '#00AAFF',         // UX4G Cyan
    orange: '#f97316',       // Orange accent
  };

  // Chart data computations
  const schoolComparisonData = useMemo(() => {
    return schools
      .sort((a, b) => b.totalStudents - a.totalStudents)
      .slice(0, 8)
      .map(school => ({
        name: school.name.length > 15 ? school.name.substring(0, 15) + '...' : school.name,
        fullName: school.name,
        students: school.totalStudents,
        teachers: school.totalTeachers,
        classrooms: school.totalClassrooms,
        ratio: school.totalTeachers > 0 ? Math.round(school.totalStudents / school.totalTeachers) : 0,
      }));
  }, [schools]);

  const districtDistribution = useMemo(() => {
    const districtMap: { [key: string]: { schools: number; students: number; teachers: number } } = {};
    
    schools.forEach(school => {
      const district = school.district || 'Unknown';
      if (!districtMap[district]) {
        districtMap[district] = { schools: 0, students: 0, teachers: 0 };
      }
      districtMap[district].schools++;
      districtMap[district].students += school.totalStudents;
      districtMap[district].teachers += school.totalTeachers;
    });

    return Object.entries(districtMap).map(([name, data]) => ({
      name,
      schools: data.schools,
      students: data.students,
      teachers: data.teachers,
    }));
  }, [schools]);

  const resourceAllocationData = useMemo(() => {
    return schools.map(school => ({
      name: school.name.length > 12 ? school.name.substring(0, 12) + '...' : school.name,
      fullName: school.name,
      studentTeacherRatio: school.totalTeachers > 0 
        ? Math.round(school.totalStudents / school.totalTeachers) 
        : 0,
      studentsPerClassroom: school.totalClassrooms > 0 
        ? Math.round(school.totalStudents / school.totalClassrooms) 
        : 0,
    }));
  }, [schools]);

  const schoolSizeDistribution = useMemo(() => {
    const sizes = {
      'Small (<100)': 0,
      'Medium (100-300)': 0,
      'Large (300-500)': 0,
      'Very Large (500+)': 0,
    };

    schools.forEach(school => {
      if (school.totalStudents < 100) sizes['Small (<100)']++;
      else if (school.totalStudents < 300) sizes['Medium (100-300)']++;
      else if (school.totalStudents < 500) sizes['Large (300-500)']++;
      else sizes['Very Large (500+)']++;
    });

    return Object.entries(sizes)
      .filter(([_, value]) => value > 0)
      .map(([name, value], index) => ({
        name,
        value,
        fill: [CHART_COLORS.primary, CHART_COLORS.info, CHART_COLORS.success, CHART_COLORS.warning][index],
      }));
  }, [schools]);

  const topSchoolsByStudents = useMemo(() => {
    return [...schools]
      .sort((a, b) => b.totalStudents - a.totalStudents)
      .slice(0, 5);
  }, [schools]);

  const topSchoolsByTeachers = useMemo(() => {
    return [...schools]
      .sort((a, b) => b.totalTeachers - a.totalTeachers)
      .slice(0, 5);
  }, [schools]);

  // Custom tooltip styles for charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3 text-sm">
          <p className="font-semibold text-gray-900 dark:text-white mb-1">
            {payload[0]?.payload?.fullName || label}
          </p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-gray-600 dark:text-gray-300 flex items-center gap-2">
              <span 
                className="w-2 h-2 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              {entry.name}: <span className="font-medium">{entry.value}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:4rem_4rem] dark:bg-slate-950">
      {/* Top Government Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-orange-600 to-orange-500 text-white px-4 py-2 text-xs sm:text-sm shadow-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-white/20 rounded flex items-center justify-center text-xs font-bold">
              🇮🇳
            </div>
            <span className="font-semibold hidden sm:inline">{t.govtOfIndia}</span>
            <span className="font-semibold sm:hidden">GOI</span>
          </div>
          <span className="text-[10px] sm:text-xs font-medium">{t.ministryOfEducation}</span>
        </div>
      </div>

      {/* Main Header */}
      <header className="fixed top-10 sm:top-12 left-0 right-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-sm sm:text-lg font-bold text-gray-900 dark:text-white">{t.governmentPortal}</h1>
                <p className="text-[10px] sm:text-xs text-muted-foreground">
                  {t.ministrySubtitle}
                </p>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-4">
              <div className="inline-flex items-center rounded-full bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-gray-700 px-1 py-0.5 text-[11px]">
                <button 
                  type="button" 
                  onClick={() => setLanguage('en')}
                  className={`px-2 py-0.5 rounded-full transition ${language === 'en' ? 'bg-white dark:bg-slate-700 shadow-sm text-gray-900 dark:text-white font-medium' : 'text-muted-foreground hover:text-gray-900 dark:hover:text-white'}`}
                >
                  English
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage('pa')}
                  className={`px-2 py-0.5 rounded-full transition ${language === 'pa' ? 'bg-white dark:bg-slate-700 shadow-sm text-gray-900 dark:text-white font-medium' : 'text-muted-foreground hover:text-gray-900 dark:hover:text-white'}`}
                >
                  ਪੰਜਾਬੀ
                </button>
              </div>

              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-gray-700">
                <UserCircle className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs font-medium text-gray-900 dark:text-white">{governmentName}</span>
              </div>

              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 text-xs font-medium hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                {t.logout}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-32 sm:pt-36 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Welcome Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
            
            <div className="relative z-10">
              <p className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] border border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-900/30 dark:bg-orange-900/10 dark:text-orange-400 mb-3">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-orange-500 animate-pulse" />
                {t.bharatSarkar}
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {t.welcome}, <span className="text-primary">{governmentName}</span>
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground">
                {t.monitorSchools}
              </p>
            </div>
          </motion.div>

          {/* Stats Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900 p-6 animate-pulse"
                >
                  <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4 mb-4" />
                  <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {statCards.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900 p-6 hover:border-primary hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-lg bg-gradient-to-br ${stat.color} text-white shadow-sm`}>
                      <stat.icon className="w-5 h-5" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{t.quickAccess}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => router.push(link.href)}
                  className="group relative overflow-hidden rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900 p-6 text-left hover:border-primary hover:shadow-md transition-all duration-200"
                >
                  <div className={`inline-flex p-3 rounded-lg bg-gradient-to-br ${link.gradient} text-white mb-4 group-hover:scale-110 transition-transform`}>
                    <link.icon className="w-5 h-5" />
                  </div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-1">{link.title}</h4>
                  <p className="text-xs text-muted-foreground">{link.description}</p>
                </button>
              ))}
            </div>
          </motion.div>

          {/* School Comparison Analytics Section */}
          {!isLoading && schools.length > 0 && (
            <>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t.schoolComparisonAnalytics}</h3>
                </div>
                
                {/* Charts Grid - Row 1 */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  {/* Student & Teacher Comparison Bar Chart */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className="rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900 p-6 shadow-sm"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">{t.studentsTeachersBySchool}</h4>
                        <p className="text-xs text-muted-foreground mt-0.5">{t.top8Schools}</p>
                      </div>
                      <div className="flex items-center gap-3 text-xs">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: CHART_COLORS.primary }} />
                          <span className="text-muted-foreground">{t.students}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: CHART_COLORS.success }} />
                          <span className="text-muted-foreground">{t.teachers}</span>
                        </div>
                      </div>
                    </div>
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={schoolComparisonData} margin={{ top: 10, right: 10, left: -10, bottom: 40 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
                          <XAxis 
                            dataKey="name" 
                            tick={{ fontSize: 10, fill: '#6b7280' }}
                            angle={-45}
                            textAnchor="end"
                            height={60}
                            interval={0}
                          />
                          <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} />
                          <Tooltip content={<CustomTooltip />} />
                          <Bar dataKey="students" name={t.students} fill={CHART_COLORS.primary} radius={[4, 4, 0, 0]} />
                          <Bar dataKey="teachers" name={t.teachers} fill={CHART_COLORS.success} radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </motion.div>

                  {/* School Size Distribution Pie Chart */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.35 }}
                    className="rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900 p-6 shadow-sm"
                  >
                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-900 dark:text-white">{t.schoolSizeDistribution}</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">{t.categorizedByEnrollment}</p>
                    </div>
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={schoolSizeDistribution}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={3}
                            dataKey="value"
                            label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                            labelLine={{ stroke: '#6b7280', strokeWidth: 1 }}
                          >
                            {schoolSizeDistribution.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                          </Pie>
                          <Tooltip 
                            formatter={(value: number) => [`${value} schools`, 'Count']}
                            contentStyle={{ 
                              backgroundColor: 'white', 
                              border: '1px solid #e5e7eb',
                              borderRadius: '8px',
                              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </motion.div>
                </div>

                {/* Charts Grid - Row 2 */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  {/* Student-Teacher Ratio Chart */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                    className="rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900 p-6 shadow-sm"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">{t.studentTeacherRatio}</h4>
                        <p className="text-xs text-muted-foreground mt-0.5">{t.lowerIsBetter}</p>
                      </div>
                      <div className="px-2 py-1 rounded-md bg-primary/10 text-primary text-xs font-medium">
                        Avg: {overallStats.totalTeachers > 0 ? Math.round(overallStats.totalStudents / overallStats.totalTeachers) : 0}:1
                      </div>
                    </div>
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={resourceAllocationData} margin={{ top: 10, right: 10, left: -10, bottom: 40 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
                          <XAxis 
                            dataKey="name" 
                            tick={{ fontSize: 10, fill: '#6b7280' }}
                            angle={-45}
                            textAnchor="end"
                            height={60}
                            interval={0}
                          />
                          <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} />
                          <Tooltip content={<CustomTooltip />} />
                          <Bar dataKey="studentTeacherRatio" name={t.studentTeacherRatio} fill={CHART_COLORS.warning} radius={[4, 4, 0, 0]} />
                          <Line 
                            type="monotone" 
                            dataKey="studentTeacherRatio" 
                            stroke={CHART_COLORS.danger}
                            strokeWidth={2}
                            dot={{ fill: CHART_COLORS.danger, r: 4 }}
                            name="Trend"
                          />
                        </ComposedChart>
                      </ResponsiveContainer>
                    </div>
                  </motion.div>

                  {/* District Distribution Chart */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.45 }}
                    className="rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900 p-6 shadow-sm"
                  >
                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-900 dark:text-white">{t.distributionByDistrict}</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">{t.schoolsStudentsTeachersPerDistrict}</p>
                    </div>
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={districtDistribution} margin={{ top: 10, right: 10, left: -10, bottom: 0 }} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
                          <XAxis type="number" tick={{ fontSize: 11, fill: '#6b7280' }} />
                          <YAxis 
                            type="category" 
                            dataKey="name" 
                            tick={{ fontSize: 11, fill: '#6b7280' }}
                            width={80}
                          />
                          <Tooltip content={<CustomTooltip />} />
                          <Legend 
                            wrapperStyle={{ fontSize: '12px' }}
                            iconSize={10}
                          />
                          <Bar dataKey="schools" name={t.schools} fill={CHART_COLORS.info} radius={[0, 4, 4, 0]} />
                          <Bar dataKey="students" name={t.students} fill={CHART_COLORS.primary} radius={[0, 4, 4, 0]} />
                          <Bar dataKey="teachers" name={t.teachers} fill={CHART_COLORS.success} radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </motion.div>
                </div>

                {/* Top Schools Summary Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Top Schools by Students */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm"
                  >
                    <div className="p-5 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-primary/5 to-transparent">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary">
                          <GraduationCap className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">{t.largestSchools}</h4>
                          <p className="text-xs text-muted-foreground">{t.byStudentEnrollment}</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 space-y-3">
                      {topSchoolsByStudents.map((school, index) => (
                        <div 
                          key={school.id} 
                          className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-slate-800/50 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                          onClick={() => router.push(`/government/schools/${school.id}`)}
                        >
                          <div className="flex items-center gap-3">
                            <span className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
                              index === 0 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                              index === 1 ? 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300' :
                              index === 2 ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                              'bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-gray-400'
                            }`}>
                              {index + 1}
                            </span>
                            <div>
                              <p className="font-medium text-sm text-gray-900 dark:text-white">{school.name}</p>
                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {school.district}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                              {school.totalStudents.toLocaleString()} {t.students.toLowerCase()}
                            </span>
                            <ArrowUpRight className="w-4 h-4 text-muted-foreground" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>

                  {/* Top Schools by Teachers */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.55 }}
                    className="rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm"
                  >
                    <div className="p-5 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-emerald-500/5 to-transparent">
                      <div className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                          <Users className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">{t.mostStaff}</h4>
                          <p className="text-xs text-muted-foreground">{t.byTeacherCount}</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 space-y-3">
                      {topSchoolsByTeachers.map((school, index) => (
                        <div 
                          key={school.id} 
                          className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-slate-800/50 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                          onClick={() => router.push(`/government/schools/${school.id}`)}
                        >
                          <div className="flex items-center gap-3">
                            <span className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
                              index === 0 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                              index === 1 ? 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400' :
                              index === 2 ? 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400' :
                              'bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-gray-400'
                            }`}>
                              {index + 1}
                            </span>
                            <div>
                              <p className="font-medium text-sm text-gray-900 dark:text-white">{school.name}</p>
                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {school.district}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                              {school.totalTeachers} {t.teachers.toLowerCase()}
                            </span>
                            <ArrowUpRight className="w-4 h-4 text-muted-foreground" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </>
          )}

          {/* Schools Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm"
          >
            <div className="p-6 border-b border-gray-200 dark:border-gray-800">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t.schoolsOverview}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {schools.length} {t.schoolsRegistered}
              </p>
            </div>

            {isLoading ? (
              <div className="p-12 text-center">
                <div className="inline-block w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                <p className="mt-4 text-sm text-muted-foreground">{t.loadingSchools}</p>
              </div>
            ) : schools.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
                  <School className="w-6 h-6 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{t.noSchoolsRegistered}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-slate-800/50 border-b border-gray-200 dark:border-gray-800">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{t.schoolName}</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{t.district}</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{t.students}</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{t.teachers}</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{t.classrooms}</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{t.attendance}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                    {schools.map((school) => (
                      <tr
                        key={school.id}
                        className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                        onClick={() => router.push(`/government/schools/${school.id}`)}
                      >
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900 dark:text-white">{school.name}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {school.district}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{school.totalStudents}</td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{school.totalTeachers}</td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{school.totalClassrooms}</td>
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
