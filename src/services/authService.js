import { supabase } from '../lib/supabase';

// Local storage keys for mock/fallback mode
const MOCK_USERS_KEY = 'skillbridge_mock_users';
const MOCK_SESSION_KEY = 'skillbridge_mock_session';

// Fallback seed universities & departments for offline/local development
export const FALLBACK_UNIVERSITIES = [
  {
    id: 'a0000000-0000-0000-0000-000000000001',
    name: 'Apex Institute of Technology & Sciences',
    short_name: 'Apex Tech',
    email_domain: null, // Any email allowed by default for easy testing
    is_active: true,
  },
  {
    id: 'a0000000-0000-0000-0000-000000000002',
    name: 'Metropolitan State University',
    short_name: 'Metro State',
    email_domain: 'metro.edu',
    is_active: true,
  },
];

export const FALLBACK_DEPARTMENTS = [
  { id: 'b0000000-0000-0000-0000-000000000001', university_id: 'a0000000-0000-0000-0000-000000000001', name: 'Computer Science & Engineering' },
  { id: 'b0000000-0000-0000-0000-000000000002', university_id: 'a0000000-0000-0000-0000-000000000001', name: 'Electronics & Communication Engineering' },
  { id: 'b0000000-0000-0000-0000-000000000003', university_id: 'a0000000-0000-0000-0000-000000000001', name: 'Mechanical Engineering' },
  { id: 'b0000000-0000-0000-0000-000000000004', university_id: 'a0000000-0000-0000-0000-000000000001', name: 'Design & Digital Media Arts' },
  { id: 'b0000000-0000-0000-0000-000000000005', university_id: 'a0000000-0000-0000-0000-000000000001', name: 'Business Administration & Management' },
  { id: 'b0000000-0000-0000-0000-000000000006', university_id: 'a0000000-0000-0000-0000-000000000001', name: 'Media & Communications' },
];

export const FALLBACK_SKILLS = [
  { id: 's1', name: 'React', category: 'Technical' },
  { id: 's2', name: 'Node.js', category: 'Technical' },
  { id: 's3', name: 'Python', category: 'Technical' },
  { id: 's4', name: 'UI/UX Design', category: 'Technical' },
  { id: 's5', name: 'Graphic Design', category: 'Creative' },
  { id: 's6', name: 'Video Editing', category: 'Creative' },
  { id: 's7', name: 'Public Speaking', category: 'Management & Other' },
  { id: 's8', name: 'Project Management', category: 'Management & Other' },
];

/**
 * Check if active Supabase client is available and configured
 */
export function isSupabaseConfigured() {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  return Boolean(
    supabase &&
    url &&
    key &&
    url !== 'your-supabase-url-here' &&
    key !== 'your-supabase-anon-key-here'
  );
}

// ─────────────────────────────────────────────────────────────
// AUTHENTICATION METHODS
// ─────────────────────────────────────────────────────────────

/**
 * Register a new user with profile metadata
 */
