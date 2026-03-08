import { supabase } from '@/integrations/supabase/client';

export interface TravelerProfile {
  id: string;
  display_name: string;
  avatar_url: string | null;
  location: string | null;
  bio: string | null;
  interests: string[];
}

export const fetchTravelers = async (currentUserId?: string): Promise<TravelerProfile[]> => {
  const { data } = await supabase
    .from('profiles')
    .select('id,display_name,avatar_url,location,bio,interests')
    .neq('id', currentUserId || '')
    .limit(30);
  return (data || []) as TravelerProfile[];
};

export const fetchFollowMap = async (userId: string, targetIds: string[]): Promise<Record<string, string>> => {
  if (!targetIds.length) return {};
  const { data } = await supabase.from('follows').select('following_id,status').eq('follower_id', userId).in('following_id', targetIds);
  const map: Record<string, string> = {};
  (data || []).forEach((f: any) => { map[f.following_id] = f.status; });
  return map;
};
