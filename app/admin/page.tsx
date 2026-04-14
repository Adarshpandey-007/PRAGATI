"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, GraduationCap, Landmark, LogOut, Pencil, School, Trash2, Users, X } from "lucide-react";
import { getBackendUrl } from "@/lib/config";
import { clearAuthSession, getAuthSession } from "@/lib/auth-storage";

type SchoolItem = { id: string; name: string; district: string };
type TeacherItem = { id: string; firstName: string; lastName: string; email: string; schoolId: string };
type StudentItem = {
  id: string;
  firstName: string;
  lastName: string;
  code: string;
  schoolId: string;
  classroomId?: string;
  classTeacherId?: string;
};
type ClassroomItem = { id: string; schoolId: string; grade?: { name?: string }; section?: { label?: string }; academicYear?: string };
type GradeItem = { id: string; schoolId: string; name: string; level: number };
type SectionItem = { id: string; gradeId: string; label: string };
type SubjectItem = { id: string; schoolId: string; code: string; name: string };
type AdminUserItem = {
  id: string;
  email: string;
  role: string;
  status: string;
  phoneNumber: string | null;
  schoolId: string | null;
  teacherId: string | null;
  studentId: string | null;
};
type ComplaintItem = {
  id: string;
  status: string;
  category?: string;
  description?: string;
  createdAt?: string;
};
type NotificationItem = {
  id: string;
  title: string;
  category?: string;
  priority?: number;
  isPublic?: boolean;
};

type DashboardStats = {
  schools: number;
  teachers: number;
  students: number;
  classrooms: number;
};

type EditEntity =
  | { type: "school"; id: string; name: string; district: string }
  | { type: "teacher"; id: string; firstName: string; lastName: string; email: string }
  | { type: "student"; id: string; firstName: string; lastName: string }
  | { type: "classroom"; id: string; academicYear: string };

const backendUrl = getBackendUrl();

