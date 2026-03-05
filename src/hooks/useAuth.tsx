import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

interface Profile {
  id: string;
  display_name: string;
  username: string | null;
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
  profile_visibility: 'public' | 'connections' | 'private';
}

interface SignUpData {
  email: string;
  password: string;
  displayName: string;
  location: string;
  budget: string;
  personality: string;
  interests: string[];
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  needsOnboarding: boolean;
  signUp: (payload: SignUpData) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<Profile>) => Promise<{ error: string | null }>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);
const db = supabase as any;

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (userObj: User) => {
    const { data, error } = await db.from('profiles').select('*').eq('id', userObj.id).maybeSingle();

    if (!data) {
      const fallbackProfile = {
        id: userObj.id,
        display_name: (userObj.user_metadata?.display_name as string) || 'Traveler',
        location: (userObj.user_metadata?.location as string) || null,
        budget: (userObj.user_metadata?.budget as string) || 'Mid-Range',
        personality: (userObj.user_metadata?.personality as string) || 'Ambivert',
        interests: (userObj.user_metadata?.interests as string[]) || [],
      };
      await db.from('profiles').upsert(fallbackProfile);
      const { data: created } = await db.from('profiles').select('*').eq('id', userObj.id).maybeSingle();
      if (created) setProfile(created as Profile);
      if (error) console.error(error);
      return;
    }

    setProfile(data as Profile);
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      const nextUser = nextSession?.user ?? null;
      setUser(nextUser);
      if (nextUser) {
        setTimeout(() => fetchProfile(nextUser), 0);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session: existingSession } }) => {
      setSession(existingSession);
      const nextUser = existingSession?.user ?? null;
      setUser(nextUser);
      if (nextUser) fetchProfile(nextUser);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  const signUp = async (payload: SignUpData) => {
    const { email, password, displayName, location, budget, personality, interests } = payload;
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: {
          display_name: displayName,
          location,
          budget,
          personality,
          interests,
        },
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

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
  };

  const updateProfile = async (data: Partial<Profile>) => {
    if (!user) return { error: 'Not authenticated' };
    const { error } = await db.from('profiles').update(data).eq('id', user.id);
    if (error) return { error: error.message };
    await fetchProfile(user);
    return { error: null };
  };

  const refreshProfile = async () => {
    if (user) await fetchProfile(user);
  };

  const needsOnboarding = !!user && !!profile && (!profile.location || !profile.bio || profile.interests.length === 0);

  return (
    <AuthContext.Provider value={{ user, session, profile, loading, needsOnboarding, signUp, signIn, signOut, updateProfile, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
