-- SQL Migration: Add missing columns to profiles table
-- Run this in your Supabase SQL Editor

-- 1. Add XP and Basic Stats
ALTER TABLE IF EXISTS public.profiles 
ADD COLUMN IF NOT EXISTS puzzles_solved INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS xp INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS lessons_completed INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS streak INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_active_date DATE;

-- 2. Add Complex Progress tracking (JSONB and Arrays)
ALTER TABLE IF EXISTS public.profiles
ADD COLUMN IF NOT EXISTS completed_lessons TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS minigame_scores JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS achievements JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS activity_log JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS daily_quests JSONB DEFAULT '[]';

-- 3. Ensure updated_at exists and is manageable
ALTER TABLE IF EXISTS public.profiles
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

-- 4. (Optional) Set up RLS if not already done
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to update their own profile
CREATE POLICY IF NOT EXISTS "Users can update own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

-- Allow users to read any profile (for leaderboards/news)
CREATE POLICY IF NOT EXISTS "Profiles are viewable by everyone" 
ON public.profiles FOR SELECT 
USING (true);

-- Allow users to insert their own profile on signup
CREATE POLICY IF NOT EXISTS "Users can insert own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

COMMENT ON TABLE public.profiles IS 'User profiles with reward stats and progress tracking.';
