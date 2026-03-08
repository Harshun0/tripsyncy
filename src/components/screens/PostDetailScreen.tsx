import React, { useEffect, useState, useCallback } from 'react';
import { ArrowLeft, Heart, MessageCircle, Bookmark, Share2, Send, MapPin, Calendar, ChevronLeft, ChevronRight, BadgeCheck, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  profiles?: { display_name: string; avatar_url: string | null } | null;
}

interface PostDetailScreenProps {
  postId: string;
  onBack: () => void;
  onViewUserProfile?: (userId: string) => void;
}

const PostDetailScreen: React.FC<PostDetailScreenProps> = ({ postId, onBack, onViewUserProfile }) => {
  const { user } = useAuth();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [saved, setSaved] = useState(false);
  const [mediaIdx, setMediaIdx] = useState(0);

  const getMediaUrls = (url: string): string[] => {
    if (!url) return [];
    return url.split(',').map(u => u.trim()).filter(Boolean);
  };
  const isVideo = (url: string) => /\.(mp4|webm|mov|ogg)$/i.test(url);

  const loadPost = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('posts')
      .select('id,user_id,caption,media_url,location,created_at,profiles!posts_user_id_fkey(display_name,avatar_url)')
      .eq('id', postId)
      .single();
    if (data) setPost(data);

    const [likesRes, commentsRes, savedRes] = await Promise.all([
      supabase.from('post_likes').select('user_id').eq('post_id', postId),
      supabase.from('post_comments').select('id,content,created_at,user_id,profiles!post_comments_user_id_fkey(display_name,avatar_url)').eq('post_id', postId).order('created_at', { ascending: true }),
      user ? supabase.from('saved_posts').select('id').eq('post_id', postId).eq('user_id', user.id) : { data: [] },
    ]);

    const likes = (likesRes.data || []) as any[];
    setLikeCount(likes.length);
    setLiked(!!likes.find((l: any) => l.user_id === user?.id));
    setComments((commentsRes.data || []) as any[]);
    setSaved(((savedRes as any).data || []).length > 0);
    setLoading(false);
  }, [postId, user]);

  useEffect(() => { loadPost(); }, [loadPost]);

  const toggleLike = async () => {
    if (!user) return;
    if (liked) {
      await supabase.from('post_likes').delete().eq('post_id', postId).eq('user_id', user.id);
      setLiked(false);
      setLikeCount(c => c - 1);
    } else {
      await supabase.from('post_likes').insert({ post_id: postId, user_id: user.id });
      setLiked(true);
      setLikeCount(c => c + 1);
    }
  };

  const toggleSave = async () => {
    if (!user) return;
    if (saved) {
      await supabase.from('saved_posts').delete().eq('post_id', postId).eq('user_id', user.id);
      setSaved(false);
      toast({ title: 'Removed from saved' });
    } else {
      await supabase.from('saved_posts').insert({ post_id: postId, user_id: user.id });
      setSaved(true);
      toast({ title: 'Post saved! 🔖' });
    }
  };

  const handleComment = async () => {
    if (!user || !commentText.trim()) return;
    const { error } = await supabase.from('post_comments').insert({ post_id: postId, user_id: user.id, content: commentText.trim() });
    if (error) { toast({ title: 'Comment failed', variant: 'destructive' }); return; }
    setCommentText('');
    toast({ title: 'Comment added! 💬' });
    // Reload comments
    const { data } = await supabase.from('post_comments').select('id,content,created_at,user_id,profiles!post_comments_user_id_fkey(display_name,avatar_url)').eq('post_id', postId).order('created_at', { ascending: true });
    setComments((data || []) as any[]);
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  if (!post) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10 text-center">
        <p className="text-muted-foreground">Post not found.</p>
        <Button variant="ghost" onClick={onBack} className="mt-4"><ArrowLeft className="w-4 h-4 mr-2" />Go back</Button>
      </div>
    );
  }

  const prof = post.profiles as any;
  const name = prof?.display_name || 'Traveler';
  const avatar = prof?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face';
  const urls = getMediaUrls(post.media_url || '');

  return (
    <div className="max-w-3xl mx-auto px-4 pb-10">
      {/* Back button */}
      <button onClick={onBack} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors py-4">
        <ArrowLeft className="w-5 h-5" />
        <span className="text-sm font-medium">Back to feed</span>
      </button>

      <article className="bg-card rounded-3xl overflow-hidden shadow-xl">
        {/* User header */}
        <div className="flex items-center gap-3 px-6 py-4 cursor-pointer" onClick={() => onViewUserProfile?.(post.user_id)}>
          <img src={avatar} alt={name} className="w-12 h-12 rounded-full object-cover" />
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-semibold text-foreground hover:text-primary transition-colors">{name}</h3>
              <BadgeCheck className="w-4 h-4 text-primary" />
            </div>
            {post.location && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground"><MapPin className="w-3 h-3" />{post.location}</div>
            )}
          </div>
        </div>

        {/* Media */}
        {urls.length > 0 && (
          <div className="relative bg-muted group">
            {isVideo(urls[mediaIdx]) ? (
              <video src={urls[mediaIdx]} controls className="w-full max-h-[70vh] object-contain bg-black" />
            ) : (
              <img src={urls[mediaIdx]} alt={post.caption || ''} className="w-full max-h-[70vh] object-contain bg-black" />
            )}
            {urls.length > 1 && (
              <>
                <button onClick={() => setMediaIdx((mediaIdx - 1 + urls.length) % urls.length)} className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-background/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button onClick={() => setMediaIdx((mediaIdx + 1) % urls.length)} className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-background/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <ChevronRight className="w-5 h-5" />
                </button>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {urls.map((_, i) => <span key={i} className={`w-2.5 h-2.5 rounded-full transition-colors ${i === mediaIdx ? 'bg-primary' : 'bg-background/60'}`} />)}
                </div>
              </>
            )}
          </div>
        )}

        {/* Actions & caption */}
        <div className="px-6 py-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-5">
              <button onClick={toggleLike} className="flex items-center gap-2 transition-transform hover:scale-105 active:scale-95">
                <Heart className={`w-7 h-7 ${liked ? 'fill-destructive text-destructive' : 'text-foreground'}`} />
                <span className="font-semibold">{likeCount.toLocaleString()}</span>
              </button>
              <div className="flex items-center gap-2 text-foreground">
                <MessageCircle className="w-7 h-7" />
                <span className="font-semibold">{comments.length}</span>
              </div>
            </div>
            <button onClick={toggleSave} className="transition-transform hover:scale-105">
              <Bookmark className={`w-7 h-7 ${saved ? 'fill-foreground text-foreground' : 'text-foreground'}`} />
            </button>
          </div>

          {post.caption && (
            <p className="text-foreground text-base leading-relaxed">
              <span className="font-semibold">{name}</span>{' '}{post.caption}
            </p>
          )}

          <p className="text-sm text-muted-foreground flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })} · {new Date(post.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </p>
        </div>

        {/* Comments */}
        <div className="border-t border-border px-6 py-5 space-y-4">
          <h4 className="font-semibold text-foreground">Comments ({comments.length})</h4>

          {comments.length === 0 && (
            <p className="text-sm text-muted-foreground">No comments yet. Be the first!</p>
          )}

          <div className="space-y-3 max-h-80 overflow-y-auto">
            {comments.map(c => {
              const cp = c.profiles as any;
              return (
                <div key={c.id} className="flex gap-3">
                  <img src={cp?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face'} alt="" className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                  <div className="bg-muted rounded-2xl px-4 py-2.5 flex-1">
                    <p className="text-sm"><span className="font-semibold">{cp?.display_name || 'Traveler'}</span>{' '}{c.content}</p>
                    <p className="text-xs text-muted-foreground mt-1">{formatDistanceToNow(new Date(c.created_at), { addSuffix: true })}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {user && (
            <div className="flex gap-2 pt-2">
              <input
                type="text"
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleComment()}
                placeholder="Add a comment..."
                className="flex-1 h-10 px-4 bg-muted rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <Button onClick={handleComment} size="sm" className="h-10 w-10 p-0 rounded-full gradient-primary">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </article>
    </div>
  );
};

export default PostDetailScreen;
