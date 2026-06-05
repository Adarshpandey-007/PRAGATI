# PRAGATI: Smart School Governance Platform

[![Next.js](https://img.shields.io/badge/Next.js-16.0.3-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0.0-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![Express](https://img.shields.io/badge/Express-4.21.2-lightgrey?style=for-the-badge&logo=express)](https://expressjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)

**PRAGATI** (Smart School Governance Platform) is a role-based, production-ready school management platform designed to engineer smarter education workflows for every classroom. Developed under the context of the **Smart India Hackathon (SIH) 2026 Problem Statement** from the **Ministry of Education & Government of Punjab**.

The platform features a multi-tiered role governance system, automated teacher/student attendance management, classroom schedule tracking, complaint moderation, and a complete catalog of government programs and schemes.

---

## 🏗️ Project Architecture

The repository contains both frontend and backend subprojects:

- **Frontend**: Next.js 16 (App Router) built with React 19, TypeScript, and styled using Tailwind CSS and the UX4G government design tokens.
- **Backend**: Express API server with JWT authentication, endpoint validation, and automated JSON-file-based data persistence.

---

## ⚡ Quick Start Guide (Local Development)

### 1. Prerequisites
- **Node.js**: Version 20.x or higher
- **npm**: Included with Node.js (recommended package manager)

### 2. Install Dependencies

Install root (frontend) dependencies:
```bash
npm install
```

Install backend dependencies:
```bash
cd backend
npm install
cd ..
```

### 3. Configure Environment Variables

Create the frontend environment file:
```bash
# Windows (PowerShell)
Copy-Item .env.local.example .env.local
```

Create the backend environment file:
```bash
# Windows (PowerShell)
Copy-Item backend/.env.example backend/.env
```

**Default Local Configurations:**
- Frontend backend API endpoint: `http://localhost:4000`
- Backend server port: `4000`

### 4. Run the Platform

#### Start Backend API Server (Terminal 1)
```bash
cd backend
npm run dev
```
Health Check Endpoint: `http://localhost:4000/api/health`

#### Start Frontend Next.js Client (Terminal 2)
```bash
npm run dev
```
Frontend URL: `http://localhost:3000`

---

## 🧪 Testing & Code Quality

We maintain a zero-warning, fully typechecked, and tested codebase to ensure production stability.

### 1. Automated Integration Tests
The project features a native, zero-dependency integration test suite using Node.js's built-in `node --test` runner. The suite automatically spins up a test server instance, checks API endpoints, verifies JWT login authorization, and validates scoping logic.
```bash
npm run test
```

### 2. Code Linting
Run the ESLint flat config check to find syntax issues or code style warnings:
```bash
npm run lint
```

### 3. Production Build Compilation
Verify that all TypeScript code passes strict typechecking and compiles successfully for production deployment:
```bash
npm run build
```

---

## 🔑 Demo Credentials

To test different platform perspectives, log in with the following credentials or use the **"Use Demo Credentials"** button present on each login page:

| Role | Username / Email | Password | Scope / Permissions |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@mock.test` | `AdminPass123!` | Platform God-Mode: full lifecycle CRUD over schools, classes, teachers, students, and user accounts. |
| **Government** | `government@mock.test` | `GovPass123!` | Create principal accounts, moderate programs & schemes, view multi-school reports. |
| **Principal** | `principal@mock.test` | `PrincipalPass123!` | Manage own school accounts (teachers, students), configure attendance policies. |
| **Teacher** | `teacher@mock.test` | `TeacherPass123!` | View schedules, mark attendance, track classroom exam analytics. |
| **Student** | `student@mock.test` | `StudentPass123!` | View attendance cards, study materials, and log complaints. |

---

## 🛡️ User & Account Governance

The platform enforces account creation boundaries across roles:
- `ADMIN` can create, update, and delete accounts for all roles.
- `GOVERNMENT` can create and manage `PRINCIPAL` accounts.
- `PRINCIPAL` can create and manage `TEACHER` and `STUDENT` accounts belonging to their specific school.
- `TEACHER` and `STUDENT` roles are read-only regarding account administration.

### Account Protection Rules:
- The last remaining `ADMIN` account cannot be deleted to prevent lockdown.
- All email addresses must be unique across the platform.
- Strict role-link checks are applied (requiring a valid `teacherId` for teachers or `studentId` for students).

---

## 💾 Persistent Storage Policy

- Backend mock data defaults are seeded in `backend/src/data.js`.
- Active runtime changes are persisted to `backend/data/store.json`.
- **To reset the dataset back to baseline**: Stop the backend server and replace the contents of `backend/data/store.json` with the original repository baseline (or delete the file to trigger auto-re-seeding upon boot).

> [!CAUTION]
> In serverless environments (e.g. Vercel/Render ephemeral disks), local JSON file writes will reset on dyno/container restarts. For production deployments, attach a persistent storage volume or migrate the data adapters in `backend/src/storage.js` to a SQL or NoSQL database.

---

## 🚀 Deployment Guide

1. **Deploy Backend API Server**:
   - Host the Node Express app on a containerized service (Render, Railway, Fly.io, or VPS).
   - Configure the environment variables:
     - `PORT` (e.g., `4000`)
     - `AUTH_JWT_SECRET` (generate a strong crypto secret for production)
   - Ensure the server is reachable and `/api/health` returns `{ "status": "ok" }`.

2. **Deploy Frontend Client**:
   - Host the Next.js frontend on [Vercel](https://vercel.com).
   - Configure the environment variable:
     - `NEXT_PUBLIC_BACKEND_URL`: Points to your deployed Backend API URL.
   - Deploy! Next.js will compile the statically optimized routes.

---

## 📁 Repository Structure

```text
├── app/                      # Next.js App Router (pages & layouts)
│   ├── (auth)/               # Auth screens (login cards, redirects)
│   ├── admin/                # Admin dashboard panels & settings
│   ├── government/           # Government dashboard pages
│   ├── principal/            # Principal control center panels
│   ├── teacher/              # Teacher dashboards and exam panels
│   └── student/              # Student profile, study material & complaints
├── components/               # Reusable UI component modules
├── lib/                      # Central config, auth storage & clients
├── tests/                    # Native Node integration test suites
├── backend/                  # Express API Backend Server
│   ├── data/                 # Persistent store.json
│   └── src/                  # Express router, storage, and seed models
├── README.md                 # Public documentation
└── tsconfig.json             # TypeScript rules
```
