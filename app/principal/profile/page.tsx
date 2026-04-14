'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Language, translations, getTranslation } from '@/lib/translations';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  School, 
  Calendar,
  Edit3,
  Save,
  X,
  Camera,
  Award,
  TrendingUp,
  Users,
  GraduationCap,
  BookOpen,
  AlertCircle,
  Shield
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface PrincipalProfileData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  qualification?: string;
  experience?: number;
  school?: {
    id: string;
    name: string;
    district?: string;
    address?: string;
  };
}

interface SchoolStats {
  totalStudents: number;
  totalTeachers: number;
  totalClassrooms: number;
  activeComplaints: number;
}

export default function PrincipalProfilePage() {
  const router = useRouter();
  const [profileData, setProfileData] = useState<PrincipalProfileData | null>(null);
  const [schoolStats, setSchoolStats] = useState<SchoolStats | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [userEmail, setUserEmail] = useState<string>('');
  const [editedData, setEditedData] = useState({
    phone: '',
    address: '',
  });
  const [activeTab, setActiveTab] = useState<'overview' | 'school' | 'stats'>('overview');
  const [lang, setLang] = useState<Language>('en');

  const t = (section: keyof typeof translations, key: string) => getTranslation(section, key, lang);

  const handleLanguageChange = (newLang: Language) => {
    setLang(newLang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('pragati_language', newLang);
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('pragati_token');
        const role = localStorage.getItem('pragati_role');
        const email = localStorage.getItem('pragati_name') || '';
        const savedLang = localStorage.getItem('pragati_language') as Language;
        
        if (savedLang === 'en' || savedLang === 'pa') {
          setLang(savedLang);
        }
        setUserEmail(email);

        if (!token || role !== 'PRINCIPAL') {
          router.push('/login/principal');
          return;
        }

        const backendUrl = (process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:4000').replace(/\/$/, '');

        // Fetch school and stats data
        const [studentsRes, teachersRes, classroomsRes, complaintsRes] = await Promise.all([
          fetch(`${backendUrl}/api/core/students`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${backendUrl}/api/core/teachers`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${backendUrl}/api/core/classrooms`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${backendUrl}/api/complaints`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        const students = studentsRes.ok ? await studentsRes.json() : [];
        const teachers = teachersRes.ok ? await teachersRes.json() : [];
        const classrooms = classroomsRes.ok ? await classroomsRes.json() : [];
        const complaintsData = complaintsRes.ok ? await complaintsRes.json() : { items: [] };
        
        // Handle both {items: []} and direct array responses
        const complaintsArray = Array.isArray(complaintsData) ? complaintsData : (complaintsData.items || []);
        const activeComplaints = complaintsArray.filter(
          (c: { status: string }) => c.status === 'open' || c.status === 'in_progress'
        ).length;

        setSchoolStats({
          totalStudents: Array.isArray(students) ? students.length : 0,
          totalTeachers: Array.isArray(teachers) ? teachers.length : 0,
          totalClassrooms: Array.isArray(classrooms) ? classrooms.length : 0,
          activeComplaints,
        });

        // Mock profile data
        setProfileData({
          id: '1',
          firstName: 'Principal',
          lastName: 'User',
          email: email,
          phone: '+91 98765 43210',
          qualification: 'Ph.D. in Education',
          experience: 15,
          school: {
            id: '1',
            name: 'Government Senior Secondary School',
            district: 'Ludhiana',
            address: 'Sector 32, Ludhiana, Punjab 141001'
          }
        });
        setEditedData({
          phone: '+91 98765 43210',
          address: 'Ludhiana, Punjab',
        });
      } catch (error) {
        console.error('Error fetching profile:', error);
        const email = localStorage.getItem('pragati_name') || '';
        setUserEmail(email);
        setProfileData({
          id: '1',
          firstName: 'Principal',
          lastName: 'User',
          email: email,
          qualification: 'Ph.D. in Education',
          experience: 15,
          school: {
            id: '1',
            name: 'Government Senior Secondary School',
            district: 'Ludhiana'
          }
        });
        setSchoolStats({
          totalStudents: 0,
          totalTeachers: 0,
          totalClassrooms: 0,
          activeComplaints: 0
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // API call would go here
      setProfileData(prev => prev ? { ...prev, ...editedData } : prev);
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setIsSaving(false);
      setIsEditing(false);
    }
  };

  const tabs = [
    { id: 'overview', label: t('profile', 'overview'), icon: User },
    { id: 'school', label: t('profile', 'schoolInfo'), icon: School },
    { id: 'stats', label: t('profile', 'statistics'), icon: TrendingUp },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen p-4 sm:p-6 lg:p-8">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-2xl p-6 mb-6"
        >
            <div className="flex flex-col sm:flex-row items-center gap-6">
              {/* Avatar */}
              <div className="relative group">
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-white text-3xl sm:text-4xl font-bold shadow-lg">
                  {profileData?.firstName?.charAt(0) || 'P'}{profileData?.lastName?.charAt(0) || 'U'}
                </div>
                <div className="absolute -bottom-1 -right-1 p-1.5 bg-amber-500 rounded-full">
                  <Shield className="w-4 h-4 text-white" />
                </div>
              </div>

              {/* Basic Info */}
              <div className="flex-1 text-center sm:text-left">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1">
                  {profileData?.firstName} {profileData?.lastName}
                </h1>
                <p className="text-muted-foreground mb-2 flex items-center justify-center sm:justify-start gap-2">
                  <Mail className="w-4 h-4" />
                  {userEmail || profileData?.email || 'Not provided'}
                </p>
                <p className="text-sm text-amber-600 dark:text-amber-400 font-medium flex items-center justify-center sm:justify-start gap-2">
                  <Shield className="w-4 h-4" />
                  Principal
                </p>

                {/* Quick Stats */}
                {schoolStats && (
                  <div className="flex flex-wrap justify-center sm:justify-start gap-4 mt-4">
                    <div className="flex items-center gap-2 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-full shadow-sm">
                      <GraduationCap className="w-4 h-4 text-blue-500" />
                      <span className="text-sm font-medium">{schoolStats.totalStudents} Students</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-full shadow-sm">
                      <Users className="w-4 h-4 text-green-500" />
                      <span className="text-sm font-medium">{schoolStats.totalTeachers} Teachers</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-full shadow-sm">
                      <BookOpen className="w-4 h-4 text-purple-500" />
                      <span className="text-sm font-medium">{schoolStats.totalClassrooms} Classrooms</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Edit Button */}
              <div className="sm:self-start">
                {isEditing ? (
                  <div className="flex gap-2">
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                    >
                      {isSaving ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      Save
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-slate-800 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                    Edit Profile
                  </button>
                )}
              </div>
            </div>
          </motion.div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                    activeTab === tab.id
                      ? 'bg-primary text-white shadow-md'
                      : 'bg-gray-100 dark:bg-slate-800 text-muted-foreground hover:bg-gray-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'overview' && (
              <div className="grid gap-6 md:grid-cols-2">
                {/* Personal Information */}
                <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-slate-800">
                  <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                    <User className="w-5 h-5 text-primary" />
                    Personal Information
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs text-muted-foreground uppercase tracking-wide">Full Name</label>
                      <p className="font-medium mt-1">{profileData?.firstName} {profileData?.lastName}</p>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground uppercase tracking-wide">Email Address</label>
                      <p className="font-medium mt-1 flex items-center gap-2">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        {userEmail || profileData?.email || 'Not provided'}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground uppercase tracking-wide">Phone Number</label>
                      {isEditing ? (
                        <input
                          type="tel"
                          value={editedData.phone}
                          onChange={(e) => {
                            const value = e.target.value.replace(/[^0-9+]/g, '');
                            setEditedData({ ...editedData, phone: value });
                          }}
                          className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                          placeholder="Enter phone number"
                        />
                      ) : (
                        <p className="font-medium mt-1 flex items-center gap-2">
                          <Phone className="w-4 h-4 text-muted-foreground" />
                          {profileData?.phone || 'Not provided'}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground uppercase tracking-wide">Address</label>
                      {isEditing ? (
                        <textarea
                          value={editedData.address}
                          onChange={(e) => setEditedData({ ...editedData, address: e.target.value })}
                          className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none"
                          rows={2}
                          placeholder="Enter address"
                        />
                      ) : (
                        <p className="font-medium mt-1 flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          {profileData?.address || 'Not provided'}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Professional Information */}
                <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-slate-800">
                  <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                    <Award className="w-5 h-5 text-primary" />
                    Professional Information
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs text-muted-foreground uppercase tracking-wide">Role</label>
                      <p className="font-medium mt-1 flex items-center gap-2">
                        <Shield className="w-4 h-4 text-amber-500" />
                        School Principal
                      </p>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground uppercase tracking-wide">Qualification</label>
                      <p className="font-medium mt-1">{profileData?.qualification || 'Not provided'}</p>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground uppercase tracking-wide">Experience</label>
                      <p className="font-medium mt-1">{profileData?.experience ? `${profileData.experience} Years` : 'Not provided'}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'school' && (
              <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-slate-800">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <School className="w-5 h-5 text-primary" />
                  School Information
                </h3>
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <label className="text-xs text-muted-foreground uppercase tracking-wide">School Name</label>
                    <p className="font-medium mt-1 text-lg">{profileData?.school?.name || 'Not assigned'}</p>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground uppercase tracking-wide">District</label>
                    <p className="font-medium mt-1">{profileData?.school?.district || 'Not provided'}</p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs text-muted-foreground uppercase tracking-wide">Address</label>
                    <p className="font-medium mt-1 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      {profileData?.school?.address || 'Not provided'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'stats' && schoolStats && (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0 }}
                  className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-xl p-6 border border-blue-500/20"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                      <GraduationCap className="w-6 h-6 text-blue-500" />
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{schoolStats.totalStudents}</p>
                  <p className="text-sm text-muted-foreground">Total Students</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 }}
                  className="bg-gradient-to-br from-green-500/10 to-green-600/10 rounded-xl p-6 border border-green-500/20"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                      <Users className="w-6 h-6 text-green-500" />
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{schoolStats.totalTeachers}</p>
                  <p className="text-sm text-muted-foreground">Total Teachers</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 rounded-xl p-6 border border-purple-500/20"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                      <BookOpen className="w-6 h-6 text-purple-500" />
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{schoolStats.totalClassrooms}</p>
                  <p className="text-sm text-muted-foreground">Total Classrooms</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                  className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 rounded-xl p-6 border border-orange-500/20"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center">
                      <AlertCircle className="w-6 h-6 text-orange-500" />
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{schoolStats.activeComplaints}</p>
                  <p className="text-sm text-muted-foreground">Active Complaints</p>
                </motion.div>
              </div>
            )}
          </motion.div>
      </div>
    </div>
  );
}