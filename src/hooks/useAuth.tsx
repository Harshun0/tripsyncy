import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable';
import type { User, Session } from '@supabase/supabase-js';

interface Profile {
  id: string;
  display_name: string;
  bio: string | null;
  location: string | null;
  avatar_url: string | null;
  cover_url: string | null;
  budget: string | null;
  personality: string | null;
  interests: string[];
  phone: string | null;
  dark_mode: boolean;
  notifications_enabled: boolean;
  profile_visibility: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, displayName: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signInWithProvider: (provider: 'google' | 'apple') => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<Profile>) => Promise<{ error: string | null }>;
  refreshProfile: () => Promise<void>;
  updatePassword: (password: string) => Promise<{ error: string | null }>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const ensureProfile = useCallback(async (authUser: User) => {
    try {
      const { data: existing, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle();

      if (!error && existing) {
        setProfile(existing as Profile);
        return;
      }

      const displayName =
        (authUser.user_metadata?.display_name as string | undefined) ||
        (authUser.email?.split('@')[0] ?? 'Traveler');

      const { data: created } = await supabase
        .from('profiles')
        .insert({
          id: authUser.id,
          display_name: displayName,
          interests: [],
        })
        .select('*')
        .single();

      if (created) setProfile(created as Profile);
    } catch (e) {
      console.error('ensureProfile failed:', e);
      setProfile(null);
    }
  }, []);

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const { data } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
      if (data) setProfile(data as Profile);
    } catch (e) {
      console.error('fetchProfile failed:', e);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    const failSafeTimer = window.setTimeout(() => {
      if (isMounted) setLoading(false);
    }, 5000);

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      if (!isMounted) return;
      setSession(nextSession);
      setUser(nextSession?.user ?? null);

      try {
        if (nextSession?.user) {
          await ensureProfile(nextSession.user);
        } else {
          setProfile(null);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    });

    supabase.auth
      .getSession()
      .then(async ({ data: { session: currentSession } }) => {
        if (!isMounted) return;
        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        try {
          if (currentSession?.user) {
            await ensureProfile(currentSession.user);
          } else {
            setProfile(null);
          }
        } finally {
          if (isMounted) setLoading(false);
        }
      })
      .catch((e) => {
        console.error('getSession failed:', e);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
      window.clearTimeout(failSafeTimer);
      subscription.unsubscribe();
    };
  }, [ensureProfile]);

  const signUp = async (email: string, password: string, displayName: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { display_name: displayName },
      },
    });

    if (error) return { error: error.message };
    return { error: null };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    return { error: null };
  };

  const signInWithProvider = async (provider: 'google' | 'apple') => {
    const { error } = await lovable.auth.signInWithOAuth(provider, {
      redirect_uri: window.location.origin,
    });

    if (error) return { error: error.message };
    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
  };

  const updateProfile = async (data: Partial<Profile>) => {
    if (!user) return { error: 'Not authenticated' };

    const { error } = await supabase
      .from('profiles')
      .update(data)
      .eq('id', user.id);

    if (error) return { error: error.message };

    await fetchProfile(user.id);
    return { error: null };
  };

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.id);
  };

  const updatePassword = async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) return { error: error.message };
    return { error: null };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        loading,
        signUp,
        signIn,
        signInWithProvider,
        signOut,
        updateProfile,
        refreshProfile,
        updatePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
