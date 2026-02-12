import React, { useState, useEffect, useRef } from 'react';
import { Settings, Edit2, MapPin, BadgeCheck, Award, Wallet, Heart, Mountain, Utensils, Compass, Sunrise, Camera, Share2, MessageCircle, LogOut, Copy, Facebook, Twitter, Send, Link2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProfileSettingsModal from '@/components/modals/ProfileSettingsModal';
import EditProfileModal from '@/components/modals/EditProfileModal';
import { toast } from '@/hooks/use-toast';

interface ProfileSectionProps {
  onLogout?: () => void;
  onOpenMessages?: () => void;
  followerCount?: number;
  followingCount?: number;
}

const ProfileSection: React.FC<ProfileSectionProps> = ({ onLogout, onOpenMessages, followerCount = 456, followingCount = 234 }) => {
  const [showSettings, setShowSettings] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const shareRef = useRef<HTMLDivElement>(null);

  const [profileData, setProfileData] = useState({
    displayName: 'Traveler',
    bio: 'Exploring the world one trip at a time ✈️ | Budget traveler | Coffee lover ☕',
    location: 'Mumbai, India',
    budget: 'Mid-Range',
    personality: 'Ambivert',
    interests: ['Adventure', 'Food', 'Culture', 'Nature', 'Photography'],
  });

  // Close share menu on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (showShareMenu && shareRef.current && !shareRef.current.contains(e.target as Node)) {
        setShowShareMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showShareMenu]);

  const userProfile = {
    ...profileData,
    age: 25,
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face',
    coverImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=400&fit=crop',
    badges: ['Verified Traveler', 'Solo Explorer', 'Budget Pro', 'Mountain Master'],
    verified: true,
    trips: 12,
  };

  const interestIcons: Record<string, React.ElementType> = {
    Adventure: Mountain, Food: Utensils, Culture: Compass, Nature: Sunrise, Photography: Camera, Spirituality: Heart,
  };

  const recentTrips = [
    { destination: 'Goa', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=300&h=200&fit=crop', date: 'Dec 2024' },
    { destination: 'Ladakh', image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=200&fit=crop', date: 'Oct 2024' },
    { destination: 'Rishikesh', image: 'https://images.unsplash.com/photo-1545158535-c3f7168c28b6?w=300&h=200&fit=crop', date: 'Sep 2024' },
  ];

  const handleShareProfile = (method: string) => {
    const shareText = `Check out ${profileData.displayName} on TripSync! ${profileData.bio}`;
    const shareUrl = window.location.href;

    switch (method) {
      case 'copy':
        navigator.clipboard.writeText(shareUrl);
        toast({ title: 'Profile link copied! 📋' });
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
          navigator.share({ title: `${profileData.displayName} on TripSync`, text: profileData.bio, url: shareUrl });
        } else {
          navigator.clipboard.writeText(shareUrl);
          toast({ title: 'Profile link copied! 📋' });
        }
        break;
    }
    setShowShareMenu(false);
  };

  const handleLogout = () => {
    toast({ title: 'Logged out successfully 👋' });
    onLogout?.();
  };

  const handleProfileSave = (data: typeof profileData) => {
    setProfileData(data);
    setShowEditProfile(false);
    toast({ title: 'Profile updated! ✅' });
  };

  return (
    <section className="py-20 lg:py-32 bg-background">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative mb-12">
          <div className="h-48 sm:h-64 rounded-3xl overflow-hidden">
            <img src={userProfile.coverImage} alt="Cover" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent rounded-3xl" />
          </div>
          <button
            onClick={() => { toast({ title: 'Cover photo updated! 🖼️', description: 'Your new cover image is now visible.' }); }}
            className="absolute top-4 left-4 w-10 h-10 bg-black/40 hover:bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center transition-colors"
            title="Change cover photo"
          >
            <Camera className="w-5 h-5 text-white" />
          </button>
          <div className="absolute -bottom-16 left-8 flex items-end gap-6">
            <div className="relative group">
              <img src={userProfile.avatar} alt={profileData.displayName} className="w-32 h-32 rounded-3xl object-cover border-4 border-background shadow-xl" />
              <button
                onClick={() => { toast({ title: 'Profile photo updated! 📸', description: 'Your new avatar is now visible to others.' }); }}
                className="absolute inset-0 rounded-3xl bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer"
                title="Change profile photo"
              >
                <Camera className="w-8 h-8 text-white" />
              </button>
              {userProfile.verified && (
                <div className="absolute -bottom-2 -right-2 w-10 h-10 gradient-primary rounded-full flex items-center justify-center shadow-lg">
                  <BadgeCheck className="w-6 h-6 text-white" />
                </div>
              )}
            </div>
          </div>
          <div className="absolute bottom-4 right-4 flex gap-2">
            <Button variant="outline" size="sm" className="rounded-full bg-white/90 backdrop-blur-sm" onClick={() => setShowSettings(true)}>
              <Settings className="w-4 h-4 mr-2" />Settings
            </Button>
            <Button size="sm" className="rounded-full gradient-primary text-white" onClick={() => setShowEditProfile(true)}>
              <Edit2 className="w-4 h-4 mr-2" />Edit Profile
            </Button>
          </div>
        </div>

        <div className="mt-20 grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground">{profileData.displayName}, {userProfile.age}</h1>
              <div className="flex items-center gap-2 text-muted-foreground mt-2">
                <MapPin className="w-4 h-4" /><span>{profileData.location}</span>
              </div>
              <p className="text-foreground mt-4">{profileData.bio}</p>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="travel-card p-6 text-center">
                <p className="text-3xl font-bold text-foreground">{userProfile.trips}</p>
                <p className="text-muted-foreground">Trips</p>
              </div>
              <div className="travel-card p-6 text-center">
                <p className="text-3xl font-bold text-foreground">{followerCount}</p>
                <p className="text-muted-foreground">Followers</p>
              </div>
              <div className="travel-card p-6 text-center">
                <p className="text-3xl font-bold text-foreground">{followingCount}</p>
                <p className="text-muted-foreground">Following</p>
              </div>
            </div>
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

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="travel-card p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Wallet className="w-5 h-5 text-primary" />
                  <span className="text-sm text-muted-foreground">Budget</span>
                </div>
                <p className="font-semibold text-foreground">{profileData.budget}</p>
              </div>
              <div className="travel-card p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Heart className="w-5 h-5 text-secondary" />
                  <span className="text-sm text-muted-foreground">Personality</span>
                </div>
                <p className="font-semibold text-foreground">{profileData.personality}</p>
              </div>
            </div>

            <div className="travel-card p-6">
              <h4 className="font-semibold text-foreground mb-4">Interests</h4>
              <div className="flex flex-wrap gap-2">
                {profileData.interests.map((interest) => {
                  const Icon = interestIcons[interest] || Compass;
                  return (
                    <div key={interest} className="chip chip-primary flex items-center gap-2">
                      <Icon className="w-4 h-4" />{interest}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="travel-card p-6">
              <h4 className="font-semibold text-foreground mb-4">Travel Badges</h4>
              <div className="space-y-2">
                {userProfile.badges.map((badge, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl">
                    <Award className="w-5 h-5 text-primary" />
                    <span className="text-sm font-medium text-foreground">{badge}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div className="relative" ref={shareRef}>
                <Button onClick={() => setShowShareMenu(!showShareMenu)} className="w-full h-12 gradient-primary text-primary-foreground rounded-xl font-semibold">
                  <Share2 className="w-5 h-5 mr-2" />Share Profile
                </Button>
                {showShareMenu && (
                  <div className="absolute bottom-full left-0 right-0 mb-2 bg-background border border-border rounded-2xl shadow-xl z-50 animate-fade-in overflow-hidden">
                    <div className="p-2">
                      <button onClick={() => handleShareProfile('whatsapp')} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm hover:bg-muted transition-colors">
                        <Send className="w-4 h-4 text-green-500" />WhatsApp
                      </button>
                      <button onClick={() => handleShareProfile('twitter')} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm hover:bg-muted transition-colors">
                        <Twitter className="w-4 h-4 text-sky-500" />Twitter / X
                      </button>
                      <button onClick={() => handleShareProfile('facebook')} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm hover:bg-muted transition-colors">
                        <Facebook className="w-4 h-4 text-blue-600" />Facebook
                      </button>
                      <button onClick={() => handleShareProfile('telegram')} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm hover:bg-muted transition-colors">
                        <Send className="w-4 h-4 text-sky-400" />Telegram
                      </button>
                      <button onClick={() => handleShareProfile('copy')} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm hover:bg-muted transition-colors">
                        <Copy className="w-4 h-4 text-muted-foreground" />Copy Link
                      </button>
                      {typeof navigator.share === 'function' && (
                        <button onClick={() => handleShareProfile('native')} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm hover:bg-muted transition-colors">
                          <Link2 className="w-4 h-4 text-muted-foreground" />More Options...
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <Button onClick={onOpenMessages} variant="outline" className="w-full h-12 rounded-xl font-semibold border-2 border-primary text-primary">
                <MessageCircle className="w-5 h-5 mr-2" />Messages
              </Button>
              <Button onClick={handleLogout} variant="outline" className="w-full h-12 rounded-xl font-semibold border-destructive text-destructive hover:bg-destructive/5">
                <LogOut className="w-5 h-5 mr-2" />Log Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      <ProfileSettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} onLogout={() => { setShowSettings(false); handleLogout(); }} />
      <EditProfileModal
        isOpen={showEditProfile}
        onClose={() => setShowEditProfile(false)}
        onSave={handleProfileSave}
        initialData={profileData}
      />
    </section>
  );
};

export default ProfileSection;
