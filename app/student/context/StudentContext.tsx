'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api-client';
import { clearAuthSession, getAuthSession } from '@/lib/auth-storage';

interface StudentProfile {
  id: string;
  firstName: string;
  lastName: string;
  code: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  address?: string;
  guardianName?: string;
  guardianPhone?: string;
  gradeLevel?: number;
  sectionLabel?: string;
  classroom: {
    id: string;
    academicYear?: string;
    grade: { id?: string; name: string; level?: number };
    section: { id?: string; label: string };
  };
  school?: {
    id: string;
    name: string;
    district?: string;
  };
  user?: {
    id: string;
    email: string;
  };
}

interface StudentContextType {
  studentProfile: StudentProfile | null;
  isLoading: boolean;
  language: 'en' | 'pa' | 'hi';
  setLanguage: (lang: 'en' | 'pa' | 'hi') => void;
  logout: () => void;
}

const StudentContext = createContext<StudentContextType | undefined>(undefined);

export function StudentProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [language, setLanguage] = useState<'en' | 'pa' | 'hi'>('en');

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const session = getAuthSession();
    if (!session || session.role !== 'STUDENT') {
      router.push('/login/student');
      return;
    }

    if (session.studentId) {
      fetchStudentProfile(session.studentId);
    } else {
      setIsLoading(false);
    }
  }, [router]);

  const fetchStudentProfile = async (studentId: string) => {
    setIsLoading(true);
    try {
      const response = await apiFetch(`/api/core/students/${studentId}`, {
        auth: true,
      });

      if (response.ok) {
        const data = await response.json();
        setStudentProfile(data);
      }
    } catch (error) {
      console.error('Error fetching student profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    clearAuthSession();
    router.push('/login/student');
  };

  return (
    <StudentContext.Provider value={{ studentProfile, isLoading, language, setLanguage, logout }}>
      {children}
    </StudentContext.Provider>
  );
}

export function useStudent() {
  const context = useContext(StudentContext);
  if (context === undefined) {
    throw new Error('useStudent must be used within a StudentProvider');
  }
  return context;
}
