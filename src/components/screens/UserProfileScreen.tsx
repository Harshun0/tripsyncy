import React, { useEffect, useState } from 'react';
import { MapPin, BadgeCheck, UserPlus, UserCheck, MessageCircle, ArrowLeft, Loader2, Lock, Globe, Users } from 'lucide-react';
import FollowersModal from '@/components/modals/FollowersModal';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface UserProfileScreenProps {
  userId: string;
  onBack: () => void;
  onOpenMessages?: () => void;
  onViewUserProfile?: (userId: string) => void;
}

const UserProfileScreen: React.FC<UserProfileScreenProps> = ({ userId, onBack, onOpenMessages, onViewUserProfile }) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [followStatus, setFollowStatus] = useState<string | null>(null);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [postCount, setPostCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [canViewPosts, setCanViewPosts] = useState(true);
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [followersModalMode, setFollowersModalMode] = useState<'followers' | 'following'>('followers');
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [profileRes, followersRes, followingRes, followRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', userId).maybeSingle(),
        supabase.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', userId).eq('status', 'accepted'),
        supabase.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', userId).eq('status', 'accepted'),
        user ? supabase.from('follows').select('status').eq('follower_id', user.id).eq('following_id', userId).maybeSingle() : Promise.resolve({ data: null }),
      ]);

      const prof = profileRes.data;
      if (prof) setProfile(prof);
      setFollowerCount(followersRes.count || 0);
      setFollowingCount(followingRes.count || 0);
      const currentFollowStatus = (followRes.data as any)?.status || null;
      setFollowStatus(currentFollowStatus);

      // Determine if we can view posts
      const isOwner = user?.id === userId;
      const isPublic = prof?.profile_visibility === 'public' || !prof?.profile_visibility;
      const isAcceptedFollower = currentFollowStatus === 'accepted';
      const canView = isOwner || isPublic || isAcceptedFollower;
      setCanViewPosts(canView);

      if (canView) {
        const postsRes = await supabase
          .from('posts')
          .select('id,caption,media_url,location,created_at')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(30);
        setPosts(postsRes.data || []);
        setPostCount(postsRes.data?.length || 0);
      } else {
        // For private accounts, get count via a count query (RLS will filter)
        const countRes = await supabase
          .from('posts')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userId);
        setPostCount(countRes.count || 0);
        setPosts([]);
      }

      setLoading(false);
    };
    load();
  }, [userId, user]);

  const handleFollow = async () => {
    if (!user) return;
    if (!followStatus) {
      const isPublic = profile?.profile_visibility === 'public' || !profile?.profile_visibility;
      const newStatus = isPublic ? 'accepted' : 'pending';
      await supabase.from('follows').insert({ follower_id: user.id, following_id: userId, status: newStatus });
      setFollowStatus(newStatus);
      if (newStatus === 'accepted') {
        setFollowerCount(c => c + 1);
        toast({ title: `Following ${profile?.display_name}` });
        // Reload posts since we can now see them
        const postsRes = await supabase
          .from('posts')
          .select('id,caption,media_url,location,created_at')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(30);
        setPosts(postsRes.data || []);
        setPostCount(postsRes.data?.length || 0);
        setCanViewPosts(true);
      } else {
        toast({ title: 'Follow request sent 📩' });
      }
    } else {
      await supabase.from('follows').delete().eq('follower_id', user.id).eq('following_id', userId);
      if (followStatus === 'accepted') {
        setFollowerCount(c => c - 1);
        // If private account, hide posts again
        const isPublic = profile?.profile_visibility === 'public' || !profile?.profile_visibility;
        if (!isPublic) {
          setCanViewPosts(false);
          setPosts([]);
        }
      }
      setFollowStatus(null);
      toast({ title: followStatus === 'accepted' ? 'Unfollowed' : 'Request cancelled' });
    }
  };

  if (loading) return <div className="py-20 text-center text-muted-foreground"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></div>;
  if (!profile) return <div className="py-20 text-center text-muted-foreground">User not found</div>;

  const avatarUrl = profile.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face';
  const coverUrl = profile.cover_url || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=400&fit=crop';
  const isPrivate = profile.profile_visibility === 'private' || profile.profile_visibility === 'friends';
  const isPublic = !isPrivate;

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
                {isPrivate ? <Lock className="w-5 h-5 text-white" /> : <BadgeCheck className="w-6 h-6 text-white" />}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-20 grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-foreground">{profile.display_name}</h1>
                {isPrivate && (
                  <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-muted text-xs font-medium text-muted-foreground">
                    <Lock className="w-3 h-3" /> Private
                  </span>
                )}
                {isPublic && (
                  <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-xs font-medium text-primary">
                    <Globe className="w-3 h-3" /> Public
                  </span>
                )}
              </div>
              {profile.location && (
                <div className="flex items-center gap-2 text-muted-foreground mt-2"><MapPin className="w-4 h-4" />{profile.location}</div>
              )}
              {profile.bio && <p className="text-foreground mt-4">{profile.bio}</p>}
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="travel-card p-6 text-center"><p className="text-3xl font-bold text-foreground">{postCount}</p><p className="text-muted-foreground">Posts</p></div>
              <button onClick={() => { setFollowersModalMode('followers'); setShowFollowersModal(true); }} className="travel-card p-6 text-center hover:shadow-lg transition-shadow cursor-pointer"><p className="text-3xl font-bold text-foreground">{followerCount}</p><p className="text-muted-foreground">Followers</p></button>
              <button onClick={() => { setFollowersModalMode('following'); setShowFollowersModal(true); }} className="travel-card p-6 text-center hover:shadow-lg transition-shadow cursor-pointer"><p className="text-3xl font-bold text-foreground">{followingCount}</p><p className="text-muted-foreground">Following</p></button>
            </div>

            {user?.id !== userId && (
              <div className="flex gap-3">
                <Button onClick={handleFollow} className={`flex-1 h-12 rounded-xl font-semibold ${followStatus === 'accepted' ? 'bg-muted text-foreground' : 'gradient-primary text-primary-foreground'}`}>
                  {followStatus === 'accepted' ? <><UserCheck className="w-5 h-5 mr-2" />Following</> : followStatus === 'pending' ? <><UserPlus className="w-5 h-5 mr-2" />Requested</> : <><UserPlus className="w-5 h-5 mr-2" />{isPrivate ? 'Request to Follow' : 'Follow'}</>}
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
            
            {!canViewPosts ? (
              <div className="travel-card p-8 text-center space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center">
                  <Lock className="w-8 h-8 text-muted-foreground" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">This Account is Private</h4>
                  <p className="text-sm text-muted-foreground">
                    Follow this account to see their photos and posts.
                  </p>
                </div>
                {!followStatus && user?.id !== userId && (
                  <Button onClick={handleFollow} className="gradient-primary text-primary-foreground rounded-xl px-8">
                    <UserPlus className="w-4 h-4 mr-2" />Request to Follow
                  </Button>
                )}
                {followStatus === 'pending' && (
                  <p className="text-sm text-muted-foreground flex items-center justify-center gap-2">
                    <Users className="w-4 h-4" /> Follow request pending
                  </p>
                )}
              </div>
            ) : posts.length === 0 ? (
              <p className="text-sm text-muted-foreground">No posts yet.</p>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {posts.map(post => {
                  const firstMedia = post.media_url ? post.media_url.split(',')[0].trim() : null;
                  return (
                    <div key={post.id} className="aspect-square rounded-xl overflow-hidden bg-muted">
                      {firstMedia ? (
                        firstMedia.match(/\.(mp4|webm|mov)$/i) ? (
                          <video src={firstMedia} className="w-full h-full object-cover" muted />
                        ) : (
                          <img src={firstMedia} alt="" className="w-full h-full object-cover" />
                        )
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground p-2 text-center">{post.caption?.slice(0, 60)}</div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
      <FollowersModal
        isOpen={showFollowersModal}
        onClose={() => setShowFollowersModal(false)}
        userId={userId}
        mode={followersModalMode}
        onViewProfile={(id) => { setShowFollowersModal(false); onViewUserProfile?.(id); }}
      />
    </section>
  );
};

export default UserProfileScreen;
