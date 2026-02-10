import React, { useState } from 'react';
import { Heart, MessageCircle, Bookmark, Share2, MapPin, TrendingUp, UserPlus, UserCheck, Send, X, Copy, Facebook, Twitter, Link2 } from 'lucide-react';
import { dummyPosts, dummyProfiles, TravelPost } from '@/data/dummyProfiles';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

interface FeedSectionProps {
  onLikePost?: (postId: string, liked: boolean) => void;
  onCommentPost?: (postId: string, comment: string) => void;
  onSavePost?: (postId: string, saved: boolean) => void;
}

const FeedSection: React.FC<FeedSectionProps> = ({ onLikePost, onCommentPost, onSavePost }) => {
  const [posts, setPosts] = useState<TravelPost[]>(dummyPosts);
  const [followedUsers, setFollowedUsers] = useState<Set<string>>(new Set());
  const [commentingOn, setCommentingOn] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [postComments, setPostComments] = useState<Record<string, { user: string; text: string }[]>>({});
  const [shareMenuOpen, setShareMenuOpen] = useState<string | null>(null);

  const toggleLike = (postId: string) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        const newLiked = !post.liked;
        onLikePost?.(postId, newLiked);
        if (newLiked) toast({ title: 'Post liked! ❤️' });
        return { ...post, liked: newLiked, likes: newLiked ? post.likes + 1 : post.likes - 1 };
      }
      return post;
    }));
  };

  const toggleSave = (postId: string) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        const newSaved = !post.saved;
        onSavePost?.(postId, newSaved);
        toast({ title: newSaved ? 'Post saved! 🔖' : 'Removed from saved' });
        return { ...post, saved: newSaved };
      }
      return post;
    }));
  };

  const handleFollow = (userId: string, userName: string) => {
    setFollowedUsers(prev => {
      const next = new Set(prev);
      if (next.has(userId)) {
        next.delete(userId);
        toast({ title: `Unfollowed ${userName}` });
      } else {
        next.add(userId);
        toast({ title: `Following ${userName}! 🎉` });
      }
      return next;
    });
  };

  const handleShare = (post: TravelPost, method: string) => {
    const shareText = `${post.userName} on TripSync: ${post.caption}`;
    const shareUrl = window.location.href;

    switch (method) {
      case 'copy':
        navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
        toast({ title: 'Link copied to clipboard! 📋' });
        break;
      case 'followers':
        toast({ title: 'Shared with followers! 📢', description: 'Your followers will see this in their feed.' });
        break;
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(shareText + '\n' + shareUrl)}`, '_blank');
        toast({ title: 'Opening WhatsApp... 💬' });
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, '_blank');
        toast({ title: 'Opening Twitter... 🐦' });
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
        toast({ title: 'Opening Facebook... 📘' });
        break;
      case 'telegram':
        window.open(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`, '_blank');
        toast({ title: 'Opening Telegram... ✈️' });
        break;
      case 'native':
        if (navigator.share) {
          navigator.share({ title: `${post.userName} on TripSync`, text: post.caption, url: shareUrl });
        } else {
          navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
          toast({ title: 'Link copied to clipboard! 📋' });
        }
        break;
    }
    setShareMenuOpen(null);
  };

  const handleComment = (postId: string) => {
    if (!commentText.trim()) return;
    setPostComments(prev => ({
      ...prev,
      [postId]: [...(prev[postId] || []), { user: 'You', text: commentText }],
    }));
    setPosts(posts.map(p => p.id === postId ? { ...p, comments: p.comments + 1 } : p));
    onCommentPost?.(postId, commentText);
    setCommentText('');
    toast({ title: 'Comment added! 💬' });
  };

  return (
    <section className="py-20 lg:py-32 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Travel <span className="text-gradient">Stories</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Discover experiences from fellow travelers. Get inspired for your next adventure.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {posts.map((post) => (
              <article key={post.id} className="bg-card rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between px-6 py-4">
                  <div className="flex items-center gap-3">
                    <img src={post.userAvatar} alt={post.userName} className="w-12 h-12 rounded-full object-cover" />
                    <div>
                      <h3 className="font-semibold text-foreground">{post.userName}</h3>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="w-3 h-3" />
                        {post.location}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleFollow(post.userId, post.userName)}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                        followedUsers.has(post.userId)
                          ? 'bg-muted text-foreground'
                          : 'gradient-primary text-white'
                      }`}
                    >
                      {followedUsers.has(post.userId) ? (
                        <><UserCheck className="w-3 h-3" /> Following</>
                      ) : (
                        <><UserPlus className="w-3 h-3" /> Follow</>
                      )}
                    </button>
                  </div>
                </div>

                <div className="relative aspect-[16/10]">
                  <img src={post.image} alt={post.caption} className="w-full h-full object-cover" />
                </div>

                <div className="px-6 py-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => toggleLike(post.id)}
                        className="flex items-center gap-2 transition-transform hover:scale-105 active:scale-95"
                      >
                        <Heart className={`w-6 h-6 ${post.liked ? 'fill-destructive text-destructive' : 'text-foreground'}`} />
                        <span className="font-medium text-sm">{post.likes.toLocaleString()}</span>
                      </button>
                      <button
                        onClick={() => setCommentingOn(commentingOn === post.id ? null : post.id)}
                        className="flex items-center gap-2 hover:text-primary transition-colors"
                      >
                        <MessageCircle className="w-6 h-6" />
                        <span className="font-medium text-sm">{post.comments}</span>
                      </button>
                      <div className="relative">
                        <button 
                          onClick={() => setShareMenuOpen(shareMenuOpen === post.id ? null : post.id)} 
                          className="hover:text-primary transition-colors"
                        >
                          <Share2 className="w-6 h-6" />
                        </button>
                        {shareMenuOpen === post.id && (
                          <div className="absolute bottom-full left-0 mb-2 w-56 bg-background border border-border rounded-2xl shadow-xl z-50 animate-fade-in overflow-hidden">
                            <div className="p-2">
                              <button onClick={() => handleShare(post, 'followers')} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm hover:bg-muted transition-colors">
                                <UserPlus className="w-4 h-4 text-primary" />
                                Share with Followers
                              </button>
                              <button onClick={() => handleShare(post, 'whatsapp')} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm hover:bg-muted transition-colors">
                                <Send className="w-4 h-4 text-green-500" />
                                WhatsApp
                              </button>
                              <button onClick={() => handleShare(post, 'twitter')} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm hover:bg-muted transition-colors">
                                <Twitter className="w-4 h-4 text-sky-500" />
                                Twitter / X
                              </button>
                              <button onClick={() => handleShare(post, 'facebook')} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm hover:bg-muted transition-colors">
                                <Facebook className="w-4 h-4 text-blue-600" />
                                Facebook
                              </button>
                              <button onClick={() => handleShare(post, 'telegram')} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm hover:bg-muted transition-colors">
                                <Send className="w-4 h-4 text-sky-400" />
                                Telegram
                              </button>
                              <button onClick={() => handleShare(post, 'copy')} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm hover:bg-muted transition-colors">
                                <Copy className="w-4 h-4 text-muted-foreground" />
                                Copy Link
                              </button>
                              {typeof navigator.share === 'function' && (
                                <button onClick={() => handleShare(post, 'native')} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm hover:bg-muted transition-colors">
                                  <Link2 className="w-4 h-4 text-muted-foreground" />
                                  More Options...
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => toggleSave(post.id)}
                      className="transition-transform hover:scale-105"
                    >
                      <Bookmark className={`w-6 h-6 ${post.saved ? 'fill-foreground text-foreground' : 'text-foreground'}`} />
                    </button>
                  </div>

                  <p className="text-foreground">
                    <span className="font-semibold">{post.userName}</span>{' '}{post.caption}
                  </p>

                  {commentingOn === post.id && (
                    <div className="space-y-2 pt-2 border-t border-border animate-fade-in">
                      {(postComments[post.id] || []).map((c, i) => (
                        <p key={i} className="text-sm"><span className="font-semibold">{c.user}</span> {c.text}</p>
                      ))}
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleComment(post.id)}
                          placeholder="Add a comment..."
                          className="flex-1 h-9 px-3 bg-muted rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                        <Button onClick={() => handleComment(post.id)} size="sm" className="h-9 w-9 p-0 rounded-full gradient-primary">
                          <Send className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}

                  <p className="text-xs text-muted-foreground uppercase">{post.timestamp}</p>
                </div>
              </article>
            ))}
          </div>

          <div className="space-y-6">
            <div className="bg-card rounded-3xl p-6 shadow-lg">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-foreground">Trending Destinations</h3>
              </div>
              <div className="space-y-3">
                {['Goa', 'Ladakh', 'Rishikesh', 'Hampi', 'Kerala'].map((place, i) => (
                  <div key={place} className="flex items-center justify-between p-3 bg-muted/50 rounded-xl hover:bg-muted transition-colors cursor-pointer">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-xs font-bold text-primary">
                        {i + 1}
                      </span>
                      <span className="font-medium text-foreground">{place}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{[342, 287, 198, 156, 423][i]} posts</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-card rounded-3xl p-6 shadow-lg">
              <h3 className="font-semibold text-foreground mb-4">Suggested Travelers</h3>
              <div className="space-y-4">
                {dummyProfiles.slice(0, 3).map((profile) => (
                  <div key={profile.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img src={profile.avatar} alt={profile.name} className="w-10 h-10 rounded-full object-cover" />
                      <div>
                        <p className="font-medium text-foreground text-sm">{profile.name}</p>
                        <p className="text-xs text-muted-foreground">{profile.interests[0]} • {profile.interests[1]}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleFollow(profile.id, profile.name)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all ${
                        followedUsers.has(profile.id)
                          ? 'bg-muted text-foreground'
                          : 'gradient-primary text-white'
                      }`}
                    >
                      {followedUsers.has(profile.id) ? 'Following' : 'Follow'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeedSection;
