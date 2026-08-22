# 🎓 CampusLearn

<div align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/React_Native-Expo_SDK_54-blue?style=for-the-badge&logo=react" alt="React Native" />
  <img src="https://img.shields.io/badge/Node.js-Express-green?style=for-the-badge&logo=node.js" alt="Node.js" />
  <img src="https://img.shields.io/badge/Supabase-Database-3FCF8E?style=for-the-badge&logo=supabase" alt="Supabase" />
  <img src="https://img.shields.io/badge/MongoDB-Database-47A248?style=for-the-badge&logo=mongodb" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-Styling-38B2AC?style=for-the-badge&logo=tailwind-css" alt="Tailwind" />
</div>

<br />

**CampusLearn** is a comprehensive, role-based e-learning ecosystem featuring a Next.js Web App, a React Native Mobile App (iOS & Android), an Express.js REST API backend, and Supabase integration.

---

## ✨ Core Highlights & Mobile App Integration

### 📱 React Native Mobile App
- **Cross-Platform Compatibility:** Native iOS and Android support built with Expo SDK 54 and React Native.
- **Identical Brand Design:** Matches CampusLearn web aesthetic tokens (Dark Theme `#09090b`/`#18181b`, `#f97316` primary orange accent, card elevations, glassmorphism, responsive navigation).
- **Role-Based Portals:** Mobile experiences for **Student**, **Faculty**, **HOD**, and **Admin**.

### 🔒 1-Web + 1-Mobile Active Session Policy
To guarantee strict platform security without disrupting multi-device usability:
- **Maximum 2 Active Sessions:** Each user can maintain **at most 1 active web session** AND **at most 1 active mobile session**.
- **Platform Isolation:**
  - Logging in on a second web browser invalidates/logs out the previous web session.
  - Logging in on a second mobile phone/device invalidates/logs out the previous mobile session.
  - **Active Web session NEVER logs out active Mobile session**, and vice versa.
- **Server Enforcement:** Verified in backend `protect` middleware via Supabase `user_sessions` tracking. When a session is revoked, the client catches HTTP status `401` with `SESSION_REVOKED` code, displays a clear notification, and logs out automatically.

### 🔄 Real-time Data Sync
- **Unified Backend:** Both Web and Mobile connect to the same Express API and Supabase/MongoDB database.
- **Sync Features:** User profiles, courses, enrollments, lessons, assignments, attendance records, timetables, announcements, and progress updates synchronize instantly upon refresh/action on either platform.

---

## 🛠️ System Stack

- **Web Frontend:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, Lucide Icons, Zustand.
- **Mobile App:** React Native 0.81, Expo SDK 54, React Navigation, Async Storage, Zustand.
- **Backend Server:** Node.js, Express.js, JWT Auth, Helmet, CORS, Rate Limiting.
- **Database & Sync:** Supabase PostgreSQL (`user_sessions` table with RLS) & MongoDB Atlas.

---

## 🚀 Execution & Setup Commands

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Expo Go (or iOS Simulator / Android Emulator) for mobile execution

---

### 1. Backend Setup & Run
```bash
cd backend
npm install
npm run dev
```
*API running at `http://localhost:5000/api` or `http://<your-local-ip>:5000/api`*

#### Supabase Database Migration
Execute the SQL script in [`backend/supabase/migrations/01_create_user_sessions.sql`](file:///c:/Users/HP/Desktop/cmpuselearn%20app/campuslearnprojec/backend/supabase/migrations/01_create_user_sessions.sql) in your Supabase SQL Editor.

---

### 2. Frontend Web Setup & Run
```bash
cd frontend
npm install
npm run dev
```
*Web App running at `http://localhost:3000`*

---

### 3. React Native Mobile App Setup & Run
```bash
cd mobile
npm install
npm start
```
- **Web Preview:** Press `w` in terminal or run `npm run web` (Opens at `http://localhost:8081`).
- **Android:** Run `npm run android` or scan QR code in Expo Go app.
- **iOS:** Run `npm run ios` or scan QR code in Expo Go app.

---

## 📁 Repository Structure

```text
campuslearn/
├── backend/                  # Express REST API & Supabase session manager
│   ├── config/               # Supabase & DB connection helpers
│   ├── controllers/          # Auth, Course, Assignment, Attendance controllers
│   ├── middleware/           # Auth protection & Session enforcer
│   ├── routes/               # API routes (`/api/auth`, `/api/courses`, etc.)
│   └── supabase/migrations/  # SQL DDL for user_sessions & RLS
│
├── frontend/                 # Next.js Web Application
│   ├── src/app/              # Next.js App Router Pages
│   ├── src/lib/api.ts        # Axios API client & 401 Session Interceptor
│   └── .env.example          # Environment variables example
│
└── mobile/                   # React Native Mobile App (Expo SDK 54)
    ├── src/components/       # Responsive UI components (Card, StatCard, Badge)
    ├── src/navigation/       # Root & Role-based Stack/Tab Navigators
    ├── src/screens/          # Student, Faculty, HOD, and Admin screens
    ├── src/services/api.ts   # Mobile API layer & Session Interceptor
    ├── src/store/authStore.ts# Zustand auth state & live sync store
    └── .env.example          # Mobile API URL environment example
```

---

## 👥 Contributors & Feature Additions

- **Nayana G. Naik**: **Placement Preparation** — Aptitude practice, mock interview, resume analyzer, company opportunity tracking, and placement analytics dashboards.

- **Sinchana**: Attendance shortage alert notification system.
- **Zameer**: Real Time Timetable Management - A centralized timetable system that provides students, faculty, and HODs with live class schedules, instant updates, conflict detection, and calendar integration. It ensures accurate scheduling with real-time notifications for rescheduled or cancelled classes