export async function registerUser({
  email,
  password,
  fullName,
  universityId,
  departmentId,
  course,
  academicYear,
  avatarUrl = '',
}) {
  if (isSupabaseConfigured()) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          university_id: universityId,
          department_id: departmentId,
          course,
          academic_year: academicYear,
          avatar_url: avatarUrl,
          is_seeker_enabled: true,
          is_freelancer_enabled: true,
        },
      },
    });

    if (error) throw error;
    return {
      user: data.user,
      session: data.session,
      requiresEmailVerification: !data.session && Boolean(data.user),
    };
  }

  // --- Mock Mode Fallback ---
  const users = JSON.parse(localStorage.getItem(MOCK_USERS_KEY) || '[]');
  if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
    throw new Error('A user with this email address already exists.');
  }

  const mockId = 'mock-' + Math.random().toString(36).substring(2, 11);
  const newUser = {
    id: mockId,
    email,
    password, // Stored only in local browser mock sandbox for testing
    user_metadata: {
      full_name: fullName,
      university_id: universityId,
      department_id: departmentId,
      course,
      academic_year: academicYear,
      avatar_url: avatarUrl,
      is_seeker_enabled: true,
      is_freelancer_enabled: true,
      platform_role: 'user',
    },
    created_at: new Date().toISOString(),
  };

  const newProfile = {
    id: mockId,
    email,
    full_name: fullName,
    university_id: universityId,
    department_id: departmentId,
    course,
    academic_year: academicYear,
    avatar_url: avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fullName)}`,
    headline: `${course || 'Student'} • ${academicYear || 'Undergraduate'}`,
    bio: '',
    availability_status: 'available',
    is_seeker_enabled: true,
    is_freelancer_enabled: true,
    platform_role: 'user',
    account_status: 'active',
    last_active_at: new Date().toISOString(),
  };

  users.push({ ...newUser, profile: newProfile });
  localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(users));

  const mockSession = { user: newUser, profile: newProfile, expires_at: Date.now() + 86400000 };
  localStorage.setItem(MOCK_SESSION_KEY, JSON.stringify(mockSession));

  return {
    user: newUser,
    profile: newProfile,
    session: mockSession,
    requiresEmailVerification: false,
  };
}

/**
 * Sign in user with email and password
 */
export async function loginUser({ email, password }) {
  if (isSupabaseConfigured()) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    // Fetch profile
    const profile = await fetchUserProfile(data.user.id);
    return {
      user: data.user,
      profile,
      session: data.session,
    };
  }

  // --- Mock Mode Fallback ---
  const users = JSON.parse(localStorage.getItem(MOCK_USERS_KEY) || '[]');
  const found = users.find(
    (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
  );

  if (!found) {
    throw new Error('Invalid email or password. Please try again.');
  }

  const mockSession = { user: found, profile: found.profile, expires_at: Date.now() + 86400000 };
  localStorage.setItem(MOCK_SESSION_KEY, JSON.stringify(mockSession));

  return {
    user: found,
    profile: found.profile,
    session: mockSession,
  };
}

/**
 * Sign out current user
 */
export async function logoutUser() {
  if (isSupabaseConfigured()) {
    const { error } = await supabase.auth.signOut();
    if (error) console.error('Supabase signOut error:', error);
  }
  localStorage.removeItem(MOCK_SESSION_KEY);
  return true;
}

/**
 * Request password reset
 */
export async function requestPasswordReset(email) {
  if (isSupabaseConfigured()) {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
    return data;
  }

  // Mock response
  return { success: true };
}

/**
 * Get current session and profile
 */
export async function getCurrentSession() {
  if (isSupabaseConfigured()) {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error || !session) return null;

    const profile = await fetchUserProfile(session.user.id);
    return {
      session,
      user: session.user,
      profile,
    };
  }

  // Mock Mode
  const raw = localStorage.getItem(MOCK_SESSION_KEY);
  if (!raw) return null;
  try {
    const session = JSON.parse(raw);
    return session;
  } catch {
    return null;
  }
}

/**
 * Fetch profile row from public.profiles
 */
export async function fetchUserProfile(userId) {
  if (isSupabaseConfigured()) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*, universities(*), departments(*)')
      .eq('id', userId)
      .single();

    if (error) {
      console.warn('Failed to load profile:', error.message);
      return null;
    }
    return data;
  }

  const session = JSON.parse(localStorage.getItem(MOCK_SESSION_KEY) || 'null');
  if (session && session.user?.id === userId) {
    return session.profile;
  }
  return null;
}

// ─────────────────────────────────────────────────────────────
// METADATA FETCHERS (Universities, Departments, Skills)
// ─────────────────────────────────────────────────────────────

export async function getUniversities() {
  if (isSupabaseConfigured()) {
    const { data, error } = await supabase
      .from('universities')
      .select('*')
      .eq('is_active', true)
      .order('name');
    if (!error && data?.length) return data;
  }
  return FALLBACK_UNIVERSITIES;
}

export async function getDepartments(universityId) {
  if (isSupabaseConfigured() && universityId) {
    const { data, error } = await supabase
      .from('departments')
      .select('*')
      .eq('university_id', universityId)
      .order('name');
    if (!error && data?.length) return data;
  }
  return FALLBACK_DEPARTMENTS;
}

export async function getSkills(category = null) {
  if (isSupabaseConfigured()) {
    let query = supabase.from('skills').select('*').eq('is_approved', true);
    if (category) query = query.eq('category', category);
    const { data, error } = await query.order('name');
    if (!error && data?.length) return data;
  }
  return category
    ? FALLBACK_SKILLS.filter((s) => s.category === category)
    : FALLBACK_SKILLS;
}
