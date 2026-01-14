import React, { useState } from 'react';
import MobileFrame from '@/components/MobileFrame';
import BottomNavigation from '@/components/BottomNavigation';
import FloatingAIButton from '@/components/FloatingAIButton';
import OnboardingScreen from '@/components/screens/OnboardingScreen';
import HomeFeedScreen from '@/components/screens/HomeFeedScreen';
import ProfileScreen from '@/components/screens/ProfileScreen';
import AIChatScreen from '@/components/screens/AIChatScreen';
import ExploreScreen from '@/components/screens/ExploreScreen';
import ChatListScreen from '@/components/screens/ChatListScreen';
import MessagingScreen from '@/components/screens/MessagingScreen';
import MatchScoreScreen from '@/components/screens/MatchScoreScreen';
import ItineraryScreen from '@/components/screens/ItineraryScreen';
import ExpenseSplitScreen from '@/components/screens/ExpenseSplitScreen';
import EmergencyScreen from '@/components/screens/EmergencyScreen';

const Index: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [showAIChat, setShowAIChat] = useState(false);
  const [showMessaging, setShowMessaging] = useState(false);
  const [showMatchScore, setShowMatchScore] = useState(false);
  const [showItinerary, setShowItinerary] = useState(false);
  const [showExpenseSplit, setShowExpenseSplit] = useState(false);
  const [showEmergency, setShowEmergency] = useState(false);
  const [selectedChatUser, setSelectedChatUser] = useState<string>('2');

  const handleTabChange = (tab: string) => {
    if (tab === 'ai') {
      setShowAIChat(true);
    } else {
      setActiveTab(tab);
    }
  };

  const handleOpenChat = (userId: string) => {
    setSelectedChatUser(userId);
    setShowMessaging(true);
  };

  const renderMainContent = () => {
    // Full screen overlays
    if (showAIChat) {
      return <AIChatScreen onClose={() => setShowAIChat(false)} />;
    }
    if (showMessaging) {
      return (
        <MessagingScreen 
          onBack={() => setShowMessaging(false)} 
          chatWithId={selectedChatUser}
        />
      );
    }
    if (showMatchScore) {
      return <MatchScoreScreen onBack={() => setShowMatchScore(false)} />;
    }
    if (showItinerary) {
      return <ItineraryScreen onBack={() => setShowItinerary(false)} />;
    }
    if (showExpenseSplit) {
      return <ExpenseSplitScreen onBack={() => setShowExpenseSplit(false)} />;
    }
    if (showEmergency) {
      return <EmergencyScreen onBack={() => setShowEmergency(false)} />;
    }

    // Tab content
    switch (activeTab) {
      case 'home':
        return <HomeFeedScreen />;
      case 'explore':
        return <ExploreScreen />;
      case 'chat':
        return <ChatListScreen onOpenChat={handleOpenChat} />;
      case 'profile':
        return <ProfileScreen />;
      default:
        return <HomeFeedScreen />;
    }
  };

  // Show onboarding if not logged in
  if (!isLoggedIn) {
    return (
      <MobileFrame>
        <OnboardingScreen onComplete={() => setIsLoggedIn(true)} />
      </MobileFrame>
    );
  }

  // Show main app with navigation
  const showNavAndFloating = !showAIChat && !showMessaging && !showMatchScore && 
    !showItinerary && !showExpenseSplit && !showEmergency;

  return (
    <MobileFrame>
      {renderMainContent()}
      
      {showNavAndFloating && (
        <>
          <FloatingAIButton onClick={() => setShowAIChat(true)} />
          <BottomNavigation activeTab={activeTab} onTabChange={handleTabChange} />
        </>
      )}
    </MobileFrame>
  );
};

export default Index;
