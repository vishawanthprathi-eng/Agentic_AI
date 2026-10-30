# 🚀 AgenticSync: Production-Ready Agentic Team Collaboration Hub

[![Deployment Architecture: Vercel + Render + Supabase](https://img.shields.io/badge/Architecture-Vercel%20%2B%20Render%20%2B%20Supabase-6366f1?style=for-the-badge)](https://github.com)
[![AI Engine: Google Gemini API](https://img.shields.io/badge/AI%20Engine-Google%20Gemini-10B981?style=for-the-badge)](https://ai.google.dev/)

> **Hackathon Theme:** Agentic AI & Intelligent Systems  
> **Project Name:** AgenticSync

---

## 1. Project Overview & Concept

**AgenticSync** is a production-grade collaborative web platform engineered for software engineering teams that eliminates tedious Git branch conflicts, merge lockouts, and slow manual code reviews.

Team members upload code snippets or files directly into the platform. An **Autonomous AI Agent** powered by the **Google Gemini API** instantly acts as a virtual lead software architect:
- **Syntax & Structural AST Verification:** Validates language grammar, bracket balancing, and unhandled async flows.
- **Security & Vulnerability Audit:** Detects SQL injections, unescaped inputs, exposed API secrets, and prototype pollution.
- **Simulated Test Suite Synthesis:** Autonomously invents synthetic test cases, simulating edge cases and runtime behaviors.
- **Definitive Quality Verdict:** Issues a strict verdict (`verified` or `bugged`), calculates code health scores (0–100), and provides actionable refactored fixes.
- **Collaborative Admin Hub:** Administrators monitor team members, adjust roles, track real-time activity streams, and analyze velocity using interactive Recharts visualizations.

---

## 2. Production Deployment Architecture

```
                    ┌────────────────────────────────────────┐
                    │               CLIENT                   │
                    │         Vercel (React + Vite)          │
                    │   Configured via VITE_API_URL env var  │
                    └───────────────────┬────────────────────┘
                                        │ HTTPS / JWT Auth
                                        ▼
                    ┌────────────────────────────────────────┐
                    │               SERVER                   │
                    │        Render (Node.js/Express)        │
                    │     Strict CORS, Zod, bcrypt, JWT      │
                    └───────────┬────────────────┬───────────┘
                                │                │
              Database Queries  │                │ AI Verification Prompts
                                ▼                ▼
    ┌───────────────────────────────┐        ┌───────────────────────────────┐
    │          DATABASE             │        │          AI ENGINE            │
    │     Supabase (PostgreSQL)     │        │       Google Gemini API       │
    │ users, code_uploads, logs     │        │ (@google/generative-ai, flash)│
    └───────────────────────────────┘        └───────────────────────────────┘
```

- **Frontend (Vercel):** React + Vite SPA located in `/client`. Dynamically points to the backend via `import.meta.env.VITE_API_URL`. Includes `client/vercel.json` SPA rewrite rules.
- **Backend (Render):** Node.js + Express API located in `/server`. Listens on `process.env.PORT || 5000` with strict CORS for the Vercel frontend. Includes root-level `render.yaml` Blueprint.
- **Database (Supabase):** Managed PostgreSQL database hosting the `users`, `code_uploads`, and `activity_logs` tables.
- **AI Engine:** Google Gemini API secured strictly on backend environment variables (`GEMINI_API_KEY`).

---

## 3. Repository Structure

```
/
├── server/                              # Backend API (Render Deployment)
│   ├── index.js                         # Express entrypoint, strict CORS & seed logic
│   ├── package.json                     # "start": "node index.js" script
│   ├── .env.example                     # Backend environment template
│   ├── schema.sql                       # Supabase PostgreSQL DDL setup script
│   ├── config/
│   │   └── supabaseClient.js            # Supabase PostgreSQL client (with memory fallback)
│   ├── middleware/
│   │   └── authMiddleware.js            # JWT auth & Admin role protection guards
│   ├── validators/
│   │   └── zodSchemas.js                # Zod schemas for register, login, uploads, roles
│   ├── services/
│   │   └── geminiAgent.js               # Autonomous Google Gemini verification agent
│   └── routes/
│       ├── authRoutes.js                # Registration & login with JWT & bcrypt
│       ├── codeRoutes.js                # Code upload, AI verification & re-verify
│       └── adminRoutes.js               # Team metrics, user roles & activity logs
├── client/                              # Frontend SPA (Vercel Deployment)
│   ├── index.html                       # HTML entrypoint with modern fonts
│   ├── package.json                     # "build": "vite build" script
│   ├── vite.config.js                   # Vite configuration with local proxy
│   ├── tailwind.config.js               # Custom cyber theme
│   ├── vercel.json                      # Vercel SPA rewrite configuration
│   ├── .env.example                     # Frontend environment template
│   └── src/
│       ├── main.jsx                     # Application root
│       ├── App.jsx                      # Router & role-based route guard
│       ├── index.css                    # Tailwind CSS & glassmorphism utilities
│       ├── services/
│       │   └── api.js                   # Axios client with import.meta.env.VITE_API_URL
│       ├── components/
│       │   ├── Navbar.jsx               # Navigation bar with role badge & user actions
│       │   ├── ProtectedRoute.jsx       # Route protection guard
│       │   ├── ActivityChart.jsx        # Recharts Donut & Bar chart components
│       │   └── CodeModal.jsx            # Detailed code & AI inspection modal
│       └── pages/
│           ├── Login.jsx                # 1-Click Demo Login & credentials
│           ├── Register.jsx             # Role-selected registration
│           ├── MemberDashboard.jsx      # Member repository, pass rates & filters
│           ├── AdminDashboard.jsx       # Executive metrics, charts, user management & audit
│           └── UploadCode.jsx           # Drag & Drop, presets & live verification steps
├── render.yaml                          # Infrastructure-as-Code for Render deployment
└── README.md
```

---

## 4. Supabase Database Schema

Open your [Supabase Dashboard](https://supabase.com/dashboard) ➔ **SQL Editor**, and run:

```sql
-- Enable pgcrypto for UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. CODE UPLOADS TABLE
CREATE TABLE IF NOT EXISTS code_uploads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    code_content TEXT NOT NULL,
    ai_status TEXT NOT NULL DEFAULT 'pending' CHECK (ai_status IN ('pending', 'verified', 'bugged')),
    ai_feedback TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. ACTIVITY LOGS TABLE
CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action_description TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes for optimal query performance
CREATE INDEX IF NOT EXISTS idx_code_uploads_user_id ON code_uploads(user_id);
CREATE INDEX IF NOT EXISTS idx_code_uploads_status ON code_uploads(ai_status);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
```

---

## 5. Step-by-Step Production Deployment Guide

### A. Deploy Backend to Render

1. Log in to [Render](https://render.com) and click **New +** ➔ **Web Service**.
2. Connect your Git repository.
3. Configure the service settings:
   - **Name:** `agenticsync-backend`
   - **Root Directory:** `server`
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
4. Add the following **Environment Variables**:
   - `NODE_ENV`: `production`
   - `PORT`: `5000` (Render binds automatically)
   - `JWT_SECRET`: Any secure random string (e.g. `agentic_secret_key_prod_928172`)
   - `CLIENT_URL`: URL of your Vercel frontend (e.g., `https://agenticsync.vercel.app`)
   - `SUPABASE_URL`: Your Supabase Project URL (`https://your-ref.supabase.co`)
   - `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role secret key
   - `GEMINI_API_KEY`: Your Google Gemini API Key
5. Click **Create Web Service**. Note your backend URL:  
   `https://agenticsync-backend.onrender.com`

---

### B. Deploy Frontend to Vercel

1. Log in to [Vercel](https://vercel.com) and click **Add New...** ➔ **Project**.
2. Select your repository.
3. In **Project Settings**:
   - **Framework Preset:** `Vite`
   - **Root Directory:** Click **Edit** and choose `client`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Expand **Environment Variables** and add:
   - `VITE_API_URL`: `https://agenticsync-backend.onrender.com/api`
5. Click **Deploy**.
6. Once deployed, copy your Vercel URL and paste it into Render's `CLIENT_URL` environment variable to enforce strict CORS.

---

## 6. Running Locally

### 1. Start the Server
```bash
cd server
npm install
npm run dev
```
Backend runs on `http://localhost:5000`.

### 2. Start the Client
```bash
cd client
npm install
npm run dev
```
Frontend runs on `http://localhost:3000`.

---

## 7. Demo Credentials for Evaluation

The system comes pre-seeded with instant test credentials (also accessible via 1-click buttons on the Login page):

| Role | Email | Password | Access |
|:-----|:------|:---------|:-------|
| **Project Admin** | `admin@agenticsync.ai` | `admin123` | Admin Analytics Dashboard, Member Management, Global Audit Logs |
| **Team Member** | `dev@agenticsync.ai` | `member123` | Code Upload, Autonomous AI Inspection, Personal Code Repository |
