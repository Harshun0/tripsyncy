import { supabase } from '@/integrations/supabase/client';

export const fetchProfileCounts = async (userId: string) => {
  const [{ count: trips }, { count: followers }, { count: following }] = await Promise.all([
    supabase.from('trips').select('*', { count: 'exact', head: true }).eq('user_id', userId),
    supabase.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', userId).eq('status', 'accepted'),
    supabase.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', userId).eq('status', 'accepted'),
  ]);
  return { trips: trips || 0, followers: followers || 0, following: following || 0 };
};

export const uploadProfileMedia = async (userId: string, file: File, type: 'avatar' | 'cover') => {
  const ext = file.name.split('.').pop() || 'jpg';
  const path = `${userId}/${type}-${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from('profile-media').upload(path, file, { cacheControl: '3600', upsert: true });
  if (error) throw error;
  return supabase.storage.from('profile-media').getPublicUrl(path).data.publicUrl;
};

export const uploadPostMedia = async (userId: string, file: File) => {
  const ext = file.name.split('.').pop() || 'jpg';
  const path = `${userId}/${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from('post-media').upload(path, file, { upsert: true });
  if (error) throw error;
  return supabase.storage.from('post-media').getPublicUrl(path).data.publicUrl;
};

export const createPost = async (userId: string, caption: string, location: string | null, mediaUrl: string | null) => {
  const { error } = await supabase.from('posts').insert({ user_id: userId, caption, location, media_url: mediaUrl, is_public: true });
  return { error: error?.message || null };
};
