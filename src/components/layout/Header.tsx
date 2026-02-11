import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Menu, X, Sparkles, User, LogIn, Heart, MessageSquare, Bookmark, LogOut, Bell, UserPlus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Notification {
  id: string;
  type: 'follow' | 'like' | 'comment' | 'request';
  message: string;
  timestamp: string;
  read: boolean;
}

interface HeaderProps {
  activeSection: string;
  onNavigate: (section: string) => void;
  isLoggedIn: boolean;
  onLogin: () => void;
  onLogout?: () => void;
  requestCount?: number;
}

const Header: React.FC<HeaderProps> = ({ activeSection, onNavigate, isLoggedIn, onLogin, onLogout, requestCount = 0 }) => {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const [notifications, setNotifications] = useState<Notification[]>([
    { id: '1', type: 'request', message: 'Ananya Roy sent you a follow request', timestamp: '30m ago', read: false },
    { id: '2', type: 'like', message: 'Priya Sharma liked your post about Rishikesh', timestamp: '1h ago', read: false },
    { id: '3', type: 'comment', message: 'Arjun Patel commented on your Goa photo', timestamp: '2h ago', read: false },
    { id: '4', type: 'follow', message: 'Sneha Kapoor started following you', timestamp: '5h ago', read: true },
    { id: '5', type: 'like', message: 'Vikram Singh liked your post', timestamp: '1d ago', read: true },
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (userMenuOpen && menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
      if (notificationsOpen && notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [userMenuOpen, notificationsOpen]);

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'explore', label: 'Explore' },
    { id: 'itinerary', label: 'AI Itinerary' },
    { id: 'expenses', label: 'Expenses' },
    { id: 'search', label: 'Search' },
  ];

  const userMenuItems = [
    { icon: Heart, label: 'Liked Posts', id: 'liked' },
    { icon: MessageSquare, label: 'My Comments', id: 'comments' },
    { icon: Bookmark, label: 'Saved Posts', id: 'saved' },
    { icon: UserPlus, label: 'Requests', id: 'requests', badge: requestCount },
    { icon: User, label: 'My Profile', id: 'profile' },
  ];

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'follow': return <UserPlus className="w-4 h-4 text-primary" />;
      case 'like': return <Heart className="w-4 h-4 text-destructive" />;
      case 'comment': return <MessageSquare className="w-4 h-4 text-blue-500" />;
      case 'request': return <UserPlus className="w-4 h-4 text-orange-500" />;
      default: return <Bell className="w-4 h-4 text-primary" />;
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-effect border-b border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          <button onClick={() => onNavigate(isLoggedIn ? 'home' : 'landing')} className="flex items-center gap-2 group flex-shrink-0">
            <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center shadow-glow group-hover:scale-105 transition-transform">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gradient hidden sm:block">TripSync</span>
          </button>

          {isLoggedIn && (
            <nav className="hidden lg:flex items-center gap-1 flex-1 justify-center mx-4">
              {navItems.map((item) => (
                <button key={item.id} onClick={() => onNavigate(item.id)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                    activeSection === item.id ? 'gradient-primary text-primary-foreground shadow-md' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  {item.id === 'search' && <Search className="w-4 h-4 inline mr-1" />}
                  {item.label}
                </button>
              ))}
            </nav>
          )}

          <div className="flex items-center gap-2 flex-shrink-0">
            {isLoggedIn && (
              <>
                <Button onClick={() => onNavigate('ai')} className="flex items-center gap-2 gradient-primary text-primary-foreground rounded-xl shadow-glow hover:shadow-lg transition-shadow" size="sm">
                  <Sparkles className="w-4 h-4" />
                  <span className="hidden md:inline">Ask AI</span>
                </Button>

                <div className="relative" ref={notifRef}>
                  <button onClick={() => { setNotificationsOpen(!notificationsOpen); setUserMenuOpen(false); }} className="relative p-2 rounded-xl hover:bg-muted transition-colors">
                    <Bell className="w-5 h-5 text-foreground" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-destructive text-white text-[10px] font-bold rounded-full flex items-center justify-center">{unreadCount}</span>
                    )}
                  </button>

                  {notificationsOpen && (
                    <div className="absolute top-full right-0 mt-2 w-80 bg-background/95 backdrop-blur-xl border border-border rounded-2xl shadow-xl animate-fade-in overflow-hidden z-50">
                      <div className="px-4 py-3 flex items-center justify-between border-b border-border">
                        <h3 className="font-semibold text-foreground text-sm">Notifications</h3>
                        {unreadCount > 0 && (
                          <button onClick={markAllRead} className="text-xs text-primary font-medium hover:underline">Mark all read</button>
                        )}
                      </div>
                      <div className="max-h-80 overflow-y-auto">
                        {notifications.map((notif) => (
                          <div key={notif.id} className={`px-4 py-3 flex items-start gap-3 hover:bg-muted/50 transition-colors ${!notif.read ? 'bg-primary/5' : ''}`}>
                            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">{getNotificationIcon(notif.type)}</div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm ${!notif.read ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>{notif.message}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">{notif.timestamp}</p>
                            </div>
                            {!notif.read && <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-2" />}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <Button onClick={() => onNavigate('profile')} variant="outline" size="sm" className="hidden sm:flex items-center gap-2 rounded-xl border-2 border-primary text-primary">
                  <User className="w-4 h-4" />
                  <span className="hidden md:inline">Profile</span>
                </Button>

                <div className="relative" ref={menuRef}>
                  <button onClick={() => { setUserMenuOpen(!userMenuOpen); setNotificationsOpen(false); }} className="p-2 rounded-xl bg-muted hover:bg-muted/80 transition-colors">
                    {userMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                  </button>

                  {userMenuOpen && (
                    <div className="absolute top-full right-0 mt-2 w-64 bg-background/95 backdrop-blur-xl border border-border rounded-2xl shadow-xl animate-fade-in overflow-hidden z-50">
                      <div className="p-4 border-b border-border">
                        <div className="flex items-center gap-3">
                          <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=50&h=50&fit=crop&crop=face" alt="You" className="w-10 h-10 rounded-full object-cover" />
                          <div>
                            <p className="font-semibold text-foreground text-sm">Traveler</p>
                            <p className="text-xs text-muted-foreground">Mumbai, India</p>
                          </div>
                        </div>
                      </div>

                      <div className="lg:hidden p-2 border-b border-border">
                        {navItems.map((item) => (
                          <button key={item.id} onClick={() => { onNavigate(item.id); setUserMenuOpen(false); }}
                            className={`w-full px-4 py-2.5 rounded-xl text-left text-sm font-medium transition-all ${
                              activeSection === item.id ? 'gradient-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'
                            }`}
                          >{item.label}</button>
                        ))}
                      </div>

                      <div className="p-2">
                        {userMenuItems.map(({ icon: Icon, label, id, badge }) => (
                          <button key={id} onClick={() => { onNavigate(id); setUserMenuOpen(false); }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-foreground hover:bg-muted transition-colors"
                          >
                            <Icon className="w-4 h-4 text-primary" />
                            <span className="flex-1 text-left">{label}</span>
                            {badge && badge > 0 && (
                              <span className="w-5 h-5 bg-destructive text-white text-[10px] font-bold rounded-full flex items-center justify-center">{badge}</span>
                            )}
                          </button>
                        ))}
                      </div>

                      <div className="p-2 border-t border-border">
                        <button onClick={() => { onLogout?.(); setUserMenuOpen(false); }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/5 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />Log Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {!isLoggedIn && (
              <Button onClick={onLogin} className="flex items-center gap-2 gradient-primary text-primary-foreground rounded-xl shadow-glow">
                <LogIn className="w-4 h-4" /><span>Login</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
