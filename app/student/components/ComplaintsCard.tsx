'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Plus, AlertCircle, Clock, CheckCircle, XCircle, Send, X } from 'lucide-react';

type ComplaintStatus = 'open' | 'in_progress' | 'resolved' | 'dismissed';

type ComplaintCategory =
  | 'lack_of_proper_drinking_water'
  | 'toilets'
  | 'girls_toilets'
  | 'liberty'
  | 'proper_electricity'
  | 'computers';

interface Complaint {
  id: string;
  category: ComplaintCategory;
  status: ComplaintStatus;
  description: string;
  student: {
    id: string;
    firstName: string;
    lastName: string;
    code: string;
  };
  classroom: {
    id: string;
    grade: { name: string };
    section: { label: string };
  };
  resolutionNote: string | null;
  resolvedBy: {
    id: string;
    role: string;
    email: string;
  } | null;
  createdAt: string;
  resolvedAt?: string;
}

interface ComplaintsResponse {
  total: number;
  items: Complaint[];
}

interface ComplaintsCardProps {
  language: 'en' | 'pa' | 'hi';
}

export function ComplaintsCard({ language }: ComplaintsCardProps) {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNewComplaint, setShowNewComplaint] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newComplaint, setNewComplaint] = useState({
    category: 'lack_of_proper_drinking_water' as ComplaintCategory,
    description: '',
    isAnonymous: false,
  });

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('pragati_token');

      if (!token) {
        setError('Authentication required');
        return;
      }

      const backendUrl = (process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:4000').replace(/\/$/, '');
      const response = await fetch(`${backendUrl}/api/complaints/mine`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          setError('Session expired. Please sign in again.');
          return;
        }
        setError('Unable to load complaints right now.');
        return;
      }

      const data: ComplaintsResponse = await response.json();
      setComplaints(data.items);
    } catch (err) {
      console.error('Error fetching complaints:', err);
      setError('Unable to load complaints');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitComplaint = async () => {
    if (!newComplaint.description.trim()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('pragati_token');
      const backendUrl = (process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:4000').replace(/\/$/, '');

      const response = await fetch(`${backendUrl}/api/complaints`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newComplaint),
      });

      if (!response.ok) {
        setError('Unable to submit complaint right now.');
        return;
      }

      // Reset form and refresh list
      setNewComplaint({
        category: 'lack_of_proper_drinking_water',
        description: '',
        isAnonymous: false,
      });
      setShowNewComplaint(false);
      await fetchComplaints();
    } catch (err) {
      console.error('Error submitting complaint:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const translations = {
    en: {
      title: 'Complaints',
      subtitle: 'Report issues',
      noComplaints: 'No complaints submitted yet',
      newComplaint: 'New Complaint',
      submit: 'Submit',
      submitting: 'Submitting...',
      cancel: 'Cancel',
      category: 'Category',
      description: 'Description',
      anonymous: 'Submit anonymously',
      status: 'Status',
      resolution: 'Resolution',
      categories: {
        lack_of_proper_drinking_water: 'Lack of proper drinking water',
        toilets: 'Toilets',
        girls_toilets: 'Girls Toilets',
        liberty: 'Liberty',
        proper_electricity: 'Proper Electricity',
        computers: 'Computers',
      },
      statuses: {
        open: 'Open',
        in_progress: 'In Progress',
        resolved: 'Resolved',
        dismissed: 'Dismissed',
      },
    },
    pa: {
      title: 'ਸ਼ਿਕਾਇਤਾਂ',
      subtitle: 'ਮੁੱਦਿਆਂ ਦੀ ਰਿਪੋਰਟ ਕਰੋ',
      noComplaints: 'ਅਜੇ ਤੱਕ ਕੋਈ ਸ਼ਿਕਾਇਤ ਦਰਜ ਨਹੀਂ ਕੀਤੀ ਗਈ',
      newComplaint: 'ਨਵੀਂ ਸ਼ਿਕਾਇਤ',
      submit: 'ਜਮ੍ਹਾਂ ਕਰੋ',
      submitting: 'ਜਮ੍ਹਾਂ ਕਰ ਰਿਹਾ ਹੈ...',
      cancel: 'ਰੱਦ ਕਰੋ',
      category: 'ਸ਼੍ਰੇਣੀ',
      description: 'ਵੇਰਵਾ',
      anonymous: 'ਗੁਮਨਾਮ ਤੌਰ \'ਤੇ ਜਮ੍ਹਾਂ ਕਰੋ',
      status: 'ਸਥਿਤੀ',
      resolution: 'ਹੱਲ',
      categories: {
        lack_of_proper_drinking_water: 'ਪੀਣ ਵਾਲੇ ਪਾਣੀ ਦੀ ਘਾਟ',
        toilets: 'ਪਖਾਨੇ',
        girls_toilets: 'ਲੜਕੀਆਂ ਦੇ ਪਖਾਨੇ',
        liberty: 'ਆਜ਼ਾਦੀ',
        proper_electricity: 'ਬਿਜਲੀ',
        computers: 'ਕੰਪਿਊਟਰ',
      },
      statuses: {
        open: 'ਖੁੱਲ੍ਹਾ',
        in_progress: 'ਪ੍ਰਗਤੀ ਵਿੱਚ',
        resolved: 'ਹੱਲ ਕੀਤਾ',
        dismissed: 'ਖਾਰਜ ਕੀਤਾ',
      },
    },
    hi: {
      title: 'शिकायतें',
      subtitle: 'समस्याओं की रिपोर्ट करें',
      noComplaints: 'अभी तक कोई शिकायत दर्ज नहीं की गई',
      newComplaint: 'नई शिकायत',
      submit: 'जमा करें',
      submitting: 'जमा कर रहा है...',
      cancel: 'रद्द करें',
      category: 'श्रेणी',
      description: 'विवरण',
      anonymous: 'गुमनाम रूप से जमा करें',
      status: 'स्थिति',
      resolution: 'समाधान',
      categories: {
        lack_of_proper_drinking_water: 'पीने के पानी की कमी',
        toilets: 'शौचालय',
        girls_toilets: 'लड़कियों के शौचालय',
        liberty: 'स्वतंत्रता',
        proper_electricity: 'उचित बिजली',
        computers: 'कंप्यूटर',
      },
      statuses: {
        open: 'खुला',
        in_progress: 'प्रगति पर',
        resolved: 'हल किया गया',
        dismissed: 'खारिज',
      },
    },
  };

  const t = translations[language];

  const getStatusIcon = (status: ComplaintStatus) => {
    switch (status) {
      case 'open':
        return <AlertCircle className="w-4 h-4" />;
      case 'in_progress':
        return <Clock className="w-4 h-4" />;
      case 'resolved':
        return <CheckCircle className="w-4 h-4" />;
      case 'dismissed':
        return <XCircle className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: ComplaintStatus) => {
    switch (status) {
      case 'open':
        return 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20';
      case 'in_progress':
        return 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20';
      case 'resolved':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
      case 'dismissed':
        return 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20';
    }
  };

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-900 p-6 shadow-sm"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500 to-rose-500 text-white">
            <MessageSquare className="w-5 h-5" />
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
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-900 p-6 hover:border-primary hover:shadow-md transition-all duration-200"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500 to-rose-500 text-white shadow-sm">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-semibold">{t.title}</h3>
              <p className="text-xs text-muted-foreground">{complaints.length} total</p>
            </div>
          </div>
          <button
            onClick={() => setShowNewComplaint(true)}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-medium hover:bg-primary/90 transition shadow-md"
          >
            <Plus className="w-3.5 h-3.5" />
            {t.newComplaint}
          </button>
        </div>

        {/* Complaints List */}
        {error ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <AlertCircle className="w-12 h-12 text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
        ) : complaints.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <MessageSquare className="w-12 h-12 text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">{t.noComplaints}</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {complaints.map((complaint) => (
              <div
                key={complaint.id}
                className="p-4 rounded-lg bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="text-sm font-semibold flex-1">
                    {t.categories[complaint.category]}
                  </h4>
                  <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium border ${getStatusColor(complaint.status)}`}>
                    {getStatusIcon(complaint.status)}
                    {t.statuses[complaint.status]}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mb-2">{complaint.description}</p>
                {complaint.resolutionNote && (
                  <div className="mt-2 p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-900/30">
                    <p className="text-[10px] font-medium text-emerald-700 dark:text-emerald-400 mb-1">
                      {t.resolution}:
                    </p>
                    <p className="text-xs text-foreground">{complaint.resolutionNote}</p>
                  </div>
                )}
                <p className="text-[10px] text-muted-foreground mt-2">
                  {new Date(complaint.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* New Complaint Modal */}
      <AnimatePresence>
        {showNewComplaint && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-900 p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">{t.newComplaint}</h3>
                <button
                  onClick={() => setShowNewComplaint(false)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-2">
                    {t.category}
                  </label>
                  <select
                    value={newComplaint.category}
                    onChange={(e) => setNewComplaint({ ...newComplaint, category: e.target.value as ComplaintCategory })}
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    {Object.entries(t.categories).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-2">
                    {t.description}
                  </label>
                  <textarea
                    value={newComplaint.description}
                    onChange={(e) => setNewComplaint({ ...newComplaint, description: e.target.value })}
                    rows={4}
                    placeholder="Describe the issue in detail..."
                    className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="anonymous"
                    checked={newComplaint.isAnonymous}
                    onChange={(e) => setNewComplaint({ ...newComplaint, isAnonymous: e.target.checked })}
                    className="rounded border-gray-300 dark:border-gray-700"
                  />
                  <label htmlFor="anonymous" className="text-xs text-muted-foreground">
                    {t.anonymous}
                  </label>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setShowNewComplaint(false)}
                    className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                  >
                    {t.cancel}
                  </button>
                  <button
                    onClick={handleSubmitComplaint}
                    disabled={isSubmitting || !newComplaint.description.trim()}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {isSubmitting ? t.submitting : t.submit}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
