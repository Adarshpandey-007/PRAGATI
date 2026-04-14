"use client";

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { Calendar as CalendarIcon, Check, ChevronsUpDown, Loader2, Plus, Save, GraduationCap } from 'lucide-react';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Classroom {
  id: string;
  grade?: { name?: string };
  section?: { label?: string };
}

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  rollNumber: string;
}

interface ExamResult {
  studentId: string;
  score: number;
  grade: string;
}

export default function ExamsPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [selectedClassroom, setSelectedClassroom] = useState<string>("");
  const [students, setStudents] = useState<Student[]>([]);
  
  // Exam Creation State
  const [examName, setExamName] = useState("");
  const [examDate, setExamDate] = useState<Date>();
  const [totalMarks, setTotalMarks] = useState("100");
  const [subjectId, setSubjectId] = useState("1"); // Default subject ID for now
  const [currentExamId, setCurrentExamId] = useState<string | null>(null);
  
  // Results State
  const [results, setResults] = useState<Record<string, { score: string; grade: string }>>({});
  const [submitting, setSubmitting] = useState(false);
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

        // Using the report endpoint to get assigned classrooms
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

        const res = await fetch(`${backendUrl}/api/reports/attendance/teacher?start=${startOfMonth}&end=${endOfMonth}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (res.ok) {
          const data = await res.json();
          if (data.classrooms) {
            // Map the report classroom structure to our local interface if needed
            // The report endpoint returns classrooms with { classroomId, grade: {name}, section: {label} }
            // Our interface expects { id, grade: {name}, section: {label} }
            const mappedClassrooms = data.classrooms
              .map((c: any) => ({
                id: String(c.classroomId || c.id || ''),
                grade: c.grade || { name: `Classroom ${String(c.classroomId || c.id || '')}` },
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

  // Fetch Students when classroom changes
  useEffect(() => {
    const fetchStudents = async () => {
      if (!selectedClassroom) return;
      
      try {
        const token = localStorage.getItem('pragati_token');
        const res = await fetch(`${backendUrl}/api/core/students?classroomId=${selectedClassroom}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (res.ok) {
          const data = await res.json();
          setStudents(data);
          // Reset results when classroom changes
          setResults({});
          setCurrentExamId(null);
        }
      } catch (error) {
        console.error("Failed to fetch students", error);
      }
    };

    fetchStudents();
  }, [selectedClassroom]);

  const handleCreateExam = async () => {
    if (!selectedClassroom || !examName || !examDate || !totalMarks) {
      toast({
        title: "Validation Error",
        description: "Please fill in all exam details",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('pragati_token');
      // We need teacherId, but the API might infer it from the token or we need to decode it.
      // The API doc says: "Teachers must match teacherId". 
      // Let's try to get it from the token payload if possible, or assume the backend handles it if we don't send it?
      // Actually, the API requires `teacherId` in the body.
      // We can decode the token to get the teacherId.
      
      const tokenPayload = JSON.parse(atob(token!.split('.')[1]));
      const teacherId = tokenPayload.teacherId;

      const res = await fetch(`${backendUrl}/api/assessments/exams`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          subjectId,
          teacherId,
          classroomId: selectedClassroom,
          name: examName,
          totalMarks: parseInt(totalMarks),
          examDate: format(examDate, 'yyyy-MM-dd')
        })
      });

      if (res.ok) {
        const data = await res.json();
        setCurrentExamId(data.id);
        toast({
          title: "Success",
          description: "Exam created successfully. Now enter results.",
        });
      } else {
        throw new Error("Failed to create exam");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create exam",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleScoreChange = (studentId: string, score: string) => {
    const numScore = parseFloat(score);
    let grade = '';
    
    if (!isNaN(numScore)) {
      const max = parseInt(totalMarks);
      const percentage = (numScore / max) * 100;
      
      if (percentage >= 90) grade = 'A+';
      else if (percentage >= 80) grade = 'A';
      else if (percentage >= 70) grade = 'B';
      else if (percentage >= 60) grade = 'C';
      else if (percentage >= 50) grade = 'D';
      else grade = 'F';
    }

    setResults(prev => ({
      ...prev,
      [studentId]: { score, grade }
    }));
  };

  const handleSubmitResults = async () => {
    if (!currentExamId) return;

    setSubmitting(true);
    try {
      const token = localStorage.getItem('pragati_token');
      const resultsArray = Object.entries(results).map(([studentId, data]) => ({
        studentId,
        score: parseFloat(data.score),
        grade: data.grade
      })).filter(r => !isNaN(r.score));

      const res = await fetch(`${backendUrl}/api/assessments/exam-results`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          examId: currentExamId,
          results: resultsArray
        })
      });

      if (res.ok) {
        toast({
          title: "Success",
          description: "Exam results saved successfully",
        });
        // Reset form
        setExamName("");
        setExamDate(undefined);
        setResults({});
        setCurrentExamId(null);
      } else {
        throw new Error("Failed to save results");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save results",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
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
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl" />
        
        <div className="relative z-10">
          <p className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/30 dark:bg-emerald-900/10 dark:text-emerald-400 mb-3">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Assessment Portal
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold mb-2">
            Exams & Results
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            Create new assessments and record student performance
          </p>
        </div>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column: Classroom & Exam Details */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-6 lg:col-span-1"
        >
          <Card className="border-2 border-gray-200 dark:border-gray-700 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-primary" />
                Exam Details
              </CardTitle>
              <CardDescription>Configure the assessment</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Classroom</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      className="w-full justify-between bg-gray-50 dark:bg-slate-900 border-gray-200 dark:border-gray-700"
                      disabled={!!currentExamId}
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

              <div className="space-y-2">
                <Label>Exam Name</Label>
                <Input 
                  placeholder="e.g. Midterm Math" 
                  value={examName}
                  onChange={(e) => setExamName(e.target.value)}
                  disabled={!!currentExamId}
                  className="bg-gray-50 dark:bg-slate-900 border-gray-200 dark:border-gray-700"
                />
              </div>

              <div className="space-y-2">
                <Label>Total Marks</Label>
                <Input 
                  type="number" 
                  value={totalMarks}
                  onChange={(e) => setTotalMarks(e.target.value)}
                  disabled={!!currentExamId}
                  className="bg-gray-50 dark:bg-slate-900 border-gray-200 dark:border-gray-700"
                />
              </div>

              <div className="space-y-2">
                <Label>Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal bg-gray-50 dark:bg-slate-900 border-gray-200 dark:border-gray-700",
                        !examDate && "text-muted-foreground"
                      )}
                      disabled={!!currentExamId}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {examDate ? format(examDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={examDate}
                      onSelect={setExamDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {!currentExamId && (
                <Button 
                  className="w-full bg-primary hover:bg-primary/90" 
                  onClick={handleCreateExam}
                  disabled={submitting}
                >
                  {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Exam
                </Button>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Right Column: Student List & Results */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2"
        >
          <Card className="h-full flex flex-col border-2 border-gray-200 dark:border-gray-700 shadow-sm">
            <CardHeader>
              <CardTitle>Student Results</CardTitle>
              <CardDescription>
                {currentExamId 
                  ? "Enter scores for each student below" 
                  : "Create an exam to start entering results"}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto">
              {currentExamId ? (
                <div className="rounded-md border border-gray-200 dark:border-gray-700">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50 dark:bg-slate-900 hover:bg-gray-50 dark:hover:bg-slate-900">
                        <TableHead>Roll No</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead className="w-[100px]">Score</TableHead>
                        <TableHead className="w-[80px]">Grade</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {students.map((student) => (
                        <TableRow key={student.id}>
                          <TableCell className="font-medium">{student.rollNumber}</TableCell>
                          <TableCell>{student.firstName} {student.lastName}</TableCell>
                          <TableCell>
                            <Input 
                              type="number" 
                              className="h-8 w-20 bg-white dark:bg-slate-950" 
                              value={results[student.id]?.score || ''}
                              onChange={(e) => handleScoreChange(student.id, e.target.value)}
                            />
                          </TableCell>
                          <TableCell>
                            <span className={cn(
                              "inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold",
                              results[student.id]?.grade === 'F' 
                                ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" 
                                : results[student.id]?.grade 
                                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                  : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                            )}>
                              {results[student.id]?.grade || '-'}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50/50 dark:bg-slate-900/50">
                  <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                    <Plus className="w-8 h-8 opacity-20" />
                  </div>
                  <p className="font-medium">No Exam Selected</p>
                  <p className="text-sm text-muted-foreground mt-1">Configure and create an exam to enter results</p>
                </div>
              )}
            </CardContent>
            {currentExamId && (
              <CardFooter className="border-t border-gray-200 dark:border-gray-700 pt-6 bg-gray-50/50 dark:bg-slate-900/50">
                <Button 
                  className="ml-auto bg-primary hover:bg-primary/90" 
                  onClick={handleSubmitResults}
                  disabled={submitting}
                >
                  {submitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Save Results
                </Button>
              </CardFooter>
            )}
          </Card>
        </motion.div>
      </div>
    </div>
  );
}