import React, { useState, useEffect } from 'react';
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
import EditProfileModal from '@/components/modals/EditProfileModal';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

const Index: React.FC = () => {
  const { user, loading, signOut, profile, needsOnboarding, updateProfile } = useAuth();
  const isLoggedIn = !!user;

  const [activeSection, setActiveSection] = useState(isLoggedIn ? 'home' : 'landing');
  const [showAIChat, setShowAIChat] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showMessagesPanel, setShowMessagesPanel] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  const handleNavigate = (section: string) => {
    if (section === 'ai') return setShowAIChat(true);
    if (section === 'login') return setShowLoginModal(true);
    setActiveSection(section);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogin = () => setShowLoginModal(true);
  const handleLoginComplete = () => {
    setShowLoginModal(false);
    setActiveSection('home');
  };
  const handleGetStarted = () => (isLoggedIn ? handleNavigate('home') : setShowLoginModal(true));

  const handleLogout = async () => {
    await signOut();
    setActiveSection('landing');
    setShowMessagesPanel(false);
    toast({ title: 'Logged out successfully 👋' });
  };

  useEffect(() => {
    if (!loading) {
      if (isLoggedIn && activeSection === 'landing') setActiveSection('home');
      if (!isLoggedIn && activeSection !== 'landing') setActiveSection('landing');
    }
  }, [isLoggedIn, loading, activeSection]);

  useEffect(() => {
    if (isLoggedIn && needsOnboarding) setShowOnboarding(true);
  }, [isLoggedIn, needsOnboarding]);

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
    return <div className="min-h-screen flex items-center justify-center bg-background"><div className="w-12 h-12 gradient-primary rounded-2xl flex items-center justify-center animate-pulse"><span className="text-white font-bold text-lg">T</span></div></div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header activeSection={activeSection} onNavigate={handleNavigate} isLoggedIn={isLoggedIn} onLogin={handleLogin} onLogout={handleLogout} requestCount={0} />
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

      <EditProfileModal
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        initialData={{
          displayName: profile?.display_name || 'Traveler',
          bio: profile?.bio || '',
          location: profile?.location || '',
          budget: profile?.budget || 'Mid-Range',
          personality: profile?.personality || 'Ambivert',
          interests: profile?.interests || [],
        }}
        onSave={async (data) => {
          await updateProfile({
            display_name: data.displayName,
            bio: data.bio,
            location: data.location,
            budget: data.budget,
            personality: data.personality,
            interests: data.interests,
          } as any);
          setShowOnboarding(false);
          toast({ title: 'Profile completed ✅' });
        }}
      />
    </div>
  );
};

export default Index;
