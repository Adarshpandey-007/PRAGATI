export type UserRole = "STUDENT" | "TEACHER" | "PRINCIPAL" | "GOVERNMENT" | "ADMIN";

export interface AuthSession {
  token: string;
  role: UserRole;
  userId: string;
  studentId?: string | null;
  teacherId?: string | null;
  schoolId?: string | null;
  name?: string | null;
}

const AUTH_KEYS = {
  token: "pragati_token",
  role: "pragati_role",
  userId: "pragati_userId",
  studentId: "pragati_studentId",
  teacherId: "pragati_teacherId",
  schoolId: "pragati_schoolId",
  name: "pragati_name",
} as const;

function canUseStorage(): boolean {
  return typeof window !== "undefined";
}

export function saveAuthSession(session: AuthSession): void {
  if (!canUseStorage()) return;

  localStorage.setItem(AUTH_KEYS.token, session.token);
  localStorage.setItem(AUTH_KEYS.role, session.role);
  localStorage.setItem(AUTH_KEYS.userId, session.userId);

  if (session.studentId) {
    localStorage.setItem(AUTH_KEYS.studentId, session.studentId);
  } else {
    localStorage.removeItem(AUTH_KEYS.studentId);
  }

  if (session.teacherId) {
    localStorage.setItem(AUTH_KEYS.teacherId, session.teacherId);
  } else {
    localStorage.removeItem(AUTH_KEYS.teacherId);
  }

  if (session.schoolId) {
    localStorage.setItem(AUTH_KEYS.schoolId, session.schoolId);
  } else {
    localStorage.removeItem(AUTH_KEYS.schoolId);
  }

  if (session.name) {
    localStorage.setItem(AUTH_KEYS.name, session.name);
  }
}

export function getAuthSession(): AuthSession | null {
  if (!canUseStorage()) return null;

  const token = localStorage.getItem(AUTH_KEYS.token);
  const role = localStorage.getItem(AUTH_KEYS.role) as UserRole | null;
  const userId = localStorage.getItem(AUTH_KEYS.userId);

  if (!token || !role || !userId) {
    return null;
  }

  return {
    token,
    role,
    userId,
    studentId: localStorage.getItem(AUTH_KEYS.studentId),
    teacherId: localStorage.getItem(AUTH_KEYS.teacherId),
    schoolId: localStorage.getItem(AUTH_KEYS.schoolId),
    name: localStorage.getItem(AUTH_KEYS.name),
  };
}

export function getAuthToken(): string | null {
  if (!canUseStorage()) return null;
  return localStorage.getItem(AUTH_KEYS.token);
}

export function clearAuthSession(): void {
  if (!canUseStorage()) return;

  localStorage.removeItem(AUTH_KEYS.token);
  localStorage.removeItem(AUTH_KEYS.role);
  localStorage.removeItem(AUTH_KEYS.userId);
  localStorage.removeItem(AUTH_KEYS.name);
  localStorage.removeItem(AUTH_KEYS.studentId);
  localStorage.removeItem(AUTH_KEYS.teacherId);
  localStorage.removeItem(AUTH_KEYS.schoolId);
}
