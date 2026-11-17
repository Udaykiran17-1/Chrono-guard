import { supabase } from '../lib/supabase';
import { isSupabaseConfigured } from './authService';
import { getProjectById } from './projectService';
import { changeProjectStatus } from './projectService';

const WORKSPACE_KEY = 'skillbridge_mock_workspaces';
const AGREEMENTS_KEY = 'skillbridge_mock_agreements';

function read(key) {
  try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch { return []; }
}
function write(key, value) { localStorage.setItem(key, JSON.stringify(value)); }

export async function getWorkspace(projectId, userId) {
  if (!projectId || !userId) throw new Error('Project and member are required');
  if (isSupabaseConfigured()) {
    const [projectResult, memberResult, agreementResult, milestoneResult, updateResult, requestResult] = await Promise.all([
      supabase.from('projects').select('*, project_skills(*, skills(*))').eq('id', projectId).single(),
      supabase.from('project_members').select('user_id, role, profiles(id, full_name, avatar_url)').eq('project_id', projectId),
      supabase.from('project_agreements').select('*, agreement_versions(*)').eq('project_id', projectId),
      supabase.from('project_milestones').select('*').eq('project_id', projectId).order('due_date', { ascending: true }),
      supabase.from('project_updates').select('*, profiles:author_id(full_name)').eq('project_id', projectId).order('created_at', { ascending: false }),
      supabase.from('project_change_requests').select('*').eq('project_id', projectId).order('created_at', { ascending: false }),
    ]);
    const failure = [projectResult, memberResult, agreementResult, milestoneResult, updateResult, requestResult].find((result) => result.error);
    if (failure) throw failure.error;
    if (!memberResult.data.some((member) => member.user_id === userId)) throw new Error('Workspace access is limited to project members.');
    return { project: projectResult.data, members: memberResult.data, agreements: agreementResult.data, milestones: milestoneResult.data, updates: updateResult.data, changeRequests: requestResult.data };
  }
  const project = await getProjectById(projectId);
  if (!project) throw new Error('Project not found');
  const members = read('skillbridge_mock_project_members').filter((member) => member.project_id === projectId);
  if (!members.some((member) => member.user_id === userId)) throw new Error('Workspace access is limited to project members.');
  return {
    project, members, agreements: read(AGREEMENTS_KEY).filter((item) => item.project_id === projectId),
    milestones: read(WORKSPACE_KEY).filter((item) => item.project_id === projectId && item.type === 'milestone'),
    updates: read(WORKSPACE_KEY).filter((item) => item.project_id === projectId && item.type === 'update'),
    changeRequests: read('skillbridge_mock_change_requests').filter((item) => item.project_id === projectId && (item.requester_id === userId || item.respondent_id === userId)),
  };
}

export async function createAgreement(applicationId, projectId, terms, clientId, freelancerId) {
  if (isSupabaseConfigured()) {
    const { data, error } = await supabase.rpc('create_project_agreement', { p_application_id: applicationId, p_terms: terms });
    if (error) throw error;
    return { id: data, project_id: projectId, client_id: clientId, freelancer_id: freelancerId, versions: [{ version: 1, terms, created_by: clientId, client_accepted_at: null, freelancer_accepted_at: null }] };
  }
  const agreements = read(AGREEMENTS_KEY);
  if (agreements.some((item) => item.application_id === applicationId)) throw new Error('An agreement already exists for this application.');
  const agreement = { id: `mock-agreement-${Date.now()}`, application_id: applicationId, project_id: projectId, client_id: clientId, freelancer_id: freelancerId, versions: [{ version: 1, terms, created_by: clientId, client_accepted_at: null, freelancer_accepted_at: null }] };
  agreements.push(agreement); write(AGREEMENTS_KEY, agreements); return agreement;
}

export async function proposeAgreementRevision(agreementId, terms) {
  if (isSupabaseConfigured()) {
    const { data, error } = await supabase.rpc('propose_agreement_revision', { p_agreement_id: agreementId, p_terms: terms });
    if (error) throw error;
    return data;
  }
  const agreements = read(AGREEMENTS_KEY); const agreement = agreements.find((item) => item.id === agreementId);
  if (!agreement) throw new Error('Agreement not found');
  agreement.versions.push({ version: agreement.versions.length + 1, terms, client_accepted_at: null, freelancer_accepted_at: null });
  write(AGREEMENTS_KEY, agreements); return agreement.versions.at(-1);
}

