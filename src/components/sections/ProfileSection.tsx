import React, { useEffect, useRef, useState } from 'react';
import { Settings, Edit2, MapPin, BadgeCheck, Wallet, Heart, Mountain, Utensils, Compass, Sunrise, Camera, Share2, MessageCircle, LogOut, Copy, Facebook, Twitter, Send, Plus, ImagePlus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProfileSettingsModal from '@/components/modals/ProfileSettingsModal';
import EditProfileModal from '@/components/modals/EditProfileModal';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { compressImage } from '@/lib/imageCompression';

interface ProfileSectionProps {
  onLogout?: () => void;
  onOpenMessages?: () => void;
}

const LOCATION_SUGGESTIONS = [
  'Goa, India', 'Kerala, India', 'Ladakh, India', 'Rishikesh, Uttarakhand, India', 'Manali, Himachal Pradesh, India',
  'Hampi, Karnataka, India', 'Mumbai, Maharashtra, India', 'Delhi, India', 'Jaipur, Rajasthan, India',
  'Dharamshala, Himachal Pradesh, India', 'Shimla, Himachal Pradesh, India', 'McLeod Ganj, Himachal Pradesh, India',
  'Kasol, Himachal Pradesh, India', 'Dalhousie, Himachal Pradesh, India', 'Spiti Valley, Himachal Pradesh, India',
  'Udaipur, Rajasthan, India', 'Jodhpur, Rajasthan, India', 'Pushkar, Rajasthan, India',
  'Varanasi, Uttar Pradesh, India', 'Agra, Uttar Pradesh, India', 'Lucknow, Uttar Pradesh, India',
  'Darjeeling, West Bengal, India', 'Kolkata, West Bengal, India', 'Gangtok, Sikkim, India',
  'Shillong, Meghalaya, India', 'Cherrapunji, Meghalaya, India', 'Tawang, Arunachal Pradesh, India',
  'Coorg, Karnataka, India', 'Mysore, Karnataka, India', 'Bangalore, Karnataka, India',
  'Pondicherry, India', 'Ooty, Tamil Nadu, India', 'Kodaikanal, Tamil Nadu, India', 'Chennai, Tamil Nadu, India',
  'Munnar, Kerala, India', 'Alleppey, Kerala, India', 'Kochi, Kerala, India', 'Wayanad, Kerala, India',
  'Leh, Ladakh, India', 'Nubra Valley, Ladakh, India', 'Pangong Lake, Ladakh, India',
  'Amritsar, Punjab, India', 'Chandigarh, India', 'Mussoorie, Uttarakhand, India', 'Nainital, Uttarakhand, India',
  'Haridwar, Uttarakhand, India', 'Auli, Uttarakhand, India', 'Jim Corbett, Uttarakhand, India',
  'Pune, Maharashtra, India', 'Lonavala, Maharashtra, India', 'Mahabaleshwar, Maharashtra, India',
  'Hyderabad, Telangana, India', 'Visakhapatnam, Andhra Pradesh, India',
  'Andaman Islands, India', 'Lakshadweep, India', 'Mount Abu, Rajasthan, India',
  'Paris, France', 'Nice, France', 'Lyon, France', 'Marseille, France',
  'Tokyo, Japan', 'Kyoto, Japan', 'Osaka, Japan',
  'Bali, Indonesia', 'Jakarta, Indonesia',
  'New York, USA', 'Los Angeles, USA', 'San Francisco, USA', 'Miami, USA',
  'London, UK', 'Edinburgh, UK', 'Manchester, UK',
  'Dubai, UAE', 'Abu Dhabi, UAE',
  'Barcelona, Spain', 'Madrid, Spain',
  'Rome, Italy', 'Venice, Italy', 'Florence, Italy', 'Milan, Italy',
  'Bangkok, Thailand', 'Phuket, Thailand', 'Chiang Mai, Thailand',
  'Singapore', 'Sydney, Australia', 'Melbourne, Australia',
  'Maldives', 'Sri Lanka', 'Nepal', 'Bhutan',
  'Istanbul, Turkey', 'Cappadocia, Turkey',
  'Amsterdam, Netherlands', 'Prague, Czech Republic', 'Vienna, Austria',
  'Zurich, Switzerland', 'Interlaken, Switzerland',
  'Cairo, Egypt', 'Marrakech, Morocco', 'Cape Town, South Africa',
  'Rio de Janeiro, Brazil', 'Cancun, Mexico',
];

const ProfileSection: React.FC<ProfileSectionProps> = ({ onLogout, onOpenMessages }) => {
  const { user, profile, updateProfile, signOut, refreshProfile } = useAuth();
  const [showSettings, setShowSettings] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [tripCount, setTripCount] = useState(0);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [postCaption, setPostCaption] = useState('');
  const [postLocation, setPostLocation] = useState('');
  const [postFile, setPostFile] = useState<File | null>(null);
  const [creatingPost, setCreatingPost] = useState(false);
  const [locationSuggestions, setLocationSuggestions] = useState<string[]>([]);
  const shareRef = useRef<HTMLDivElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (showShareMenu && shareRef.current && !shareRef.current.contains(e.target as Node)) setShowShareMenu(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showShareMenu]);

  useEffect(() => {
    if (!user) return;
    const loadCounts = async () => {
      const [{ count: trips }, { count: followers }, { count: following }] = await Promise.all([
        supabase.from('trips').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('follows').select('*', { count: 'exact', head: true }).eq('following_id', user.id).eq('status', 'accepted'),
        supabase.from('follows').select('*', { count: 'exact', head: true }).eq('follower_id', user.id).eq('status', 'accepted'),
      ]);
      setTripCount(trips || 0);
      setFollowerCount(followers || 0);
      setFollowingCount(following || 0);
    };
    loadCounts();
  }, [user]);

  const displayName = profile?.display_name || 'Traveler';
  const bio = profile?.bio || 'Add your bio from profile settings.';
  const location = profile?.location || 'Set your location';
  const budget = profile?.budget || 'Mid-Range';
  const personality = profile?.personality || 'Ambivert';
  const interests = profile?.interests || [];
  const avatarUrl = profile?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face';
  const coverUrl = profile?.cover_url || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=400&fit=crop';

  const interestIcons: Record<string, React.ElementType> = { Adventure: Mountain, Food: Utensils, Culture: Compass, Nature: Sunrise, Photography: Camera, Spirituality: Heart };

  const uploadToBucket = async (file: File, type: 'avatar' | 'cover') => {
    if (!user) return null;
    const compressed = await compressImage(file);
    const ext = compressed.name.split('.').pop() || 'jpg';
    const path = `${user.id}/${type}-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('profile-media').upload(path, compressed, { cacheControl: '3600', upsert: true });
    if (error) throw error;
    return supabase.storage.from('profile-media').getPublicUrl(path).data.publicUrl;
  };

  const handleFileUpload = async (file: File, type: 'avatar' | 'cover') => {
    try {
      setUploading(true);
      const publicUrl = await uploadToBucket(file, type);
      if (!publicUrl) throw new Error('Upload failed');
      const update = type === 'avatar' ? { avatar_url: publicUrl } : { cover_url: publicUrl };
      const { error } = await updateProfile(update as any);
      if (error) throw new Error(error);
      await refreshProfile();
      toast({ title: `${type === 'avatar' ? 'Profile' : 'Cover'} photo updated ✅` });
    } catch (e) {
      toast({ title: 'Photo update failed', description: e instanceof Error ? e.message : 'Please try again', variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const handleShareProfile = (method: string) => {
    const shareText = `Check out ${displayName} on TripSync!`;
    const shareUrl = window.location.href;
    if (method === 'copy') { navigator.clipboard.writeText(shareUrl); toast({ title: 'Profile link copied! 📋' }); }
    else if (method === 'whatsapp') window.open(`https://wa.me/?text=${encodeURIComponent(shareText + '\n' + shareUrl)}`, '_blank');
    else if (method === 'twitter') window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, '_blank');
    else if (method === 'facebook') window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank');
    setShowShareMenu(false);
  };

  const handleLogout = async () => { await signOut(); toast({ title: 'Logged out successfully 👋' }); onLogout?.(); };

  const handleProfileSave = async (data: any) => {
    const { error } = await updateProfile({ display_name: data.displayName, bio: data.bio, location: data.location, budget: data.budget, personality: data.personality, interests: data.interests } as any);
    if (error) { toast({ title: 'Profile update failed', description: error, variant: 'destructive' }); return; }
    setShowEditProfile(false);
    toast({ title: 'Profile updated! ✅' });
  };

  const handlePostLocationChange = (val: string) => {
    setPostLocation(val);
    if (val.length >= 2) {
      setLocationSuggestions(LOCATION_SUGGESTIONS.filter(l => l.toLowerCase().includes(val.toLowerCase())).slice(0, 5));
    } else {
      setLocationSuggestions([]);
    }
  };

  const createPost = async () => {
    if (!user || !postCaption.trim()) { toast({ title: 'Caption is required', variant: 'destructive' }); return; }
    setCreatingPost(true);
    try {
      let mediaUrl: string | null = null;
      if (postFile) {
        const compressed = await compressImage(postFile);
        const ext = compressed.name.split('.').pop() || 'jpg';
        const path = `${user.id}/${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage.from('post-media').upload(path, compressed, { upsert: true });
        if (uploadError) throw uploadError;
        mediaUrl = supabase.storage.from('post-media').getPublicUrl(path).data.publicUrl;
      }
      const { error } = await supabase.from('posts').insert({ user_id: user.id, caption: postCaption, location: postLocation || null, media_url: mediaUrl, is_public: true });
      if (error) throw error;
      setShowCreatePost(false);
      setPostCaption('');
      setPostLocation('');
      setPostFile(null);
      setLocationSuggestions([]);
      toast({ title: 'Post created ✅' });
    } catch (e) {
      toast({ title: 'Post creation failed', description: e instanceof Error ? e.message : 'Please try again', variant: 'destructive' });
    } finally {
      setCreatingPost(false);
    }
  };

  return (
    <section className="py-20 lg:py-32 bg-background">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative mb-12">
          <div className="h-48 sm:h-64 rounded-3xl overflow-hidden">
            <img src={coverUrl} alt="Cover" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent rounded-3xl" />
          </div>
          <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileUpload(f, 'cover'); }} />
          <button disabled={uploading} onClick={() => coverInputRef.current?.click()} className="absolute top-4 left-4 w-10 h-10 bg-black/40 hover:bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center transition-colors" title="Change cover photo">
            <Camera className="w-5 h-5 text-white" />
          </button>
          <div className="absolute -bottom-16 left-8 flex items-end gap-6">
            <div className="relative group">
              <img src={avatarUrl} alt={displayName} className="w-32 h-32 rounded-3xl object-cover border-4 border-background shadow-xl" />
              <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileUpload(f, 'avatar'); }} />
              <button disabled={uploading} onClick={() => avatarInputRef.current?.click()} className="absolute inset-0 rounded-3xl bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer" title="Change profile photo">
                <Camera className="w-8 h-8 text-white" />
              </button>
              <div className="absolute -bottom-2 -right-2 w-10 h-10 gradient-primary rounded-full flex items-center justify-center shadow-lg">
                <BadgeCheck className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
          <div className="absolute bottom-4 right-4 flex gap-2">
            <Button variant="outline" size="sm" className="rounded-full bg-white/90 backdrop-blur-sm" onClick={() => setShowSettings(true)}><Settings className="w-4 h-4 mr-2" />Settings</Button>
            <Button size="sm" className="rounded-full gradient-primary text-white" onClick={() => setShowEditProfile(true)}><Edit2 className="w-4 h-4 mr-2" />Edit Profile</Button>
          </div>
        </div>

        <div className="mt-20 grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground">{displayName}</h1>
              <div className="flex items-center gap-2 text-muted-foreground mt-2"><MapPin className="w-4 h-4" /><span>{location}</span></div>
              <p className="text-foreground mt-4">{bio}</p>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="travel-card p-6 text-center"><p className="text-3xl font-bold text-foreground">{tripCount}</p><p className="text-muted-foreground">Trips</p></div>
              <div className="travel-card p-6 text-center"><p className="text-3xl font-bold text-foreground">{followerCount}</p><p className="text-muted-foreground">Followers</p></div>
              <div className="travel-card p-6 text-center"><p className="text-3xl font-bold text-foreground">{followingCount}</p><p className="text-muted-foreground">Following</p></div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="travel-card p-4"><div className="flex items-center gap-2 mb-2"><Wallet className="w-5 h-5 text-primary" /><span className="text-sm text-muted-foreground">Budget</span></div><p className="font-semibold text-foreground">{budget}</p></div>
              <div className="travel-card p-4"><div className="flex items-center gap-2 mb-2"><Heart className="w-5 h-5 text-secondary" /><span className="text-sm text-muted-foreground">Personality</span></div><p className="font-semibold text-foreground">{personality}</p></div>
            </div>
            <div className="travel-card p-6">
              <h4 className="font-semibold text-foreground mb-4">Interests</h4>
              <div className="flex flex-wrap gap-2">
                {interests.map((interest) => {
                  const Icon = interestIcons[interest] || Compass;
                  return <div key={interest} className="chip chip-primary flex items-center gap-2"><Icon className="w-4 h-4" />{interest}</div>;
                })}
              </div>
            </div>
            <div className="space-y-3">
              <Button onClick={() => setShowCreatePost(true)} className="w-full h-12 gradient-primary text-primary-foreground rounded-xl font-semibold">
                <Plus className="w-5 h-5 mr-2" />New Post
              </Button>
              <div className="relative" ref={shareRef}>
                <Button onClick={() => setShowShareMenu(!showShareMenu)} variant="outline" className="w-full h-12 rounded-xl font-semibold border-2 border-primary text-primary">
                  <Share2 className="w-5 h-5 mr-2" />Share Profile
                </Button>
                {showShareMenu && (
                  <div className="absolute bottom-full left-0 right-0 mb-2 bg-background border border-border rounded-2xl shadow-xl z-50 animate-fade-in overflow-hidden p-2">
                    <button onClick={() => handleShareProfile('whatsapp')} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm hover:bg-muted transition-colors"><Send className="w-4 h-4 text-green-500" />WhatsApp</button>
                    <button onClick={() => handleShareProfile('twitter')} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm hover:bg-muted transition-colors"><Twitter className="w-4 h-4 text-accent" />Twitter / X</button>
                    <button onClick={() => handleShareProfile('facebook')} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm hover:bg-muted transition-colors"><Facebook className="w-4 h-4 text-primary" />Facebook</button>
                    <button onClick={() => handleShareProfile('copy')} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm hover:bg-muted transition-colors"><Copy className="w-4 h-4 text-muted-foreground" />Copy Link</button>
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
      <EditProfileModal isOpen={showEditProfile} onClose={() => setShowEditProfile(false)} onSave={handleProfileSave} initialData={{ displayName, bio, location, budget, personality, interests }} />

      {showCreatePost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-background rounded-2xl p-5 space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Create Post</h3>
            <textarea className="input-field min-h-[110px] resize-none" placeholder="Write a caption" value={postCaption} onChange={(e) => setPostCaption(e.target.value)} />
            <div className="relative">
              <input className="input-field" placeholder="Location (e.g. Goa, Paris...)" value={postLocation} onChange={(e) => handlePostLocationChange(e.target.value)} />
              {locationSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-xl shadow-lg z-50 overflow-hidden">
                  {locationSuggestions.map((loc) => (
                    <button key={loc} onClick={() => { setPostLocation(loc); setLocationSuggestions([]); }} className="w-full px-4 py-2.5 text-sm text-left hover:bg-muted transition-colors flex items-center gap-2">
                      <MapPin className="w-3 h-3 text-muted-foreground" />{loc}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <label className="w-full h-24 border border-dashed border-border rounded-xl flex items-center justify-center text-sm text-muted-foreground cursor-pointer hover:bg-muted/50 transition-colors">
              <input type="file" accept="image/*,video/*" className="hidden" onChange={(e) => setPostFile(e.target.files?.[0] || null)} />
              <span className="flex items-center gap-2"><ImagePlus className="w-4 h-4" />{postFile ? postFile.name : 'Upload image or video (optional)'}</span>
            </label>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => { setShowCreatePost(false); setLocationSuggestions([]); }}>Cancel</Button>
              <Button className="flex-1 gradient-primary text-primary-foreground" onClick={createPost} disabled={creatingPost}>{creatingPost ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Post'}</Button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default ProfileSection;
