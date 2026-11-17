-- Organisation continuity, completed-collaboration reviews, and content reports.

CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL CHECK (length(trim(name)) BETWEEN 2 AND 160),
  description TEXT NOT NULL DEFAULT '',
  university_id UUID REFERENCES public.universities(id) ON DELETE SET NULL,
  category TEXT NOT NULL DEFAULT 'student organization',
  logo_url TEXT,
  contact_email TEXT,
  is_official BOOLEAN NOT NULL DEFAULT false,
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('president', 'secretary', 'treasurer', 'event_coordinator', 'media_head', 'member')),
  permissions TEXT[] NOT NULL DEFAULT ARRAY['view'],
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (organization_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.organization_freelancers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  freelancer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  skills TEXT[] NOT NULL DEFAULT '{}',
  collaboration_date DATE,
  agreed_price NUMERIC CHECK (agreed_price >= 0),
  payment_status TEXT NOT NULL DEFAULT 'not_recorded' CHECK (payment_status IN ('not_recorded', 'pending', 'paid', 'not_applicable')),
  deliverables TEXT,
  feedback TEXT,
  notes TEXT,
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.organization_handovers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  prepared_by UUID NOT NULL REFERENCES public.profiles(id),
  incoming_user_id UUID NOT NULL REFERENCES public.profiles(id),
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'accepted', 'declined')),
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_handover_parties_differ CHECK (incoming_user_id <> prepared_by)
);

CREATE TABLE IF NOT EXISTS public.project_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reviewee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  communication SMALLINT NOT NULL CHECK (communication BETWEEN 1 AND 5),
  reliability SMALLINT NOT NULL CHECK (reliability BETWEEN 1 AND 5),
  quality SMALLINT NOT NULL CHECK (quality BETWEEN 1 AND 5),
  deadlines SMALLINT NOT NULL CHECK (deadlines BETWEEN 1 AND 5),
  overall SMALLINT NOT NULL CHECK (overall BETWEEN 1 AND 5),
  feedback TEXT NOT NULL CHECK (length(trim(feedback)) BETWEEN 1 AND 2000),
  moderation_status TEXT NOT NULL DEFAULT 'visible' CHECK (moderation_status IN ('visible', 'hidden')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_review_parties_differ CHECK (reviewer_id <> reviewee_id),
  UNIQUE (project_id, reviewer_id, reviewee_id)
);

CREATE TABLE IF NOT EXISTS public.project_skill_endorsements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES public.skills(id) ON DELETE RESTRICT,
  endorser_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_endorsement_parties_differ CHECK (endorser_id <> student_id),
  UNIQUE (project_id, skill_id, endorser_id, student_id)
);

