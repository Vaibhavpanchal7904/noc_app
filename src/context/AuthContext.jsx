// =====================================================================
// Auth Context - Roles, Permissions & Authentication State
// =====================================================================

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../supabaseClient';
import { DEFAULT_USERS } from '../data/initialData';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('noc_current_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved user', e);
      }
    }
    return DEFAULT_USERS[0]; // Default to Lead Administrator for instant development access
  });

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isSupabaseConfigured && supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
        if (session?.user) {
          // Fetch user profile from user_profiles table
          supabase
            .from('user_profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()
            .then(({ data }) => {
              if (data) {
                setCurrentUser(data);
                localStorage.setItem('noc_current_user', JSON.stringify(data));
              }
            });
        }
        setLoading(false);
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
        if (!session) {
          // logged out
        }
      });

      return () => subscription.unsubscribe();
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return data;
    } else {
      // Local demo mode matching
      const user = DEFAULT_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (user) {
        setCurrentUser(user);
        localStorage.setItem('noc_current_user', JSON.stringify(user));
        return { user };
      } else {
        const customUser = {
          id: 'usr-custom-' + Date.now(),
          email,
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

  const switchDemoUser = (user) => {
    setCurrentUser(user);
    localStorage.setItem('noc_current_user', JSON.stringify(user));
  };

  const logout = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    // Switch to first default or clear
    setCurrentUser(DEFAULT_USERS[0]);
    localStorage.setItem('noc_current_user', JSON.stringify(DEFAULT_USERS[0]));
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
    canAddQuotation: !isAuditor,
    canSelectQuotation: !isAuditor,
    canApprove: isApprover,
    canGenerateLetter: !isAuditor,
    canUpdateWork: !isAuditor,
    canManageBills: !isAuditor,
    canManageMasterData: isAdmin || isNocStaff,
    canImportData: isAdmin || isNocStaff,
    canManageUsers: isAdmin,
    canViewAuditLogs: true,
    isReadOnly: isAuditor
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        role,
        permissions,
        login,
        logout,
        switchDemoUser,
        loading,
        isConfigured: isSupabaseConfigured
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
