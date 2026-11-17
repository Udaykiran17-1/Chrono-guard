-- Collaboration phase: immutable agreement versions and member-only workspaces.

CREATE TABLE IF NOT EXISTS public.project_agreements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  application_id UUID NOT NULL UNIQUE REFERENCES public.applications(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  freelancer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_agreement_parties_differ CHECK (client_id <> freelancer_id)
);

CREATE TABLE IF NOT EXISTS public.agreement_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agreement_id UUID NOT NULL REFERENCES public.project_agreements(id) ON DELETE CASCADE,
  version INTEGER NOT NULL CHECK (version > 0),
  terms JSONB NOT NULL,
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  client_accepted_at TIMESTAMPTZ,
  freelancer_accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (agreement_id, version)
);

CREATE TABLE IF NOT EXISTS public.project_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (length(trim(title)) BETWEEN 1 AND 160),
  description TEXT NOT NULL DEFAULT '',
  due_date DATE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'submitted', 'approved', 'needs_revision')),
  completion_notes TEXT,
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.project_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  kind TEXT NOT NULL DEFAULT 'update' CHECK (kind IN ('update', 'comment')),
  body TEXT NOT NULL CHECK (length(trim(body)) BETWEEN 1 AND 4000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.project_change_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  requester_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  respondent_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('scope_change', 'dispute')),
  title TEXT NOT NULL CHECK (length(trim(title)) BETWEEN 3 AND 160),
  details TEXT NOT NULL CHECK (length(trim(details)) BETWEEN 5 AND 4000),
  suggested_terms JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'accepted', 'declined', 'resolved')),
  response TEXT,
  handled_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_change_parties_differ CHECK (requester_id <> respondent_id)
);

CREATE OR REPLACE FUNCTION public.enforce_milestone_transition()
RETURNS TRIGGER AS $$
DECLARE
  v_role TEXT;
BEGIN
  IF NEW.project_id IS DISTINCT FROM OLD.project_id OR NEW.created_by IS DISTINCT FROM OLD.created_by THEN
    RAISE EXCEPTION 'Milestone project and creator cannot be changed';
  END IF;
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    SELECT role INTO v_role FROM public.project_members
    WHERE project_id = OLD.project_id AND user_id = auth.uid();
    IF (OLD.status = 'pending' AND NEW.status = 'in_progress' AND v_role = 'freelancer')
      OR (OLD.status IN ('in_progress', 'needs_revision') AND NEW.status = 'submitted' AND v_role = 'freelancer')
      OR (OLD.status = 'needs_revision' AND NEW.status = 'in_progress' AND v_role = 'freelancer')
      OR (OLD.status = 'submitted' AND NEW.status IN ('approved', 'needs_revision') AND v_role = 'client') THEN
      RETURN NEW;
    END IF;
    RAISE EXCEPTION 'This milestone status transition is not allowed for your project role';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER trg_enforce_milestone_transition BEFORE UPDATE ON public.project_milestones
  FOR EACH ROW EXECUTE FUNCTION public.enforce_milestone_transition();

CREATE OR REPLACE FUNCTION public.enforce_project_completion_requirements()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status IS DISTINCT FROM 'completed' THEN
    IF auth.uid() IS NULL OR NOT public.is_account_active(auth.uid()) OR auth.uid() <> NEW.creator_id THEN
      RAISE EXCEPTION 'Only the project creator can complete this project';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM public.project_agreements a WHERE a.project_id = NEW.id
      AND public.has_active_project_agreement(NEW.id, a.client_id)) THEN
      RAISE EXCEPTION 'A mutually accepted project agreement is required before completion';
    END IF;
    IF EXISTS (SELECT 1 FROM public.project_milestones WHERE project_id = NEW.id AND status <> 'approved') THEN
      RAISE EXCEPTION 'All project milestones must be approved before completion';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
CREATE TRIGGER trg_require_project_completion BEFORE UPDATE OF status ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.enforce_project_completion_requirements();

