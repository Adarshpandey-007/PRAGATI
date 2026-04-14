'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  LogOut,
  UserCircle,
  Users,
  Search,
  Shield,
  GraduationCap,
  BookOpen,
  School as SchoolIcon,
  Mail,
  Phone,
  CheckCircle,
  XCircle,
  ChevronDown,
  ChevronRight,
  UserPlus,
  Pencil,
  Trash2,
  X,
} from 'lucide-react';

interface User {
  id: string;
  email: string;
  phoneNumber: string | null;
  role: string;
  status: string;
  studentId: string | null;
  teacherId: string | null;
  schoolId: string;
  createdAt: string;
  updatedAt: string;
}

interface School {
  id: string;
  name: string;
  district: string;
}

export default function GovernmentUsersPage() {
  const router = useRouter();
  const [governmentName, setGovernmentName] = useState('Government Official');
  const [users, setUsers] = useState<User[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [schoolFilter, setSchoolFilter] = useState<string>('all');
  const [expandedRole, setExpandedRole] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);

  const [createFormData, setCreateFormData] = useState({
    email: '',
    password: '',
    phoneNumber: '',
    schoolId: '',
  });

  const [editFormData, setEditFormData] = useState({
    email: '',
    phoneNumber: '',
    status: 'active',
    password: '',
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('pragati_token');
      const role = localStorage.getItem('pragati_role');

      if (!token || role !== 'GOVERNMENT') {
        router.push('/login/government');
        return;
      }

      setGovernmentName('Government Official');
      fetchData(token);
    }
  }, [router]);

  const readErrorMessage = async (response: Response, fallback: string) => {
    try {
      const payload = await response.json();
      if (payload && typeof payload.message === 'string' && payload.message.trim().length > 0) {
        return payload.message;
      }
      return fallback;
    } catch {
      return fallback;
    }
  };

  const fetchData = async (token: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const backendUrl = (process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:4000').replace(/\/$/, '');

      const [usersRes, schoolsRes] = await Promise.all([
        fetch(`${backendUrl}/api/auth/users`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${backendUrl}/api/core/schools`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (!usersRes.ok) {
        if (usersRes.status === 401 || usersRes.status === 403) {
          handleLogout();
          return;
        }
        const message = await readErrorMessage(usersRes, 'Failed to fetch users');
        throw new Error(message);
      }

      if (!schoolsRes.ok) {
        if (schoolsRes.status === 401 || schoolsRes.status === 403) {
          handleLogout();
          return;
        }
        const message = await readErrorMessage(schoolsRes, 'Failed to fetch schools');
        throw new Error(message);
      }

      const usersData = await usersRes.json();
      const schoolsData = await schoolsRes.json();

      setUsers(Array.isArray(usersData) ? usersData : []);
      setSchools(Array.isArray(schoolsData) ? schoolsData : []);
    } catch (err) {
      console.error('Error fetching data:', err);
      const message = err instanceof Error ? err.message : 'Unable to load user data. Please try again.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('pragati_token');
    localStorage.removeItem('pragati_role');
    localStorage.removeItem('pragati_userId');
    localStorage.removeItem('pragati_schoolId');
    router.push('/login/government');
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'STUDENT':
        return GraduationCap;
      case 'TEACHER':
        return BookOpen;
      case 'PRINCIPAL':
        return SchoolIcon;
      case 'GOVERNMENT':
        return Shield;
      default:
        return Shield;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'STUDENT':
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
      case 'TEACHER':
        return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20';
      case 'PRINCIPAL':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
      case 'GOVERNMENT':
        return 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20';
      default:
        return 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20';
    }
  };

  const getSchoolName = (schoolId: string) => {
    const school = schools.find((s) => s.id === schoolId);
    return school ? school.name : 'Unknown School';
  };

  const canManageUser = (user: User) => user.role === 'PRINCIPAL';

  const resetCreateForm = () => {
    setCreateFormData({
      email: '',
      password: '',
      phoneNumber: '',
      schoolId: '',
    });
  };

  const handleCreatePrincipal = async () => {
    if (!createFormData.email || !createFormData.password || !createFormData.phoneNumber || !createFormData.schoolId) {
      setError('All fields are required to create principal login');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const token = localStorage.getItem('pragati_token');
      const backendUrl = (process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:4000').replace(/\/$/, '');

      const response = await fetch(`${backendUrl}/api/auth/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: createFormData.email,
          password: createFormData.password,
          phoneNumber: createFormData.phoneNumber,
          role: 'PRINCIPAL',
          schoolId: createFormData.schoolId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to create principal user');
      }

      setShowCreateModal(false);
      resetCreateForm();
      if (token) await fetchData(token);
    } catch (err: any) {
      setError(err.message || 'Failed to create principal user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (user: User) => {
    if (!canManageUser(user)) return;
    setSelectedUser(user);
    setEditFormData({
      email: user.email,
      phoneNumber: user.phoneNumber || '',
      status: user.status || 'active',
      password: '',
    });
    setShowEditModal(true);
    setError(null);
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;
    if (!editFormData.email || !editFormData.phoneNumber) {
      setError('Email and phone number are required');
      return;
    }

    setIsUpdating(true);
    setError(null);

    try {
      const token = localStorage.getItem('pragati_token');
      const backendUrl = (process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:4000').replace(/\/$/, '');
      const payload: { email: string; phoneNumber: string; status: string; password?: string } = {
        email: editFormData.email,
        phoneNumber: editFormData.phoneNumber,
        status: editFormData.status,
      };

      if (editFormData.password.trim().length > 0) {
        payload.password = editFormData.password;
      }

      const response = await fetch(`${backendUrl}/api/auth/users/${selectedUser.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to update user');
      }

      setShowEditModal(false);
      setSelectedUser(null);
      if (token) await fetchData(token);
    } catch (err: any) {
      setError(err.message || 'Failed to update user');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteUser = async (user: User) => {
    if (!canManageUser(user)) return;

    const confirmed = window.confirm(`Delete principal login for ${user.email}?`);
    if (!confirmed) return;

    setIsDeletingId(user.id);
    setError(null);

    try {
      const token = localStorage.getItem('pragati_token');
      const backendUrl = (process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:4000').replace(/\/$/, '');
      const response = await fetch(`${backendUrl}/api/auth/users/${user.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to delete user');
      }

      if (token) await fetchData(token);
    } catch (err: any) {
      setError(err.message || 'Failed to delete user');
    } finally {
      setIsDeletingId(null);
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      searchQuery === '' ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      getSchoolName(user.schoolId).toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    const matchesSchool = schoolFilter === 'all' || user.schoolId === schoolFilter;

    return matchesSearch && matchesStatus && matchesSchool;
  });

  // Group users by role
  const usersByRole = {
    ADMIN: filteredUsers.filter((u) => u.role === 'ADMIN'),
    GOVERNMENT: filteredUsers.filter((u) => u.role === 'GOVERNMENT'),
    PRINCIPAL: filteredUsers.filter((u) => u.role === 'PRINCIPAL'),
    TEACHER: filteredUsers.filter((u) => u.role === 'TEACHER'),
    STUDENT: filteredUsers.filter((u) => u.role === 'STUDENT'),
  };

  const roleCounts = {
    total: users.length,
    admin: users.filter((u) => u.role === 'ADMIN').length,
    government: users.filter((u) => u.role === 'GOVERNMENT').length,
    principal: users.filter((u) => u.role === 'PRINCIPAL').length,
    teacher: users.filter((u) => u.role === 'TEACHER').length,
    student: users.filter((u) => u.role === 'STUDENT').length,
  };

  const roleConfigs = [
    { key: 'ADMIN', label: 'Admin', icon: Shield, color: 'from-red-500 to-rose-500', count: usersByRole.ADMIN.length },
    { key: 'GOVERNMENT', label: 'Government', icon: Shield, color: 'from-orange-500 to-amber-500', count: usersByRole.GOVERNMENT.length },
    { key: 'PRINCIPAL', label: 'Principal', icon: SchoolIcon, color: 'from-emerald-500 to-teal-500', count: usersByRole.PRINCIPAL.length },
    { key: 'TEACHER', label: 'Teacher', icon: BookOpen, color: 'from-purple-500 to-pink-500', count: usersByRole.TEACHER.length },
    { key: 'STUDENT', label: 'Student', icon: GraduationCap, color: 'from-blue-500 to-cyan-500', count: usersByRole.STUDENT.length },
  ];

  return (
    <div className="min-h-screen bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:4rem_4rem] dark:bg-slate-950">
      {/* Top Government Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-orange-600 to-orange-500 text-white px-4 py-2 text-xs sm:text-sm shadow-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-white/20 rounded flex items-center justify-center text-xs font-bold">
              ðŸ‡®ðŸ‡³
            </div>
            <span className="font-semibold hidden sm:inline">GOVERNMENT OF INDIA</span>
            <span className="font-semibold sm:hidden">GOI</span>
          </div>
          <span className="text-[10px] sm:text-xs font-medium">SIH 2026 • MoE & Govt. of Punjab Â· PRAGATI Portal</span>
        </div>
      </div>

      {/* Main Header */}
      <header className="fixed top-10 sm:top-12 left-0 right-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => router.back()}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-sm sm:text-lg font-bold text-gray-900 dark:text-white">User Management</h1>
                <p className="text-[10px] sm:text-xs text-muted-foreground">
                  System-wide user accounts
                </p>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-gray-700">
                <UserCircle className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs font-medium text-gray-900 dark:text-white">{governmentName}</span>
              </div>

              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 text-xs font-medium hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="pt-32 sm:pt-36 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex justify-end">
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              Create Principal Login
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900 p-6"
            >
              <p className="text-sm text-muted-foreground mb-2">Total Users</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{roleCounts.total}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900 p-6"
            >
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4 text-red-600 dark:text-red-400" />
                <p className="text-sm text-muted-foreground">Admin</p>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{roleCounts.admin}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900 p-6"
            >
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                <p className="text-sm text-muted-foreground">Government</p>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{roleCounts.government}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900 p-6"
            >
              <div className="flex items-center gap-2 mb-2">
                <SchoolIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <p className="text-sm text-muted-foreground">Principal</p>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{roleCounts.principal}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900 p-6"
            >
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <p className="text-sm text-muted-foreground">Teacher</p>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{roleCounts.teacher}</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900 p-6"
            >
              <div className="flex items-center gap-2 mb-2">
                <GraduationCap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <p className="text-sm text-muted-foreground">Student</p>
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{roleCounts.student}</p>
            </motion.div>
          </div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900 p-6"
          >
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-950 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="blocked">Blocked</option>
                </select>

                <select
                  value={schoolFilter}
                  onChange={(e) => setSchoolFilter(e.target.value)}
                  className="rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <option value="all">All Schools</option>
                  {schools.map((school) => (
                    <option key={school.id} value={school.id}>
                      {school.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </motion.div>

          {/* Users by Role Categories */}
          {isLoading ? (
            <div className="rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900 p-12 text-center">
              <div className="inline-block w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
              <p className="mt-4 text-sm text-muted-foreground">Loading users...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900 p-12 text-center">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-sm text-muted-foreground">
                {searchQuery || statusFilter !== 'all' || schoolFilter !== 'all'
                  ? 'No users match your filters'
                  : 'No users found'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {roleConfigs.map((roleConfig, index) => {
                const users = usersByRole[roleConfig.key as keyof typeof usersByRole];
                const isExpanded = expandedRole === roleConfig.key;
                const Icon = roleConfig.icon;

                return (
                  <motion.div
                    key={roleConfig.key}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 + index * 0.05 }}
                    className="rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm"
                  >
                    <button
                      onClick={() => setExpandedRole(isExpanded ? null : roleConfig.key)}
                      className="w-full p-6 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl bg-gradient-to-br ${roleConfig.color} text-white shadow-sm`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{roleConfig.label}</h3>
                          <p className="text-sm text-muted-foreground">
                            {roleConfig.count} user{roleConfig.count !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                      {isExpanded ? (
                        <ChevronDown className="w-5 h-5 text-muted-foreground transition-transform" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-muted-foreground transition-transform" />
                      )}
                    </button>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="border-t border-gray-200 dark:border-gray-800">
                            {users.length === 0 ? (
                              <div className="p-8 text-center">
                                <p className="text-sm text-muted-foreground">No {roleConfig.label.toLowerCase()} users found</p>
                              </div>
                            ) : (
                              <div className="overflow-x-auto">
                                <table className="w-full">
                                  <thead className="bg-gray-50 dark:bg-slate-800/50 border-b border-gray-200 dark:border-gray-800">
                                    <tr>
                                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Phone</th>
                                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">School</th>
                                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Created</th>
                                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                                    {users.map((user) => (
                                      <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="px-6 py-4">
                                          <div className="flex items-center gap-2">
                                            <Mail className="w-3 h-3 text-muted-foreground" />
                                            <span className="text-sm font-medium text-gray-900 dark:text-white">{user.email}</span>
                                          </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                                          {user.phoneNumber ? (
                                            <div className="flex items-center gap-2">
                                              <Phone className="w-3 h-3" />
                                              {user.phoneNumber}
                                            </div>
                                          ) : (
                                            '-'
                                          )}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{getSchoolName(user.schoolId)}</td>
                                        <td className="px-6 py-4">
                                          {user.status === 'active' ? (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-xs font-medium">
                                              <CheckCircle className="w-3 h-3" />
                                              Active
                                            </span>
                                          ) : (
                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 text-xs font-medium">
                                              <XCircle className="w-3 h-3" />
                                              Blocked
                                            </span>
                                          )}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                                          {new Date(user.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                          {canManageUser(user) ? (
                                            <div className="flex items-center gap-2">
                                              <button
                                                onClick={() => openEditModal(user)}
                                                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 text-xs font-medium hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                                              >
                                                <Pencil className="w-3.5 h-3.5" />
                                                Edit
                                              </button>
                                              <button
                                                onClick={() => handleDeleteUser(user)}
                                                disabled={isDeletingId === user.id}
                                                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300 text-xs font-medium hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors disabled:opacity-60"
                                              >
                                                <Trash2 className="w-3.5 h-3.5" />
                                                {isDeletingId === user.id ? 'Deleting...' : 'Delete'}
                                              </button>
                                            </div>
                                          ) : (
                                            <span className="text-xs text-muted-foreground">Not allowed</span>
                                          )}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900 p-6 shadow-xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Create Principal Login</h3>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  resetCreateForm();
                }}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">School</label>
                <select
                  value={createFormData.schoolId}
                  onChange={(e) => setCreateFormData({ ...createFormData, schoolId: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <option value="">Select school</option>
                  {schools.map((school) => (
                    <option key={school.id} value={school.id}>{school.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
                <input
                  type="email"
                  value={createFormData.email}
                  onChange={(e) => setCreateFormData({ ...createFormData, email: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Password</label>
                <input
                  type="password"
                  value={createFormData.password}
                  onChange={(e) => setCreateFormData({ ...createFormData, password: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone Number</label>
                <input
                  type="tel"
                  value={createFormData.phoneNumber}
                  onChange={(e) => setCreateFormData({ ...createFormData, phoneNumber: e.target.value.replace(/[^0-9+]/g, '') })}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    resetCreateForm();
                  }}
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-sm font-medium hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreatePrincipal}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Creating...' : 'Create Login'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {showEditModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md rounded-xl border-2 border-gray-200 dark:border-gray-800 bg-white dark:bg-slate-900 p-6 shadow-xl"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Update Principal Login</h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedUser(null);
                }}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
                <input
                  type="email"
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone Number</label>
                <input
                  type="tel"
                  value={editFormData.phoneNumber}
                  onChange={(e) => setEditFormData({ ...editFormData, phoneNumber: e.target.value.replace(/[^0-9+]/g, '') })}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
                <select
                  value={editFormData.status}
                  onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <option value="active">Active</option>
                  <option value="blocked">Blocked</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">New Password (Optional)</label>
                <input
                  type="password"
                  value={editFormData.password}
                  onChange={(e) => setEditFormData({ ...editFormData, password: e.target.value })}
                  placeholder="Leave blank to keep current password"
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-slate-950 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedUser(null);
                  }}
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-sm font-medium hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateUser}
                  disabled={isUpdating}
                  className="flex-1 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {isUpdating ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
