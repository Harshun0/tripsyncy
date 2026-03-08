import { supabase } from '@/integrations/supabase/client';

export interface FeedPost {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  location: string;
  caption: string;
  image: string;
  createdAt: string;
  likes: number;
  comments: number;
  liked: boolean;
  saved: boolean;
}

export const fetchFeedPosts = async (userId: string, filterLocation?: string | null) => {
  let query = supabase
    .from('posts')
    .select('id,user_id,caption,media_url,location,created_at,profiles!posts_user_id_fkey(display_name,avatar_url,location)')
    .order('created_at', { ascending: false })
    .limit(50);

  if (filterLocation) {
    query = query.ilike('location', `%${filterLocation}%`);
  }

  const { data: postRows } = await query;
  const rows = (postRows || []) as any[];
  const postIds = rows.map((r) => r.id);
  const authorIds = [...new Set(rows.map((r) => r.user_id))];

  const [likesRes, commentsRes, savedRes, followsRes] = await Promise.all([
    postIds.length ? supabase.from('post_likes').select('post_id,user_id').in('post_id', postIds) : { data: [] },
    postIds.length ? supabase.from('post_comments').select('post_id').in('post_id', postIds) : { data: [] },
    postIds.length ? supabase.from('saved_posts').select('post_id').eq('user_id', userId).in('post_id', postIds) : { data: [] },
    authorIds.length ? supabase.from('follows').select('following_id,status').eq('follower_id', userId).in('following_id', authorIds) : { data: [] },
  ]);

  const likes = ((likesRes as any).data || []) as any[];
  const comments = ((commentsRes as any).data || []) as any[];
  const saved = new Set(((savedRes as any).data || []).map((s: any) => s.post_id));

  const likeCountMap: Record<string, number> = {};
  const likedByMe = new Set<string>();
  likes.forEach((l) => {
    likeCountMap[l.post_id] = (likeCountMap[l.post_id] || 0) + 1;
    if (l.user_id === userId) likedByMe.add(l.post_id);
  });

  const commentCountMap: Record<string, number> = {};
  comments.forEach((c: any) => { commentCountMap[c.post_id] = (commentCountMap[c.post_id] || 0) + 1; });

  const followStatus: Record<string, string> = {};
  (((followsRes as any).data || []) as any[]).forEach((f) => { followStatus[f.following_id] = f.status; });

  const posts: FeedPost[] = rows.map((r) => ({
    id: r.id,
    userId: r.user_id,
    userName: r.profiles?.display_name || 'Traveler',
    userAvatar: r.profiles?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face',
    location: r.location || r.profiles?.location || 'Unknown',
    caption: r.caption || '',
    image: r.media_url || '',
    createdAt: r.created_at,
    likes: likeCountMap[r.id] || 0,
    comments: commentCountMap[r.id] || 0,
    liked: likedByMe.has(r.id),
    saved: saved.has(r.id),
  }));

  return { posts, followStatus };
};

export const fetchTrendingLocations = async (): Promise<string[]> => {
  const { data } = await supabase.from('posts').select('location').not('location', 'is', null).limit(200);
  if (!data) return ['Goa', 'Kerala', 'Ladakh', 'Rishikesh', 'Hampi', 'Manali'];
  const countMap: Record<string, number> = {};
  data.forEach((p: any) => {
    if (p.location) {
      const loc = p.location.trim();
      if (loc) countMap[loc] = (countMap[loc] || 0) + 1;
    }
  });
  const sorted = Object.entries(countMap).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([loc]) => loc);
  return sorted.length > 0 ? sorted : ['Goa', 'Kerala', 'Ladakh', 'Rishikesh', 'Hampi', 'Manali'];
};

export const togglePostLike = async (userId: string, postId: string, liked: boolean) => {
  if (liked) {
    await supabase.from('post_likes').delete().eq('post_id', postId).eq('user_id', userId);
  } else {
    await supabase.from('post_likes').insert({ post_id: postId, user_id: userId });
  }
};

export const togglePostSave = async (userId: string, postId: string, saved: boolean) => {
  if (saved) {
    await supabase.from('saved_posts').delete().eq('post_id', postId).eq('user_id', userId);
  } else {
    await supabase.from('saved_posts').insert({ post_id: postId, user_id: userId });
  }
};

export const addComment = async (userId: string, postId: string, content: string) => {
  const { error } = await supabase.from('post_comments').insert({ post_id: postId, user_id: userId, content });
  return { error: error?.message || null };
};

export const sendFollowRequest = async (userId: string, targetUserId: string) => {
  const { error } = await supabase.from('follows').insert({ follower_id: userId, following_id: targetUserId, status: 'pending' });
  return { error: error?.message || null };
};

export const removeFollow = async (userId: string, targetUserId: string) => {
  await supabase.from('follows').delete().eq('follower_id', userId).eq('following_id', targetUserId);
};
