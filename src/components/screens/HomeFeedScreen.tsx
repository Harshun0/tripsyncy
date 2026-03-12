import React, { useEffect, useState } from 'react';
import { Heart, MessageCircle, Bookmark, Share2, MoreHorizontal, MapPin, Bell, ChevronLeft, ChevronRight, Loader2, Compass } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { dummyPosts, TravelPost } from '@/data/dummyProfiles';

interface DbPost {
  id: string;
  user_id: string;
  caption: string | null;
  media_url: string | null;
  location: string | null;
  created_at: string;
  profiles?: { display_name: string; avatar_url: string | null } | null;
}

const HomeFeedScreen: React.FC = () => {
  const { user } = useAuth();
  const [dummyState, setDummyState] = useState<TravelPost[]>(dummyPosts);
  const [dbPosts, setDbPosts] = useState<DbPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [mediaIndices, setMediaIndices] = useState<Record<string, number>>({});
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [savedPosts, setSavedPosts] = useState<Set<string>>(new Set());

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('posts')
        .select('id, user_id, caption, media_url, location, created_at, profiles(display_name, avatar_url)')
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(50);
      setDbPosts((data as any) || []);

      if (user) {
        const [likesRes, savesRes] = await Promise.all([
          supabase.from('post_likes').select('post_id').eq('user_id', user.id),
          supabase.from('saved_posts').select('post_id').eq('user_id', user.id),
        ]);
        setLikedPosts(new Set((likesRes.data || []).map((l: any) => l.post_id)));
        setSavedPosts(new Set((savesRes.data || []).map((s: any) => s.post_id)));
      }
      setLoading(false);
    };
    load();
  }, [user]);

  const toggleLikeDummy = (postId: string) => {
    setDummyState(prev => prev.map(p => p.id === postId ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 } : p));
  };

  const toggleSaveDummy = (postId: string) => {
    setDummyState(prev => prev.map(p => p.id === postId ? { ...p, saved: !p.saved } : p));
  };

  const toggleLikeDb = async (postId: string) => {
    if (!user) return;
    if (likedPosts.has(postId)) {
      await supabase.from('post_likes').delete().eq('user_id', user.id).eq('post_id', postId);
      setLikedPosts(prev => { const n = new Set(prev); n.delete(postId); return n; });
    } else {
      await supabase.from('post_likes').insert({ user_id: user.id, post_id: postId });
      setLikedPosts(prev => new Set(prev).add(postId));
    }
  };

  const toggleSaveDb = async (postId: string) => {
    if (!user) return;
    if (savedPosts.has(postId)) {
      await supabase.from('saved_posts').delete().eq('user_id', user.id).eq('post_id', postId);
      setSavedPosts(prev => { const n = new Set(prev); n.delete(postId); return n; });
    } else {
      await supabase.from('saved_posts').insert({ user_id: user.id, post_id: postId });
      setSavedPosts(prev => new Set(prev).add(postId));
    }
  };

  const getMediaUrls = (mediaUrl: string | null): string[] => {
    if (!mediaUrl) return [];
    return mediaUrl.split(',').map(u => u.trim()).filter(Boolean);
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  };

  return (
    <div className="pb-4">
      {/* Header */}
      <div className="sticky top-0 z-30 glass-effect px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 gradient-primary rounded-xl flex items-center justify-center">
            <Compass className="w-4 h-4 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-bold text-gradient font-display">TripSync</h1>
        </div>
        <button className="w-10 h-10 rounded-full bg-card border border-border/50 flex items-center justify-center relative shadow-sm hover:shadow-md transition-shadow">
          <Bell className="w-5 h-5 text-foreground" />
          <span className="absolute -top-1 -right-1 w-5 h-5 gradient-sunset rounded-full text-[10px] text-primary-foreground font-bold flex items-center justify-center shadow-sm">3</span>
        </button>
      </div>

      {/* Stories */}
      <div className="px-4 py-3">
        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
          <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
            <div className="w-[68px] h-[68px] rounded-2xl bg-card flex items-center justify-center border-2 border-dashed border-primary/40 hover:border-primary transition-colors">
              <span className="text-2xl text-primary font-light">+</span>
            </div>
            <span className="text-[11px] text-muted-foreground font-medium">Add Story</span>
          </div>
          {['Priya', 'Arjun', 'Sneha', 'Vikram', 'Ananya'].map((name, i) => (
            <div key={i} className="flex flex-col items-center gap-1.5 flex-shrink-0">
              <div className="w-[68px] h-[68px] rounded-2xl p-[2.5px] gradient-primary shadow-sm">
                <img src={`https://images.unsplash.com/photo-${1494790108377 + i * 1000}-be9c29b29330?w=100&h=100&fit=crop&crop=face`} alt={name} className="w-full h-full rounded-[14px] object-cover border-[2.5px] border-background" />
              </div>
              <span className="text-[11px] text-foreground font-medium">{name}</span>
            </div>
          ))}
        </div>
      </div>

      {loading && (
        <div className="py-16 text-center">
          <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
          <p className="text-sm text-muted-foreground">Loading adventures...</p>
        </div>
      )}

      {/* Real DB Posts */}
      <div className="space-y-3 px-3">
        {dbPosts.map((post) => {
          const urls = getMediaUrls(post.media_url);
          const idx = mediaIndices[post.id] || 0;
          const prof = post.profiles as any;
          const name = prof?.display_name || 'Traveler';
          const avatar = prof?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face';
          const liked = likedPosts.has(post.id);
          const saved = savedPosts.has(post.id);

          return (
            <article key={post.id} className="bg-card rounded-2xl overflow-hidden border border-border/30 shadow-sm animate-fade-in">
              <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="p-[2px] gradient-primary rounded-xl">
                    <img src={avatar} alt={name} className="w-10 h-10 rounded-[10px] object-cover border-2 border-background" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-foreground">{name}</h3>
                    {post.location && <div className="flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="w-3 h-3 text-primary" />{post.location}</div>}
                  </div>
                </div>
                <button className="p-2 rounded-full hover:bg-muted transition-colors"><MoreHorizontal className="w-5 h-5 text-muted-foreground" /></button>
              </div>

              {/* Media carousel */}
              {urls.length > 0 && (
                <div className="relative aspect-[4/3] bg-muted group">
                  {urls[idx]?.match(/\.(mp4|webm|mov)$/i) ? (
                    <video src={urls[idx]} className="w-full h-full object-cover" controls muted />
                  ) : (
                    <img src={urls[idx]} alt="" className="w-full h-full object-cover" />
                  )}
                  {urls.length > 1 && (
                    <>
                      <button onClick={() => setMediaIndices(prev => ({ ...prev, [post.id]: (idx - 1 + urls.length) % urls.length }))} className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button onClick={() => setMediaIndices(prev => ({ ...prev, [post.id]: (idx + 1) % urls.length }))} className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
                        <ChevronRight className="w-4 h-4" />
                      </button>
                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 bg-background/40 backdrop-blur-sm rounded-full px-2 py-1">
                        {urls.map((_, i) => <span key={i} className={`w-1.5 h-1.5 rounded-full transition-all ${i === idx ? 'bg-primary w-4' : 'bg-background/80'}`} />)}
                      </div>
                    </>
                  )}
                </div>
              )}

              <div className="px-4 py-3 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-5">
                    <button onClick={() => toggleLikeDb(post.id)} className="transition-transform active:scale-125 hover:scale-110">
                      <Heart className={`w-6 h-6 ${liked ? 'fill-destructive text-destructive' : 'text-foreground hover:text-destructive/70'} transition-colors`} />
                    </button>
                    <button className="hover:scale-110 transition-transform"><MessageCircle className="w-6 h-6 text-foreground hover:text-primary transition-colors" /></button>
                    <button className="hover:scale-110 transition-transform"><Share2 className="w-6 h-6 text-foreground hover:text-accent transition-colors" /></button>
                  </div>
                  <button onClick={() => toggleSaveDb(post.id)} className="transition-transform active:scale-110 hover:scale-110">
                    <Bookmark className={`w-6 h-6 ${saved ? 'fill-foreground text-foreground' : 'text-foreground hover:text-secondary/70'} transition-colors`} />
                  </button>
                </div>
                {post.caption && (
                  <p className="text-sm leading-relaxed"><span className="font-semibold">{name}</span>{' '}<span className="text-foreground/90">{post.caption}</span></p>
                )}
                <p className="text-[11px] text-muted-foreground uppercase tracking-wide">{timeAgo(post.created_at)}</p>
              </div>
            </article>
          );
        })}

        {/* Dummy posts below real ones */}
        {dummyState.map((post) => (
          <article key={post.id} className="bg-card rounded-2xl overflow-hidden border border-border/30 shadow-sm animate-fade-in">
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="p-[2px] gradient-primary rounded-xl">
                  <img src={post.userAvatar} alt={post.userName} className="w-10 h-10 rounded-[10px] object-cover border-2 border-background" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-foreground">{post.userName}</h3>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="w-3 h-3 text-primary" />{post.location}</div>
                </div>
              </div>
              <button className="p-2 rounded-full hover:bg-muted transition-colors"><MoreHorizontal className="w-5 h-5 text-muted-foreground" /></button>
            </div>
            <div className="relative aspect-[4/3] bg-muted overflow-hidden">
              <img src={post.image} alt={post.caption} className="w-full h-full object-cover hover:scale-[1.02] transition-transform duration-500" />
              {/* Location overlay */}
              <div className="absolute bottom-3 left-3">
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-background/70 backdrop-blur-md rounded-full">
                  <MapPin className="w-3 h-3 text-primary" />
                  <span className="text-[11px] font-medium text-foreground">{post.location}</span>
                </div>
              </div>
            </div>
            <div className="px-4 py-3 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-5">
                  <button onClick={() => toggleLikeDummy(post.id)} className="transition-transform active:scale-125 hover:scale-110">
                    <Heart className={`w-6 h-6 ${post.liked ? 'fill-destructive text-destructive' : 'text-foreground hover:text-destructive/70'} transition-colors`} />
                  </button>
                  <button className="hover:scale-110 transition-transform"><MessageCircle className="w-6 h-6 text-foreground hover:text-primary transition-colors" /></button>
                  <button className="hover:scale-110 transition-transform"><Share2 className="w-6 h-6 text-foreground hover:text-accent transition-colors" /></button>
                </div>
                <button onClick={() => toggleSaveDummy(post.id)} className="transition-transform active:scale-110 hover:scale-110">
                  <Bookmark className={`w-6 h-6 ${post.saved ? 'fill-foreground text-foreground' : 'text-foreground hover:text-secondary/70'} transition-colors`} />
                </button>
              </div>
              <p className="font-semibold text-sm">{post.likes.toLocaleString()} likes</p>
              <p className="text-sm leading-relaxed"><span className="font-semibold">{post.userName}</span>{' '}<span className="text-foreground/90">{post.caption}</span></p>
              <button className="text-sm text-muted-foreground hover:text-foreground transition-colors">View all {post.comments} comments</button>
              <p className="text-[11px] text-muted-foreground uppercase tracking-wide">{post.timestamp}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

export default HomeFeedScreen;
