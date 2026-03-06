import React, { useEffect, useState } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import FloatingMessagesButton from '@/components/layout/FloatingMessagesButton';
import MessagesPanel from '@/components/layout/MessagesPanel';
import HeroSection from '@/components/sections/HeroSection';
import FeaturesSection from '@/components/sections/FeaturesSection';
import TravelersSection from '@/components/sections/TravelersSection';
import FeedSection from '@/components/sections/FeedSection';
import ItinerarySection from '@/components/sections/ItinerarySection';
import ItineraryIntroSection from '@/components/sections/ItineraryIntroSection';
import ExpenseSection from '@/components/sections/ExpenseSection';
import ProfileSection from '@/components/sections/ProfileSection';
import SearchSection from '@/components/sections/SearchSection';
import AIChatModal from '@/components/sections/AIChatModal';
import LoginModal from '@/components/modals/LoginModal';
import TripCreateScreen from '@/components/screens/TripCreateScreen';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

const Index: React.FC = () => {
  const { user, loading, profile, signOut, updateProfile } = useAuth();
  const isLoggedIn = !!user;

  const [activeSection, setActiveSection] = useState(isLoggedIn ? 'home' : 'landing');
  const [showAIChat, setShowAIChat] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showMessagesPanel, setShowMessagesPanel] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  const [onboarding, setOnboarding] = useState({
    display_name: '',
    location: '',
    bio: '',
    budget: 'Mid-Range',
    personality: 'Ambivert',
    interests: '',
  });

  useEffect(() => {
    if (!loading) {
      if (isLoggedIn && activeSection === 'landing') setActiveSection('home');
      if (!isLoggedIn && activeSection !== 'landing') setActiveSection('landing');
    }
  }, [isLoggedIn, loading, activeSection]);

  useEffect(() => {
    if (!profile || !user) return;

    const needsOnboarding = !profile.location || !profile.bio || !profile.display_name;
    setShowOnboarding(needsOnboarding);

    if (needsOnboarding) {
      setOnboarding({
        display_name: profile.display_name || '',
        location: profile.location || '',
        bio: profile.bio || '',
        budget: profile.budget || 'Mid-Range',
        personality: profile.personality || 'Ambivert',
        interests: profile.interests?.join(', ') || '',
      });
    }
  }, [profile, user]);

  const handleNavigate = (section: string) => {
    if (section === 'ai') {
      setShowAIChat(true);
      return;
    }
    if (section === 'login') {
      setShowLoginModal(true);
      return;
    }
    setActiveSection(section);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogin = () => setShowLoginModal(true);

  const handleLoginComplete = () => {
    setShowLoginModal(false);
    setActiveSection('home');
  };

  const handleGetStarted = () => {
    if (isLoggedIn) handleNavigate('home');
    else setShowLoginModal(true);
  };

  const handleLogout = async () => {
    await signOut();
    setActiveSection('landing');
    setShowMessagesPanel(false);
    toast({ title: 'Logged out successfully 👋' });
  };

  const handleFinishOnboarding = async () => {
    if (!onboarding.display_name.trim() || !onboarding.location.trim() || !onboarding.bio.trim()) {
      toast({ title: 'Please fill all required profile details', variant: 'destructive' });
      return;
    }

    const interests = onboarding.interests
      .split(',')
      .map((i) => i.trim())
      .filter(Boolean);

    const { error } = await updateProfile({
      display_name: onboarding.display_name,
      location: onboarding.location,
      bio: onboarding.bio,
      budget: onboarding.budget,
      personality: onboarding.personality,
      interests,
    } as any);

    if (error) {
      toast({ title: 'Failed to save profile', description: error, variant: 'destructive' });
      return;
    }

    toast({ title: 'Profile setup complete ✅' });
    setShowOnboarding(false);
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'landing':
        return (
          <>
            <HeroSection onGetStarted={handleGetStarted} onExplore={() => handleNavigate('explore')} isLoggedIn={isLoggedIn} />
            <FeaturesSection onNavigate={handleNavigate} isLoggedIn={isLoggedIn} />
            <TravelersSection />
            <ItineraryIntroSection onNavigate={handleNavigate} isLoggedIn={isLoggedIn} />
          </>
        );
      case 'home':
        return <div className="pt-20"><FeedSection /></div>;
      case 'explore':
        return <div className="pt-20"><TravelersSection /></div>;
      case 'itinerary':
        return <div className="pt-20"><ItinerarySection /></div>;
      case 'expenses':
        return <div className="pt-20"><ExpenseSection /></div>;
      case 'search':
        return <div className="pt-20"><SearchSection /></div>;
      case 'profile':
        return <div className="pt-20"><ProfileSection onLogout={handleLogout} onOpenMessages={() => setShowMessagesPanel(true)} /></div>;
      case 'create-trip':
        return <div className="pt-20"><TripCreateScreen onBack={() => handleNavigate('home')} /></div>;
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
      <main>{renderContent()}</main>
      <Footer />

      {isLoggedIn && (
        <>
          <FloatingMessagesButton onClick={() => setShowMessagesPanel(!showMessagesPanel)} isOpen={showMessagesPanel} unreadCount={0} />
          <MessagesPanel isOpen={showMessagesPanel} onClose={() => setShowMessagesPanel(false)} />
        </>
      )}

      <AIChatModal isOpen={showAIChat} onClose={() => setShowAIChat(false)} />
      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} onComplete={handleLoginComplete} />

      {showOnboarding && isLoggedIn && (
        <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-background rounded-3xl p-6 shadow-2xl space-y-4">
            <h2 className="text-xl font-bold text-foreground">Complete your profile</h2>
            <p className="text-sm text-muted-foreground">Set your personal details to start using all TripSync features.</p>

            <div className="grid grid-cols-1 gap-3">
              <Input placeholder="Display name" value={onboarding.display_name} onChange={(e) => setOnboarding((p) => ({ ...p, display_name: e.target.value }))} />
              <Input placeholder="Location" value={onboarding.location} onChange={(e) => setOnboarding((p) => ({ ...p, location: e.target.value }))} />
              <Input placeholder="Short bio" value={onboarding.bio} onChange={(e) => setOnboarding((p) => ({ ...p, bio: e.target.value }))} />
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
