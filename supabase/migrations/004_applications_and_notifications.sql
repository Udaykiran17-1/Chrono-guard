-- ============================================================================
-- SkillBridge Database Migration: 004_applications_and_notifications.sql
-- Milestone 4: Project Applications, Applicant Management, Atomic Slot Locking,
--              Project Membership & In-App Notifications
-- ============================================================================

-- ============================================================================
-- 1. APPLICATIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  applicant_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  introduction TEXT NOT NULL,
  relevant_experience TEXT NOT NULL,
  portfolio_links JSONB NOT NULL DEFAULT '[]'::jsonb,
  estimated_days INTEGER NOT NULL CHECK (estimated_days > 0),
  proposed_price NUMERIC CHECK (proposed_price >= 0),
  comments TEXT,
  status TEXT NOT NULL DEFAULT 'submitted' CHECK (
    status IN ('submitted', 'under_review', 'shortlisted', 'accepted', 'rejected', 'withdrawn')
  ),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_project_applicant UNIQUE (project_id, applicant_id)
);

CREATE INDEX IF NOT EXISTS idx_applications_project_id ON public.applications(project_id);
CREATE INDEX IF NOT EXISTS idx_applications_applicant_id ON public.applications(applicant_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON public.applications(status);

-- Updated_at trigger for applications
DROP TRIGGER IF EXISTS trg_applications_updated_at ON public.applications;
CREATE TRIGGER trg_applications_updated_at
  BEFORE UPDATE ON public.applications
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Self-application prevention trigger
CREATE OR REPLACE FUNCTION public.check_self_application()
RETURNS TRIGGER AS $$
DECLARE
  v_creator_id UUID;
BEGIN
  SELECT creator_id INTO v_creator_id
  FROM public.projects
  WHERE id = NEW.project_id;

  IF v_creator_id = NEW.applicant_id THEN
    RAISE EXCEPTION 'Project creators cannot apply to their own project';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_prevent_self_application ON public.applications;
CREATE TRIGGER trg_prevent_self_application
  BEFORE INSERT ON public.applications
  FOR EACH ROW EXECUTE FUNCTION public.check_self_application();

-- ============================================================================
-- 2. PROJECT MEMBERS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.project_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('client', 'freelancer')),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_project_member UNIQUE (project_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_project_members_project_id ON public.project_members(project_id);
CREATE INDEX IF NOT EXISTS idx_project_members_user_id ON public.project_members(user_id);

-- ============================================================================
-- 3. IN-APP NOTIFICATIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link_url TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);

-- ============================================================================
-- 4. ATOMIC RPC FUNCTION: accept_project_application
-- ============================================================================

CREATE OR REPLACE FUNCTION public.accept_project_application(p_application_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_app RECORD;
  v_project RECORD;
  v_new_filled INTEGER;
BEGIN
  -- 1. Fetch application
  SELECT * INTO v_app
  FROM public.applications
  WHERE id = p_application_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Application with ID % was not found', p_application_id;
  END IF;

  -- 2. Fetch project with exclusive row lock to avoid race conditions
  SELECT * INTO v_project
  FROM public.projects
  WHERE id = v_app.project_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Project with ID % was not found', v_app.project_id;
  END IF;

  -- 3. Verify that caller is the project creator (if running in auth context)
  IF auth.uid() IS NOT NULL AND v_project.creator_id != auth.uid() THEN
    RAISE EXCEPTION 'Only the project creator can accept applications';
  END IF;

  -- 4. Validate capacity (prevent over-acceptance)
  IF v_project.positions_filled >= v_project.positions_total THEN
    RAISE EXCEPTION 'All positions for this project have already been filled (%/%)', v_project.positions_filled, v_project.positions_total;
  END IF;

  -- 5. Prevent accepting an already accepted application
  IF v_app.status = 'accepted' THEN
    RAISE EXCEPTION 'This application has already been accepted';
  END IF;

  -- 6. Update application status
  UPDATE public.applications
  SET status = 'accepted',
      updated_at = now()
  WHERE id = p_application_id;

  -- 7. Add applicant as freelancer in project_members
  INSERT INTO public.project_members (project_id, user_id, role)
  VALUES (v_app.project_id, v_app.applicant_id, 'freelancer')
  ON CONFLICT (project_id, user_id) DO NOTHING;

  -- 8. Ensure project creator is registered as client in project_members
  INSERT INTO public.project_members (project_id, user_id, role)
  VALUES (v_app.project_id, v_project.creator_id, 'client')
  ON CONFLICT (project_id, user_id) DO NOTHING;

  -- 9. Increment positions_filled and transition project status
  v_new_filled := v_project.positions_filled + 1;

  UPDATE public.projects
  SET positions_filled = v_new_filled,
      status = 'in_progress',
      updated_at = now()
  WHERE id = v_app.project_id;

  -- 10. Insert in-app notification for the accepted freelancer
  INSERT INTO public.notifications (
    user_id,
    type,
    title,
    message,
    link_url
  ) VALUES (
    v_app.applicant_id,
    'application_accepted',
    'Application Accepted! 🎉',
    'Your application for "' || v_project.title || '" has been accepted.',
    '/projects/' || v_app.project_id
  );

  RETURN jsonb_build_object(
    'success', true,
    'application_id', p_application_id,
    'project_id', v_app.project_id,
    'positions_filled', v_new_filled,
    'positions_total', v_project.positions_total,
    'project_status', 'in_progress'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ============================================================================
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- 5.1 Applications RLS
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Applicants and project creators can view applications" ON public.applications;
CREATE POLICY "Applicants and project creators can view applications"
  ON public.applications
  FOR SELECT
  TO authenticated
  USING (
    applicant_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = applications.project_id AND p.creator_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Applicants can submit applications for open projects" ON public.applications;
CREATE POLICY "Applicants can submit applications for open projects"
  ON public.applications
  FOR INSERT
  TO authenticated
  WITH CHECK (
    applicant_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = applications.project_id
        AND p.status IN ('open', 'reviewing')
        AND p.creator_id != auth.uid()
    )
  );

DROP POLICY IF EXISTS "Applicants can withdraw own application" ON public.applications;
CREATE POLICY "Applicants can withdraw own application"
  ON public.applications
  FOR UPDATE
  TO authenticated
  USING (applicant_id = auth.uid())
  WITH CHECK (
    applicant_id = auth.uid()
    AND status = 'withdrawn'
  );

DROP POLICY IF EXISTS "Project creators can update application status" ON public.applications;
CREATE POLICY "Project creators can update application status"
  ON public.applications
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = applications.project_id AND p.creator_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = applications.project_id AND p.creator_id = auth.uid()
    )
  );

-- 5.2 Project Members RLS
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Project members can view project membership" ON public.project_members;
CREATE POLICY "Project members can view project membership"
  ON public.project_members
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = project_members.project_id AND p.creator_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.project_members pm
      WHERE pm.project_id = project_members.project_id AND pm.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Project creators can manage project members" ON public.project_members;
CREATE POLICY "Project creators can manage project members"
  ON public.project_members
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = project_members.project_id AND p.creator_id = auth.uid()
    )
  );

-- 5.3 Notifications RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
CREATE POLICY "Users can view own notifications"
  ON public.notifications
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
CREATE POLICY "Users can update own notifications"
  ON public.notifications
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Authenticated users can create notifications" ON public.notifications;
CREATE POLICY "Authenticated users can create notifications"
  ON public.notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (true);
