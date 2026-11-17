import { supabase } from '../lib/supabase';
import { isSupabaseConfigured } from './authService';
import { getProjectById, updateProject } from './projectService';
import { getProfileById } from './profileService';
import { DEMO_TALENT_PROFILES } from './talentService';
import { createNotification } from './notificationService';

const MOCK_APPLICATIONS_KEY = 'skillbridge_mock_applications';
const MOCK_PROJECT_MEMBERS_KEY = 'skillbridge_mock_project_members';

// Default mock applications for demo projects
const DEFAULT_MOCK_APPLICATIONS = [
  {
    id: 'demo-app-1',
    project_id: 'demo-proj-1',
    applicant_id: 'demo-talent-1',
    introduction: 'Hi Vikramaditya! I have previously built responsive portals for IEEE and the Robotics Club. I would love to revamp the ACM website using React 19 and Tailwind CSS.',
    relevant_experience: '3 years of React development, built 5+ campus web applications with full responsive design and accessible WCAG AA compliance.',
    portfolio_links: [
      { title: 'Campus Event Portal', url: 'https://github.com/example/campus-portal' },
      { title: 'Personal Portfolio', url: 'https://aaravpatel.dev' },
    ],
    estimated_days: 14,
    proposed_price: 7500,
    comments: 'I can start immediately this weekend and deliver the first milestone within 5 days.',
    status: 'under_review',
    created_at: '2026-10-05T14:30:00Z',
    updated_at: '2026-10-06T10:00:00Z',
    applicant: DEMO_TALENT_PROFILES[0],
  },
  {
    id: 'demo-app-2',
    project_id: 'demo-proj-1',
    applicant_id: 'demo-talent-3',
    introduction: 'Hello! I am a 3rd year CSE student with strong backend and database skills. I can handle the interactive event calendar, database schema, and GitHub CI/CD automation.',
    relevant_experience: 'Proficient in Node.js, Express, PostgreSQL, and setting up automated GitHub Actions deployment pipelines.',
    portfolio_links: [
      { title: 'Automated Event API', url: 'https://github.com/example/event-api' },
    ],
    estimated_days: 18,
    proposed_price: 8000,
    comments: 'Happy to collaborate with a frontend designer to ensure a seamless revamp.',
    status: 'submitted',
    created_at: '2026-10-08T09:15:00Z',
    updated_at: '2026-10-08T09:15:00Z',
    applicant: DEMO_TALENT_PROFILES[2],
  },
  {
    id: 'demo-app-3',
    project_id: 'demo-proj-2',
    applicant_id: 'demo-talent-4',
    introduction: 'Hi Diya! I love TEDx and have created social media templates and copywriting for our department fest.',
    relevant_experience: 'Experienced with Canva, Figma basics, and digital typography for print collateral and social media stories.',
    portfolio_links: [
      { title: 'College Fest Visual Kit', url: 'https://behance.net/fest-kit' },
    ],
    estimated_days: 8,
    proposed_price: 6000,
    comments: 'Ready to work closely with the TEDx committee guidelines.',
    status: 'shortlisted',
    created_at: '2026-10-10T16:45:00Z',
    updated_at: '2026-10-11T12:00:00Z',
    applicant: DEMO_TALENT_PROFILES[3],
  },
];

/**
 * Helper to get local mock applications
 */
function getMockApplications() {
  const data = localStorage.getItem(MOCK_APPLICATIONS_KEY);
  if (!data) {
    localStorage.setItem(MOCK_APPLICATIONS_KEY, JSON.stringify(DEFAULT_MOCK_APPLICATIONS));
    return DEFAULT_MOCK_APPLICATIONS;
  }
  return JSON.parse(data);
}

function saveMockApplications(apps) {
  localStorage.setItem(MOCK_APPLICATIONS_KEY, JSON.stringify(apps));
}

function getMockProjectMembers() {
  return JSON.parse(localStorage.getItem(MOCK_PROJECT_MEMBERS_KEY) || '[]');
}

function saveMockProjectMembers(members) {
  localStorage.setItem(MOCK_PROJECT_MEMBERS_KEY, JSON.stringify(members));
}

/**
 * Submit an application for a project
 */
