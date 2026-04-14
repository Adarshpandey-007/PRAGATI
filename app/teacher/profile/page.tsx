'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
  Users,
  FileText,
  BarChart3,
  GraduationCap,
  Briefcase
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface TeacherProfileData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  address?: string;
  qualification?: string;
  specialization?: string;
  experience?: number;
  school?: {
    id: string;
    name: string;
    district?: string;
  };
  subjects?: string[];
  classrooms?: Array<{
    id: string;
    grade: { name: string };
    section: { label: string };
  }>;
}

interface TeachingStats {
  totalStudents: number;
  totalClasses: number;
  attendanceMarked: number;
  examsCreated: number;
}

export default function TeacherProfilePage() {
  const router = useRouter();
  const backendUrl = (
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    'http://localhost:4000'
  ).replace(/\/$/, '');
  const [profileData, setProfileData] = useState<TeacherProfileData | null>(null);
  const [teachingStats, setTeachingStats] = useState<TeachingStats | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [userEmail, setUserEmail] = useState<string>('');
  const [editedData, setEditedData] = useState({
    phone: '',
    address: '',
  });
  const [activeTab, setActiveTab] = useState<'overview' | 'classes' | 'stats'>('overview');

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('pragati_token');
        const teacherId = localStorage.getItem('pragati_teacherId');
        const email = localStorage.getItem('pragati_name') || '';
        setUserEmail(email);

        if (!token || !teacherId) {
          router.push('/login/teacher');
          return;
        }

        // Try to fetch profile from API
        const response = await fetch(`${backendUrl}/api/teachers/${teacherId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          setProfileData(data);
          setEditedData({
            phone: data.phone || '',
            address: data.address || '',
          });
        } else {
          // Mock data for development
          setProfileData({
            id: teacherId,
            firstName: 'Teacher',
            lastName: 'User',
            email: email,
            phone: '+91 98765 43210',
            qualification: 'M.Ed, B.Ed',
            specialization: 'Mathematics',
            experience: 8,
            school: {
              id: '1',
              name: 'Government Senior Secondary School',
              district: 'Ludhiana'
            },
            subjects: ['Mathematics', 'Science'],
            classrooms: [
              { id: '1', grade: { name: 'Grade 10' }, section: { label: 'A' } },
              { id: '2', grade: { name: 'Grade 9' }, section: { label: 'B' } }
            ]
          });
          setEditedData({
            phone: '+91 98765 43210',
            address: 'Ludhiana, Punjab',
          });
        }

        // Mock teaching stats
        setTeachingStats({
          totalStudents: 245,
          totalClasses: 6,
          attendanceMarked: 180,
          examsCreated: 12
        });
      } catch (error) {
        console.error('Error fetching profile:', error);
        // Set mock data on error
        const email = localStorage.getItem('pragati_name') || '';
        setUserEmail(email);
        setProfileData({
          id: '1',
          firstName: 'Teacher',
          lastName: 'User',
          email: email,
          qualification: 'M.Ed, B.Ed',
          specialization: 'Mathematics',
          experience: 8,
          school: {
            id: '1',
            name: 'Government Senior Secondary School',
            district: 'Ludhiana'
          },
          subjects: ['Mathematics', 'Science'],
          classrooms: [
            { id: '1', grade: { name: 'Grade 10' }, section: { label: 'A' } },
            { id: '2', grade: { name: 'Grade 9' }, section: { label: 'B' } }
          ]
        });
        setTeachingStats({
          totalStudents: 245,
          totalClasses: 6,
          attendanceMarked: 180,
          examsCreated: 12
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [router, backendUrl]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const token = localStorage.getItem('pragati_token');
      const teacherId = localStorage.getItem('pragati_teacherId');

      const response = await fetch(`${backendUrl}/api/teachers/${teacherId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editedData)
      });

      if (response.ok) {
        setProfileData(prev => prev ? { ...prev, ...editedData } : prev);
      }
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setIsSaving(false);
      setIsEditing(false);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'classes', label: 'My Classes', icon: Users },
    { id: 'stats', label: 'Statistics', icon: BarChart3 },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Back Button */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="mb-6"
      >
        <Link 
          href="/teacher"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
      </motion.div>

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
              {profileData?.firstName?.charAt(0) || 'T'}{profileData?.lastName?.charAt(0) || 'U'}
            </div>
            <button className="absolute bottom-0 right-0 p-2 bg-white dark:bg-slate-800 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="w-4 h-4 text-primary" />
            </button>
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
            {profileData?.school && (
              <p className="text-sm text-muted-foreground flex items-center justify-center sm:justify-start gap-2">
                <School className="w-4 h-4" />
                {profileData.school.name}
                {profileData.school.district && `, ${profileData.school.district}`}
              </p>
            )}

            {/* Quick Stats */}
            <div className="flex flex-wrap justify-center sm:justify-start gap-4 mt-4">
              {teachingStats && (
                <>
                  <div className="flex items-center gap-2 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-full shadow-sm">
                    <Users className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-medium">{teachingStats.totalStudents} Students</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-full shadow-sm">
                    <BookOpen className="w-4 h-4 text-green-500" />
                    <span className="text-sm font-medium">{teachingStats.totalClasses} Classes</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-full shadow-sm">
                    <Briefcase className="w-4 h-4 text-purple-500" />
                    <span className="text-sm font-medium">{profileData?.experience || 0} Years Exp.</span>
                  </div>
                </>
              )}
            </div>
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
                      onChange={(e) => setEditedData({ ...editedData, phone: e.target.value })}
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
                <GraduationCap className="w-5 h-5 text-primary" />
                Professional Information
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-muted-foreground uppercase tracking-wide">Qualification</label>
                  <p className="font-medium mt-1">{profileData?.qualification || 'Not provided'}</p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground uppercase tracking-wide">Specialization</label>
                  <p className="font-medium mt-1">{profileData?.specialization || 'Not provided'}</p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground uppercase tracking-wide">Experience</label>
                  <p className="font-medium mt-1">{profileData?.experience ? `${profileData.experience} Years` : 'Not provided'}</p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground uppercase tracking-wide">Subjects</label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {profileData?.subjects?.map((subject, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium"
                      >
                        {subject}
                      </span>
                    )) || <p className="text-muted-foreground">No subjects assigned</p>}
                  </div>
                </div>
              </div>
            </div>

            {/* School Information */}
            <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-slate-800 md:col-span-2">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <School className="w-5 h-5 text-primary" />
                School Information
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs text-muted-foreground uppercase tracking-wide">School Name</label>
                  <p className="font-medium mt-1">{profileData?.school?.name || 'Not assigned'}</p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground uppercase tracking-wide">District</label>
                  <p className="font-medium mt-1">{profileData?.school?.district || 'Not provided'}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'classes' && (
          <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-slate-800">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Assigned Classes
            </h3>
            {profileData?.classrooms && profileData.classrooms.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {profileData.classrooms.map((classroom, index) => (
                  <motion.div
                    key={classroom.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl border border-primary/10"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                        <BookOpen className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold">{classroom.grade.name}</p>
                        <p className="text-sm text-muted-foreground">Section {classroom.section.label}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No classes assigned yet</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'stats' && teachingStats && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0 }}
              className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 rounded-xl p-6 border border-blue-500/20"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-500" />
                </div>
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{teachingStats.totalStudents}</p>
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
                  <BookOpen className="w-6 h-6 text-green-500" />
                </div>
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{teachingStats.totalClasses}</p>
              <p className="text-sm text-muted-foreground">Classes Assigned</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 rounded-xl p-6 border border-orange-500/20"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-orange-500" />
                </div>
                <Clock className="w-5 h-5 text-orange-500" />
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{teachingStats.attendanceMarked}</p>
              <p className="text-sm text-muted-foreground">Attendance Records</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 rounded-xl p-6 border border-purple-500/20"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                  <GraduationCap className="w-6 h-6 text-purple-500" />
                </div>
                <Award className="w-5 h-5 text-purple-500" />
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{teachingStats.examsCreated}</p>
              <p className="text-sm text-muted-foreground">Exams Created</p>
            </motion.div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
