'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { LogOut, UserCircle, Menu, X } from 'lucide-react';
import { useStudent } from '../context/StudentContext';

export function StudentHeader() {
  const router = useRouter();
  const { studentProfile, language, setLanguage, logout } = useStudent();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const getStudentName = () => {
    if (studentProfile) {
      return `${studentProfile.firstName} ${studentProfile.lastName}`;
    }
    if (typeof window !== 'undefined') {
      return localStorage.getItem('pragati_name') || 'Student';
    }
    return 'Student';
  };

  const translations = {
    en: {
      dashboard: 'Student Dashboard',
      myLearning: 'My Learning Portal',
      logout: 'Logout',
      english: 'English',
      punjabi: 'Punjabi',
      hindi: 'Hindi',
    },
    pa: {
      dashboard: 'ਵਿਦਿਆਰਥੀ ਡੈਸ਼ਬੋਰਡ',
      myLearning: 'ਮੇਰਾ ਸਿੱਖਣ ਪੋਰਟਲ',
      logout: 'ਲੌਗ ਆਉਟ',
      english: 'English',
      punjabi: 'ਪੰਜਾਬੀ',
      hindi: 'हिंदी',
    },
    hi: {
      dashboard: 'छात्र डैशबोर्ड',
      myLearning: 'मेरा शिक्षण पोर्टल',
      logout: 'लॉग आउट',
      english: 'English',
      punjabi: 'ਪੰਜਾਬੀ',
      hindi: 'हिंदी',
    },
  };

  const t = translations[language];

  return (
    <>
      {/* Top Government Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-orange-600 to-orange-500 text-white px-4 py-2 text-xs sm:text-sm shadow-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-white/20 rounded flex items-center justify-center text-xs font-bold">
              IN
            </div>
            <span className="font-semibold hidden sm:inline">PRAGATI</span>
            <span className="font-semibold sm:hidden">PRA</span>
          </div>
          <span className="text-[10px] sm:text-xs font-medium">Built for SIH 2026 • MoE & Govt. of Punjab • PRAGATI Portal</span>
        </div>
      </div>

      {/* Main Header */}
      <header className="fixed top-10 sm:top-12 left-0 right-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <UserCircle className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-sm sm:text-lg font-bold text-gray-900 dark:text-white">{t.dashboard}</h1>
                <p className="text-[10px] sm:text-xs text-muted-foreground">
                  {t.myLearning}
                </p>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-4">
              {/* Language Selector */}
              <div className="inline-flex items-center rounded-full bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-gray-700 px-1 py-0.5 text-[11px]">
                <button
                  type="button"
                  onClick={() => setLanguage('en')}
                  className={`px-2 py-0.5 rounded-full font-medium transition ${
                    language === 'en'
                      ? 'bg-white dark:bg-slate-700 shadow-sm text-gray-900 dark:text-white'
                      : 'text-muted-foreground hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {t.english}
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage('hi')}
                  className={`px-2 py-0.5 rounded-full font-medium transition ${
                    language === 'hi'
                      ? 'bg-white dark:bg-slate-700 shadow-sm text-gray-900 dark:text-white'
                      : 'text-muted-foreground hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {t.hindi}
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage('pa')}
                  className={`px-2 py-0.5 rounded-full font-medium transition ${
                    language === 'pa'
                      ? 'bg-white dark:bg-slate-700 shadow-sm text-gray-900 dark:text-white'
                      : 'text-muted-foreground hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {t.punjabi}
                </button>
              </div>

              <button
                onClick={() => router.push('/student/profile')}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                <UserCircle className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs font-medium text-gray-900 dark:text-white">{getStudentName()}</span>
              </button>

              <button
                onClick={logout}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 text-xs font-medium hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                {t.logout}
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="md:hidden mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-3"
            >
              <button
                onClick={() => {
                  router.push('/student/profile');
                  setIsMenuOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
              >
                <UserCircle className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs font-medium text-gray-900 dark:text-white">{getStudentName()}</span>
              </button>

              {/* Language Selector */}
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-muted-foreground">Language:</span>
                <div className="inline-flex items-center rounded-full bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-gray-700 px-1 py-0.5 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setLanguage('en')}
                    className={`px-2 py-0.5 rounded-full font-medium transition ${
                      language === 'en'
                        ? 'bg-white dark:bg-slate-700 shadow-sm text-gray-900 dark:text-white'
                        : 'text-muted-foreground hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    {t.english}
                  </button>
                  <button
                    type="button"
                    onClick={() => setLanguage('hi')}
                    className={`px-2 py-0.5 rounded-full font-medium transition ${
                      language === 'hi'
                        ? 'bg-white dark:bg-slate-700 shadow-sm text-gray-900 dark:text-white'
                        : 'text-muted-foreground hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    {t.hindi}
                  </button>
                  <button
                    type="button"
                    onClick={() => setLanguage('pa')}
                    className={`px-2 py-0.5 rounded-full font-medium transition ${
                      language === 'pa'
                        ? 'bg-white dark:bg-slate-700 shadow-sm text-gray-900 dark:text-white'
                        : 'text-muted-foreground hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    {t.punjabi}
                  </button>
                </div>
              </div>

              <button
                onClick={logout}
                className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 text-xs font-medium hover:bg-red-100 dark:hover:bg-red-900/30 transition"
              >
                <LogOut className="w-3.5 h-3.5" />
                {t.logout}
              </button>
            </motion.div>
          )}
        </div>
      </header>
    </>
  );
}
