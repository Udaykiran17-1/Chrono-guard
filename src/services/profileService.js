import { supabase } from '../lib/supabase';
import { isSupabaseConfigured, FALLBACK_SKILLS } from './authService';

const MOCK_USERS_KEY = 'skillbridge_mock_users';
const MOCK_SESSION_KEY = 'skillbridge_mock_session';
const MOCK_USER_SKILLS_KEY = 'skillbridge_mock_user_skills';
const MOCK_PORTFOLIO_KEY = 'skillbridge_mock_portfolio';
const MOCK_UNLISTED_SKILLS_KEY = 'skillbridge_mock_unlisted_skills';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

// Helper to initialize sample mock portfolio items if empty
function getInitialMockPortfolio(userId) {
  return [
    {
      id: 'mock-port-1',
      user_id: userId,
      title: 'Autonomous Campus Delivery Rover',
      description: 'Engineered a path-finding ground robot with computer vision and obstacle avoidance for inter-department document delivery.',
      category: 'Robotics & Hardware',
      thumbnail_url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=600&h=400&q=80',
      project_url: 'https://github.com/example/campus-rover',
      github_url: 'https://github.com/example/campus-rover',
      completed_date: '2026-04-15',
      created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
      skills: [
        { id: 's3', name: 'Python' },
        { id: 's1', name: 'React' },
      ],
    },
    {
      id: 'mock-port-2',
      user_id: userId,
      title: 'Student Club Event Ticketing & QR Check-in',
      description: 'A mobile-responsive web portal facilitating digital ticket generation and low-latency QR verification for annual campus fests.',
      category: 'Web Development',
      thumbnail_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&h=400&q=80',
      project_url: 'https://example.com/fest-ticketing',
      github_url: 'https://github.com/example/fest-ticketing',
      completed_date: '2026-02-20',
      created_at: new Date(Date.now() - 60 * 86400000).toISOString(),
      skills: [
        { id: 's1', name: 'React' },
        { id: 's2', name: 'Node.js' },
      ],
    },
  ];
}

// ─────────────────────────────────────────────────────────────
// 1. GET FULL PROFILE BY ID
// ─────────────────────────────────────────────────────────────

export async function getProfileById(userId) {
  if (!userId) throw new Error('User ID is required');

  if (isSupabaseConfigured()) {
    // 1. Fetch profile with university and department
    const { data: profile, error: profileErr } = await supabase
      .from('profiles')
      .select('*, universities(*), departments(*)')
      .eq('id', userId)
      .single();

    if (profileErr) throw profileErr;

    // 2. Fetch user skills
    const { data: userSkills, error: skillsErr } = await supabase
      .from('user_skills')
      .select('*, skills(*)')
      .eq('user_id', userId)
      .order('is_primary', { ascending: false });

    if (skillsErr) console.warn('Could not load user skills:', skillsErr);

    // 3. Fetch portfolio items with linked skills
    const { data: portfolioItems, error: portErr } = await supabase
      .from('portfolio_items')
      .select('*, portfolio_item_skills(skill_id, skills(*))')
      .eq('user_id', userId)
      .order('completed_date', { ascending: false });

    if (portErr) console.warn('Could not load portfolio items:', portErr);

    // Transform portfolio items so `skills` is a flat array
    const formattedPortfolio = (portfolioItems || []).map((item) => ({
      ...item,
      skills: (item.portfolio_item_skills || []).map((pis) => pis.skills).filter(Boolean),
    }));

    return {
      profile,
      user_skills: userSkills || [],
      portfolio_items: formattedPortfolio,
    };
  }

  // --- MOCK MODE FALLBACK ---
  const users = JSON.parse(localStorage.getItem(MOCK_USERS_KEY) || '[]');
  const userObj = users.find((u) => u.id === userId);

  // If not found in users list, check active mock session
  let profile = userObj?.profile;
  if (!profile) {
    const session = JSON.parse(localStorage.getItem(MOCK_SESSION_KEY) || 'null');
    if (session?.user?.id === userId) {
      profile = session.profile;
    }
  }

  // Fallback demo profile if viewing arbitrary ID
  if (!profile) {
    profile = {
      id: userId,
      full_name: 'Ananya Sharma',
      email: 'ananya@campus.edu',
      headline: 'Full-Stack Developer & UI Designer',
      bio: 'Third-year CS student passionate about building performant web applications, design systems, and developer tooling.',
      course: 'B.Tech Computer Science & Engineering',
      academic_year: '3rd Year',
      availability_status: 'available',
      availability_note: 'Open for 10-15 hrs/week project collaborations',
      available_from: new Date().toISOString().split('T')[0],
      areas_of_interest: ['Web Development', 'UI/UX Design', 'Cloud Architecture'],
      contact_links: {
        linkedin: 'https://linkedin.com',
        github: 'https://github.com',
        website: 'https://example.com',
      },
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80',
      is_seeker_enabled: true,
      is_freelancer_enabled: true,
      platform_role: 'user',
      account_status: 'active',
      onboarding_completed: true,
      universities: { name: 'Apex Institute of Technology & Sciences', short_name: 'Apex Tech' },
      departments: { name: 'Computer Science & Engineering' },
    };
  }

  // Mock user skills
  const allUserSkills = JSON.parse(localStorage.getItem(MOCK_USER_SKILLS_KEY) || '{}');
  const userSkills = allUserSkills[userId] || [
    {
      id: 'mus-1',
      user_id: userId,
      skill_id: 's1',
      proficiency: 'advanced',
      is_primary: true,
      skills: { id: 's1', name: 'React', category: 'Technical' },
    },
    {
      id: 'mus-2',
      user_id: userId,
      skill_id: 's2',
      proficiency: 'intermediate',
      is_primary: true,
      skills: { id: 's2', name: 'Node.js', category: 'Technical' },
    },
    {
      id: 'mus-3',
      user_id: userId,
      skill_id: 's4',
      proficiency: 'intermediate',
      is_primary: false,
      skills: { id: 's4', name: 'UI/UX Design', category: 'Technical' },
    },
  ];

  // Mock portfolio items
  const allPortfolios = JSON.parse(localStorage.getItem(MOCK_PORTFOLIO_KEY) || '{}');
  const portfolioItems = allPortfolios[userId] || getInitialMockPortfolio(userId);

  return {
    profile,
    user_skills: userSkills,
    portfolio_items: portfolioItems,
  };
}

