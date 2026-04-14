require("dotenv").config();
const express = require("express");
const cors = require("cors");
const {
  users,
  schools,
  teachers,
  students,
  classrooms,
  complaints,
  notifications,
  timetableByTeacher,
  programs,
} = require("./data");
const { signToken, requireAuth, EXPIRES_IN } = require("./auth");
const { loadStore, saveStore } = require("./storage");

const app = express();
const port = Number(process.env.PORT || 4000);
const jwtSecret = process.env.AUTH_JWT_SECRET || "dev-secret-change-me";
const MOCK_TAG = "MOCK_TEST_DATA";

const schoolSettingsById = schools.reduce((acc, school) => {
  acc[school.id] = {
    teacherAttendanceEnabled: true,
    faceAttendanceEnabled: true,
    multiFaceAttendanceEnabled: true,
    rfidEnabled: true,
    updatedAt: new Date().toISOString(),
  };
  return acc;
}, {});

const gradesStore = [
  { id: "g10", schoolId: "1", name: "Grade 10", level: 10, isActive: true },
];

const sectionsStore = [
  { id: "a", gradeId: "g10", label: "A" },
];

const subjectsStore = [
  { id: "sub1", schoolId: "1", code: "MATH", name: "Mathematics" },
];

const timetableByClassroom = {};
Object.values(timetableByTeacher).forEach((entries) => {
  entries.forEach((entry) => {
    const classroomId = entry.classroom?.id;
    if (!classroomId) return;
    if (!timetableByClassroom[classroomId]) timetableByClassroom[classroomId] = [];
    timetableByClassroom[classroomId].push({
      id: entry.id,
      weekDay: entry.dayOfWeek,
      period: timetableByClassroom[classroomId].length + 1,
      startTime: entry.startTime,
      endTime: entry.endTime,
      label: entry.subject?.name || "Class",
      location: entry.room,
      teacherSubject: {
        subject: { name: entry.subject?.name || "Subject" },
        teacher: { user: { firstName: "Teacher", lastName: "" } },
      },
    });
  });
});

const geoAttendanceByDate = {};

function makeId(prefix, items) {
  const next =
    Math.max(0, ...items.map((item) => Number.parseInt(String(item.id).replace(/^[^0-9]*/, ""), 10) || 0)) +
    1;
  return `${prefix}${next}`;
}

function isPrivilegedRole(role) {
  return ["ADMIN", "GOVERNMENT", "PRINCIPAL"].includes(role);
}

function hasRole(user, roles) {
  return user && roles.includes(user.role);
}

function canManageRole(managerRole, targetRole) {
  const matrix = {
    ADMIN: ["ADMIN", "GOVERNMENT", "PRINCIPAL", "TEACHER", "STUDENT"],
    GOVERNMENT: ["PRINCIPAL"],
    PRINCIPAL: ["TEACHER", "STUDENT"],
    TEACHER: [],
    STUDENT: [],
  };
  return (matrix[managerRole] || []).includes(targetRole);
}

function userScopeFilter(actor, user) {
  if (actor.role === "ADMIN") return true;
  if (actor.role === "GOVERNMENT") {
    return ["PRINCIPAL", "TEACHER", "STUDENT"].includes(user.role);
  }
  if (actor.role === "PRINCIPAL") {
    return ["TEACHER", "STUDENT"].includes(user.role) && String(user.schoolId) === String(actor.schoolId);
  }
  return String(user.id) === String(actor.userId);
}

function safeUser(user) {
  return {
    id: user.id,
    email: user.email,
    phoneNumber: user.phoneNumber || null,
    role: user.role,
    status: user.status || "active",
    studentId: user.studentId || null,
    teacherId: user.teacherId || null,
    schoolId: user.schoolId || null,
    createdAt: user.createdAt || null,
    updatedAt: user.updatedAt || null,
    mockTag: user.mockTag,
  };
}

function replaceArrayContents(target, source) {
  target.splice(0, target.length, ...(Array.isArray(source) ? source : []));
}

function replaceObjectContents(target, source) {
  Object.keys(target).forEach((key) => delete target[key]);
  if (source && typeof source === "object") {
    Object.assign(target, source);
  }
}

function hydratePersistentState(store) {
  if (!store || typeof store !== "object") return;

  if (store.users) replaceArrayContents(users, store.users);
  if (store.schools) replaceArrayContents(schools, store.schools);
  if (store.teachers) replaceArrayContents(teachers, store.teachers);
  if (store.students) replaceArrayContents(students, store.students);
  if (store.classrooms) replaceArrayContents(classrooms, store.classrooms);
  if (store.complaints) replaceArrayContents(complaints, store.complaints);
  if (store.notifications) replaceArrayContents(notifications, store.notifications);
  if (store.programs) replaceArrayContents(programs, store.programs);
  if (store.gradesStore) replaceArrayContents(gradesStore, store.gradesStore);
  if (store.sectionsStore) replaceArrayContents(sectionsStore, store.sectionsStore);
  if (store.subjectsStore) replaceArrayContents(subjectsStore, store.subjectsStore);

  if (store.timetableByTeacher) replaceObjectContents(timetableByTeacher, store.timetableByTeacher);
  if (store.timetableByClassroom) replaceObjectContents(timetableByClassroom, store.timetableByClassroom);
  if (store.schoolSettingsById) replaceObjectContents(schoolSettingsById, store.schoolSettingsById);
  if (store.geoAttendanceByDate) replaceObjectContents(geoAttendanceByDate, store.geoAttendanceByDate);
}

function getPersistentState() {
  return {
    users,
    schools,
    teachers,
    students,
    classrooms,
    complaints,
    notifications,
    programs,
    timetableByTeacher,
    timetableByClassroom,
    schoolSettingsById,
    gradesStore,
    sectionsStore,
    subjectsStore,
    geoAttendanceByDate,
    updatedAt: new Date().toISOString(),
  };
}

function persistState() {
  saveStore(getPersistentState());
}

hydratePersistentState(loadStore());
persistState();

app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  res.on("finish", () => {
    if (["POST", "PUT", "PATCH", "DELETE"].includes(req.method) && res.statusCode < 400) {
      persistState();
    }
  });
  next();
});

function scopeBySchool(items, user, key = "schoolId") {
  if (!user || ["ADMIN", "GOVERNMENT"].includes(user.role)) return items;
  return items.filter((item) => String(item[key]) === String(user.schoolId));
}

