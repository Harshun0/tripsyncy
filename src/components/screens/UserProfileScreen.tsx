import React, { useEffect, useState } from 'react';
import { MapPin, BadgeCheck, UserPlus, UserCheck, MessageCircle, ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface UserProfileScreenProps {
  userId: string;
  onBack: () => void;
  onOpenMessages?: () => void;
}

const UserProfileScreen: React.FC<UserProfileScreenProps> = ({ userId, onBack, onOpenMessages }) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [followStatus, setFollowStatus] = useState<string | null>(null);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [postCount, setPostCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [profileRes, postsRes, followersRes, followingRes, followRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', userId).maybeSingle(),
        supabase.from('posts').select('id,caption,media_url,location,created_at').eq('user_id', userId).eq('is_public', true).order('created_at', { ascending: false }).limit(30),
        supabase.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', userId).eq('status', 'accepted'),
        supabase.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', userId).eq('status', 'accepted'),
        user ? supabase.from('follows').select('status').eq('follower_id', user.id).eq('following_id', userId).maybeSingle() : Promise.resolve({ data: null }),
      ]);

      if (profileRes.data) setProfile(profileRes.data);
      setPosts(postsRes.data || []);
      setFollowerCount(followersRes.count || 0);
      setFollowingCount(followingRes.count || 0);
      setPostCount(postsRes.data?.length || 0);
      setFollowStatus((followRes.data as any)?.status || null);
      setLoading(false);
    };
    load();
  }, [userId, user]);

  const handleFollow = async () => {
    if (!user) return;
    if (!followStatus) {
      await supabase.from('follows').insert({ follower_id: user.id, following_id: userId, status: 'pending' });
      setFollowStatus('pending');
      toast({ title: 'Follow request sent' });
    } else {
      await supabase.from('follows').delete().eq('follower_id', user.id).eq('following_id', userId);
      setFollowStatus(null);
      if (followStatus === 'accepted') setFollowerCount(c => c - 1);
      toast({ title: followStatus === 'accepted' ? 'Unfollowed' : 'Request cancelled' });
    }
  };

  if (loading) return <div className="py-20 text-center text-muted-foreground"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></div>;
  if (!profile) return <div className="py-20 text-center text-muted-foreground">User not found</div>;

  const avatarUrl = profile.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face';
  const coverUrl = profile.cover_url || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=400&fit=crop';

  return (
    <section className="py-20 lg:py-32 bg-background">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <button onClick={onBack} className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="w-5 h-5" /> Back
        </button>

        <div className="relative mb-12">
          <div className="h-48 sm:h-64 rounded-3xl overflow-hidden">
            <img src={coverUrl} alt="Cover" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent rounded-3xl" />
          </div>

          <div className="absolute -bottom-16 left-8 flex items-end gap-6">
            <div className="relative">
              <img src={avatarUrl} alt={profile.display_name} className="w-32 h-32 rounded-3xl object-cover border-4 border-background shadow-xl" />
              <div className="absolute -bottom-2 -right-2 w-10 h-10 gradient-primary rounded-full flex items-center justify-center shadow-lg">
                <BadgeCheck className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-20 grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground">{profile.display_name}</h1>
              {profile.location && (
                <div className="flex items-center gap-2 text-muted-foreground mt-2"><MapPin className="w-4 h-4" />{profile.location}</div>
              )}
              {profile.bio && <p className="text-foreground mt-4">{profile.bio}</p>}
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="travel-card p-6 text-center"><p className="text-3xl font-bold text-foreground">{postCount}</p><p className="text-muted-foreground">Posts</p></div>
              <div className="travel-card p-6 text-center"><p className="text-3xl font-bold text-foreground">{followerCount}</p><p className="text-muted-foreground">Followers</p></div>
              <div className="travel-card p-6 text-center"><p className="text-3xl font-bold text-foreground">{followingCount}</p><p className="text-muted-foreground">Following</p></div>
            </div>

            {user?.id !== userId && (
              <div className="flex gap-3">
                <Button onClick={handleFollow} className={`flex-1 h-12 rounded-xl font-semibold ${followStatus === 'accepted' ? 'bg-muted text-foreground' : 'gradient-primary text-primary-foreground'}`}>
                  {followStatus === 'accepted' ? <><UserCheck className="w-5 h-5 mr-2" />Following</> : followStatus === 'pending' ? <><UserPlus className="w-5 h-5 mr-2" />Requested</> : <><UserPlus className="w-5 h-5 mr-2" />Follow</>}
                </Button>
                {followStatus === 'accepted' && (
                  <Button onClick={onOpenMessages} variant="outline" className="flex-1 h-12 rounded-xl font-semibold border-2 border-primary text-primary">
                    <MessageCircle className="w-5 h-5 mr-2" />Message
                  </Button>
                )}
              </div>
            )}

            {(profile.interests || []).length > 0 && (
              <div className="travel-card p-6">
                <h4 className="font-semibold text-foreground mb-3">Interests</h4>
                <div className="flex flex-wrap gap-2">
                  {profile.interests.map((i: string) => <span key={i} className="chip chip-primary">{i}</span>)}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Posts</h3>
            {posts.length === 0 ? (
              <p className="text-sm text-muted-foreground">No posts yet.</p>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {posts.map(post => (
                  <div key={post.id} className="aspect-square rounded-xl overflow-hidden bg-muted">
                    {post.media_url ? (
                      post.media_url.match(/\.(mp4|webm|mov)$/i) ? (
                        <video src={post.media_url} className="w-full h-full object-cover" muted />
                      ) : (
                        <img src={post.media_url} alt="" className="w-full h-full object-cover" />
                      )
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground p-2 text-center">{post.caption?.slice(0, 60)}</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default UserProfileScreen;
