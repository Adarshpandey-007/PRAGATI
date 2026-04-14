'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3,
  Users,
  Calendar,
  Bell,
  AlertCircle,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Settings,
  UserCircle,
  School,
  GraduationCap,
  BookOpen,
  UserPlus,
  MapPin,
  LayoutDashboard,
  PanelLeftClose,
  PanelLeft,
} from 'lucide-react';
import { Language, translations, getTranslation } from '@/lib/translations';

const sidebarItems = [
  {
    id: 'dashboard',
    href: '/principal',
    icon: LayoutDashboard,
    labelKey: 'dashboard',
    gradient: 'from-slate-500 to-gray-600',
  },
  {
    id: 'reports',
    href: '/principal/reports',
    icon: BarChart3,
    labelKey: 'attendanceReports',
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    id: 'teacher-attendance',
    href: '/principal/teacher-attendance',
    icon: MapPin,
    labelKey: 'teacherAttendance',
    gradient: 'from-green-500 to-emerald-500',
  },
  {
    id: 'complaints',
    href: '/principal/complaints',
    icon: AlertCircle,
    labelKey: 'complaints',
    gradient: 'from-orange-500 to-rose-500',
  },
  {
    id: 'notifications',
    href: '/principal/notifications',
    icon: Bell,
    labelKey: 'notifications',
    gradient: 'from-purple-500 to-indigo-500',
  },
  {
    id: 'timetables',
    href: '/principal/timetables',
    icon: Calendar,
    labelKey: 'timetables',
    gradient: 'from-emerald-500 to-teal-500',
  },
  {
    id: 'academics',
    href: '/principal/academics',
    icon: BookOpen,
    labelKey: 'academicSetup',
    gradient: 'from-violet-500 to-purple-500',
  },
  {
    id: 'classrooms',
    href: '/principal/classrooms',
    icon: School,
    labelKey: 'manageClassrooms',
    gradient: 'from-pink-500 to-purple-500',
  },
  {
    id: 'students',
    href: '/principal/students',
    icon: GraduationCap,
    labelKey: 'manageStudents',
    gradient: 'from-cyan-500 to-blue-500',
  },
  {
    id: 'teachers',
    href: '/principal/teachers',
    icon: Users,
    labelKey: 'manageTeachers',
    gradient: 'from-amber-500 to-orange-500',
  },
  {
    id: 'enrollment',
    href: '/principal/enrollment',
    icon: UserPlus,
    labelKey: 'enrollment',
    gradient: 'from-indigo-500 to-blue-500',
  },
  {
    id: 'users',
    href: '/principal/users',
    icon: UserPlus,
    labelKey: 'userLogins',
    gradient: 'from-rose-500 to-pink-500',
  },
  {
    id: 'settings',
    href: '/principal/settings',
    icon: Settings,
    labelKey: 'schoolSettings',
    gradient: 'from-slate-500 to-gray-600',
  },
];

