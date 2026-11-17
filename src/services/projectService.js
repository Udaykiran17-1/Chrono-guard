import { supabase } from '../lib/supabase';
import { isSupabaseConfigured } from './authService';
import { getProfileById, getAvailableSkills } from './profileService';

const MOCK_PROJECTS_KEY = 'skillbridge_mock_projects';
const MOCK_SAVED_PROJECTS_KEY = 'skillbridge_mock_saved_projects';

// Seed demo projects matching realistic campus club & academic scenarios
export const DEMO_PROJECTS = [
  {
    id: 'demo-proj-1',
    creator_id: 'demo-talent-5',
    title: 'ACM Student Chapter Annual Website Revamp',
    what_needs_doing: 'Redesign the official chapter website to showcase annual events, hackathon registrations, blog posts, and executive board members.',
    why_required: 'Our current website uses an outdated static template that is difficult to maintain and lacks mobile responsiveness.',
    expected_deliverables: '1. Fully responsive modern web portal (React + Tailwind)\n2. Interactive event calendar & registration form\n3. GitHub repository with comprehensive README and deployment guide',
    additional_requirements: 'Must follow campus brand guidelines and ensure WCAG AA accessible contrast.',
    category: 'Web Development',
    budget_type: 'fixed',
    budget_min: 8000,
    budget_max: 8000,
    budget_note: '₹8,000 paid across 2 milestones upon code review',
    deadline: '2026-12-15',
    estimated_duration: '3 weeks',
    positions_total: 2,
    positions_filled: 0,
    status: 'open',
    created_at: '2026-10-01T10:00:00Z',
    creator: {
      id: 'demo-talent-5',
      full_name: 'Vikramaditya Roy',
      headline: 'President, ACM Student Chapter',
      avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&h=256&q=80',
      departments: { name: 'Computer Science & Engineering' },
      universities: { short_name: 'Apex Tech' },
    },
    skills: [
      { id: 's1', name: 'React', category: 'Technical' },
      { id: 's2', name: 'Node.js', category: 'Technical' },
      { id: 's11', name: 'Web Development', category: 'Technical' },
    ],
  },
  {
    id: 'demo-proj-2',
    creator_id: 'demo-talent-2',
    title: 'Brand Identity & Social Media Kit for TEDxYouth Campus',
    what_needs_doing: 'Design social media launch banners, speaker spotlight templates, lanyards, and digital posters for the upcoming annual TEDx event.',
    why_required: 'TEDx requires an official licensee brand kit adhering strictly to TED global brand standards for local events.',
    expected_deliverables: '1. Figma master design kit with 10+ Instagram post/story templates\n2. High-resolution print-ready lanyard and ID badge files\n3. Stage background backdrop vector graphics',
    additional_requirements: 'Prior experience working with Figma design components is strongly preferred.',
    category: 'Creative & Design',
    budget_type: 'negotiable',
    budget_min: 5000,
    budget_max: 7500,
    budget_note: 'Negotiable budget based on portfolio and previous event experience',
    deadline: '2026-11-30',
    estimated_duration: '10 days',
    positions_total: 1,
    positions_filled: 0,
    status: 'open',
    created_at: '2026-10-05T12:00:00Z',
    creator: {
      id: 'demo-talent-2',
      full_name: 'Diya Sengupta',
      headline: 'Design Lead, TEDx Campus Committee',
      avatar_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=256&h=256&q=80',
      departments: { name: 'Design & Digital Media Arts' },
      universities: { short_name: 'Apex Tech' },
    },
    skills: [
      { id: 's5', name: 'UI/UX Design', category: 'Technical' },
      { id: 's6', name: 'Graphic Design', category: 'Creative' },
      { id: 's7', name: 'Brand Identity Design', category: 'Creative' },
    ],
  },
  {
    id: 'demo-proj-3',
    creator_id: 'demo-talent-4',
    title: 'Robotics Team Telemetry Dashboard & Sensor Data Viz',
    what_needs_doing: 'Develop a real-time web dashboard that plots IMU, motor RPM, and battery thermals streamed over WebSockets from our autonomous rover.',
    why_required: 'Our university robotics team is competing in the National University Rover Challenge and needs reliable real-time ground control telematics.',
    expected_deliverables: '1. React dashboard rendering live chart series\n2. WebSocket receiver client with reconnect logic\n3. Export session telemetry to CSV format',
    additional_requirements: 'Experience with Chart.js, Recharts, or Canvas-based visual rendering.',
    category: 'Software Engineering',
    budget_type: 'fixed',
    budget_min: 12000,
    budget_max: 12000,
    budget_note: 'Funded by the Department Innovation Grant',
    deadline: '2026-12-28',
    estimated_duration: '4 weeks',
    positions_total: 1,
    positions_filled: 0,
    status: 'open',
    created_at: '2026-10-10T14:30:00Z',
    creator: {
      id: 'demo-talent-4',
      full_name: 'Sneha Kulkarni',
      headline: 'Technical Lead, Apex Robotics Lab',
      avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&h=256&q=80',
      departments: { name: 'Computer Science & Engineering' },
      universities: { short_name: 'Apex Tech' },
    },
    skills: [
      { id: 's1', name: 'React', category: 'Technical' },
      { id: 's3', name: 'Python', category: 'Technical' },
      { id: 's12', name: 'Machine Learning & AI', category: 'Technical' },
    ],
  },
  {
    id: 'demo-proj-4',
    creator_id: 'demo-talent-1',
    title: 'Short Documentary Video Editor for Campus Cultural Fest',
    what_needs_doing: 'Assemble 40+ hours of raw 4K festival footage into an engaging 5-minute aftermovie and two 30-second vertical reels.',
    why_required: 'Preserve the memories of the annual inter-college cultural fest and generate marketing buzz for next year.',
    expected_deliverables: '1. 5-minute Master Aftermovie with color grading and dynamic audio sync\n2. 2 vertical 9:16 reels for Instagram\n3. Clean Premiere/DaVinci project archive',
    additional_requirements: 'Must have access to dedicated editing workstation capable of handling 4K h.264/ProRes streams.',
    category: 'Media & Video',
    budget_type: 'fixed',
    budget_min: 6500,
    budget_max: 6500,
    budget_note: '₹6,500 all-inclusive with 2 revision passes',
    deadline: '2026-11-25',
    estimated_duration: '1 week',
    positions_total: 1,
    positions_filled: 0,
    status: 'open',
    created_at: '2026-10-12T09:00:00Z',
    creator: {
      id: 'demo-talent-1',
      full_name: 'Aarav Patel',
      headline: 'Cultural Council Media Head',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80',
      departments: { name: 'Computer Science & Engineering' },
      universities: { short_name: 'Apex Tech' },
    },
    skills: [
      { id: 's8', name: 'Video Editing & Post-Production', category: 'Creative' },
      { id: 's9', name: 'Motion Graphics', category: 'Creative' },
    ],
  },
];