export async function acceptAgreementVersion(versionId, agreementId, userId) {
  if (isSupabaseConfigured()) {
    const { data, error } = await supabase.rpc('accept_agreement_version', { p_version_id: versionId });
    if (error) throw error;
    return data;
  }
  const agreements = read(AGREEMENTS_KEY); const agreement = agreements.find((item) => item.id === agreementId);
  const version = agreement?.versions.find((item) => item.id === versionId || item.version === versionId);
  if (!version || !agreement || ![agreement.client_id, agreement.freelancer_id].includes(userId)) throw new Error('Agreement version not found or access denied.');
  if (userId === agreement.client_id) version.client_accepted_at ||= new Date().toISOString();
  if (userId === agreement.freelancer_id) version.freelancer_accepted_at ||= new Date().toISOString();
  write(AGREEMENTS_KEY, agreements);
  return { client_accepted: Boolean(version.client_accepted_at), freelancer_accepted: Boolean(version.freelancer_accepted_at), active: Boolean(version.client_accepted_at && version.freelancer_accepted_at), version: version.version };
}

export async function createMilestone(projectId, userId, milestone) {
  const payload = { project_id: projectId, created_by: userId, title: milestone.title.trim(), description: milestone.description.trim(), due_date: milestone.due_date || null, status: 'pending' };
  if (isSupabaseConfigured()) {
    const { data, error } = await supabase.from('project_milestones').insert(payload).select().single();
    if (error) throw error; return data;
  }
  const item = { ...payload, id: `mock-milestone-${Date.now()}`, type: 'milestone', created_at: new Date().toISOString() };
  write(WORKSPACE_KEY, [...read(WORKSPACE_KEY), item]); return item;
}

export async function updateMilestone(milestoneId, updates) {
  if (isSupabaseConfigured()) {
    const { data, error } = await supabase.from('project_milestones').update(updates).eq('id', milestoneId).select().single();
    if (error) throw error; return data;
  }
  const items = read(WORKSPACE_KEY); const index = items.findIndex((item) => item.id === milestoneId);
  if (index < 0) throw new Error('Milestone not found');
  items[index] = { ...items[index], ...updates }; write(WORKSPACE_KEY, items); return items[index];
}

export async function addProjectUpdate(projectId, userId, body) {
  const payload = { project_id: projectId, author_id: userId, body: body.trim(), kind: 'update' };
  if (isSupabaseConfigured()) {
    const { data, error } = await supabase.from('project_updates').insert(payload).select('*, profiles:author_id(full_name)').single();
    if (error) throw error; return data;
  }
  const item = { ...payload, id: `mock-update-${Date.now()}`, type: 'update', created_at: new Date().toISOString() };
  write(WORKSPACE_KEY, [...read(WORKSPACE_KEY), item]); return item;
}

export async function completeProject(projectId, userId) {
  if (isSupabaseConfigured()) {
    const { data, error } = await supabase.rpc('complete_project_if_ready', { p_project_id: projectId });
    if (error) throw error;
    return data;
  }
  const project = await getProjectById(projectId);
  if (!project || project.creator_id !== userId) throw new Error('Only the project creator can complete this project.');
  const milestones = read(WORKSPACE_KEY).filter((item) => item.project_id === projectId && item.type === 'milestone');
  if (milestones.some((item) => item.status !== 'approved')) throw new Error('Approve all project milestones before completing the project.');
  return changeProjectStatus(projectId, 'completed');
}

export async function getProjectReviews(projectId) {
  if (isSupabaseConfigured()) {
    const { data, error } = await supabase.from('project_reviews').select('*, reviewer:profiles!reviewer_id(full_name), reviewee:profiles!reviewee_id(full_name)').eq('project_id', projectId).order('created_at', { ascending: false });
    if (error) throw error; return data || [];
  }
  return read('skillbridge_mock_reviews').filter((review) => review.project_id === projectId);
}

export async function getReviewsForProfile(profileId) {
  if (isSupabaseConfigured()) {
    const { data, error } = await supabase.from('project_reviews')
      .select('*, reviewer:profiles!reviewer_id(full_name), project:projects!project_id(id, title, status)')
      .eq('reviewee_id', profileId).order('created_at', { ascending: false });
    if (error) throw error; return data || [];
  }
  return read('skillbridge_mock_reviews').filter((review) => review.reviewee_id === profileId);
}

