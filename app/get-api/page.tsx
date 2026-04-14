"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { ChevronDown, ChevronRight, Code2, Lock, Server, FileJson, ArrowLeft, Copy, Check, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function GetApiPage() {
  const [copiedPath, setCopiedPath] = useState<string | null>(null);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPath(text);
    setTimeout(() => setCopiedPath(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:4rem_4rem] dark:bg-slate-950">
      {/* Government Header - UX4G Style */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-orange-600 to-orange-500 text-white px-4 py-2.5 text-xs sm:text-sm shadow-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-white/20 rounded flex items-center justify-center text-xs font-semibold">🇮🇳</div>
            <span className="font-semibold tracking-wide">GOVERNMENT OF INDIA</span>
          </div>
          <Link href="/" className="flex items-center gap-1 bg-white/20 px-3 py-1 rounded hover:bg-white/30 transition text-xs font-medium">
            <ArrowLeft className="w-3 h-3" />
            Back to Home
          </Link>
        </div>
      </div>

      {/* Navbar */}
      <nav className="fixed top-10 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-3">
              <Image
                src="/pragati-logo.png"
                alt="Pragati Logo"
                width={40}
                height={40}
                className="h-10 w-auto object-contain"
              />
              <div className="flex flex-col">
                <span className="text-sm font-bold text-gray-900 dark:text-white">Pragati APIs</span>
                <span className="text-[10px] text-muted-foreground">Developer Documentation</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground hidden sm:inline">v1.0.0</span>
              <span className="rounded-full bg-emerald-100 dark:bg-emerald-900/50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 ring-1 ring-emerald-200 dark:ring-emerald-800">
                OpenAPI 3.0
              </span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-28 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <div className="mb-10 text-center">
            <div className="inline-flex items-center gap-2 bg-primary/10 dark:bg-primary/20 rounded-full px-4 py-1.5 mb-4">
              <Code2 className="w-4 h-4 text-primary" />
              <span className="text-xs font-semibold text-primary">REST API Documentation</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-3">
              Pragati <span className="text-primary">Backend API</span>
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto mb-4">
              A comprehensive backend API for school management including authentication, attendance (Face, RFID, Geo), assessments, communications, reports, and more.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6">
              <a
                href="http://46.62.247.127:4234/api-docs/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
              >
                <ExternalLink className="w-4 h-4" />
                View Live Swagger UI
              </a>
              <Link
                href="/get-api/apply"
                className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
              >
                <ExternalLink className="w-4 h-4" />
                Apply for API Token (Mid-Day Meal)
              </Link>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Sidebar */}
            <aside className="w-full lg:w-72 shrink-0">
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-5 sticky top-28">
                <div className="flex items-center gap-2 mb-4">
                  <Server className="w-4 h-4 text-primary" />
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-300">
                    API Servers
                  </p>
                </div>
                <select className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-slate-700 px-3 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition">
                  <option>http://46.62.247.127:4234</option>
                  <option>Production - api.pragati.gov.in</option>
                  <option>Local - localhost:4000</option>
                </select>

                <div className="mt-6 pt-5 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-300 mb-3">
                    Quick Links
                  </p>
                  <ul className="space-y-1.5 max-h-64 overflow-y-auto">
                    {[
                      "Health",
                      "Auth", 
                      "Core",
                      "Enrollment",
                      "Attendance",
                      "RFID Gate",
                      "Face Recognition",
                      "Geo Attendance",
                      "Assessments",
                      "Communications",
                      "Timetables",
                      "Teachers",
                      "Reports",
                      "Complaints",
                      "Bulk Import"
                    ].map((section) => (
                      <li key={section}>
                        <a
                          href={`#${section.toLowerCase().replace(/\s+/g, '-')}`}
                          className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition py-1"
                        >
                          <ChevronRight className="w-3 h-3" />
                          {section}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6 pt-5 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                    <Lock className="w-3 h-3" />
                    <span>JWT Authentication Required</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mb-3">
                    Most endpoints require a Bearer token from login.
                  </p>
                  <div className="bg-gray-100 dark:bg-slate-700 rounded-lg p-2 text-[10px] font-mono text-gray-600 dark:text-gray-400">
                    Authorization: Bearer &lt;token&gt;
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" /></svg>
                    <span>Device Key Auth (RFID/Face)</span>
                  </div>
                  <div className="bg-gray-100 dark:bg-slate-700 rounded-lg p-2 mt-1 text-[10px] font-mono text-gray-600 dark:text-gray-400">
                    x-device-key: &lt;device-key&gt;
                  </div>
                </div>
              </div>
            </aside>

            {/* API Documentation */}
            <section className="flex-1 space-y-6">
              {/* Info Card */}
              <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent dark:from-primary/20 dark:via-primary/10 rounded-2xl border border-primary/20 dark:border-primary/30 p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center shrink-0">
                    <FileJson className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                      Pragati School Management System API
                    </h2>
                    <p className="text-sm text-muted-foreground mb-3">
                      Supports Admin, Principal, Teacher, Student, and Parent roles. Features include Face Recognition, RFID Gate, and Geo-location based attendance systems.
                    </p>
                    <div className="flex flex-wrap items-center gap-3 text-xs">
                      <span className="bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 px-2 py-1 rounded-md font-medium">
                        OAS 3.0
                      </span>
                      <span className="text-muted-foreground">
                        <span className="font-medium">Version:</span> 1.0.0
                      </span>
                      <span className="text-muted-foreground">
                        <span className="font-medium">Last Updated:</span> 8 December 2025
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* API Groups */}
              <ApiGroup
                id="health"
                name="Health"
                description="Health check endpoints"
                icon={<svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>}
                items={[
                  {
                    method: "GET",
                    path: "/health",
                    summary: "Health check",
                    details: "Returns server health status and uptime information.",
                  },
                ]}
                onCopy={handleCopy}
                copiedPath={copiedPath}
              />

              <ApiGroup
                id="auth"
                name="Auth"
                description="Authentication endpoints"
                icon={<Lock className="w-5 h-5" />}
                items={[
                  {
                    method: "POST",
                    path: "/auth/login",
                    summary: "User login",
                    details: "Authenticate with email/password. Returns JWT token valid for 12 hours.",
                  },
                  {
                    method: "GET",
                    path: "/auth/me",
                    summary: "Get current user",
                    details: "Returns the authenticated user's profile and role information.",
                  },
                ]}
                onCopy={handleCopy}
                copiedPath={copiedPath}
              />

              <ApiGroup
                id="core"
                name="Core"
                description="Schools, Grades, Sections, Classrooms, Students CRUD"
                icon={<svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>}
                items={[
                  {
                    method: "GET",
                    path: "/core/students",
                    summary: "List students",
                    details: "Get paginated list of students with filters for class, section, etc.",
                  },
                  {
                    method: "POST",
                    path: "/core/students",
                    summary: "Create student",
                    details: "Create a new student record with enrollment details.",
                  },
                ]}
                onCopy={handleCopy}
                copiedPath={copiedPath}
              />

              <ApiGroup
                id="enrollment"
                name="Enrollment"
                description="Student enrollment management"
                icon={<svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>}
                items={[
                  {
                    method: "GET",
                    path: "/enrollment/list",
                    summary: "List enrollments",
                    details: "Get student enrollment records with academic year filter.",
                  },
                  {
                    method: "POST",
                    path: "/enrollment/create",
                    summary: "Create enrollment",
                    details: "Enroll a student in a class/section for an academic year.",
                  },
                ]}
                onCopy={handleCopy}
                copiedPath={copiedPath}
              />

              <ApiGroup
                id="attendance"
                name="Attendance"
                description="Attendance management"
                icon={<svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                items={[
                  {
                    method: "GET",
                    path: "/attendance/sessions",
                    summary: "Get attendance sessions",
                    details: "List attendance sessions with date range and class filters.",
                  },
                  {
                    method: "POST",
                    path: "/attendance/bulk",
                    summary: "Bulk mark attendance",
                    details: "Mark attendance for multiple students in a single request.",
                  },
                ]}
                onCopy={handleCopy}
                copiedPath={copiedPath}
              />

              <ApiGroup
                id="rfid-gate"
                name="RFID Gate"
                description="RFID gate entry/exit logging"
                icon={<svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" /></svg>}
                items={[
                  {
                    method: "POST",
                    path: "/rfid/gate/scan",
                    summary: "Log RFID gate scan",
                    details: "Record entry/exit event when RFID card is scanned at gate.",
                  },
                  {
                    method: "GET",
                    path: "/rfid/gate/logs",
                    summary: "Get gate logs",
                    details: "Retrieve gate entry/exit logs with date and student filters.",
                  },
                  {
                    method: "GET",
                    path: "/rfid/gate/school-logs",
                    summary: "Get school gate logs (Principal view)",
                    details: "School-wide gate logs for principal dashboard.",
                  },
                  {
                    method: "POST",
                    path: "/rfid/verify",
                    summary: "Verify attendance with RFID logs",
                    details: "Cross-verify attendance records with RFID gate logs.",
                  },
                ]}
                onCopy={handleCopy}
                copiedPath={copiedPath}
              />

              <ApiGroup
                id="face-recognition"
                name="Face Recognition"
                description="Face recognition attendance"
                icon={<svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>}
                items={[
                  {
                    method: "POST",
                    path: "/face-recognition/mark-attendance",
                    summary: "Mark attendance using face recognition",
                    details: "Submit face image for recognition and automatic attendance marking.",
                  },
                ]}
                onCopy={handleCopy}
                copiedPath={copiedPath}
              />

              <ApiGroup
                id="geo-attendance"
                name="Geo Attendance"
                description="Geo-location based attendance"
                icon={<svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
                items={[
                  {
                    method: "POST",
                    path: "/geo-attendance/mark",
                    summary: "Mark geo-location attendance",
                    details: "Submit GPS coordinates to mark attendance within school boundary.",
                  },
                  {
                    method: "GET",
                    path: "/geo-attendance/settings",
                    summary: "Get geo-fence settings",
                    details: "Retrieve school geo-fence boundary configuration.",
                  },
                ]}
                onCopy={handleCopy}
                copiedPath={copiedPath}
              />

              <ApiGroup
                id="assessments"
                name="Assessments"
                description="Tests, assignments, grades"
                icon={<svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>}
                items={[
                  {
                    method: "GET",
                    path: "/assessments/tests",
                    summary: "List tests",
                    details: "Get tests for a class with date and subject filters.",
                  },
                  {
                    method: "POST",
                    path: "/assessments/tests",
                    summary: "Create test",
                    details: "Create a new test/exam entry.",
                  },
                  {
                    method: "POST",
                    path: "/assessments/grades",
                    summary: "Submit grades",
                    details: "Submit student grades for a test or assignment.",
                  },
                ]}
                onCopy={handleCopy}
                copiedPath={copiedPath}
              />

              <ApiGroup
                id="communications"
                name="Communications"
                description="Notifications and announcements"
                icon={<svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>}
                items={[
                  {
                    method: "GET",
                    path: "/communications/notifications/active",
                    summary: "List active notifications",
                    details: "Get notifications filtered by user role and school.",
                  },
                  {
                    method: "GET",
                    path: "/communications/notifications/public",
                    summary: "List public notifications",
                    details: "System-wide public announcements (no auth required).",
                  },
                  {
                    method: "POST",
                    path: "/communications/notifications",
                    summary: "Create notification",
                    details: "Create a new notification or announcement.",
                  },
                ]}
                onCopy={handleCopy}
                copiedPath={copiedPath}
              />

              <ApiGroup
                id="timetables"
                name="Timetables"
                description="Class schedules"
                icon={<svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
                items={[
                  {
                    method: "GET",
                    path: "/timetables/class/:classId",
                    summary: "Get class timetable",
                    details: "Retrieve weekly schedule for a specific class.",
                  },
                  {
                    method: "POST",
                    path: "/timetables/slots",
                    summary: "Create timetable slot",
                    details: "Add a new period/slot to the timetable.",
                  },
                ]}
                onCopy={handleCopy}
                copiedPath={copiedPath}
              />

              <ApiGroup
                id="teachers"
                name="Teachers"
                description="Teacher management"
                icon={<svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}
                items={[
                  {
                    method: "GET",
                    path: "/teachers/list",
                    summary: "List teachers",
                    details: "Get paginated list of teachers with school filter.",
                  },
                  {
                    method: "POST",
                    path: "/teachers/create",
                    summary: "Create teacher",
                    details: "Register a new teacher in the system.",
                  },
                ]}
                onCopy={handleCopy}
                copiedPath={copiedPath}
              />

              <ApiGroup
                id="reports"
                name="Reports"
                description="Reports and analytics"
                icon={<svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>}
                items={[
                  {
                    method: "GET",
                    path: "/reports/attendance/teacher",
                    summary: "Teacher attendance analytics",
                    details: "Aggregated attendance stats by teacher, class, and date range.",
                  },
                  {
                    method: "GET",
                    path: "/reports/attendance/school",
                    summary: "School attendance summary",
                    details: "Overall attendance percentages and trends for the school.",
                  },
                  {
                    method: "GET",
                    path: "/reports/performance",
                    summary: "Performance analytics",
                    details: "Student performance metrics and grade distributions.",
                  },
                ]}
                onCopy={handleCopy}
                copiedPath={copiedPath}
              />

              <ApiGroup
                id="complaints"
                name="Complaints"
                description="Complaint management"
                icon={<svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
                items={[
                  {
                    method: "GET",
                    path: "/complaints/list",
                    summary: "List complaints",
                    details: "Get complaints with status and priority filters.",
                  },
                  {
                    method: "POST",
                    path: "/complaints/create",
                    summary: "Create complaint",
                    details: "Submit a new complaint or issue.",
                  },
                  {
                    method: "PATCH",
                    path: "/complaints/:id/resolve",
                    summary: "Resolve complaint",
                    details: "Mark a complaint as resolved with resolution notes.",
                  },
                ]}
                onCopy={handleCopy}
                copiedPath={copiedPath}
              />

              <ApiGroup
                id="bulk-import"
                name="Bulk Import"
                description="Bulk data import"
                icon={<svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>}
                items={[
                  {
                    method: "POST",
                    path: "/bulk-import/students",
                    summary: "Bulk import students",
                    details: "Upload CSV/Excel file to import multiple students.",
                  },
                  {
                    method: "POST",
                    path: "/bulk-import/teachers",
                    summary: "Bulk import teachers",
                    details: "Upload CSV/Excel file to import multiple teachers.",
                  },
                  {
                    method: "GET",
                    path: "/bulk-import/templates",
                    summary: "Get import templates",
                    details: "Download CSV/Excel templates for bulk imports.",
                  },
                ]}
                onCopy={handleCopy}
                copiedPath={copiedPath}
              />

              {/* Footer */}
              <div className="mt-10 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <p className="text-sm text-muted-foreground">
                    API documentation from <span className="font-medium text-primary">Swagger/OpenAPI 3.0</span>
                  </p>
                  <div className="flex items-center gap-3">
                    <Link href="/">
                      <Button variant="outline" size="sm" className="gap-2">
                        <ArrowLeft className="w-4 h-4" />
                        Back to Home
                      </Button>
                    </Link>
                    <a href="http://46.62.247.127:4234/api-docs/" target="_blank" rel="noopener noreferrer">
                      <Button size="sm" className="gap-2">
                        <ExternalLink className="w-4 h-4" />
                        Swagger UI
                      </Button>
                    </a>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-slate-800 py-8 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-xs text-muted-foreground">
            &copy; 2025 Pragati - Government of India. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

type ApiItem = {
  method: string;
  path: string;
  summary: string;
  details?: string;
};

type ApiGroupProps = {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  items: ApiItem[];
  onCopy: (text: string) => void;
  copiedPath: string | null;
};

function MethodPill({ method }: { method: string }) {
  const colorMap: Record<string, string> = {
    GET: "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
    POST: "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800",
    PUT: "bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800",
    PATCH: "bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800",
    DELETE: "bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800",
  };

  const base =
    "inline-flex min-w-[56px] items-center justify-center rounded-md text-[11px] font-bold px-2.5 py-1 border uppercase tracking-wide";

  return (
    <span className={`${base} ${colorMap[method] ?? "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-600"}`}>
      {method}
    </span>
  );
}

function ApiGroup({ id, name, description, icon, items, onCopy, copiedPath }: ApiGroupProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div id={id} className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden scroll-mt-32">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left bg-gray-50 dark:bg-slate-700/50 hover:bg-gray-100 dark:hover:bg-slate-700 transition border-b border-gray-200 dark:border-gray-700"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary">
            {icon}
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">{name}</h3>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground bg-gray-100 dark:bg-slate-600 px-2 py-0.5 rounded-full">
            {items.length} endpoint{items.length > 1 ? "s" : ""}
          </span>
          <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${isExpanded ? "rotate-180" : ""}`} />
        </div>
      </button>

      {isExpanded && (
        <div className="divide-y divide-gray-100 dark:divide-gray-700">
          {items.map((item) => (
            <div
              key={item.method + item.path}
              className="p-5 hover:bg-gray-50 dark:hover:bg-slate-700/30 transition"
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
                <MethodPill method={item.method} />
                <div className="flex items-center gap-2 flex-1">
                  <code className="flex-1 rounded-lg bg-gray-100 dark:bg-slate-700 px-3 py-2 text-sm font-mono text-gray-800 dark:text-gray-200">
                    {item.path}
                  </code>
                  <button
                    onClick={() => onCopy(item.path)}
                    className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition"
                    title="Copy path"
                  >
                    {copiedPath === item.path ? (
                      <Check className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <Copy className="w-4 h-4 text-muted-foreground" />
                    )}
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">{item.summary}</p>
              {item.details && (
                <p className="text-xs text-muted-foreground">{item.details}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