function scopeStudentsByUser(items, user) {
  const schoolScoped = scopeBySchool(items, user);
  if (user?.role === "STUDENT" && user.studentId) {
    return schoolScoped.filter((item) => String(item.id) === String(user.studentId));
  }
  return schoolScoped;
}

function normalizeComplaint(raw) {
  const createdAt = raw.createdAt || new Date().toISOString();
  return {
    id: String(raw.id),
    category: raw.category || "liberty",
    status: raw.status || "open",
    description: raw.description || raw.title || "",
    isAnonymous: Boolean(raw.isAnonymous),
    student: raw.student || null,
    classroom: raw.classroom || {
      id: "unknown",
      grade: { name: "Unknown" },
      section: { label: "-" },
    },
    schoolId: String(raw.schoolId || ""),
    resolutionNote: raw.resolutionNote || null,
    resolvedBy: raw.resolvedBy || null,
    resolvedAt: raw.resolvedAt || null,
    createdAt,
    mockTag: raw.mockTag || MOCK_TAG,
    dataLabel: "Mock Test Data",
  };
}

function getScopedComplaints(user) {
  let list = scopeBySchool(complaints, user).map(normalizeComplaint);
  if (user?.role === "STUDENT" && user.studentId) {
    list = list.filter((item) => item.student && String(item.student.id) === String(user.studentId));
  }
  return list;
}

function normalizeProgramPayload(input = {}) {
  const toStringArray = (value) => {
    if (!Array.isArray(value)) return [];
    return value.map((item) => String(item || "").trim()).filter(Boolean);
  };

  const toLinkArray = (value) => {
    if (!Array.isArray(value)) return [];
    return value
      .map((item) => ({
        label: String(item?.label || "").trim(),
        url: String(item?.url || "").trim(),
      }))
      .filter((item) => item.label && item.url);
  };

  return {
    slug: String(input.slug || "").trim(),
    icon: String(input.icon || "📘").trim(),
    title: String(input.title || "").trim(),
    shortDescription: String(input.shortDescription || "").trim(),
    ministry: String(input.ministry || "").trim(),
    practicalUse: String(input.practicalUse || "").trim(),
    eligibility: toStringArray(input.eligibility),
    implementationChecklist: toStringArray(input.implementationChecklist),
    requiredData: toStringArray(input.requiredData),
    keyMetrics: toStringArray(input.keyMetrics),
    officialLinks: toLinkArray(input.officialLinks),
  };
}

function validateProgramPayload(program) {
  if (!program.slug) return "slug is required";
  if (!program.title) return "title is required";
  if (!program.shortDescription) return "shortDescription is required";
  if (!program.ministry) return "ministry is required";
  if (!program.practicalUse) return "practicalUse is required";
  return null;
}

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/programs", (_req, res) => {
  return res.json(programs);
});

app.get("/api/programs/:slug", (req, res) => {
  const item = programs.find((program) => String(program.slug) === String(req.params.slug));
  if (!item) {
    return res.status(404).json({ message: "Program not found" });
  }
  return res.json(item);
});

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body || {};
  const user = users.find((u) => u.email === email);

  if (!user || user.password !== password) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  if (user.status !== "active") {
    return res.status(403).json({ message: "User is blocked" });
  }

  const token = signToken(user, jwtSecret);

  return res.json({
    token,
    expiresIn: EXPIRES_IN,
    userId: user.id,
    role: user.role,
    studentId: user.studentId,
    teacherId: user.teacherId,
    schoolId: user.schoolId,
  });
});

const auth = requireAuth(jwtSecret);

app.post("/api/programs", auth, (req, res) => {
  if (!hasRole(req.user, ["ADMIN", "GOVERNMENT"])) {
    return res.status(403).json({ message: "Insufficient permissions" });
  }

  const payload = normalizeProgramPayload(req.body || {});
  const validationError = validateProgramPayload(payload);
  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  const slugTaken = programs.some((program) => String(program.slug).toLowerCase() === payload.slug.toLowerCase());
  if (slugTaken) {
    return res.status(409).json({ message: "Program slug already exists" });
  }

  const nextProgram = {
    ...payload,
    updatedAt: new Date().toISOString(),
  };
  programs.push(nextProgram);
  return res.status(201).json(nextProgram);
});

app.patch("/api/programs/:slug", auth, (req, res) => {
  if (!hasRole(req.user, ["ADMIN", "GOVERNMENT"])) {
    return res.status(403).json({ message: "Insufficient permissions" });
  }

  const program = programs.find((item) => String(item.slug) === String(req.params.slug));
  if (!program) {
    return res.status(404).json({ message: "Program not found" });
  }

  const payload = normalizeProgramPayload({ ...program, ...(req.body || {}) });
  const validationError = validateProgramPayload(payload);
  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  const duplicateSlug = programs.find(
    (item) => String(item.slug) !== String(req.params.slug) && String(item.slug).toLowerCase() === payload.slug.toLowerCase()
  );
  if (duplicateSlug) {
    return res.status(409).json({ message: "Program slug already exists" });
  }

  Object.assign(program, payload, { updatedAt: new Date().toISOString() });
  return res.json(program);
});

app.delete("/api/programs/:slug", auth, (req, res) => {
  if (!hasRole(req.user, ["ADMIN", "GOVERNMENT"])) {
    return res.status(403).json({ message: "Insufficient permissions" });
  }

  const index = programs.findIndex((program) => String(program.slug) === String(req.params.slug));
  if (index === -1) {
    return res.status(404).json({ message: "Program not found" });
  }

  const deleted = programs.splice(index, 1)[0];
  return res.json({ message: "Program deleted successfully", program: deleted });
});

app.get("/api/auth/users", auth, (req, res) => {
  const list = users.filter((user) => userScopeFilter(req.user, user)).map(safeUser);
  return res.json(list);
});

