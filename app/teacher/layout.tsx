"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  FileText,
  BarChart3,
  Calendar,
  Bell,
  LogOut,
  Menu,
  X,
  GraduationCap,
  UserCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { clearAuthSession, getAuthSession } from "@/lib/auth-storage";
import { getBackendUrl } from "@/lib/config";

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const backendUrl = getBackendUrl();
  const pathname = usePathname();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [teacherName, setTeacherName] = useState("Teacher");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const session = getAuthSession();
    if (!session || session.role !== "TEACHER") {
      router.push("/login/teacher");
      return;
    }

    const teacherId = session.teacherId;
    
    // Fetch teacher profile to get actual name
    const fetchTeacherName = async () => {
      try {
        const response = await fetch(
          `${backendUrl}/api/teachers/${teacherId}`,
          {
            headers: {
              'Authorization': `Bearer ${session.token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        if (response.ok) {
          const data = await response.json();
          if (data.firstName || data.lastName) {
            const fullName = `${data.firstName || ''} ${data.lastName || ''}`.trim();
            setTeacherName(fullName || 'Teacher');
          }
        }
      } catch (error) {
        console.error('Error fetching teacher name:', error);
        // Keep default "Teacher" on error
      }
    };
    
    if (teacherId) {
      fetchTeacherName();
    }
  }, [router, backendUrl]);

  const handleLogout = () => {
    clearAuthSession();
    router.push("/login/teacher");
  };

  const navItems = [
    {
      title: "Dashboard",
      href: "/teacher",
      icon: LayoutDashboard,
    },
    {
      title: "Attendance",
      href: "/teacher/attendance",
      icon: FileText,
    },
    {
      title: "Analytics",
      href: "/teacher/analytics",
      icon: BarChart3,
    },
    {
      title: "Exams",
      href: "/teacher/exams",
      icon: GraduationCap,
    },
    {
      title: "Timetables",
      href: "/teacher/timetables",
      icon: Calendar,
    },
    {
      title: "Notifications",
      href: "/teacher/notifications",
      icon: Bell,
    },
  ];

  return (
    <div className="min-h-screen bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:4rem_4rem] dark:bg-slate-950 font-sans selection:bg-primary/20">
      {/* Government Header - UX4G Style */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-orange-600 to-orange-500 text-white px-4 py-2.5 text-xs sm:text-sm shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-white/20 rounded flex items-center justify-center text-xs font-semibold">🇮🇳</div>
            <span className="font-semibold tracking-wide">PRAGATI</span>
          </div>
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-1 bg-white/20 px-2 py-1 rounded hover:bg-white/30 transition">
              <span>🌐</span>
              English
            </button>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header 
        className={cn(
          "fixed top-10 sm:top-11 left-0 right-0 z-40 transition-all duration-300 border-b",
          scrolled 
            ? "bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-gray-200 dark:border-gray-800 py-2" 
            : "bg-white dark:bg-slate-900 border-gray-200 dark:border-gray-700 py-4"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Logo */}
          <Link href="/teacher" className="flex items-center gap-3 group">
            <div className="relative h-10 w-auto sm:h-12 transition-transform group-hover:scale-105">
              <Image 
                src="/pragati-logo.png" 
                alt="Pragati Logo" 
                width={80}
                height={48}
                className="h-full w-auto object-contain"
              />
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-bold leading-none tracking-tight text-gray-900 dark:text-white">
                Pragati
              </h1>
              <p className="text-[10px] sm:text-xs text-muted-foreground font-medium">
                Teacher Portal
              </p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                    isActive 
                      ? "bg-primary/10 text-primary" 
                      : "text-muted-foreground hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {item.title}
                </Link>
              );
            })}
          </nav>

          {/* User Profile & Mobile Toggle */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-3 pl-4 border-l border-gray-200 dark:border-gray-800">
              <Link 
                href="/teacher/profile"
                className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer"
              >
                <div className="text-right hidden lg:block">
                  <p className="text-sm font-semibold leading-none">{teacherName}</p>
                  <p className="text-xs text-muted-foreground">Teacher</p>
                </div>
                <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <UserCircle className="w-5 h-5" />
                </div>
              </Link>
              <button
                onClick={handleLogout}
                className="p-2 rounded-full hover:bg-red-50 text-muted-foreground hover:text-red-600 transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden fixed top-[88px] left-0 right-0 z-40 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-gray-800 overflow-hidden shadow-lg"
          >
            <div className="p-4 space-y-2">
              <Link 
                href="/teacher/profile" 
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-3 p-3 mb-4 rounded-lg bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
              >
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <UserCircle className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-semibold">{teacherName}</p>
                  <p className="text-xs text-muted-foreground">View Profile</p>
                </div>
              </Link>

              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white"
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    {item.title}
                  </Link>
                );
              })}

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 p-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors mt-4"
              >
                <LogOut className="w-5 h-5" />
                Logout
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="pt-32 sm:pt-36 pb-12 px-4 sm:px-6 lg:px-8 min-h-[calc(100vh-4rem)]">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
