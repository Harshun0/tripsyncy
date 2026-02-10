import React, { useState, useCallback } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import FloatingMessagesButton from '@/components/layout/FloatingMessagesButton';
import MessagesPanel from '@/components/layout/MessagesPanel';
import HeroSection from '@/components/sections/HeroSection';
import FeaturesSection from '@/components/sections/FeaturesSection';
import TravelersSection from '@/components/sections/TravelersSection';
import FeedSection from '@/components/sections/FeedSection';
import ItinerarySection from '@/components/sections/ItinerarySection';
import ExpenseSection from '@/components/sections/ExpenseSection';
import ProfileSection from '@/components/sections/ProfileSection';
import AIChatModal from '@/components/sections/AIChatModal';
import LoginModal from '@/components/modals/LoginModal';
import { Heart, MessageSquare, Bookmark, UserPlus } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface UserActivity {
  likedPosts: { postId: string; userName: string; caption: string }[];
  commentedPosts: { postId: string; userName: string; comment: string }[];
  savedPosts: { postId: string; userName: string; caption: string }[];
}

const Index: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeSection, setActiveSection] = useState('landing');
  const [showAIChat, setShowAIChat] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showMessagesPanel, setShowMessagesPanel] = useState(false);
  const [requestCount] = useState(3);

  const [userActivity, setUserActivity] = useState<UserActivity>({
    likedPosts: [],
    commentedPosts: [],
    savedPosts: [],
  });

  const handleLikePost = useCallback((postId: string, liked: boolean) => {
    setUserActivity(prev => {
      if (liked) {
        const postNames: Record<string, { userName: string; caption: string }> = {
          '1': { userName: 'Arjun Patel', caption: 'Found peace by the Ganges 🙏' },
          '2': { userName: 'Priya Sharma', caption: 'Conquered Khardung La at 18,380 ft! 🏔️' },
          '3': { userName: 'Sneha Kapoor', caption: 'Walking through history at Hampi' },
          '4': { userName: 'Vikram Singh', caption: 'Sunset sessions at Arambol beach 🌅' },
        };
        const info = postNames[postId] || { userName: 'Unknown', caption: '' };
        return { ...prev, likedPosts: [...prev.likedPosts, { postId, ...info }] };
      }
      return { ...prev, likedPosts: prev.likedPosts.filter(p => p.postId !== postId) };
    });
  }, []);

  const handleCommentPost = useCallback((postId: string, comment: string) => {
    const postNames: Record<string, string> = {
      '1': 'Arjun Patel', '2': 'Priya Sharma', '3': 'Sneha Kapoor', '4': 'Vikram Singh',
    };
    setUserActivity(prev => ({
      ...prev,
      commentedPosts: [...prev.commentedPosts, { postId, userName: postNames[postId] || 'Unknown', comment }],
    }));
  }, []);

  const handleSavePost = useCallback((postId: string, saved: boolean) => {
    setUserActivity(prev => {
      if (saved) {
        const postNames: Record<string, { userName: string; caption: string }> = {
          '1': { userName: 'Arjun Patel', caption: 'Found peace by the Ganges 🙏' },
          '2': { userName: 'Priya Sharma', caption: 'Conquered Khardung La at 18,380 ft! 🏔️' },
          '3': { userName: 'Sneha Kapoor', caption: 'Walking through history at Hampi' },
          '4': { userName: 'Vikram Singh', caption: 'Sunset sessions at Arambol beach 🌅' },
        };
        const info = postNames[postId] || { userName: 'Unknown', caption: '' };
        return { ...prev, savedPosts: [...prev.savedPosts, { postId, ...info }] };
      }
      return { ...prev, savedPosts: prev.savedPosts.filter(p => p.postId !== postId) };
    });
  }, []);

  const handleNavigate = (section: string) => {
    if (section === 'ai') {
      setShowAIChat(true);
      return;
    }
    setActiveSection(section);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogin = () => { setShowLoginModal(true); };
  const handleLoginComplete = () => { setIsLoggedIn(true); setShowLoginModal(false); setActiveSection('home'); };
  const handleGetStarted = () => { if (isLoggedIn) { handleNavigate('home'); } else { setShowLoginModal(true); } };
  const handleLogout = () => {
    setIsLoggedIn(false);
    setActiveSection('landing');
    setShowMessagesPanel(false);
    toast({ title: 'Logged out successfully 👋' });
  };

  const renderActivityPage = (type: 'liked' | 'comments' | 'saved' | 'requests') => {
    const icons = { liked: Heart, comments: MessageSquare, saved: Bookmark, requests: UserPlus };
    const titles = { liked: 'Liked Posts', comments: 'My Comments', saved: 'Saved Posts', requests: 'Requests' };
    const Icon = icons[type];

    let items: { label: string; sub: string }[] = [];
    if (type === 'liked') items = userActivity.likedPosts.map(p => ({ label: p.userName, sub: p.caption }));
    if (type === 'comments') items = userActivity.commentedPosts.map(p => ({ label: `On ${p.userName}'s post`, sub: `"${p.comment}"` }));
    if (type === 'saved') items = userActivity.savedPosts.map(p => ({ label: p.userName, sub: p.caption }));

    return (
      <div className="pt-20">
        <section className="py-20 bg-background">
          <div className="max-w-3xl mx-auto px-4">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center">
                <Icon className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">{titles[type]}</h1>
            </div>
            {type === 'requests' ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">Open the Messages panel to view and manage your trip requests.</p>
                <button onClick={() => setShowMessagesPanel(true)} className="px-6 py-3 gradient-primary text-white rounded-xl font-medium">
                  Open Messages
                </button>
              </div>
            ) : items.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                  <Icon className="w-10 h-10 text-muted-foreground" />
                </div>
                <p className="text-lg font-medium text-foreground mb-2">Nothing here yet</p>
                <p className="text-muted-foreground">
                  {type === 'liked' && 'Posts you like will appear here'}
                  {type === 'comments' && 'Your comments on posts will appear here'}
                  {type === 'saved' && 'Posts you save will appear here'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {items.map((item, i) => (
                  <div key={i} className="travel-card p-4 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground text-sm">{item.label}</p>
                      <p className="text-xs text-muted-foreground truncate">{item.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'landing':
        return (
          <>
            <HeroSection onGetStarted={handleGetStarted} onExplore={() => handleNavigate('explore')} isLoggedIn={isLoggedIn} />
            <FeaturesSection />
            <TravelersSection />
            <ItinerarySection />
          </>
        );
      case 'home':
        return <div className="pt-20"><FeedSection onLikePost={handleLikePost} onCommentPost={handleCommentPost} onSavePost={handleSavePost} /></div>;
      case 'explore':
        return <div className="pt-20"><TravelersSection /></div>;
      case 'itinerary':
        return <div className="pt-20"><ItinerarySection /></div>;
      case 'expenses':
        return <div className="pt-20"><ExpenseSection /></div>;
      case 'profile':
        return <div className="pt-20"><ProfileSection onLogout={handleLogout} onOpenMessages={() => setShowMessagesPanel(true)} /></div>;
      case 'liked':
        return renderActivityPage('liked');
      case 'comments':
        return renderActivityPage('comments');
      case 'saved':
        return renderActivityPage('saved');
      case 'requests':
        return renderActivityPage('requests');
      default:
        return (
          <>
            <HeroSection onGetStarted={handleGetStarted} onExplore={() => handleNavigate('explore')} isLoggedIn={isLoggedIn} />
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
        onLogout={handleLogout}
        requestCount={requestCount}
      />
      <main>{renderContent()}</main>
      <Footer />
      {isLoggedIn && (
        <>
          <FloatingMessagesButton onClick={() => setShowMessagesPanel(!showMessagesPanel)} isOpen={showMessagesPanel} unreadCount={2} />
          <MessagesPanel isOpen={showMessagesPanel} onClose={() => setShowMessagesPanel(false)} />
        </>
      )}
      <AIChatModal isOpen={showAIChat} onClose={() => setShowAIChat(false)} />
      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} onComplete={handleLoginComplete} />
    </div>
  );
};

export default Index;
