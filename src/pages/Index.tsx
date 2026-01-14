import React, { useState } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import FloatingChatButton from '@/components/layout/FloatingChatButton';
import HeroSection from '@/components/sections/HeroSection';
import FeaturesSection from '@/components/sections/FeaturesSection';
import TravelersSection from '@/components/sections/TravelersSection';
import FeedSection from '@/components/sections/FeedSection';
import ItinerarySection from '@/components/sections/ItinerarySection';
import SafetySection from '@/components/sections/SafetySection';
import ExpenseSection from '@/components/sections/ExpenseSection';
import ProfileSection from '@/components/sections/ProfileSection';
import AIChatModal from '@/components/sections/AIChatModal';
import OnboardingScreen from '@/components/screens/OnboardingScreen';

const Index: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [activeSection, setActiveSection] = useState('landing');
  const [showAIChat, setShowAIChat] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const handleNavigate = (section: string) => {
    setActiveSection(section);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogin = () => {
    setShowLoginModal(true);
  };

  const handleLoginComplete = () => {
    setIsLoggedIn(true);
    setShowLoginModal(false);
    setActiveSection('home');
  };

  // Login Modal
  if (showLoginModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div className="w-full max-w-md bg-background rounded-3xl shadow-2xl overflow-hidden">
          <OnboardingScreen onComplete={handleLoginComplete} />
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeSection) {
      case 'landing':
        return (
          <>
            <HeroSection 
              onGetStarted={() => handleNavigate('home')} 
              onExplore={() => handleNavigate('explore')}
            />
            <FeaturesSection />
            <TravelersSection />
            <ItinerarySection />
            <SafetySection />
          </>
        );
      case 'home':
        return (
          <div className="pt-20">
            <FeedSection />
          </div>
        );
      case 'explore':
        return (
          <div className="pt-20">
            <TravelersSection />
          </div>
        );
      case 'itinerary':
        return (
          <div className="pt-20">
            <ItinerarySection />
          </div>
        );
      case 'safety':
        return (
          <div className="pt-20">
            <SafetySection />
          </div>
        );
      case 'expenses':
        return (
          <div className="pt-20">
            <ExpenseSection />
          </div>
        );
      case 'profile':
        return (
          <div className="pt-20">
            <ProfileSection />
          </div>
        );
      case 'ai':
        setShowAIChat(true);
        setActiveSection('landing');
        return (
          <>
            <HeroSection 
              onGetStarted={() => handleNavigate('home')} 
              onExplore={() => handleNavigate('explore')}
            />
            <FeaturesSection />
          </>
        );
      default:
        return (
          <>
            <HeroSection 
              onGetStarted={() => handleNavigate('home')} 
              onExplore={() => handleNavigate('explore')}
            />
            <FeaturesSection />
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header 
        activeSection={activeSection} 
        onNavigate={handleNavigate}
        isLoggedIn={isLoggedIn}
        onLogin={handleLogin}
      />
      
      <main>
        {renderContent()}
      </main>
      
      <Footer />
      
      {/* Floating AI Chat Button */}
      <FloatingChatButton 
        onClick={() => setShowAIChat(!showAIChat)} 
        isOpen={showAIChat}
      />
      
      {/* AI Chat Modal */}
      <AIChatModal 
        isOpen={showAIChat} 
        onClose={() => setShowAIChat(false)} 
      />
    </div>
  );
};

export default Index;
