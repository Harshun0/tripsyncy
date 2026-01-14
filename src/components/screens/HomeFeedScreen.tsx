import React, { useState } from 'react';
import { Heart, MessageCircle, Bookmark, Share2, MoreHorizontal, MapPin, Bell } from 'lucide-react';
import { dummyPosts, TravelPost } from '@/data/dummyProfiles';

const HomeFeedScreen: React.FC = () => {
  const [posts, setPosts] = useState<TravelPost[]>(dummyPosts);

  const toggleLike = (postId: string) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, liked: !post.liked, likes: post.liked ? post.likes - 1 : post.likes + 1 }
        : post
    ));
  };

  const toggleSave = (postId: string) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, saved: !post.saved }
        : post
    ));
  };

  return (
    <div className="pb-4">
      {/* Header */}
      <div className="sticky top-0 z-30 glass-effect px-4 py-3 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gradient">TripSync</h1>
        <button className="w-10 h-10 rounded-full bg-muted flex items-center justify-center relative">
          <Bell className="w-5 h-5 text-foreground" />
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-secondary rounded-full text-[10px] text-white font-bold flex items-center justify-center">
            3
          </span>
        </button>
      </div>

      {/* Stories */}
      <div className="px-4 py-3">
        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
          {/* Add Story */}
          <div className="flex flex-col items-center gap-1 flex-shrink-0">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center border-2 border-dashed border-primary">
              <span className="text-2xl text-primary">+</span>
            </div>
            <span className="text-xs text-muted-foreground">Add Story</span>
          </div>
          
          {/* User Stories */}
          {['Priya', 'Arjun', 'Sneha', 'Vikram', 'Ananya'].map((name, i) => (
            <div key={i} className="flex flex-col items-center gap-1 flex-shrink-0">
              <div className="w-16 h-16 rounded-full p-0.5 gradient-primary">
                <img
                  src={`https://images.unsplash.com/photo-${1494790108377 + i * 1000}-be9c29b29330?w=100&h=100&fit=crop&crop=face`}
                  alt={name}
                  className="w-full h-full rounded-full object-cover border-2 border-background"
                />
              </div>
              <span className="text-xs text-foreground">{name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Feed Posts */}
      <div className="space-y-4">
        {posts.map((post) => (
          <article key={post.id} className="bg-card animate-fade-in">
            {/* Post Header */}
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3">
                <img
                  src={post.userAvatar}
                  alt={post.userName}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <h3 className="font-semibold text-sm text-foreground">{post.userName}</h3>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="w-3 h-3" />
                    {post.location}
                  </div>
                </div>
              </div>
              <button className="p-2">
                <MoreHorizontal className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            {/* Post Image */}
            <div className="relative aspect-[4/3] bg-muted">
              <img
                src={post.image}
                alt={post.caption}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Post Actions */}
            <div className="px-4 py-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => toggleLike(post.id)}
                    className="transition-transform active:scale-125"
                  >
                    <Heart 
                      className={`w-6 h-6 ${post.liked ? 'fill-destructive text-destructive' : 'text-foreground'}`} 
                    />
                  </button>
                  <button>
                    <MessageCircle className="w-6 h-6 text-foreground" />
                  </button>
                  <button>
                    <Share2 className="w-6 h-6 text-foreground" />
                  </button>
                </div>
                <button 
                  onClick={() => toggleSave(post.id)}
                  className="transition-transform active:scale-110"
                >
                  <Bookmark 
                    className={`w-6 h-6 ${post.saved ? 'fill-foreground text-foreground' : 'text-foreground'}`} 
                  />
                </button>
              </div>

              {/* Likes */}
              <p className="font-semibold text-sm">{post.likes.toLocaleString()} likes</p>

              {/* Caption */}
              <p className="text-sm">
                <span className="font-semibold">{post.userName}</span>{' '}
                <span className="text-foreground">{post.caption}</span>
              </p>

              {/* Comments */}
              <button className="text-sm text-muted-foreground">
                View all {post.comments} comments
              </button>

              {/* Timestamp */}
              <p className="text-xs text-muted-foreground uppercase">{post.timestamp}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

export default HomeFeedScreen;
