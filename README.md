# Pragati School Platform (Frontend + Backend)

Pragati is a role-based school management prototype with:

- Next.js 16 frontend (App Router, TypeScript, Tailwind CSS)
- Express backend (JWT auth, mock in-memory data)

This repository contains both apps.

## Tech Stack

- Frontend: Next.js 16, React 19, TypeScript, Tailwind CSS
- Backend: Express 4, JWT auth, JSON file persistence
- Package manager: npm (recommended for this repo)

## Quick Start (Windows)

### 1. Prerequisites

- Node.js 20+
- npm (comes with Node.js)

### 2. Install dependencies

From project root:

```powershell
npm install
```

From backend folder:

```powershell
cd backend
npm install
cd ..
```

### 3. Configure environment files

Frontend env:

```powershell
Copy-Item .env.local.example .env.local
```

Backend env:

```powershell
Copy-Item backend/.env.example backend/.env
```

Default local values:

- Frontend backend URL: `http://localhost:4000`
- Backend port: `4000`

### 4. Start backend (Terminal 1)

```powershell
cd backend
npm run dev
```

Health check:

- `http://localhost:4000/api/health`

### 5. Start frontend (Terminal 2)

```powershell
npm run dev
```

Frontend URL:

- `http://localhost:3000`

## Environment Variables

### Frontend

Used by frontend API helper:

- `NEXT_PUBLIC_BACKEND_URL` (primary)
- `NEXT_PUBLIC_API_URL` (fallback)

The frontend resolves backend URL from these values and falls back to `http://localhost:4000` when neither is set.

### Backend

- `PORT` (default: `4000`)
- `AUTH_JWT_SECRET` (required for production)

## Demo Login Credentials

- Admin: `admin@mock.test` / `AdminPass123!`
- Government: `government@mock.test` / `GovPass123!`
- Principal: `principal@mock.test` / `PrincipalPass123!`
- Teacher: `teacher@mock.test` / `TeacherPass123!`
- Student: `student@mock.test` / `StudentPass123!`

## Account Governance (User Management)

- `ADMIN` can create, update, delete all roles.
- `GOVERNMENT` can create principal accounts.
- `PRINCIPAL` can create teacher and student accounts in own school.
- `TEACHER` and `STUDENT` cannot manage user accounts.

Safety rules:

- Last admin account cannot be deleted.
- Email must be unique.
- Role-link validation is enforced (`teacherId` for `TEACHER`, `studentId` for `STUDENT`).
- School scoping is enforced for school-level managers.

## Mock Test Dataset Policy

- Runtime data is persisted in `backend/data/store.json`.
- Seed baseline is defined in `backend/src/data.js`.
- Dataset label `mockTag: "MOCK_TEST_DATA"` is used for predictable demos.
- To reset to baseline, stop backend and replace `backend/data/store.json` with the repository version.

## Scripts

Root (`package.json`):

- `npm run dev` - Start Next.js dev server
- `npm run build` - Build frontend
- `npm run start` - Start built frontend
- `npm run lint` - Lint frontend

Backend (`backend/package.json`):

- `npm run dev` - Start backend server
- `npm start` - Start backend server

## Deployment Guide

### Recommended architecture

- Deploy frontend to Vercel.
- Deploy backend to a separate Node host (Render, Railway, VPS, etc.).
- Set frontend env `NEXT_PUBLIC_BACKEND_URL` to deployed backend URL.

### Step-by-step

1. Deploy backend first from `backend/`.
2. Set backend env vars (`PORT`, `AUTH_JWT_SECRET`).
3. Verify backend health endpoint.
4. Deploy frontend on Vercel from repository root.
5. Add Vercel env var `NEXT_PUBLIC_BACKEND_URL`.
6. Redeploy frontend and validate login + role dashboards.

### Persistence caveat

Backend writes data to `backend/data/store.json`. On ephemeral/serverless filesystems, data can reset after restart.

For stable production data:

- attach persistent disk/volume for backend data, or
- migrate persistence to a database.

## Lockfile and Build Warning Policy

- This repo should use one package manager lockfile.
- Recommended: npm only (`package-lock.json`).
- If you previously used pnpm, remove the unused lockfile to avoid workspace root warnings.

The Next.js tracing-root warning has been addressed by setting `outputFileTracingRoot` in `next.config.mjs`.

## Troubleshooting

### Build warning: stale baseline-browser-mapping data

Non-blocking warning. To refresh:

```powershell
npm i baseline-browser-mapping@latest -D
```

### Backend route not found

- Confirm backend is running.
- Confirm frontend env points to correct backend URL.

### Login works but redirects back

- Clear browser storage and sign in again (localStorage session data).

## Project Structure

- `app/` - Next.js pages/layouts
- `components/` - Shared/UI components
- `lib/` - Shared helpers/utilities
- `backend/src/` - Express API server
- `public/` - Static assets

## Notes

- TypeScript path alias `@/*` is configured in `tsconfig.json`.
