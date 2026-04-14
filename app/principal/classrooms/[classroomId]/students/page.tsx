'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Search,
  Users,
  Phone,
  Mail,
  Calendar,
  GraduationCap,
  School,
} from 'lucide-react';

interface Student {
  id: string;
  code: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  gender?: string;
  contact?: {
    phone?: string;
    email?: string;
    address?: string;
  };
  user?: {
    id: string;
    email: string;
  };
}

interface Classroom {
  id: string;
  grade: { id: string; name: string; level: number };
  section: { id: string; label: string };
  academicYear: string;
}

export default function ClassroomStudentsPage() {
  const router = useRouter();
  const params = useParams();
  const classroomId = params.classroomId as string;

  const [students, setStudents] = useState<Student[]>([]);
  const [classroom, setClassroom] = useState<Classroom | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [principalName, setPrincipalName] = useState('Principal');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('pragati_token');
      const role = localStorage.getItem('pragati_role');
      const name = localStorage.getItem('pragati_name') || 'Principal';

      if (!token || role !== 'PRINCIPAL') {
        router.push('/login/principal');
        return;
      }

      setPrincipalName(name);
      fetchData(token);
    }
  }, [router, classroomId]);

  const fetchData = async (token: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const backendUrl = (process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:4000').replace(/\/$/, '');

      // Fetch classroom details and students in parallel
      const [classroomRes, studentsRes] = await Promise.all([
        fetch(`${backendUrl}/api/core/classrooms/${classroomId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${backendUrl}/api/core/students?classroomId=${classroomId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (classroomRes.ok) {
        const classroomData = await classroomRes.json();
        setClassroom(classroomData);
      } else {
        const classroomFallback = classroomsFromStudents(classroomId, studentsRes);
        if (classroomFallback) {
          setClassroom(classroomFallback);
        }
      }

      if (studentsRes.ok) {
        const studentsData = await studentsRes.json();
        setStudents(Array.isArray(studentsData) ? studentsData : []);
      } else {
        // Students API might return 404 if no students, that's okay
        setStudents([]);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Unable to load classroom details. Student list may still be shown.');
    } finally {
      setIsLoading(false);
    }
  };

  const classroomsFromStudents = (requestedClassroomId: string, studentsResponse: Response): Classroom | null => {
    if (!studentsResponse.ok) return null;
    return {
      id: requestedClassroomId,
      grade: { id: '', name: 'Classroom', level: 0 },
      section: { id: '', label: requestedClassroomId },
      academicYear: 'N/A',
    };
  };

  const filteredStudents = students.filter((student) => {
    const searchLower = searchQuery.toLowerCase();
    const fullName = `${student.firstName} ${student.lastName}`.toLowerCase();
    return (
      fullName.includes(searchLower) ||
      student.code.toLowerCase().includes(searchLower) ||
      student.user?.email?.toLowerCase().includes(searchLower)
    );
  });

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                {classroom ? `${classroom.grade.name} - ${classroom.section.label}` : 'Classroom'} Students
              </h1>
              <p className="text-sm text-muted-foreground">
                {students.length} students enrolled
              </p>
            </div>
          </div>
        </div>

        {/* Classroom Info Card */}
        {classroom && (
          <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900 p-4 sm:p-6 shadow-sm"
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-sm w-fit">
                  <School className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                    {classroom.grade.name} - Section {classroom.section.label}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Academic Year: {classroom.academicYear}
                  </p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 text-primary">
                  <Users className="w-4 h-4" />
                  <span className="text-sm font-medium">{students.length} Students</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900 p-4 shadow-sm"
          >
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by name, roll number, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-slate-950 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-all"
              />
            </div>
          </motion.div>

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
              <p className="mt-4 text-sm text-muted-foreground">Loading students...</p>
            </div>
          )}

          {/* Students Grid */}
          {!isLoading && !error && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredStudents.length === 0 ? (
                <div className="col-span-full rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900 p-12 text-center shadow-sm">
                  <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground">
                    {searchQuery ? 'No students match your search' : 'No students enrolled in this classroom'}
                  </p>
                </div>
              ) : (
                filteredStudents.map((student, index) => (
                  <motion.div
                    key={student.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900 p-5 hover:border-primary/50 hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-sm">
                        <GraduationCap className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-bold text-gray-900 dark:text-white truncate">
                          {student.firstName} {student.lastName}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          Roll No: {student.code}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 space-y-2">
                      {student.user?.email && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Mail className="w-3.5 h-3.5" />
                          <span className="truncate">{student.user.email}</span>
                        </div>
                      )}
                      {student.contact?.phone && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Phone className="w-3.5 h-3.5" />
                          <span>{student.contact.phone}</span>
                        </div>
                      )}
                      {student.dateOfBirth && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>DOB: {formatDate(student.dateOfBirth)}</span>
                        </div>
                      )}
                      {student.gender && (
                        <div className="flex items-center gap-2 text-xs">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                            student.gender === 'M' || student.gender === 'MALE'
                              ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                              : student.gender === 'F' || student.gender === 'FEMALE'
                              ? 'bg-pink-50 text-pink-600 dark:bg-pink-900/20 dark:text-pink-400'
                              : 'bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                          }`}>
                            {student.gender === 'M' ? 'Male' : student.gender === 'F' ? 'Female' : student.gender}
                          </span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          )}
      </div>
    </div>
  );
}
