import React from 'react';
import { Settings, Edit2, MapPin, BadgeCheck, Award, Wallet, Heart, Mountain, Utensils, Compass, Sunrise, Camera } from 'lucide-react';
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
        <h1 className="text-xl font-bold text-foreground">Profile</h1>
        <button className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
          <Settings className="w-5 h-5 text-foreground" />
        </button>
      </div>

      {/* Profile Header */}
      <div className="px-4 pt-4">
        <div className="relative">
          {/* Cover Gradient */}
          <div className="h-24 gradient-primary rounded-2xl" />
          
          {/* Avatar */}
          <div className="absolute -bottom-12 left-4">
            <div className="relative">
              <img
                src={userProfile.avatar}
                alt={userProfile.displayName}
                className="w-24 h-24 rounded-2xl object-cover border-4 border-background shadow-lg"
              />
              {userProfile.verified && (
                <div className="absolute -bottom-1 -right-1 w-7 h-7 gradient-primary rounded-full flex items-center justify-center shadow-md">
                  <BadgeCheck className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
          </div>
          
          {/* Edit Button */}
          <button className="absolute bottom-2 right-2 w-10 h-10 bg-background rounded-full shadow-md flex items-center justify-center">
            <Edit2 className="w-4 h-4 text-primary" />
          </button>
        </div>

        {/* Name & Location */}
        <div className="mt-14 mb-4">
          <h2 className="text-xl font-bold text-foreground">{userProfile.displayName}, {userProfile.age}</h2>
          <div className="flex items-center gap-1 text-muted-foreground mt-1">
            <MapPin className="w-4 h-4" />
            <span className="text-sm">{userProfile.location}</span>
          </div>
          <p className="text-sm text-foreground mt-2">{userProfile.bio}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-2xl">
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">{userProfile.trips}</p>
            <p className="text-xs text-muted-foreground">Trips</p>
          </div>
          <div className="text-center border-x border-border">
            <p className="text-2xl font-bold text-foreground">{userProfile.followers}</p>
            <p className="text-xs text-muted-foreground">Followers</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">{userProfile.following}</p>
            <p className="text-xs text-muted-foreground">Following</p>
          </div>
        </div>
      </div>

      {/* Travel Preferences */}
      <div className="px-4 mt-6 space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Travel Preferences</h3>
        
        {/* Budget & Personality */}
        <div className="grid grid-cols-2 gap-3">
          <div className="travel-card">
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="w-5 h-5 text-primary" />
              <span className="text-sm text-muted-foreground">Budget</span>
            </div>
            <p className="font-semibold text-foreground">{userProfile.budget}</p>
          </div>
          <div className="travel-card">
            <div className="flex items-center gap-2 mb-2">
              <Heart className="w-5 h-5 text-secondary" />
              <span className="text-sm text-muted-foreground">Personality</span>
            </div>
            <p className="font-semibold text-foreground">{userProfile.personality}</p>
          </div>
        </div>

        {/* Interests */}
        <div className="travel-card">
          <h4 className="font-medium text-foreground mb-3">Interests</h4>
          <div className="flex flex-wrap gap-2">
            {userProfile.interests.map((interest) => {
              const Icon = interestIcons[interest] || Compass;
              return (
                <div key={interest} className="chip chip-primary flex items-center gap-1.5">
                  <Icon className="w-4 h-4" />
                  {interest}
                </div>
              );
            })}
          </div>
        </div>

        {/* Badges */}
        <div className="travel-card">
          <h4 className="font-medium text-foreground mb-3">Travel Badges</h4>
          <div className="flex flex-wrap gap-2">
            {userProfile.badges.map((badge, index) => (
              <div 
                key={index} 
                className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl"
              >
                <Award className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-foreground">{badge}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <Button className="flex-1 h-12 gradient-primary text-primary-foreground rounded-xl font-semibold">
            Edit Profile
          </Button>
          <Button variant="outline" className="flex-1 h-12 rounded-xl font-semibold border-2 border-primary text-primary">
            Share Profile
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProfileScreen;