CREATE TABLE IF NOT EXISTS public.content_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  target_type TEXT NOT NULL CHECK (target_type IN ('profile', 'project', 'review', 'organization')),
  target_id UUID NOT NULL,
  reason TEXT NOT NULL CHECK (length(trim(reason)) BETWEEN 5 AND 1000),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'resolved', 'dismissed')),
  moderator_id UUID REFERENCES public.profiles(id),
  resolution_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.moderation_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  moderator_id UUID NOT NULL REFERENCES public.profiles(id),
  report_id UUID REFERENCES public.content_reports(id) ON DELETE SET NULL,
  action TEXT NOT NULL CHECK (action IN ('hide_review', 'resolve_report', 'dismiss_report', 'account_action')),
  details TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.notification_preferences (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  in_app_enabled BOOLEAN NOT NULL DEFAULT true,
  email_enabled BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_organization_members_user ON public.organization_members(user_id);
CREATE INDEX IF NOT EXISTS idx_org_freelancers_org ON public.organization_freelancers(organization_id, collaboration_date DESC);
CREATE INDEX IF NOT EXISTS idx_org_handovers_org ON public.organization_handovers(organization_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewee ON public.project_reviews(reviewee_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reports_status ON public.content_reports(status, created_at DESC);

CREATE OR REPLACE FUNCTION public.is_platform_admin(p_user_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = p_user_id AND platform_role = 'admin');
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.is_account_active(p_user_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = p_user_id AND account_status = 'active');
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

DROP POLICY IF EXISTS "Admins can view and manage all profiles" ON public.profiles;
CREATE POLICY "Administrators can view all profiles" ON public.profiles FOR SELECT TO authenticated
  USING (public.is_platform_admin(auth.uid()));
CREATE POLICY "Administrators can update profiles" ON public.profiles FOR UPDATE TO authenticated
  USING (public.is_platform_admin(auth.uid())) WITH CHECK (public.is_platform_admin(auth.uid()));

CREATE OR REPLACE FUNCTION public.prevent_account_status_self_change()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.account_status IS DISTINCT FROM OLD.account_status AND NOT public.is_platform_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Only platform administrators can change account status';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER trg_prevent_account_status_self_change BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.prevent_account_status_self_change();

CREATE OR REPLACE FUNCTION public.has_org_permission(p_org_id UUID, p_user_id UUID, p_permission TEXT)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE organization_id = p_org_id AND user_id = p_user_id
      AND (p_permission = ANY(permissions) OR 'admin' = ANY(permissions))
  ) OR EXISTS (SELECT 1 FROM public.organizations WHERE id = p_org_id AND created_by = p_user_id);
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.enforce_organization_trust_fields()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.is_official AND NOT public.is_platform_admin(auth.uid()) THEN
      RAISE EXCEPTION 'Only platform administrators can create official organizations';
    END IF;
    RETURN NEW;
  END IF;
  IF NEW.is_official IS DISTINCT FROM OLD.is_official AND NOT public.is_platform_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Only platform administrators can change official organization status';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER trg_enforce_organization_trust_fields BEFORE INSERT OR UPDATE ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION public.enforce_organization_trust_fields();

CREATE OR REPLACE FUNCTION public.enforce_organization_project_link()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.organization_id IS NOT NULL AND NOT public.has_org_permission(NEW.organization_id, NEW.creator_id, 'manage_org') THEN
    RAISE EXCEPTION 'Project creator must have organization management permission to link a project';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
CREATE TRIGGER trg_enforce_organization_project_insert BEFORE INSERT ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.enforce_organization_project_link();
CREATE TRIGGER trg_enforce_organization_project_update BEFORE UPDATE OF organization_id, creator_id ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.enforce_organization_project_link();

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_freelancers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_handovers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_skill_endorsements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moderation_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Organization members can read organizations" ON public.organizations FOR SELECT TO authenticated
  USING (created_by = auth.uid() OR public.is_platform_admin(auth.uid()) OR EXISTS (SELECT 1 FROM public.organization_members m WHERE m.organization_id = id AND m.user_id = auth.uid()));
CREATE POLICY "Authenticated users can create organizations" ON public.organizations FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());
CREATE POLICY "Organization managers can update organizations" ON public.organizations FOR UPDATE TO authenticated
  USING (public.has_org_permission(id, auth.uid(), 'manage_org')) WITH CHECK (public.has_org_permission(id, auth.uid(), 'manage_org'));

CREATE POLICY "Members can view organization membership" ON public.organization_members FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_org_permission(organization_id, auth.uid(), 'manage_members'));
CREATE POLICY "Organization managers can add members" ON public.organization_members FOR INSERT TO authenticated
  WITH CHECK (public.has_org_permission(organization_id, auth.uid(), 'manage_members'));
CREATE POLICY "Organization managers can update members" ON public.organization_members FOR UPDATE TO authenticated
  USING (public.has_org_permission(organization_id, auth.uid(), 'manage_members')) WITH CHECK (public.has_org_permission(organization_id, auth.uid(), 'manage_members'));
CREATE POLICY "Organization managers can remove members" ON public.organization_members FOR DELETE TO authenticated
  USING (public.has_org_permission(organization_id, auth.uid(), 'manage_members'));

CREATE POLICY "Authorized members can read freelancer records" ON public.organization_freelancers FOR SELECT TO authenticated
  USING (public.has_org_permission(organization_id, auth.uid(), 'view_records'));
