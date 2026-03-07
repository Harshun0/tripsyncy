import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { Heart, MessageCircle, Bookmark, Share2, MapPin, TrendingUp, UserPlus, UserCheck, Send, Copy, Facebook, Twitter, Link2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface FeedPost {
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

interface FeedSectionProps {
  onViewUserProfile?: (userId: string) => void;
}

const FeedSection: React.FC<FeedSectionProps> = ({ onViewUserProfile }) => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentingOn, setCommentingOn] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [shareMenuOpen, setShareMenuOpen] = useState<string | null>(null);
  const [followMap, setFollowMap] = useState<Record<string, string>>({});
  const [trendingLocations, setTrendingLocations] = useState<string[]>([]);
  const [filterLocation, setFilterLocation] = useState<string | null>(null);
  const shareRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (shareMenuOpen && shareRef.current && !shareRef.current.contains(e.target as Node)) setShareMenuOpen(null);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [shareMenuOpen]);

  const loadFeed = useCallback(async () => {
    if (!user) return;
    setLoading(true);

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
      postIds.length ? supabase.from('saved_posts').select('post_id').eq('user_id', user.id).in('post_id', postIds) : { data: [] },
      authorIds.length ? supabase.from('follows').select('following_id,status').eq('follower_id', user.id).in('following_id', authorIds) : { data: [] },
    ]);

    const likes = ((likesRes as any).data || []) as any[];
    const comments = ((commentsRes as any).data || []) as any[];
    const saved = new Set(((savedRes as any).data || []).map((s: any) => s.post_id));

    const likeCountMap: Record<string, number> = {};
    const likedByMe = new Set<string>();
    likes.forEach((l) => {
      likeCountMap[l.post_id] = (likeCountMap[l.post_id] || 0) + 1;
      if (l.user_id === user.id) likedByMe.add(l.post_id);
    });

    const commentCountMap: Record<string, number> = {};
    comments.forEach((c: any) => { commentCountMap[c.post_id] = (commentCountMap[c.post_id] || 0) + 1; });

    const followStatus: Record<string, string> = {};
    (((followsRes as any).data || []) as any[]).forEach((f) => { followStatus[f.following_id] = f.status; });
    setFollowMap(followStatus);

    setPosts(
      rows.map((r) => ({
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
      }))
    );
    setLoading(false);
  }, [user, filterLocation]);

  // Load trending locations from post data
  useEffect(() => {
    const loadTrending = async () => {
      const { data } = await supabase.from('posts').select('location').not('location', 'is', null).limit(200);
      if (!data) return;
      const countMap: Record<string, number> = {};
      data.forEach((p: any) => {
        if (p.location) {
          const loc = p.location.trim();
          if (loc) countMap[loc] = (countMap[loc] || 0) + 1;
        }
      });
      const sorted = Object.entries(countMap).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([loc]) => loc);
      setTrendingLocations(sorted.length > 0 ? sorted : ['Goa', 'Kerala', 'Ladakh', 'Rishikesh', 'Hampi', 'Manali']);
    };
    loadTrending();
  }, []);

  useEffect(() => { loadFeed(); }, [loadFeed]);

  const toggleLike = async (postId: string, liked: boolean) => {
    if (!user) return;
    setPosts((prev) => prev.map((p) => p.id === postId ? { ...p, liked: !liked, likes: liked ? p.likes - 1 : p.likes + 1 } : p));
    if (liked) {
      await supabase.from('post_likes').delete().eq('post_id', postId).eq('user_id', user.id);
    } else {
      await supabase.from('post_likes').insert({ post_id: postId, user_id: user.id });
    }
  };

  const toggleSave = async (postId: string, saved: boolean) => {
    if (!user) return;
    setPosts((prev) => prev.map((p) => p.id === postId ? { ...p, saved: !saved } : p));
    if (saved) {
      await supabase.from('saved_posts').delete().eq('post_id', postId).eq('user_id', user.id);
    } else {
      await supabase.from('saved_posts').insert({ post_id: postId, user_id: user.id });
    }
    toast({ title: saved ? 'Removed from saved' : 'Post saved! 🔖' });
  };

  const handleComment = async (postId: string) => {
    if (!user || !commentText.trim()) return;
    const { error } = await supabase.from('post_comments').insert({ post_id: postId, user_id: user.id, content: commentText.trim() });
    if (error) { toast({ title: 'Comment failed', variant: 'destructive' }); return; }
    setPosts((prev) => prev.map((p) => p.id === postId ? { ...p, comments: p.comments + 1 } : p));
    setCommentText('');
    toast({ title: 'Comment added! 💬' });
  };

  const handleFollow = async (targetUserId: string, userName: string) => {
    if (!user || targetUserId === user.id) return;
    const status = followMap[targetUserId];
    if (!status) {
      const { error } = await supabase.from('follows').insert({ follower_id: user.id, following_id: targetUserId, status: 'pending' });
      if (error) { toast({ title: 'Follow request failed', variant: 'destructive' }); return; }
      setFollowMap((prev) => ({ ...prev, [targetUserId]: 'pending' }));
      toast({ title: `Request sent to ${userName}` });
    } else {
      await supabase.from('follows').delete().eq('follower_id', user.id).eq('following_id', targetUserId);
      setFollowMap((prev) => { const next = { ...prev }; delete next[targetUserId]; return next; });
      toast({ title: status === 'accepted' ? `Unfollowed ${userName}` : 'Request cancelled' });
    }
  };

  const handleShare = (post: FeedPost, method: string) => {
    const shareText = `${post.userName} on TripSync: ${post.caption}`;
    const shareUrl = window.location.href;
    if (method === 'copy') { navigator.clipboard.writeText(`${shareText}\n${shareUrl}`); toast({ title: 'Link copied! 📋' }); }
    else if (method === 'twitter') window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, '_blank');
    else if (method === 'facebook') window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
    else if (method === 'whatsapp') window.open(`https://wa.me/?text=${encodeURIComponent(shareText + '\n' + shareUrl)}`, '_blank');
    else if (method === 'native' && navigator.share) navigator.share({ title: `${post.userName} on TripSync`, text: post.caption, url: shareUrl });
    setShareMenuOpen(null);
  };

  const isVideo = (url: string) => /\.(mp4|webm|mov|ogg)$/i.test(url);

  return (
    <section className="py-20 lg:py-32 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-2">Travel <span className="text-gradient">Stories</span></h2>
          <p className="text-lg text-muted-foreground">Real posts from real users.</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {loading ? (
              <div className="travel-card p-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" /></div>
            ) : posts.length === 0 ? (
              <div className="travel-card p-8 text-center text-muted-foreground">{filterLocation ? `No posts from "${filterLocation}" yet.` : 'No posts yet. Create the first post from your profile!'}</div>
            ) : posts.map((post) => (
              <article key={post.id} className="bg-card rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between px-6 py-4">
                  <div className="flex items-center gap-3 cursor-pointer" onClick={() => onViewUserProfile?.(post.userId)}>
                    <img src={post.userAvatar} alt={post.userName} className="w-12 h-12 rounded-full object-cover" />
                    <div>
                      <h3 className="font-semibold text-foreground hover:text-primary transition-colors">{post.userName}</h3>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground"><MapPin className="w-3 h-3" />{post.location}</div>
                    </div>
                  </div>
                  {post.userId !== user?.id && (
                    <button onClick={() => handleFollow(post.userId, post.userName)} className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${followMap[post.userId] === 'accepted' ? 'bg-muted text-foreground' : 'gradient-primary text-white'}`}>
                      {followMap[post.userId] === 'accepted' ? <><UserCheck className="w-3 h-3" /> Following</> : followMap[post.userId] === 'pending' ? <><UserPlus className="w-3 h-3" /> Requested</> : <><UserPlus className="w-3 h-3" /> Follow</>}
                    </button>
                  )}
                </div>

                {post.image && (
                  <div className="relative aspect-[16/10] bg-muted">
                    {isVideo(post.image) ? (
                      <video src={post.image} controls className="w-full h-full object-cover" />
                    ) : (
                      <img src={post.image} alt={post.caption} className="w-full h-full object-cover" loading="lazy" />
                    )}
                  </div>
                )}

                <div className="px-6 py-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <button onClick={() => toggleLike(post.id, post.liked)} className="flex items-center gap-2 transition-transform hover:scale-105 active:scale-95">
                        <Heart className={`w-6 h-6 ${post.liked ? 'fill-destructive text-destructive' : 'text-foreground'}`} />
                        <span className="font-medium text-sm">{post.likes.toLocaleString()}</span>
                      </button>
                      <button onClick={() => setCommentingOn(commentingOn === post.id ? null : post.id)} className="flex items-center gap-2 hover:text-primary transition-colors">
                        <MessageCircle className="w-6 h-6" /><span className="font-medium text-sm">{post.comments}</span>
                      </button>
                      <div className="relative" ref={shareMenuOpen === post.id ? shareRef : null}>
                        <button onClick={() => setShareMenuOpen(shareMenuOpen === post.id ? null : post.id)} className="hover:text-primary transition-colors"><Share2 className="w-6 h-6" /></button>
                        {shareMenuOpen === post.id && (
                          <div className="absolute bottom-full left-0 mb-2 w-56 bg-background border border-border rounded-2xl shadow-xl z-50 animate-fade-in overflow-hidden p-2 space-y-1">
                            <button onClick={() => handleShare(post, 'whatsapp')} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm hover:bg-muted transition-colors"><Send className="w-4 h-4 text-green-500" />WhatsApp</button>
                            <button onClick={() => handleShare(post, 'twitter')} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm hover:bg-muted transition-colors"><Twitter className="w-4 h-4 text-accent" />Twitter / X</button>
                            <button onClick={() => handleShare(post, 'facebook')} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm hover:bg-muted transition-colors"><Facebook className="w-4 h-4 text-primary" />Facebook</button>
                            <button onClick={() => handleShare(post, 'copy')} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm hover:bg-muted transition-colors"><Copy className="w-4 h-4 text-muted-foreground" />Copy Link</button>
                            {typeof navigator.share === 'function' && <button onClick={() => handleShare(post, 'native')} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm hover:bg-muted transition-colors"><Link2 className="w-4 h-4 text-muted-foreground" />More Options</button>}
                          </div>
                        )}
                      </div>
                    </div>
                    <button onClick={() => toggleSave(post.id, post.saved)} className="transition-transform hover:scale-105">
                      <Bookmark className={`w-6 h-6 ${post.saved ? 'fill-foreground text-foreground' : 'text-foreground'}`} />
                    </button>
                  </div>
                  <p className="text-foreground"><span className="font-semibold">{post.userName}</span> {post.caption}</p>
                  {commentingOn === post.id && (
                    <div className="space-y-2 pt-2 border-t border-border animate-fade-in">
                      <div className="flex gap-2">
                        <input type="text" value={commentText} onChange={(e) => setCommentText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleComment(post.id)} placeholder="Add a comment..." className="flex-1 h-9 px-3 bg-muted rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                        <Button onClick={() => handleComment(post.id)} size="sm" className="h-9 w-9 p-0 rounded-full gradient-primary"><Send className="w-4 h-4" /></Button>
                      </div>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground uppercase">{new Date(post.createdAt).toLocaleString()}</p>
                </div>
              </article>
            ))}
          </div>

          <div className="space-y-6">
            <div className="bg-card rounded-3xl p-6 shadow-lg">
              <div className="flex items-center gap-2 mb-4"><TrendingUp className="w-5 h-5 text-primary" /><h3 className="font-semibold text-foreground">Trending Destinations</h3></div>
              <div className="space-y-3">
                {trendingLocations.map((place, i) => (
                  <button key={place} onClick={() => { setFilterLocation(filterLocation === place ? null : place); }} className={`w-full flex items-center justify-between p-3 rounded-xl transition-colors cursor-pointer ${filterLocation === place ? 'bg-primary/10 ring-1 ring-primary' : 'bg-muted/50 hover:bg-muted'}`}>
                    <div className="flex items-center gap-3"><span className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-xs font-bold text-primary">{i + 1}</span><span className="font-medium text-foreground">{place}</span></div>
                    <span className="text-xs text-muted-foreground">{filterLocation === place ? 'active' : 'hot'}</span>
                  </button>
                ))}
                {filterLocation && (
                  <button onClick={() => setFilterLocation(null)} className="w-full text-sm text-primary font-medium text-center py-2 hover:underline">Clear filter</button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeedSection;
