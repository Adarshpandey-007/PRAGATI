'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Download,
  Calendar,
  TrendingUp,
  TrendingDown,
  Users,
  BarChart3,
  FileText,
  Filter,
  Search,
  ChevronDown,
  BookOpen,
} from 'lucide-react';
import { Language, translations, getTranslation } from '@/lib/translations';

interface ClassroomReport {
  classroomId: string;
  grade: { id: string; name: string; level: number };
  section: { id: string; label: string };
  totalSessions: number;
  totalRecords: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
  attendanceRate: number;
}

interface AttendanceReport {
  schoolId: string;
  range: { start: string; end: string };
  totals: {
    sessions: number;
    totalRecords: number;
    present: number;
    absent: number;
    late: number;
    excused: number;
    attendanceRate: number;
  };
  classrooms: ClassroomReport[];
  topClassrooms: Array<{ classroomId: string; attendanceRate: number; totalRecords: number }>;
  bottomClassrooms: Array<{ classroomId: string; attendanceRate: number; totalRecords: number }>;
  generatedAt: string;
}

function normalizeAttendanceRate(value: unknown): number {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric < 0) return 0;
  if (numeric > 1) return Math.min(numeric / 100, 1);
  return numeric;
}

export default function AttendanceReportsPage() {
  const router = useRouter();
  const [report, setReport] = useState<AttendanceReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [principalName, setPrincipalName] = useState('Principal');
  const [lang, setLang] = useState<Language>('en');
  const [selectedQuickFilter, setSelectedQuickFilter] = useState<string>('last30');

  // Quick date filter options
  const quickFilters = [
    { id: 'today', label: "Today's Attendance", getRange: () => {
      const today = new Date();
      const dateStr = today.toISOString().split('T')[0];
      return { start: dateStr, end: dateStr };
    }},
    { id: 'yesterday', label: 'Yesterday', getRange: () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const dateStr = yesterday.toISOString().split('T')[0];
      return { start: dateStr, end: dateStr };
    }},
    { id: 'last7', label: 'Last 7 Days', getRange: () => {
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - 7);
      return { start: start.toISOString().split('T')[0], end: end.toISOString().split('T')[0] };
    }},
    { id: 'last30', label: 'Last 30 Days', getRange: () => {
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - 30);
      return { start: start.toISOString().split('T')[0], end: end.toISOString().split('T')[0] };
    }},
    { id: 'thisMonth', label: 'This Month', getRange: () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date();
      return { start: start.toISOString().split('T')[0], end: end.toISOString().split('T')[0] };
    }},
    { id: 'lastMonth', label: 'Last Month', getRange: () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const end = new Date(now.getFullYear(), now.getMonth(), 0);
      return { start: start.toISOString().split('T')[0], end: end.toISOString().split('T')[0] };
    }},
    { id: 'thisYear', label: 'This Year', getRange: () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), 0, 1);
      const end = new Date();
      return { start: start.toISOString().split('T')[0], end: end.toISOString().split('T')[0] };
    }},
    { id: 'custom', label: 'Custom Range', getRange: () => ({ start: startDate, end: endDate }) },
  ];

  const handleQuickFilter = (filterId: string) => {
    setSelectedQuickFilter(filterId);
    const filter = quickFilters.find(f => f.id === filterId);
    if (filter && filterId !== 'custom') {
      const { start, end } = filter.getRange();
      setStartDate(start);
      setEndDate(end);
      const token = localStorage.getItem('pragati_token');
      if (token) {
        fetchReport(token, start, end);
      }
    }
  };

  // Helper function for translations
  const t = (section: keyof typeof translations, key: string) => getTranslation(section, key, lang);

  // Save language preference when changed
  const handleLanguageChange = (newLang: Language) => {
    setLang(newLang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('pragati_language', newLang);
    }
  };

  useEffect(() => {
    // Check authentication
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('pragati_token');
      const role = localStorage.getItem('pragati_role');
      const name = localStorage.getItem('pragati_name') || 'Principal';
      const savedLang = localStorage.getItem('pragati_language') as Language;
      
      if (savedLang === 'en' || savedLang === 'pa' || savedLang === 'hi') {
        setLang(savedLang);
      }

      if (!token || role !== 'PRINCIPAL') {
        router.push('/login/principal');
        return;
      }

      setPrincipalName(name);

      // Set default dates (last 30 days)
      const end = new Date();
      const start = new Date();
      start.setDate(start.getDate() - 30);

      setStartDate(start.toISOString().split('T')[0]);
      setEndDate(end.toISOString().split('T')[0]);

      fetchReport(token, start.toISOString().split('T')[0], end.toISOString().split('T')[0]);
    }
  }, [router]);

  const fetchReport = async (token: string, start: string, end: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const backendUrl = (process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:4000').replace(/\/$/, '');
      const response = await fetch(
        `${backendUrl}/api/reports/attendance/principal?start=${start}&end=${end}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch report');
      }

      const data = await response.json();
      const normalized: AttendanceReport = {
        ...data,
        totals: {
          ...data.totals,
          attendanceRate: normalizeAttendanceRate(data?.totals?.attendanceRate),
        },
        classrooms: Array.isArray(data?.classrooms)
          ? data.classrooms.map((classroom: ClassroomReport) => ({
              ...classroom,
              attendanceRate: normalizeAttendanceRate(classroom.attendanceRate),
            }))
          : [],
        topClassrooms: Array.isArray(data?.topClassrooms)
          ? data.topClassrooms.map((item: { classroomId: string; attendanceRate: number; totalRecords: number }) => ({
              ...item,
              attendanceRate: normalizeAttendanceRate(item.attendanceRate),
            }))
          : [],
        bottomClassrooms: Array.isArray(data?.bottomClassrooms)
          ? data.bottomClassrooms.map((item: { classroomId: string; attendanceRate: number; totalRecords: number }) => ({
              ...item,
              attendanceRate: normalizeAttendanceRate(item.attendanceRate),
            }))
          : [],
      };

      setReport(normalized);
    } catch (err) {
      setError('Unable to load attendance report. Please try again.');
      console.error('Error fetching report:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateReport = () => {
    const token = localStorage.getItem('pragati_token');
    if (token && startDate && endDate) {
      fetchReport(token, startDate, endDate);
    }
  };

  const handleDownloadPDF = async () => {
    const token = localStorage.getItem('pragati_token');
    if (!token || !startDate || !endDate) return;

    try {
      const backendUrl = (process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:4000').replace(/\/$/, '');
      const response = await fetch(
        `${backendUrl}/api/reports/attendance/principal/pdf?start=${startDate}&end=${endDate}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to download PDF');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `attendance-report-${startDate}-to-${endDate}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Error downloading PDF:', err);
    }
  };

  const handleDownloadCSV = () => {
    if (!report) return;

    // Generate CSV content
    const headers = ['Classroom', 'Grade', 'Section', 'Total Sessions', 'Present', 'Absent', 'Late', 'Excused', 'Attendance Rate (%)'];
    const rows = report.classrooms.map(classroom => [
      `${classroom.grade.name} - ${classroom.section.label}`,
      classroom.grade.name,
      classroom.section.label,
      classroom.totalSessions,
      classroom.present,
      classroom.absent,
      classroom.late,
      classroom.excused,
      (classroom.attendanceRate * 100).toFixed(2)
    ]);

    // Add summary row
    rows.push([]);
    rows.push(['SUMMARY']);
    rows.push(['Total Sessions', report.totals.sessions]);
    rows.push(['Total Records', report.totals.totalRecords]);
    rows.push(['Present', report.totals.present]);
    rows.push(['Absent', report.totals.absent]);
    rows.push(['Late', report.totals.late]);
    rows.push(['Excused', report.totals.excused]);
    rows.push(['Overall Attendance Rate (%)', (report.totals.attendanceRate * 100).toFixed(2)]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-report-${startDate}-to-${endDate}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const handleDownloadExcel = () => {
    if (!report) return;

    // Generate Excel-compatible XML content
    const headers = ['Classroom', 'Grade', 'Section', 'Total Sessions', 'Present', 'Absent', 'Late', 'Excused', 'Attendance Rate (%)'];
    
    let xmlContent = '<?xml version="1.0"?>\n';
    xmlContent += '<?mso-application progid="Excel.Sheet"?>\n';
    xmlContent += '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"\n';
    xmlContent += '  xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">\n';
    xmlContent += '  <Worksheet ss:Name="Attendance Report">\n';
    xmlContent += '    <Table>\n';

    // Headers
    xmlContent += '      <Row>\n';
    headers.forEach(header => {
      xmlContent += `        <Cell><Data ss:Type="String">${header}</Data></Cell>\n`;
    });
    xmlContent += '      </Row>\n';

    // Data rows
    report.classrooms.forEach(classroom => {
      xmlContent += '      <Row>\n';
      xmlContent += `        <Cell><Data ss:Type="String">${classroom.grade.name} - ${classroom.section.label}</Data></Cell>\n`;
      xmlContent += `        <Cell><Data ss:Type="String">${classroom.grade.name}</Data></Cell>\n`;
      xmlContent += `        <Cell><Data ss:Type="String">${classroom.section.label}</Data></Cell>\n`;
      xmlContent += `        <Cell><Data ss:Type="Number">${classroom.totalSessions}</Data></Cell>\n`;
      xmlContent += `        <Cell><Data ss:Type="Number">${classroom.present}</Data></Cell>\n`;
      xmlContent += `        <Cell><Data ss:Type="Number">${classroom.absent}</Data></Cell>\n`;
      xmlContent += `        <Cell><Data ss:Type="Number">${classroom.late}</Data></Cell>\n`;
      xmlContent += `        <Cell><Data ss:Type="Number">${classroom.excused}</Data></Cell>\n`;
      xmlContent += `        <Cell><Data ss:Type="Number">${(classroom.attendanceRate * 100).toFixed(2)}</Data></Cell>\n`;
      xmlContent += '      </Row>\n';
    });

    // Summary section
    xmlContent += '      <Row></Row>\n';
    xmlContent += '      <Row><Cell><Data ss:Type="String">SUMMARY</Data></Cell></Row>\n';
    xmlContent += `      <Row><Cell><Data ss:Type="String">Total Sessions</Data></Cell><Cell><Data ss:Type="Number">${report.totals.sessions}</Data></Cell></Row>\n`;
    xmlContent += `      <Row><Cell><Data ss:Type="String">Overall Attendance Rate (%)</Data></Cell><Cell><Data ss:Type="Number">${(report.totals.attendanceRate * 100).toFixed(2)}</Data></Cell></Row>\n`;

    xmlContent += '    </Table>\n';
    xmlContent += '  </Worksheet>\n';
    xmlContent += '</Workbook>';

    const blob = new Blob([xmlContent], { type: 'application/vnd.ms-excel' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-report-${startDate}-to-${endDate}.xls`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const filteredClassrooms = report?.classrooms.filter((classroom) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      classroom.grade.name.toLowerCase().includes(searchLower) ||
      classroom.section.label.toLowerCase().includes(searchLower)
    );
  }) || [];

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{t('reports', 'title')}</h1>
            <p className="text-sm text-muted-foreground mt-1">{t('reports', 'subtitle')}</p>
          </div>
        </div>

        {/* Filters */}
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900 p-4 sm:p-6 shadow-sm"
          >
            {/* Quick Filter Buttons */}
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Quick Filters</label>
              <div className="flex flex-wrap gap-2">
                {quickFilters.map((filter) => (
                  <button
                    key={filter.id}
                    onClick={() => handleQuickFilter(filter.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      selectedQuickFilter === filter.id
                        ? 'bg-primary text-white shadow-sm'
                        : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {filter.id === 'today' && <Calendar className="w-3 h-3 inline-block mr-1.5" />}
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Date Range & Actions */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setSelectedQuickFilter('custom');
                  }}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-all"
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setSelectedQuickFilter('custom');
                  }}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-all"
                />
              </div>
              <div className="flex flex-wrap gap-2 sm:items-end">
                <button
                  onClick={handleGenerateReport}
                  disabled={isLoading}
                  className="flex-1 sm:flex-none px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 shadow-sm transition-all disabled:opacity-50"
                >
                  <Filter className="w-4 h-4 inline-block mr-2" />
                  Generate
                </button>
                <button
                  onClick={handleDownloadPDF}
                  disabled={!report || isLoading}
                  className="flex-1 sm:flex-none px-4 py-2 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400 text-sm font-medium hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors disabled:opacity-50"
                >
                  <Download className="w-4 h-4 inline-block mr-2" />
                  PDF
                </button>
                <button
                  onClick={handleDownloadCSV}
                  disabled={!report || isLoading}
                  className="flex-1 sm:flex-none px-4 py-2 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 text-sm font-medium hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors disabled:opacity-50"
                >
                  <FileText className="w-4 h-4 inline-block mr-2" />
                  CSV
                </button>
                <button
                  onClick={handleDownloadExcel}
                  disabled={!report || isLoading}
                  className="flex-1 sm:flex-none px-4 py-2 rounded-lg bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400 text-sm font-medium hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors disabled:opacity-50"
                >
                  <Download className="w-4 h-4 inline-block mr-2" />
                  Excel
                </button>
              </div>
            </div>

            {/* Current Report Period Indicator */}
            {report && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span className="text-muted-foreground">Showing report for:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {new Date(startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    {startDate !== endDate && (
                      <> to {new Date(endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</>
                    )}
                  </span>
                  {selectedQuickFilter !== 'custom' && (
                    <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                      {quickFilters.find(f => f.id === selectedQuickFilter)?.label}
                    </span>
                  )}
                </div>
              </div>
            )}
          </motion.div>

          {/* Loading State */}
          {isLoading && (
            <div className="rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900 p-12 text-center shadow-sm">
              <div className="inline-block w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
              <p className="mt-4 text-sm text-muted-foreground">Loading report...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="rounded-xl border-2 border-red-100 bg-red-50 dark:bg-red-900/20 dark:border-red-900/30 p-6 text-center">
              <p className="text-sm text-red-600 dark:text-red-400 font-medium">{error}</p>
            </div>
          )}

          {/* Report Content */}
          {!isLoading && report && (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-sm hover:border-primary/50 transition-all"
                >
                  <div className="inline-flex p-2 rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 mb-3">
                    <Users className="w-4 h-4" />
                  </div>
                  <p className="text-xs text-muted-foreground mb-1">Total Records</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{report.totals.totalRecords.toLocaleString()}</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-sm hover:border-primary/50 transition-all"
                >
                  <div className="inline-flex p-2 rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 mb-3">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <p className="text-xs text-muted-foreground mb-1">Attendance Rate</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{(report.totals.attendanceRate * 100).toFixed(1)}%</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-sm hover:border-primary/50 transition-all"
                >
                  <div className="inline-flex p-2 rounded-lg bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400 mb-3">
                    <BarChart3 className="w-4 h-4" />
                  </div>
                  <p className="text-xs text-muted-foreground mb-1">Total Sessions</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{report.totals.sessions}</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-sm hover:border-primary/50 transition-all"
                >
                  <div className="inline-flex p-2 rounded-lg bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400 mb-3">
                    <FileText className="w-4 h-4" />
                  </div>
                  <p className="text-xs text-muted-foreground mb-1">Present</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{report.totals.present.toLocaleString()}</p>
                </motion.div>
              </div>

              {/* Search Bar */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900 p-4 shadow-sm"
              >
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search by grade or section..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-slate-950 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-all"
                  />
                </div>
              </motion.div>

              {/* Classroom Table */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden"
              >
                <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-800">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Classroom Breakdown</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Showing {filteredClassrooms.length} of {report.classrooms.length} classrooms
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-slate-800/50 border-b border-gray-200 dark:border-gray-800">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Classroom</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Sessions</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Present</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Absent</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Rate</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                      {filteredClassrooms.map((classroom) => (
                        <tr
                          key={classroom.classroomId}
                          className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors"
                        >
                          <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                            {classroom.grade.name} - {classroom.section.label}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{classroom.totalSessions}</td>
                          <td className="px-6 py-4 text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                            {classroom.present}
                          </td>
                          <td className="px-6 py-4 text-sm text-red-600 dark:text-red-400 font-medium">{classroom.absent}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden max-w-[80px]">
                                <div
                                  className="h-full bg-primary"
                                  style={{ width: `${classroom.attendanceRate * 100}%` }}
                                />
                              </div>
                              <span className="text-sm font-medium text-gray-900 dark:text-white">{(classroom.attendanceRate * 100).toFixed(1)}%</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            </>
          )}
        </div>
      </div>
  );
}
