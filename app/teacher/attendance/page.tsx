"use client";

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Check, X, Save, Loader2, AlertCircle } from 'lucide-react';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface Classroom {
  classroomId: string;
  grade?: { name?: string };
  section?: { label?: string };
  roles: { homeroom: boolean };
}

interface StudentAttendance {
  studentId: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  student: {
    id: string;
    firstName: string;
    lastName: string;
    code: string;
  };
}

export default function AttendancePage() {
  const { toast } = useToast();
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [selectedClassroom, setSelectedClassroom] = useState<string>("");
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [sessionLoading, setSessionLoading] = useState(false);
  const [students, setStudents] = useState<StudentAttendance[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [canEdit, setCanEdit] = useState(false);
  const [sessionsList, setSessionsList] = useState<any[]>([]);
  const backendUrl = (process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:4000').replace(/\/$/, '');

  // Fetch Classrooms
  useEffect(() => {
    const fetchClassrooms = async () => {
      try {
        const token = localStorage.getItem('pragati_token');
        if (!token) return;

        // Using the report endpoint to get assigned classrooms
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
        const end = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
        
        const res = await fetch(`${backendUrl}/api/reports/attendance/teacher?start=${start}&end=${end}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (res.ok) {
          const data = await res.json();
          const normalizedClassrooms: Classroom[] = (data.classrooms || []).map((c: any) => ({
            classroomId: String(c.classroomId || c.id || ''),
            grade: c.grade || { name: `Classroom ${String(c.classroomId || c.id || '')}` },
            section: c.section || { label: '' },
            roles: c.roles || { homeroom: false },
          })).filter((c: Classroom) => c.classroomId);

          setClassrooms(normalizedClassrooms);
          if (normalizedClassrooms.length > 0) {
            setSelectedClassroom(normalizedClassrooms[0].classroomId);
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

  // Fetch Session List for Calendar & Sidebar
  useEffect(() => {
    if (!selectedClassroom) return;
    
    const fetchSessionsList = async () => {
      try {
        const token = localStorage.getItem('pragati_token');
        const res = await fetch(`${backendUrl}/api/attendance/classrooms/${selectedClassroom}/sessions`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setSessionsList(data.sessions || []);
        }
      } catch (error) {
        console.error("Failed to fetch sessions list", error);
      }
    };
    
    fetchSessionsList();
  }, [selectedClassroom]);

  // Fetch Session Data when Classroom or Date changes
  useEffect(() => {
    if (!selectedClassroom || !date) return;

    const fetchSession = async () => {
      setSessionLoading(true);
      setSessionId(null);
      setStudents([]);
      setCanEdit(false);

      try {
        const token = localStorage.getItem('pragati_token');
        const dateStr = format(date, 'yyyy-MM-dd');
        
        // 1. Check for existing session via daily summary
        const summaryRes = await fetch(`${backendUrl}/api/attendance/classrooms/${selectedClassroom}/summary?date=${dateStr}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (summaryRes.ok) {
          const data = await summaryRes.json();
          if (data.sessions && data.sessions.length > 0) {
            // Session exists
            const session = data.sessions[0];
            setSessionId(session.id);
            setCanEdit(session.canEdit);
            setStudents(session.studentAttendance || []);
          } else {
            // No session exists yet. 
            // We need to fetch the student list to allow creating one.
            // Try face recognition API first (updated with TeacherSubject access)
            // Then fall back to core students API
            let studentsData: any[] = [];
            
            try {
              const faceStatusRes = await fetch(`${backendUrl}/api/face-recognition/classrooms/${selectedClassroom}/face-registration-status`, {
                headers: { Authorization: `Bearer ${token}` }
              });
              
              if (faceStatusRes.ok) {
                const faceData = await faceStatusRes.json();
                if (faceData.students && faceData.students.length > 0) {
                  studentsData = faceData.students.map((s: any) => ({
                    id: s.studentId,
                    firstName: s.firstName,
                    lastName: s.lastName,
                    code: s.code,
                  }));
                }
              }
            } catch (faceErr) {
              console.log('Face registration API not available, falling back to core API');
            }
            
            // Fallback to core students API if face API didn't return students
            if (studentsData.length === 0) {
              const studentsRes = await fetch(`${backendUrl}/api/core/students?classroomId=${selectedClassroom}`, {
                headers: { Authorization: `Bearer ${token}` }
              });
              
              if (studentsRes.ok) {
                studentsData = await studentsRes.json();
              }
            }
            
            if (studentsData.length > 0) {
              // Initialize with 'present' status
              setStudents(studentsData.map((s: any) => ({
                studentId: s.id,
                status: 'present',
                student: s
              })));
              
              // Check if the selected date is within the editable window (e.g., last 24 hours)
              // This is a client-side check to prevent frustration, but backend is the source of truth.
              const now = new Date();
              const sessionDate = new Date(date);
              // Reset times to compare dates only, or use a 24h window logic
              // Backend logic seems to be strict 24h window from session start?
              // Let's just allow it for now, but maybe warn?
              setCanEdit(true); 
            }
          }
        }
      } catch (error) {
        console.error("Failed to fetch session", error);
        toast({
          title: "Error",
          description: "Failed to load attendance data",
          variant: "destructive"
        });
      } finally {
        setSessionLoading(false);
      }
    };

    fetchSession();
  }, [selectedClassroom, date, toast]);

  const handleStatusToggle = (studentId: string) => {
    if (!canEdit) return;
    
    setStudents(prev => prev.map(s => {
      if (s.studentId === studentId) {
        return {
          ...s,
          status: s.status === 'present' ? 'absent' : 'present'
        };
      }
      return s;
    }));
  };

  const handleSave = async () => {
    if (!selectedClassroom || !date) return;

    // Prevent future dates
    if (date > new Date()) {
      toast({
        title: "Error",
        description: "Cannot mark attendance for future dates",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setSessionLoading(true);
      const token = localStorage.getItem('pragati_token');
      const dateStr = format(date, 'yyyy-MM-dd');
      const schoolId = localStorage.getItem('pragati_schoolId') || '1'; // Fallback

      // Use the new simplified endpoint
      const res = await fetch(`${backendUrl}/api/attendance/mark`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          schoolId,
          classroomId: selectedClassroom,
          sessionDate: dateStr,
          entries: students.map(s => ({
            studentId: s.studentId,
            status: s.status
          }))
        })
      });

      if (res.ok) {
        const data = await res.json();
        setSessionId(data.sessionId);
        
        toast({
          title: "Success",
          description: "Attendance saved successfully",
        });
        
        // Refresh session list to show the new/updated session
        const sessionsRes = await fetch(`${backendUrl}/api/attendance/classrooms/${selectedClassroom}/sessions`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (sessionsRes.ok) {
          const data = await sessionsRes.json();
          setSessionsList(data.sessions || []);
        }

        // Go back to sessions page
        setDate(undefined);
      } else {
        const errorText = await res.text();
        console.error("Failed to save records:", errorText);
        throw new Error(`Failed to save records: ${errorText}`);
      }

    } catch (error: any) {
      console.error("Failed to save attendance", error);
      
      let errorMessage = "Failed to save attendance";
      if (error.message && error.message.includes("Attendance can only be edited within 24 hours")) {
        errorMessage = "Attendance can only be edited within 24 hours of the session date.";
      } else if (error.message) {
        // Try to parse JSON error message if possible
        try {
           const jsonError = JSON.parse(error.message.replace('Failed to save records: ', ''));
           if (jsonError.message) errorMessage = jsonError.message;
        } catch (e) {
           errorMessage = error.message;
        }
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setSessionLoading(false);
    }
  };

  const stats = {
    present: students.filter(s => s.status === 'present').length,
    absent: students.filter(s => s.status === 'absent').length,
    total: students.length
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight gradient-text">Attendance</h1>
          <p className="text-muted-foreground">Mark daily attendance for your class</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Select value={selectedClassroom} onValueChange={setSelectedClassroom}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Select Classroom" />
            </SelectTrigger>
            <SelectContent>
              {classrooms.map((c) => (
                <SelectItem key={c.classroomId} value={c.classroomId}>
                  {c.grade?.name || `Classroom ${c.classroomId}`}
                  {c.section?.label ? ` - ${c.section.label}` : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full sm:w-[240px] justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(d) => d && setDate(d)}
                disabled={(date) => date > new Date()}
                initialFocus
                modifiers={{
                  booked: sessionsList.map(s => new Date(s.sessionDate))
                }}
                modifiersStyles={{
                  booked: { 
                    fontWeight: 'bold', 
                    textDecoration: 'underline',
                    color: 'var(--primary)'
                  }
                }}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : !selectedClassroom ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <AlertCircle className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">No Classroom Selected</h3>
            <p className="text-muted-foreground">Please select a classroom to view or mark attendance.</p>
          </CardContent>
        </Card>
      ) : !date ? (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Recent Sessions</h2>
            <Button onClick={() => setDate(new Date())}>
              <Check className="w-4 h-4 mr-2" />
              Take Attendance Today
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              {sessionsList.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <CalendarIcon className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <p>No attendance sessions recorded yet.</p>
                  <Button variant="link" onClick={() => setDate(new Date())} className="mt-2">
                    Start marking attendance
                  </Button>
                </div>
              ) : (
                <div className="divide-y">
                  {sessionsList
                    .sort((a, b) => new Date(b.sessionDate).getTime() - new Date(a.sessionDate).getTime())
                    .map((session) => (
                      <div 
                        key={session.id}
                        onClick={() => setDate(new Date(session.sessionDate))}
                        className="flex items-center justify-between p-4 hover:bg-accent/50 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="bg-primary/10 p-3 rounded-full">
                            <CalendarIcon className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">
                              {format(new Date(session.sessionDate), 'EEEE, MMMM d, yyyy')}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {session.totalRecords || 0} Students Marked
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            Completed
                          </Badge>
                          <Button variant="ghost" size="sm">View Details</Button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Student List */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Student List</CardTitle>
                  <CardDescription>
                    {date && format(date, "MMMM d, yyyy")} • {stats.total} Students
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setDate(undefined)}>
                    Back
                  </Button>
                  {canEdit && (
                    <Button onClick={handleSave} disabled={sessionLoading}>
                      {sessionLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                      Save
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {sessionLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                  </div>
                ) : students.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No students found in this classroom.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {students.map((record) => (
                      <div
                        key={record.studentId}
                        onClick={() => handleStatusToggle(record.studentId)}
                        className={cn(
                          "flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer",
                          record.status === 'present' 
                            ? "bg-white dark:bg-slate-900 border-gray-200 dark:border-gray-800 hover:border-primary/50" 
                            : "bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900/30",
                          !canEdit && "cursor-default opacity-80"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>{record.student.firstName[0]}{record.student.lastName[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">{record.student.firstName} {record.student.lastName}</p>
                            <p className="text-xs text-muted-foreground">{record.student.code}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant={record.status === 'present' ? "default" : "destructive"}
                            className="capitalize"
                          >
                            {record.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Summary Stats */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Daily Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Present</span>
                  <span className="font-bold text-emerald-600">{stats.present}</span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-gray-800 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-emerald-500 h-full transition-all duration-500" 
                    style={{ width: `${stats.total > 0 ? (stats.present / stats.total) * 100 : 0}%` }}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Absent</span>
                  <span className="font-bold text-red-600">{stats.absent}</span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-gray-800 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-red-500 h-full transition-all duration-500" 
                    style={{ width: `${stats.total > 0 ? (stats.absent / stats.total) * 100 : 0}%` }}
                  />
                </div>

                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Attendance Rate</span>
                    <span className="font-bold">
                      {stats.total > 0 ? ((stats.present / stats.total) * 100).toFixed(1) : 0}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {!canEdit && sessionId && (
              <Card className="bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-900/30">
                <CardContent className="p-4 flex gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-500 shrink-0" />
                  <div className="text-sm text-yellow-800 dark:text-yellow-200">
                    <p className="font-semibold mb-1">Read Only</p>
                    <p>This session is past the 24-hour edit window and cannot be modified.</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recent Sessions List */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Sessions</CardTitle>
                <CardDescription>History of marked attendance</CardDescription>
              </CardHeader>
              <CardContent>
                {sessionsList.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">No sessions recorded yet.</p>
                ) : (
                  <div className="space-y-2">
                    {sessionsList
                      .sort((a, b) => new Date(b.sessionDate).getTime() - new Date(a.sessionDate).getTime())
                      .slice(0, 5)
                      .map((session) => (
                        <div 
                          key={session.id}
                          onClick={() => setDate(new Date(session.sessionDate))}
                          className={cn(
                            "flex items-center justify-between p-3 rounded-md border cursor-pointer hover:bg-accent transition-colors",
                            date && format(new Date(session.sessionDate), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd') && "bg-accent border-primary"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <div className="bg-primary/10 p-2 rounded-full">
                              <CalendarIcon className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium text-sm">
                                {format(new Date(session.sessionDate), 'MMM d, yyyy')}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {session.totalRecords || 0} Students
                              </p>
                            </div>
                          </div>
                          <Check className="w-4 h-4 text-green-500" />
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}