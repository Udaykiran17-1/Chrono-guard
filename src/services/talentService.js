import { supabase } from '../lib/supabase';
import { isSupabaseConfigured } from './authService';

const MOCK_SAVED_FREELANCERS_KEY = 'skillbridge_mock_saved_freelancers';
const MOCK_USERS_KEY = 'skillbridge_mock_users';
const MOCK_USER_SKILLS_KEY = 'skillbridge_mock_user_skills';

// Seed demo talent profiles for sandbox testing
export const DEMO_TALENT_PROFILES = [
  {
    id: 'demo-talent-1',
    full_name: 'Aarav Patel',
    email: 'aarav.patel@campus.edu',
    headline: 'Full-Stack Developer & React Specialist',
    bio: 'Passionate software engineer building web applications for campus clubs. Experience with React, Node.js, PostgreSQL, and scalable microservices.',
    department_id: 'b0000000-0000-0000-0000-000000000001',
    departments: { name: 'Computer Science & Engineering' },
    universities: { name: 'Apex Institute of Technology & Sciences', short_name: 'Apex Tech' },
    academic_year: '3rd Year',
    course: 'B.Tech Computer Science',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80',
    availability_status: 'available',
    availability_note: 'Open for 15 hours/week during semesters',
    is_freelancer_enabled: true,
    is_seeker_enabled: true,
    areas_of_interest: ['Web Development', 'Cloud Computing', 'APIs'],
    created_at: '2026-09-01T10:00:00Z',
    last_active_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    user_skills: [
      { id: 'us-1', proficiency: 'advanced', is_primary: true, skills: { id: 's1', name: 'React', category: 'Technical' } },
      { id: 'us-2', proficiency: 'advanced', is_primary: true, skills: { id: 's2', name: 'Node.js', category: 'Technical' } },
      { id: 'us-3', proficiency: 'intermediate', is_primary: false, skills: { id: 's3', name: 'Python', category: 'Technical' } },
      { id: 'us-4', proficiency: 'intermediate', is_primary: false, skills: { id: 's4', name: 'SQL & Database Design', category: 'Technical' } },
    ],
  },
  {
    id: 'demo-talent-2',
    full_name: 'Diya Sengupta',
    email: 'diya.design@campus.edu',
    headline: 'UI/UX Designer & Brand Strategist',
    bio: 'Designer passionate about user research, wireframing, and creating inclusive digital design systems in Figma and Illustrator.',
    department_id: 'b0000000-0000-0000-0000-000000000004',
    departments: { name: 'Design & Digital Media Arts' },
    universities: { name: 'Apex Institute of Technology & Sciences', short_name: 'Apex Tech' },
    academic_year: '4th Year',
    course: 'B.Des Interaction Design',
    avatar_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=256&h=256&q=80',
    availability_status: 'limited',
    availability_note: 'Available for small sprint reviews & UI audits',
    is_freelancer_enabled: true,
    is_seeker_enabled: true,
    areas_of_interest: ['UI/UX Design', 'Design Systems', 'User Research'],
    created_at: '2026-08-15T10:00:00Z',
    last_active_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    user_skills: [
      { id: 'us-5', proficiency: 'advanced', is_primary: true, skills: { id: 's5', name: 'UI/UX Design', category: 'Technical' } },
      { id: 'us-6', proficiency: 'advanced', is_primary: true, skills: { id: 's6', name: 'Graphic Design', category: 'Creative' } },
      { id: 'us-7', proficiency: 'intermediate', is_primary: false, skills: { id: 's7', name: 'Brand Identity Design', category: 'Creative' } },
    ],
  },
  {
    id: 'demo-talent-3',
    full_name: 'Rohan Verma',
    email: 'rohan.media@campus.edu',
    headline: 'Motion Graphics Artist & Video Editor',
    bio: 'Storyteller with 3 years of hands-on video editing experience for cultural festivals, club documentaries, and promo teasers.',
    department_id: 'b0000000-0000-0000-0000-000000000006',
    departments: { name: 'Media & Communications' },
    universities: { name: 'Apex Institute of Technology & Sciences', short_name: 'Apex Tech' },
    academic_year: '2nd Year',
    course: 'B.A. Media Communications',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&h=256&q=80',
    availability_status: 'available',
    availability_note: 'Weekends & weekday evenings',
    is_freelancer_enabled: true,
    is_seeker_enabled: false,
    areas_of_interest: ['Video Editing', 'Motion Graphics', 'Audio'],
    created_at: '2026-09-10T10:00:00Z',
    last_active_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    user_skills: [
      { id: 'us-8', proficiency: 'advanced', is_primary: true, skills: { id: 's8', name: 'Video Editing & Post-Production', category: 'Creative' } },
      { id: 'us-9', proficiency: 'advanced', is_primary: true, skills: { id: 's9', name: 'Motion Graphics', category: 'Creative' } },
      { id: 'us-10', proficiency: 'intermediate', is_primary: false, skills: { id: 's10', name: 'Photography', category: 'Creative' } },
    ],
  },
  {
    id: 'demo-talent-4',
    full_name: 'Sneha Kulkarni',
    email: 'sneha.ai@campus.edu',
    headline: 'Machine Learning Researcher & Python Dev',
    bio: 'Conducting computer vision and NLP research in the campus robotics lab. Skilled in PyTorch, scikit-learn, and FastAPI deployment.',
    department_id: 'b0000000-0000-0000-0000-000000000001',
    departments: { name: 'Computer Science & Engineering' },
    universities: { name: 'Apex Institute of Technology & Sciences', short_name: 'Apex Tech' },
    academic_year: '4th Year',
    course: 'B.Tech CSE (AI Specialization)',
    avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&h=256&q=80',
    availability_status: 'busy',
    availability_note: 'Focused on final year capstone until exams end',
    is_freelancer_enabled: true,
    is_seeker_enabled: true,
    areas_of_interest: ['Machine Learning', 'Computer Vision', 'Python'],
    created_at: '2026-07-20T10:00:00Z',
    last_active_at: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
    user_skills: [
      { id: 'us-11', proficiency: 'advanced', is_primary: true, skills: { id: 's3', name: 'Python', category: 'Technical' } },
      { id: 'us-12', proficiency: 'advanced', is_primary: true, skills: { id: 's12', name: 'Machine Learning & AI', category: 'Technical' } },
      { id: 'us-13', proficiency: 'intermediate', is_primary: false, skills: { id: 's4', name: 'SQL & Database Design', category: 'Technical' } },
    ],
  },
  {
    id: 'demo-talent-5',
    full_name: 'Vikramaditya Roy',
    email: 'vikram.roy@campus.edu',
    headline: 'Event Lead & Technical Writer',
    bio: 'President of the Debating Society. Specializes in technical documentation, investor decks, and campus sponsorship outreach.',
    department_id: 'b0000000-0000-0000-0000-000000000005',
    departments: { name: 'Business Administration & Management' },
    universities: { name: 'Apex Institute of Technology & Sciences', short_name: 'Apex Tech' },
    academic_year: '3rd Year',
    course: 'BBA & Operations',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&h=256&q=80',
    availability_status: 'available',
    availability_note: 'Readily available for club proposals & pitch deck reviews',
    is_freelancer_enabled: true,
    is_seeker_enabled: true,
    areas_of_interest: ['Event Management', 'Public Speaking', 'Marketing'],
    created_at: '2026-09-05T10:00:00Z',
    last_active_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    user_skills: [
      { id: 'us-14', proficiency: 'advanced', is_primary: true, skills: { id: 's14', name: 'Public Speaking & Pitching', category: 'Management & Other' } },
      { id: 'us-15', proficiency: 'advanced', is_primary: true, skills: { id: 's15', name: 'Event Management', category: 'Management & Other' } },
      { id: 'us-16', proficiency: 'intermediate', is_primary: false, skills: { id: 's16', name: 'Presentation Design', category: 'Management & Other' } },
    ],
  },
];

