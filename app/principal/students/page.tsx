'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Language, translations, getTranslation } from '@/lib/translations';
import {
  Plus,
  Edit,
  Search,
  GraduationCap,
  X,
  Save,
  Mail,
  Phone,
  Calendar,
  User as UserIcon,
  Upload,
  FileSpreadsheet,
  Download,
  CheckCircle,
  AlertCircle,
  Filter,
  ChevronDown,
  ChevronUp,
  SortAsc,
  SortDesc,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';

interface Student {
  id: string;
  schoolId: string;
  classroomId: string;
  classTeacherId: string;
  code: string;
  phoneNumber: string | null;
  firstName: string;
  lastName: string;
  gender: string | null;
  dateOfBirth: string | null;
  gradeLevel: number;
  sectionLabel: string;
  active: boolean;
  enrolledAt: string;
}

interface Classroom {
  id: string;
  grade: { id: string; name: string; level: number };
  section: { id: string; label: string };
}

interface Teacher {
  id: string;
  firstName: string;
  lastName: string;
}

export default function StudentsManagementPage() {
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [principalName, setPrincipalName] = useState('Principal');
  const [schoolId, setSchoolId] = useState('');
  const [lang, setLang] = useState<Language>('en');

  // Advanced Filters State
  const [showFilters, setShowFilters] = useState(false);
  const [selectedGrades, setSelectedGrades] = useState<number[]>([]);
  const [selectedSections, setSelectedSections] = useState<string[]>([]);
  const [selectedGenders, setSelectedGenders] = useState<string[]>([]);
  const [selectedClassrooms, setSelectedClassrooms] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<string>('name'); // 'name', 'code', 'grade', 'enrolledAt'
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const itemsPerPageOptions = [10, 25, 50, 100];

  // CSV Upload state
  const [showCsvModal, setShowCsvModal] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvPreview, setCsvPreview] = useState<any[]>([]);
  const [csvErrors, setCsvErrors] = useState<string[]>([]);
  const [csvSuccess, setCsvSuccess] = useState<number>(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);

  const t = (section: keyof typeof translations, key: string) => getTranslation(section, key, lang);

  const handleLanguageChange = (newLang: Language) => {
    setLang(newLang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('pragati_language', newLang);
    }
  };

  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    code: '',
    phoneNumber: '',
    classroomId: '',
    classTeacherId: '',
    gender: '',
    dateOfBirth: '',
    enrolledAt: new Date().toISOString().split('T')[0],
    isActive: true,
  });

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedGrades, selectedSections, selectedGenders, selectedClassrooms, sortBy, sortOrder]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('pragati_token');
      const role = localStorage.getItem('pragati_role');
      const name = localStorage.getItem('pragati_name') || 'Principal';
      const savedLang = localStorage.getItem('pragati_language') as Language;
      if (savedLang === 'en' || savedLang === 'pa' || savedLang === 'hi') setLang(savedLang);

      if (!token || role !== 'PRINCIPAL') {
        router.push('/login/principal');
        return;
      }

      setPrincipalName(name);
      fetchData(token);
    }
  }, [router]);

  const fetchData = async (token: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const backendUrl = (process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:4000').replace(/\/$/, '');
      
      const [studentsRes, classroomsRes, teachersRes] = await Promise.all([
        fetch(`${backendUrl}/api/core/students`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${backendUrl}/api/core/classrooms`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${backendUrl}/api/core/teachers`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (!studentsRes.ok || !classroomsRes.ok || !teachersRes.ok) {
        throw new Error('Failed to fetch data');
      }

      const studentsData = await studentsRes.json();
      const classroomsData = await classroomsRes.json();
      const teachersData = await teachersRes.json();

      setStudents(Array.isArray(studentsData) ? studentsData : []);
      setClassrooms(Array.isArray(classroomsData) ? classroomsData : []);
      setTeachers(Array.isArray(teachersData) ? teachersData : []);

      // Get schoolId from localStorage or from the data
      const storedSchoolId = localStorage.getItem('pragati_schoolId');
      if (storedSchoolId) {
        setSchoolId(storedSchoolId);
      } else if (studentsData.length > 0) {
        setSchoolId(studentsData[0].schoolId);
      } else if (classroomsData.length > 0) {
        setSchoolId(classroomsData[0].schoolId);
      } else {
        // Fetch from schools API as fallback
        const schoolsRes = await fetch(`${backendUrl}/api/core/schools`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (schoolsRes.ok) {
          const schoolsData = await schoolsRes.json();
          if (Array.isArray(schoolsData) && schoolsData.length > 0) {
            setSchoolId(schoolsData[0].id);
          }
        }
      }
    } catch (err) {
      setError('Unable to load data. Please try again.');
      console.error('Error fetching data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateStudent = async () => {
    if (!formData.firstName || !formData.lastName || !formData.code || !formData.classroomId || !formData.classTeacherId) return;

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('pragati_token');
      const backendUrl = (process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:4000').replace(/\/$/, '');

      const classroom = classrooms.find(c => c.id === formData.classroomId);

      const response = await fetch(`${backendUrl}/api/core/students`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          schoolId,
          classroomId: formData.classroomId,
          classTeacherId: formData.classTeacherId,
          code: formData.code,
          phoneNumber: formData.phoneNumber || undefined,
          firstName: formData.firstName,
          lastName: formData.lastName,
          gender: formData.gender || undefined,
          dateOfBirth: formData.dateOfBirth || undefined,
          gradeLevel: classroom?.grade.level,
          sectionLabel: classroom?.section.label,
          enrolledAt: formData.enrolledAt,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create student');
      }

      resetForm();
      setShowCreateModal(false);

      if (token) {
        await fetchData(token);
      }
    } catch (err) {
      console.error('Error creating student:', err);
      setError('Failed to create student. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStudent = async () => {
    if (!editingStudent) return;

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('pragati_token');
      const backendUrl = (process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:4000').replace(/\/$/, '');

      const response = await fetch(`${backendUrl}/api/core/students/${editingStudent.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          phoneNumber: formData.phoneNumber || undefined,
          classroomId: formData.classroomId,
          classTeacherId: formData.classTeacherId || undefined,
          gender: formData.gender || undefined,
          dateOfBirth: formData.dateOfBirth || undefined,
          active: formData.isActive,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update student');
      }

      setEditingStudent(null);
      resetForm();

      if (token) {
        await fetchData(token);
      }
    } catch (err) {
      console.error('Error updating student:', err);
      setError('Failed to update student. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      code: '',
      phoneNumber: '',
      classroomId: '',
      classTeacherId: '',
      gender: '',
      dateOfBirth: '',
      enrolledAt: new Date().toISOString().split('T')[0],
      isActive: true,
    });
  };

  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      firstName: student.firstName,
      lastName: student.lastName,
      code: student.code,
      phoneNumber: student.phoneNumber || '',
      classroomId: student.classroomId,
      classTeacherId: student.classTeacherId,
      gender: student.gender || '',
      dateOfBirth: student.dateOfBirth || '',
      enrolledAt: student.enrolledAt,
      isActive: student.active,
    });
  };

  // CSV Upload Functions
  const downloadCsvTemplate = () => {
    const headers = ['firstName', 'lastName', 'code', 'phoneNumber', 'classroomId', 'classTeacherId', 'gender', 'dateOfBirth', 'enrolledAt'];
    const sampleRow = ['John', 'Doe', 'STU001', '9876543210', classrooms[0]?.id || 'classroom-id', teachers[0]?.id || 'teacher-id', 'Male', '2010-05-15', new Date().toISOString().split('T')[0]];
    
    const csvContent = [
      headers.join(','),
      sampleRow.join(','),
      '# Notes:',
      '# - firstName and lastName are required',
      '# - code is the unique student ID/roll number (required)',
      '# - classroomId: ' + classrooms.map(c => `${c.id} (${c.grade.name}-${c.section.label})`).join(', '),
      '# - classTeacherId: ' + teachers.map(t => `${t.id} (${t.firstName} ${t.lastName})`).join(', '),
      '# - gender: Male, Female, or Other',
      '# - dateOfBirth format: YYYY-MM-DD',
      '# - enrolledAt format: YYYY-MM-DD',
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'students_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const parseCsvFile = (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim() && !line.startsWith('#'));
        
        if (lines.length < 2) {
          reject(new Error('CSV must have at least a header row and one data row'));
          return;
        }

        const headers = lines[0].split(',').map(h => h.trim());
        const requiredHeaders = ['firstName', 'lastName', 'code', 'classroomId', 'classTeacherId'];
        const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
        
        if (missingHeaders.length > 0) {
          reject(new Error(`Missing required columns: ${missingHeaders.join(', ')}`));
          return;
        }

        const data = [];
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => v.trim());
          if (values.length === headers.length) {
            const row: any = {};
            headers.forEach((header, index) => {
              row[header] = values[index];
            });
            data.push(row);
          }
        }
        resolve(data);
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  };

  const handleCsvFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCsvFile(file);
    setCsvErrors([]);
    setCsvPreview([]);
    setUploadComplete(false);
    setCsvSuccess(0);

    try {
      const data = await parseCsvFile(file);
      setCsvPreview(data.slice(0, 5)); // Show first 5 rows as preview
      
      // Validate data
      const errors: string[] = [];
      data.forEach((row, index) => {
        if (!row.firstName || !row.lastName) {
          errors.push(`Row ${index + 1}: Missing first or last name`);
        }
        if (!row.code) {
          errors.push(`Row ${index + 1}: Missing student code`);
        }
        if (!row.classroomId || !classrooms.find(c => c.id === row.classroomId)) {
          errors.push(`Row ${index + 1}: Invalid classroom ID`);
        }
        if (!row.classTeacherId || !teachers.find(t => t.id === row.classTeacherId)) {
          errors.push(`Row ${index + 1}: Invalid teacher ID`);
        }
      });
      
      if (errors.length > 0) {
        setCsvErrors(errors.slice(0, 10)); // Show first 10 errors
        if (errors.length > 10) {
          setCsvErrors(prev => [...prev, `... and ${errors.length - 10} more errors`]);
        }
      }
    } catch (err: any) {
      setCsvErrors([err.message]);
    }
  };

  const handleBulkUpload = async () => {
    if (!csvFile || csvErrors.length > 0) return;

    setIsUploading(true);
    setCsvErrors([]);
    setCsvSuccess(0);

    try {
      const token = localStorage.getItem('pragati_token');
      const backendUrl = (process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:4000').replace(/\/$/, '');
      const data = await parseCsvFile(csvFile);
      
      const errors: string[] = [];
      let successCount = 0;

      for (let i = 0; i < data.length; i++) {
        const row = data[i];
        const classroom = classrooms.find(c => c.id === row.classroomId);
        
        try {
          const response = await fetch(`${backendUrl}/api/core/students`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              schoolId,
              classroomId: row.classroomId,
              classTeacherId: row.classTeacherId,
              code: row.code,
              phoneNumber: row.phoneNumber || undefined,
              firstName: row.firstName,
              lastName: row.lastName,
              gender: row.gender || undefined,
              dateOfBirth: row.dateOfBirth || undefined,
              gradeLevel: classroom?.grade.level,
              sectionLabel: classroom?.section.label,
              enrolledAt: row.enrolledAt || new Date().toISOString().split('T')[0],
            }),
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            errors.push(`Row ${i + 1} (${row.code}): ${errorData.message || 'Failed to create'}`);
          } else {
            successCount++;
          }
        } catch (err: any) {
          errors.push(`Row ${i + 1} (${row.code}): ${err.message}`);
        }
      }

      setCsvSuccess(successCount);
      if (errors.length > 0) {
        setCsvErrors(errors.slice(0, 10));
        if (errors.length > 10) {
          setCsvErrors(prev => [...prev, `... and ${errors.length - 10} more errors`]);
        }
      }
      setUploadComplete(true);

      // Refresh the students list
      if (token) {
        await fetchData(token);
      }
    } catch (err: any) {
      setCsvErrors([err.message || 'Failed to process CSV']);
    } finally {
      setIsUploading(false);
    }
  };

  const resetCsvModal = () => {
    setShowCsvModal(false);
    setCsvFile(null);
    setCsvPreview([]);
    setCsvErrors([]);
    setCsvSuccess(0);
    setUploadComplete(false);
  };

  // Get unique values for filters
  const uniqueGrades = [...new Set(students.map(s => s.gradeLevel).filter((g): g is number => g != null))].sort((a, b) => a - b);
  const uniqueSections = [...new Set(students.map(s => s.sectionLabel).filter((s): s is string => s != null))].sort();
  const uniqueGenders = [...new Set(students.map(s => s.gender).filter((g): g is string => g != null))];

  // Clear all filters
  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedGrades([]);
    setSelectedSections([]);
    setSelectedGenders([]);
    setSelectedClassrooms([]);
    setSortBy('name');
    setSortOrder('asc');
    setCurrentPage(1);
  };

  // Reset to page 1 when filters change
  const handleFilterChange = () => {
    setCurrentPage(1);
  };

  // Count active filters
  const activeFilterCount = [
    selectedGrades.length > 0,
    selectedSections.length > 0,
    selectedGenders.length > 0,
    selectedClassrooms.length > 0,
  ].filter(Boolean).length;

  const filteredStudents = students
    .filter((student) => {
      // Search filter
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = 
        student.firstName.toLowerCase().includes(searchLower) ||
        student.lastName.toLowerCase().includes(searchLower) ||
        student.code.toLowerCase().includes(searchLower) ||
        (student.phoneNumber && student.phoneNumber.includes(searchLower));

      // Grade filter
      const matchesGrade = selectedGrades.length === 0 || selectedGrades.includes(student.gradeLevel);

      // Section filter
      const matchesSection = selectedSections.length === 0 || selectedSections.includes(student.sectionLabel);

      // Gender filter
      const matchesGender = selectedGenders.length === 0 || (student.gender && selectedGenders.includes(student.gender));

      // Classroom filter
      const matchesClassroom = selectedClassrooms.length === 0 || selectedClassrooms.includes(student.classroomId);

      return matchesSearch && matchesGrade && matchesSection && matchesGender && matchesClassroom;
    })
    .sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'name':
          comparison = `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
          break;
        case 'code':
          comparison = a.code.localeCompare(b.code);
          break;
        case 'grade':
          comparison = a.gradeLevel - b.gradeLevel || a.sectionLabel.localeCompare(b.sectionLabel);
          break;
        case 'enrolledAt':
          comparison = new Date(a.enrolledAt).getTime() - new Date(b.enrolledAt).getTime();
          break;
        default:
          comparison = 0;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  // Pagination calculations
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedStudents = filteredStudents.slice(startIndex, endIndex);

  // Pagination helpers
  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    return pages;
  };

  const getClassroomLabel = (classroomId: string) => {
    const classroom = classrooms.find(c => c.id === classroomId);
    return classroom ? `${classroom.grade.name} - ${classroom.section.label}` : 'N/A';
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{t('students', 'title')}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {students.length} total students
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <button
              onClick={() => setShowCsvModal(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border-2 border-primary text-primary text-sm font-medium hover:bg-primary/5 transition-all"
            >
              <Upload className="w-4 h-4" />
              Bulk Upload CSV
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              Add Student
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900 p-4 shadow-sm space-y-4"
        >
          {/* Search Row */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by name, code, or phone number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-slate-950 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-all"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                  showFilters || activeFilterCount > 0
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-slate-800'
                }`}
              >
                <Filter className="w-4 h-4" />
                Filters
                {activeFilterCount > 0 && (
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary text-white text-xs">
                    {activeFilterCount}
                  </span>
                )}
                {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              {activeFilterCount > 0 && (
                <button
                  onClick={clearAllFilters}
                  className="inline-flex items-center gap-2 px-3 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-slate-800 text-sm font-medium text-muted-foreground transition-all"
                >
                  <RotateCcw className="w-4 h-4" />
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Grade Filter */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Grade Level</label>
                  <div className="flex flex-wrap gap-1.5">
                    {uniqueGrades.map((grade) => (
                      <button
                        key={grade}
                        onClick={() => {
                          setSelectedGrades(prev =>
                            prev.includes(grade) ? prev.filter(g => g !== grade) : [...prev, grade]
                          );
                        }}
                        className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                          selectedGrades.includes(grade)
                            ? 'bg-primary text-white'
                            : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700'
                        }`}
                      >
                        Grade {grade}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Section Filter */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Section</label>
                  <div className="flex flex-wrap gap-1.5">
                    {uniqueSections.map((section) => (
                      <button
                        key={section}
                        onClick={() => {
                          setSelectedSections(prev =>
                            prev.includes(section) ? prev.filter(s => s !== section) : [...prev, section]
                          );
                        }}
                        className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                          selectedSections.includes(section)
                            ? 'bg-primary text-white'
                            : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700'
                        }`}
                      >
                        Section {section}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Gender Filter */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Gender</label>
                  <div className="flex flex-wrap gap-1.5">
                    {['Male', 'Female', 'Other', 'M', 'F', 'O'].filter(g => uniqueGenders.includes(g)).length > 0 ? (
                      uniqueGenders.map((gender) => (
                        <button
                          key={gender}
                          onClick={() => {
                            setSelectedGenders(prev =>
                              prev.includes(gender) ? prev.filter(g => g !== gender) : [...prev, gender]
                            );
                          }}
                          className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                            selectedGenders.includes(gender)
                              ? 'bg-primary text-white'
                              : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700'
                          }`}
                        >
                          {gender === 'M' ? 'Male' : gender === 'F' ? 'Female' : gender === 'O' ? 'Other' : gender}
                        </button>
                      ))
                    ) : (
                      <span className="text-xs text-muted-foreground">No gender data</span>
                    )}
                  </div>
                </div>

              </div>

              {/* Classroom Filter */}
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Classroom</label>
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                  {classrooms.map((classroom) => (
                    <button
                      key={classroom.id}
                      onClick={() => {
                        setSelectedClassrooms(prev =>
                          prev.includes(classroom.id) ? prev.filter(c => c !== classroom.id) : [...prev, classroom.id]
                        );
                      }}
                      className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                        selectedClassrooms.includes(classroom.id)
                          ? 'bg-primary text-white'
                          : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {classroom.grade.name} - {classroom.section.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort Options */}
              <div className="flex flex-col sm:flex-row gap-4 pt-2 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Sort by:</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-slate-950 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    <option value="name">Name</option>
                    <option value="code">Student Code</option>
                    <option value="grade">Grade & Section</option>
                    <option value="enrolledAt">Enrollment Date</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Order:</label>
                  <button
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-slate-950 text-sm hover:bg-gray-100 dark:hover:bg-slate-800 transition-all"
                  >
                    {sortOrder === 'asc' ? (
                      <>
                        <SortAsc className="w-4 h-4" />
                        Ascending
                      </>
                    ) : (
                      <>
                        <SortDesc className="w-4 h-4" />
                        Descending
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Results Summary */}
          <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-gray-100 dark:border-gray-800">
            <span>
              Showing <span className="font-semibold text-gray-900 dark:text-white">{filteredStudents.length}</span> of{' '}
              <span className="font-semibold text-gray-900 dark:text-white">{students.length}</span> students
            </span>
            {activeFilterCount > 0 && (
              <span className="text-primary">
                {activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''} applied
              </span>
            )}
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
            <div className="rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900 p-12 text-center">
              <div className="inline-block w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
              <p className="mt-4 text-sm text-muted-foreground">Loading students...</p>
            </div>
          )}

          {/* Students Table */}
          {!isLoading && !error && (
            <div className="rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-slate-800/50 border-b border-gray-200 dark:border-gray-800">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Code</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Classroom</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Phone</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                    {filteredStudents.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center">
                          <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
                            <GraduationCap className="w-6 h-6 text-muted-foreground" />
                          </div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">No students found</p>
                          <p className="text-xs text-muted-foreground mt-1">Try adjusting your search or filters</p>
                        </td>
                      </tr>
                    ) : (
                      paginatedStudents.map((student) => (
                        <tr
                          key={student.id}
                          className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors"
                        >
                          <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{student.code}</td>
                          <td className="px-6 py-4 text-sm text-gray-900 dark:text-white font-medium">
                            {student.firstName} {student.lastName}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                              {getClassroomLabel(student.classroomId)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{student.phoneNumber || '-'}</td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => handleEdit(student)}
                              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors text-gray-500 hover:text-primary"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              {filteredStudents.length > 0 && (
                <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-slate-800/30">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    {/* Items per page selector */}
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">Show</span>
                      <select
                        value={itemsPerPage}
                        onChange={(e) => {
                          setItemsPerPage(Number(e.target.value));
                          setCurrentPage(1);
                        }}
                        className="px-2 py-1 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        {itemsPerPageOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                      <span className="text-muted-foreground">entries</span>
                    </div>

                    {/* Page info */}
                    <div className="text-sm text-muted-foreground">
                      Showing <span className="font-medium text-gray-900 dark:text-white">{startIndex + 1}</span> to{' '}
                      <span className="font-medium text-gray-900 dark:text-white">
                        {Math.min(endIndex, filteredStudents.length)}
                      </span>{' '}
                      of <span className="font-medium text-gray-900 dark:text-white">{filteredStudents.length}</span> students
                    </div>

                    {/* Page navigation */}
                    <div className="flex items-center gap-1">
                      {/* First page */}
                      <button
                        onClick={() => goToPage(1)}
                        disabled={currentPage === 1}
                        className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        title="First page"
                      >
                        <ChevronsLeft className="w-4 h-4" />
                      </button>

                      {/* Previous page */}
                      <button
                        onClick={() => goToPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        title="Previous page"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>

                      {/* Page numbers */}
                      <div className="flex items-center gap-1 mx-2">
                        {getPageNumbers().map((page, index) => (
                          <button
                            key={index}
                            onClick={() => typeof page === 'number' && goToPage(page)}
                            disabled={page === '...'}
                            className={`min-w-[32px] h-8 px-2 rounded-lg text-sm font-medium transition-colors ${
                              page === currentPage
                                ? 'bg-primary text-white'
                                : page === '...'
                                ? 'cursor-default text-muted-foreground'
                                : 'hover:bg-gray-200 dark:hover:bg-slate-700'
                            }`}
                          >
                            {page}
                          </button>
                        ))}
                      </div>

                      {/* Next page */}
                      <button
                        onClick={() => goToPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        title="Next page"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>

                      {/* Last page */}
                      <button
                        onClick={() => goToPage(totalPages)}
                        disabled={currentPage === totalPages}
                        className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        title="Last page"
                      >
                        <ChevronsRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Create/Edit Modal */}
      {(showCreateModal || editingStudent) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-2xl rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900 p-6 shadow-xl my-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {editingStudent ? 'Edit Student' : 'Add New Student'}
              </h3>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingStudent(null);
                  resetForm();
                }}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">First Name</label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Last Name</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-all"
                  />
                </div>
              </div>

              {!editingStudent && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Student Code</label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="e.g., STU-0001"
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-all"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    placeholder="+1234567890"
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-all"
                  >
                    <option value="">Select gender</option>
                    <option value="M">Male</option>
                    <option value="F">Female</option>
                    <option value="O">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Classroom</label>
                  <select
                    value={formData.classroomId}
                    onChange={(e) => setFormData({ ...formData, classroomId: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-all"
                  >
                    <option value="">Select classroom</option>
                    {classrooms.map((classroom) => (
                      <option key={classroom.id} value={classroom.id}>
                        {classroom.grade.name} - {classroom.section.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Class Teacher (Homeroom)
                  </label>
                  <select
                    value={formData.classTeacherId}
                    onChange={(e) => setFormData({ ...formData, classTeacherId: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-all"
                  >
                    <option value="">Select teacher</option>
                    {teachers.map((teacher) => (
                      <option key={teacher.id} value={teacher.id}>
                        {teacher.firstName} {teacher.lastName}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-muted-foreground">
                    The homeroom teacher. Subject teachers are assigned via Enrollment.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Date of Birth</label>
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-all"
                  />
                </div>

              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingStudent(null);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-sm font-medium hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={editingStudent ? handleUpdateStudent : handleCreateStudent}
                  disabled={isSubmitting}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 shadow-sm transition-all disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {isSubmitting ? 'Saving...' : editingStudent ? 'Update' : 'Create'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* CSV Upload Modal */}
      {showCsvModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <FileSpreadsheet className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Bulk Upload Students</h2>
                    <p className="text-xs text-muted-foreground">Upload a CSV file to create multiple students at once</p>
                  </div>
                </div>
                <button
                  onClick={resetCsvModal}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Download Template */}
              <div className="rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-slate-950 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Download CSV Template</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Get a pre-formatted template with correct headers and sample data
                    </p>
                  </div>
                  <button
                    onClick={downloadCsvTemplate}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-slate-800 text-sm font-medium hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    Template
                  </button>
                </div>
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Upload CSV File
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleCsvFileChange}
                    className="w-full rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-950 px-4 py-8 text-sm text-center cursor-pointer hover:border-primary transition-colors file:hidden"
                  />
                  <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                    <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      {csvFile ? csvFile.name : 'Click to select or drag and drop CSV file'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Preview */}
              {csvPreview.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Preview (First {csvPreview.length} rows)
                  </p>
                  <div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead className="bg-gray-50 dark:bg-slate-800">
                        <tr>
                          <th className="px-3 py-2 text-left font-medium">First Name</th>
                          <th className="px-3 py-2 text-left font-medium">Last Name</th>
                          <th className="px-3 py-2 text-left font-medium">Code</th>
                          <th className="px-3 py-2 text-left font-medium">Classroom</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {csvPreview.map((row, index) => (
                          <tr key={index}>
                            <td className="px-3 py-2">{row.firstName}</td>
                            <td className="px-3 py-2">{row.lastName}</td>
                            <td className="px-3 py-2">{row.code}</td>
                            <td className="px-3 py-2">
                              {classrooms.find(c => c.id === row.classroomId)
                                ? `${classrooms.find(c => c.id === row.classroomId)?.grade.name}-${classrooms.find(c => c.id === row.classroomId)?.section.label}`
                                : row.classroomId}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Errors */}
              {csvErrors.length > 0 && (
                <div className="rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/20 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    <p className="text-sm font-medium text-red-600 dark:text-red-400">
                      {uploadComplete ? 'Upload Errors' : 'Validation Errors'}
                    </p>
                  </div>
                  <ul className="text-xs text-red-600 dark:text-red-400 space-y-1 max-h-32 overflow-y-auto">
                    {csvErrors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Success */}
              {uploadComplete && csvSuccess > 0 && (
                <div className="rounded-lg border border-green-200 dark:border-green-900/50 bg-green-50 dark:bg-green-900/20 p-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <p className="text-sm font-medium text-green-600 dark:text-green-400">
                      Successfully created {csvSuccess} student{csvSuccess > 1 ? 's' : ''}!
                    </p>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={resetCsvModal}
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-sm font-medium hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                >
                  {uploadComplete ? 'Close' : 'Cancel'}
                </button>
                {!uploadComplete && (
                  <button
                    onClick={handleBulkUpload}
                    disabled={!csvFile || csvErrors.length > 0 || isUploading}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUploading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        Upload Students
                      </>
                    )}
                  </button>
                )}
              </div> 
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}