'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, AlertCircle, Info, Megaphone } from 'lucide-react';

interface Notification {
  id: string;
  title: string;
  body: string;
  category: string;
  priority: number;
  activeTill: string;
  targets?: Array<{
    type: string;
    studentId?: string;
    classroomId?: string;
  }>;
}

interface NotificationsCardProps {
  language: 'en' | 'pa' | 'hi';
}

export function NotificationsCard({ language }: NotificationsCardProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('pragati_token');

      if (!token) {
        setError('Authentication required');
        return;
      }

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
      console.error('Error fetching notifications:', err);
      setError('Unable to load notifications');
    } finally {
      setIsLoading(false);
    }
  };

  const translations = {
    en: {
      title: 'Notifications',
      subtitle: 'Important updates',
      noNotifications: 'No new notifications',
      expiresOn: 'Expires on',
      priority: 'Priority',
      general: 'General',
      urgent: 'Urgent',
      announcement: 'Announcement',
    },
    pa: {
      title: 'ਸੂਚਨਾਵਾਂ',
      subtitle: 'ਮਹੱਤਵਪੂਰਨ ਅੱਪਡੇਟ',
      noNotifications: 'ਕੋਈ ਨਵੀਂ ਸੂਚਨਾ ਨਹੀਂ',
      expiresOn: 'ਸਮਾਪਤ ਹੁੰਦੀ ਹੈ',
      priority: 'ਤਰਜੀਹ',
      general: 'ਆਮ',
      urgent: 'ਜ਼ਰੂਰੀ',
      announcement: 'ਘੋਸ਼ਣਾ',
    },
    hi: {
      title: 'सूचनाएं',
      subtitle: 'महत्वपूर्ण अपडेट',
      noNotifications: 'कोई नई सूचना नहीं',
      expiresOn: 'समाप्त होती है',
      priority: 'प्राथमिकता',
      general: 'सामान्य',
      urgent: 'अत्यावश्यक',
      announcement: 'घोषणा',
    },
  };

  const t = translations[language];

  const getPriorityColor = (priority: number) => {
    if (priority >= 4) {
      return 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20';
    } else if (priority >= 3) {
      return 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20';
    } else {
      return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
    }
  };

  const getPriorityLabel = (priority: number) => {
    if (priority >= 4) return t.urgent;
    if (priority >= 3) return t.announcement;
    return t.general;
  };

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-900 p-6 shadow-sm"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 text-white">
            <Bell className="w-5 h-5" />
          </div>
          <h3 className="text-base sm:text-lg font-semibold">{t.title}</h3>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="inline-block w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-900 p-6 hover:border-primary hover:shadow-md transition-all duration-200"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-sm">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-semibold">{t.title}</h3>
            <p className="text-xs text-muted-foreground">{notifications.length} active</p>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      {error ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <AlertCircle className="w-12 h-12 text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      ) : notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Bell className="w-12 h-12 text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground">{t.noNotifications}</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {notifications.slice(0, 5).map((notification) => (
            <div
              key={notification.id}
              className="p-4 rounded-lg bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-slate-700 transition"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-start gap-2 flex-1">
                  {notification.priority >= 4 ? (
                    <Megaphone className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                  ) : (
                    <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold">{notification.title}</h4>
                  </div>
                </div>
                <span className={`flex-shrink-0 px-2 py-1 rounded-full text-[10px] font-medium border ${getPriorityColor(notification.priority)}`}>
                  {getPriorityLabel(notification.priority)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mb-2 ml-6">{notification.body}</p>
              <p className="text-[10px] text-muted-foreground ml-6">
                {t.expiresOn}: {new Date(notification.activeTill).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