/**
 * Search and filter student talent directory
 */
export async function searchTalent({
  query = '',
  skillCategory = '',
  skillIds = [],
  departmentId = '',
  academicYear = '',
  availability = '',
  proficiency = '',
  sortBy = 'recently_active',
} = {}) {
  if (isSupabaseConfigured()) {
    let q = supabase
      .from('profiles')
      .select('*, universities(*), departments(*), user_skills(*, skills(*))')
      .eq('account_status', 'active')
      .eq('is_freelancer_enabled', true);

    if (departmentId) q = q.eq('department_id', departmentId);
    if (academicYear) q = q.eq('academic_year', academicYear);
    if (availability) q = q.eq('availability_status', availability);

    if (sortBy === 'recently_joined') {
      q = q.order('created_at', { ascending: false });
    } else {
      q = q.order('last_active_at', { ascending: false, nullsFirst: false });
    }

    const { data, error } = await q;
    if (error) throw error;

    let results = data || [];

    // Client-side filtering for complex search query & skill taxonomy
    if (query.trim()) {
      const searchTerms = query.toLowerCase().split(/\s+/).filter(Boolean);
      results = results.filter((student) => {
        const textToMatch = [
          student.full_name,
          student.headline,
          student.bio,
          student.course,
          student.departments?.name,
          ...(student.areas_of_interest || []),
          ...(student.user_skills || []).map((us) => us.skills?.name),
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();

        return searchTerms.every((term) => textToMatch.includes(term));
      });
    }

    if (skillCategory) {
      results = results.filter((student) =>
        (student.user_skills || []).some((us) => us.skills?.category === skillCategory)
      );
    }

    if (skillIds.length > 0) {
      results = results.filter((student) =>
        (student.user_skills || []).some((us) => skillIds.includes(us.skill_id))
      );
    }

    if (proficiency) {
      results = results.filter((student) =>
        (student.user_skills || []).some((us) => us.proficiency === proficiency)
      );
    }

    if (sortBy === 'availability') {
      const rank = { available: 1, limited: 2, busy: 3, unavailable: 4 };
      results.sort((a, b) => (rank[a.availability_status] || 5) - (rank[b.availability_status] || 5));
    }

    return results;
  }

  // --- MOCK FALLBACK MODE ---
  const customUsers = JSON.parse(localStorage.getItem(MOCK_USERS_KEY) || '[]');
  const allUserSkills = JSON.parse(localStorage.getItem(MOCK_USER_SKILLS_KEY) || '{}');

  // Convert custom registered users with skills
  const customTalent = customUsers
    .filter((u) => u.profile?.is_freelancer_enabled)
    .map((u) => ({
      ...u.profile,
      user_skills: allUserSkills[u.id] || [],
    }));

  let allTalent = [...DEMO_TALENT_PROFILES, ...customTalent];

  // 1. Text Query Filter
  if (query.trim()) {
    const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
    allTalent = allTalent.filter((student) => {
      const textToMatch = [
        student.full_name,
        student.headline,
        student.bio,
        student.course,
        student.departments?.name,
        ...(student.areas_of_interest || []),
        ...(student.user_skills || []).map((us) => us.skills?.name),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return terms.every((t) => textToMatch.includes(t));
    });
  }

  // 2. Department
  if (departmentId) {
    allTalent = allTalent.filter((s) => s.department_id === departmentId);
  }

  // 3. Academic Year
  if (academicYear) {
    allTalent = allTalent.filter((s) => s.academic_year === academicYear);
  }

  // 4. Availability
  if (availability) {
    allTalent = allTalent.filter((s) => s.availability_status === availability);
  }

  // 5. Skill Category
  if (skillCategory) {
    allTalent = allTalent.filter((s) =>
      (s.user_skills || []).some((us) => us.skills?.category === skillCategory)
    );
  }

  // 6. Specific Skills
  if (skillIds.length > 0) {
    allTalent = allTalent.filter((s) =>
      (s.user_skills || []).some((us) => skillIds.includes(us.skill_id))
    );
  }

  // 7. Proficiency
  if (proficiency) {
    allTalent = allTalent.filter((s) =>
      (s.user_skills || []).some((us) => us.proficiency === proficiency)
    );
  }

  // 8. Sorting
  if (sortBy === 'recently_joined') {
    allTalent.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  } else if (sortBy === 'availability') {
    const rank = { available: 1, limited: 2, busy: 3, unavailable: 4 };
    allTalent.sort((a, b) => (rank[a.availability_status] || 5) - (rank[b.availability_status] || 5));
  } else if (sortBy === 'relevant_skills' && skillIds.length > 0) {
    allTalent.sort((a, b) => {
      const matchA = (a.user_skills || []).filter((us) => skillIds.includes(us.skill_id)).length;
      const matchB = (b.user_skills || []).filter((us) => skillIds.includes(us.skill_id)).length;
      return matchB - matchA;
    });
  } else {
    // Default recently active
    allTalent.sort((a, b) => new Date(b.last_active_at || 0) - new Date(a.last_active_at || 0));
  }

  return allTalent;
}

/**
 * Toggle bookmark/save for a student freelancer
 */
export async function toggleSaveFreelancer(userId, freelancerId) {
  if (!userId || !freelancerId) throw new Error('Missing user or freelancer ID');

  if (isSupabaseConfigured()) {
    const { data: existing } = await supabase
      .from('saved_freelancers')
      .select('user_id')
      .eq('user_id', userId)
      .eq('freelancer_id', freelancerId)
      .maybeSingle();

    if (existing) {
      await supabase
        .from('saved_freelancers')
        .delete()
        .eq('user_id', userId)
        .eq('freelancer_id', freelancerId);
      return false; // removed
    } else {
      await supabase
        .from('saved_freelancers')
        .insert({ user_id: userId, freelancer_id: freelancerId });
      return true; // added
    }
  }

  // Mock Mode
  const allSaved = JSON.parse(localStorage.getItem(MOCK_SAVED_FREELANCERS_KEY) || '{}');
  const userList = allSaved[userId] || [];
  const exists = userList.includes(freelancerId);

  if (exists) {
    allSaved[userId] = userList.filter((id) => id !== freelancerId);
  } else {
    allSaved[userId] = [...userList, freelancerId];
  }

  localStorage.setItem(MOCK_SAVED_FREELANCERS_KEY, JSON.stringify(allSaved));
  return !exists;
}

/**
 * Get array of saved freelancer IDs for a user
 */
export async function getSavedFreelancerIds(userId) {
  if (!userId) return [];

  if (isSupabaseConfigured()) {
    const { data, error } = await supabase
      .from('saved_freelancers')
      .select('freelancer_id')
      .eq('user_id', userId);

    if (error) return [];
    return data.map((d) => d.freelancer_id);
  }

  const allSaved = JSON.parse(localStorage.getItem(MOCK_SAVED_FREELANCERS_KEY) || '{}');
  return allSaved[userId] || [];
}

/**
 * Rule-based recommendation for project creators seeking suitable freelancers (Spec Section 16)
 * Scored on skill overlap, proficiency, and live availability
 */
export async function getRecommendedFreelancers(requiredSkillIds = []) {
  const allTalent = await searchTalent({ availability: '' });

  if (!requiredSkillIds || requiredSkillIds.length === 0) {
    return allTalent.slice(0, 3);
  }

  const scored = allTalent.map((freelancer) => {
    let score = 0;
    const matchedSkills = [];

    (freelancer.user_skills || []).forEach((us) => {
      if (requiredSkillIds.includes(us.skill_id)) {
        score += 3;
        if (us.is_primary) score += 2;
        if (us.proficiency === 'advanced') score += 2;
        else if (us.proficiency === 'intermediate') score += 1;
        matchedSkills.push(us.skills?.name || 'Skill');
      }
    });

    if (freelancer.availability_status === 'available') score += 5;
    else if (freelancer.availability_status === 'limited') score += 2;
    else if (freelancer.availability_status === 'busy') score -= 2;
    else if (freelancer.availability_status === 'unavailable') score -= 10;

    return {
      ...freelancer,
      matchScore: score,
      matchedSkills,
      matchReason:
        matchedSkills.length > 0
          ? `Matches ${matchedSkills.length} required skill${matchedSkills.length > 1 ? 's' : ''} • ${freelancer.availability_status}`
          : 'Campus peer in active network',
    };
  });

  scored.sort((a, b) => b.matchScore - a.matchScore);
  return scored.filter((s) => s.matchScore > 0).slice(0, 5);
}
