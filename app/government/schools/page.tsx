'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  LogOut,
  UserCircle,
  School as SchoolIcon,
  MapPin,
  Users,
  GraduationCap,
  BookOpen,
  Building,
  Search,
  TrendingUp,
  ChevronRight,
} from 'lucide-react';

interface SchoolData {
  id: string;
  name: string;
  district: string;
  address: string;
  principalName: string | null;
  principalPhone: string | null;
  totalStudents: number;
  totalTeachers: number;
  totalClassrooms: number;
}

export default function GovernmentSchoolsPage() {
  const router = useRouter();
  const [governmentName, setGovernmentName] = useState('Government Official');
  const [schools, setSchools] = useState<SchoolData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [districtFilter, setDistrictFilter] = useState<string>('all');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('pragati_token');
      const role = localStorage.getItem('pragati_role');

      if (!token || role !== 'GOVERNMENT') {
        router.push('/login/government');
        return;
      }

      setGovernmentName('Government Official');
      fetchSchoolsData(token);
    }
  }, [router]);

  const fetchSchoolsData = async (token: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const backendUrl = (process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:4000').replace(/\/$/, '');

      const schoolsRes = await fetch(`${backendUrl}/api/core/schools`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!schoolsRes.ok) throw new Error('Failed to fetch schools');
      const schoolsData = await schoolsRes.json();

      // Fetch detailed stats for each school
      const schoolDetailsPromises = schoolsData.map(async (school: any) => {
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
            address: school.address,
            principalName: school.principalName,
            principalPhone: school.principalPhone,
            totalStudents: Array.isArray(students) ? students.length : 0,
            totalTeachers: Array.isArray(teachers) ? teachers.length : 0,
            totalClassrooms: Array.isArray(classrooms) ? classrooms.length : 0,
          };
        } catch (err) {
          console.error(`Error fetching details for school ${school.id}:`, err);
          return {
            id: school.id,
            name: school.name,
            district: school.district,
            address: school.address,
            principalName: school.principalName,
            principalPhone: school.principalPhone,
            totalStudents: 0,
            totalTeachers: 0,
            totalClassrooms: 0,
          };
        }
      });

      const schoolDetails = await Promise.all(schoolDetailsPromises);
      setSchools(schoolDetails);
    } catch (err) {
      console.error('Error fetching schools:', err);
      setError('Unable to load schools data. Please try again.');
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

  const districts = Array.from(new Set(schools.map((s) => s.district)));

  const filteredSchools = schools.filter((school) => {
    const matchesSearch =
      searchQuery === '' ||
      school.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      school.district.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDistrict = districtFilter === 'all' || school.district === districtFilter;

    return matchesSearch && matchesDistrict;
  });

  const totalStats = {
    students: schools.reduce((sum, s) => sum + s.totalStudents, 0),
    teachers: schools.reduce((sum, s) => sum + s.totalTeachers, 0),
    classrooms: schools.reduce((sum, s) => sum + s.totalClassrooms, 0),
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
                <SchoolIcon className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-sm sm:text-lg font-bold text-gray-900 dark:text-white">Schools Directory</h1>
                <p className="text-[10px] sm:text-xs text-muted-foreground">
                  Manage and monitor registered schools
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
          {/* Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900 p-6"
            >
              <div className="flex items-center gap-2 mb-2">
                <SchoolIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <p className="text-sm text-muted-foreground">Schools</p>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{schools.length}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900 p-6"
            >
              <div className="flex items-center gap-2 mb-2">
                <GraduationCap className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <p className="text-sm text-muted-foreground">Students</p>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{totalStats.students.toLocaleString()}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900 p-6"
            >
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <p className="text-sm text-muted-foreground">Teachers</p>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{totalStats.teachers}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900 p-6"
            >
              <div className="flex items-center gap-2 mb-2">
                <Building className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                <p className="text-sm text-muted-foreground">Classrooms</p>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{totalStats.classrooms}</p>
            </motion.div>
          </div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900 p-6"
          >
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search schools..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-950 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  />
                </div>
              </div>

              <select
                value={districtFilter}
                onChange={(e) => setDistrictFilter(e.target.value)}
                className="rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <option value="all">All Districts</option>
                {districts.map((district) => (
                  <option key={district} value={district}>
                    {district}
                  </option>
                ))}
              </select>
            </div>
          </motion.div>

          {/* Schools Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            {isLoading ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900 p-6 animate-pulse"
                  >
                    <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-3/4 mb-4" />
                    <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/2 mb-4" />
                    <div className="flex gap-4">
                      <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-20" />
                      <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-20" />
                      <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-20" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredSchools.length === 0 ? (
              <div className="rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900 p-12 text-center">
                <SchoolIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-sm text-muted-foreground">
                  {searchQuery || districtFilter !== 'all' ? 'No schools match your filters' : 'No schools found'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filteredSchools.map((school, index) => (
                  <motion.button
                    key={school.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => router.push(`/government/schools/${school.id}`)}
                    className="group relative overflow-hidden rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900 p-6 text-left hover:border-primary hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold mb-1 text-gray-900 dark:text-white group-hover:text-primary transition">
                          {school.name}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                          <MapPin className="w-3 h-3" />
                          {school.district}
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition" />
                    </div>

                    {school.principalName && (
                      <div className="mb-3 text-sm">
                        <p className="text-muted-foreground">Principal: {school.principalName}</p>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-4">
                      <div className="flex items-center gap-2 text-sm">
                        <GraduationCap className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        <span className="font-medium text-gray-900 dark:text-white">{school.totalStudents}</span>
                        <span className="text-muted-foreground">students</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <span className="font-medium text-gray-900 dark:text-white">{school.totalTeachers}</span>
                        <span className="text-muted-foreground">teachers</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Building className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                        <span className="font-medium text-gray-900 dark:text-white">{school.totalClassrooms}</span>
                        <span className="text-muted-foreground">classrooms</span>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
