import { supabase } from '../lib/supabase';
import { isSupabaseConfigured } from './authService';

export async function getMyOrganizations(userId) {
  if (!isSupabaseConfigured()) return [];
  const { data, error } = await supabase.from('organizations').select('*, organization_members!inner(user_id, role, permissions)').eq('organization_members.user_id', userId).order('name');
  if (error) throw error; return data || [];
}

export async function getIncomingHandovers(userId) {
  if (!isSupabaseConfigured()) return [];
  const { data, error } = await supabase.from('organization_handovers').select('*').eq('incoming_user_id', userId).eq('status', 'pending').order('created_at', { ascending: false });
  if (error) throw error; return data || [];
}

export async function createOrganization(userId, payload) {
  const { data, error } = await supabase.from('organizations').insert({ ...payload, created_by: userId, is_official: false }).select().single();
  if (error) throw error;
  const { error: memberError } = await supabase.from('organization_members').insert({ organization_id: data.id, user_id: userId, role: 'president', permissions: ['admin', 'view_records', 'manage_records', 'view_handover', 'manage_handover', 'manage_members', 'manage_org'] });
  if (memberError) throw memberError;
  return data;
}

export async function getOrganizationWorkspace(organizationId) {
  const [org, members, freelancers, handovers, projects] = await Promise.all([
    supabase.from('organizations').select('*').eq('id', organizationId).single(),
    supabase.from('organization_members').select('*, profiles:user_id(id, full_name, email)').eq('organization_id', organizationId),
    supabase.from('organization_freelancers').select('*, freelancer:profiles!freelancer_id(id, full_name), project:projects!project_id(title)').eq('organization_id', organizationId).order('collaboration_date', { ascending: false }),
    supabase.from('organization_handovers').select('*').eq('organization_id', organizationId).order('created_at', { ascending: false }),
    supabase.from('projects').select('id, title, status, budget_type, budget_min, budget_max, deadline').eq('organization_id', organizationId).order('created_at', { ascending: false }),
  ]);
  const failed = [org, members, freelancers, handovers, projects].find((result) => result.error);
  if (failed) throw failed.error;
  return { organization: org.data, members: members.data || [], freelancers: freelancers.data || [], handovers: handovers.data || [], projects: projects.data || [] };
}

export async function addOrganizationMember(organizationId, userId, role, permissions) {
  const { data, error } = await supabase.from('organization_members').insert({ organization_id: organizationId, user_id: userId, role, permissions }).select().single();
  if (error) throw error; return data;
}

export async function addFreelancerRecord(organizationId, userId, payload) {
  const { data, error } = await supabase.from('organization_freelancers').insert({ ...payload, organization_id: organizationId, created_by: userId }).select().single();
  if (error) throw error; return data;
}

export async function createHandover(organizationId, preparedBy, incomingUserId, payload) {
  const { data, error } = await supabase.from('organization_handovers').insert({ organization_id: organizationId, prepared_by: preparedBy, incoming_user_id: incomingUserId, payload, status: 'pending' }).select().single();
  if (error) throw error; return data;
}

export async function respondToHandover(handoverId, status) {
  const { data, error } = await supabase.from('organization_handovers').update({ status }).eq('id', handoverId).select().single();
  if (error) throw error; return data;
}
