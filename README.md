# AtomicSync — Full-Stack MERN Habit Tracker 🚀

A production-ready, personal habit-tracking application built with the **MERN Stack** (MongoDB, Express.js, React.js, Node.js), Vite, and Tailwind CSS. Designed with a SaaS-grade aesthetic, streak calculation engine, interactive calendar view, and Recharts analytics.

---

## ✨ Features

- 🔐 **Authentication & Security**
  - Secure HTTP-only cookies with JWT tokens.
  - Password hashing via bcryptjs.
  - Rate limiting, Helmet security headers, and CORS configured.
  - Forgot password & reset password workflows with development fallbacks.
  - Strict user data isolation across all endpoints.
- 🎯 **Habit Management**
  - Full CRUD: Create, Read, Update, Delete with confirmation modals.
  - Categories: Health, Fitness, Learning, Work, Personal, Finance, Social, Other.
  - Flexible Frequency: Daily, Weekly target, and Custom day-of-week selections.
  - Active & Pause/Resume state management.
- 🔥 **Intelligent Streak Engine**
  - Backend streak calculations computing current and longest streaks.
  - Automatically accounts for scheduled custom days and skips un-scheduled days without breaking streaks.
- 📊 **Main Dashboard & Progress**
  - Dynamic time-of-day greeting with personal quote.
  - Circular progress ring gauge showing today's completion percentage.
  - Mini 7-day progress overview strip.
  - Interactive habit cards with micro-animations on completion.
  - One-click starter onboarding presets for new accounts.
- 📅 **Interactive Calendar View**
  - Month navigation with color-coded daily completion levels (0% to 100%).
  - Day details inspector modal displaying notes and completed habits for any past date.
- 📈 **Visual Analytics & Leaderboard**
  - Past 7 days completion rate bar chart (Recharts).
  - Category breakdown distribution donut chart.
  - 30-day habit performance leaderboard table.
- 🌓 **Themes & UI/UX**
  - Dark, Light, and System appearance modes.
  - Toast notification system for instant feedback.
  - Skeleton loading states.
  - Fully responsive for Desktop, Tablet, and Mobile screens.

---

## 📁 Monorepo Structure

```text
habit-tracker/
├── client/                     # Frontend Application (React + Vite + Tailwind CSS)
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/          # ProtectedRoute, LoginPage, RegisterPage, etc.
│   │   │   ├── calendar/      # CalendarPage, Day Details Modal
│   │   │   ├── dashboard/     # DashboardPage, Progress Gauge, Onboarding
│   │   │   ├── habits/        # HabitsPage, HabitCard, HabitModal
│   │   │   ├── analytics/     # AnalyticsPage, Recharts components
│   │   │   ├── profile/       # ProfilePage, Theme switcher, Password update
│   │   │   ├── layout/        # AppLayout, Sidebar, Mobile Header
│   │   │   └── ui/            # Button, Input, Modal, Card, Badge, Skeleton
│   │   ├── context/           # AuthContext, ThemeContext, ToastContext
│   │   ├── services/          # api.js, authService, habitService, statsService, etc.
│   │   ├── utils/             # constants, icons, colors
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── .env.example
│
├── server/                     # Backend API (Node.js + Express + Mongoose)
│   ├── src/
│   │   ├── config/            # db.js (MongoDB connection)
│   │   ├── controllers/       # auth, habit, completion, stats, user controllers
│   │   ├── middleware/        # authMiddleware, errorMiddleware, rateLimiter
│   │   ├── models/            # User, Habit, HabitCompletion
│   │   ├── routes/            # auth, habit, completion, stats, user routes
│   │   ├── services/          # streakService, statsService, emailService
│   │   ├── seed/              # seed.js, seedData.js
│   │   ├── utils/             # dateHelpers, generateToken, asyncHandler
│   │   ├── app.js
│   │   └── server.js
│   ├── package.json
│   └── .env.example
│
├── README.md
└── .gitignore
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+ recommended)
- [MongoDB](https://www.mongodb.com/) running locally on port 27017 or a MongoDB Atlas URI.

---

### 1. Backend Setup

1. Open a terminal and navigate to the `server/` directory:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   Copy `.env.example` to `.env`:
   ```env
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/habit-tracker
   JWT_SECRET=your_super_secret_jwt_key_at_least_32_characters_long_12345
   JWT_EXPIRE=30d
   COOKIE_EXPIRE=30
   CLIENT_URL=http://localhost:5173
   NODE_ENV=development
   ```

4. **(Optional) Seed Demo Data**:
   Populate a sample user (`demo@habittracker.com` / `Password123!`) with 8 starter habits and 30 days of completion data:
   ```bash
   npm run seed
   ```

5. Start the backend server:
   ```bash
   npm run dev
   # or
   npm start
   ```
   *Server will run at `http://localhost:5000`.*

---

### 2. Frontend Setup

1. Open a new terminal and navigate to the `client/` directory:
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   Copy `.env.example` to `.env`:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

4. Start Vite development server:
   ```bash
   npm run dev
   ```
   *Frontend will run at `http://localhost:5173`.*

---

## 🔑 Demo Account Credentials

If you ran `npm run seed` on the backend, you can log in immediately or click the **"Quick Demo Login"** button on the sign-in screen:

- **Email:** `demo@habittracker.com`
- **Password:** `Password123!`

---

## 📡 API Overview

| Method | Endpoint | Description | Protected |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/auth/register` | Register new user & set cookie | No |
| **POST** | `/api/auth/login` | Login user & set cookie | No |
| **POST** | `/api/auth/logout` | Clear cookie & session | Yes |
| **GET** | `/api/auth/me` | Current authenticated user | Yes |
| **POST** | `/api/auth/forgot-password` | Request password reset token | No |
| **POST** | `/api/auth/reset-password/:token` | Reset password using token | No |
| **GET** | `/api/habits` | List user habits (search & category filters) | Yes |
| **POST** | `/api/habits` | Create a new habit | Yes |
| **PUT** | `/api/habits/:id` | Update habit details | Yes |
| **DELETE** | `/api/habits/:id` | Delete habit and history | Yes |
| **PATCH** | `/api/habits/:id/toggle-active` | Pause / resume habit | Yes |
| **POST** | `/api/habits/:id/toggle` | Toggle today's completion & update streak | Yes |
| **POST** | `/api/habits/batch` | Batch create starter habits | Yes |
| **GET** | `/api/stats/dashboard` | Aggregated dashboard metrics & streaks | Yes |
| **GET** | `/api/stats/weekly` | 7-day completion chart data | Yes |
| **GET** | `/api/stats/monthly` | Calendar matrix data by year & month | Yes |
| **GET** | `/api/stats/habits` | 30-day leaderboard performance | Yes |
| **GET** | `/api/stats/categories` | Completion counts by category | Yes |
| **GET** | `/api/stats/streaks` | All-time best streak data | Yes |
| **PUT** | `/api/users/profile` | Update profile info & timezone | Yes |
| **PUT** | `/api/users/password` | Update account password | Yes |

---

## 🛡️ Production Deployment Checklist

1. Set `NODE_ENV=production` in server environment variables.
2. Ensure `CLIENT_URL` matches your deployed frontend URL (e.g. `https://your-habit-app.vercel.app`).
3. Cookies are automatically set to `secure: true` and `sameSite: 'none'` in production mode for cross-domain cookie communication.
4. Run `npm run build` in `client/` to generate optimized production assets in `client/dist`.

---

## 📄 License
This project is open-source and free for personal and commercial development.