export async function submitProjectReview(projectId, reviewerId, revieweeId, ratings, feedback) {
  if (reviewerId === revieweeId) throw new Error('You cannot review your own profile.');
  const payload = { project_id: projectId, reviewer_id: reviewerId, reviewee_id: revieweeId, ...ratings, feedback: feedback.trim() };
  if (isSupabaseConfigured()) {
    const { data, error } = await supabase.from('project_reviews').insert(payload).select().single();
    if (error) throw error; return data;
  }
  const reviews = read('skillbridge_mock_reviews');
  if (reviews.some((review) => review.project_id === projectId && review.reviewer_id === reviewerId && review.reviewee_id === revieweeId)) throw new Error('You have already reviewed this collaborator.');
  const item = { ...payload, id: `mock-review-${Date.now()}`, created_at: new Date().toISOString() };
  write('skillbridge_mock_reviews', [...reviews, item]); return item;
}

export async function submitContentReport(reporterId, targetType, targetId, reason) {
  if (!reason?.trim() || reason.trim().length < 5) throw new Error('Please explain the concern in at least five characters.');
  const payload = { reporter_id: reporterId, target_type: targetType, target_id: targetId, reason: reason.trim() };
  if (isSupabaseConfigured()) {
    const { data, error } = await supabase.from('content_reports').insert(payload).select().single();
    if (error) throw error; return data;
  }
  const reports = read('skillbridge_mock_reports'); const report = { ...payload, id: `mock-report-${Date.now()}`, status: 'pending', created_at: new Date().toISOString() };
  write('skillbridge_mock_reports', [...reports, report]); return report;
}

export async function getSkillEndorsementsForProfile(profileId) {
  if (isSupabaseConfigured()) {
    const { data, error } = await supabase.from('project_skill_endorsements')
      .select('*, skill:skills!skill_id(name), project:projects!project_id(title), endorser:profiles!endorser_id(full_name)')
      .eq('student_id', profileId).order('created_at', { ascending: false });
    if (error) throw error; return data || [];
  }
  return read('skillbridge_mock_skill_endorsements').filter((item) => item.student_id === profileId);
}

export async function endorseProjectSkill(projectId, skillId, endorserId, studentId) {
  if (endorserId === studentId) throw new Error('You cannot endorse your own skill.');
  const payload = { project_id: projectId, skill_id: skillId, endorser_id: endorserId, student_id: studentId };
  if (isSupabaseConfigured()) {
    const { data, error } = await supabase.from('project_skill_endorsements').insert(payload).select().single();
    if (error) throw error; return data;
  }
  const items = read('skillbridge_mock_skill_endorsements');
  if (items.some((item) => item.project_id === projectId && item.skill_id === skillId && item.endorser_id === endorserId && item.student_id === studentId)) throw new Error('This skill has already been endorsed for this project.');
  const item = { ...payload, id: `mock-endorsement-${Date.now()}`, created_at: new Date().toISOString() };
  write('skillbridge_mock_skill_endorsements', [...items, item]); return item;
}

export async function createProjectChangeRequest(projectId, requesterId, respondentId, kind, title, details, suggestedTerms = {}) {
  if (requesterId === respondentId) throw new Error('Choose another project participant.');
  const payload = { project_id: projectId, requester_id: requesterId, respondent_id: respondentId, kind, title: title.trim(), details: details.trim(), suggested_terms: suggestedTerms };
  if (isSupabaseConfigured()) {
    const { data, error } = await supabase.from('project_change_requests').insert(payload).select().single();
    if (error) throw error; return data;
  }
  const requests = read('skillbridge_mock_change_requests');
  const item = { ...payload, id: `mock-change-${Date.now()}`, status: 'open', created_at: new Date().toISOString() };
  write('skillbridge_mock_change_requests', [...requests, item]); return item;
}

export async function respondToProjectChange(requestId, status, response) {
  if (isSupabaseConfigured()) {
    const { data, error } = await supabase.rpc('respond_to_project_change', { p_request_id: requestId, p_status: status, p_response: response || '' });
    if (error) throw error; return data;
  }
  const requests = read('skillbridge_mock_change_requests'); const index = requests.findIndex((item) => item.id === requestId);
  if (index < 0) throw new Error('Project request not found.');
  requests[index] = { ...requests[index], status, response, handled_by: status };
  write('skillbridge_mock_change_requests', requests); return requests[index];
}
