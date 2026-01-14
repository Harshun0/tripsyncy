import React from 'react';
import { Settings, Edit2, MapPin, BadgeCheck, Award, Wallet, Heart, Mountain, Utensils, Compass, Sunrise, Camera, Share2, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ProfileSection: React.FC = () => {
  const userProfile = {
    name: 'You',
    displayName: 'Traveler',
    age: 25,
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face',
    coverImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=400&fit=crop',
    location: 'Mumbai, India',
    bio: 'Exploring the world one trip at a time ✈️ | Budget traveler | Coffee lover ☕',
    budget: 'Mid-Range',
    personality: 'Ambivert',
    interests: ['Adventure', 'Food', 'Culture', 'Nature', 'Photography'],
    badges: ['Verified Traveler', 'Solo Explorer', 'Budget Pro', 'Mountain Master'],
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

  const recentTrips = [
    { destination: 'Goa', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=300&h=200&fit=crop', date: 'Dec 2024' },
    { destination: 'Ladakh', image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=200&fit=crop', date: 'Oct 2024' },
    { destination: 'Rishikesh', image: 'https://images.unsplash.com/photo-1545158535-c3f7168c28b6?w=300&h=200&fit=crop', date: 'Sep 2024' },
  ];

  return (
    <section className="py-20 lg:py-32 bg-background">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className="relative mb-12">
          {/* Cover Image */}
          <div className="h-48 sm:h-64 rounded-3xl overflow-hidden">
            <img
              src={userProfile.coverImage}
              alt="Cover"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent rounded-3xl" />
          </div>
          
          {/* Avatar & Info */}
          <div className="absolute -bottom-16 left-8 flex items-end gap-6">
            <div className="relative">
              <img
                src={userProfile.avatar}
                alt={userProfile.displayName}
                className="w-32 h-32 rounded-3xl object-cover border-4 border-background shadow-xl"
              />
              {userProfile.verified && (
                <div className="absolute -bottom-2 -right-2 w-10 h-10 gradient-primary rounded-full flex items-center justify-center shadow-lg">
                  <BadgeCheck className="w-6 h-6 text-white" />
                </div>
              )}
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="absolute bottom-4 right-4 flex gap-2">
            <Button variant="outline" size="sm" className="rounded-full bg-white/90 backdrop-blur-sm">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
            <Button size="sm" className="rounded-full gradient-primary text-white">
              <Edit2 className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          </div>
        </div>

        {/* Profile Info */}
        <div className="mt-20 grid lg:grid-cols-3 gap-8">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground">{userProfile.displayName}, {userProfile.age}</h1>
              <div className="flex items-center gap-2 text-muted-foreground mt-2">
                <MapPin className="w-4 h-4" />
                <span>{userProfile.location}</span>
              </div>
              <p className="text-foreground mt-4">{userProfile.bio}</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="travel-card p-6 text-center">
                <p className="text-3xl font-bold text-foreground">{userProfile.trips}</p>
                <p className="text-muted-foreground">Trips</p>
              </div>
              <div className="travel-card p-6 text-center">
                <p className="text-3xl font-bold text-foreground">{userProfile.followers}</p>
                <p className="text-muted-foreground">Followers</p>
              </div>
              <div className="travel-card p-6 text-center">
                <p className="text-3xl font-bold text-foreground">{userProfile.following}</p>
                <p className="text-muted-foreground">Following</p>
              </div>
            </div>

            {/* Recent Trips */}
            <div className="travel-card p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Recent Trips</h3>
              <div className="grid sm:grid-cols-3 gap-4">
                {recentTrips.map((trip) => (
                  <div key={trip.destination} className="relative rounded-2xl overflow-hidden aspect-[4/3] group cursor-pointer">
                    <img src={trip.image} alt={trip.destination} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-3">
                      <p className="text-white font-semibold">{trip.destination}</p>
                      <p className="text-white/70 text-xs">{trip.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Preferences */}
          <div className="space-y-6">
            {/* Budget & Personality */}
            <div className="grid grid-cols-2 gap-4">
              <div className="travel-card p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Wallet className="w-5 h-5 text-primary" />
                  <span className="text-sm text-muted-foreground">Budget</span>
                </div>
                <p className="font-semibold text-foreground">{userProfile.budget}</p>
              </div>
              <div className="travel-card p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Heart className="w-5 h-5 text-secondary" />
                  <span className="text-sm text-muted-foreground">Personality</span>
                </div>
                <p className="font-semibold text-foreground">{userProfile.personality}</p>
              </div>
            </div>

            {/* Interests */}
            <div className="travel-card p-6">
              <h4 className="font-semibold text-foreground mb-4">Interests</h4>
              <div className="flex flex-wrap gap-2">
                {userProfile.interests.map((interest) => {
                  const Icon = interestIcons[interest] || Compass;
                  return (
                    <div key={interest} className="chip chip-primary flex items-center gap-2">
                      <Icon className="w-4 h-4" />
                      {interest}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Badges */}
            <div className="travel-card p-6">
              <h4 className="font-semibold text-foreground mb-4">Travel Badges</h4>
              <div className="space-y-2">
                {userProfile.badges.map((badge, index) => (
                  <div 
                    key={index} 
                    className="flex items-center gap-3 p-3 bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl"
                  >
                    <Award className="w-5 h-5 text-primary" />
                    <span className="text-sm font-medium text-foreground">{badge}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button className="w-full h-12 gradient-primary text-primary-foreground rounded-xl font-semibold">
                <Share2 className="w-5 h-5 mr-2" />
                Share Profile
              </Button>
              <Button variant="outline" className="w-full h-12 rounded-xl font-semibold border-2 border-primary text-primary">
                <MessageCircle className="w-5 h-5 mr-2" />
                Messages
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProfileSection;