CREATE POLICY "Authorized members can create freelancer records" ON public.organization_freelancers FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid() AND public.has_org_permission(organization_id, auth.uid(), 'manage_records'));
CREATE POLICY "Authorized members can update freelancer records" ON public.organization_freelancers FOR UPDATE TO authenticated
  USING (public.has_org_permission(organization_id, auth.uid(), 'manage_records')) WITH CHECK (public.has_org_permission(organization_id, auth.uid(), 'manage_records'));
CREATE POLICY "Authorized members can delete freelancer records" ON public.organization_freelancers FOR DELETE TO authenticated
  USING (public.has_org_permission(organization_id, auth.uid(), 'manage_records'));

CREATE POLICY "Members can read handovers" ON public.organization_handovers FOR SELECT TO authenticated
  USING (public.has_org_permission(organization_id, auth.uid(), 'view_handover') OR incoming_user_id = auth.uid());
CREATE POLICY "Managers can prepare handovers" ON public.organization_handovers FOR INSERT TO authenticated
  WITH CHECK (prepared_by = auth.uid() AND status = 'pending' AND accepted_at IS NULL
    AND public.has_org_permission(organization_id, auth.uid(), 'manage_handover'));
CREATE POLICY "Parties can update handovers" ON public.organization_handovers FOR UPDATE TO authenticated
  USING (prepared_by = auth.uid() OR incoming_user_id = auth.uid())
  WITH CHECK (prepared_by = auth.uid() OR incoming_user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.enforce_handover_transition()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status = 'accepted' THEN RAISE EXCEPTION 'Accepted handovers are immutable'; END IF;
  IF NEW.organization_id IS DISTINCT FROM OLD.organization_id
    OR NEW.prepared_by IS DISTINCT FROM OLD.prepared_by
    OR NEW.incoming_user_id IS DISTINCT FROM OLD.incoming_user_id THEN
    RAISE EXCEPTION 'Handover parties and organization cannot be changed';
  END IF;
  IF OLD.status = 'pending' AND NEW.payload IS DISTINCT FROM OLD.payload THEN
    RAISE EXCEPTION 'Submitted handover contents cannot be changed';
  END IF;
  IF NEW.status = 'pending' AND auth.uid() <> OLD.prepared_by THEN
    RAISE EXCEPTION 'Only the outgoing administrator can submit a handover';
  END IF;
  IF NEW.status IN ('accepted', 'declined') AND (OLD.status <> 'pending' OR auth.uid() <> OLD.incoming_user_id) THEN
    RAISE EXCEPTION 'Only the incoming administrator can accept or decline a pending handover';
  END IF;
  IF NEW.status = 'accepted' THEN NEW.accepted_at := now(); END IF;
  IF NEW.status = 'accepted' THEN
    UPDATE public.organization_members
      SET role = 'secretary', permissions = ARRAY['view', 'view_records', 'view_handover']
      WHERE organization_id = NEW.organization_id AND user_id = NEW.prepared_by;
    INSERT INTO public.organization_members(organization_id, user_id, role, permissions)
      VALUES (NEW.organization_id, NEW.incoming_user_id, 'president', ARRAY['admin', 'view_records', 'manage_records', 'view_handover', 'manage_handover', 'manage_members', 'manage_org'])
      ON CONFLICT (organization_id, user_id) DO UPDATE SET role = 'president', permissions = EXCLUDED.permissions;
    UPDATE public.organizations SET created_by = NEW.incoming_user_id WHERE id = NEW.organization_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
CREATE TRIGGER trg_enforce_handover_transition BEFORE UPDATE ON public.organization_handovers
  FOR EACH ROW EXECUTE FUNCTION public.enforce_handover_transition();

CREATE OR REPLACE FUNCTION public.notify_handover_event()
RETURNS TRIGGER AS $$
DECLARE
  v_name TEXT;
BEGIN
  SELECT name INTO v_name FROM public.organizations WHERE id = NEW.organization_id;
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.notifications(user_id, type, title, message, link_url)
    VALUES (NEW.incoming_user_id, 'handover_request', 'Committee handover request',
      'A committee handover for "' || v_name || '" is ready for your review.', '/organizations');
  ELSIF NEW.status IS DISTINCT FROM OLD.status AND NEW.status IN ('accepted', 'declined') THEN
    INSERT INTO public.notifications(user_id, type, title, message, link_url)
    VALUES (NEW.prepared_by, 'handover_' || NEW.status, 'Handover ' || NEW.status,
      'The incoming committee member ' || NEW.status || ' the handover for "' || v_name || '".', '/organizations');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
CREATE TRIGGER trg_notify_handover_insert AFTER INSERT ON public.organization_handovers
  FOR EACH ROW EXECUTE FUNCTION public.notify_handover_event();
CREATE TRIGGER trg_notify_handover_response AFTER UPDATE OF status ON public.organization_handovers
  FOR EACH ROW EXECUTE FUNCTION public.notify_handover_event();

CREATE POLICY "Visible reviews are public and admins can inspect hidden reviews" ON public.project_reviews FOR SELECT TO authenticated
  USING (moderation_status = 'visible' OR public.is_platform_admin(auth.uid()));
CREATE POLICY "Participants can review completed projects" ON public.project_reviews FOR INSERT TO authenticated
  WITH CHECK (
    reviewer_id = auth.uid()
    AND moderation_status = 'visible'
    AND EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_id AND p.status = 'completed')
    AND EXISTS (SELECT 1 FROM public.project_members pm WHERE pm.project_id = project_id AND pm.user_id = auth.uid())
    AND EXISTS (SELECT 1 FROM public.project_members pm WHERE pm.project_id = project_id AND pm.user_id = reviewee_id)
    AND reviewer_id <> reviewee_id
  );

