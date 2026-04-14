"use client";

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Bell, Calendar, Check, ChevronsUpDown, Loader2, Plus, Send, X } from 'lucide-react';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";

interface Notification {
  id: string;
  title: string;
  body: string;
  category: string;
  priority: number;
  createdAt?: string;
  activeFrom?: string;
}

interface Classroom {
  id: string;
  grade?: { name?: string };
  section?: { label?: string };
}

export default function NotificationsPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const backendUrl = (process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:4000').replace(/\/$/, '');

  // Form State
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState("general");
  const [priority, setPriority] = useState("1");
  const [selectedClassroom, setSelectedClassroom] = useState<string>("");
  const formatNotificationDate = (notification: Notification) => {
    const rawDate = notification.createdAt || notification.activeFrom;
    if (!rawDate) return 'Unknown date';

    const parsed = new Date(rawDate);
    if (Number.isNaN(parsed.getTime())) return 'Unknown date';

    return format(parsed, 'MMM d, h:mm a');
  };
  const formatClassroomLabel = (classroom?: Classroom) => {
    if (!classroom) return 'Select audience...';
    const gradeName = classroom.grade?.name;
    const sectionLabel = classroom.section?.label;
    if (gradeName && sectionLabel) return `${gradeName} ${sectionLabel}`;
    if (gradeName) return gradeName;
    return `Classroom ${classroom.id}`;
  };

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('pragati_token');
      if (!token) return;

      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

      const [notifRes, classRes] = await Promise.all([
        fetch(`${backendUrl}/api/communications/notifications/active`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`${backendUrl}/api/reports/attendance/teacher?start=${start}&end=${end}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      if (notifRes.ok) {
        const data = await notifRes.json();
        const normalizedNotifications: Notification[] = (Array.isArray(data) ? data : []).map((n: any) => ({
          id: String(n.id || crypto.randomUUID()),
          title: String(n.title || 'Untitled notification'),
          body: String(n.body || ''),
          category: String(n.category || 'general'),
          priority: typeof n.priority === 'number' ? n.priority : Number(n.priority || 1),
          createdAt: typeof n.createdAt === 'string' ? n.createdAt : undefined,
          activeFrom: typeof n.activeFrom === 'string' ? n.activeFrom : undefined,
        }));
        setNotifications(normalizedNotifications);
      }

      if (classRes.ok) {
        const data = await classRes.json();
        if (data.classrooms) {
          const mappedClassrooms: Classroom[] = data.classrooms
            .map((c: any) => ({
              id: String(c.id || c.classroomId || ''),
              grade: c.grade || { name: `Classroom ${String(c.id || c.classroomId || '')}` },
              section: c.section || { label: '' },
            }))
            .filter((c: Classroom) => c.id);

          setClassrooms(mappedClassrooms);
        }
      }
    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async () => {
    if (!title || !body || !selectedClassroom) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('pragati_token');
      const tokenPayload = JSON.parse(atob(token!.split('.')[1]));
      
      // Default active dates (now to 7 days later)
      const now = new Date();
      const nextWeek = new Date();
      nextWeek.setDate(now.getDate() + 7);

      const payload = {
        schoolId: tokenPayload.schoolId,
        title,
        body,
        category,
        priority: parseInt(priority),
        activeFrom: now.toISOString(),
        activeTill: nextWeek.toISOString(),
        isPublic: false,
        createdBy: tokenPayload.teacherId || tokenPayload.userId,
        targets: {
          classroomIds: [selectedClassroom],
          studentIds: [],
          studentGroupIds: [],
          teacherIds: []
        }
      };

      const res = await fetch(`${backendUrl}/api/communications/notifications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        toast({
          title: "Success",
          description: "Notification sent successfully",
        });
        setIsCreateOpen(false);
        // Reset form
        setTitle("");
        setBody("");
        setCategory("general");
        setPriority("1");
        setSelectedClassroom("");
        // Refresh list
        fetchData();
      } else {
        throw new Error("Failed to create notification");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send notification",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getPriorityColor = (p: number) => {
    if (p >= 3) return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
    if (p === 2) return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
    return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
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
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl" />
        
        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <p className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] border border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/30 dark:bg-blue-900/10 dark:text-blue-400 mb-3">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
              Communication Center
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold mb-2">
              Notifications
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground">
              Send announcements and view recent alerts
            </p>
          </div>

          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20">
                <Plus className="w-4 h-4 mr-2" />
                New Notification
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Create Notification</DialogTitle>
                <DialogDescription>
                  Send a new notification to students or classrooms.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="target">Target Audience</Label>
                  <Select value={selectedClassroom} onValueChange={setSelectedClassroom}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select audience..." />
                    </SelectTrigger>
                    <SelectContent>
                      {classrooms.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {formatClassroomLabel(c)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Assignment Due Tomorrow"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="academic">Academic</SelectItem>
                      <SelectItem value="exam">Exam</SelectItem>
                      <SelectItem value="emergency">Emergency</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="body">Message</Label>
                  <Textarea
                    id="body"
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="Type your message here..."
                    rows={4}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                <Button onClick={handleCreate} disabled={submitting}>
                  {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Send Notification
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Notifications List */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-3"
        >
          <Card className="border-2 border-gray-200 dark:border-gray-700 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-primary" />
                Recent History
              </CardTitle>
              <CardDescription>
                Notifications sent in the last 30 days
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px] pr-4">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-12">
                    <Bell className="w-12 h-12 mb-4 opacity-20" />
                    <p>No notifications found</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className="flex items-start gap-4 p-4 rounded-lg border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-slate-900/50 hover:bg-gray-50 dark:hover:bg-slate-900 transition-colors"
                      >
                        <div className={cn(
                          "p-2 rounded-full shrink-0",
                          notification.category === 'emergency' ? "bg-red-100 text-red-600" :
                          notification.category === 'exam' ? "bg-amber-100 text-amber-600" :
                          "bg-blue-100 text-blue-600"
                        )}>
                          <Bell className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-semibold text-sm truncate">{notification.title}</h4>
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                              {formatNotificationDate(notification)}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {notification.body}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="secondary" className="text-[10px] uppercase">
                              {notification.category}
                            </Badge>
                            {notification.priority > 1 && (
                              <Badge variant="destructive" className="text-[10px]">
                                High Priority
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}