-- ============================================================================
-- SkillBridge Database Migration: 003_marketplace_and_projects.sql
-- Description: Milestone 3 — Projects, Marketplace Discovery, Project Skills & Bookmarks
-- Target: Supabase / PostgreSQL 15+
-- ============================================================================

-- ============================================================================
-- 1. PROJECTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  organisation_id UUID NULL, -- Links to organisations in Milestone 6
  title TEXT NOT NULL,
  what_needs_doing TEXT NOT NULL,
  why_required TEXT NOT NULL,
  expected_deliverables TEXT NOT NULL,
  additional_requirements TEXT,
  category TEXT NOT NULL,
  budget_type TEXT NOT NULL CHECK (budget_type IN ('fixed', 'negotiable', 'unpaid', 'volunteer', 'other')),
  budget_min NUMERIC NULL,
  budget_max NUMERIC NULL,
  budget_note TEXT NULL,
  deadline DATE NOT NULL,
  estimated_duration TEXT,
  positions_total INT NOT NULL DEFAULT 1 CHECK (positions_total >= 1),
  positions_filled INT NOT NULL DEFAULT 0 CHECK (positions_filled >= 0),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('draft', 'open', 'reviewing', 'in_progress', 'completed', 'cancelled', 'closed')),
  cancellation_reason TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_projects_creator_id ON public.projects(creator_id);
CREATE INDEX IF NOT EXISTS idx_projects_category ON public.projects(category);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_deadline ON public.projects(deadline);
CREATE INDEX IF NOT EXISTS idx_projects_budget_type ON public.projects(budget_type);

-- Updated at trigger
DROP TRIGGER IF EXISTS trg_projects_updated_at ON public.projects;
CREATE TRIGGER trg_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Status transition enforcement trigger (Spec Section 6.3)
CREATE OR REPLACE FUNCTION public.check_project_status_transition()
RETURNS TRIGGER AS $$
BEGIN
  -- Unchanged status is always allowed
  IF OLD.status = NEW.status THEN
    RETURN NEW;
  END IF;

  -- Validate allowed state transitions
  CASE OLD.status
    WHEN 'draft' THEN
      IF NEW.status NOT IN ('open', 'cancelled') THEN
        RAISE EXCEPTION 'Invalid project status transition: draft can only transition to open or cancelled';
      END IF;
    WHEN 'open' THEN
      IF NEW.status NOT IN ('reviewing', 'in_progress', 'closed', 'cancelled') THEN
        RAISE EXCEPTION 'Invalid project status transition: open cannot jump directly to % without intermediate progress', NEW.status;
      END IF;
    WHEN 'reviewing' THEN
      IF NEW.status NOT IN ('open', 'in_progress', 'closed', 'cancelled') THEN
        RAISE EXCEPTION 'Invalid project status transition: reviewing cannot transition directly to %', NEW.status;
      END IF;
    WHEN 'in_progress' THEN
      IF NEW.status NOT IN ('completed', 'cancelled') THEN
        RAISE EXCEPTION 'Invalid project status transition: in_progress can only move to completed or cancelled';
      END IF;
    WHEN 'closed' THEN
      IF NEW.status NOT IN ('open', 'cancelled') THEN
        RAISE EXCEPTION 'Invalid project status transition: closed projects can only be reopened or cancelled';
      END IF;
    WHEN 'completed' THEN
      RAISE EXCEPTION 'Invalid project status transition: completed projects are finalized and cannot be reopened';
    WHEN 'cancelled' THEN
      RAISE EXCEPTION 'Invalid project status transition: cancelled projects cannot be modified';
    ELSE
      RAISE EXCEPTION 'Unknown project status %', OLD.status;
  END CASE;

  -- Require cancellation reason when status changes to cancelled
  IF NEW.status = 'cancelled' AND (NEW.cancellation_reason IS NULL OR TRIM(NEW.cancellation_reason) = '') THEN
    RAISE EXCEPTION 'A cancellation reason is required when cancelling a project';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_enforce_project_status_transition ON public.projects;
