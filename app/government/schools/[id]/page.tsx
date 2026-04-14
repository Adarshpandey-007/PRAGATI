'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
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
  Phone,
  Mail,
  Calendar,
} from 'lucide-react';

interface SchoolDetail {
  id: string;
  name: string;
  district: string;
  address: string;
  principalName: string | null;
  principalPhone: string | null;
  principalEmail: string | null;
  established: string | null;
}

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  code: string;
  gender: string;
  classroom: {
    grade: { name: string };
    section: { label: string };
  };
}

interface Teacher {
  id: string;
  firstName: string;
  lastName: string;
  code: string;
  email: string;
  phoneNumber: string;
  subjects: Array<{ name: string }>;
}

interface Classroom {
  id: string;
  grade: { name: string };
  section: { label: string };
  classTeacher: {
    firstName: string;
    lastName: string;
  } | null;
}

export default function SchoolDetailPage() {
  const router = useRouter();
  const params = useParams();
  const schoolId = params?.id as string;
  
  const [governmentName, setGovernmentName] = useState('Government Official');
  const [school, setSchool] = useState<SchoolDetail | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'students' | 'teachers' | 'classrooms'>('overview');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('pragati_token');
      const role = localStorage.getItem('pragati_role');

      if (!token || role !== 'GOVERNMENT') {
        router.push('/login/government');
        return;
      }

      setGovernmentName('Government Official');
      fetchSchoolDetail(token);
    }
  }, [router, schoolId]);

  const fetchSchoolDetail = async (token: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const backendUrl = (process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:4000').replace(/\/$/, '');

      // First fetch all schools to get the specific school's basic info
      const schoolsRes = await fetch(`${backendUrl}/api/core/schools`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!schoolsRes.ok) throw new Error('Failed to fetch schools');
      const schoolsData = await schoolsRes.json();
      
      // Find the specific school by ID
      const schoolData = schoolsData.find((s: any) => s.id === schoolId);
      
      if (!schoolData) {
        throw new Error('School not found');
      }

      // Now fetch students, teachers, and classrooms for this school
      const [studentsRes, teachersRes, classroomsRes] = await Promise.all([
        fetch(`${backendUrl}/api/core/students?schoolId=${schoolId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${backendUrl}/api/core/teachers?schoolId=${schoolId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${backendUrl}/api/core/classrooms?schoolId=${schoolId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const studentsData = studentsRes.ok ? await studentsRes.json() : [];
      const teachersData = teachersRes.ok ? await teachersRes.json() : [];
      const classroomsData = classroomsRes.ok ? await classroomsRes.json() : [];

      setSchool(schoolData);
      setStudents(Array.isArray(studentsData) ? studentsData : []);
      setTeachers(Array.isArray(teachersData) ? teachersData : []);
      setClassrooms(Array.isArray(classroomsData) ? classroomsData : []);
    } catch (err) {
      console.error('Error fetching school details:', err);
      setError('Unable to load school details. Please try again.');
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-slate-950 dark:via-blue-950 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4" />
          <p className="text-sm text-muted-foreground">Loading school details...</p>
        </div>
      </div>
    );
  }

  if (error || !school) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-slate-950 dark:via-blue-950 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <SchoolIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">{error || 'School not found'}</p>
          <button
            onClick={() => router.push('/government/schools')}
            className="mt-4 px-4 py-2 rounded-lg bg-primary text-white text-sm hover:bg-primary/90 transition"
          >
            Back to Schools
          </button>
        </div>
      </div>
    );
  }

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
                <h1 className="text-sm sm:text-lg font-bold text-gray-900 dark:text-white">{school.name}</h1>
                <p className="text-[10px] sm:text-xs text-muted-foreground">
                  School Details
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
          {/* School Info Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900 p-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">School Information</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-muted-foreground mt-1" />
                    <div>
                      <p className="text-xs text-muted-foreground">District</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{school.district}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Building className="w-4 h-4 text-muted-foreground mt-1" />
                    <div>
                      <p className="text-xs text-muted-foreground">Address</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{school.address}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Principal Details</h3>
                <div className="space-y-3">
                  {school.principalName ? (
                    <>
                      <div className="flex items-start gap-3">
                        <UserCircle className="w-4 h-4 text-muted-foreground mt-1" />
                        <div>
                          <p className="text-xs text-muted-foreground">Name</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{school.principalName}</p>
                        </div>
                      </div>
                      {school.principalPhone && (
                        <div className="flex items-start gap-3">
                          <Phone className="w-4 h-4 text-muted-foreground mt-1" />
                          <div>
                            <p className="text-xs text-muted-foreground">Phone</p>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">{school.principalPhone}</p>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">No principal assigned</p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900 p-6"
            >
              <div className="flex items-center gap-2 mb-2">
                <GraduationCap className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <p className="text-sm text-muted-foreground">Total Students</p>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{students.length}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900 p-6"
            >
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <p className="text-sm text-muted-foreground">Total Teachers</p>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{teachers.length}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900 p-6"
            >
              <div className="flex items-center gap-2 mb-2">
                <Building className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                <p className="text-sm text-muted-foreground">Classrooms</p>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{classrooms.length}</p>
            </motion.div>
          </div>

          {/* Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm"
          >
            <div className="border-b border-gray-200 dark:border-gray-800 p-2 flex gap-2">
              <button
                onClick={() => setActiveTab('students')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  activeTab === 'students'
                    ? 'bg-primary text-white'
                    : 'hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-600 dark:text-gray-300'
                }`}
              >
                Students ({students.length})
              </button>
              <button
                onClick={() => setActiveTab('teachers')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  activeTab === 'teachers'
                    ? 'bg-primary text-white'
                    : 'hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-600 dark:text-gray-300'
                }`}
              >
                Teachers ({teachers.length})
              </button>
              <button
                onClick={() => setActiveTab('classrooms')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  activeTab === 'classrooms'
                    ? 'bg-primary text-white'
                    : 'hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-600 dark:text-gray-300'
                }`}
              >
                Classrooms ({classrooms.length})
              </button>
            </div>

            <div className="p-6">
              {activeTab === 'students' && (
                <div className="overflow-x-auto">
                  {students.length === 0 ? (
                    <div className="text-center py-8">
                      <GraduationCap className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-sm text-muted-foreground">No students found</p>
                    </div>
                  ) : (
                    <table className="w-full">
                      <thead className="bg-gray-50 dark:bg-slate-800/50 border-b border-gray-200 dark:border-gray-800">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Code</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Gender</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Class</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                        {students.map((student) => (
                          <tr key={student.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                            <td className="px-6 py-4 text-sm font-mono text-gray-600 dark:text-gray-300">{student.code}</td>
                            <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{student.firstName} {student.lastName}</td>
                            <td className="px-6 py-4 text-sm capitalize text-gray-600 dark:text-gray-300">{student.gender}</td>
                            <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                              {student.classroom?.grade?.name && student.classroom?.section?.label
                                ? `${student.classroom.grade.name} - ${student.classroom.section.label}`
                                : 'Not assigned'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}

              {activeTab === 'teachers' && (
                <div className="overflow-x-auto">
                  {teachers.length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-sm text-muted-foreground">No teachers found</p>
                    </div>
                  ) : (
                    <table className="w-full">
                      <thead className="bg-gray-50 dark:bg-slate-800/50 border-b border-gray-200 dark:border-gray-800">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Code</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Phone</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Subjects</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                        {teachers.map((teacher) => (
                          <tr key={teacher.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                            <td className="px-6 py-4 text-sm font-mono text-gray-600 dark:text-gray-300">{teacher.code}</td>
                            <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{teacher.firstName} {teacher.lastName}</td>
                            <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{teacher.email}</td>
                            <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{teacher.phoneNumber}</td>
                            <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                              {teacher.subjects?.map((s) => s.name).join(', ') || '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}

              {activeTab === 'classrooms' && (
                <div className="overflow-x-auto">
                  {classrooms.length === 0 ? (
                    <div className="text-center py-8">
                      <Building className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-sm text-muted-foreground">No classrooms found</p>
                    </div>
                  ) : (
                    <table className="w-full">
                      <thead className="bg-gray-50 dark:bg-slate-800/50 border-b border-gray-200 dark:border-gray-800">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Grade</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Section</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Class Teacher</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                        {classrooms.map((classroom) => (
                          <tr key={classroom.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                            <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">{classroom.grade.name}</td>
                            <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{classroom.section.label}</td>
                            <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                              {classroom.classTeacher
                                ? `${classroom.classTeacher.firstName} ${classroom.classTeacher.lastName}`
                                : 'Not assigned'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
