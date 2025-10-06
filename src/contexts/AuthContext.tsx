import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, firstName?: string, lastName?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  isReturningUser: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isReturningUser, setIsReturningUser] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    // Check if user has visited before
    const hasVisited = localStorage.getItem('has_registered');
    setIsReturningUser(!!hasVisited);

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // Mark as returning user if they sign up or sign in
        if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
          localStorage.setItem('has_registered', 'true');
          setIsReturningUser(true);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, firstName?: string, lastName?: string) => {
    const redirectUrl = `${window.location.origin}/chat`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          first_name: firstName,
          last_name: lastName,
        },
      },
    });

    if (!error) {
      localStorage.setItem('has_registered', 'true');
      setIsReturningUser(true);
    }

    return { error };
  };

  const signIn = async (email: string, password: string) => {
    // Defensive: Clear any existing session and cached data before new login
    try {
      // Clear any stale session
      await supabase.auth.signOut({ scope: 'local' });
      
      // Clear React Query cache to prevent stale profile data
      queryClient.clear();
      
      // Clear localStorage artifacts from previous sessions
      localStorage.removeItem('has_registered');
      
      // Small delay to ensure cleanup completes
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (cleanupError) {
      console.error('Session cleanup warning:', cleanupError);
      // Continue with login even if cleanup fails
    }

    // Perform fresh login
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    return { error };
  };

  const signOut = async () => {
    try {
      // Clear React Query cache first (all cached queries including profiles and recipes)
      queryClient.clear();
      
      // Clear all localStorage items related to user session
      localStorage.removeItem('has_registered');
      
      // Clear any other potential localStorage keys (iterate safely)
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (
          key.startsWith('supabase.') || 
          key.includes('user') || 
          key.includes('profile') ||
          key.includes('recipe')
        )) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      // Clear session storage as well
      sessionStorage.clear();
      
      // Sign out from Supabase (clears auth tokens)
      await supabase.auth.signOut();
      
      // Reset local state
      setUser(null);
      setSession(null);
      setIsReturningUser(false);
      
    } catch (error) {
      // Even if network fails, clear local data
      console.error('Logout error:', error);
      
      // Force local cleanup even on network failure
      queryClient.clear();
      localStorage.clear();
      sessionStorage.clear();
      setUser(null);
      setSession(null);
      setIsReturningUser(false);
      
      // Attempt local-only signout
      try {
        await supabase.auth.signOut({ scope: 'local' });
      } catch (localError) {
        console.error('Local signout error:', localError);
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signUp, signIn, signOut, isReturningUser }}>
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
