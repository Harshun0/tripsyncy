import React, { useState } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import FloatingMessagesButton from '@/components/layout/FloatingMessagesButton';
import MessagesPanel from '@/components/layout/MessagesPanel';
import HeroSection from '@/components/sections/HeroSection';
import FeaturesSection from '@/components/sections/FeaturesSection';
import TravelersSection from '@/components/sections/TravelersSection';
import FeedSection from '@/components/sections/FeedSection';
import ItinerarySection from '@/components/sections/ItinerarySection';
import SafetySection from '@/components/sections/SafetySection';
import ExpenseSection from '@/components/sections/ExpenseSection';
import ProfileSection from '@/components/sections/ProfileSection';
import AIChatModal from '@/components/sections/AIChatModal';
import LoginModal from '@/components/modals/LoginModal';

const Index: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeSection, setActiveSection] = useState('landing');
  const [showAIChat, setShowAIChat] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showMessagesPanel, setShowMessagesPanel] = useState(false);

  const handleNavigate = (section: string) => {
    if (section === 'ai') {
      setShowAIChat(true);
      return;
    }
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

  const handleGetStarted = () => {
    if (isLoggedIn) {
      handleNavigate('home');
    } else {
      setShowLoginModal(true);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setActiveSection('landing');
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'landing':
        return (
          <>
            <HeroSection 
              onGetStarted={handleGetStarted} 
              onExplore={() => handleNavigate('explore')}
              isLoggedIn={isLoggedIn}
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
            <ProfileSection onLogout={handleLogout} />
          </div>
        );
      default:
        return (
          <>
            <HeroSection 
              onGetStarted={handleGetStarted} 
              onExplore={() => handleNavigate('explore')}
              isLoggedIn={isLoggedIn}
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
      
      {/* Floating Messages Button (only show when logged in) */}
      {isLoggedIn && (
        <>
          <FloatingMessagesButton 
            onClick={() => setShowMessagesPanel(!showMessagesPanel)} 
            isOpen={showMessagesPanel}
            unreadCount={2}
          />
          
          {/* Messages Panel */}
          <MessagesPanel 
            isOpen={showMessagesPanel} 
            onClose={() => setShowMessagesPanel(false)} 
          />
        </>
      )}
      
      {/* AI Chat Modal */}
      <AIChatModal 
        isOpen={showAIChat} 
        onClose={() => setShowAIChat(false)} 
      />

      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onComplete={handleLoginComplete}
      />
    </div>
  );
};

export default Index;
