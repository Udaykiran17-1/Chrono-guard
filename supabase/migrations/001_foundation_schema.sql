-- ============================================================================
-- SkillBridge Database Migration: 001_foundation_schema.sql
-- Description: Core foundation schema, tables, foreign keys, triggers, and strict RLS
-- Target: Supabase / PostgreSQL 15+
-- ============================================================================

-- Ensure pgcrypto extension for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. HELPER FUNCTIONS
-- ============================================================================

-- Generic updated_at timestamp refresher
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 2. TABLES & CONSTRAINTS
-- ============================================================================

-- 2.1 Universities
CREATE TABLE IF NOT EXISTS public.universities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  short_name TEXT,
  email_domain TEXT, -- If NULL, any email is accepted for testing; if set (e.g. 'campus.edu'), verified on signup
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_universities_is_active ON public.universities(is_active);

-- 2.2 Departments
CREATE TABLE IF NOT EXISTS public.departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  university_id UUID NOT NULL REFERENCES public.universities(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_dept_per_university UNIQUE (university_id, name)
);

CREATE INDEX IF NOT EXISTS idx_departments_university_id ON public.departments(university_id);

-- 2.3 Profiles (Linked 1:1 to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  university_id UUID REFERENCES public.universities(id) ON DELETE SET NULL,
  department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  avatar_url TEXT,
  course TEXT,
  academic_year TEXT,
  headline TEXT,
  bio TEXT,
  availability_status TEXT NOT NULL DEFAULT 'available',
  availability_note TEXT,
  is_seeker_enabled BOOLEAN NOT NULL DEFAULT true,
  is_freelancer_enabled BOOLEAN NOT NULL DEFAULT true,
  platform_role TEXT NOT NULL DEFAULT 'user',
  account_status TEXT NOT NULL DEFAULT 'active',
  last_active_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_availability_status CHECK (availability_status IN ('available', 'limited', 'busy', 'unavailable')),
  CONSTRAINT chk_platform_role CHECK (platform_role IN ('user', 'admin', 'moderator')),
  CONSTRAINT chk_account_status CHECK (account_status IN ('active', 'suspended', 'deactivated'))
);

CREATE INDEX IF NOT EXISTS idx_profiles_university_id ON public.profiles(university_id);
CREATE INDEX IF NOT EXISTS idx_profiles_department_id ON public.profiles(department_id);
CREATE INDEX IF NOT EXISTS idx_profiles_availability_status ON public.profiles(availability_status);
CREATE INDEX IF NOT EXISTS idx_profiles_account_status ON public.profiles(account_status);
CREATE INDEX IF NOT EXISTS idx_profiles_platform_role ON public.profiles(platform_role);

-- 2.4 Skills (Taxonomy)
CREATE TABLE IF NOT EXISTS public.skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  is_approved BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_skill_category CHECK (category IN ('Technical', 'Creative', 'Management & Other'))
);

CREATE INDEX IF NOT EXISTS idx_skills_category ON public.skills(category);
CREATE INDEX IF NOT EXISTS idx_skills_is_approved ON public.skills(is_approved);

-- 2.5 User Skills (Junction)
CREATE TABLE IF NOT EXISTS public.user_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
  proficiency TEXT NOT NULL DEFAULT 'beginner',
  is_primary BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_user_skill UNIQUE (user_id, skill_id),
  CONSTRAINT chk_proficiency CHECK (proficiency IN ('beginner', 'intermediate', 'advanced'))
);

CREATE INDEX IF NOT EXISTS idx_user_skills_user_id ON public.user_skills(user_id);
CREATE INDEX IF NOT EXISTS idx_user_skills_skill_id ON public.user_skills(skill_id);

-- ============================================================================
-- 3. TRIGGERS
-- ============================================================================