CREATE TRIGGER trg_enforce_project_status_transition
  BEFORE UPDATE OF status ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.check_project_status_transition();

-- ============================================================================
-- 2. PROJECT SKILLS JUNCTION
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.project_skills (
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (project_id, skill_id)
);

CREATE INDEX IF NOT EXISTS idx_project_skills_project_id ON public.project_skills(project_id);
CREATE INDEX IF NOT EXISTS idx_project_skills_skill_id ON public.project_skills(skill_id);

-- ============================================================================
-- 3. BOOKMARKS / SAVED ITEMS
-- ============================================================================

-- 3.1 Saved Projects
CREATE TABLE IF NOT EXISTS public.saved_projects (
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, project_id)
);

CREATE INDEX IF NOT EXISTS idx_saved_projects_user_id ON public.saved_projects(user_id);

-- 3.2 Saved Freelancers / Talent
CREATE TABLE IF NOT EXISTS public.saved_freelancers (
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  freelancer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, freelancer_id),
  CONSTRAINT chk_no_self_save CHECK (user_id != freelancer_id)
);

CREATE INDEX IF NOT EXISTS idx_saved_freelancers_user_id ON public.saved_freelancers(user_id);

-- ============================================================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- 4.1 Projects RLS
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view non-draft projects" ON public.projects;
CREATE POLICY "Public can view non-draft projects"
  ON public.projects
  FOR SELECT
  TO authenticated
  USING (status != 'draft' OR creator_id = auth.uid());

DROP POLICY IF EXISTS "Creators can insert own projects" ON public.projects;
CREATE POLICY "Creators can insert own projects"
  ON public.projects
  FOR INSERT
  TO authenticated
  WITH CHECK (creator_id = auth.uid());

DROP POLICY IF EXISTS "Creators can update own projects" ON public.projects;
CREATE POLICY "Creators can update own projects"
  ON public.projects
  FOR UPDATE
  TO authenticated
  USING (creator_id = auth.uid())
  WITH CHECK (creator_id = auth.uid());

DROP POLICY IF EXISTS "Creators can delete own projects" ON public.projects;
CREATE POLICY "Creators can delete own projects"
  ON public.projects
  FOR DELETE
  TO authenticated
  USING (creator_id = auth.uid());

-- 4.2 Project Skills RLS
ALTER TABLE public.project_skills ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view skills of visible projects" ON public.project_skills;
CREATE POLICY "Anyone can view skills of visible projects"
  ON public.project_skills
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = project_skills.project_id
        AND (p.status != 'draft' OR p.creator_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Creators can manage project skills" ON public.project_skills;
CREATE POLICY "Creators can manage project skills"
  ON public.project_skills
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = project_skills.project_id
        AND p.creator_id = auth.uid()
    )
  );

-- 4.3 Saved Projects RLS
ALTER TABLE public.saved_projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own saved projects" ON public.saved_projects;
CREATE POLICY "Users can view own saved projects"
  ON public.saved_projects FOR SELECT TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can save projects" ON public.saved_projects;
CREATE POLICY "Users can save projects"
  ON public.saved_projects FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can unsave projects" ON public.saved_projects;
CREATE POLICY "Users can unsave projects"
  ON public.saved_projects FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- 4.4 Saved Freelancers RLS
ALTER TABLE public.saved_freelancers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own saved freelancers" ON public.saved_freelancers;
CREATE POLICY "Users can view own saved freelancers"
  ON public.saved_freelancers FOR SELECT TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can save freelancers" ON public.saved_freelancers;
CREATE POLICY "Users can save freelancers"
  ON public.saved_freelancers FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can unsave freelancers" ON public.saved_freelancers;
CREATE POLICY "Users can unsave freelancers"
  ON public.saved_freelancers FOR DELETE TO authenticated
  USING (user_id = auth.uid());
