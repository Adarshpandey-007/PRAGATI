'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Language, translations, getTranslation } from '@/lib/translations';
import {
  Calendar,
  Clock,
  Plus,
  Edit,
  Save,
  X,
  ChevronDown,
  BookOpen,
  MapPin,
  User,
} from 'lucide-react';

interface Classroom {
  id: string;
  schoolId: string;
  grade: { id: string; name: string };
  section: { id: string; label: string };
  academicYear: string;
}

interface TimetableEntry {
  id?: string;
  weekDay: number;
  period: number;
  startTime: string;
  endTime: string;
  teacherSubjectId?: string;
  label: string;
  location?: string;
  teacher?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  subject?: {
    id: string;
    code: string;
    name: string;
  };
}

interface TimetableResponse {
  classroomId: string;
  schoolId: string;
  entries: TimetableEntry[];
}

interface Subject {
  id: string;
  code: string;
  name: string;
  schoolId: string;
}

const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const PERIODS = [1, 2, 3, 4, 5, 6, 7, 8];

export default function TimetablesPage() {
  const router = useRouter();
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [selectedClassroom, setSelectedClassroom] = useState<string>('');
  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingEntry, setEditingEntry] = useState<{ weekDay: number; period: number } | null>(null);
  const [principalName, setPrincipalName] = useState('Principal');
  const [lang, setLang] = useState<Language>('en');

  const t = (section: keyof typeof translations, key: string) => getTranslation(section, key, lang);

  const handleLanguageChange = (newLang: Language) => {
    setLang(newLang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('pragati_language', newLang);
    }
  };

  // Form state for editing
  const [formData, setFormData] = useState({
    label: '',
    startTime: '',
    endTime: '',
    location: '',
  });

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
      fetchClassrooms(token);
      fetchSubjects(token);
    }
  }, [router]);

  const fetchSubjects = async (token: string) => {
    try {
      const backendUrl = (process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:4000').replace(/\/$/, '');
      const response = await fetch(`${backendUrl}/api/core/subjects`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to fetch subjects');
      const data = await response.json();
      setSubjects(data);
    } catch (err: any) {
      console.error('Error fetching subjects:', err);
    }
  };

  const fetchClassrooms = async (token: string) => {
    setIsLoading(true);
    try {
      const backendUrl = (process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:4000').replace(/\/$/, '');
      const response = await fetch(`${backendUrl}/api/core/classrooms`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch classrooms');
      }

      const data = await response.json();
      setClassrooms(Array.isArray(data) ? data : []);
      
      // Auto-select first classroom if available
      if (data.length > 0) {
        setSelectedClassroom(data[0].id);
        fetchTimetable(token, data[0].id);
      }
    } catch (err) {
      setError('Unable to load classrooms. Please try again.');
      console.error('Error fetching classrooms:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTimetable = async (token: string, classroomId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const backendUrl = (process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:4000').replace(/\/$/, '');
      const response = await fetch(`${backendUrl}/api/timetables/classrooms/${classroomId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch timetable');
      }

      const data: TimetableResponse = await response.json();
      setTimetable(data.entries || []);
    } catch (err) {
      console.error('Error fetching timetable:', err);
      setTimetable([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClassroomChange = async (classroomId: string) => {
    setSelectedClassroom(classroomId);
    if (classroomId) {
      const token = localStorage.getItem('pragati_token');
      if (token) {
        await fetchTimetable(token, classroomId);
      }
    } else {
      setTimetable([]);
    }
    setIsEditing(false);
    setEditingEntry(null);
  };

  const handleEditEntry = (weekDay: number, period: number) => {
    const existing = timetable.find((e) => e.weekDay === weekDay && e.period === period);
    
    if (existing) {
      setFormData({
        label: existing.label,
        startTime: existing.startTime,
        endTime: existing.endTime,
        location: existing.location || '',
      });
    } else {
      setFormData({
        label: '',
        startTime: '',
        endTime: '',
        location: '',
      });
    }
    
    setEditingEntry({ weekDay, period });
    setIsEditing(true);
  };

  const handleSaveEntry = () => {
    if (!editingEntry) return;

    const updatedTimetable = [...timetable];
    const existingIndex = updatedTimetable.findIndex(
      (e) => e.weekDay === editingEntry.weekDay && e.period === editingEntry.period
    );

    const newEntry: TimetableEntry = {
      weekDay: editingEntry.weekDay,
      period: editingEntry.period,
      label: formData.label,
      startTime: formData.startTime,
      endTime: formData.endTime,
      location: formData.location || undefined,
    };

    if (existingIndex >= 0) {
      updatedTimetable[existingIndex] = { ...updatedTimetable[existingIndex], ...newEntry };
    } else {
      updatedTimetable.push(newEntry);
    }

    setTimetable(updatedTimetable);
    setIsEditing(false);
    setEditingEntry(null);
  };

  const handleDeleteEntry = (weekDay: number, period: number) => {
    setTimetable(timetable.filter((e) => !(e.weekDay === weekDay && e.period === period)));
  };

  const handleSaveTimetable = async () => {
    if (!selectedClassroom) return;

    setIsSaving(true);
    setError(null);

    try {
      const token = localStorage.getItem('pragati_token');
      const backendUrl = (process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:4000').replace(/\/$/, '');

      // Strip IDs from entries before sending
      const entriesToSave = timetable.map(({ id, teacher, subject, ...entry }) => entry);

      const response = await fetch(`${backendUrl}/api/timetables/classrooms/${selectedClassroom}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ entries: entriesToSave }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save timetable');
      }

      const result = await response.json();
      console.log('Timetable saved successfully:', result);

      // Refresh timetable
      if (token) {
        await fetchTimetable(token, selectedClassroom);
      }

      alert(`Timetable saved successfully! Total entries: ${result.totalEntries || timetable.length}`);
    } catch (err: any) {
      setError(err.message || 'Failed to save timetable. Please try again.');
      console.error('Error saving timetable:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const getEntryForSlot = (weekDay: number, period: number): TimetableEntry | undefined => {
    return timetable.find((e) => e.weekDay === weekDay && e.period === period);
  };

  const selectedClassroomData = classrooms.find((c) => c.id === selectedClassroom);

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{t('timetables', 'title')}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {selectedClassroomData
                ? `${selectedClassroomData.grade.name} - ${selectedClassroomData.section.label}`
                : t('timetables', 'selectClassroom')}
            </p>
          </div>
        </div>

        {/* Classroom Selector & Actions */}
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900 p-4 sm:p-6 shadow-sm"
          >
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex-1 w-full sm:w-auto">
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Select Classroom</label>
                <select
                  value={selectedClassroom}
                  onChange={(e) => handleClassroomChange(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-all"
                >
                  {classrooms.map((classroom) => (
                    <option key={classroom.id} value={classroom.id}>
                      {classroom.grade.name} - {classroom.section.label}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleSaveTimetable}
                disabled={isSaving || !selectedClassroom}
                className="w-full sm:w-auto mt-6 inline-flex items-center justify-center gap-2 px-6 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 shadow-sm transition-all disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {isSaving ? 'Saving...' : 'Save Timetable'}
              </button>
            </div>
          </motion.div>

          {/* Error State */}
          {error && (
            <div className="rounded-xl border-2 border-red-100 bg-red-50 dark:bg-red-900/20 dark:border-red-900/30 p-4 text-center">
              <p className="text-sm text-red-600 dark:text-red-400 font-medium">{error}</p>
            </div>
          )}

          {/* Timetable Grid */}
          {selectedClassroom && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden"
            >
              <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-800">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Weekly Schedule</h3>
                <p className="text-xs text-muted-foreground mt-1">Click on any slot to edit or add a class</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px]">
                  <thead className="bg-gray-50 dark:bg-slate-800/50 border-b border-gray-200 dark:border-gray-800">
                    <tr>
                      <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider w-24">
                        Period
                      </th>
                      {WEEKDAYS.map((day, index) => (
                        <th key={index} className="px-3 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          {day}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                    {PERIODS.map((period) => (
                      <tr key={period} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="px-3 py-3 text-xs font-medium text-gray-500">Period {period}</td>
                        {WEEKDAYS.map((_, weekDayIndex) => {
                          const weekDay = weekDayIndex + 1;
                          const entry = getEntryForSlot(weekDay, period);
                          
                          return (
                            <td key={weekDayIndex} className="px-2 py-2">
                              <button
                                onClick={() => handleEditEntry(weekDay, period)}
                                className={`w-full min-h-[80px] p-2 rounded-lg text-left transition-all ${
                                  entry
                                    ? 'bg-primary/5 border border-primary/20 hover:bg-primary/10'
                                    : 'bg-gray-50 dark:bg-slate-800/50 hover:bg-gray-100 dark:hover:bg-slate-800 border border-dashed border-gray-200 dark:border-gray-700'
                                }`}
                              >
                                {entry ? (
                                  <div className="space-y-1">
                                    <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">{entry.label}</p>
                                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                      <Clock className="w-3 h-3" />
                                      <span>
                                        {entry.startTime} - {entry.endTime}
                                      </span>
                                    </div>
                                    {entry.location && (
                                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                        <MapPin className="w-3 h-3" />
                                        <span className="truncate">{entry.location}</span>
                                      </div>
                                    )}
                                    {entry.teacher && (
                                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                        <User className="w-3 h-3" />
                                        <span className="truncate">
                                          {entry.teacher.firstName} {entry.teacher.lastName}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <div className="flex items-center justify-center h-full">
                                    <Plus className="w-4 h-4 text-muted-foreground" />
                                  </div>
                                )}
                              </button>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </div>

      {/* Edit Entry Modal */}
      {isEditing && editingEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900 p-6 shadow-xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Edit {WEEKDAYS[editingEntry.weekDay - 1]} - Period {editingEntry.period}
              </h3>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditingEntry(null);
                }}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Subject
                </label>
                <select
                  value={formData.label}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      label: e.target.value,
                    });
                  }}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-all"
                >
                  <option value="">Select a subject or enter custom</option>
                  {subjects.map((subject) => (
                    <option key={subject.id} value={subject.name}>
                      {subject.name}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-muted-foreground">
                  Select from available subjects or type a custom label below
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Custom Label (optional)
                </label>
                <input
                  type="text"
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  placeholder="e.g., Mathematics, Break, Advisory"
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-all"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Override with a custom label if needed
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Start Time</label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">End Time</label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Location (optional)
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g., Room 201"
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-all"
                />
              </div>

              <div className="flex gap-3 pt-4">
                {getEntryForSlot(editingEntry.weekDay, editingEntry.period) && (
                  <button
                    onClick={() => {
                      handleDeleteEntry(editingEntry.weekDay, editingEntry.period);
                      setIsEditing(false);
                      setEditingEntry(null);
                    }}
                    className="px-4 py-2 rounded-lg bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 text-sm font-medium hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                  >
                    Delete
                  </button>
                )}
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditingEntry(null);
                  }}
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-sm font-medium hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEntry}
                  disabled={!formData.label || !formData.startTime || !formData.endTime}
                  className="flex-1 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 shadow-sm transition-all disabled:opacity-50"
                >
                  Save
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
