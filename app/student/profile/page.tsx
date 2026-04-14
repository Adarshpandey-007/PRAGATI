'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  School, 
  BookOpen, 
  Calendar,
  Edit3,
  Save,
  X,
  Camera,
  Award,
  TrendingUp,
  Clock,
  CheckCircle,
  ArrowLeft,
  Flame,
  Target,
  Star
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useStudent } from '../context/StudentContext';

interface StudentProfileData {
  id: string;
  firstName: string;
  lastName: string;
  code: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  address?: string;
  guardianName?: string;
  guardianPhone?: string;
  classroom: {
    id: string;
    academicYear?: string;
    grade: { id?: string; name: string; level?: number };
    section: { id?: string; label: string };
  };
  school?: {
    id: string;
    name: string;
    district?: string;
  };
}

interface AttendanceStats {
  totalDays: number;
  presentDays: number;
  absentDays: number;
  percentage: number;
}

export default function StudentProfilePage() {
  const router = useRouter();
  const { studentProfile, language } = useStudent();
  const [profileData, setProfileData] = useState<StudentProfileData | null>(null);
  const [attendanceStats, setAttendanceStats] = useState<AttendanceStats | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editedData, setEditedData] = useState({
    phone: '',
    address: '',
  });
  const [activeTab, setActiveTab] = useState<'overview' | 'academics' | 'achievements'>('overview');

  const translations = {
    en: {
      profile: 'My Profile',
      back: 'Back to Dashboard',
      overview: 'Overview',
      academics: 'Academics',
      achievements: 'Achievements',
      personalInfo: 'Personal Information',
      academicInfo: 'Academic Information',
      contactInfo: 'Contact Information',
      guardianInfo: 'Guardian Information',
      attendanceStats: 'Attendance Statistics',
      firstName: 'First Name',
      lastName: 'Last Name',
      rollNo: 'Roll Number',
      email: 'Email Address',
      phone: 'Phone Number',
      dob: 'Date of Birth',
      address: 'Address',
      guardianName: 'Guardian Name',
      guardianPhone: 'Guardian Phone',
      school: 'School',
      class: 'Class',
      section: 'Section',
      academicYear: 'Academic Year',
      edit: 'Edit Profile',
      save: 'Save Changes',
      cancel: 'Cancel',
      totalDays: 'Total Days',
      present: 'Present',
      absent: 'Absent',
      attendance: 'Attendance',
      loading: 'Loading profile...',
      noEmail: 'Not provided',
      homeworkStreak: 'Homework Streak',
      currentStreak: 'Current Streak',
      longestStreak: 'Longest Streak',
      days: 'days',
      keepItUp: 'Keep it up!',
      startStreak: 'Start your streak today!',
      recentAchievements: 'Recent Achievements',
      noAchievements: 'Complete homework to earn achievements!',
    },
    pa: {
      profile: 'ਮੇਰਾ ਪ੍ਰੋਫਾਈਲ',
      back: 'ਡੈਸ਼ਬੋਰਡ ਤੇ ਵਾਪਸ',
      overview: 'ਸੰਖੇਪ ਜਾਣਕਾਰੀ',
      academics: 'ਅਕਾਦਮਿਕ',
      achievements: 'ਪ੍ਰਾਪਤੀਆਂ',
      personalInfo: 'ਨਿੱਜੀ ਜਾਣਕਾਰੀ',
      academicInfo: 'ਅਕਾਦਮਿਕ ਜਾਣਕਾਰੀ',
      contactInfo: 'ਸੰਪਰਕ ਜਾਣਕਾਰੀ',
      guardianInfo: 'ਸਰਪ੍ਰਸਤ ਜਾਣਕਾਰੀ',
      attendanceStats: 'ਹਾਜ਼ਰੀ ਅੰਕੜੇ',
      firstName: 'ਪਹਿਲਾ ਨਾਮ',
      lastName: 'ਆਖਰੀ ਨਾਮ',
      rollNo: 'ਰੋਲ ਨੰਬਰ',
      email: 'ਈਮੇਲ ਪਤਾ',
      phone: 'ਫ਼ੋਨ ਨੰਬਰ',
      dob: 'ਜਨਮ ਮਿਤੀ',
      address: 'ਪਤਾ',
      guardianName: 'ਸਰਪ੍ਰਸਤ ਦਾ ਨਾਮ',
      guardianPhone: 'ਸਰਪ੍ਰਸਤ ਦਾ ਫ਼ੋਨ',
      school: 'ਸਕੂਲ',
      class: 'ਕਲਾਸ',
      section: 'ਸੈਕਸ਼ਨ',
      academicYear: 'ਅਕਾਦਮਿਕ ਸਾਲ',
      edit: 'ਪ੍ਰੋਫਾਈਲ ਸੋਧੋ',
      save: 'ਤਬਦੀਲੀਆਂ ਸੇਵ ਕਰੋ',
      cancel: 'ਰੱਦ ਕਰੋ',
      totalDays: 'ਕੁੱਲ ਦਿਨ',
      present: 'ਹਾਜ਼ਰ',
      absent: 'ਗੈਰਹਾਜ਼ਰ',
      attendance: 'ਹਾਜ਼ਰੀ',
      loading: 'ਪ੍ਰੋਫਾਈਲ ਲੋਡ ਹੋ ਰਿਹਾ ਹੈ...',
      noEmail: 'ਪ੍ਰਦਾਨ ਨਹੀਂ ਕੀਤਾ',
      homeworkStreak: 'ਹੋਮਵਰਕ ਸਟ੍ਰੀਕ',
      currentStreak: 'ਮੌਜੂਦਾ ਸਟ੍ਰੀਕ',
      longestStreak: 'ਸਭ ਤੋਂ ਲੰਬੀ ਸਟ੍ਰੀਕ',
      days: 'ਦਿਨ',
      keepItUp: 'ਜਾਰੀ ਰੱਖੋ!',
      startStreak: 'ਅੱਜ ਆਪਣੀ ਸਟ੍ਰੀਕ ਸ਼ੁਰੂ ਕਰੋ!',
      recentAchievements: 'ਹਾਲੀਆ ਪ੍ਰਾਪਤੀਆਂ',
      noAchievements: 'ਪ੍ਰਾਪਤੀਆਂ ਕਮਾਉਣ ਲਈ ਹੋਮਵਰਕ ਪੂਰਾ ਕਰੋ!',
    },
    hi: {
      profile: 'मेरी प्रोफ़ाइल',
      back: 'डैशबोर्ड पर वापस',
      overview: 'अवलोकन',
      academics: 'शैक्षणिक',
      achievements: 'उपलब्धियाँ',
      personalInfo: 'व्यक्तिगत जानकारी',
      academicInfo: 'शैक्षणिक जानकारी',
      contactInfo: 'संपर्क जानकारी',
      guardianInfo: 'अभिभावक जानकारी',
      attendanceStats: 'उपस्थिति आँकड़े',
      firstName: 'पहला नाम',
      lastName: 'अंतिम नाम',
      rollNo: 'रोल नंबर',
      email: 'ईमेल पता',
      phone: 'फ़ोन नंबर',
      dob: 'जन्म तिथि',
      address: 'पता',
      guardianName: 'अभिभावक का नाम',
      guardianPhone: 'अभिभावक का फ़ोन',
      school: 'स्कूल',
      class: 'कक्षा',
      section: 'अनुभाग',
      academicYear: 'शैक्षणिक वर्ष',
      edit: 'प्रोफ़ाइल संपादित करें',
      save: 'परिवर्तन सहेजें',
      cancel: 'रद्द करें',
      totalDays: 'कुल दिन',
      present: 'उपस्थित',
      absent: 'अनुपस्थित',
      attendance: 'उपस्थिति',
      loading: 'प्रोफ़ाइल लोड हो रही है...',
      noEmail: 'प्रदान नहीं किया गया',
      homeworkStreak: 'होमवर्क स्ट्रीक',
      currentStreak: 'वर्तमान स्ट्रीक',
      longestStreak: 'सबसे लंबी स्ट्रीक',
      days: 'दिन',
      keepItUp: 'जारी रखो!',
      startStreak: 'आज अपनी स्ट्रीक शुरू करो!',
      recentAchievements: 'हालिया उपलब्धियाँ',
      noAchievements: 'उपलब्धियाँ अर्जित करने के लिए होमवर्क पूरा करें!',
    },
  };

  const t = translations[language];

  // Mock homework streak data (would come from API)
  const [homeworkStreak, setHomeworkStreak] = useState({
    currentStreak: 7,
    longestStreak: 14,
    lastSubmission: new Date().toISOString(),
  });

  // Get the logged-in user's email from localStorage (this is their actual email)
  const [userEmail, setUserEmail] = useState<string>('');

  useEffect(() => {
    // Get the email the user logged in with
    if (typeof window !== 'undefined') {
      const storedEmail = localStorage.getItem('pragati_name'); // This stores the login email
      if (storedEmail) {
        setUserEmail(storedEmail);
      }
    }
    fetchProfileData();
    fetchAttendanceStats();
  }, []);

  const fetchProfileData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('pragati_token');
      const studentId = localStorage.getItem('pragati_studentId');
      
      if (!token || !studentId) return;

      const backendUrl = (process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:4000').replace(/\/$/, '');
      const response = await fetch(`${backendUrl}/api/core/students/${studentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setProfileData(data);
        setEditedData({
          phone: data.phone || '',
          address: data.address || '',
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAttendanceStats = async () => {
    try {
      const token = localStorage.getItem('pragati_token');
      const studentId = localStorage.getItem('pragati_studentId');
      
      if (!token || !studentId) return;

      const backendUrl = (process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:4000').replace(/\/$/, '');
      const response = await fetch(`${backendUrl}/api/attendance/student/${studentId}/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setAttendanceStats(data);
      }
    } catch (error) {
      console.error('Error fetching attendance stats:', error);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // In a real app, this would save to the backend
      // For now, just simulate a save
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const getAttendanceColor = (percentage: number) => {
    if (percentage >= 90) return 'text-emerald-600 dark:text-emerald-400';
    if (percentage >= 75) return 'text-amber-600 dark:text-amber-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getStreakColor = (streak: number) => {
    if (streak >= 7) return 'from-orange-500 to-red-500';
    if (streak >= 3) return 'from-amber-500 to-orange-500';
    return 'from-gray-400 to-gray-500';
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="inline-block w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4" />
            <p className="text-muted-foreground">{t.loading}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back Button */}
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => router.push('/student')}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition"
      >
        <ArrowLeft className="w-4 h-4" />
        {t.back}
      </motion.button>

      {/* Profile Header Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900 shadow-sm"
      >
        {/* Cover gradient */}
        <div className="h-32 bg-gradient-to-r from-primary via-purple-500 to-pink-500" />
        
        <div className="px-6 pb-6">
          {/* Avatar */}
          <div className="relative -mt-16 mb-4">
            <div className="w-28 h-28 rounded-full border-4 border-white dark:border-slate-900 bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
              {profileData?.firstName?.[0]}{profileData?.lastName?.[0]}
            </div>
            <button className="absolute bottom-0 right-0 p-2 rounded-full bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-gray-700 shadow-md hover:bg-gray-50 dark:hover:bg-slate-700 transition">
              <Camera className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          {/* Name and basic info */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {profileData?.firstName} {profileData?.lastName}
              </h1>
              <p className="text-muted-foreground flex items-center gap-2 mt-1">
                <School className="w-4 h-4" />
                {profileData?.classroom?.grade?.name} - {profileData?.classroom?.section?.label} · Roll No: {profileData?.code}
              </p>
              {profileData?.school && (
                <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                  <MapPin className="w-4 h-4" />
                  {profileData.school.name}
                </p>
              )}
            </div>
            
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                isEditing
                  ? 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                  : 'bg-primary text-white hover:bg-primary/90'
              }`}
            >
              {isEditing ? (
                <>
                  <X className="w-4 h-4" />
                  {t.cancel}
                </>
              ) : (
                <>
                  <Edit3 className="w-4 h-4" />
                  {t.edit}
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-800">
        {(['overview', 'academics', 'achievements'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium transition border-b-2 -mb-px ${
              activeTab === tab
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {t[tab]}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid gap-6 md:grid-cols-2"
          >
            {/* Personal Information */}
            <div className="rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                {t.personalInfo}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-muted-foreground">{t.firstName}</label>
                  <p className="font-medium">{profileData?.firstName}</p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">{t.lastName}</label>
                  <p className="font-medium">{profileData?.lastName}</p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">{t.rollNo}</label>
                  <p className="font-medium">{profileData?.code}</p>
                </div>
                {profileData?.dateOfBirth && (
                  <div>
                    <label className="text-xs text-muted-foreground">{t.dob}</label>
                    <p className="font-medium">{new Date(profileData.dateOfBirth).toLocaleDateString()}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Contact Information */}
            <div className="rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Mail className="w-5 h-5 text-primary" />
                {t.contactInfo}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-muted-foreground">{t.email}</label>
                  <p className="font-medium flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    {userEmail || profileData?.email || t.noEmail}
                  </p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">{t.phone}</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={editedData.phone}
                      onChange={(e) => setEditedData({ ...editedData, phone: e.target.value })}
                      className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Enter phone number"
                    />
                  ) : (
                    <p className="font-medium flex items-center gap-2">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      {profileData?.phone || t.noEmail}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">{t.address}</label>
                  {isEditing ? (
                    <textarea
                      value={editedData.address}
                      onChange={(e) => setEditedData({ ...editedData, address: e.target.value })}
                      rows={2}
                      className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Enter address"
                    />
                  ) : (
                    <p className="font-medium flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      {profileData?.address || t.noEmail}
                    </p>
                  )}
                </div>
              </div>
              
              {isEditing && (
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="mt-4 w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {isSaving ? 'Saving...' : t.save}
                </button>
              )}
            </div>

            {/* Attendance Stats */}
            <div className="rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                {t.attendanceStats}
              </h3>
              {attendanceStats ? (
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 rounded-lg bg-gray-50 dark:bg-slate-800">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{attendanceStats.totalDays}</p>
                    <p className="text-xs text-muted-foreground">{t.totalDays}</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20">
                    <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{attendanceStats.presentDays}</p>
                    <p className="text-xs text-muted-foreground">{t.present}</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-red-50 dark:bg-red-900/20">
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">{attendanceStats.absentDays}</p>
                    <p className="text-xs text-muted-foreground">{t.absent}</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 rounded-lg bg-gray-50 dark:bg-slate-800">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">--</p>
                    <p className="text-xs text-muted-foreground">{t.totalDays}</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20">
                    <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">--</p>
                    <p className="text-xs text-muted-foreground">{t.present}</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-red-50 dark:bg-red-900/20">
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">--</p>
                    <p className="text-xs text-muted-foreground">{t.absent}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Homework Streak */}
            <div className="rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Flame className="w-5 h-5 text-orange-500" />
                {t.homeworkStreak}
              </h3>
              <div className="flex items-center gap-6">
                <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${getStreakColor(homeworkStreak.currentStreak)} flex items-center justify-center`}>
                  <div className="text-center text-white">
                    <p className="text-2xl font-bold">{homeworkStreak.currentStreak}</p>
                    <p className="text-[10px]">{t.days}</p>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="mb-2">
                    <p className="text-sm text-muted-foreground">{t.currentStreak}</p>
                    <p className="text-xl font-bold">{homeworkStreak.currentStreak} {t.days} 🔥</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{t.longestStreak}</p>
                    <p className="text-lg font-semibold text-primary">{homeworkStreak.longestStreak} {t.days}</p>
                  </div>
                </div>
              </div>
              <p className="mt-4 text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                {homeworkStreak.currentStreak > 0 ? t.keepItUp : t.startStreak}
              </p>
            </div>
          </motion.div>
        )}

        {activeTab === 'academics' && (
          <motion.div
            key="academics"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Academic Information */}
            <div className="rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                {t.academicInfo}
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs text-muted-foreground">{t.school}</label>
                  <p className="font-medium">{profileData?.school?.name || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">{t.class}</label>
                  <p className="font-medium">{profileData?.classroom?.grade?.name}</p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">{t.section}</label>
                  <p className="font-medium">{profileData?.classroom?.section?.label}</p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">{t.academicYear}</label>
                  <p className="font-medium">{profileData?.classroom?.academicYear || '2024-25'}</p>
                </div>
              </div>
            </div>

            {/* Guardian Information */}
            <div className="rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                {t.guardianInfo}
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs text-muted-foreground">{t.guardianName}</label>
                  <p className="font-medium">{profileData?.guardianName || t.noEmail}</p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">{t.guardianPhone}</label>
                  <p className="font-medium">{profileData?.guardianPhone || t.noEmail}</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'achievements' && (
          <motion.div
            key="achievements"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Achievements */}
            <div className="rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900 p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" />
                {t.recentAchievements}
              </h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {/* Achievement badges */}
                <div className="flex items-center gap-3 p-4 rounded-lg bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-900/30">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                    <Flame className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-amber-700 dark:text-amber-400">7-Day Streak</p>
                    <p className="text-xs text-muted-foreground">Homework Champion</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-lg bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-200 dark:border-emerald-900/30">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-emerald-700 dark:text-emerald-400">Perfect Week</p>
                    <p className="text-xs text-muted-foreground">100% Attendance</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-lg bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-900/30">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center">
                    <Star className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-purple-700 dark:text-purple-400">Top Performer</p>
                    <p className="text-xs text-muted-foreground">Class Rank #1</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
