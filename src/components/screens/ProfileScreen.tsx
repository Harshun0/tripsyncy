import React from 'react';
import { Settings, Edit2, MapPin, BadgeCheck, Award, Wallet, Heart, Mountain, Utensils, Compass, Sunrise, Camera, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ProfileScreen: React.FC = () => {
  const userProfile = {
    name: 'You',
    displayName: 'Traveler',
    age: 25,
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face',
    location: 'Mumbai, India',
    bio: 'Exploring the world one trip at a time ✈️ | Budget traveler | Coffee lover ☕',
    budget: 'Mid-Range',
    personality: 'Ambivert',
    interests: ['Adventure', 'Food', 'Culture', 'Nature', 'Photography'],
    badges: ['Verified Traveler', 'Solo Explorer', 'Budget Pro'],
    verified: true,
    trips: 12,
    followers: 456,
    following: 234,
  };

  const interestIcons: Record<string, React.ElementType> = {
    Adventure: Mountain,
    Food: Utensils,
    Culture: Compass,
    Nature: Sunrise,
    Photography: Camera,
    Spirituality: Heart,
  };

  return (
    <div className="pb-4">
      {/* Header */}
      <div className="sticky top-0 z-30 glass-effect px-4 py-3 flex items-center justify-between">
        <h1 className="text-xl font-bold text-foreground font-display">Profile</h1>
        <button className="w-10 h-10 rounded-full bg-card border border-border/50 flex items-center justify-center shadow-sm hover:shadow-md transition-shadow">
          <Settings className="w-5 h-5 text-foreground" />
        </button>
      </div>

      {/* Profile Header */}
      <div className="px-4 pt-4">
        <div className="relative">
          {/* Cover Gradient */}
          <div className="h-28 gradient-primary rounded-3xl relative overflow-hidden">
            <div className="absolute inset-0 pattern-dots opacity-15" />
            <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-primary-foreground/10 rounded-full blur-2xl" />
            <div className="absolute -top-4 -left-4 w-24 h-24 bg-accent/20 rounded-full blur-2xl" />
          </div>
          
          {/* Avatar */}
          <div className="absolute -bottom-12 left-4">
            <div className="relative">
              <div className="p-[3px] bg-background rounded-2xl shadow-lg">
                <div className="p-[2px] gradient-primary rounded-[14px]">
                  <img
                    src={userProfile.avatar}
                    alt={userProfile.displayName}
                    className="w-24 h-24 rounded-xl object-cover border-[3px] border-background"
                  />
                </div>
              </div>
              {userProfile.verified && (
                <div className="absolute -bottom-1 -right-1 w-7 h-7 gradient-primary rounded-xl flex items-center justify-center shadow-md">
                  <BadgeCheck className="w-4 h-4 text-primary-foreground" />
                </div>
              )}
            </div>
          </div>
          
          {/* Edit Button */}
          <button className="absolute bottom-2 right-2 w-10 h-10 bg-card rounded-xl shadow-md flex items-center justify-center border border-border/30 hover:shadow-lg transition-shadow">
            <Edit2 className="w-4 h-4 text-primary" />
          </button>
        </div>

        {/* Name & Location */}
        <div className="mt-14 mb-4">
          <h2 className="text-xl font-bold text-foreground font-display">{userProfile.displayName}, {userProfile.age}</h2>
          <div className="flex items-center gap-1.5 text-muted-foreground mt-1">
            <MapPin className="w-4 h-4 text-primary" />
            <span className="text-sm">{userProfile.location}</span>
          </div>
          <p className="text-sm text-foreground/80 mt-2 leading-relaxed">{userProfile.bio}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: userProfile.trips, label: 'Trips', color: 'from-primary/10 to-primary/5' },
            { value: userProfile.followers, label: 'Followers', color: 'from-secondary/10 to-secondary/5' },
            { value: userProfile.following, label: 'Following', color: 'from-accent/10 to-accent/5' },
          ].map((stat) => (
            <div key={stat.label} className={`text-center p-4 bg-gradient-to-br ${stat.color} rounded-2xl border border-border/30`}>
              <p className="text-2xl font-bold text-foreground font-display">{stat.value}</p>
              <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Travel Preferences */}
      <div className="px-4 mt-6 space-y-4">
        <h3 className="text-lg font-semibold text-foreground font-display">Travel Preferences</h3>
        
        {/* Budget & Personality */}
        <div className="grid grid-cols-2 gap-3">
          <div className="travel-card-nature">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center">
                <Wallet className="w-4 h-4 text-primary" />
              </div>
              <span className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Budget</span>
            </div>
            <p className="font-semibold text-foreground">{userProfile.budget}</p>
          </div>
          <div className="travel-card-nature">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-secondary/10 rounded-xl flex items-center justify-center">
                <Heart className="w-4 h-4 text-secondary" />
              </div>
              <span className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Personality</span>
            </div>
            <p className="font-semibold text-foreground">{userProfile.personality}</p>
          </div>
        </div>

        {/* Interests */}
        <div className="travel-card-nature">
          <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            Interests
          </h4>
          <div className="flex flex-wrap gap-2">
            {userProfile.interests.map((interest) => {
              const Icon = interestIcons[interest] || Compass;
              return (
                <div key={interest} className="flex items-center gap-1.5 px-3 py-2 bg-primary/8 rounded-xl text-sm font-medium text-primary border border-primary/10">
                  <Icon className="w-4 h-4" />
                  {interest}
                </div>
              );
            })}
          </div>
        </div>

        {/* Badges */}
        <div className="travel-card-nature">
          <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
            <Award className="w-4 h-4 text-secondary" />
            Travel Badges
          </h4>
          <div className="flex flex-wrap gap-2">
            {userProfile.badges.map((badge, index) => (
              <div 
                key={index} 
                className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-primary/8 to-accent/8 rounded-xl border border-primary/10"
              >
                <Award className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-foreground">{badge}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <Button className="flex-1 h-12 gradient-primary text-primary-foreground rounded-2xl font-semibold shadow-glow hover:shadow-xl transition-shadow">
            Edit Profile
          </Button>
          <Button variant="outline" className="flex-1 h-12 rounded-2xl font-semibold border-2 border-primary text-primary hover:bg-primary/5 transition-colors">
            Share Profile
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProfileScreen;
