import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

type UserRole = 'student' | 'teacher' | 'admin';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  role: UserRole | null;
  loading: boolean;
  signIn: (email: string, password: string, role: UserRole) => Promise<void>;
  signUp: (email: string, password: string, role: UserRole, username?: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session with error handling
    supabase.auth.getSession()
      .then(({ data: { session }, error }) => {
        if (error) {
          console.error('Error getting session:', error);
          setLoading(false);
          return;
        }
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchUserRole(session.user.id);
        } else {
          setLoading(false);
        }
      })
      .catch((error) => {
        console.error('Error in getSession:', error);
        setLoading(false);
      });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchUserRole(session.user.id);
      } else {
        setRole(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function fetchUserRole(userId: string) {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .maybeSingle(); // Use maybeSingle instead of single to handle 0 rows gracefully

      if (error) {
        // If table doesn't exist or RLS error, just set loading to false
        console.error('Error fetching user role:', error);
        setRole(null);
        setLoading(false);
        return;
      }
      
      // If no role found, set to null (user exists but no role assigned)
      if (data) {
        setRole(data.role as UserRole);
      } else {
        setRole(null);
      }
    } catch (error) {
      console.error('Error fetching user role:', error);
      setRole(null);
    } finally {
      setLoading(false);
    }
  }

  async function signIn(email: string, password: string, role: UserRole) {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        // Verify role matches
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', data.user.id)
          .maybeSingle(); // Use maybeSingle to handle missing roles

        if (roleError && roleError.code !== 'PGRST116') {
          // Only throw if it's not a "no rows" error
          throw roleError;
        }
        
        if (roleData?.role) {
          if (roleData.role !== role) {
            await supabase.auth.signOut();
            throw new Error('Invalid role for this account');
          }
          setRole(roleData.role as UserRole);
        } else {
          // No role in database, but allow login for demo purposes
          // In production, you'd want to handle this differently
          setRole(role);
        }
      }
    } catch (error: any) {
      throw error;
    } finally {
      setLoading(false);
    }
  }

  async function signUp(email: string, password: string, role: UserRole, username?: string) {
    setLoading(true);
    try {
      // Sign up the user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          // Skip email confirmation for demo/development
          emailRedirectTo: undefined,
        },
      });

      if (authError) throw authError;

      // Check if we have a session (user is immediately authenticated)
      // or if email confirmation is required
      if (authData.session) {
        // User is immediately authenticated (email confirmation disabled)
        setSession(authData.session);
        setUser(authData.user);
      } else if (authData.user) {
        // User created but needs email confirmation
        // For demo purposes, we'll still proceed
        setUser(authData.user);
      }

      if (authData.user) {
        // Create user role entry
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({
            user_id: authData.user.id,
            role: role,
          });

        if (roleError) {
          // Log the actual error for debugging
          console.error('Role creation error:', roleError);
          
          // For demo/competition: continue even if role creation fails
          // Set role in memory
          setRole(role);
          console.warn('Could not create user role in database, but continuing with in-memory role:', roleError.message);
        } else {
          // Successfully created role, set it
          setRole(role);
        }
      }
    } catch (error: any) {
      throw error;
    } finally {
      setLoading(false);
    }
  }

  async function signOut() {
    setLoading(true);
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setRole(null);
    setLoading(false);
  }

  return (
    <AuthContext.Provider value={{ session, user, role, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