// ─────────────────────────────────────────────────────────────
// 2. UPDATE PROFILE
// ─────────────────────────────────────────────────────────────

export async function updateProfile(userId, updates) {
  if (!userId) throw new Error('User ID is required');

  if (isSupabaseConfigured()) {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select('*, universities(*), departments(*)')
      .single();

    if (error) throw error;
    return data;
  }

  // --- MOCK MODE FALLBACK ---
  const users = JSON.parse(localStorage.getItem(MOCK_USERS_KEY) || '[]');
  const idx = users.findIndex((u) => u.id === userId);
  let updatedProfile = null;

  if (idx !== -1) {
    users[idx].profile = {
      ...users[idx].profile,
      ...updates,
      updated_at: new Date().toISOString(),
    };
    updatedProfile = users[idx].profile;
    localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(users));
  }

  // Update session storage
  const session = JSON.parse(localStorage.getItem(MOCK_SESSION_KEY) || 'null');
  if (session && session.user?.id === userId) {
    session.profile = { ...session.profile, ...updates, updated_at: new Date().toISOString() };
    updatedProfile = session.profile;
    localStorage.setItem(MOCK_SESSION_KEY, JSON.stringify(session));
  }

  return updatedProfile;
}

// ─────────────────────────────────────────────────────────────
// 3. UPDATE AVAILABILITY
// ─────────────────────────────────────────────────────────────

export async function updateAvailability(userId, { availability_status, availability_note, available_from }) {
  return updateProfile(userId, {
    availability_status,
    availability_note,
    available_from,
  });
}

// ─────────────────────────────────────────────────────────────
// 4. SKILLS & UNLISTED SKILL REQUEST
// ─────────────────────────────────────────────────────────────

export async function getAvailableSkills() {
  if (isSupabaseConfigured()) {
    const { data, error } = await supabase
      .from('skills')
      .select('*')
      .order('name');
    if (!error && data?.length) return data;
  }

  // Mock list with user unlisted additions
  const unlisted = JSON.parse(localStorage.getItem(MOCK_UNLISTED_SKILLS_KEY) || '[]');
  return [...FALLBACK_SKILLS, ...unlisted];
}