CREATE POLICY "Project skill endorsements are visible to members" ON public.project_skill_endorsements FOR SELECT TO authenticated
  USING (true);
CREATE POLICY "Participants can endorse skills from completed projects" ON public.project_skill_endorsements FOR INSERT TO authenticated
  WITH CHECK (
    endorser_id = auth.uid()
    AND EXISTS (SELECT 1 FROM public.projects p WHERE p.id = project_id AND p.status = 'completed')
    AND EXISTS (SELECT 1 FROM public.project_members pm WHERE pm.project_id = project_id AND pm.user_id = auth.uid())
    AND EXISTS (SELECT 1 FROM public.project_members pm WHERE pm.project_id = project_id AND pm.user_id = student_id)
    AND EXISTS (SELECT 1 FROM public.project_skills ps WHERE ps.project_id = project_skill_endorsements.project_id AND ps.skill_id = project_skill_endorsements.skill_id)
  );

CREATE POLICY "Users can read their own reports and admins can read all" ON public.content_reports FOR SELECT TO authenticated
  USING (reporter_id = auth.uid() OR public.is_platform_admin(auth.uid()));
CREATE POLICY "Users can file reports" ON public.content_reports FOR INSERT TO authenticated
  WITH CHECK (reporter_id = auth.uid() AND status = 'pending' AND moderator_id IS NULL AND resolved_at IS NULL);
CREATE POLICY "Only admins can moderate reports" ON public.content_reports FOR UPDATE TO authenticated
  USING (public.is_platform_admin(auth.uid())) WITH CHECK (public.is_platform_admin(auth.uid()));
CREATE POLICY "Only admins can hide reviews" ON public.project_reviews FOR UPDATE TO authenticated
  USING (public.is_platform_admin(auth.uid())) WITH CHECK (public.is_platform_admin(auth.uid()));
CREATE POLICY "Admins can inspect moderation history" ON public.moderation_actions FOR SELECT TO authenticated
  USING (public.is_platform_admin(auth.uid()));
CREATE POLICY "Admins can record moderation actions" ON public.moderation_actions FOR INSERT TO authenticated
  WITH CHECK (moderator_id = auth.uid() AND public.is_platform_admin(auth.uid()));
CREATE POLICY "Users can read their notification preferences" ON public.notification_preferences FOR SELECT TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY "Users can save their notification preferences" ON public.notification_preferences FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their notification preferences" ON public.notification_preferences FOR UPDATE TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Suspension/deactivation must gate existing sessions across every user-facing table.
DO $$
DECLARE
  table_name TEXT;