export async function submitApplication(projectId, applicantId, payload) {
  if (!projectId || !applicantId) {
    throw new Error('Project ID and Applicant ID are required');
  }

  const {
    introduction,
    relevantExperience,
    portfolioLinks = [],
    estimatedDays,
    proposedPrice,
    comments,
  } = payload;

  if (!introduction || !relevantExperience || !estimatedDays) {
    throw new Error('Please fill in all required proposal fields');
  }

  // 1. Live Supabase Execution
  if (isSupabaseConfigured()) {
    // Check if self application
    const { data: project, error: projErr } = await supabase
      .from('projects')
      .select('id, title, creator_id, status')
      .eq('id', projectId)
      .single();

    if (projErr || !project) throw new Error('Project not found');
    if (project.creator_id === applicantId) {
      throw new Error('Project creators cannot apply to their own project');
    }

    const { data, error } = await supabase
      .from('applications')
      .insert({
        project_id: projectId,
        applicant_id: applicantId,
        introduction,
        relevant_experience: relevantExperience,
        portfolio_links: portfolioLinks,
        estimated_days: Number(estimatedDays),
        proposed_price: proposedPrice !== '' && proposedPrice != null ? Number(proposedPrice) : null,
        comments: comments || null,
        status: 'submitted',
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        throw new Error('You have already applied for this project');
      }
      throw error;
    }

    // Notify project creator
    await createNotification({
      userId: project.creator_id,
      type: 'new_application',
      title: 'New Project Application Received 📩',
      message: `A candidate has submitted an application for "${project.title}".`,
      linkUrl: `/projects/${projectId}/applicants`,
    });

    return data;
  }

  // 2. Mock Local Mode
  const project = await getProjectById(projectId);
  if (!project) throw new Error('Project not found');
  if (project.creator_id === applicantId) {
    throw new Error('Project creators cannot apply to their own project');
  }

  const allApps = getMockApplications();
  const existing = allApps.find(
    (a) => a.project_id === projectId && a.applicant_id === applicantId
  );
  if (existing) {
    throw new Error('You have already applied for this project');
  }

  const applicantProfileRes = await getProfileById(applicantId);
  const applicantProfile = applicantProfileRes || {
    id: applicantId,
    full_name: 'Student Candidate',
    headline: 'SkillBridge Member',
  };

  const newApp = {
    id: `app-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    project_id: projectId,
    applicant_id: applicantId,
    introduction,
    relevant_experience: relevantExperience,
    portfolio_links: portfolioLinks,
    estimated_days: Number(estimatedDays),
    proposed_price: proposedPrice !== '' && proposedPrice != null ? Number(proposedPrice) : null,
    comments: comments || null,
    status: 'submitted',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    applicant: applicantProfile,
    project: project,
  };

  allApps.unshift(newApp);
  saveMockApplications(allApps);

  // Send in-app notification to creator
  await createNotification({
    userId: project.creator_id,
    type: 'new_application',
    title: 'New Project Application Received 📩',
    message: `${applicantProfile.full_name || 'A candidate'} has submitted a proposal for "${project.title}".`,
    linkUrl: `/projects/${projectId}/applicants`,
  });

  return newApp;
}

/**
 * Get all applications for a project (used by creator dashboard)
 */
export async function getApplicationsForProject(projectId) {
  if (!projectId) return [];

  if (isSupabaseConfigured()) {
    const { data, error } = await supabase
      .from('applications')
      .select(`
        *,
        applicant:profiles!applicant_id (
          id, full_name, email, headline, avatar_url, academic_year, course,
          universities:university_id(name, short_name),
          departments:department_id(name),
          user_skills:user_skills(id, proficiency, is_primary, skills(id, name, category))
        )
      `)
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching project applications:', error);
      return [];
    }
    return data || [];
  }

  // Mock Mode
  const allApps = getMockApplications();
  return allApps
    .filter((a) => a.project_id === projectId)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

/**
 * Get all applications submitted by the logged-in user
 */
export async function getMyApplications(userId) {
  if (!userId) return [];

  if (isSupabaseConfigured()) {
    const { data, error } = await supabase
      .from('applications')
      .select(`
        *,
        project:projects!project_id (
          id, title, category, budget_type, budget_min, budget_max, deadline, status,
          positions_total, positions_filled,
          creator:profiles!creator_id(id, full_name, headline, avatar_url)
        )
      `)
      .eq('applicant_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching my applications:', error);
      return [];
    }
    return data || [];
  }

  // Mock Mode
  const allApps = getMockApplications();
  return allApps
    .filter((a) => a.applicant_id === userId)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

/**
 * Check if a user has already applied for a project
 */
export async function getUserApplication(projectId, userId) {
  if (!projectId || !userId) return null;

  if (isSupabaseConfigured()) {
    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .eq('project_id', projectId)
      .eq('applicant_id', userId)
      .maybeSingle();

    if (error) return null;
    return data;
  }

  // Mock Mode
  const allApps = getMockApplications();
  return allApps.find((a) => a.project_id === projectId && a.applicant_id === userId) || null;
}

/**
 * Update application status (under_review, shortlisted, rejected)
 */
export async function updateApplicationStatus(applicationId, newStatus, reason = null) {
  if (!applicationId || !newStatus) throw new Error('Missing application ID or status');

  if (isSupabaseConfigured()) {
    const { data, error } = await supabase
      .from('applications')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', applicationId)
      .select('*, project:projects!project_id(title, creator_id)')
      .single();

    if (error) throw error;

    // Send notification to applicant
    let title = 'Application Status Updated';
    let message = `Your application for "${data.project?.title}" is now ${newStatus.replace('_', ' ')}.`;
    if (newStatus === 'shortlisted') {
      title = 'You have been Shortlisted! ⭐';
      message = `Great news! The creator of "${data.project?.title}" has shortlisted your application.`;
    } else if (newStatus === 'rejected') {
      title = 'Application Status Update';
      message = `Thank you for your interest in "${data.project?.title}". The creator has moved forward with other applicants.`;
    }

    await createNotification({
      userId: data.applicant_id,
      type: `application_${newStatus}`,
      title,
      message,
      linkUrl: `/projects/${data.project_id}`,
    });

    return data;
  }

  // Mock Mode
  const allApps = getMockApplications();
  const index = allApps.findIndex((a) => a.id === applicationId);
  if (index === -1) throw new Error('Application not found');

  const app = allApps[index];
  const updatedApp = {
    ...app,
    status: newStatus,
    updated_at: new Date().toISOString(),
  };

  allApps[index] = updatedApp;
  saveMockApplications(allApps);

  const projectTitle = app.project?.title || 'the project';
  let title = 'Application Status Updated';
  let message = `Your application for "${projectTitle}" is now ${newStatus.replace('_', ' ')}.`;
  if (newStatus === 'shortlisted') {
    title = 'You have been Shortlisted! ⭐';
    message = `Great news! The creator of "${projectTitle}" has shortlisted your application.`;
  } else if (newStatus === 'rejected') {
    title = 'Application Status Update';
    message = `Thank you for your interest in "${projectTitle}". The creator has decided to move forward with other candidates.`;
  }

  await createNotification({
    userId: app.applicant_id,
    type: `application_${newStatus}`,
    title,
    message,
    linkUrl: `/projects/${app.project_id}`,
  });

  return updatedApp;
}

/**
 * Accept an application (calls atomic RPC or mock atomic logic)
 */
export async function acceptApplication(applicationId) {
  if (!applicationId) throw new Error('Application ID is required');

  if (isSupabaseConfigured()) {
    const { data, error } = await supabase.rpc('accept_project_application', {
      p_application_id: applicationId,
    });

    if (error) throw error;
    return data;
  }

  // Mock Mode Atomic Slot Locking
  const allApps = getMockApplications();
  const appIndex = allApps.findIndex((a) => a.id === applicationId);
  if (appIndex === -1) throw new Error('Application not found');

  const app = allApps[appIndex];
  const project = await getProjectById(app.project_id);
  if (!project) throw new Error('Project not found');

  if (project.positions_filled >= project.positions_total) {
    throw new Error(
      `All positions for this project have already been filled (${project.positions_filled}/${project.positions_total})`
    );
  }

  if (app.status === 'accepted') {
    throw new Error('This application has already been accepted');
  }

  // 1. Update application status
  const updatedApp = {
    ...app,
    status: 'accepted',
    updated_at: new Date().toISOString(),
  };
  allApps[appIndex] = updatedApp;
  saveMockApplications(allApps);

  // 2. Add to project members
  const members = getMockProjectMembers();
  if (!members.some((m) => m.project_id === project.id && m.user_id === app.applicant_id)) {
    members.push({
      id: `member-${Date.now()}-1`,
      project_id: project.id,
      user_id: app.applicant_id,
      role: 'freelancer',
      joined_at: new Date().toISOString(),
    });
  }
  if (!members.some((m) => m.project_id === project.id && m.user_id === project.creator_id)) {
    members.push({
      id: `member-${Date.now()}-2`,
      project_id: project.id,
      user_id: project.creator_id,
      role: 'client',
      joined_at: new Date().toISOString(),
    });
  }
  saveMockProjectMembers(members);

  // 3. Increment positions_filled on project
  const newFilled = (project.positions_filled || 0) + 1;
  await updateProject(project.id, {
    positions_filled: newFilled,
    status: 'in_progress',
  });

  // 4. Send acceptance notification to applicant
  await createNotification({
    userId: app.applicant_id,
    type: 'application_accepted',
    title: 'Application Accepted! 🎉',
    message: `Congratulations! Your proposal for "${project.title}" has been accepted. You are now a project member!`,
    linkUrl: `/projects/${project.id}`,
  });

  return {
    success: true,
    application_id: applicationId,
    project_id: project.id,
    positions_filled: newFilled,
    positions_total: project.positions_total,
    project_status: 'in_progress',
  };
}

/**
 * Withdraw an application (by applicant)
 */
export async function withdrawApplication(applicationId) {
  if (!applicationId) throw new Error('Application ID is required');

  if (isSupabaseConfigured()) {
    const { data, error } = await supabase
      .from('applications')
      .update({ status: 'withdrawn', updated_at: new Date().toISOString() })
      .eq('id', applicationId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Mock Mode
  const allApps = getMockApplications();
  const index = allApps.findIndex((a) => a.id === applicationId);
  if (index === -1) throw new Error('Application not found');

  const updatedApp = {
    ...allApps[index],
    status: 'withdrawn',
    updated_at: new Date().toISOString(),
  };

  allApps[index] = updatedApp;
  saveMockApplications(allApps);
  return updatedApp;
}