// Helper to normalize Supabase project records with nested skills
function formatSupabaseProject(p) {
  if (!p) return null;
  return {
    ...p,
    creator: p.profiles || p.creator,
    skills: (p.project_skills || []).map((ps) => ps.skills).filter(Boolean),
  };
}

/**
 * Fetch filterable project discovery feed
 */
export async function getProjects({
  query = '',
  skillIds = [],
  budgetType = '',
  category = '',
  deadlineBefore = '',
  sortBy = 'latest',
} = {}) {
  if (isSupabaseConfigured()) {
    let q = supabase
      .from('projects')
      .select('*, profiles(*, universities(*), departments(*)), project_skills(*, skills(*))')
      .neq('status', 'draft');

    if (category) q = q.eq('category', category);
    if (budgetType) q = q.eq('budget_type', budgetType);
    if (deadlineBefore) q = q.lte('deadline', deadlineBefore);

    if (sortBy === 'deadline') {
      q = q.order('deadline', { ascending: true });
    } else if (sortBy === 'budget_high') {
      q = q.order('budget_max', { ascending: false, nullsFirst: false });
    } else {
      q = q.order('created_at', { ascending: false });
    }

    const { data, error } = await q;
    if (error) throw error;

    let results = (data || []).map(formatSupabaseProject);

    // Text query search
    if (query.trim()) {
      const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
      results = results.filter((proj) => {
        const text = [
          proj.title,
          proj.what_needs_doing,
          proj.category,
          proj.creator?.full_name,
          ...(proj.skills || []).map((s) => s.name),
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        return terms.every((t) => text.includes(t));
      });
    }

    // Skills filter
    if (skillIds.length > 0) {
      results = results.filter((proj) =>
        (proj.skills || []).some((s) => skillIds.includes(s.id))
      );
    }

    return results;
  }

  // --- MOCK FALLBACK MODE ---
  const customProjects = JSON.parse(localStorage.getItem(MOCK_PROJECTS_KEY) || '[]');
  let allProjects = [...customProjects, ...DEMO_PROJECTS];

  // Only non-draft unless current user
  allProjects = allProjects.filter((p) => p.status !== 'draft');

  // Text search
  if (query.trim()) {
    const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
    allProjects = allProjects.filter((proj) => {
      const text = [
        proj.title,
        proj.what_needs_doing,
        proj.category,
        proj.creator?.full_name,
        ...(proj.skills || []).map((s) => s.name),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return terms.every((t) => text.includes(t));
    });
  }

  // Category
  if (category) {
    allProjects = allProjects.filter((p) => p.category === category);
  }

  // Budget Type
  if (budgetType) {
    allProjects = allProjects.filter((p) => p.budget_type === budgetType);
  }

  // Skills
  if (skillIds.length > 0) {
    allProjects = allProjects.filter((proj) =>
      (proj.skills || []).some((s) => skillIds.includes(s.id))
    );
  }

  // Deadline before
  if (deadlineBefore) {
    allProjects = allProjects.filter((p) => p.deadline <= deadlineBefore);
  }

  // Sorting
  if (sortBy === 'deadline') {
    allProjects.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
  } else if (sortBy === 'budget_high') {
    allProjects.sort((a, b) => (b.budget_max || b.budget_min || 0) - (a.budget_max || a.budget_min || 0));
  } else {
    allProjects.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  return allProjects;
}

/**
 * Fetch a single project by ID with full details
 */
export async function getProjectById(projectId) {
  if (!projectId) throw new Error('Project ID required');

  if (isSupabaseConfigured()) {
    const { data, error } = await supabase
      .from('projects')
      .select('*, profiles(*, universities(*), departments(*)), project_skills(*, skills(*))')
      .eq('id', projectId)
      .single();

    if (error) throw error;
    return formatSupabaseProject(data);
  }

  // Mock Mode
  const customProjects = JSON.parse(localStorage.getItem(MOCK_PROJECTS_KEY) || '[]');
  const allProjects = [...customProjects, ...DEMO_PROJECTS];
  const found = allProjects.find((p) => p.id === projectId);
  if (!found) throw new Error('Project not found');
  return found;
}

/**
 * Create a new structured project
 */
export async function createProject(creatorId, data) {
  if (!creatorId) throw new Error('Creator ID required');

  const {
    title,
    what_needs_doing,
    why_required,
    expected_deliverables,
    additional_requirements,
    category,
    budget_type,
    budget_min,
    budget_max,
    budget_note,
    deadline,
    estimated_duration,
    positions_total = 1,
    status = 'open',
    skill_ids = [],
  } = data;

  if (isSupabaseConfigured()) {
    const { data: project, error: insertErr } = await supabase
      .from('projects')
      .insert({
        creator_id: creatorId,
        title,
        what_needs_doing,
        why_required,
        expected_deliverables,
        additional_requirements,
        category,
        budget_type,
        budget_min: budget_min ? Number(budget_min) : null,
        budget_max: budget_max ? Number(budget_max) : null,
        budget_note,
        deadline,
        estimated_duration,
        positions_total: Number(positions_total) || 1,
        positions_filled: 0,
        status,
      })
      .select()
      .single();

    if (insertErr) throw insertErr;

    if (skill_ids.length > 0) {
      const skillRows = skill_ids.map((sid) => ({
        project_id: project.id,
        skill_id: sid,
      }));
      await supabase.from('project_skills').insert(skillRows);
    }

    return getProjectById(project.id);
  }

  // Mock Mode
  const customProjects = JSON.parse(localStorage.getItem(MOCK_PROJECTS_KEY) || '[]');
  const allSkills = await getAvailableSkills();
  const linkedSkillObjects = allSkills.filter((s) => skill_ids.includes(s.id));

  const creatorProfileRes = await getProfileById(creatorId);
  const creator = creatorProfileRes.profile || {
    id: creatorId,
    full_name: 'Project Creator',
    headline: 'Student Project Lead',
    departments: { name: 'Campus Department' },
    universities: { short_name: 'Apex Tech' },
  };

  const newProj = {
    id: 'proj-' + Math.random().toString(36).substring(2, 9),
    creator_id: creatorId,
    title,
    what_needs_doing,
    why_required,
    expected_deliverables,
    additional_requirements,
    category,
    budget_type,
    budget_min: budget_min ? Number(budget_min) : null,
    budget_max: budget_max ? Number(budget_max) : null,
    budget_note,
    deadline,
    estimated_duration,
    positions_total: Number(positions_total) || 1,
    positions_filled: 0,
    status,
    created_at: new Date().toISOString(),
    creator,
    skills: linkedSkillObjects,
  };

  customProjects.unshift(newProj);
  localStorage.setItem(MOCK_PROJECTS_KEY, JSON.stringify(customProjects));
  return newProj;
}

/**
 * Update an existing project
 */
export async function updateProject(projectId, updates) {
  if (!projectId) throw new Error('Project ID required');

  if (isSupabaseConfigured()) {
    const { skill_ids, ...projectFields } = updates;

    const { data: updated, error } = await supabase
      .from('projects')
      .update({
        ...projectFields,
        updated_at: new Date().toISOString(),
      })
      .eq('id', projectId)
      .select()
      .single();

    if (error) throw error;

    if (Array.isArray(skill_ids)) {
      await supabase.from('project_skills').delete().eq('project_id', projectId);
      if (skill_ids.length > 0) {
        const skillRows = skill_ids.map((sid) => ({
          project_id: projectId,
          skill_id: sid,
        }));
        await supabase.from('project_skills').insert(skillRows);
      }
    }

    return getProjectById(projectId);
  }

  // Mock Mode
  const customProjects = JSON.parse(localStorage.getItem(MOCK_PROJECTS_KEY) || '[]');
  const allSkills = await getAvailableSkills();

  const idx = customProjects.findIndex((p) => p.id === projectId);
  if (idx !== -1) {
    const { skill_ids, ...fields } = updates;
    customProjects[idx] = {
      ...customProjects[idx],
      ...fields,
      updated_at: new Date().toISOString(),
    };

    if (Array.isArray(skill_ids)) {
      customProjects[idx].skills = allSkills.filter((s) => skill_ids.includes(s.id));
    }

    localStorage.setItem(MOCK_PROJECTS_KEY, JSON.stringify(customProjects));
    return customProjects[idx];
  }

  // Also check demo projects for local testing
  const demoIdx = DEMO_PROJECTS.findIndex((p) => p.id === projectId);
  if (demoIdx !== -1) {
    Object.assign(DEMO_PROJECTS[demoIdx], updates);
    return DEMO_PROJECTS[demoIdx];
  }

  throw new Error('Project not found');
}

/**
 * Change status of a project with reason validation
 */
export async function changeProjectStatus(projectId, newStatus, cancellationReason = '') {
  if (newStatus === 'cancelled' && !cancellationReason.trim()) {
    throw new Error('A cancellation reason is required when cancelling a project');
  }

  return updateProject(projectId, {
    status: newStatus,
    cancellation_reason: newStatus === 'cancelled' ? cancellationReason.trim() : null,
  });
}

/**
 * Fetch projects authored by a specific user
 */
export async function getMyCreatedProjects(userId) {
  if (!userId) return [];

  if (isSupabaseConfigured()) {
    const { data, error } = await supabase
      .from('projects')
      .select('*, profiles(*), project_skills(*, skills(*))')
      .eq('creator_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(formatSupabaseProject);
  }

  const customProjects = JSON.parse(localStorage.getItem(MOCK_PROJECTS_KEY) || '[]');
  const allProjects = [...customProjects, ...DEMO_PROJECTS];
  return allProjects.filter((p) => p.creator_id === userId);
}

/**
 * Toggle bookmark / save for a project
 */
export async function toggleSaveProject(userId, projectId) {
  if (!userId || !projectId) throw new Error('Missing user or project ID');

  if (isSupabaseConfigured()) {
    const { data: existing } = await supabase
      .from('saved_projects')
      .select('user_id')
      .eq('user_id', userId)
      .eq('project_id', projectId)
      .maybeSingle();

    if (existing) {
      await supabase
        .from('saved_projects')
        .delete()
        .eq('user_id', userId)
        .eq('project_id', projectId);
      return false; // unsaved
    } else {
      await supabase
        .from('saved_projects')
        .insert({ user_id: userId, project_id: projectId });
      return true; // saved
    }
  }

  // Mock Mode
  const allSaved = JSON.parse(localStorage.getItem(MOCK_SAVED_PROJECTS_KEY) || '{}');
  const userList = allSaved[userId] || [];
  const exists = userList.includes(projectId);

  if (exists) {
    allSaved[userId] = userList.filter((id) => id !== projectId);
  } else {
    allSaved[userId] = [...userList, projectId];
  }

  localStorage.setItem(MOCK_SAVED_PROJECTS_KEY, JSON.stringify(allSaved));
  return !exists;
}

/**
 * Get array of saved project IDs for a user
 */
export async function getSavedProjectIds(userId) {
  if (!userId) return [];

  if (isSupabaseConfigured()) {
    const { data, error } = await supabase
      .from('saved_projects')
      .select('project_id')
      .eq('user_id', userId);

    if (error) return [];
    return data.map((d) => d.project_id);
  }

  const allSaved = JSON.parse(localStorage.getItem(MOCK_SAVED_PROJECTS_KEY) || '{}');
  return allSaved[userId] || [];
}

/**
 * Rule-based recommendation for student freelancers seeking relevant projects (Spec Section 16)
 * Matches user's claimed skills against required project skills
 */
export async function getRecommendedProjects(userId) {
  if (!userId) return [];

  const [userProfileRes, allProjects] = await Promise.all([
    getProfileById(userId),
    getProjects({}),
  ]);

  const userSkillIds = (userProfileRes.user_skills || []).map((us) => us.skill_id);

  if (userSkillIds.length === 0) {
    // Return latest 3 open projects if user has no skills listed
    return allProjects.filter((p) => p.status === 'open' && p.creator_id !== userId).slice(0, 3);
  }

  const scored = allProjects
    .filter((p) => p.status === 'open' && p.creator_id !== userId)
    .map((project) => {
      let score = 0;
      const matchedSkillNames = [];

      (project.skills || []).forEach((ps) => {
        if (userSkillIds.includes(ps.id)) {
          score += 4;
          const userSkillObj = userProfileRes.user_skills.find((us) => us.skill_id === ps.id);
          if (userSkillObj?.is_primary) score += 2;
          if (userSkillObj?.proficiency === 'advanced') score += 2;
          matchedSkillNames.push(ps.name);
        }
      });

      return {
        ...project,
        matchScore: score,
        matchedSkills: matchedSkillNames,
        matchReason:
          matchedSkillNames.length > 0
            ? `Matches ${matchedSkillNames.length} of your skills (${matchedSkillNames.slice(0, 2).join(', ')})`
            : null,
      };
    });

  scored.sort((a, b) => b.matchScore - a.matchScore);
  return scored.filter((p) => p.matchScore > 0).slice(0, 4);
}
