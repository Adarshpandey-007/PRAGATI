"use client";

import { useState, useEffect } from 'react';
import { Check, ChevronsUpDown, Loader2, Calendar } from 'lucide-react';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";

interface Classroom {
  id: string;
  grade?: { name?: string };
  section?: { label?: string };
}

interface TimetableEntry {
  id: string;
  weekDay: number;
  period: number;
  startTime: string;
  endTime: string;
  label: string;
  location?: string;
  teacherSubject?: {
    subject: { name: string };
    teacher: { user: { firstName: string; lastName: string } };
  };
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function TimetablesPage() {
  const [loading, setLoading] = useState(true);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [selectedClassroom, setSelectedClassroom] = useState<string>("");
  const [timetable, setTimetable] = useState<TimetableEntry[]>([]);
  const [fetchingTimetable, setFetchingTimetable] = useState(false);
  const backendUrl = (process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:4000').replace(/\/$/, '');
  const formatClassroomLabel = (classroom?: Classroom) => {
    if (!classroom) return 'Select classroom...';
    const gradeName = classroom.grade?.name;
    const sectionLabel = classroom.section?.label;
    if (gradeName && sectionLabel) return `${gradeName} ${sectionLabel}`;
    if (gradeName) return gradeName;
    return `Classroom ${classroom.id}`;
  };

  // Fetch Classrooms
  useEffect(() => {
    const fetchClassrooms = async () => {
      try {
        const token = localStorage.getItem('pragati_token');
        if (!token) return;

        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
        const end = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

        const res = await fetch(`${backendUrl}/api/reports/attendance/teacher?start=${start}&end=${end}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (res.ok) {
          const data = await res.json();
          if (data.classrooms) {
            const mappedClassrooms: Classroom[] = data.classrooms
              .map((c: any) => ({
                id: String(c.id || c.classroomId || ''),
                grade: c.grade || { name: `Classroom ${String(c.id || c.classroomId || '')}` },
                section: c.section || { label: '' },
              }))
              .filter((c: Classroom) => c.id);

            setClassrooms(mappedClassrooms);
            if (mappedClassrooms.length > 0) {
              setSelectedClassroom(mappedClassrooms[0].id);
            }
          }
        }
      } catch (error) {
        console.error("Failed to fetch classrooms", error);
      } finally {
        setLoading(false);
      }
    };

    fetchClassrooms();
  }, []);

  // Fetch Timetable
  useEffect(() => {
    const fetchTimetable = async () => {
      if (!selectedClassroom) return;
      
      setFetchingTimetable(true);
      try {
        const token = localStorage.getItem('pragati_token');
        const res = await fetch(`${backendUrl}/api/timetables/classrooms/${selectedClassroom}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (res.ok) {
          const data = await res.json();
          setTimetable(data);
        } else {
          setTimetable([]);
        }
      } catch (error) {
        console.error("Failed to fetch timetable", error);
        setTimetable([]);
      } finally {
        setFetchingTimetable(false);
      }
    };

    fetchTimetable();
  }, [selectedClassroom]);

  const getEntriesForDay = (dayIndex: number) => {
    // API uses 1 for Monday, 7 for Sunday. Our DAYS array is 0-indexed.
    // So Monday (index 0) corresponds to weekDay 1.
    return timetable
      .filter(t => t.weekDay === dayIndex + 1)
      .sort((a, b) => a.period - b.period);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-sm"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl" />
        
        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <p className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] border border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-900/30 dark:bg-purple-900/10 dark:text-purple-400 mb-3">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-purple-500 animate-pulse" />
              Schedule Management
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold mb-2">
              Timetables
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground">
              View class schedules and periods
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Label className="whitespace-nowrap hidden sm:block">Classroom:</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className="w-[200px] justify-between bg-white dark:bg-slate-950"
                >
                  {formatClassroomLabel(classrooms.find((c) => c.id === selectedClassroom))}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[200px] p-0">
                <Command>
                  <CommandInput placeholder="Search classroom..." />
                  <CommandList>
                    <CommandEmpty>No classroom found.</CommandEmpty>
                    <CommandGroup>
                      {classrooms.map((classroom) => (
                        <CommandItem
                          key={classroom.id}
                          value={classroom.id}
                          onSelect={(currentValue) => {
                            setSelectedClassroom(currentValue === selectedClassroom ? "" : currentValue);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedClassroom === classroom.id ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {formatClassroomLabel(classroom)}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </motion.div>

      {fetchingTimetable ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {DAYS.map((day, index) => {
            const entries = getEntriesForDay(index);
            if (entries.length === 0) return null;

            return (
              <motion.div
                key={day}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="overflow-hidden border-2 border-gray-200 dark:border-gray-700 shadow-sm h-full">
                  <CardHeader className="bg-gray-50/50 dark:bg-slate-900/50 pb-4 border-b border-gray-100 dark:border-gray-800">
                    <CardTitle className="text-lg flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-primary" />
                      {day}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y divide-gray-100 dark:divide-gray-800">
                      {entries.map((entry) => (
                        <div key={entry.id} className="p-4 hover:bg-gray-50 dark:hover:bg-slate-900 transition-colors">
                          <div className="flex justify-between items-start mb-1">
                            <span className="font-semibold text-primary">
                              {entry.startTime.slice(0, 5)} - {entry.endTime.slice(0, 5)}
                            </span>
                            <span className="text-xs font-medium px-2 py-1 rounded-full bg-secondary text-secondary-foreground">
                              Period {entry.period}
                            </span>
                          </div>
                          <h3 className="font-medium text-lg">
                            {entry.teacherSubject?.subject.name || entry.label}
                          </h3>
                          {entry.teacherSubject && (
                            <p className="text-sm text-muted-foreground">
                              {entry.teacherSubject.teacher.user.firstName} {entry.teacherSubject.teacher.user.lastName}
                            </p>
                          )}
                          {entry.location && (
                            <p className="text-xs text-muted-foreground mt-1 flex items-center">
                              📍 {entry.location}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
          
          {timetable.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-12 text-muted-foreground border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50/50 dark:bg-slate-900/50">
              <Calendar className="w-12 h-12 mb-4 opacity-20" />
              <p>No timetable entries found for this classroom</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}