CREATE INDEX IF NOT EXISTS idx_agreement_versions_latest ON public.agreement_versions(agreement_id, version DESC);
CREATE INDEX IF NOT EXISTS idx_project_milestones_project ON public.project_milestones(project_id, due_date);
CREATE INDEX IF NOT EXISTS idx_project_updates_project ON public.project_updates(project_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_project_change_requests_project ON public.project_change_requests(project_id, created_at DESC);

CREATE OR REPLACE FUNCTION public.has_active_project_agreement(p_project_id UUID, p_user_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.project_agreements a
    JOIN LATERAL (
      SELECT av.client_accepted_at, av.freelancer_accepted_at
      FROM public.agreement_versions av WHERE av.agreement_id = a.id
      ORDER BY av.version DESC LIMIT 1
    ) latest ON true
    WHERE a.project_id = p_project_id
      AND p_user_id IN (a.client_id, a.freelancer_id)
      AND latest.client_accepted_at IS NOT NULL
      AND latest.freelancer_accepted_at IS NOT NULL
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.has_active_agreement_between(p_project_id UUID, p_first_user UUID, p_second_user UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.project_agreements a
    JOIN LATERAL (
      SELECT av.client_accepted_at, av.freelancer_accepted_at
      FROM public.agreement_versions av WHERE av.agreement_id = a.id
      ORDER BY av.version DESC LIMIT 1
    ) latest ON true
    WHERE a.project_id = p_project_id
      AND ((a.client_id = p_first_user AND a.freelancer_id = p_second_user)
        OR (a.client_id = p_second_user AND a.freelancer_id = p_first_user))
      AND latest.client_accepted_at IS NOT NULL
      AND latest.freelancer_accepted_at IS NOT NULL
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

ALTER TABLE public.project_agreements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agreement_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_change_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Agreement parties can read agreements" ON public.project_agreements;
CREATE POLICY "Agreement parties can read agreements" ON public.project_agreements
  FOR SELECT TO authenticated USING (auth.uid() IN (client_id, freelancer_id));

DROP POLICY IF EXISTS "Agreement parties can read versions" ON public.agreement_versions;
CREATE POLICY "Agreement parties can read versions" ON public.agreement_versions
  FOR SELECT TO authenticated USING (EXISTS (
    SELECT 1 FROM public.project_agreements a
    WHERE a.id = agreement_versions.agreement_id AND auth.uid() IN (a.client_id, a.freelancer_id)
  ));

DROP POLICY IF EXISTS "Project members can read milestones" ON public.project_milestones;
CREATE POLICY "Project members can read milestones" ON public.project_milestones
  FOR SELECT TO authenticated USING (EXISTS (
    SELECT 1 FROM public.project_members pm
    WHERE pm.project_id = project_milestones.project_id AND pm.user_id = auth.uid()
  ) AND public.has_active_project_agreement(project_id, auth.uid()));
DROP POLICY IF EXISTS "Project members can create milestones" ON public.project_milestones;
CREATE POLICY "Project members can create milestones" ON public.project_milestones
  FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid() AND status = 'pending' AND completion_notes IS NULL AND EXISTS (
    SELECT 1 FROM public.project_members pm
    WHERE pm.project_id = project_milestones.project_id AND pm.user_id = auth.uid()
  ) AND public.has_active_project_agreement(project_id, auth.uid()));
DROP POLICY IF EXISTS "Project members can update milestones" ON public.project_milestones;
CREATE POLICY "Project members can update milestones" ON public.project_milestones
  FOR UPDATE TO authenticated USING (EXISTS (
    SELECT 1 FROM public.project_members pm
    WHERE pm.project_id = project_milestones.project_id AND pm.user_id = auth.uid()
  ) AND public.has_active_project_agreement(project_id, auth.uid())) WITH CHECK (EXISTS (
    SELECT 1 FROM public.project_members pm
    WHERE pm.project_id = project_milestones.project_id AND pm.user_id = auth.uid()
  ) AND public.has_active_project_agreement(project_id, auth.uid()));

DROP POLICY IF EXISTS "Project members can read updates" ON public.project_updates;
CREATE POLICY "Project members can read updates" ON public.project_updates
  FOR SELECT TO authenticated USING (EXISTS (
    SELECT 1 FROM public.project_members pm
    WHERE pm.project_id = project_updates.project_id AND pm.user_id = auth.uid()
  ) AND public.has_active_project_agreement(project_id, auth.uid()));
DROP POLICY IF EXISTS "Project members can post updates" ON public.project_updates;
CREATE POLICY "Project members can post updates" ON public.project_updates
  FOR INSERT TO authenticated WITH CHECK (author_id = auth.uid() AND EXISTS (
    SELECT 1 FROM public.project_members pm
    WHERE pm.project_id = project_updates.project_id AND pm.user_id = auth.uid()
  ) AND public.has_active_project_agreement(project_id, auth.uid()));

CREATE POLICY "Project members can read change requests" ON public.project_change_requests FOR SELECT TO authenticated
  USING (auth.uid() IN (requester_id, respondent_id) AND public.is_project_member(project_id, auth.uid()));
CREATE POLICY "Project members can raise change requests" ON public.project_change_requests FOR INSERT TO authenticated
  WITH CHECK (requester_id = auth.uid() AND status = 'open' AND response IS NULL AND handled_by IS NULL
    AND public.is_project_member(project_id, respondent_id)
    AND public.has_active_agreement_between(project_id, requester_id, respondent_id));

CREATE OR REPLACE FUNCTION public.respond_to_project_change(p_request_id UUID, p_status TEXT, p_response TEXT)
RETURNS JSONB AS $$
DECLARE
  v_request public.project_change_requests%ROWTYPE;
  v_agreement public.project_agreements%ROWTYPE;
  v_terms JSONB;
  v_version INTEGER;
BEGIN
  SELECT * INTO v_request FROM public.project_change_requests WHERE id = p_request_id FOR UPDATE;
  IF NOT FOUND OR v_request.status <> 'open' THEN RAISE EXCEPTION 'This request is no longer open'; END IF;
  IF auth.uid() IS NULL OR NOT public.is_account_active(auth.uid()) OR auth.uid() <> v_request.respondent_id
    OR NOT public.has_active_agreement_between(v_request.project_id, v_request.requester_id, v_request.respondent_id) THEN
    RAISE EXCEPTION 'Only the other project participant can respond';
  END IF;
  IF (v_request.kind = 'scope_change' AND p_status NOT IN ('accepted', 'declined'))
    OR (v_request.kind = 'dispute' AND p_status NOT IN ('resolved', 'declined')) THEN
    RAISE EXCEPTION 'Invalid response for this request type';
  END IF;
  IF v_request.kind = 'scope_change' AND p_status = 'accepted' THEN
    SELECT * INTO v_agreement FROM public.project_agreements a
    WHERE a.project_id = v_request.project_id
      AND ((a.client_id = auth.uid() AND a.freelancer_id = v_request.requester_id)
        OR (a.freelancer_id = auth.uid() AND a.client_id = v_request.requester_id))
    FOR UPDATE;
    IF NOT FOUND THEN RAISE EXCEPTION 'Agreement not found for these project participants'; END IF;
    SELECT terms INTO v_terms FROM public.agreement_versions
    WHERE agreement_id = v_agreement.id ORDER BY version DESC LIMIT 1;
    SELECT COALESCE(MAX(version), 0) + 1 INTO v_version
    FROM public.agreement_versions WHERE agreement_id = v_agreement.id;
    INSERT INTO public.agreement_versions(agreement_id, version, terms, created_by)
    VALUES (v_agreement.id, v_version,
      v_terms || jsonb_build_object('scope_change', v_request.details, 'scope_change_terms', v_request.suggested_terms), auth.uid());
  END IF;
  UPDATE public.project_change_requests
    SET status = p_status, response = NULLIF(trim(p_response), ''), handled_by = auth.uid(), updated_at = now()
    WHERE id = p_request_id;
  INSERT INTO public.notifications(user_id, type, title, message, link_url)
    VALUES (v_request.requester_id, 'project_' || v_request.kind || '_' || p_status,
      'Project request ' || p_status, 'Your project ' || replace(v_request.kind, '_', ' ') || ' request was ' || p_status || '.',
      '/projects/' || v_request.project_id || '/workspace');
  RETURN jsonb_build_object('id', p_request_id, 'status', p_status);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

REVOKE ALL ON FUNCTION public.respond_to_project_change(UUID, TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.respond_to_project_change(UUID, TEXT, TEXT) TO authenticated;

CREATE OR REPLACE FUNCTION public.complete_project_if_ready(p_project_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_project public.projects%ROWTYPE;
BEGIN
  SELECT * INTO v_project FROM public.projects WHERE id = p_project_id FOR UPDATE;
  IF NOT FOUND OR auth.uid() IS NULL OR NOT public.is_account_active(auth.uid()) OR auth.uid() <> v_project.creator_id THEN
    RAISE EXCEPTION 'Only the project creator can complete this project';
  END IF;
  IF v_project.status <> 'in_progress' THEN RAISE EXCEPTION 'Only an active project can be completed'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.project_agreements a WHERE a.project_id = p_project_id
    AND public.has_active_project_agreement(p_project_id, a.client_id)) THEN
    RAISE EXCEPTION 'At least one mutually accepted agreement is required';
  END IF;
  IF EXISTS (SELECT 1 FROM public.project_milestones WHERE project_id = p_project_id AND status <> 'approved') THEN
    RAISE EXCEPTION 'Approve all project milestones before completing the project';
  END IF;
  UPDATE public.projects SET status = 'completed', updated_at = now() WHERE id = p_project_id;
  INSERT INTO public.notifications(user_id, type, title, message, link_url)
    SELECT user_id, 'project_completed', 'Project completed', 'The project "' || v_project.title || '" has been marked complete. You can now leave collaboration feedback.', '/projects/' || p_project_id || '/workspace'
    FROM public.project_members WHERE project_id = p_project_id;
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
REVOKE ALL ON FUNCTION public.complete_project_if_ready(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.complete_project_if_ready(UUID) TO authenticated;

CREATE OR REPLACE FUNCTION public.create_project_agreement(p_application_id UUID, p_terms JSONB)
RETURNS UUID AS $$
DECLARE
  v_application public.applications%ROWTYPE;
  v_project public.projects%ROWTYPE;
  v_agreement_id UUID;
BEGIN
  SELECT * INTO v_application FROM public.applications WHERE id = p_application_id;
  IF NOT FOUND OR v_application.status <> 'accepted' THEN
    RAISE EXCEPTION 'An accepted application is required to create an agreement';
  END IF;
  SELECT * INTO v_project FROM public.projects WHERE id = v_application.project_id;
  IF auth.uid() IS NULL OR NOT public.is_account_active(auth.uid()) OR auth.uid() <> v_project.creator_id THEN
    RAISE EXCEPTION 'Only the project creator can propose the initial agreement';
  END IF;
  IF p_terms IS NULL OR jsonb_typeof(p_terms) <> 'object' THEN
    RAISE EXCEPTION 'Agreement terms must be provided';
  END IF;

  INSERT INTO public.project_agreements(project_id, application_id, client_id, freelancer_id)
  VALUES (v_project.id, v_application.id, v_project.creator_id, v_application.applicant_id)
  RETURNING id INTO v_agreement_id;
  INSERT INTO public.agreement_versions(agreement_id, version, terms, created_by)
  VALUES (v_agreement_id, 1, p_terms, auth.uid());
  INSERT INTO public.notifications(user_id, type, title, message, link_url)
  VALUES (v_application.applicant_id, 'agreement_awaiting_acceptance', 'Project agreement ready',
    'The project creator proposed agreement terms. Review and respond before work begins.',
    '/projects/' || v_project.id || '/workspace');
  RETURN v_agreement_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.propose_agreement_revision(p_agreement_id UUID, p_terms JSONB)
RETURNS UUID AS $$
DECLARE
  v_agreement public.project_agreements%ROWTYPE;
  v_version INTEGER;
  v_version_id UUID;
BEGIN
  SELECT * INTO v_agreement FROM public.project_agreements WHERE id = p_agreement_id FOR UPDATE;
  IF NOT FOUND OR auth.uid() IS NULL OR NOT public.is_account_active(auth.uid()) OR auth.uid() NOT IN (v_agreement.client_id, v_agreement.freelancer_id) THEN
    RAISE EXCEPTION 'Only agreement parties can propose a revision';
  END IF;
  IF p_terms IS NULL OR jsonb_typeof(p_terms) <> 'object' THEN
    RAISE EXCEPTION 'Agreement terms must be provided';
  END IF;
  SELECT COALESCE(MAX(version), 0) + 1 INTO v_version
  FROM public.agreement_versions WHERE agreement_id = p_agreement_id;
  INSERT INTO public.agreement_versions(agreement_id, version, terms, created_by)
  VALUES (p_agreement_id, v_version, p_terms, auth.uid()) RETURNING id INTO v_version_id;
  RETURN v_version_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.accept_agreement_version(p_version_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_agreement public.project_agreements%ROWTYPE;
  v_version public.agreement_versions%ROWTYPE;
BEGIN
  SELECT * INTO v_version FROM public.agreement_versions WHERE id = p_version_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Agreement version not found'; END IF;
  SELECT * INTO v_agreement FROM public.project_agreements WHERE id = v_version.agreement_id;
  IF v_version.version <> (SELECT MAX(version) FROM public.agreement_versions WHERE agreement_id = v_agreement.id) THEN
    RAISE EXCEPTION 'Only the latest agreement version can be accepted';
  END IF;
  IF NOT public.is_account_active(auth.uid()) THEN RAISE EXCEPTION 'An active account is required'; END IF;
  IF auth.uid() = v_agreement.client_id THEN
    UPDATE public.agreement_versions SET client_accepted_at = COALESCE(client_accepted_at, now()) WHERE id = p_version_id;
    INSERT INTO public.notifications(user_id, type, title, message, link_url)
    SELECT v_agreement.freelancer_id,
      CASE WHEN v_version.freelancer_accepted_at IS NULL THEN 'agreement_awaiting_acceptance' ELSE 'agreement_accepted' END,
      CASE WHEN v_version.freelancer_accepted_at IS NULL THEN 'Agreement awaiting your acceptance' ELSE 'Agreement accepted by both parties' END,
      CASE WHEN v_version.freelancer_accepted_at IS NULL THEN 'The client accepted the latest agreement version. Please review and respond.' ELSE 'Both parties accepted the latest agreement version. Project work can proceed.' END,
      '/projects/' || v_agreement.project_id || '/workspace'
    WHERE v_version.client_accepted_at IS NULL;
  ELSIF auth.uid() = v_agreement.freelancer_id THEN
    UPDATE public.agreement_versions SET freelancer_accepted_at = COALESCE(freelancer_accepted_at, now()) WHERE id = p_version_id;
    INSERT INTO public.notifications(user_id, type, title, message, link_url)
    SELECT v_agreement.client_id,
      CASE WHEN v_version.client_accepted_at IS NULL THEN 'agreement_awaiting_acceptance' ELSE 'agreement_accepted' END,
      CASE WHEN v_version.client_accepted_at IS NULL THEN 'Agreement awaiting your acceptance' ELSE 'Agreement accepted by both parties' END,
      CASE WHEN v_version.client_accepted_at IS NULL THEN 'The freelancer accepted the latest agreement version. Please review and respond.' ELSE 'Both parties accepted the latest agreement version. Project work can proceed.' END,
      '/projects/' || v_agreement.project_id || '/workspace'
    WHERE v_version.freelancer_accepted_at IS NULL;
  ELSE
    RAISE EXCEPTION 'Only agreement parties can accept this version';
  END IF;
  SELECT * INTO v_version FROM public.agreement_versions WHERE id = p_version_id;
  RETURN jsonb_build_object('client_accepted', v_version.client_accepted_at IS NOT NULL,
    'freelancer_accepted', v_version.freelancer_accepted_at IS NOT NULL,
    'active', v_version.client_accepted_at IS NOT NULL AND v_version.freelancer_accepted_at IS NOT NULL,
    'version', v_version.version);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

REVOKE ALL ON FUNCTION public.create_project_agreement(UUID, JSONB) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.propose_agreement_revision(UUID, JSONB) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.accept_agreement_version(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_project_agreement(UUID, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION public.propose_agreement_revision(UUID, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION public.accept_agreement_version(UUID) TO authenticated;
REVOKE ALL ON FUNCTION public.has_active_project_agreement(UUID, UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_active_project_agreement(UUID, UUID) TO authenticated;
REVOKE ALL ON FUNCTION public.has_active_agreement_between(UUID, UUID, UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_active_agreement_between(UUID, UUID, UUID) TO authenticated;
