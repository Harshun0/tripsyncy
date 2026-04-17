import React, { useEffect, useState, lazy, Suspense, useCallback } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import LoginModal from '@/components/modals/LoginModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { compressImage } from '@/lib/imageCompression';
import { Camera, Loader2 } from 'lucide-react';

// Lazy load heavy sections — only loaded when navigated to
const FloatingMessagesButton = lazy(() => import('@/components/layout/FloatingMessagesButton'));
const MessagesPanel = lazy(() => import('@/components/layout/MessagesPanel'));
const HeroSection = lazy(() => import('@/components/sections/HeroSection'));
const FeaturesSection = lazy(() => import('@/components/sections/FeaturesSection'));
const TravelersSection = lazy(() => import('@/components/sections/TravelersSection'));
const TravelersIntroSection = lazy(() => import('@/components/sections/TravelersIntroSection'));
const FeedSection = lazy(() => import('@/components/sections/FeedSection'));
const ItinerarySection = lazy(() => import('@/components/sections/ItinerarySection'));
const ItineraryIntroSection = lazy(() => import('@/components/sections/ItineraryIntroSection'));
const ExpenseSection = lazy(() => import('@/components/sections/ExpenseSection'));
const ProfileSection = lazy(() => import('@/components/sections/ProfileSection'));
const SearchSection = lazy(() => import('@/components/sections/SearchSection'));
const AIChatModal = lazy(() => import('@/components/sections/AIChatModal'));
const TripCreateScreen = lazy(() => import('@/components/screens/TripCreateScreen'));
const UserProfileScreen = lazy(() => import('@/components/screens/UserProfileScreen'));
const SavedPostsScreen = lazy(() => import('@/components/screens/SavedPostsScreen'));
const PostDetailScreen = lazy(() => import('@/components/screens/PostDetailScreen'));

const SectionLoader = () => (
  <div className="flex items-center justify-center py-20">
    <Loader2 className="w-8 h-8 animate-spin text-primary" />
  </div>
);

