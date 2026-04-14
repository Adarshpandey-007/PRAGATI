'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Language, translations, getTranslation } from '@/lib/translations';
import { motion } from 'framer-motion';
import {
  Bell,
  Plus,
  Send,
  Calendar,
  Users,
  AlertCircle,
  Info,
  Megaphone,
  X,
  Clock,
} from 'lucide-react';

type NotificationCategory = 'general' | 'academic' | 'event' | 'urgent';

interface Notification {
  id: string;
  schoolId: string;
  title: string;
  body: string;
  category: NotificationCategory;
  priority: number;
  isPublic: boolean;
  activeFrom: string;
  activeTill: string;
  createdAt: string;
  targets?: Array<{
    type: string;
    studentId?: string;
    classroomId?: string;
  }>;
}

interface NotificationsResponse {
  total: number;
  items: Notification[];
}

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [lang, setLang] = useState<Language>('en');

  const t = (section: keyof typeof translations, key: string) => getTranslation(section, key, lang);

  const handleLanguageChange = (newLang: Language) => {
    setLang(newLang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('pragati_language', newLang);
    }
  };

  // Form state
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [category, setCategory] = useState<NotificationCategory>('general');
  const [priority, setPriority] = useState(2);
  const [isPublic, setIsPublic] = useState(true);
  const [activeFrom, setActiveFrom] = useState('');
  const [activeTill, setActiveTill] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('pragati_token');
      const role = localStorage.getItem('pragati_role');
      const savedLang = localStorage.getItem('pragati_language') as Language;
      if (savedLang === 'en' || savedLang === 'pa' || savedLang === 'hi') setLang(savedLang);

      if (!token || role !== 'PRINCIPAL') {
        router.push('/login/principal');
        return;
      }

      fetchNotifications(token);

      // Set default dates
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const nextWeek = new Date(now);
      nextWeek.setDate(nextWeek.getDate() + 7);

      setActiveFrom(now.toISOString().slice(0, 16));
      setActiveTill(nextWeek.toISOString().slice(0, 16));
    }
  }, [router]);

  const fetchNotifications = async (token: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const backendUrl = (process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:4000').replace(/\/$/, '');
      const response = await fetch(`${backendUrl}/api/communications/notifications/active`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }

      const data = await response.json();
      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Unable to load notifications. Please try again.');
      console.error('Error fetching notifications:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNotification = async () => {
    if (!title.trim() || !body.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('pragati_token');
      const userId = localStorage.getItem('pragati_userId');
      const backendUrl = (process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:4000').replace(/\/$/, '');

      const payload = {
        schoolId: '1', // This would come from the authenticated user's school
        title,
        body,
        category,
        priority,
        isPublic,
        activeFrom,
        activeTill,
        createdBy: userId || '1',
        targets: isPublic
          ? undefined
          : {
              studentIds: [],
              studentGroupIds: [],
              teacherIds: [],
              classroomIds: [],
            },
      };

      const response = await fetch(`${backendUrl}/api/communications/notifications`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to create notification');
      }

      // Reset form and close modal
      setTitle('');
      setBody('');
      setCategory('general');
      setPriority(2);
      setIsPublic(true);
      setShowCreateModal(false);

      // Refresh notifications
      if (token) {
        await fetchNotifications(token);
      }
    } catch (err) {
      console.error('Error creating notification:', err);
      setError('Failed to create notification. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCategoryIcon = (cat: NotificationCategory) => {
    switch (cat) {
      case 'general':
        return <Info className="w-4 h-4" />;
      case 'academic':
        return <AlertCircle className="w-4 h-4" />;
      case 'event':
        return <Calendar className="w-4 h-4" />;
      case 'urgent':
        return <Megaphone className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (cat: NotificationCategory) => {
    switch (cat) {
      case 'general':
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400';
      case 'academic':
        return 'bg-purple-500/10 text-purple-600 dark:text-purple-400';
      case 'event':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400';
      case 'urgent':
        return 'bg-red-500/10 text-red-600 dark:text-red-400';
    }
  };

  const getPriorityColor = (pri: number) => {
    if (pri >= 4) return 'bg-red-500/20 text-red-700 dark:text-red-400';
    if (pri >= 3) return 'bg-orange-500/20 text-orange-700 dark:text-orange-400';
    return 'bg-gray-500/20 text-gray-700 dark:text-gray-400';
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Actions Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row gap-4 items-center justify-between rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900 p-4 shadow-sm"
        >
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Bell className="w-4 h-4" />
            <span>{notifications.length} Active Notification{notifications.length !== 1 ? 's' : ''}</span>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            Create Notification
          </button>
          </motion.div>

          {/* Loading State */}
          {isLoading && (
            <div className="rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900 p-12 text-center">
              <div className="inline-block w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
              <p className="mt-4 text-sm text-muted-foreground">Loading notifications...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="rounded-xl border-2 border-red-100 bg-red-50 dark:bg-red-900/20 dark:border-red-900/30 p-6 text-center">
              <p className="text-sm text-red-600 dark:text-red-400 font-medium">{error}</p>
            </div>
          )}

          {/* Notifications List */}
          {!isLoading && !error && (
            <div className="space-y-4">
              {notifications.length === 0 ? (
                <div className="rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900 p-12 text-center">
                  <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
                    <Bell className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">No active notifications</p>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Create your first notification
                  </button>
                </div>
              ) : (
                notifications.map((notification, index) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900 p-5 sm:p-6 hover:shadow-md transition-all"
                  >
                    <div className="flex gap-4">
                      {/* Icon */}
                      <div className={`flex-shrink-0 p-3 rounded-xl ${getCategoryColor(notification.category)} bg-opacity-10`}>
                        {getCategoryIcon(notification.category)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                          <h3 className="text-base font-bold text-gray-900 dark:text-white">{notification.title}</h3>
                          <div className="flex gap-2">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${
                                notification.category === 'urgent'
                                  ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800'
                                  : notification.category === 'academic'
                                  ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800'
                                  : notification.category === 'event'
                                  ? 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800'
                                  : 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700'
                              }`}
                            >
                              {notification.category}
                            </span>
                            {notification.priority >= 3 && (
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${getPriorityColor(notification.priority)}`}>
                                Priority {notification.priority}
                              </span>
                            )}
                          </div>
                        </div>

                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 leading-relaxed">
                          {notification.body}
                        </p>

                        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-2 border-t border-gray-100 dark:border-gray-800">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            Active until {new Date(notification.activeTill).toLocaleDateString()}
                          </div>
                          {notification.isPublic && (
                            <div className="flex items-center gap-1.5">
                              <Users className="w-3.5 h-3.5" />
                              Public Announcement
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Create Notification Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-2xl rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900 p-6 shadow-xl my-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Create Notification</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Notification title..."
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Message</label>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={4}
                  placeholder="Notification message..."
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as NotificationCategory)}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-all"
                  >
                    <option value="general">General</option>
                    <option value="academic">Academic</option>
                    <option value="event">Event</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Priority (1-5)</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={priority}
                    onChange={(e) => setPriority(Number(e.target.value))}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Active From</label>
                  <input
                    type="datetime-local"
                    value={activeFrom}
                    onChange={(e) => setActiveFrom(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Active Until</label>
                  <input
                    type="datetime-local"
                    value={activeTill}
                    onChange={(e) => setActiveTill(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-all"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-gray-800">
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <label htmlFor="isPublic" className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                  Make this notification public (visible to everyone)
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-sm font-medium hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateNotification}
                  disabled={isSubmitting || !title.trim() || !body.trim()}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 shadow-sm transition-all disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  {isSubmitting ? 'Sending...' : 'Send Notification'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
