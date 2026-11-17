-- ============================================================================
-- SkillBridge Database Migration: 002_profiles_and_portfolios.sql
-- Description: Milestone 2 — Student Profiles, Skills, Portfolios, and Availability
-- Target: Supabase / PostgreSQL 15+
-- ============================================================================

-- ============================================================================
-- 1. EXTEND PROFILES TABLE
-- ============================================================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS areas_of_interest TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS available_from DATE,
  ADD COLUMN IF NOT EXISTS contact_links JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_profiles_available_from ON public.profiles(available_from);

-- ============================================================================
-- 2. PORTFOLIO ITEMS & JUNCTION TABLE
-- ============================================================================

-- 2.1 Portfolio Items
CREATE TABLE IF NOT EXISTS public.portfolio_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  thumbnail_url TEXT,
  project_url TEXT,
  github_url TEXT,
  attachment_url TEXT,
  completed_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_portfolio_items_user_id ON public.portfolio_items(user_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_items_category ON public.portfolio_items(category);

-- Trigger for updated_at on portfolio_items
DROP TRIGGER IF EXISTS trg_portfolio_items_updated_at ON public.portfolio_items;
CREATE TRIGGER trg_portfolio_items_updated_at
  BEFORE UPDATE ON public.portfolio_items
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 2.2 Portfolio Item Skills (Junction)
CREATE TABLE IF NOT EXISTS public.portfolio_item_skills (
  portfolio_item_id UUID NOT NULL REFERENCES public.portfolio_items(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (portfolio_item_id, skill_id)
);

CREATE INDEX IF NOT EXISTS idx_portfolio_item_skills_item_id ON public.portfolio_item_skills(portfolio_item_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_item_skills_skill_id ON public.portfolio_item_skills(skill_id);

-- ============================================================================
-- 3. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- 3.1 Portfolio Items RLS
ALTER TABLE public.portfolio_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Active profiles portfolio items are viewable by authenticated users" ON public.portfolio_items;
CREATE POLICY "Active profiles portfolio items are viewable by authenticated users"
  ON public.portfolio_items
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = portfolio_items.user_id AND (account_status = 'active' OR id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can insert own portfolio items" ON public.portfolio_items;
CREATE POLICY "Users can insert own portfolio items"
  ON public.portfolio_items
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own portfolio items" ON public.portfolio_items;
CREATE POLICY "Users can update own portfolio items"
  ON public.portfolio_items
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete own portfolio items" ON public.portfolio_items;
CREATE POLICY "Users can delete own portfolio items"
  ON public.portfolio_items
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- 3.2 Portfolio Item Skills RLS
ALTER TABLE public.portfolio_item_skills ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone authenticated can view portfolio item skills" ON public.portfolio_item_skills;
CREATE POLICY "Anyone authenticated can view portfolio item skills"
  ON public.portfolio_item_skills
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.portfolio_items pi
      JOIN public.profiles p ON p.id = pi.user_id
      WHERE pi.id = portfolio_item_skills.portfolio_item_id
        AND (p.account_status = 'active' OR p.id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can insert skills for own portfolio items" ON public.portfolio_item_skills;
CREATE POLICY "Users can insert skills for own portfolio items"
  ON public.portfolio_item_skills
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.portfolio_items pi
      WHERE pi.id = portfolio_item_skills.portfolio_item_id
        AND pi.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete skills for own portfolio items" ON public.portfolio_item_skills;
CREATE POLICY "Users can delete skills for own portfolio items"
  ON public.portfolio_item_skills
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.portfolio_items pi
      WHERE pi.id = portfolio_item_skills.portfolio_item_id
        AND pi.user_id = auth.uid()
    )
  );

-- 3.3 Ensure controlled unlisted skill request policy on skills
DROP POLICY IF EXISTS "Users can suggest unapproved skills" ON public.skills;
CREATE POLICY "Users can suggest unapproved skills"
  ON public.skills
  FOR INSERT
  TO authenticated
  WITH CHECK (is_approved = false);

-- ============================================================================
-- 4. STORAGE BUCKETS SETUP (Supabase Storage)
-- ============================================================================

-- Safe configuration for avatars and portfolio-media buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']),
  ('portfolio-media', 'portfolio-media', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Storage object policies (owner-scoped write, public read)
-- Note: wrapped safely in DO block to handle environments without storage schema initialized
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'storage' AND table_name = 'objects') THEN
    -- Public read for avatars and portfolio-media
    DROP POLICY IF EXISTS "Public can view media" ON storage.objects;
    CREATE POLICY "Public can view media"
      ON storage.objects FOR SELECT
      USING (bucket_id IN ('avatars', 'portfolio-media'));

    -- Authenticated upload
    DROP POLICY IF EXISTS "Authenticated users can upload media" ON storage.objects;
    CREATE POLICY "Authenticated users can upload media"
      ON storage.objects FOR INSERT
      TO authenticated
      WITH CHECK (bucket_id IN ('avatars', 'portfolio-media'));

    -- Owner update/delete
    DROP POLICY IF EXISTS "Users can modify own uploads" ON storage.objects;
    CREATE POLICY "Users can modify own uploads"
      ON storage.objects FOR ALL
      TO authenticated
      USING (bucket_id IN ('avatars', 'portfolio-media') AND owner = auth.uid());
  END IF;
END $$;
