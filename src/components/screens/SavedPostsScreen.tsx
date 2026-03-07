import React, { useEffect, useState } from 'react';
import { ArrowLeft, Bookmark, Heart, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface SavedPostsScreenProps {
  onBack: () => void;
  mode: 'saved' | 'liked';
}

const SavedPostsScreen: React.FC<SavedPostsScreenProps> = ({ onBack, mode }) => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      setLoading(true);

      if (mode === 'saved') {
        const { data } = await supabase
          .from('saved_posts')
          .select('post_id, posts!saved_posts_post_id_fkey(id,caption,media_url,location,created_at,profiles!posts_user_id_fkey(display_name,avatar_url))')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(50);

        setPosts((data || []).map((d: any) => d.posts).filter(Boolean));
      } else {
        const { data } = await supabase
          .from('post_likes')
          .select('post_id, posts!post_likes_post_id_fkey(id,caption,media_url,location,created_at,profiles!posts_user_id_fkey(display_name,avatar_url))')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(50);

        setPosts((data || []).map((d: any) => d.posts).filter(Boolean));
      }

      setLoading(false);
    };
    load();
  }, [user, mode]);

  const title = mode === 'saved' ? 'Saved Posts' : 'Liked Posts';
  const Icon = mode === 'saved' ? Bookmark : Heart;

  return (
    <section className="py-20 lg:py-32 bg-background">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <button onClick={onBack} className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="w-5 h-5" /> Back
        </button>

        <div className="flex items-center gap-3 mb-8">
          <Icon className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">{title}</h2>
        </div>

        {loading ? (
          <div className="text-center py-12"><Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" /></div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">No {mode} posts yet.</div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {posts.map((post: any) => (
              <div key={post.id} className="travel-card overflow-hidden">
                {post.media_url && (
                  <div className="aspect-video bg-muted">
                    {post.media_url.match(/\.(mp4|webm|mov)$/i) ? (
                      <video src={post.media_url} className="w-full h-full object-cover" muted />
                    ) : (
                      <img src={post.media_url} alt="" className="w-full h-full object-cover" />
                    )}
                  </div>
                )}
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <img src={post.profiles?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=50&h=50&fit=crop&crop=face'} alt="" className="w-6 h-6 rounded-full object-cover" />
                    <span className="text-sm font-medium text-foreground">{post.profiles?.display_name || 'Traveler'}</span>
                  </div>
                  {post.caption && <p className="text-sm text-foreground line-clamp-2">{post.caption}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default SavedPostsScreen;
