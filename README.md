# 🎓 CampusLearn

<div align="center">
  <img src="https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/Node.js-Express-green?style=for-the-badge&logo=node.js" alt="Node.js" />
  <img src="https://img.shields.io/badge/MongoDB-Database-47A248?style=for-the-badge&logo=mongodb" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-Styling-38B2AC?style=for-the-badge&logo=tailwind-css" alt="Tailwind" />
</div>

<br />

**CampusLearn** is a comprehensive, modern college management platform designed to replace Google Classroom, WhatsApp groups, and scattered emails with a single unified, beautiful platform. It streamlines academic workflows for Admins, Faculty, and Students.

---

## ✨ Features

### 🛡️ Role-Based Architecture
- **Admins & HODs:** Complete control over departments, users, and institute-wide announcements. Bulk onboard students and faculty via CSV.
- **Faculty:** Create and manage courses, upload lecture notes, create assignments, track student attendance, and grade submissions.
- **Students:** Access enrolled courses, submit assignments, track personal attendance, download resources, and participate in discussion forums.

### 📚 Course & Learning Management
- **Smart Courses:** Structured video lessons, PDF notes, and resources in one place.
- **Assignments & Grading:** Seamless file uploads for submissions with real-time feedback and grading.
- **Discussions:** Built-in forums for each course to resolve doubts and collaborate.

### 📊 Analytics & Tracking
- **Interactive Dashboards:** Beautiful charts and statistics showing attendance trends, grading metrics, and active enrollments.
- **Real-time Notifications:** In-app notifications for new announcements, assignment deadlines, and grade publications.

### 🎨 Modern, Premium Design
- **Dark/Light Mode:** Seamless theme switching.
- **Beautiful UI:** Built with Tailwind CSS and animated with Framer Motion for a fluid, application-like feel.

---

## 🛠️ Tech Stack

### Frontend (Client)
- **Framework:** [Next.js](https://nextjs.org/) (React)
- **State Management:** [Zustand](https://github.com/pmndrs/zustand)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Animations:** [Framer Motion](https://www.framer.com/motion/)
- **Icons:** [Lucide React](https://lucide.dev/)

### Backend (Server)
- **Runtime:** [Node.js](https://nodejs.org/)
- **Framework:** [Express.js](https://expressjs.com/)
- **Database:** [MongoDB](https://www.mongodb.com/) via [Mongoose](https://mongoosejs.com/)
- **Authentication:** JWT (JSON Web Tokens)
- **File Uploads:** Multer (Local storage & Cloudinary support)

---

## 🚀 Getting Started

### Prerequisites
Make sure you have the following installed on your machine:
- [Node.js](https://nodejs.org/) (v16 or higher)
- [MongoDB](https://www.mongodb.com/) (Local instance or MongoDB Atlas)
- npm or yarn

### 1. Clone the repository
```bash
git clone https://github.com/your-username/campuslearn.git
cd campuslearn
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory based on the provided `.env.example`:
```env
PORT=5001
NODE_ENV=development
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
# Optional: Cloudinary config for cloud uploads
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Start the backend server:
```bash
npm run dev
```
*The backend will run on `http://localhost:5001`*

### 3. Frontend Setup
Open a new terminal window and navigate to the frontend directory:
```bash
cd frontend
npm install
```

Start the Next.js development server:
```bash
npm run dev
```
*The frontend will run on `http://localhost:3000`*

---

## 🔑 User Onboarding

Because this is a closed institutional platform, public registration is disabled. 

Once logged in as an **Admin**, you can easily onboard students and faculty using the **Bulk Add (CSV)** feature in the Admin dashboard. All bulk-created users are assigned the default password: `CampusLearn@123`, which they can use to log in initially.

---

## 📁 Project Structure

```text
campuslearn/
├── backend/                  # Express.js REST API
│   ├── controllers/          # Request handlers
│   ├── models/               # Mongoose DB schemas
│   ├── routes/               # API route definitions
│   ├── middleware/           # Auth, Upload, Error handling
│   └── server.js             # Entry point
│
└── frontend/                 # Next.js Application
    ├── src/
    │   ├── app/              # Next.js App Router (Pages & Layouts)
    │   ├── components/       # Reusable UI components
    │   ├── store/            # Zustand global state (Auth, Theme)
    │   ├── lib/              # API clients & utilities
    │   └── types/            # TypeScript definitions
    └── tailwind.config.ts    # Tailwind configuration
```

---

## 👥 Contributors & Feature Additions

- **Nayana G. Naik**: **Placement Preparation** — Aptitude practice, mock interview , resume analyzer, company opportunity tracking, and placement analytics dashboards.
- **Sinchana**: Attendance shortage alert notification system.

