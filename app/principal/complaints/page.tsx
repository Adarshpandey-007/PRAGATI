'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  AlertCircle,
  Clock,
  CheckCircle,
  XCircle,
  Filter,
  Search,
  MessageSquare,
  User,
  Calendar,
  Eye,
  Edit,
} from 'lucide-react';
import { Language, translations, getTranslation } from '@/lib/translations';

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
  isAnonymous: boolean;
  student: {
    id: string;
    firstName: string;
    lastName: string;
    code: string;
  } | null;
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
  schoolId: string;
  total: number;
  items: Complaint[];
}

export default function ComplaintsPage() {
  const router = useRouter();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<ComplaintStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [resolutionNote, setResolutionNote] = useState('');
  const [newStatus, setNewStatus] = useState<ComplaintStatus>('open');
  const [isUpdating, setIsUpdating] = useState(false);
  const [lang, setLang] = useState<Language>('en');

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
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('pragati_token');
      const role = localStorage.getItem('pragati_role');
      const savedLang = localStorage.getItem('pragati_language') as Language;
      
      if (savedLang === 'en' || savedLang === 'pa' || savedLang === 'hi') {
        setLang(savedLang);
      }

      if (!token || role !== 'PRINCIPAL') {
        router.push('/login/principal');
        return;
      }

      fetchComplaints(token);
    }
  }, [router]);

  const fetchComplaints = async (token: string, status?: ComplaintStatus) => {
    setIsLoading(true);
    setError(null);

    try {
      const backendUrl = (process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:4000').replace(/\/$/, '');
      const url = status
        ? `${backendUrl}/api/complaints?status=${status}`
        : `${backendUrl}/api/complaints`;

      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          setError('Session expired. Please sign in again.');
          return;
        }
        setError('Unable to load complaints. Please try again.');
        return;
      }

      const data: ComplaintsResponse = await response.json();
      setComplaints(data.items);
    } catch (err) {
      setError('Unable to load complaints. Please try again.');
      console.error('Error fetching complaints:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateComplaint = async () => {
    if (!selectedComplaint) return;

    setIsUpdating(true);
    try {
      const token = localStorage.getItem('pragati_token');
      const backendUrl = (process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:4000').replace(/\/$/, '');

      const response = await fetch(`${backendUrl}/api/complaints/${selectedComplaint.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: newStatus,
          resolutionNote: resolutionNote.trim() || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update complaint');
      }

      // Refresh complaints list
      if (token) {
        await fetchComplaints(token, statusFilter !== 'all' ? statusFilter : undefined);
      }

      setSelectedComplaint(null);
      setResolutionNote('');
    } catch (err) {
      console.error('Error updating complaint:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleFilterChange = (status: ComplaintStatus | 'all') => {
    setStatusFilter(status);
    const token = localStorage.getItem('pragati_token');
    if (token) {
      fetchComplaints(token, status !== 'all' ? status : undefined);
    }
  };

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
        return 'bg-red-500/10 text-red-600 dark:text-red-400';
      case 'in_progress':
        return 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400';
      case 'resolved':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400';
      case 'dismissed':
        return 'bg-gray-500/10 text-gray-600 dark:text-gray-400';
    }
  };

  const getCategoryLabel = (category: ComplaintCategory) => {
    return category.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const filteredComplaints = complaints.filter((complaint) => {
    const searchLower = searchQuery.toLowerCase();
    const categoryMatch = getCategoryLabel(complaint.category).toLowerCase().includes(searchLower);
    const descriptionMatch = complaint.description.toLowerCase().includes(searchLower);
    const studentMatch = complaint.student
      ? `${complaint.student.firstName} ${complaint.student.lastName}`.toLowerCase().includes(searchLower)
      : false;

    return categoryMatch || descriptionMatch || studentMatch;
  });

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
          {/* Filters & Search */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row gap-4 items-center justify-between rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900 p-4 shadow-sm"
          >
            <div className="flex flex-wrap gap-2">
              {(['all', 'open', 'in_progress', 'resolved', 'dismissed'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => handleFilterChange(status)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    statusFilter === status
                      ? 'bg-primary text-white shadow-sm'
                      : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {status === 'all' ? 'All' : status.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                </button>
              ))}
            </div>

            <div className="w-full sm:w-72 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder={t('complaints', 'searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-slate-950 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-all"
              />
            </div>
          </motion.div>

          {/* Loading State */}
          {isLoading && (
            <div className="rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900 p-12 text-center">
              <div className="inline-block w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
              <p className="mt-4 text-sm text-muted-foreground">Loading complaints...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="rounded-xl border-2 border-red-100 bg-red-50 dark:bg-red-900/20 dark:border-red-900/30 p-6 text-center">
              <p className="text-sm text-red-600 dark:text-red-400 font-medium">{error}</p>
            </div>
          )}

          {/* Complaints List */}
          {!isLoading && !error && (
            <div className="space-y-3">
              {filteredComplaints.length === 0 ? (
                <div className="rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900 p-12 text-center">
                  <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
                    <AlertCircle className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">No complaints found</p>
                </div>
              ) : (
                filteredComplaints.map((complaint, index) => (
                  <motion.div
                    key={complaint.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900 p-4 sm:p-6 hover:shadow-md transition-all"
                  >
                    <div className="flex flex-col sm:flex-row gap-4">
                      {/* Status Icon */}
                      <div className={`flex-shrink-0 p-3 rounded-xl ${getStatusColor(complaint.status)} bg-opacity-10`}>
                        {getStatusIcon(complaint.status)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 space-y-3">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div>
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white">{getCategoryLabel(complaint.category)}</h3>
                            <p className="text-xs text-muted-foreground mt-1">
                              {complaint.classroom.grade.name} - {complaint.classroom.section.label}
                              {complaint.student && !complaint.isAnonymous && (
                                <> · <span className="font-medium text-gray-700 dark:text-gray-300">{complaint.student.firstName} {complaint.student.lastName}</span></>
                              )}
                              {complaint.isAnonymous && <> · <span className="italic">Anonymous</span></>}
                            </p>
                          </div>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${
                            complaint.status === 'open' 
                              ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800'
                              : complaint.status === 'in_progress'
                              ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800'
                              : complaint.status === 'resolved'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800'
                              : 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700'
                          }`}>
                            {complaint.status.split('_').join(' ')}
                          </span>
                        </div>

                        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed bg-gray-50 dark:bg-slate-950/50 p-3 rounded-lg border border-gray-100 dark:border-gray-800">
                          {complaint.description}
                        </p>

                        {complaint.resolutionNote && (
                          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-100 dark:bg-emerald-900/10 dark:border-emerald-900/20">
                            <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 mb-1 flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" /> Resolution Note
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-300">{complaint.resolutionNote}</p>
                          </div>
                        )}

                        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-gray-100 dark:border-gray-800 mt-2">
                          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            Submitted {new Date(complaint.createdAt).toLocaleDateString()}
                          </div>
                          <button
                            onClick={() => {
                              setSelectedComplaint(complaint);
                              setNewStatus(complaint.status);
                              setResolutionNote(complaint.resolutionNote || '');
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-medium hover:bg-primary/90 shadow-sm transition-all"
                          >
                            <Edit className="w-3 h-3" />
                            Update Status
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          )}
        </div>

      {/* Update Modal */}
      {selectedComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900 p-6 shadow-xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Update Complaint</h3>
              <button
                onClick={() => setSelectedComplaint(null)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
              >
                <XCircle className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as ComplaintStatus)}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-all"
                >
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="dismissed">Dismissed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Resolution Note</label>
                <textarea
                  value={resolutionNote}
                  onChange={(e) => setResolutionNote(e.target.value)}
                  rows={4}
                  placeholder="Add a note about the resolution..."
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary transition-all"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setSelectedComplaint(null)}
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-sm font-medium hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateComplaint}
                  disabled={isUpdating}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 shadow-sm transition-all disabled:opacity-50"
                >
                  {isUpdating ? 'Updating...' : 'Update Complaint'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