export async function requestUnlistedSkill(name, category = 'Technical') {
  const cleanName = name.trim();
  if (!cleanName) throw new Error('Skill name cannot be empty');

  if (isSupabaseConfigured()) {
    const { data, error } = await supabase
      .from('skills')
      .insert({
        name: cleanName,
        category,
        is_approved: false, // controlled request
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Mock Mode
  const unlisted = JSON.parse(localStorage.getItem(MOCK_UNLISTED_SKILLS_KEY) || '[]');
  const newSkill = {
    id: 'unlisted-' + Math.random().toString(36).substring(2, 9),
    name: cleanName,
    category,
    is_approved: false,
    created_at: new Date().toISOString(),
  };
  unlisted.push(newSkill);
  localStorage.setItem(MOCK_UNLISTED_SKILLS_KEY, JSON.stringify(unlisted));
  return newSkill;
}

// ─────────────────────────────────────────────────────────────
// 5. USER SKILLS MANAGEMENT
// ─────────────────────────────────────────────────────────────

export async function addUserSkill(userId, { skill_id, proficiency = 'beginner', is_primary = false }) {
  if (!userId || !skill_id) throw new Error('User ID and Skill ID are required');

  if (isSupabaseConfigured()) {
    const { data, error } = await supabase
      .from('user_skills')
      .insert({
        user_id: userId,
        skill_id,
        proficiency,
        is_primary,
      })
      .select('*, skills(*)')
      .single();

    if (error) throw error;
    return data;
  }

  // Mock Mode
  const allUserSkills = JSON.parse(localStorage.getItem(MOCK_USER_SKILLS_KEY) || '{}');
  const userList = allUserSkills[userId] || [];

  const allSkills = await getAvailableSkills();
  const skillObj = allSkills.find((s) => s.id === skill_id) || { id: skill_id, name: 'Skill', category: 'Technical' };

  const newEntry = {
    id: 'us-' + Math.random().toString(36).substring(2, 9),
    user_id: userId,
    skill_id,
    proficiency,
    is_primary,
    skills: skillObj,
    created_at: new Date().toISOString(),
  };

  userList.push(newEntry);
  allUserSkills[userId] = userList;
  localStorage.setItem(MOCK_USER_SKILLS_KEY, JSON.stringify(allUserSkills));
  return newEntry;
}

export async function updateUserSkill(userSkillId, { proficiency, is_primary }) {
  if (!userSkillId) throw new Error('UserSkill ID required');

  if (isSupabaseConfigured()) {
    const updates = {};
    if (proficiency !== undefined) updates.proficiency = proficiency;
    if (is_primary !== undefined) updates.is_primary = is_primary;

    const { data, error } = await supabase
      .from('user_skills')
      .update(updates)
      .eq('id', userSkillId)
      .select('*, skills(*)')
      .single();

    if (error) throw error;
    return data;
  }

  // Mock Mode
  const allUserSkills = JSON.parse(localStorage.getItem(MOCK_USER_SKILLS_KEY) || '{}');
  for (const uid in allUserSkills) {
    const item = allUserSkills[uid].find((s) => s.id === userSkillId);
    if (item) {
      if (proficiency !== undefined) item.proficiency = proficiency;
      if (is_primary !== undefined) item.is_primary = is_primary;
      localStorage.setItem(MOCK_USER_SKILLS_KEY, JSON.stringify(allUserSkills));
      return item;
    }
  }
  return null;
}

export async function removeUserSkill(userSkillId) {
  if (!userSkillId) throw new Error('UserSkill ID required');

  if (isSupabaseConfigured()) {
    const { error } = await supabase.from('user_skills').delete().eq('id', userSkillId);
    if (error) throw error;
    return true;
  }

  // Mock Mode
  const allUserSkills = JSON.parse(localStorage.getItem(MOCK_USER_SKILLS_KEY) || '{}');
  for (const uid in allUserSkills) {
    allUserSkills[uid] = allUserSkills[uid].filter((s) => s.id !== userSkillId);
  }
  localStorage.setItem(MOCK_USER_SKILLS_KEY, JSON.stringify(allUserSkills));
  return true;
}

// ─────────────────────────────────────────────────────────────
// 6. PORTFOLIO ITEMS MANAGEMENT
// ─────────────────────────────────────────────────────────────

export async function createPortfolioItem(userId, data) {
  if (!userId) throw new Error('User ID is required');
  const { title, description, category, thumbnail_url, project_url, github_url, attachment_url, completed_date, skill_ids = [] } = data;

  if (isSupabaseConfigured()) {
    // 1. Insert item
    const { data: item, error: itemErr } = await supabase
      .from('portfolio_items')
      .insert({
        user_id: userId,
        title,
        description,
        category,
        thumbnail_url,
        project_url,
        github_url,
        attachment_url,
        completed_date: completed_date || null,
      })
      .select()
      .single();

    if (itemErr) throw itemErr;

    // 2. Insert linked skills
    if (skill_ids.length > 0) {
      const skillsToInsert = skill_ids.map((sid) => ({
        portfolio_item_id: item.id,
        skill_id: sid,
      }));
      const { error: linkErr } = await supabase.from('portfolio_item_skills').insert(skillsToInsert);
      if (linkErr) console.warn('Could not link skills to portfolio item:', linkErr);
    }

    // 3. Return full formatted item
    return getPortfolioItemById(item.id);
  }

  // Mock Mode
  const allPortfolios = JSON.parse(localStorage.getItem(MOCK_PORTFOLIO_KEY) || '{}');
  const userItems = allPortfolios[userId] || getInitialMockPortfolio(userId);

  const allSkills = await getAvailableSkills();
  const linkedSkillObjects = allSkills.filter((s) => skill_ids.includes(s.id));

  const newItem = {
    id: 'port-' + Math.random().toString(36).substring(2, 9),
    user_id: userId,
    title,
    description,
    category,
    thumbnail_url: thumbnail_url || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&h=400&q=80',
    project_url,
    github_url,
    attachment_url,
    completed_date: completed_date || new Date().toISOString().split('T')[0],
    created_at: new Date().toISOString(),
    skills: linkedSkillObjects,
  };

  userItems.unshift(newItem);
  allPortfolios[userId] = userItems;
  localStorage.setItem(MOCK_PORTFOLIO_KEY, JSON.stringify(allPortfolios));
  return newItem;
}

export async function updatePortfolioItem(itemId, data) {
  if (!itemId) throw new Error('Item ID is required');
  const { title, description, category, thumbnail_url, project_url, github_url, attachment_url, completed_date, skill_ids } = data;

  if (isSupabaseConfigured()) {
    const { data: item, error: updateErr } = await supabase
      .from('portfolio_items')
      .update({
        title,
        description,
        category,
        thumbnail_url,
        project_url,
        github_url,
        attachment_url,
        completed_date: completed_date || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', itemId)
      .select()
      .single();

    if (updateErr) throw updateErr;

    // Update skills if skill_ids was provided
    if (Array.isArray(skill_ids)) {
      await supabase.from('portfolio_item_skills').delete().eq('portfolio_item_id', itemId);
      if (skill_ids.length > 0) {
        const skillsToInsert = skill_ids.map((sid) => ({
          portfolio_item_id: itemId,
          skill_id: sid,
        }));
        await supabase.from('portfolio_item_skills').insert(skillsToInsert);
      }
    }

    return getPortfolioItemById(itemId);
  }

  // Mock Mode
  const allPortfolios = JSON.parse(localStorage.getItem(MOCK_PORTFOLIO_KEY) || '{}');
  const allSkills = await getAvailableSkills();

  for (const uid in allPortfolios) {
    const item = allPortfolios[uid].find((p) => p.id === itemId);
    if (item) {
      Object.assign(item, {
        title: title !== undefined ? title : item.title,
        description: description !== undefined ? description : item.description,
        category: category !== undefined ? category : item.category,
        thumbnail_url: thumbnail_url !== undefined ? thumbnail_url : item.thumbnail_url,
        project_url: project_url !== undefined ? project_url : item.project_url,
        github_url: github_url !== undefined ? github_url : item.github_url,
        attachment_url: attachment_url !== undefined ? attachment_url : item.attachment_url,
        completed_date: completed_date !== undefined ? completed_date : item.completed_date,
        updated_at: new Date().toISOString(),
      });

      if (Array.isArray(skill_ids)) {
        item.skills = allSkills.filter((s) => skill_ids.includes(s.id));
      }

      localStorage.setItem(MOCK_PORTFOLIO_KEY, JSON.stringify(allPortfolios));
      return item;
    }
  }
  return null;
}

export async function deletePortfolioItem(itemId) {
  if (!itemId) throw new Error('Item ID is required');

  if (isSupabaseConfigured()) {
    const { error } = await supabase.from('portfolio_items').delete().eq('id', itemId);
    if (error) throw error;
    return true;
  }

  // Mock Mode
  const allPortfolios = JSON.parse(localStorage.getItem(MOCK_PORTFOLIO_KEY) || '{}');
  for (const uid in allPortfolios) {
    allPortfolios[uid] = allPortfolios[uid].filter((p) => p.id !== itemId);
  }
  localStorage.setItem(MOCK_PORTFOLIO_KEY, JSON.stringify(allPortfolios));
  return true;
}

export async function getPortfolioItemById(itemId) {
  if (isSupabaseConfigured()) {
    const { data, error } = await supabase
      .from('portfolio_items')
      .select('*, portfolio_item_skills(skill_id, skills(*))')
      .eq('id', itemId)
      .single();

    if (error) throw error;
    return {
      ...data,
      skills: (data.portfolio_item_skills || []).map((pis) => pis.skills).filter(Boolean),
    };
  }
  return null;
}

// ─────────────────────────────────────────────────────────────
// 7. MEDIA FILE UPLOADS (Avatars & Portfolio Media)
// ─────────────────────────────────────────────────────────────

export async function uploadMediaFile(bucket, userId, file) {
  if (!file) throw new Error('No file provided');
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    throw new Error('Unsupported file format. Please upload JPG, PNG, WEBP images or PDF documents.');
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('File exceeds the 5MB maximum size limit.');
  }

  if (isSupabaseConfigured()) {
    const fileExt = file.name.split('.').pop();
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filePath = `${userId}/${Date.now()}-${cleanFileName}`;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
    return data.publicUrl;
  }

  // Mock Mode: convert to base64 data URL
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Failed to read file locally'));
    reader.readAsDataURL(file);
  });
}