app.post("/api/auth/users", auth, (req, res) => {
  const actor = req.user;
  const { email, password, phoneNumber, role, studentId, teacherId, schoolId: requestedSchoolId } = req.body || {};

  if (!email || !password || !phoneNumber || !role) {
    return res.status(400).json({ message: "email, password, phoneNumber and role are required" });
  }

  if (!canManageRole(actor.role, role)) {
    return res.status(403).json({ message: "You do not have permission to create this role" });
  }

  const existingEmail = users.find((user) => String(user.email).toLowerCase() === String(email).toLowerCase());
  if (existingEmail) {
    return res.status(409).json({ message: "Email already exists" });
  }

  let schoolId = requestedSchoolId ? String(requestedSchoolId) : String(actor.schoolId || "");
  let resolvedStudentId = null;
  let resolvedTeacherId = null;

  if (role === "STUDENT") {
    if (!studentId) {
      return res.status(400).json({ message: "studentId is required for STUDENT role" });
    }
    const student = students.find((item) => String(item.id) === String(studentId));
    if (!student) return res.status(404).json({ message: "Student not found" });
    schoolId = String(student.schoolId);
    resolvedStudentId = String(student.id);
  }

  if (role === "TEACHER") {
    if (!teacherId) {
      return res.status(400).json({ message: "teacherId is required for TEACHER role" });
    }
    const teacher = teachers.find((item) => String(item.id) === String(teacherId));
    if (!teacher) return res.status(404).json({ message: "Teacher not found" });
    schoolId = String(teacher.schoolId);
    resolvedTeacherId = String(teacher.id);
  }

  if (["PRINCIPAL", "TEACHER", "STUDENT"].includes(role) && !schoolId) {
    return res.status(400).json({ message: "schoolId is required for this role" });
  }

  if (actor.role === "PRINCIPAL" && String(schoolId) !== String(actor.schoolId)) {
    return res.status(403).json({ message: "Principal can only create users in own school" });
  }

  if (actor.role === "GOVERNMENT" && role !== "PRINCIPAL") {
    return res.status(403).json({ message: "Government can only create principal accounts" });
  }

  const newUser = {
    id: makeId("", users),
    email: String(email),
    password: String(password),
    phoneNumber: String(phoneNumber),
    role: String(role),
    studentId: resolvedStudentId,
    teacherId: resolvedTeacherId,
    schoolId: schoolId || null,
    status: "active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  users.push(newUser);
  return res.status(201).json(safeUser(newUser));
});

app.patch("/api/auth/users/:userId", auth, (req, res) => {
  const actor = req.user;
  const target = users.find((user) => String(user.id) === String(req.params.userId));
  if (!target) {
    return res.status(404).json({ message: "User not found" });
  }

  if (!userScopeFilter(actor, target) || !canManageRole(actor.role, target.role)) {
    return res.status(403).json({ message: "You do not have permission to update this user" });
  }

  const { email, phoneNumber, password, status } = req.body || {};

  if (typeof email === "string") {
    const duplicate = users.find(
      (user) => String(user.id) !== String(target.id) && String(user.email).toLowerCase() === email.toLowerCase()
    );
    if (duplicate) {
      return res.status(409).json({ message: "Email already exists" });
    }
    target.email = email;
  }

  if (typeof phoneNumber === "string") target.phoneNumber = phoneNumber;
  if (typeof password === "string" && password.length >= 6) target.password = password;
  if (typeof status === "string") target.status = status;
  target.updatedAt = new Date().toISOString();

  return res.json(safeUser(target));
});

app.delete("/api/auth/users/:userId", auth, (req, res) => {
  const actor = req.user;
  const targetIndex = users.findIndex((user) => String(user.id) === String(req.params.userId));
  if (targetIndex === -1) {
    return res.status(404).json({ message: "User not found" });
  }

  const target = users[targetIndex];
  if (!userScopeFilter(actor, target) || !canManageRole(actor.role, target.role)) {
    return res.status(403).json({ message: "You do not have permission to delete this user" });
  }

  if (target.role === "ADMIN") {
    const adminCount = users.filter((user) => user.role === "ADMIN").length;
    if (adminCount <= 1) {
      return res.status(400).json({ message: "Cannot delete the last admin account" });
    }
  }

  users.splice(targetIndex, 1);
  return res.json({ message: "User deleted successfully" });
});

app.get("/api/core/schools", auth, (req, res) => {
  return res.json(scopeBySchool(schools, req.user));
});

app.post("/api/core/schools", auth, (req, res) => {
  if (!hasRole(req.user, ["ADMIN"])) {
    return res.status(403).json({ message: "Insufficient permissions" });
  }

  const { name, district } = req.body || {};
  if (!name || !district) {
    return res.status(400).json({ message: "name and district are required" });
  }

  const existing = schools.find(
    (school) =>
      String(school.name).toLowerCase() === String(name).toLowerCase() &&
      String(school.district).toLowerCase() === String(district).toLowerCase()
  );
  if (existing) {
    return res.status(409).json({ message: "School already exists" });
  }

  const newSchool = {
    id: makeId("", schools),
    name: String(name),
    district: String(district),
  };
  schools.push(newSchool);
  schoolSettingsById[newSchool.id] = {
    teacherAttendanceEnabled: true,
    faceAttendanceEnabled: true,
    multiFaceAttendanceEnabled: true,
    rfidEnabled: true,
    updatedAt: new Date().toISOString(),
  };

  return res.status(201).json(newSchool);
});

app.patch("/api/core/schools/:schoolId", auth, (req, res) => {
  if (!hasRole(req.user, ["ADMIN"])) {
    return res.status(403).json({ message: "Insufficient permissions" });
  }

  const school = schools.find((item) => String(item.id) === String(req.params.schoolId));
  if (!school) {
    return res.status(404).json({ message: "School not found" });
  }

  const { name, district } = req.body || {};
  if (typeof name === "string") school.name = name;
  if (typeof district === "string") school.district = district;
  return res.json(school);
});

app.delete("/api/core/schools/:schoolId", auth, (req, res) => {
  if (!hasRole(req.user, ["ADMIN"])) {
    return res.status(403).json({ message: "Insufficient permissions" });
  }

  const schoolId = String(req.params.schoolId);
  const schoolIndex = schools.findIndex((item) => String(item.id) === schoolId);
  if (schoolIndex === -1) {
    return res.status(404).json({ message: "School not found" });
  }

  const hasLinkedClassrooms = classrooms.some((item) => String(item.schoolId) === schoolId);
  const hasLinkedTeachers = teachers.some((item) => String(item.schoolId) === schoolId);
  const hasLinkedStudents = students.some((item) => String(item.schoolId) === schoolId);
  if (hasLinkedClassrooms || hasLinkedTeachers || hasLinkedStudents) {
    return res.status(409).json({ message: "Cannot delete school with linked classrooms, teachers, or students" });
  }

  schools.splice(schoolIndex, 1);
  if (schoolSettingsById[schoolId]) delete schoolSettingsById[schoolId];
  return res.json({ message: "School deleted successfully" });
});

app.get("/api/core/students", auth, (req, res) => {
  const schoolId = req.query.schoolId;
  const classroomId = req.query.classroomId;
  let list = scopeStudentsByUser(students, req.user);
  if (schoolId) list = list.filter((s) => String(s.schoolId) === String(schoolId));
  if (classroomId) list = list.filter((s) => String(s.classroomId) === String(classroomId));
  return res.json(list);
});

app.get("/api/core/students/:studentId", auth, (req, res) => {
  const student = scopeStudentsByUser(students, req.user).find(
    (item) => String(item.id) === String(req.params.studentId)
  );

  if (!student) {
    return res.status(404).json({ message: "Student not found" });
  }

  return res.json(student);
});

app.post("/api/core/students", auth, (req, res) => {
  if (!["ADMIN", "GOVERNMENT", "PRINCIPAL"].includes(req.user.role)) {
    return res.status(403).json({ message: "Insufficient permissions" });
  }

  const {
    schoolId,
    classroomId,
    classTeacherId,
    code,
    phoneNumber,
    firstName,
    lastName,
    gender,
    dateOfBirth,
    gradeLevel,
    sectionLabel,
    active,
    enrolledAt,
  } = req.body || {};

  if (!schoolId || !classroomId || !classTeacherId || !code || !firstName || !lastName) {
    return res.status(400).json({ message: "Missing required student fields" });
  }

  const duplicateCode = students.find((item) => String(item.code) === String(code));
  if (duplicateCode) {
    return res.status(409).json({ message: "Student code already exists" });
  }

  const newId = String(
    Math.max(0, ...students.map((item) => Number.parseInt(String(item.id), 10) || 0)) + 1
  );

  const newStudent = {
    id: newId,
    schoolId: String(schoolId),
    classroomId: String(classroomId),
    classTeacherId: String(classTeacherId),
    code: String(code),
    phoneNumber: typeof phoneNumber === "string" ? phoneNumber : null,
    firstName: String(firstName),
    lastName: String(lastName),
    gender: typeof gender === "string" ? gender : null,
    dateOfBirth: typeof dateOfBirth === "string" ? dateOfBirth : null,
    gradeLevel: typeof gradeLevel === "number" ? gradeLevel : null,
    sectionLabel: typeof sectionLabel === "string" ? sectionLabel : null,
    active: typeof active === "boolean" ? active : true,
    enrolledAt: typeof enrolledAt === "string" ? enrolledAt : new Date().toISOString().split("T")[0],
  };

  students.push(newStudent);
  return res.status(201).json(newStudent);
});

app.patch("/api/core/students/:studentId", auth, (req, res) => {
  if (!["ADMIN", "GOVERNMENT", "PRINCIPAL"].includes(req.user.role)) {
    return res.status(403).json({ message: "Insufficient permissions" });
  }

  const studentIndex = students.findIndex(
    (item) => String(item.id) === String(req.params.studentId)
  );

  if (studentIndex === -1) {
    return res.status(404).json({ message: "Student not found" });
  }

  const student = students[studentIndex];
  const schoolScoped = scopeBySchool([student], req.user);
  if (schoolScoped.length === 0) {
    return res.status(404).json({ message: "Student not found" });
  }

  const {
    firstName,
    lastName,
    phoneNumber,
    classroomId,
    classTeacherId,
    gender,
    dateOfBirth,
    active,
  } = req.body || {};

  if (typeof firstName === "string") student.firstName = firstName;
  if (typeof lastName === "string") student.lastName = lastName;
  if (typeof phoneNumber === "string" || phoneNumber === null) student.phoneNumber = phoneNumber;
  if (typeof classroomId === "string") student.classroomId = classroomId;
  if (typeof classTeacherId === "string" || classTeacherId === null) {
    student.classTeacherId = classTeacherId;
  }
  if (typeof gender === "string" || gender === null) student.gender = gender;
  if (typeof dateOfBirth === "string" || dateOfBirth === null) student.dateOfBirth = dateOfBirth;
  if (typeof active === "boolean") student.active = active;

  return res.json(student);
});

app.delete("/api/core/students/:studentId", auth, (req, res) => {
  if (!hasRole(req.user, ["ADMIN"])) {
    return res.status(403).json({ message: "Insufficient permissions" });
  }

  const studentId = String(req.params.studentId);
  const studentIndex = students.findIndex((item) => String(item.id) === studentId);
  if (studentIndex === -1) {
    return res.status(404).json({ message: "Student not found" });
  }

  students.splice(studentIndex, 1);

  for (let i = users.length - 1; i >= 0; i -= 1) {
    if (String(users[i].studentId || "") === studentId) {
      users.splice(i, 1);
    }
  }

  return res.json({ message: "Student deleted successfully" });
});

app.get("/api/core/teachers", auth, (req, res) => {
  const schoolId = req.query.schoolId;
  let list = scopeBySchool(teachers, req.user);
  if (schoolId) list = list.filter((t) => String(t.schoolId) === String(schoolId));
  return res.json(list);
});

app.post("/api/core/teachers", auth, (req, res) => {
  if (!isPrivilegedRole(req.user.role)) {
    return res.status(403).json({ message: "Insufficient permissions" });
  }

  const { schoolId, firstName, lastName, email, joinedAt } = req.body || {};
  if (!schoolId || !firstName || !lastName || !email) {
    return res.status(400).json({ message: "schoolId, firstName, lastName and email are required" });
  }

  const existing = teachers.find((teacher) => String(teacher.email).toLowerCase() === String(email).toLowerCase());
  if (existing) {
    return res.status(409).json({ message: "Teacher email already exists" });
  }

  const newTeacher = {
    id: makeId("", teachers),
    schoolId: String(schoolId),
    firstName: String(firstName),
    lastName: String(lastName),
    email: String(email),
    joinedAt: typeof joinedAt === "string" ? joinedAt : new Date().toISOString(),
  };
  teachers.push(newTeacher);
  return res.status(201).json(newTeacher);
});

app.patch("/api/core/teachers/:teacherId", auth, (req, res) => {
  if (!isPrivilegedRole(req.user.role)) {
    return res.status(403).json({ message: "Insufficient permissions" });
  }

  const teacher = teachers.find((item) => String(item.id) === String(req.params.teacherId));
  if (!teacher) {
    return res.status(404).json({ message: "Teacher not found" });
  }

  const { firstName, lastName, email, phone, address } = req.body || {};
  if (typeof firstName === "string") teacher.firstName = firstName;
  if (typeof lastName === "string") teacher.lastName = lastName;
  if (typeof email === "string") teacher.email = email;
  if (typeof phone === "string") teacher.phone = phone;
  if (typeof address === "string") teacher.address = address;

  return res.json(teacher);
});

app.delete("/api/core/teachers/:teacherId", auth, (req, res) => {
  if (!hasRole(req.user, ["ADMIN"])) {
    return res.status(403).json({ message: "Insufficient permissions" });
  }

  const teacherId = String(req.params.teacherId);
  const teacherIndex = teachers.findIndex((item) => String(item.id) === teacherId);
  if (teacherIndex === -1) {
    return res.status(404).json({ message: "Teacher not found" });
  }

  const hasLinkedStudents = students.some((item) => String(item.classTeacherId || "") === teacherId);
  if (hasLinkedStudents) {
    return res.status(409).json({ message: "Cannot delete teacher assigned as class teacher" });
  }

  teachers.splice(teacherIndex, 1);

  for (let i = users.length - 1; i >= 0; i -= 1) {
    if (String(users[i].teacherId || "") === teacherId) {
      users.splice(i, 1);
    }
  }

  return res.json({ message: "Teacher deleted successfully" });
});

app.get("/api/core/classrooms", auth, (req, res) => {
  const schoolId = req.query.schoolId;
  let list = scopeBySchool(classrooms, req.user);
  if (req.query.classroomId) {
    list = list.filter((c) => String(c.id) === String(req.query.classroomId));
  }
  if (schoolId) list = list.filter((c) => String(c.schoolId) === String(schoolId));
  return res.json(list);
});

app.get("/api/core/classrooms/:classroomId", auth, (req, res) => {
  const classroom = scopeBySchool(classrooms, req.user).find(
    (item) => String(item.id) === String(req.params.classroomId)
  );

  if (!classroom) {
    return res.status(404).json({ message: "Classroom not found" });
  }

  return res.json(classroom);
});

app.post("/api/core/classrooms", auth, (req, res) => {
  if (!isPrivilegedRole(req.user.role)) {
    return res.status(403).json({ message: "Insufficient permissions" });
  }

  const { schoolId, gradeId, sectionId, academicYear } = req.body || {};
  if (!schoolId || !gradeId || !sectionId || !academicYear) {
    return res.status(400).json({ message: "Missing classroom fields" });
  }

  const grade = gradesStore.find((g) => String(g.id) === String(gradeId));
  const section = sectionsStore.find((s) => String(s.id) === String(sectionId));
  if (!grade || !section) {
    return res.status(400).json({ message: "Invalid gradeId or sectionId" });
  }

  const duplicate = classrooms.find(
    (c) =>
      String(c.schoolId) === String(schoolId) &&
      String(c.grade?.id) === String(gradeId) &&
      String(c.section?.id) === String(sectionId)
  );
  if (duplicate) {
    return res.status(409).json({ message: "Classroom already exists" });
  }

  const newClassroom = {
    id: makeId("", classrooms),
    schoolId: String(schoolId),
    grade: { id: grade.id, name: grade.name, level: grade.level },
    section: { id: section.id, label: section.label },
    academicYear: String(academicYear),
  };

  classrooms.push(newClassroom);
  return res.status(201).json(newClassroom);
});

app.patch("/api/core/classrooms/:classroomId", auth, (req, res) => {
  if (!isPrivilegedRole(req.user.role)) {
    return res.status(403).json({ message: "Insufficient permissions" });
  }

  const classroom = classrooms.find((c) => String(c.id) === String(req.params.classroomId));
  if (!classroom) {
    return res.status(404).json({ message: "Classroom not found" });
  }

  if (typeof req.body?.academicYear === "string") {
    classroom.academicYear = req.body.academicYear;
  }

  return res.json(classroom);
});

app.delete("/api/core/classrooms/:classroomId", auth, (req, res) => {
  if (!hasRole(req.user, ["ADMIN"])) {
    return res.status(403).json({ message: "Insufficient permissions" });
  }

  const classroomId = String(req.params.classroomId);
  const classroomIndex = classrooms.findIndex((item) => String(item.id) === classroomId);
  if (classroomIndex === -1) {
    return res.status(404).json({ message: "Classroom not found" });
  }

  const hasLinkedStudents = students.some((item) => String(item.classroomId || "") === classroomId);
  if (hasLinkedStudents) {
    return res.status(409).json({ message: "Cannot delete classroom with linked students" });
  }

  classrooms.splice(classroomIndex, 1);
  if (timetableByClassroom[classroomId]) delete timetableByClassroom[classroomId];
  return res.json({ message: "Classroom deleted successfully" });
});

app.get("/api/core/grades", auth, (req, res) => {
  const scopedSchoolId = req.query.schoolId || req.user.schoolId;
  let list = gradesStore;
  if (req.user.role !== "ADMIN" && req.user.role !== "GOVERNMENT") {
    list = list.filter((grade) => String(grade.schoolId) === String(scopedSchoolId));
  }
  return res.json(list);
});

app.post("/api/core/grades", auth, (req, res) => {
  if (!isPrivilegedRole(req.user.role)) {
    return res.status(403).json({ message: "Insufficient permissions" });
  }

  const { schoolId, name, level } = req.body || {};
  if (!schoolId || !name || typeof level !== "number") {
    return res.status(400).json({ message: "Missing grade fields" });
  }

  const exists = gradesStore.find(
    (grade) => String(grade.schoolId) === String(schoolId) && Number(grade.level) === Number(level)
  );
  if (exists) {
    return res.status(409).json({ message: `Grade level ${level} already exists` });
  }

  const newGrade = {
    id: makeId("g", gradesStore),
    schoolId: String(schoolId),
    name: String(name),
    level: Number(level),
    isActive: true,
  };
  gradesStore.push(newGrade);
  return res.status(201).json(newGrade);
});

app.patch("/api/core/grades/:gradeId", auth, (req, res) => {
  if (!isPrivilegedRole(req.user.role)) {
    return res.status(403).json({ message: "Insufficient permissions" });
  }
  const grade = gradesStore.find((item) => String(item.id) === String(req.params.gradeId));
  if (!grade) return res.status(404).json({ message: "Grade not found" });

  const { name, level, isActive } = req.body || {};
  if (typeof name === "string") grade.name = name;
  if (typeof level === "number") grade.level = level;
  if (typeof isActive === "boolean") grade.isActive = isActive;

  return res.json(grade);
});

app.delete("/api/core/grades/:gradeId", auth, (req, res) => {
  if (!hasRole(req.user, ["ADMIN"])) {
    return res.status(403).json({ message: "Insufficient permissions" });
  }

  const gradeId = String(req.params.gradeId);
  const gradeIndex = gradesStore.findIndex((item) => String(item.id) === gradeId);
  if (gradeIndex === -1) {
    return res.status(404).json({ message: "Grade not found" });
  }

  const linkedClassroom = classrooms.some((item) => String(item.grade?.id || "") === gradeId);
  if (linkedClassroom) {
    return res.status(409).json({ message: "Cannot delete grade linked to classrooms" });
  }

  const linkedSection = sectionsStore.some((item) => String(item.gradeId || "") === gradeId);
  if (linkedSection) {
    return res.status(409).json({ message: "Cannot delete grade with linked sections" });
  }

  gradesStore.splice(gradeIndex, 1);
  return res.json({ message: "Grade deleted successfully" });
});

app.post("/api/core/grades/bulk", auth, (req, res) => {
  if (!isPrivilegedRole(req.user.role)) {
    return res.status(403).json({ message: "Insufficient permissions" });
  }
  const { schoolId, grades } = req.body || {};
  if (!schoolId || !Array.isArray(grades)) {
    return res.status(400).json({ message: "schoolId and grades array are required" });
  }

  const created = [];
  grades.forEach((gradeInput) => {
    if (typeof gradeInput?.level !== "number" || !gradeInput?.name) return;
    const exists = gradesStore.find(
      (item) => String(item.schoolId) === String(schoolId) && Number(item.level) === Number(gradeInput.level)
    );
    if (exists) return;
    const newGrade = {
      id: makeId("g", gradesStore),
      schoolId: String(schoolId),
      name: String(gradeInput.name),
      level: Number(gradeInput.level),
      isActive: true,
    };
    gradesStore.push(newGrade);
    created.push(newGrade);
  });

  return res.status(201).json({ createdCount: created.length, items: created });
});

app.get("/api/core/sections", auth, (req, res) => {
  let list = [...sectionsStore];
  if (req.query.gradeId) {
    list = list.filter((section) => String(section.gradeId) === String(req.query.gradeId));
  }
  return res.json(list);
});

app.post("/api/core/sections", auth, (req, res) => {
  if (!isPrivilegedRole(req.user.role)) {
    return res.status(403).json({ message: "Insufficient permissions" });
  }
  const { gradeId, label } = req.body || {};
  if (!gradeId || !label) {
    return res.status(400).json({ message: "gradeId and label are required" });
  }

  const exists = sectionsStore.find(
    (section) => String(section.gradeId) === String(gradeId) && String(section.label) === String(label)
  );
  if (exists) {
    return res.status(409).json({ message: "Section already exists for this grade" });
  }

  const newSection = {
    id: makeId("sec", sectionsStore),
    gradeId: String(gradeId),
    label: String(label),
  };
  sectionsStore.push(newSection);
  return res.status(201).json(newSection);
});

app.patch("/api/core/sections/:sectionId", auth, (req, res) => {
  if (!isPrivilegedRole(req.user.role)) {
    return res.status(403).json({ message: "Insufficient permissions" });
  }
  const section = sectionsStore.find((item) => String(item.id) === String(req.params.sectionId));
  if (!section) return res.status(404).json({ message: "Section not found" });
  if (typeof req.body?.label === "string") section.label = req.body.label;
  return res.json(section);
});

app.delete("/api/core/sections/:sectionId", auth, (req, res) => {
  if (!hasRole(req.user, ["ADMIN"])) {
    return res.status(403).json({ message: "Insufficient permissions" });
  }

  const sectionId = String(req.params.sectionId);
  const sectionIndex = sectionsStore.findIndex((item) => String(item.id) === sectionId);
  if (sectionIndex === -1) {
    return res.status(404).json({ message: "Section not found" });
  }

  const linkedClassroom = classrooms.some((item) => String(item.section?.id || "") === sectionId);
  if (linkedClassroom) {
    return res.status(409).json({ message: "Cannot delete section linked to classrooms" });
  }

  sectionsStore.splice(sectionIndex, 1);
  return res.json({ message: "Section deleted successfully" });
});

app.post("/api/core/sections/bulk", auth, (req, res) => {
  if (!isPrivilegedRole(req.user.role)) {
    return res.status(403).json({ message: "Insufficient permissions" });
  }
  const { sections } = req.body || {};
  if (!Array.isArray(sections)) {
    return res.status(400).json({ message: "sections array is required" });
  }

  const created = [];
  sections.forEach((sectionInput) => {
    if (!sectionInput?.gradeId || !sectionInput?.label) return;
    const exists = sectionsStore.find(
      (item) =>
        String(item.gradeId) === String(sectionInput.gradeId) &&
        String(item.label) === String(sectionInput.label)
    );
    if (exists) return;
    const newSection = {
      id: makeId("sec", sectionsStore),
      gradeId: String(sectionInput.gradeId),
      label: String(sectionInput.label),
    };
    sectionsStore.push(newSection);
    created.push(newSection);
  });

  return res.status(201).json({ createdCount: created.length, items: created });
});

app.get("/api/core/subjects", auth, (req, res) => {
  let list = [...subjectsStore];
  if (req.user.role !== "ADMIN" && req.user.role !== "GOVERNMENT") {
    list = list.filter((subject) => String(subject.schoolId) === String(req.user.schoolId));
  }
  return res.json(list);
});

app.post("/api/core/subjects", auth, (req, res) => {
  if (!isPrivilegedRole(req.user.role)) {
    return res.status(403).json({ message: "Insufficient permissions" });
  }
  const { schoolId, code, name } = req.body || {};
  if (!schoolId || !code || !name) {
    return res.status(400).json({ message: "schoolId, code and name are required" });
  }

  const exists = subjectsStore.find(
    (subject) => String(subject.schoolId) === String(schoolId) && String(subject.code) === String(code)
  );
  if (exists) {
    return res.status(409).json({ message: "Subject code already exists" });
  }

  const newSubject = {
    id: makeId("sub", subjectsStore),
    schoolId: String(schoolId),
    code: String(code),
    name: String(name),
  };
  subjectsStore.push(newSubject);
  return res.status(201).json(newSubject);
});

app.patch("/api/core/subjects/:subjectId", auth, (req, res) => {
  if (!isPrivilegedRole(req.user.role)) {
    return res.status(403).json({ message: "Insufficient permissions" });
  }
  const subject = subjectsStore.find((item) => String(item.id) === String(req.params.subjectId));
  if (!subject) return res.status(404).json({ message: "Subject not found" });
  if (typeof req.body?.code === "string") subject.code = req.body.code;
  if (typeof req.body?.name === "string") subject.name = req.body.name;
  return res.json(subject);
});

app.delete("/api/core/subjects/:subjectId", auth, (req, res) => {
  if (!hasRole(req.user, ["ADMIN"])) {
    return res.status(403).json({ message: "Insufficient permissions" });
  }

  const subjectId = String(req.params.subjectId);
  const subjectIndex = subjectsStore.findIndex((item) => String(item.id) === subjectId);
  if (subjectIndex === -1) {
    return res.status(404).json({ message: "Subject not found" });
  }

  subjectsStore.splice(subjectIndex, 1);
  return res.json({ message: "Subject deleted successfully" });
});

app.get("/api/core/schools/:schoolId/settings", auth, (req, res) => {
  const schoolId = String(req.params.schoolId);
  if (!schoolSettingsById[schoolId]) {
    schoolSettingsById[schoolId] = {
      teacherAttendanceEnabled: true,
      faceAttendanceEnabled: true,
      multiFaceAttendanceEnabled: true,
      rfidEnabled: true,
      updatedAt: new Date().toISOString(),
    };
  }
  return res.json(schoolSettingsById[schoolId]);
});

app.put("/api/core/schools/:schoolId/settings", auth, (req, res) => {
  const schoolId = String(req.params.schoolId);
  const current = schoolSettingsById[schoolId] || {
    teacherAttendanceEnabled: true,
    faceAttendanceEnabled: true,
    multiFaceAttendanceEnabled: true,
    rfidEnabled: true,
  };

  const next = {
    teacherAttendanceEnabled:
      typeof req.body?.teacherAttendanceEnabled === "boolean"
        ? req.body.teacherAttendanceEnabled
        : current.teacherAttendanceEnabled,
    faceAttendanceEnabled:
      typeof req.body?.faceAttendanceEnabled === "boolean"
        ? req.body.faceAttendanceEnabled
        : current.faceAttendanceEnabled,
    multiFaceAttendanceEnabled:
      typeof req.body?.multiFaceAttendanceEnabled === "boolean"
        ? req.body.multiFaceAttendanceEnabled
        : current.multiFaceAttendanceEnabled,
    rfidEnabled: typeof req.body?.rfidEnabled === "boolean" ? req.body.rfidEnabled : current.rfidEnabled,
    updatedAt: new Date().toISOString(),
  };

  schoolSettingsById[schoolId] = next;
  return res.json({ message: "Settings saved successfully", ...next });
});

app.get("/api/timetables/classrooms/:classroomId", auth, (req, res) => {
  const classroomId = String(req.params.classroomId);
  const entries = timetableByClassroom[classroomId] || [];
  if (req.user.role === "PRINCIPAL") {
    return res.json({ classroomId, schoolId: req.user.schoolId, entries });
  }
  return res.json(entries);
});

app.put("/api/timetables/classrooms/:classroomId", auth, (req, res) => {
  if (!isPrivilegedRole(req.user.role)) {
    return res.status(403).json({ message: "Insufficient permissions" });
  }

  const classroomId = String(req.params.classroomId);
  const entries = Array.isArray(req.body?.entries) ? req.body.entries : [];
  timetableByClassroom[classroomId] = entries.map((entry, index) => ({
    id: entry.id || `tt-${classroomId}-${index + 1}`,
    weekDay: Number(entry.weekDay || 1),
    period: Number(entry.period || index + 1),
    startTime: String(entry.startTime || "09:00"),
    endTime: String(entry.endTime || "09:45"),
    label: String(entry.label || "Class"),
    location: entry.location ? String(entry.location) : undefined,
  }));

  return res.json({ message: "Timetable saved", totalEntries: timetableByClassroom[classroomId].length });
});

app.get("/api/geo-attendance/admin/records", auth, (req, res) => {
  const date = String(req.query.date || new Date().toISOString().split("T")[0]);

  if (!geoAttendanceByDate[date]) {
    const teacher = teachers.find((item) => String(item.schoolId) === String(req.user.schoolId));
    if (!teacher) {
      geoAttendanceByDate[date] = [];
    } else {
      const firstCheckIn = `${date}T09:15:00.000Z`;
      const lastCheckOut = `${date}T16:05:00.000Z`;
      geoAttendanceByDate[date] = [
        {
          teacherId: teacher.id,
          teacherName: `${teacher.firstName || "Mock"} ${teacher.lastName || "Teacher"}`.trim(),
          schoolName: schools.find((school) => String(school.id) === String(teacher.schoolId))?.name || "Mock School",
          firstCheckIn,
          lastCheckOut,
          isCurrentlyCheckedIn: false,
          totalHoursWorked: 7,
          totalMinutesWorked: 470,
          recordCount: 2,
          mockTag: MOCK_TAG,
          dataLabel: "Mock Test Data",
          records: [
            {
              id: `ga-${teacher.id}-in`,
              type: "check-in",
              timestamp: firstCheckIn,
              location: { latitude: 30.9, longitude: 75.85, address: "Mock School Campus" },
              mockTag: MOCK_TAG,
            },
            {
              id: `ga-${teacher.id}-out`,
              type: "check-out",
              timestamp: lastCheckOut,
              location: { latitude: 30.9, longitude: 75.85, address: "Mock School Campus" },
              mockTag: MOCK_TAG,
            },
          ],
        },
      ];
    }
  }

  return res.json({
    date,
    totalTeachers: geoAttendanceByDate[date].length,
    mockTag: MOCK_TAG,
    dataLabel: "Mock Test Data",
    teachers: geoAttendanceByDate[date],
  });
});

app.get("/api/geo-attendance/photos/:filename", auth, (_req, res) => {
  return res.status(404).json({ message: "Photo not found" });
});

app.get("/api/complaints", auth, (req, res) => {
  const { status, schoolId } = req.query;
  let items = getScopedComplaints(req.user);

  if (schoolId) {
    items = items.filter((item) => String(item.schoolId) === String(schoolId));
  }

  if (status) {
    items = items.filter((item) => item.status === String(status));
  }

  return res.json({
    schoolId: req.user.schoolId,
    total: items.length,
    items,
  });
});

app.get("/api/complaints/mine", auth, (req, res) => {
  let items = getScopedComplaints(req.user);
  if (req.user.role !== "STUDENT") {
    items = [];
  }

  return res.json({
    schoolId: req.user.schoolId,
    total: items.length,
    items,
  });
});

app.post("/api/complaints", auth, (req, res) => {
  const { category, description, isAnonymous } = req.body || {};
  if (!category || !description) {
    return res.status(400).json({ message: "Category and description are required" });
  }

  const student = students.find((item) => String(item.id) === String(req.user.studentId));
  const classroom = classrooms.find((item) => String(item.schoolId) === String(req.user.schoolId));

  const newId = `c${
    Math.max(
      0,
      ...complaints.map((item) => Number.parseInt(String(item.id).replace(/^c/, ""), 10) || 0)
    ) + 1
  }`;

  const newComplaint = {
    id: newId,
    category: String(category),
    status: "open",
    description: String(description),
    isAnonymous: Boolean(isAnonymous),
    student: student
      ? {
          id: student.id,
          firstName: student.firstName,
          lastName: student.lastName,
          code: student.code,
        }
      : null,
    classroom: classroom
      ? {
          id: classroom.id,
          grade: { name: classroom.grade.name },
          section: { label: classroom.section.label },
        }
      : {
          id: "unknown",
          grade: { name: "Unknown" },
          section: { label: "-" },
        },
    schoolId: String(req.user.schoolId || ""),
    resolutionNote: null,
    resolvedBy: null,
    resolvedAt: null,
    createdAt: new Date().toISOString(),
  };

  complaints.push(newComplaint);
  return res.status(201).json(normalizeComplaint(newComplaint));
});

app.patch("/api/complaints/:complaintId", auth, (req, res) => {
  if (!["ADMIN", "GOVERNMENT", "PRINCIPAL"].includes(req.user.role)) {
    return res.status(403).json({ message: "Insufficient permissions" });
  }

  const complaint = complaints.find((item) => String(item.id) === String(req.params.complaintId));
  if (!complaint) {
    return res.status(404).json({ message: "Complaint not found" });
  }

  const scoped = scopeBySchool([normalizeComplaint(complaint)], req.user);
  if (scoped.length === 0) {
    return res.status(404).json({ message: "Complaint not found" });
  }

  const { status, resolutionNote } = req.body || {};
  if (typeof status === "string") {
    complaint.status = status;
  }
  if (typeof resolutionNote === "string") {
    complaint.resolutionNote = resolutionNote;
  }
  if (complaint.status === "resolved" || complaint.status === "dismissed") {
    complaint.resolvedAt = new Date().toISOString();
    complaint.resolvedBy = {
      id: String(req.user.userId || ""),
      role: String(req.user.role || ""),
      email: String(req.user.email || ""),
    };
  }

  return res.json(normalizeComplaint(complaint));
});

app.get("/api/reports/attendance/principal", auth, (_req, res) => {
  const scopedStudents = scopeBySchool(students, _req.user);
  const scopedClassrooms = scopeBySchool(classrooms, _req.user);
  const classroom = scopedClassrooms[0] || {
    id: "201",
    grade: { name: "Grade 10" },
    section: { label: "A" },
  };
  const totalRecords = Math.max(1, scopedStudents.length || 1);
  const present = Math.max(1, totalRecords - 0);
  const absent = Math.max(0, totalRecords - present);
  const attendanceRate = Number(((present / totalRecords) * 100).toFixed(1));

  return res.json({
    totals: {
      present,
      absent,
      late: 0,
      excused: 0,
      totalRecords,
      attendanceRate,
    },
    classrooms: [
      {
        classroomId: String(classroom.id),
        grade: { name: classroom.grade?.name || "Grade 10" },
        section: { label: classroom.section?.label || "A" },
        attendanceRate,
        mockTag: MOCK_TAG,
        dataLabel: "Mock Test Data",
      },
    ],
    mockTag: MOCK_TAG,
    dataLabel: "Mock Test Data",
  });
});

app.get("/api/reports/attendance/teacher", auth, (_req, res) => {
  const scopedStudents = scopeBySchool(students, _req.user);
  const scopedClassrooms = scopeBySchool(classrooms, _req.user);
  const classroom = scopedClassrooms[0] || {
    id: "201",
    grade: { name: "Grade 10" },
    section: { label: "A" },
  };
  const totalRecords = Math.max(1, scopedStudents.length || 1);
  const present = Math.max(1, totalRecords - 0);
  const absent = Math.max(0, totalRecords - present);
  const attendanceRate = Number((present / totalRecords).toFixed(3));

  return res.json({
    classrooms: [
      {
        classroomId: String(classroom.id),
        grade: { name: classroom.grade?.name || "Grade 10" },
        section: { label: classroom.section?.label || "A" },
        totalSessions: 1,
        totalRecords,
        present,
        absent,
        attendanceRate,
        mockTag: MOCK_TAG,
        dataLabel: "Mock Test Data",
      },
    ],
    mockTag: MOCK_TAG,
    dataLabel: "Mock Test Data",
  });
});

app.get("/api/geo-attendance/admin/summary", auth, (_req, res) => {
  const teacher = teachers.find((item) => String(item.schoolId) === String(_req.user.schoolId));
  const summary = teacher
    ? [
        {
          teacherId: teacher.id,
          teacherName: `${teacher.firstName || "Mock"} ${teacher.lastName || "Teacher"}`.trim(),
          daysPresent: 1,
          totalHoursWorked: 7,
          averageHoursPerDay: 7,
          mockTag: MOCK_TAG,
          dataLabel: "Mock Test Data",
        },
      ]
    : [];

  return res.json({
    summary,
    mockTag: MOCK_TAG,
    dataLabel: "Mock Test Data",
  });
});

app.get("/api/communications/notifications/public", (_req, res) => {
  return res.json(notifications.filter((n) => n.isPublic).map((n) => ({ ...n, mockTag: n.mockTag || MOCK_TAG })));
});

app.get("/api/communications/notifications/active", auth, (_req, res) => {
  return res.json(notifications.map((n) => ({ ...n, mockTag: n.mockTag || MOCK_TAG })));
});

app.get("/api/timetables/teachers/:teacherId", auth, (req, res) => {
  const list = timetableByTeacher[req.params.teacherId] || [];
  return res.json(list);
});

app.get("/api/teachers/:teacherId", auth, (req, res) => {
  const teacher = teachers.find((t) => t.id === req.params.teacherId);
  if (!teacher) return res.status(404).json({ message: "Teacher not found" });
  return res.json(teacher);
});

app.patch("/api/teachers/:teacherId", auth, (req, res) => {
  const teacher = teachers.find((t) => t.id === req.params.teacherId);
  if (!teacher) return res.status(404).json({ message: "Teacher not found" });

  const { phone, address } = req.body || {};
  if (typeof phone === "string") teacher.phone = phone;
  if (typeof address === "string") teacher.address = address;

  return res.json(teacher);
});

app.use((_req, res) => {
  return res.status(404).json({ message: "Route not found" });
});

app.listen(port, () => {
  console.log(`Pragati backend running on http://localhost:${port}`);
});