export default function AdminDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [editEntity, setEditEntity] = useState<EditEntity | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [stats, setStats] = useState<DashboardStats>({ schools: 0, teachers: 0, students: 0, classrooms: 0 });
  const [schools, setSchools] = useState<SchoolItem[]>([]);
  const [teachers, setTeachers] = useState<TeacherItem[]>([]);
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [classrooms, setClassrooms] = useState<ClassroomItem[]>([]);
  const [grades, setGrades] = useState<GradeItem[]>([]);
  const [sections, setSections] = useState<SectionItem[]>([]);
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [adminUsers, setAdminUsers] = useState<AdminUserItem[]>([]);
  const [complaints, setComplaints] = useState<ComplaintItem[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [activeSchoolSettingsId, setActiveSchoolSettingsId] = useState("");
  const [schoolSettings, setSchoolSettings] = useState({
    teacherAttendanceEnabled: true,
    faceAttendanceEnabled: true,
    multiFaceAttendanceEnabled: true,
    rfidEnabled: true,
  });
  const [entitySearch, setEntitySearch] = useState("");
  const [accountSearch, setAccountSearch] = useState("");

  const [schoolForm, setSchoolForm] = useState({ name: "", district: "" });
  const [teacherForm, setTeacherForm] = useState({ schoolId: "", firstName: "", lastName: "", email: "" });
  const [studentForm, setStudentForm] = useState({
    schoolId: "",
    classroomId: "",
    classTeacherId: "",
    code: "",
    firstName: "",
    lastName: "",
  });
  const [classroomForm, setClassroomForm] = useState({
    schoolId: "",
    gradeId: "",
    sectionId: "",
    academicYear: "2026-2027",
  });
  const [accountForm, setAccountForm] = useState({
    email: "",
    password: "",
    phoneNumber: "",
    role: "PRINCIPAL",
    schoolId: "",
    teacherId: "",
    studentId: "",
  });
  const [gradeForm, setGradeForm] = useState({ schoolId: "", name: "", level: 1 });
  const [sectionForm, setSectionForm] = useState({ gradeId: "", label: "" });
  const [subjectForm, setSubjectForm] = useState({ schoolId: "", code: "", name: "" });

  const authHeaders = () => {
    const session = getAuthSession();
    return {
      Authorization: `Bearer ${session?.token || ""}`,
      "Content-Type": "application/json",
    };
  };

  const selectedSchoolClassrooms = useMemo(
    () => classrooms.filter((c) => c.schoolId === studentForm.schoolId),
    [classrooms, studentForm.schoolId]
  );

  const selectedSchoolTeachers = useMemo(
    () => teachers.filter((t) => t.schoolId === studentForm.schoolId),
    [teachers, studentForm.schoolId]
  );

  const selectedSchoolGrades = useMemo(
    () => grades.filter((g) => g.schoolId === classroomForm.schoolId),
    [grades, classroomForm.schoolId]
  );

  const selectedGradeSections = useMemo(
    () => sections.filter((s) => s.gradeId === classroomForm.gradeId),
    [sections, classroomForm.gradeId]
  );

  const classroomLabel = (classroom: ClassroomItem) =>
    `${classroom.grade?.name || "Class"}${classroom.section?.label ? ` ${classroom.section.label}` : ""}`;

  const selectedSchoolStudents = useMemo(
    () => students.filter((s) => s.schoolId === accountForm.schoolId),
    [students, accountForm.schoolId]
  );

  const selectedSchoolTeachersForAccount = useMemo(
    () => teachers.filter((t) => t.schoolId === accountForm.schoolId),
    [teachers, accountForm.schoolId]
  );

  const filteredSchools = useMemo(
    () => schools.filter((item) => item.name.toLowerCase().includes(entitySearch.toLowerCase())),
    [schools, entitySearch]
  );

  const filteredTeachers = useMemo(
    () =>
      teachers.filter((item) =>
        `${item.firstName} ${item.lastName} ${item.email}`.toLowerCase().includes(entitySearch.toLowerCase())
      ),
    [teachers, entitySearch]
  );

  const filteredStudents = useMemo(
    () =>
      students.filter((item) =>
        `${item.firstName} ${item.lastName} ${item.code}`.toLowerCase().includes(entitySearch.toLowerCase())
      ),
    [students, entitySearch]
  );

  const filteredClassrooms = useMemo(
    () => classrooms.filter((item) => classroomLabel(item).toLowerCase().includes(entitySearch.toLowerCase())),
    [classrooms, entitySearch]
  );

  const filteredAdminUsers = useMemo(
    () =>
      adminUsers.filter((item) =>
        `${item.email} ${item.role} ${item.status}`.toLowerCase().includes(accountSearch.toLowerCase())
      ),
    [adminUsers, accountSearch]
  );

  const safeJson = async (response: Response) => {
    try {
      return await response.json();
    } catch {
      return {};
    }
  };

  const fetchDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const [schoolsRes, teachersRes, studentsRes, classroomsRes] = await Promise.all([
        fetch(`${backendUrl}/api/core/schools`, { headers: authHeaders() }),
        fetch(`${backendUrl}/api/core/teachers`, { headers: authHeaders() }),
        fetch(`${backendUrl}/api/core/students`, { headers: authHeaders() }),
        fetch(`${backendUrl}/api/core/classrooms`, { headers: authHeaders() }),
      ]);

      const [gradesRes, sectionsRes, subjectsRes, usersRes, complaintsRes, notificationsRes] = await Promise.all([
        fetch(`${backendUrl}/api/core/grades`, { headers: authHeaders() }),
        fetch(`${backendUrl}/api/core/sections`, { headers: authHeaders() }),
        fetch(`${backendUrl}/api/core/subjects`, { headers: authHeaders() }),
        fetch(`${backendUrl}/api/auth/users`, { headers: authHeaders() }),
        fetch(`${backendUrl}/api/complaints`, { headers: authHeaders() }),
        fetch(`${backendUrl}/api/communications/notifications/active`, { headers: authHeaders() }),
      ]);

      if (
        !schoolsRes.ok ||
        !teachersRes.ok ||
        !studentsRes.ok ||
        !classroomsRes.ok ||
        !gradesRes.ok ||
        !sectionsRes.ok ||
        !subjectsRes.ok ||
        !usersRes.ok ||
        !complaintsRes.ok ||
        !notificationsRes.ok
      ) {
        throw new Error("Failed to load admin dashboard data");
      }

      const schoolsData = (await schoolsRes.json()) as SchoolItem[];
      const teachersData = (await teachersRes.json()) as TeacherItem[];
      const studentsData = (await studentsRes.json()) as StudentItem[];
      const classroomsData = (await classroomsRes.json()) as ClassroomItem[];
      const gradesData = (await gradesRes.json()) as GradeItem[];
      const sectionsData = (await sectionsRes.json()) as SectionItem[];
      const subjectsData = (await subjectsRes.json()) as SubjectItem[];
      const usersData = (await usersRes.json()) as AdminUserItem[];
      const complaintsData = await complaintsRes.json();
      const notificationsData = (await notificationsRes.json()) as NotificationItem[];

      setSchools(Array.isArray(schoolsData) ? schoolsData : []);
      setTeachers(Array.isArray(teachersData) ? teachersData : []);
      setStudents(Array.isArray(studentsData) ? studentsData : []);
      setClassrooms(Array.isArray(classroomsData) ? classroomsData : []);
      setGrades(Array.isArray(gradesData) ? gradesData : []);
      setSections(Array.isArray(sectionsData) ? sectionsData : []);
      setSubjects(Array.isArray(subjectsData) ? subjectsData : []);
      setAdminUsers(Array.isArray(usersData) ? usersData : []);
      setComplaints(Array.isArray(complaintsData?.items) ? complaintsData.items : []);
      setNotifications(Array.isArray(notificationsData) ? notificationsData : []);

      setStats({
        schools: Array.isArray(schoolsData) ? schoolsData.length : 0,
        teachers: Array.isArray(teachersData) ? teachersData.length : 0,
        students: Array.isArray(studentsData) ? studentsData.length : 0,
        classrooms: Array.isArray(classroomsData) ? classroomsData.length : 0,
      });

      if (schoolsData.length > 0) {
        const defaultSchoolId = schoolsData[0].id;
        setTeacherForm((prev) => ({ ...prev, schoolId: prev.schoolId || defaultSchoolId }));
        setStudentForm((prev) => ({ ...prev, schoolId: prev.schoolId || defaultSchoolId }));
        setClassroomForm((prev) => ({ ...prev, schoolId: prev.schoolId || defaultSchoolId }));
        setAccountForm((prev) => ({ ...prev, schoolId: prev.schoolId || defaultSchoolId }));
        setGradeForm((prev) => ({ ...prev, schoolId: prev.schoolId || defaultSchoolId }));
        setSubjectForm((prev) => ({ ...prev, schoolId: prev.schoolId || defaultSchoolId }));
        setActiveSchoolSettingsId((prev) => prev || defaultSchoolId);
      }
    } catch (err) {
      console.error(err);
      setError("Unable to load admin dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const session = getAuthSession();
    if (!session || session.role !== "ADMIN") {
      router.push("/login/admin");
      return;
    }
    fetchDashboard();
  }, [router]);

  useEffect(() => {
    if (activeSchoolSettingsId) {
      fetchSchoolSettings(activeSchoolSettingsId);
    }
  }, [activeSchoolSettingsId]);

  const handleLogout = () => {
    clearAuthSession();
    router.push("/login/admin");
  };

  const handleCreateSchool = async (event: FormEvent) => {
    event.preventDefault();
    if (!schoolForm.name || !schoolForm.district) return;

    setSubmitting(true);
    try {
      const response = await fetch(`${backendUrl}/api/core/schools`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(schoolForm),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(errorBody.message || "Failed to create school");
      }

      setSchoolForm({ name: "", district: "" });
      await fetchDashboard();
    } catch (err: any) {
      setError(err.message || "Failed to create school");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateTeacher = async (event: FormEvent) => {
    event.preventDefault();
    if (!teacherForm.schoolId || !teacherForm.firstName || !teacherForm.lastName || !teacherForm.email) return;

    setSubmitting(true);
    try {
      const response = await fetch(`${backendUrl}/api/core/teachers`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(teacherForm),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(errorBody.message || "Failed to create teacher");
      }

      setTeacherForm((prev) => ({ ...prev, firstName: "", lastName: "", email: "" }));
      await fetchDashboard();
    } catch (err: any) {
      setError(err.message || "Failed to create teacher");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateStudent = async (event: FormEvent) => {
    event.preventDefault();
    if (
      !studentForm.schoolId ||
      !studentForm.classroomId ||
      !studentForm.classTeacherId ||
      !studentForm.code ||
      !studentForm.firstName ||
      !studentForm.lastName
    ) {
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`${backendUrl}/api/core/students`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          schoolId: studentForm.schoolId,
          classroomId: studentForm.classroomId,
          classTeacherId: studentForm.classTeacherId,
          code: studentForm.code,
          firstName: studentForm.firstName,
          lastName: studentForm.lastName,
        }),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(errorBody.message || "Failed to create student");
      }

      setStudentForm((prev) => ({
        ...prev,
        code: "",
        firstName: "",
        lastName: "",
      }));
      await fetchDashboard();
    } catch (err: any) {
      setError(err.message || "Failed to create student");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateClassroom = async (event: FormEvent) => {
    event.preventDefault();
    if (!classroomForm.schoolId || !classroomForm.gradeId || !classroomForm.sectionId || !classroomForm.academicYear) {
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`${backendUrl}/api/core/classrooms`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(classroomForm),
      });

      if (!response.ok) {
        const errorBody = await safeJson(response);
        throw new Error(errorBody.message || "Failed to create classroom");
      }

      setClassroomForm((prev) => ({ ...prev, gradeId: "", sectionId: "" }));
      await fetchDashboard();
    } catch (err: any) {
      setError(err.message || "Failed to create classroom");
    } finally {
      setSubmitting(false);
    }
  };

  const openEditSchool = (school: SchoolItem) => {
    setEditEntity({
      type: "school",
      id: school.id,
      name: school.name,
      district: school.district,
    });
  };

  const handleDeleteSchool = async (school: SchoolItem) => {
    if (!window.confirm(`Delete school ${school.name}?`)) return;
    setBusyKey(`school-${school.id}`);
    setError(null);
    try {
      const response = await fetch(`${backendUrl}/api/core/schools/${school.id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      if (!response.ok) {
        const body = await safeJson(response);
        throw new Error(body.message || "Failed to delete school");
      }
      await fetchDashboard();
    } catch (err: any) {
      setError(err.message || "Failed to delete school");
    } finally {
      setBusyKey(null);
    }
  };

  const openEditTeacher = (teacher: TeacherItem) => {
    setEditEntity({
      type: "teacher",
      id: teacher.id,
      firstName: teacher.firstName,
      lastName: teacher.lastName,
      email: teacher.email,
    });
  };

  const handleDeleteTeacher = async (teacher: TeacherItem) => {
    if (!window.confirm(`Delete teacher ${teacher.firstName} ${teacher.lastName}?`)) return;
    setBusyKey(`teacher-${teacher.id}`);
    setError(null);
    try {
      const response = await fetch(`${backendUrl}/api/core/teachers/${teacher.id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      if (!response.ok) {
        const body = await safeJson(response);
        throw new Error(body.message || "Failed to delete teacher");
      }
      await fetchDashboard();
    } catch (err: any) {
      setError(err.message || "Failed to delete teacher");
    } finally {
      setBusyKey(null);
    }
  };

  const openEditStudent = (student: StudentItem) => {
    setEditEntity({
      type: "student",
      id: student.id,
      firstName: student.firstName,
      lastName: student.lastName,
    });
  };

  const handleDeleteStudent = async (student: StudentItem) => {
    if (!window.confirm(`Delete student ${student.firstName} ${student.lastName}?`)) return;
    setBusyKey(`student-${student.id}`);
    setError(null);
    try {
      const response = await fetch(`${backendUrl}/api/core/students/${student.id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      if (!response.ok) {
        const body = await safeJson(response);
        throw new Error(body.message || "Failed to delete student");
      }
      await fetchDashboard();
    } catch (err: any) {
      setError(err.message || "Failed to delete student");
    } finally {
      setBusyKey(null);
    }
  };

  const openEditClassroom = (classroom: ClassroomItem) => {
    setEditEntity({
      type: "classroom",
      id: classroom.id,
      academicYear: classroom.academicYear || "2026-2027",
    });
  };

  const handleSaveEdit = async () => {
    if (!editEntity) return;

    setSavingEdit(true);
    setBusyKey(`${editEntity.type}-${editEntity.id}`);
    setError(null);

    try {
      let endpoint = "";
      let body: Record<string, string> = {};

      if (editEntity.type === "school") {
        endpoint = `${backendUrl}/api/core/schools/${editEntity.id}`;
        body = { name: editEntity.name, district: editEntity.district };
      }

      if (editEntity.type === "teacher") {
        endpoint = `${backendUrl}/api/core/teachers/${editEntity.id}`;
        body = { firstName: editEntity.firstName, lastName: editEntity.lastName, email: editEntity.email };
      }

      if (editEntity.type === "student") {
        endpoint = `${backendUrl}/api/core/students/${editEntity.id}`;
        body = { firstName: editEntity.firstName, lastName: editEntity.lastName };
      }

      if (editEntity.type === "classroom") {
        endpoint = `${backendUrl}/api/core/classrooms/${editEntity.id}`;
        body = { academicYear: editEntity.academicYear };
      }

      const response = await fetch(endpoint, {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorBody = await safeJson(response);
        throw new Error(errorBody.message || "Failed to update record");
      }

      setEditEntity(null);
      await fetchDashboard();
    } catch (err: any) {
      setError(err.message || "Failed to update record");
    } finally {
      setSavingEdit(false);
      setBusyKey(null);
    }
  };

  const handleDeleteClassroom = async (classroom: ClassroomItem) => {
    if (!window.confirm(`Delete classroom ${classroomLabel(classroom)}?`)) return;
    setBusyKey(`classroom-${classroom.id}`);
    setError(null);
    try {
      const response = await fetch(`${backendUrl}/api/core/classrooms/${classroom.id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      if (!response.ok) {
        const body = await safeJson(response);
        throw new Error(body.message || "Failed to delete classroom");
      }
      await fetchDashboard();
    } catch (err: any) {
      setError(err.message || "Failed to delete classroom");
    } finally {
      setBusyKey(null);
    }
  };

  const handleCreateAccount = async (event: FormEvent) => {
    event.preventDefault();
    if (!accountForm.email || !accountForm.password || !accountForm.phoneNumber || !accountForm.role) return;

    setSubmitting(true);
    setError(null);
    try {
      const payload: Record<string, string> = {
        email: accountForm.email,
        password: accountForm.password,
        phoneNumber: accountForm.phoneNumber,
        role: accountForm.role,
      };

      if (accountForm.schoolId) payload.schoolId = accountForm.schoolId;
      if (accountForm.role === "TEACHER" && accountForm.teacherId) payload.teacherId = accountForm.teacherId;
      if (accountForm.role === "STUDENT" && accountForm.studentId) payload.studentId = accountForm.studentId;

      const response = await fetch(`${backendUrl}/api/auth/users`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const body = await safeJson(response);
        throw new Error(body.message || "Failed to create account");
      }

      setAccountForm((prev) => ({
        ...prev,
        email: "",
        password: "",
        phoneNumber: "",
        teacherId: "",
        studentId: "",
      }));
      await fetchDashboard();
    } catch (err: any) {
      setError(err.message || "Failed to create account");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleUserStatus = async (user: AdminUserItem) => {
    setBusyKey(`user-${user.id}`);
    setError(null);
    try {
      const response = await fetch(`${backendUrl}/api/auth/users/${user.id}`, {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify({ status: user.status === "active" ? "blocked" : "active" }),
      });
      if (!response.ok) {
        const body = await safeJson(response);
        throw new Error(body.message || "Failed to update user status");
      }
      await fetchDashboard();
    } catch (err: any) {
      setError(err.message || "Failed to update user status");
    } finally {
      setBusyKey(null);
    }
  };

  const handleDeleteAccount = async (user: AdminUserItem) => {
    if (!window.confirm(`Delete account ${user.email}?`)) return;
    setBusyKey(`user-${user.id}`);
    setError(null);
    try {
      const response = await fetch(`${backendUrl}/api/auth/users/${user.id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      if (!response.ok) {
        const body = await safeJson(response);
        throw new Error(body.message || "Failed to delete account");
      }
      await fetchDashboard();
    } catch (err: any) {
      setError(err.message || "Failed to delete account");
    } finally {
      setBusyKey(null);
    }
  };

  const handleCreateGrade = async (event: FormEvent) => {
    event.preventDefault();
    if (!gradeForm.schoolId || !gradeForm.name || !gradeForm.level) return;

    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch(`${backendUrl}/api/core/grades`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ schoolId: gradeForm.schoolId, name: gradeForm.name, level: Number(gradeForm.level) }),
      });
      if (!response.ok) {
        const body = await safeJson(response);
        throw new Error(body.message || "Failed to create grade");
      }
      setGradeForm((prev) => ({ ...prev, name: "", level: 1 }));
      await fetchDashboard();
    } catch (err: any) {
      setError(err.message || "Failed to create grade");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteGrade = async (grade: GradeItem) => {
    if (!window.confirm(`Delete grade ${grade.name}?`)) return;
    setBusyKey(`grade-${grade.id}`);
    setError(null);
    try {
      const response = await fetch(`${backendUrl}/api/core/grades/${grade.id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      if (!response.ok) {
        const body = await safeJson(response);
        throw new Error(body.message || "Failed to delete grade");
      }
      await fetchDashboard();
    } catch (err: any) {
      setError(err.message || "Failed to delete grade");
    } finally {
      setBusyKey(null);
    }
  };

  const handleCreateSection = async (event: FormEvent) => {
    event.preventDefault();
    if (!sectionForm.gradeId || !sectionForm.label) return;

    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch(`${backendUrl}/api/core/sections`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ gradeId: sectionForm.gradeId, label: sectionForm.label }),
      });
      if (!response.ok) {
        const body = await safeJson(response);
        throw new Error(body.message || "Failed to create section");
      }
      setSectionForm({ gradeId: "", label: "" });
      await fetchDashboard();
    } catch (err: any) {
      setError(err.message || "Failed to create section");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSection = async (section: SectionItem) => {
    if (!window.confirm(`Delete section ${section.label}?`)) return;
    setBusyKey(`section-${section.id}`);
    setError(null);
    try {
      const response = await fetch(`${backendUrl}/api/core/sections/${section.id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      if (!response.ok) {
        const body = await safeJson(response);
        throw new Error(body.message || "Failed to delete section");
      }
      await fetchDashboard();
    } catch (err: any) {
      setError(err.message || "Failed to delete section");
    } finally {
      setBusyKey(null);
    }
  };

  const handleCreateSubject = async (event: FormEvent) => {
    event.preventDefault();
    if (!subjectForm.schoolId || !subjectForm.code || !subjectForm.name) return;

    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch(`${backendUrl}/api/core/subjects`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ schoolId: subjectForm.schoolId, code: subjectForm.code, name: subjectForm.name }),
      });
      if (!response.ok) {
        const body = await safeJson(response);
        throw new Error(body.message || "Failed to create subject");
      }
      setSubjectForm((prev) => ({ ...prev, code: "", name: "" }));
      await fetchDashboard();
    } catch (err: any) {
      setError(err.message || "Failed to create subject");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSubject = async (subject: SubjectItem) => {
    if (!window.confirm(`Delete subject ${subject.name}?`)) return;
    setBusyKey(`subject-${subject.id}`);
    setError(null);
    try {
      const response = await fetch(`${backendUrl}/api/core/subjects/${subject.id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      if (!response.ok) {
        const body = await safeJson(response);
        throw new Error(body.message || "Failed to delete subject");
      }
      await fetchDashboard();
    } catch (err: any) {
      setError(err.message || "Failed to delete subject");
    } finally {
      setBusyKey(null);
    }
  };

  const handleResolveComplaint = async (complaint: ComplaintItem) => {
    setBusyKey(`complaint-${complaint.id}`);
    setError(null);
    try {
      const response = await fetch(`${backendUrl}/api/complaints/${complaint.id}`, {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify({ status: "resolved", resolutionNote: "Resolved by admin control center" }),
      });
      if (!response.ok) {
        const body = await safeJson(response);
        throw new Error(body.message || "Failed to update complaint");
      }
      await fetchDashboard();
    } catch (err: any) {
      setError(err.message || "Failed to update complaint");
    } finally {
      setBusyKey(null);
    }
  };

  const fetchSchoolSettings = async (schoolId: string) => {
    if (!schoolId) return;
    setActiveSchoolSettingsId(schoolId);
    setError(null);
    try {
      const response = await fetch(`${backendUrl}/api/core/schools/${schoolId}/settings`, {
        headers: authHeaders(),
      });
      if (!response.ok) {
        const body = await safeJson(response);
        throw new Error(body.message || "Failed to fetch school settings");
      }
      const data = await response.json();
      setSchoolSettings({
        teacherAttendanceEnabled: Boolean(data.teacherAttendanceEnabled),
        faceAttendanceEnabled: Boolean(data.faceAttendanceEnabled),
        multiFaceAttendanceEnabled: Boolean(data.multiFaceAttendanceEnabled),
        rfidEnabled: Boolean(data.rfidEnabled),
      });
    } catch (err: any) {
      setError(err.message || "Failed to fetch school settings");
    }
  };

  const handleSaveSchoolSettings = async () => {
    if (!activeSchoolSettingsId) return;
    setBusyKey(`settings-${activeSchoolSettingsId}`);
    setError(null);
    try {
      const response = await fetch(`${backendUrl}/api/core/schools/${activeSchoolSettingsId}/settings`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify(schoolSettings),
      });
      if (!response.ok) {
        const body = await safeJson(response);
        throw new Error(body.message || "Failed to save school settings");
      }
      await fetchDashboard();
    } catch (err: any) {
      setError(err.message || "Failed to save school settings");
    } finally {
      setBusyKey(null);
    }
  };

  const statCards = [
    { label: "Schools", value: stats.schools, icon: School },
    { label: "Teachers", value: stats.teachers, icon: Users },
    { label: "Students", value: stats.students, icon: GraduationCap },
    { label: "Classrooms", value: stats.classrooms, icon: Building2 },
  ];

  return (
    <div className="min-h-screen bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:4rem_4rem] bg-slate-50 dark:bg-slate-950 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-700/80 bg-white/85 dark:bg-slate-900/80 backdrop-blur-md shadow-sm px-4 py-4 sm:px-6 sm:py-5 flex items-center justify-between">
          <div>
            <p className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-medium border border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/40 dark:bg-blue-900/20 dark:text-blue-300 mb-3">
              Platform Control Center
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground">Platform-wide management and data operations</p>
            <p className="text-xs text-muted-foreground mt-1">Create, update, and delete controls are available for all core entities.</p>
          </div>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-red-200 dark:border-red-900/40 bg-red-50/80 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-700 dark:text-red-300 text-sm"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm dark:bg-red-950/30 dark:border-red-900/40 dark:text-red-300">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {statCards.map((card) => {
            const Icon = card.icon;
            const accent = {
              Schools: "from-blue-500 to-cyan-500",
              Teachers: "from-purple-500 to-violet-500",
              Students: "from-emerald-500 to-teal-500",
              Classrooms: "from-orange-500 to-amber-500",
            }[card.label] || "from-primary to-primary";
            return (
              <div key={card.label} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">{card.label}</span>
                  <span className={`inline-flex p-1.5 rounded-md bg-gradient-to-br ${accent} text-white`}>
                    <Icon className="w-4 h-4" />
                  </span>
                </div>
                <p className="text-2xl font-bold">{loading ? "..." : card.value}</p>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 shadow-sm">
            <p className="text-xs text-muted-foreground">Open Complaints</p>
            <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {complaints.filter((item) => item.status === "open" || item.status === "in_progress").length}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 shadow-sm">
            <p className="text-xs text-muted-foreground">Blocked Accounts</p>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">
              {adminUsers.filter((item) => item.status === "blocked").length}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 shadow-sm">
            <p className="text-xs text-muted-foreground">Active Notifications</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{notifications.length}</p>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-start gap-3">
            <span className="inline-flex p-2 rounded-lg bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
              <Landmark className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-sm font-semibold">Government Programs and Schemes</h2>
              <p className="text-xs text-muted-foreground mt-1">
                Open full CRUD controls to add, edit, and delete every scheme detail.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => router.push("/admin/programs")}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm"
          >
            Manage Programs
          </button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
          <form onSubmit={handleCreateSchool} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 space-y-3 shadow-sm">
            <h2 className="font-semibold text-sm uppercase tracking-wide text-blue-600 dark:text-blue-400">Create School</h2>
            <input
              value={schoolForm.name}
              onChange={(e) => setSchoolForm((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="School name"
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent px-3 py-2 text-sm"
              required
            />
            <input
              value={schoolForm.district}
              onChange={(e) => setSchoolForm((prev) => ({ ...prev, district: e.target.value }))}
              placeholder="District"
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent px-3 py-2 text-sm"
              required
            />
            <button disabled={submitting} className="w-full rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2 text-sm font-medium disabled:opacity-60">
              Add School
            </button>
          </form>

          <form onSubmit={handleCreateTeacher} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 space-y-3 shadow-sm">
            <h2 className="font-semibold text-sm uppercase tracking-wide text-purple-600 dark:text-purple-400">Create Teacher</h2>
            <select
              value={teacherForm.schoolId}
              onChange={(e) => setTeacherForm((prev) => ({ ...prev, schoolId: e.target.value }))}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent px-3 py-2 text-sm"
              required
            >
              <option value="">Select school</option>
              {schools.map((school) => (
                <option key={school.id} value={school.id}>
                  {school.name}
                </option>
              ))}
            </select>
            <input
              value={teacherForm.firstName}
              onChange={(e) => setTeacherForm((prev) => ({ ...prev, firstName: e.target.value }))}
              placeholder="First name"
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent px-3 py-2 text-sm"
              required
            />
            <input
              value={teacherForm.lastName}
              onChange={(e) => setTeacherForm((prev) => ({ ...prev, lastName: e.target.value }))}
              placeholder="Last name"
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent px-3 py-2 text-sm"
              required
            />
            <input
              type="email"
              value={teacherForm.email}
              onChange={(e) => setTeacherForm((prev) => ({ ...prev, email: e.target.value }))}
              placeholder="Email"
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent px-3 py-2 text-sm"
              required
            />
            <button disabled={submitting} className="w-full rounded-lg bg-gradient-to-r from-purple-600 to-violet-600 text-white py-2 text-sm font-medium disabled:opacity-60">
              Add Teacher
            </button>
          </form>

          <form onSubmit={handleCreateStudent} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 space-y-3 shadow-sm">
            <h2 className="font-semibold text-sm uppercase tracking-wide text-emerald-600 dark:text-emerald-400">Create Student</h2>
            <select
              value={studentForm.schoolId}
              onChange={(e) =>
                setStudentForm({
                  schoolId: e.target.value,
                  classroomId: "",
                  classTeacherId: "",
                  code: studentForm.code,
                  firstName: studentForm.firstName,
                  lastName: studentForm.lastName,
                })
              }
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent px-3 py-2 text-sm"
              required
            >
              <option value="">Select school</option>
              {schools.map((school) => (
                <option key={school.id} value={school.id}>
                  {school.name}
                </option>
              ))}
            </select>
            <select
              value={studentForm.classroomId}
              onChange={(e) => setStudentForm((prev) => ({ ...prev, classroomId: e.target.value }))}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent px-3 py-2 text-sm"
              required
            >
              <option value="">Select classroom</option>
              {selectedSchoolClassrooms.map((classroom) => (
                <option key={classroom.id} value={classroom.id}>
                  {(classroom.grade?.name || "Classroom") + (classroom.section?.label ? ` ${classroom.section.label}` : "")}
                </option>
              ))}
            </select>
            <select
              value={studentForm.classTeacherId}
              onChange={(e) => setStudentForm((prev) => ({ ...prev, classTeacherId: e.target.value }))}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent px-3 py-2 text-sm"
              required
            >
              <option value="">Select class teacher</option>
              {selectedSchoolTeachers.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.firstName} {teacher.lastName}
                </option>
              ))}
            </select>
            <input
              value={studentForm.code}
              onChange={(e) => setStudentForm((prev) => ({ ...prev, code: e.target.value }))}
              placeholder="Student code"
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent px-3 py-2 text-sm"
              required
            />
            <input
              value={studentForm.firstName}
              onChange={(e) => setStudentForm((prev) => ({ ...prev, firstName: e.target.value }))}
              placeholder="First name"
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent px-3 py-2 text-sm"
              required
            />
            <input
              value={studentForm.lastName}
              onChange={(e) => setStudentForm((prev) => ({ ...prev, lastName: e.target.value }))}
              placeholder="Last name"
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent px-3 py-2 text-sm"
              required
            />
            <button disabled={submitting} className="w-full rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-2 text-sm font-medium disabled:opacity-60">
              Add Student
            </button>
          </form>

          <form onSubmit={handleCreateClassroom} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 space-y-3 shadow-sm">
            <h2 className="font-semibold text-sm uppercase tracking-wide text-orange-600 dark:text-orange-400">Create Classroom</h2>
            <select
              value={classroomForm.schoolId}
              onChange={(e) => setClassroomForm((prev) => ({ ...prev, schoolId: e.target.value, gradeId: "", sectionId: "" }))}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent px-3 py-2 text-sm"
              required
            >
              <option value="">Select school</option>
              {schools.map((school) => (
                <option key={school.id} value={school.id}>{school.name}</option>
              ))}
            </select>
            <select
              value={classroomForm.gradeId}
              onChange={(e) => setClassroomForm((prev) => ({ ...prev, gradeId: e.target.value, sectionId: "" }))}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent px-3 py-2 text-sm"
              required
            >
              <option value="">Select grade</option>
              {selectedSchoolGrades.map((grade) => (
                <option key={grade.id} value={grade.id}>{grade.name}</option>
              ))}
            </select>
            <select
              value={classroomForm.sectionId}
              onChange={(e) => setClassroomForm((prev) => ({ ...prev, sectionId: e.target.value }))}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent px-3 py-2 text-sm"
              required
            >
              <option value="">Select section</option>
              {selectedGradeSections.map((section) => (
                <option key={section.id} value={section.id}>{section.label}</option>
              ))}
            </select>
            <input
              value={classroomForm.academicYear}
              onChange={(e) => setClassroomForm((prev) => ({ ...prev, academicYear: e.target.value }))}
              placeholder="Academic year"
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent px-3 py-2 text-sm"
              required
            />
            <button disabled={submitting} className="w-full rounded-lg bg-gradient-to-r from-orange-600 to-amber-600 text-white py-2 text-sm font-medium disabled:opacity-60">
              Add Classroom
            </button>
          </form>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <div className="xl:col-span-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Entity Search</p>
            <input
              value={entitySearch}
              onChange={(e) => setEntitySearch(e.target.value)}
              placeholder="Search schools, teachers, students, classrooms"
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent px-3 py-2 text-sm"
            />
          </div>

          <section className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 shadow-sm">
            <h3 className="font-semibold mb-3">Manage Schools</h3>
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {filteredSchools.length === 0 && <p className="text-sm text-muted-foreground">No schools found.</p>}
              {filteredSchools.map((school) => (
                <div key={school.id} className="flex items-center justify-between rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm bg-slate-50/60 dark:bg-slate-800/30">
                  <div>
                    <p className="font-medium">{school.name}</p>
                    <p className="text-xs text-muted-foreground">{school.district}</p>
                  </div>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => openEditSchool(school)} className="px-2 py-1 rounded border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800" title="Edit school">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button type="button" onClick={() => handleDeleteSchool(school)} disabled={busyKey === `school-${school.id}`} className="px-2 py-1 rounded border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-60" title="Delete school">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 shadow-sm">
            <h3 className="font-semibold mb-3">Manage Teachers</h3>
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {filteredTeachers.length === 0 && <p className="text-sm text-muted-foreground">No teachers found.</p>}
              {filteredTeachers.map((teacher) => (
                <div key={teacher.id} className="flex items-center justify-between rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm bg-slate-50/60 dark:bg-slate-800/30">
                  <div>
                    <p className="font-medium">{teacher.firstName} {teacher.lastName}</p>
                    <p className="text-xs text-muted-foreground">{teacher.email}</p>
                  </div>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => openEditTeacher(teacher)} className="px-2 py-1 rounded border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800" title="Edit teacher">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button type="button" onClick={() => handleDeleteTeacher(teacher)} disabled={busyKey === `teacher-${teacher.id}`} className="px-2 py-1 rounded border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-60" title="Delete teacher">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 shadow-sm">
            <h3 className="font-semibold mb-3">Manage Students</h3>
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {filteredStudents.length === 0 && <p className="text-sm text-muted-foreground">No students found.</p>}
              {filteredStudents.map((student) => (
                <div key={student.id} className="flex items-center justify-between rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm bg-slate-50/60 dark:bg-slate-800/30">
                  <div>
                    <p className="font-medium">{student.firstName} {student.lastName}</p>
                    <p className="text-xs text-muted-foreground">{student.code}</p>
                  </div>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => openEditStudent(student)} className="px-2 py-1 rounded border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800" title="Edit student">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button type="button" onClick={() => handleDeleteStudent(student)} disabled={busyKey === `student-${student.id}`} className="px-2 py-1 rounded border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-60" title="Delete student">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 shadow-sm">
            <h3 className="font-semibold mb-3">Manage Classrooms</h3>
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {filteredClassrooms.length === 0 && <p className="text-sm text-muted-foreground">No classrooms found.</p>}
              {filteredClassrooms.map((classroom) => (
                <div key={classroom.id} className="flex items-center justify-between rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm bg-slate-50/60 dark:bg-slate-800/30">
                  <div>
                    <p className="font-medium">{classroomLabel(classroom)}</p>
                    <p className="text-xs text-muted-foreground">ID: {classroom.id}</p>
                  </div>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => openEditClassroom(classroom)} className="px-2 py-1 rounded border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800" title="Edit classroom">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button type="button" onClick={() => handleDeleteClassroom(classroom)} disabled={busyKey === `classroom-${classroom.id}`} className="px-2 py-1 rounded border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-60" title="Delete classroom">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <section className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 shadow-sm space-y-3">
            <h3 className="font-semibold">Platform Accounts (God Mode)</h3>
            <form onSubmit={handleCreateAccount} className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                value={accountForm.email}
                onChange={(e) => setAccountForm((prev) => ({ ...prev, email: e.target.value }))}
                placeholder="Email"
                className="rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent px-3 py-2 text-sm"
                required
              />
              <input
                value={accountForm.password}
                onChange={(e) => setAccountForm((prev) => ({ ...prev, password: e.target.value }))}
                placeholder="Password"
                className="rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent px-3 py-2 text-sm"
                required
              />
              <input
                value={accountForm.phoneNumber}
                onChange={(e) => setAccountForm((prev) => ({ ...prev, phoneNumber: e.target.value }))}
                placeholder="Phone"
                className="rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent px-3 py-2 text-sm"
                required
              />
              <select
                value={accountForm.role}
                onChange={(e) => setAccountForm((prev) => ({ ...prev, role: e.target.value, teacherId: "", studentId: "" }))}
                className="rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent px-3 py-2 text-sm"
              >
                <option value="ADMIN">ADMIN</option>
                <option value="GOVERNMENT">GOVERNMENT</option>
                <option value="PRINCIPAL">PRINCIPAL</option>
                <option value="TEACHER">TEACHER</option>
                <option value="STUDENT">STUDENT</option>
              </select>
              <select
                value={accountForm.schoolId}
                onChange={(e) => setAccountForm((prev) => ({ ...prev, schoolId: e.target.value, teacherId: "", studentId: "" }))}
                className="rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent px-3 py-2 text-sm"
              >
                <option value="">Select school</option>
                {schools.map((school) => (
                  <option key={school.id} value={school.id}>{school.name}</option>
                ))}
              </select>
              {accountForm.role === "TEACHER" && (
                <select
                  value={accountForm.teacherId}
                  onChange={(e) => setAccountForm((prev) => ({ ...prev, teacherId: e.target.value }))}
                  className="rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent px-3 py-2 text-sm"
                  required
                >
                  <option value="">Select teacher</option>
                  {selectedSchoolTeachersForAccount.map((teacher) => (
                    <option key={teacher.id} value={teacher.id}>{teacher.firstName} {teacher.lastName}</option>
                  ))}
                </select>
              )}
              {accountForm.role === "STUDENT" && (
                <select
                  value={accountForm.studentId}
                  onChange={(e) => setAccountForm((prev) => ({ ...prev, studentId: e.target.value }))}
                  className="rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent px-3 py-2 text-sm"
                  required
                >
                  <option value="">Select student</option>
                  {selectedSchoolStudents.map((student) => (
                    <option key={student.id} value={student.id}>{student.firstName} {student.lastName} ({student.code})</option>
                  ))}
                </select>
              )}
              <button disabled={submitting} className="sm:col-span-2 rounded-lg bg-gradient-to-r from-indigo-600 to-blue-600 text-white py-2 text-sm font-medium disabled:opacity-60">
                Create Account
              </button>
            </form>

            <input
              value={accountSearch}
              onChange={(e) => setAccountSearch(e.target.value)}
              placeholder="Search accounts by email, role, status"
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent px-3 py-2 text-sm"
            />

            <div className="space-y-2 max-h-80 overflow-y-auto">
              {filteredAdminUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2 text-sm bg-slate-50/60 dark:bg-slate-800/30">
                  <div>
                    <p className="font-medium">{user.email}</p>
                    <p className="text-xs text-muted-foreground">{user.role} · {user.status}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggleUserStatus(user)}
                      disabled={busyKey === `user-${user.id}`}
                      className="px-2 py-1 rounded border border-amber-200 text-amber-700 hover:bg-amber-50 disabled:opacity-60"
                    >
                      {user.status === "active" ? "Block" : "Unblock"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteAccount(user)}
                      disabled={busyKey === `user-${user.id}`}
                      className="px-2 py-1 rounded border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-60"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 shadow-sm space-y-3">
            <h3 className="font-semibold">Academic Master Data</h3>

            <form onSubmit={handleCreateGrade} className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <select
                value={gradeForm.schoolId}
                onChange={(e) => setGradeForm((prev) => ({ ...prev, schoolId: e.target.value }))}
                className="rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent px-3 py-2 text-sm"
                required
              >
                <option value="">School</option>
                {schools.map((school) => (
                  <option key={school.id} value={school.id}>{school.name}</option>
                ))}
              </select>
              <input
                value={gradeForm.name}
                onChange={(e) => setGradeForm((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Grade name"
                className="rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent px-3 py-2 text-sm"
                required
              />
              <input
                type="number"
                value={gradeForm.level}
                onChange={(e) => setGradeForm((prev) => ({ ...prev, level: Number(e.target.value) || 1 }))}
                placeholder="Level"
                className="rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent px-3 py-2 text-sm"
                required
              />
              <button className="sm:col-span-3 rounded-lg bg-primary text-white py-2 text-sm">Add Grade</button>
            </form>

            <form onSubmit={handleCreateSection} className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <select
                value={sectionForm.gradeId}
                onChange={(e) => setSectionForm((prev) => ({ ...prev, gradeId: e.target.value }))}
                className="rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent px-3 py-2 text-sm"
                required
              >
                <option value="">Grade</option>
                {grades.map((grade) => (
                  <option key={grade.id} value={grade.id}>{grade.name}</option>
                ))}
              </select>
              <input
                value={sectionForm.label}
                onChange={(e) => setSectionForm((prev) => ({ ...prev, label: e.target.value }))}
                placeholder="Section label"
                className="rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent px-3 py-2 text-sm"
                required
              />
              <button className="sm:col-span-2 rounded-lg bg-primary text-white py-2 text-sm">Add Section</button>
            </form>

            <form onSubmit={handleCreateSubject} className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <select
                value={subjectForm.schoolId}
                onChange={(e) => setSubjectForm((prev) => ({ ...prev, schoolId: e.target.value }))}
                className="rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent px-3 py-2 text-sm"
                required
              >
                <option value="">School</option>
                {schools.map((school) => (
                  <option key={school.id} value={school.id}>{school.name}</option>
                ))}
              </select>
              <input
                value={subjectForm.code}
                onChange={(e) => setSubjectForm((prev) => ({ ...prev, code: e.target.value.toUpperCase() }))}
                placeholder="Code"
                className="rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent px-3 py-2 text-sm"
                required
              />
              <input
                value={subjectForm.name}
                onChange={(e) => setSubjectForm((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Subject name"
                className="rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent px-3 py-2 text-sm"
                required
              />
              <button className="sm:col-span-3 rounded-lg bg-primary text-white py-2 text-sm">Add Subject</button>
            </form>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-2 max-h-36 overflow-y-auto">
                <p className="text-xs font-semibold mb-2">Grades</p>
                {grades.map((grade) => (
                  <div key={grade.id} className="flex justify-between items-center text-xs py-1">
                    <span>{grade.name}</span>
                    <button type="button" onClick={() => handleDeleteGrade(grade)} disabled={busyKey === `grade-${grade.id}`} className="text-red-600">Delete</button>
                  </div>
                ))}
              </div>
              <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-2 max-h-36 overflow-y-auto">
                <p className="text-xs font-semibold mb-2">Sections</p>
                {sections.map((section) => (
                  <div key={section.id} className="flex justify-between items-center text-xs py-1">
                    <span>{section.label}</span>
                    <button type="button" onClick={() => handleDeleteSection(section)} disabled={busyKey === `section-${section.id}`} className="text-red-600">Delete</button>
                  </div>
                ))}
              </div>
              <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-2 max-h-36 overflow-y-auto">
                <p className="text-xs font-semibold mb-2">Subjects</p>
                {subjects.map((subject) => (
                  <div key={subject.id} className="flex justify-between items-center text-xs py-1">
                    <span>{subject.code}</span>
                    <button type="button" onClick={() => handleDeleteSubject(subject)} disabled={busyKey === `subject-${subject.id}`} className="text-red-600">Delete</button>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 shadow-sm space-y-3">
            <h3 className="font-semibold">Operations & Compliance</h3>

            <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-3">
              <p className="text-xs font-semibold mb-2">School Feature Controls</p>
              <div className="space-y-2">
                <select
                  value={activeSchoolSettingsId}
                  onChange={(e) => setActiveSchoolSettingsId(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent px-3 py-2 text-sm"
                >
                  <option value="">Select school</option>
                  {schools.map((school) => (
                    <option key={school.id} value={school.id}>{school.name}</option>
                  ))}
                </select>

                <label className="flex items-center justify-between text-sm">
                  Teacher attendance
                  <input type="checkbox" checked={schoolSettings.teacherAttendanceEnabled} onChange={(e) => setSchoolSettings((prev) => ({ ...prev, teacherAttendanceEnabled: e.target.checked }))} />
                </label>
                <label className="flex items-center justify-between text-sm">
                  Face attendance
                  <input type="checkbox" checked={schoolSettings.faceAttendanceEnabled} onChange={(e) => setSchoolSettings((prev) => ({ ...prev, faceAttendanceEnabled: e.target.checked }))} />
                </label>
                <label className="flex items-center justify-between text-sm">
                  Multi-face mode
                  <input type="checkbox" checked={schoolSettings.multiFaceAttendanceEnabled} onChange={(e) => setSchoolSettings((prev) => ({ ...prev, multiFaceAttendanceEnabled: e.target.checked }))} />
                </label>
                <label className="flex items-center justify-between text-sm">
                  RFID attendance
                  <input type="checkbox" checked={schoolSettings.rfidEnabled} onChange={(e) => setSchoolSettings((prev) => ({ ...prev, rfidEnabled: e.target.checked }))} />
                </label>

                <button type="button" onClick={handleSaveSchoolSettings} disabled={busyKey === `settings-${activeSchoolSettingsId}`} className="w-full rounded-lg bg-primary text-white py-2 text-sm">
                  Save Settings
                </button>
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-3 max-h-64 overflow-y-auto">
              <p className="text-xs font-semibold mb-2">Complaint Moderation</p>
              {complaints.length === 0 && <p className="text-sm text-muted-foreground">No complaints found.</p>}
              <div className="space-y-2">
                {complaints.slice(0, 20).map((complaint) => (
                  <div key={complaint.id} className="rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2">
                    <p className="text-sm font-medium">{complaint.category || "General"} · {complaint.status}</p>
                    <p className="text-xs text-muted-foreground line-clamp-2">{complaint.description || "No description"}</p>
                    {complaint.status !== "resolved" && (
                      <button
                        type="button"
                        onClick={() => handleResolveComplaint(complaint)}
                        disabled={busyKey === `complaint-${complaint.id}`}
                        className="mt-2 rounded-md border border-emerald-200 text-emerald-700 px-2 py-1 text-xs"
                      >
                        Mark Resolved
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>

      {editEntity && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-slate-100 to-blue-50 dark:from-slate-900 dark:to-slate-800">
              <h3 className="text-sm font-semibold">
                Edit {editEntity.type.charAt(0).toUpperCase() + editEntity.type.slice(1)}
              </h3>
              <button
                type="button"
                onClick={() => setEditEntity(null)}
                className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-3">
              {editEntity.type === "school" && (
                <>
                  <input
                    value={editEntity.name}
                    onChange={(e) => setEditEntity({ ...editEntity, name: e.target.value })}
                    placeholder="School name"
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent px-3 py-2 text-sm"
                  />
                  <input
                    value={editEntity.district}
                    onChange={(e) => setEditEntity({ ...editEntity, district: e.target.value })}
                    placeholder="District"
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent px-3 py-2 text-sm"
                  />
                </>
              )}

              {editEntity.type === "teacher" && (
                <>
                  <input
                    value={editEntity.firstName}
                    onChange={(e) => setEditEntity({ ...editEntity, firstName: e.target.value })}
                    placeholder="First name"
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent px-3 py-2 text-sm"
                  />
                  <input
                    value={editEntity.lastName}
                    onChange={(e) => setEditEntity({ ...editEntity, lastName: e.target.value })}
                    placeholder="Last name"
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent px-3 py-2 text-sm"
                  />
                  <input
                    type="email"
                    value={editEntity.email}
                    onChange={(e) => setEditEntity({ ...editEntity, email: e.target.value })}
                    placeholder="Email"
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent px-3 py-2 text-sm"
                  />
                </>
              )}

              {editEntity.type === "student" && (
                <>
                  <input
                    value={editEntity.firstName}
                    onChange={(e) => setEditEntity({ ...editEntity, firstName: e.target.value })}
                    placeholder="First name"
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent px-3 py-2 text-sm"
                  />
                  <input
                    value={editEntity.lastName}
                    onChange={(e) => setEditEntity({ ...editEntity, lastName: e.target.value })}
                    placeholder="Last name"
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent px-3 py-2 text-sm"
                  />
                </>
              )}

              {editEntity.type === "classroom" && (
                <input
                  value={editEntity.academicYear}
                  onChange={(e) => setEditEntity({ ...editEntity, academicYear: e.target.value })}
                  placeholder="Academic year"
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent px-3 py-2 text-sm"
                />
              )}
            </div>

            <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditEntity(null)}
                className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-sm hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                disabled={savingEdit}
                className="px-3 py-2 rounded-lg bg-primary text-white text-sm font-medium disabled:opacity-60"
              >
                {savingEdit ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
