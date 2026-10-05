// =====================================================================
// Auth Context - Supabase Authentication, Session Lifecycle & Role-Based Permissions
// =====================================================================

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase as initialSupabase, isSupabaseConfigured as initialIsConfigured, getActiveSupabaseUrl, getActiveSupabaseAnonKey } from '../supabaseClient';
import { DEFAULT_USERS } from '../data/initialData';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [client, setClient] = useState(() => initialSupabase);
  const [isConfigured, setIsConfigured] = useState(() => initialIsConfigured);

  const [session, setSession] = useState(null);
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('noc_current_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved user', e);
      }
    }
    return null;
  });

  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Sync user profile from Supabase user_profiles table or create default if missing
  const syncUserProfile = useCallback(async (authUser, activeClient = client) => {
    if (!authUser || !activeClient) return null;
    try {
      const { data, error } = await activeClient
        .from('user_profiles')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle();

      if (data) {
        setCurrentUser(data);
        localStorage.setItem('noc_current_user', JSON.stringify(data));
        return data;
      }

      // Profile doesn't exist yet in user_profiles -> create it
      const meta = authUser.user_metadata || {};
      const fallbackName = meta.full_name || authUser.email?.split('@')[0]?.toUpperCase() || 'User';
      const fallbackRole = meta.role || (authUser.email?.includes('admin') ? 'administrator' : 'noc_staff');

      const newProfile = {
        id: authUser.id,
        email: authUser.email,
        full_name: fallbackName,
        role: fallbackRole,
        is_active: true
      };

      const { data: inserted, error: insertError } = await activeClient
        .from('user_profiles')
        .upsert(newProfile, { onConflict: 'id' })
        .select()
        .maybeSingle();

      const resolved = inserted || newProfile;
      setCurrentUser(resolved);
      localStorage.setItem('noc_current_user', JSON.stringify(resolved));
      return resolved;
    } catch (err) {
      console.warn('Profile sync fallback:', err.message);
      const fallback = {
        id: authUser.id,
        email: authUser.email,
        full_name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'User',
        role: authUser.user_metadata?.role || 'noc_staff',
        is_active: true
      };
      setCurrentUser(fallback);
      localStorage.setItem('noc_current_user', JSON.stringify(fallback));
      return fallback;
    }
  }, [client]);

  // Listen to runtime Supabase client configuration changes
  useEffect(() => {
    const handleConfigChange = (e) => {
      const { client: newClient, isConfigured: newIsConfigured } = e.detail || {};
      setClient(newClient);
      setIsConfigured(Boolean(newIsConfigured && newClient));
    };

    window.addEventListener('noc_supabase_config_changed', handleConfigChange);
    return () => window.removeEventListener('noc_supabase_config_changed', handleConfigChange);
  }, []);

  // Initialize and track auth session
  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      setLoading(true);
      if (isConfigured && client) {
        try {
          const { data: { session: currentSession }, error } = await client.auth.getSession();
          if (error) throw error;

          if (isMounted) {
            setSession(currentSession);
            if (currentSession?.user) {
              await syncUserProfile(currentSession.user, client);
            } else {
              // No active cloud session
              setCurrentUser(null);
              localStorage.removeItem('noc_current_user');
            }
          }
        } catch (err) {
          console.error('Session retrieval error:', err);
          if (isMounted) {
            setSession(null);
            setCurrentUser(null);
            localStorage.removeItem('noc_current_user');
          }
        }
      } else {
        // Local mode without cloud configured
        const saved = localStorage.getItem('noc_current_user');
        if (saved) {
          try {
            setCurrentUser(JSON.parse(saved));
          } catch {
            setCurrentUser(DEFAULT_USERS[0]);
          }
        } else {
          // Default to Lead Administrator in local offline mode
          setCurrentUser(DEFAULT_USERS[0]);
          localStorage.setItem('noc_current_user', JSON.stringify(DEFAULT_USERS[0]));
        }
      }

      if (isMounted) {
        setLoading(false);
      }
    };

    initAuth();

    // Subscribe to auth state changes if configured
    let authListener = null;
    if (isConfigured && client) {
      const { data } = client.auth.onAuthStateChange(async (event, newSession) => {
        if (!isMounted) return;
        setSession(newSession);

        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
          if (newSession?.user) {
            await syncUserProfile(newSession.user, client);
          }
        } else if (event === 'SIGNED_OUT') {
          setSession(null);
          setCurrentUser(null);
          localStorage.removeItem('noc_current_user');
        }
      });
      authListener = data.subscription;
    }

    return () => {
      isMounted = false;
      if (authListener) {
        authListener.unsubscribe();
      }
    };
  }, [client, isConfigured, syncUserProfile]);

  // Login action
  const login = async (email, password) => {
    setAuthError(null);
    if (!email || !email.trim()) {
      throw new Error('Please enter your email address.');
    }
    if (!password) {
      throw new Error('Please enter your password.');
    }

    if (isConfigured && client) {
      const { data, error } = await client.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password
      });

      if (error) {
        setAuthError(error.message);
        throw error;
      }

      setSession(data.session);
      if (data.session?.user) {
        await syncUserProfile(data.session.user, client);
      }
      return data;
    } else {
      // Local demo mode matching
      const user = DEFAULT_USERS.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
      if (user) {
        setCurrentUser(user);
        localStorage.setItem('noc_current_user', JSON.stringify(user));
        return { user };
      } else {
        const customUser = {
          id: 'usr-' + Date.now(),
          email: email.trim().toLowerCase(),
          full_name: email.split('@')[0].toUpperCase(),
          role: 'noc_staff',
          is_active: true
        };
        setCurrentUser(customUser);
        localStorage.setItem('noc_current_user', JSON.stringify(customUser));
        return { user: customUser };
      }
    }
  };

  // Demo user switcher for offline testing
  const switchDemoUser = (user) => {
    setCurrentUser(user);
    localStorage.setItem('noc_current_user', JSON.stringify(user));
  };

  // Logout action
  const logout = async () => {
    try {
      if (isConfigured && client) {
        await client.auth.signOut();
      }
    } catch (e) {
      console.warn('Sign out warning:', e);
    } finally {
      setSession(null);
      setCurrentUser(null);
      localStorage.removeItem('noc_current_user');
      // Clear sensitive session caches
      sessionStorage.clear();
    }
  };

  // Permission helpers
  const role = currentUser?.role || 'noc_staff';
  const isAdmin = role === 'administrator';
  const isApprover = role === 'approver' || role === 'administrator';
  const isAuditor = role === 'auditor';
  const isNocStaff = role === 'noc_staff' || role === 'administrator';

  const permissions = {
    canCreateRequest: !isAuditor,
    canEditRequest: !isAuditor,
    canDeleteRequest: !isAuditor,
    canAddQuotation: !isAuditor,
    canSelectQuotation: !isAuditor,
    canApprove: isApprover,
    canGenerateLetter: !isAuditor,
    canUpdateWork: !isAuditor,
    canManageBills: !isAuditor,
    canManageMasterData: isAdmin || isNocStaff,
    canImportData: isAdmin || isNocStaff,
    canManageUsers: isAdmin,
    canManageTeam: isAdmin || isNocStaff,
    canViewAuditLogs: true,
    isReadOnly: isAuditor
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        session,
        role,
        permissions,
        login,
        logout,
        switchDemoUser,
        loading,
        authError,
        isConfigured,
        isAuthenticated: Boolean(currentUser && (isConfigured ? session : true))
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

