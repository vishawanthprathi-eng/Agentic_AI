-- ========================================================
-- AgenticSync: Supabase PostgreSQL Database Setup
-- Theme: Agentic AI & Intelligent Systems
-- ========================================================

-- Enable pgcrypto or uuid extension for UUID generation
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

-- Indices for rapid queries and high-performance filtering
CREATE INDEX IF NOT EXISTS idx_code_uploads_user_id ON code_uploads(user_id);
CREATE INDEX IF NOT EXISTS idx_code_uploads_status ON code_uploads(ai_status);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);

-- Optional Row Level Security (RLS) can be enabled if desired
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE code_uploads ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
