# Pragati: Smart School Governance Platform

Pragati is a school management platform built for the **Smart India Hackathon (SIH) 2026** to address the problem statement from the **Ministry of Education and Government of Punjab**. 

The app helps manage daily school operations, track attendance for both teachers and students, organize class schedules, submit/moderate complaints, and view government schemes. It has a full role-based dashboard system supporting Admins, Government officials, Principals, Teachers, and Students.

---

## 🛠️ Tech Stack
* **Frontend:** Next.js (App Router, React 19, TypeScript, Tailwind CSS, UX4G components/tokens)
* **Backend:** Node.js + Express (JWT authentication, endpoint validation)
* **Database/Storage:** Simple JSON file persistence (`backend/data/store.json`) for local development so it runs out-of-the-box without needing databases set up.

---

## 🚀 How to Run Locally

### 1. Install dependencies
In the root directory (frontend):
```bash
npm install
```

In the `backend` directory:
```bash
cd backend
npm install
cd ..
```

### 2. Set up environment variables
Copy the template files to configure your local environments. I've set up `.env.local.example` and `backend/.env.example` as base templates.

```bash
# Frontend env setup (root folder)
cp .env.local.example .env.local

# Backend env setup
cp backend/.env.example backend/.env
```
*(Make sure to generate a secure secret key for `AUTH_JWT_SECRET` in your backend `.env` file!)*

### 3. Run the development servers

**Start the Backend API (runs on port 4000):**
```bash
cd backend
npm run dev
```

**Start the Frontend Next.js app (runs on port 3000):**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Demo Credentials

To check out the different dashboard layouts and permissions, you can log in using the accounts below (or just use the **"Use Demo Credentials"** button on the login pages):

| Role | Email / Username | Password | Access / Scope |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@mock.test` | `AdminPass123!` | Complete control over schools, classes, teachers, students, and system accounts. |
| **Government** | `government@mock.test` | `GovPass123!` | Can create Principal accounts, review multi-school metrics, and manage programs. |
| **Principal** | `principal@mock.test` | `PrincipalPass123!` | Manages teachers/students in their school, configures local attendance policies. |
| **Teacher** | `teacher@mock.test` | `TeacherPass123!` | Can view timetables, mark student attendance, and track classroom analytics. |
| **Student** | `student@mock.test` | `StudentPass123!` | Views their own attendance, downloads study materials, and files complaints. |

*Note: Since this is a prototype/evaluation build, mock passwords and user state are saved in plain text in `backend/data/store.json` to make testing simple. In a production build, passwords would be hashed using `bcrypt` and we would hook it up to a database like Postgres or MongoDB.*

---

## 🧪 Tests & Linting
* **Integration Tests:** Built using Node.js's native test runner (zero extra dependencies). Run `npm run test` from the root directory to test the API endpoints.
* **Linting:** Run `npm run lint` to check for syntax and style issues.
* **Build:** Run `npm run build` to verify the production compilation.

---

## 📂 Project Structure
```text
├── app/                      # Next.js pages & layouts (App Router)
│   ├── (auth)/               # Login and redirect screens
│   ├── admin/                # Admin panels
│   ├── government/           # Government reporting pages
│   ├── principal/            # Principal control center
│   ├── teacher/              # Teacher tools (attendance, schedules)
│   └── student/              # Student dashboard & complaint submission
├── components/               # Shared React components
├── lib/                      # Auth utilities, config, and API client helpers
├── tests/                    # API integration tests (Node native test runner)
├── backend/                  # Express API Server
│   ├── data/                 # Local JSON store (store.json)
│   └── src/                  # Server configuration, routing, and seed data
```
