import React, { createContext, useContext, useState, useEffect } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { UserProfile, UserRole } from '../types';
import { ADMIN_AUTHORIZED_EMAIL, supabase } from '../lib/supabase';

interface AuthContextType {
  user: UserProfile | null;
  supabaseUser: User | null;
  session: Session | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isAgent: boolean;
  role: UserRole;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [supabaseUser, setSupabaseUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Clear out any obsolete mock auth keys from previous versions
  useEffect(() => {
    try {
      localStorage.removeItem('almiraj_auth_user');
      localStorage.removeItem('bahria_auth_user');
    } catch {
      // ignore
    }
  }, []);

  const evaluateAndSetUser = (authUser: User | null, currentSession: Session | null) => {
    if (!authUser || !currentSession) {
      setSupabaseUser(null);
      setSession(null);
      setUser(null);
      return false;
    }

    const email = authUser.email?.trim().toLowerCase() || '';
    const isAuthorized = email === ADMIN_AUTHORIZED_EMAIL.toLowerCase();

    if (!isAuthorized) {
      // Immediate denial & signout for any unauthorized account
      supabase.auth.signOut().catch(() => {});
      setSupabaseUser(null);
      setSession(null);
      setUser(null);
      return false;
    }

    const adminProfile: UserProfile = {
      id: authUser.id,
      email: authUser.email || ADMIN_AUTHORIZED_EMAIL,
      full_name: authUser.user_metadata?.full_name || 'Administrator',
      role: 'admin',
      is_active: true,
      created_at: authUser.created_at || new Date().toISOString(),
    };

    setSupabaseUser(authUser);
    setSession(currentSession);
    setUser(adminProfile);
    return true;
  };

  useEffect(() => {
    let mounted = true;

    // Check active session on initial app load / refresh
    supabase.auth
      .getSession()
      .then(({ data: { session: initialSession }, error }) => {
        if (!mounted) return;
        if (error) {
          console.warn('Session verification error:', error.message);
          evaluateAndSetUser(null, null);
        } else if (initialSession?.user) {
          evaluateAndSetUser(initialSession.user, initialSession);
        } else {
          evaluateAndSetUser(null, null);
        }
      })
      .catch((err) => {
        console.warn('Failed to restore Supabase session:', err);
        if (mounted) evaluateAndSetUser(null, null);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    // Listen to Supabase auth events
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, newSession) => {
      if (!mounted) return;

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        if (newSession?.user) {
          evaluateAndSetUser(newSession.user, newSession);
        } else {
          evaluateAndSetUser(null, null);
        }
      } else if (event === 'SIGNED_OUT') {
        evaluateAndSetUser(null, null);
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = async (
    email: string,
    password?: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (!email || !email.trim()) {
      return { success: false, error: 'Email address is required.' };
    }
    if (!password) {
      return { success: false, error: 'Password is required.' };
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Enforce email allowlist
    if (normalizedEmail !== ADMIN_AUTHORIZED_EMAIL.toLowerCase()) {
      return {
        success: false,
        error: `Access denied. Only the authorized administrator account (${ADMIN_AUTHORIZED_EMAIL}) has portal access.`,
      };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (!data.user || !data.session) {
        return { success: false, error: 'Authentication failed. Please verify your credentials.' };
      }

      const verified = evaluateAndSetUser(data.user, data.session);
      if (!verified) {
        return {
          success: false,
          error: `Access denied. Account is not authorized for administrator access.`,
        };
      }

      return { success: true };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'An unexpected error occurred during authentication.',
      };
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn('Sign out error:', e);
    }
    evaluateAndSetUser(null, null);
  };

  const isAuthenticated = Boolean(user && user.role === 'admin' && session);
  const isAdmin = isAuthenticated;
  const isAgent = isAuthenticated;
  const role: UserRole = isAuthenticated ? 'admin' : 'visitor';

  return (
    <AuthContext.Provider
      value={{
        user,
        supabaseUser,
        session,
        loading,
        isAuthenticated,
        isAdmin,
        isAgent,
        role,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
