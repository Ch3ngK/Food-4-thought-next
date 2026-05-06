'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../supabaseClient';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
});

export const useAuth = () => {                                       //export to allow access to the context in other components
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { 
              data: { 
                session 
              }, 
              error } = await supabase.auth.getSession(); //await to ensure that getSession() completes before proceeding
      
      if (error) {
        console.error('Error getting session:', error);
      } else {
        setSession(session);
        setUser(session?.user ?? null); //session?.user means if session exists, get session.user, else return undefined
                                        //?? null means if session?.user returns undefined, use null instead.
        // Handle OAuth callback - if user just logged in via OAuth
        if (session?.user && window.location.pathname === '/') {
          router.push('/home');
        }
      }
      
      setLoading(false);
    };

    getInitialSession();

    // Listen for auth changes (including OAuth callbacks)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth event:', event, session);
        
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // Handle different auth events
        switch (event) {
          case 'SIGNED_IN':
            if (session?.user) {
              // Only redirect if not already on home page
              if (window.location.pathname !== '/home') {
                router.push('/home');
              }
            }
            break;
          case 'SIGNED_OUT':
            router.push('/');
            break;
          case 'TOKEN_REFRESHED':
            // Session refreshed, no action needed
            break;
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  
  const value = {
    user,
    session,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};