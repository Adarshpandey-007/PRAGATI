# Pragati Backend API Guide

This document reflects the currently implemented backend in `backend/src/server.js`.

## Base URL

- Local: `http://localhost:4000`
- API root: `/api`

## Authentication

Protected routes require:

- `Authorization: Bearer <token>`

Get token from:

- `POST /api/auth/login`

Roles used in authorization checks:

- `ADMIN`
- `GOVERNMENT`
- `PRINCIPAL`
- `TEACHER`
- `STUDENT`

## Runtime Data Model

- Data is loaded from `backend/src/data.js`
- Runtime updates are persisted to `backend/data/store.json`
- IDs are returned as strings

## Health and Public Endpoints

- `GET /api/health`
- `GET /api/programs`
- `GET /api/programs/:slug`
- `GET /api/communications/notifications/public`
- `POST /api/auth/login`

## Programs

- `POST /api/programs`
- `PATCH /api/programs/:slug`
- `DELETE /api/programs/:slug`

Access:

- `ADMIN`, `GOVERNMENT`

## User Lifecycle and Auth Management

- `GET /api/auth/users`
- `POST /api/auth/users`
- `PATCH /api/auth/users/:userId`
- `DELETE /api/auth/users/:userId`

Key behavior:

- Last `ADMIN` cannot be deleted
- Email uniqueness is enforced
- School scoping and role-based management checks are enforced

## Core Domain APIs

### Schools

- `GET /api/core/schools`
- `POST /api/core/schools`
- `PATCH /api/core/schools/:schoolId`
- `DELETE /api/core/schools/:schoolId`
- `GET /api/core/schools/:schoolId/settings`
- `PUT /api/core/schools/:schoolId/settings`

### Students

- `GET /api/core/students`
- `GET /api/core/students/:studentId`
- `POST /api/core/students`
- `PATCH /api/core/students/:studentId`
- `DELETE /api/core/students/:studentId`

### Teachers

- `GET /api/core/teachers`
- `POST /api/core/teachers`
- `PATCH /api/core/teachers/:teacherId`
- `DELETE /api/core/teachers/:teacherId`
- `GET /api/teachers/:teacherId`
- `PATCH /api/teachers/:teacherId`

### Classrooms

- `GET /api/core/classrooms`
- `GET /api/core/classrooms/:classroomId`
- `POST /api/core/classrooms`
- `PATCH /api/core/classrooms/:classroomId`
- `DELETE /api/core/classrooms/:classroomId`

### Grades

- `GET /api/core/grades`
- `POST /api/core/grades`
- `PATCH /api/core/grades/:gradeId`
- `DELETE /api/core/grades/:gradeId`
- `POST /api/core/grades/bulk`

### Sections

- `GET /api/core/sections`
- `POST /api/core/sections`
- `PATCH /api/core/sections/:sectionId`
- `DELETE /api/core/sections/:sectionId`
- `POST /api/core/sections/bulk`

### Subjects

- `GET /api/core/subjects`
- `POST /api/core/subjects`
- `PATCH /api/core/subjects/:subjectId`
- `DELETE /api/core/subjects/:subjectId`

## Timetables

- `GET /api/timetables/classrooms/:classroomId`
- `PUT /api/timetables/classrooms/:classroomId`
- `GET /api/timetables/teachers/:teacherId`

## Complaints

- `GET /api/complaints`
- `GET /api/complaints/mine`
- `POST /api/complaints`
- `PATCH /api/complaints/:complaintId`

## Reports

- `GET /api/reports/attendance/principal`
- `GET /api/reports/attendance/teacher`

## Geo Attendance

- `GET /api/geo-attendance/admin/records`
- `GET /api/geo-attendance/admin/summary`
- `GET /api/geo-attendance/photos/:filename`

## Notifications

- `GET /api/communications/notifications/active`

## Response and Error Conventions

Common status patterns in current implementation:

- `200` successful read/update
- `201` successful create
- `400` validation failures
- `401` invalid login credentials
- `403` authorization failures
- `404` resource not found
- `409` duplicate/conflict operations

## Deployment Notes

- Frontend deployment should set `NEXT_PUBLIC_BACKEND_URL` to backend base URL.
- Backend persistence currently uses a JSON file (`backend/data/store.json`).
- For production, use persistent storage or migrate to a database.

## Keeping This Doc Up To Date

When backend routes change, update this file from route declarations in `backend/src/server.js`.