export default function PrincipalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [principalName, setPrincipalName] = useState('Principal');
  const [lang, setLang] = useState<Language>('en');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const t = (section: keyof typeof translations, key: string) => getTranslation(section, key, lang);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('pragati_token');
      const role = localStorage.getItem('pragati_role');
      const name = localStorage.getItem('pragati_name') || 'Principal';
      const savedLang = localStorage.getItem('pragati_language') as Language;
      const savedSidebarState = localStorage.getItem('pragati_sidebar_open');

      if (savedLang === 'en' || savedLang === 'pa' || savedLang === 'hi') {
        setLang(savedLang);
      }

      if (savedSidebarState !== null) {
        setIsSidebarOpen(savedSidebarState === 'true');
      }

      if (!token || role !== 'PRINCIPAL') {
        router.push('/login/principal');
        return;
      }

      setPrincipalName(name);
      setIsAuthenticated(true);
    }
  }, [router]);

  const handleLanguageChange = (newLang: Language) => {
    setLang(newLang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('pragati_language', newLang);
    }
  };

  const toggleSidebar = () => {
    const newState = !isSidebarOpen;
    setIsSidebarOpen(newState);
    if (typeof window !== 'undefined') {
      localStorage.setItem('pragati_sidebar_open', String(newState));
    }
  };

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('pragati_token');
      localStorage.removeItem('pragati_role');
      localStorage.removeItem('pragati_userId');
      localStorage.removeItem('pragati_name');
    }
    router.push('/login/principal');
  };

  const isActive = (href: string) => {
    if (href === '/principal') {
      return pathname === '/principal';
    }
    return pathname.startsWith(href);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:4rem_4rem] dark:bg-slate-950">
      {/* Government Header - UX4G Style */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-orange-600 to-orange-500 text-white px-4 py-2.5 text-xs sm:text-sm shadow-sm">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Image 
              src="/National-Emblem-of-India.png" 
              alt="National Emblem of India" 
              width={32} 
              height={36} 
              className="w-6 h-7 sm:w-8 sm:h-9 object-contain drop-shadow-sm" 
            />
            <div className="flex flex-col">
              <span className="font-bold tracking-wide text-xs sm:text-sm uppercase">PRAGATI</span>
              <span className="text-[9px] sm:text-[10px] text-white/80 font-medium">Built for SIH 2026 • MoE & Govt. of Punjab</span>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden sm:flex items-center gap-1 bg-white/20 px-1 py-0.5 rounded">
              <button
                onClick={() => handleLanguageChange('en')}
                className={`px-1.5 sm:px-2 py-0.5 rounded text-[10px] sm:text-xs font-medium transition ${lang === 'en' ? 'bg-white text-orange-600' : 'text-white hover:bg-white/20'}`}
              >
                EN
              </button>
              <button
                onClick={() => handleLanguageChange('pa')}
                className={`px-1.5 sm:px-2 py-0.5 rounded text-[10px] sm:text-xs font-medium transition ${lang === 'pa' ? 'bg-white text-orange-600' : 'text-white hover:bg-white/20'}`}
              >
                ਪੰ
              </button>
              <button
                onClick={() => handleLanguageChange('hi')}
                className={`px-1.5 sm:px-2 py-0.5 rounded text-[10px] sm:text-xs font-medium transition ${lang === 'hi' ? 'bg-white text-orange-600' : 'text-white hover:bg-white/20'}`}
              >
                हि
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <aside
        className={`fixed top-14 left-0 bottom-0 z-40 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 hidden md:flex flex-col ${
          isSidebarOpen ? 'w-64' : 'w-16'
        }`}
      >
        {/* Sidebar Header */}
        <div className="h-14 flex items-center justify-between px-3 border-b border-gray-200 dark:border-gray-700">
          {isSidebarOpen ? (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden">
                <Image src="/pragati-logo.png" alt="Pragati Logo" width={32} height={32} className="object-contain" />
              </div>
              <div className="overflow-hidden">
                <h1 className="text-sm font-bold text-foreground truncate">{t('dashboard', 'title')}</h1>
                <p className="text-[10px] text-muted-foreground truncate">{t('dashboard', 'subtitle')}</p>
              </div>
            </div>
          ) : (
            <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden mx-auto">
              <Image src="/pragati-logo.png" alt="Pragati Logo" width={32} height={32} className="object-contain" />
            </div>
          )}
          {isSidebarOpen && (
            <button
              onClick={toggleSidebar}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition text-muted-foreground"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          )}
        </div>
        {!isSidebarOpen && (
          <button
            onClick={toggleSidebar}
            className="p-1.5 mx-auto mt-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition text-muted-foreground"
          >
            <PanelLeft className="w-4 h-4" />
          </button>
        )}

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto py-3 px-2">
          <ul className="space-y-1">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                      active
                        ? 'bg-primary/10 text-primary border border-primary/20'
                        : 'text-muted-foreground hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-foreground'
                    }`}
                    title={!isSidebarOpen ? t('actions', item.labelKey) || item.labelKey : undefined}
                  >
                    <div
                      className={`p-1.5 rounded-md ${
                        active
                          ? `bg-gradient-to-br ${item.gradient} text-white`
                          : 'bg-gray-100 dark:bg-slate-800 text-muted-foreground group-hover:text-foreground'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    {isSidebarOpen && (
                      <span className="text-sm font-medium truncate">
                        {t('actions', item.labelKey) || item.labelKey}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Sidebar Footer */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-3">
          <Link
            href="/principal/profile"
            className={`flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition ${
              isSidebarOpen ? '' : 'justify-center'
            }`}
          >
            <UserCircle className="w-5 h-5 text-muted-foreground" />
            {isSidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{principalName}</p>
                <p className="text-[10px] text-muted-foreground">Principal</p>
              </div>
            )}
          </Link>
          <button
            onClick={handleLogout}
            className={`mt-2 w-full flex items-center gap-3 px-3 py-2 rounded-lg bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition ${
              isSidebarOpen ? '' : 'justify-center'
            }`}
          >
            <LogOut className="w-4 h-4" />
            {isSidebarOpen && <span className="text-sm font-medium">{t('common', 'logout')}</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="fixed top-14 left-0 right-0 z-40 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-gray-700 shadow-sm md:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                <BookOpen className="w-4 h-4" />
              </div>
              <span className="text-sm font-bold">{t('dashboard', 'title')}</span>
            </div>
          </div>
          <Link
            href="/principal/profile"
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition"
          >
            <UserCircle className="w-5 h-5 text-muted-foreground" />
          </Link>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50 md:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed top-0 left-0 bottom-0 w-72 bg-white dark:bg-slate-900 z-50 md:hidden flex flex-col shadow-xl"
            >
              {/* Mobile Menu Header */}
              <div className="h-14 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden">
                    <Image src="/pragati-logo.png" alt="Pragati Logo" width={32} height={32} className="object-contain" />
                  </div>
                  <div>
                    <h1 className="text-sm font-bold">{t('dashboard', 'title')}</h1>
                    <p className="text-[10px] text-muted-foreground">{t('dashboard', 'subtitle')}</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Language Selector */}
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                <p className="text-[11px] text-muted-foreground mb-2">{t('common', 'language')}</p>
                <div className="flex items-center gap-1 bg-gray-100 dark:bg-slate-800 p-1 rounded-lg">
                  <button
                    onClick={() => handleLanguageChange('en')}
                    className={`flex-1 px-3 py-1.5 rounded-md text-xs font-medium transition ${
                      lang === 'en' ? 'bg-white dark:bg-slate-700 shadow-sm' : 'text-muted-foreground'
                    }`}
                  >
                    {t('common', 'english')}
                  </button>
                  <button
                    onClick={() => handleLanguageChange('pa')}
                    className={`flex-1 px-3 py-1.5 rounded-md text-xs font-medium transition ${
                      lang === 'pa' ? 'bg-white dark:bg-slate-700 shadow-sm' : 'text-muted-foreground'
                    }`}
                  >
                    {t('common', 'punjabi')}
                  </button>
                  <button
                    onClick={() => handleLanguageChange('hi')}
                    className={`flex-1 px-3 py-1.5 rounded-md text-xs font-medium transition ${
                      lang === 'hi' ? 'bg-white dark:bg-slate-700 shadow-sm' : 'text-muted-foreground'
                    }`}
                  >
                    {t('common', 'hindi')}
                  </button>
                </div>
              </div>

              {/* Mobile Navigation Items */}
              <nav className="flex-1 overflow-y-auto py-3 px-3">
                <ul className="space-y-1">
                  {sidebarItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.href);
                    return (
                      <li key={item.id}>
                        <Link
                          href={item.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                            active
                              ? 'bg-primary/10 text-primary border border-primary/20'
                              : 'text-muted-foreground hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-foreground'
                          }`}
                        >
                          <div
                            className={`p-1.5 rounded-md ${
                              active
                                ? `bg-gradient-to-br ${item.gradient} text-white`
                                : 'bg-gray-100 dark:bg-slate-800 text-muted-foreground'
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                          </div>
                          <span className="text-sm font-medium">
                            {t('actions', item.labelKey) || item.labelKey}
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </nav>

              {/* Mobile Menu Footer */}
              <div className="border-t border-gray-200 dark:border-gray-700 p-3">
                <Link
                  href="/principal/profile"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition"
                >
                  <UserCircle className="w-5 h-5 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{principalName}</p>
                    <p className="text-[10px] text-muted-foreground">Principal</p>
                  </div>
                </Link>
                <button
                  onClick={handleLogout}
                  className="mt-2 w-full flex items-center gap-3 px-3 py-2 rounded-lg bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm font-medium">{t('common', 'logout')}</span>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main
        className={`transition-all duration-300 pt-[7.5rem] md:pt-14 ${
          isSidebarOpen ? 'md:ml-64' : 'md:ml-16'
        }`}
      >
        {children}
      </main>
    </div>
  );
}
