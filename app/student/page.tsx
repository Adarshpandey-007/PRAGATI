'use client';

import { motion } from 'framer-motion';
import { AttendanceCard } from './components/AttendanceCard';
import { TimetableCard } from './components/TimetableCard';
import { StudyMaterialCard } from './components/StudyMaterialCard';
import { ExamResultsCard } from './components/ExamResultsCard';
import { ComplaintsCard } from './components/ComplaintsCard';
import { NotificationsCard } from './components/NotificationsCard';
import { useStudent } from './context/StudentContext';

export default function StudentDashboard() {
  const { studentProfile, language } = useStudent();

  const translations = {
    en: {
      welcome: 'Welcome back',
      goodMorning: 'Good morning',
    },
    pa: {
      welcome: 'ਵਾਪਸ ਜੀ ਆਇਆਂ ਨੂੰ',
      goodMorning: 'ਸ਼ੁਭ ਸਵੇਰ',
    },
    hi: {
      welcome: 'वापसी पर स्वागत है',
      goodMorning: 'सुप्रभात',
    },
  };

  const t = translations[language];

  return (
    <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        
        <div className="relative z-10">
          <p className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/30 dark:bg-emerald-900/10 dark:text-emerald-400 mb-3">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            {t.welcome}
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {t.goodMorning}, <span className="text-primary">{studentProfile?.firstName || 'Student'}</span>
          </h2>
          {studentProfile?.classroom && (
            <p className="text-sm sm:text-base text-muted-foreground">
              {studentProfile.classroom.grade.name} - {studentProfile.classroom.section.label} · Roll No: {studentProfile.code}
            </p>
          )}
        </div>
      </motion.div>

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Attendance Card */}
        <AttendanceCard language={language} />

        {/* Timetable Card */}
        <TimetableCard language={language} />

        {/* Study Material Card */}
        <StudyMaterialCard language={language} />

        {/* Exam Results Card */}
        <ExamResultsCard language={language} />

        {/* Complaints Card */}
        <ComplaintsCard language={language} />

        {/* Notifications Card */}
        <NotificationsCard language={language} />
      </div>
    </div>
  );
}