-- Updated at triggers
CREATE TRIGGER trg_universities_updated_at
  BEFORE UPDATE ON public.universities
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trg_departments_updated_at
  BEFORE UPDATE ON public.departments
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Prevent platform_role escalation by non-admins
CREATE OR REPLACE FUNCTION public.check_role_escalation()
RETURNS TRIGGER AS $$
DECLARE
  current_role TEXT;
BEGIN
  -- If platform_role is unchanged, allow
  IF NEW.platform_role = OLD.platform_role THEN
    RETURN NEW;
  END IF;

  -- Determine requester's current role
  SELECT platform_role INTO current_role FROM public.profiles WHERE id = auth.uid();

  -- Only admins can change platform_role
  IF current_role IS DISTINCT FROM 'admin' THEN
    RAISE EXCEPTION 'Unauthorized: Users cannot modify their own or another user''s platform_role';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_prevent_role_escalation
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.check_role_escalation();

-- Trigger to create profile when auth.users row is inserted
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  univ_id UUID := NULL;
  dept_id UUID := NULL;
  raw_univ_val TEXT;
  raw_dept_val TEXT;
BEGIN
  -- Safely parse university UUID if present
  raw_univ_val := NEW.raw_user_meta_data->>'university_id';
  IF raw_univ_val IS NOT NULL AND raw_univ_val ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN
    univ_id := raw_univ_val::UUID;
  END IF;

  -- Safely parse department UUID if present
  raw_dept_val := NEW.raw_user_meta_data->>'department_id';
  IF raw_dept_val IS NOT NULL AND raw_dept_val ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN
    dept_id := raw_dept_val::UUID;
  END IF;

  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    university_id,
    department_id,
    course,
    academic_year,
    avatar_url,
    headline,
    bio,
    availability_status,
    is_seeker_enabled,
    is_freelancer_enabled,
    platform_role,
    account_status,
    last_active_at
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      SPLIT_PART(NEW.email, '@', 1)
    ),
    univ_id,
    dept_id,
    NEW.raw_user_meta_data->>'course',
    NEW.raw_user_meta_data->>'academic_year',
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.raw_user_meta_data->>'headline',
    NEW.raw_user_meta_data->>'bio',
    'available',
    COALESCE((NEW.raw_user_meta_data->>'is_seeker_enabled')::BOOLEAN, true),
    COALESCE((NEW.raw_user_meta_data->>'is_freelancer_enabled')::BOOLEAN, true),
    'user', -- strictly standard user by default
    'active',
    now()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    updated_at = now();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Drop if exists and recreate trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- 4.1 Universities
ALTER TABLE public.universities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active universities"
  ON public.universities
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage universities"
  ON public.universities
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND platform_role = 'admin'
    )
  );

-- 4.2 Departments
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view departments"
  ON public.departments
  FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage departments"
  ON public.departments
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND platform_role = 'admin'
    )
  );

-- 4.3 Skills
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view approved skills"
  ON public.skills
  FOR SELECT
  USING (is_approved = true);

CREATE POLICY "Admins can view all skills"
  ON public.skills
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND platform_role = 'admin'
    )
  );

CREATE POLICY "Users can suggest unapproved skills"
  ON public.skills
  FOR INSERT
  TO authenticated
  WITH CHECK (is_approved = false);

CREATE POLICY "Admins can manage skills"
  ON public.skills
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND platform_role = 'admin'
    )
  );

-- 4.4 Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Active profiles are readable by authenticated users"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (account_status = 'active' OR id = auth.uid());

CREATE POLICY "Users can insert own profile"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "Admins can view and manage all profiles"
  ON public.profiles
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND platform_role = 'admin'
    )
  );

-- 4.5 User Skills
ALTER TABLE public.user_skills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view user skills"
  ON public.user_skills
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = user_skills.user_id AND (account_status = 'active' OR id = auth.uid())
    )
  );

CREATE POLICY "Users can insert own skills"
  ON public.user_skills
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own skills"
  ON public.user_skills
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own skills"
  ON public.user_skills
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());
