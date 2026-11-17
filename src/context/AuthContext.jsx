import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import {
  getCurrentSession,
  loginUser,
  registerUser,
  logoutUser,
  requestPasswordReset,
  fetchUserProfile,
  isSupabaseConfigured,
} from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const isConfigured = isSupabaseConfigured();

  const refreshProfile = useCallback(async (userId) => {
    const targetId = userId || user?.id;
    if (!targetId) return null;
    try {
      const p = await fetchUserProfile(targetId);
      if (p) setProfile(p);
      return p;
    } catch (err) {
      console.error('Error refreshing profile:', err);
      return null;
    }
  }, [user]);

  // Initial session hydration
  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      try {
        const data = await getCurrentSession();
        if (mounted && data) {
          setUser(data.user);
          setProfile(data.profile);
          setSession(data.session);
        }
      } catch (err) {
        console.error('Failed to restore auth session:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    initAuth();

    // Setup Supabase live auth state listener if configured
    let subscription = null;
    if (isConfigured && supabase) {
      const { data: subData } = supabase.auth.onAuthStateChange(async (event, newSession) => {
        if (!mounted) return;
        if (newSession?.user) {
          setUser(newSession.user);
          setSession(newSession.session);
          const p = await fetchUserProfile(newSession.user.id);
          if (mounted) setProfile(p);
        } else {
          setUser(null);
          setProfile(null);
          setSession(null);
        }
        setLoading(false);
      });
      subscription = subData.subscription;
    }

    return () => {
      mounted = false;
      if (subscription) subscription.unsubscribe();
    };
  }, [isConfigured]);

  const login = async ({ email, password }) => {
    setLoading(true);
    try {
      const result = await loginUser({ email, password });
      setUser(result.user);
      setProfile(result.profile);
      setSession(result.session);
      return result;
    } finally {
      setLoading(false);
    }
  };

  const register = async (formData) => {
    setLoading(true);
    try {
      const result = await registerUser(formData);
      if (result.session && result.user) {
        setUser(result.user);
        setProfile(result.profile || null);
        setSession(result.session);
      }
      return result;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await logoutUser();
      setUser(null);
      setProfile(null);
      setSession(null);
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email) => {
    return requestPasswordReset(email);
  };

  const value = {
    user,
    profile,
    session,
    loading,
    isAuthenticated: Boolean(user),
    isConfigured,
    login,
    register,
    logout,
    resetPassword,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