const Index: React.FC = () => {
  const { user, loading, profile, signOut, updateProfile } = useAuth();
  const isLoggedIn = !!user;

  const [activeSection, setActiveSection] = useState(isLoggedIn ? 'home' : 'landing');
  const [showAIChat, setShowAIChat] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showMessagesPanel, setShowMessagesPanel] = useState(false);
  const [messageTargetUserId, setMessageTargetUserId] = useState<string | null>(null);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [viewUserId, setViewUserId] = useState<string | null>(null);
  const [viewPostId, setViewPostId] = useState<string | null>(null);

  const openMessagesWithUser = (targetUserId?: string) => {
    if (targetUserId) setMessageTargetUserId(targetUserId);
    setShowMessagesPanel(true);
  };

  const closeMessages = () => {
    setShowMessagesPanel(false);
    setMessageTargetUserId(null);
  };

  const [onboarding, setOnboarding] = useState({
    display_name: '',
    location: '',
    bio: '',
    budget: 'Mid-Range',
    personality: 'Ambivert',
    interests: '',
  });
  const [onboardingAvatar, setOnboardingAvatar] = useState<File | null>(null);
  const [onboardingCover, setOnboardingCover] = useState<File | null>(null);
  const [onboardingAvatarPreview, setOnboardingAvatarPreview] = useState<string | null>(null);
  const [onboardingCoverPreview, setOnboardingCoverPreview] = useState<string | null>(null);

  // Apply dark mode from profile on load
  useEffect(() => {
    if (profile?.dark_mode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [profile?.dark_mode]);

  useEffect(() => {
    if (!loading) {
      if (isLoggedIn && activeSection === 'landing') setActiveSection('home');
      if (!isLoggedIn && activeSection !== 'landing') setActiveSection('landing');
    }
  }, [isLoggedIn, loading, activeSection]);

  useEffect(() => {
    if (!profile || !user) return;
    const needsOnboarding = !profile.location || !profile.bio || profile.display_name === 'Traveler';
    setShowOnboarding(needsOnboarding);
    if (needsOnboarding) {
      setOnboarding({
        display_name: profile.display_name === 'Traveler' ? '' : profile.display_name || '',
        location: profile.location || '',
        bio: profile.bio || '',
        budget: profile.budget || 'Mid-Range',
        personality: profile.personality || 'Ambivert',
        interests: profile.interests?.join(', ') || '',
      });
    }
  }, [profile, user]);

  useEffect(() => {
    if (!user) {
      setUnreadMessagesCount(0);
      return;
    }

    const loadUnreadCount = async () => {
      const { data: participantRows } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', user.id);

      const conversationIds = ((participantRows || []) as any[]).map((row) => row.conversation_id);

      if (conversationIds.length === 0) {
        setUnreadMessagesCount(0);
        return;
      }

      const { count } = await supabase
        .from('direct_messages')
        .select('*', { count: 'exact', head: true })
        .in('conversation_id', conversationIds)
        .neq('sender_id', user.id)
        .is('read_at', null);

      setUnreadMessagesCount(count || 0);
    };

    loadUnreadCount();

    const channel = supabase
      .channel('index-unread-messages')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'direct_messages' }, () => loadUnreadCount())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'conversation_participants' }, () => loadUnreadCount())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const handleNavigate = (section: string) => {
    if (section === 'ai') { setShowAIChat(true); return; }
    if (section === 'login') { setShowLoginModal(true); return; }
    setViewUserId(null);
    setActiveSection(section);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogin = () => setShowLoginModal(true);
  const handleLoginComplete = () => { setShowLoginModal(false); setActiveSection('home'); };
  const handleGetStarted = () => { if (isLoggedIn) handleNavigate('home'); else setShowLoginModal(true); };

  const handleLogout = async () => {
    await signOut();
    setActiveSection('landing');
    closeMessages();
    toast({ title: 'Logged out successfully 👋' });
  };

  const uploadOnboardingFile = async (file: File, type: 'avatar' | 'cover') => {
    if (!user) return null;
    const compressed = await compressImage(file);
    const ext = compressed.name.split('.').pop() || 'jpg';
    const path = `${user.id}/${type}-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('profile-media').upload(path, compressed, { cacheControl: '3600', upsert: true });
    if (error) return null;
    return supabase.storage.from('profile-media').getPublicUrl(path).data.publicUrl;
  };

  const handleFinishOnboarding = async () => {
    if (!onboarding.display_name.trim() || !onboarding.location.trim() || !onboarding.bio.trim()) {
      toast({ title: 'Please fill all required profile details', variant: 'destructive' });
      return;
    }

    const interests = onboarding.interests.split(',').map((i) => i.trim()).filter(Boolean);
    const updates: any = {
      display_name: onboarding.display_name,
      location: onboarding.location,
      bio: onboarding.bio,
      budget: onboarding.budget,
      personality: onboarding.personality,
      interests,
    };

    // Upload photos if provided
    if (onboardingAvatar) {
      const url = await uploadOnboardingFile(onboardingAvatar, 'avatar');
      if (url) updates.avatar_url = url;
    }
    if (onboardingCover) {
      const url = await uploadOnboardingFile(onboardingCover, 'cover');
      if (url) updates.cover_url = url;
    }

    const { error } = await updateProfile(updates);
    if (error) { toast({ title: 'Failed to save profile', description: error, variant: 'destructive' }); return; }

    toast({ title: 'Profile setup complete ✅' });
    setShowOnboarding(false);
  };

  const handleViewUserProfile = (userId: string) => {
    if (userId === user?.id) { handleNavigate('profile'); return; }
    setViewUserId(userId);
    setActiveSection('user-profile');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewPost = (postId: string) => {
    setViewPostId(postId);
    setActiveSection('post-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderContent = () => {
    if (activeSection === 'user-profile' && viewUserId) {
      return <div className="pt-20"><UserProfileScreen userId={viewUserId} onBack={() => handleNavigate('home')} onOpenMessages={(targetUserId?: string) => openMessagesWithUser(targetUserId || viewUserId)} onViewUserProfile={handleViewUserProfile} /></div>;
    }

    switch (activeSection) {
      case 'landing':
        return (
          <>
            <HeroSection onGetStarted={handleGetStarted} onExplore={() => handleNavigate('explore')} isLoggedIn={isLoggedIn} />
            <FeaturesSection onNavigate={handleNavigate} isLoggedIn={isLoggedIn} />
            <TravelersIntroSection onNavigate={handleNavigate} isLoggedIn={isLoggedIn} />
            <ItineraryIntroSection onNavigate={handleNavigate} isLoggedIn={isLoggedIn} />
          </>
        );
      case 'post-detail':
        return viewPostId ? <div className="pt-20"><PostDetailScreen postId={viewPostId} onBack={() => handleNavigate('home')} onViewUserProfile={handleViewUserProfile} /></div> : null;
      case 'home':
        return <div className="pt-20"><FeedSection onViewUserProfile={handleViewUserProfile} onViewPost={handleViewPost} onMessageUser={openMessagesWithUser} /></div>;
      case 'explore':
        return <div className="pt-20"><TravelersSection onMessageUser={(uid: string) => openMessagesWithUser(uid)} /></div>;
      case 'itinerary':
        return <div className="pt-20"><ItinerarySection /></div>;
      case 'expenses':
        return <div className="pt-20"><ExpenseSection /></div>;
      case 'search':
        return <div className="pt-20"><SearchSection /></div>;
      case 'profile':
        return <div className="pt-20"><ProfileSection onLogout={handleLogout} onOpenMessages={openMessagesWithUser} onViewUserProfile={handleViewUserProfile} /></div>;
      case 'create-trip':
        return <div className="pt-20"><TripCreateScreen onBack={() => handleNavigate('home')} /></div>;
      case 'liked-posts':
        return <div className="pt-20"><SavedPostsScreen mode="liked" onBack={() => handleNavigate('home')} /></div>;
      case 'saved-posts':
        return <div className="pt-20"><SavedPostsScreen mode="saved" onBack={() => handleNavigate('home')} /></div>;
      default:
        return (
          <>
            <HeroSection onGetStarted={handleGetStarted} onExplore={() => handleNavigate('explore')} isLoggedIn={isLoggedIn} />
            <FeaturesSection onNavigate={handleNavigate} isLoggedIn={isLoggedIn} />
          </>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-12 h-12 gradient-primary rounded-2xl flex items-center justify-center animate-pulse">
          <span className="text-white font-bold text-lg">T</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header activeSection={activeSection} onNavigate={handleNavigate} isLoggedIn={isLoggedIn} onLogin={handleLogin} onLogout={handleLogout} />
      <main>
        <Suspense fallback={<SectionLoader />}>
          {renderContent()}
        </Suspense>
      </main>
      <Footer />

      {isLoggedIn && (
        <Suspense fallback={null}>
          <FloatingMessagesButton onClick={() => { if (showMessagesPanel) closeMessages(); else openMessagesWithUser(); }} isOpen={showMessagesPanel} unreadCount={unreadMessagesCount} />
          <MessagesPanel isOpen={showMessagesPanel} onClose={closeMessages} targetUserId={messageTargetUserId} />
        </Suspense>
      )}

      {showAIChat && <Suspense fallback={null}><AIChatModal isOpen={showAIChat} onClose={() => setShowAIChat(false)} /></Suspense>}
      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} onComplete={handleLoginComplete} />

      {showOnboarding && isLoggedIn && (
        <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-background rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-foreground">Complete your profile</h2>
            <p className="text-sm text-muted-foreground">Set your personal details to start using all TripSync features.</p>

            {/* Photo uploads */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-foreground">Cover Photo</label>
              <label className="w-full h-28 border border-dashed border-border rounded-xl flex items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors overflow-hidden relative">
                <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) { setOnboardingCover(f); setOnboardingCoverPreview(URL.createObjectURL(f)); }
                }} />
                {onboardingCoverPreview ? (
                  <img src={onboardingCoverPreview} alt="Cover preview" className="w-full h-full object-cover" />
                ) : (
                  <span className="flex items-center gap-2 text-sm text-muted-foreground"><Camera className="w-4 h-4" />Choose cover photo</span>
                )}
              </label>

              <label className="block text-sm font-medium text-foreground">Profile Photo</label>
              <div className="flex items-center gap-4">
                <label className="w-20 h-20 rounded-full border border-dashed border-border flex items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors overflow-hidden">
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) { setOnboardingAvatar(f); setOnboardingAvatarPreview(URL.createObjectURL(f)); }
                  }} />
                  {onboardingAvatarPreview ? (
                    <img src={onboardingAvatarPreview} alt="Avatar preview" className="w-full h-full object-cover" />
                  ) : (
                    <Camera className="w-6 h-6 text-muted-foreground" />
                  )}
                </label>
                <span className="text-sm text-muted-foreground">Tap to upload</span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <Input placeholder="Display name *" value={onboarding.display_name} onChange={(e) => setOnboarding((p) => ({ ...p, display_name: e.target.value }))} />
              <Input placeholder="Location *" value={onboarding.location} onChange={(e) => setOnboarding((p) => ({ ...p, location: e.target.value }))} />
              <Input placeholder="Short bio *" value={onboarding.bio} onChange={(e) => setOnboarding((p) => ({ ...p, bio: e.target.value }))} />
              <Input placeholder="Interests (comma separated)" value={onboarding.interests} onChange={(e) => setOnboarding((p) => ({ ...p, interests: e.target.value }))} />
              <div className="grid grid-cols-2 gap-3">
                <select className="input-field" value={onboarding.budget} onChange={(e) => setOnboarding((p) => ({ ...p, budget: e.target.value }))}>
                  <option>Budget</option>
                  <option>Mid-Range</option>
                  <option>Luxury</option>
                </select>
                <select className="input-field" value={onboarding.personality} onChange={(e) => setOnboarding((p) => ({ ...p, personality: e.target.value }))}>
                  <option>Introvert</option>
                  <option>Ambivert</option>
                  <option>Extrovert</option>
                </select>
              </div>
            </div>

            <Button className="w-full h-11 gradient-primary text-primary-foreground" onClick={handleFinishOnboarding}>Save profile</Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