BEGIN
  FOREACH table_name IN ARRAY ARRAY[
    'universities', 'departments', 'profiles', 'skills', 'user_skills',
    'portfolio_items', 'portfolio_item_skills', 'projects', 'project_skills',
    'saved_projects', 'saved_freelancers', 'applications', 'project_members', 'notifications',
    'project_agreements', 'agreement_versions', 'project_milestones', 'project_updates', 'project_change_requests',
    'organizations', 'organization_members', 'organization_freelancers', 'organization_handovers',
    'project_reviews', 'project_skill_endorsements', 'content_reports', 'moderation_actions', 'notification_preferences'
  ] LOOP
    EXECUTE format(
      'CREATE POLICY "Require active account" ON public.%I AS RESTRICTIVE FOR ALL TO authenticated USING (public.is_account_active(auth.uid())) WITH CHECK (public.is_account_active(auth.uid()))',
      table_name
    );
  END LOOP;
END;
$$;

CREATE POLICY "Require active account for storage" ON storage.objects AS RESTRICTIVE FOR ALL TO authenticated
  USING (public.is_account_active(auth.uid())) WITH CHECK (public.is_account_active(auth.uid()));

CREATE OR REPLACE FUNCTION public.apply_notification_preferences()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.notification_preferences
    WHERE user_id = NEW.user_id AND in_app_enabled = false
  ) THEN
    RETURN NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
CREATE TRIGGER trg_apply_notification_preferences BEFORE INSERT ON public.notifications
  FOR EACH ROW EXECUTE FUNCTION public.apply_notification_preferences();

CREATE OR REPLACE FUNCTION public.restrict_moderation_edits()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_TABLE_NAME = 'project_reviews' THEN
    IF NEW.id IS DISTINCT FROM OLD.id OR NEW.project_id IS DISTINCT FROM OLD.project_id
      OR NEW.reviewer_id IS DISTINCT FROM OLD.reviewer_id OR NEW.reviewee_id IS DISTINCT FROM OLD.reviewee_id
      OR NEW.communication IS DISTINCT FROM OLD.communication OR NEW.reliability IS DISTINCT FROM OLD.reliability
      OR NEW.quality IS DISTINCT FROM OLD.quality OR NEW.deadlines IS DISTINCT FROM OLD.deadlines
      OR NEW.overall IS DISTINCT FROM OLD.overall OR NEW.feedback IS DISTINCT FROM OLD.feedback
      OR NEW.created_at IS DISTINCT FROM OLD.created_at THEN
      RAISE EXCEPTION 'Review content is immutable; moderation may only change its visibility';
    END IF;
  ELSE
    IF NEW.id IS DISTINCT FROM OLD.id OR NEW.reporter_id IS DISTINCT FROM OLD.reporter_id
      OR NEW.target_type IS DISTINCT FROM OLD.target_type OR NEW.target_id IS DISTINCT FROM OLD.target_id
      OR NEW.reason IS DISTINCT FROM OLD.reason OR NEW.created_at IS DISTINCT FROM OLD.created_at THEN
      RAISE EXCEPTION 'Report details are immutable';
    END IF;
    IF NEW.status NOT IN ('reviewing', 'resolved', 'dismissed') THEN
      RAISE EXCEPTION 'Invalid report status';
    END IF;
    NEW.moderator_id := auth.uid();
    IF NEW.status IN ('resolved', 'dismissed') THEN NEW.resolved_at := now(); END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER trg_restrict_review_moderation BEFORE UPDATE ON public.project_reviews
  FOR EACH ROW EXECUTE FUNCTION public.restrict_moderation_edits();
CREATE TRIGGER trg_restrict_report_moderation BEFORE UPDATE ON public.content_reports
  FOR EACH ROW EXECUTE FUNCTION public.restrict_moderation_edits();

REVOKE ALL ON FUNCTION public.is_platform_admin(UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_account_active(UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.has_org_permission(UUID, UUID, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_platform_admin(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_account_active(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_org_permission(UUID, UUID, TEXT) TO authenticated;
