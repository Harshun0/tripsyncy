import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Menu, X, Sparkles, User, LogIn, Heart, MessageSquare, Bookmark, LogOut, Bell, UserPlus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface Notification {
  id: string;
  type: 'follow' | 'like' | 'comment' | 'request' | 'message' | string;
  title: string;
  body: string | null;
  is_read: boolean;
  created_at: string;
}

interface HeaderProps {
  activeSection: string;
  onNavigate: (section: string) => void;
  isLoggedIn: boolean;
  onLogin: () => void;
  onLogout?: () => void;
  requestCount?: number;
}

const db = supabase as any;

const Header: React.FC<HeaderProps> = ({ activeSection, onNavigate, isLoggedIn, onLogin, onLogout, requestCount = 0 }) => {
  const { user, profile } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const menuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  useEffect(() => {
    if (!user) return;

    const loadNotifications = async () => {
      const { data } = await db.from('notifications').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(20);
      if (data) setNotifications(data as Notification[]);
    };

    loadNotifications();

    const channel = supabase
      .channel(`notifications-${user.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` }, () => loadNotifications())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (userMenuOpen && menuRef.current && !menuRef.current.contains(e.target as Node)) setUserMenuOpen(false);
      if (notificationsOpen && notifRef.current && !notifRef.current.contains(e.target as Node)) setNotificationsOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [userMenuOpen, notificationsOpen]);

  const markAllRead = async () => {
    if (!user) return;
    await db.from('notifications').update({ is_read: true }).eq('user_id', user.id).eq('is_read', false);
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
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
    if (type === 'follow' || type === 'request') return <UserPlus className="w-4 h-4 text-primary" />;
    if (type === 'like') return <Heart className="w-4 h-4 text-destructive" />;
    if (type === 'comment') return <MessageSquare className="w-4 h-4 text-blue-500" />;
    return <Bell className="w-4 h-4 text-primary" />;
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
                <button key={item.id} onClick={() => onNavigate(item.id)} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${activeSection === item.id ? 'gradient-primary text-primary-foreground shadow-md' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}>
                  {item.id === 'search' && <Search className="w-4 h-4 inline mr-1" />}
                  {item.label}
                </button>
              ))}
            </nav>
          )}

          <div className="flex items-center gap-2 flex-shrink-0">
            {isLoggedIn ? (
              <>
                <Button onClick={() => onNavigate('ai')} className="flex items-center gap-2 gradient-primary text-primary-foreground rounded-xl shadow-glow" size="sm">
                  <Sparkles className="w-4 h-4" />
                  <span className="hidden md:inline">Ask AI</span>
                </Button>

                <div className="relative" ref={notifRef}>
                  <button onClick={() => { setNotificationsOpen(!notificationsOpen); setUserMenuOpen(false); }} className="relative p-2 rounded-xl hover:bg-muted transition-colors">
                    <Bell className="w-5 h-5 text-foreground" />
                    {unreadCount > 0 && <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-destructive text-white text-[10px] font-bold rounded-full flex items-center justify-center">{unreadCount}</span>}
                  </button>

                  {notificationsOpen && (
                    <div className="absolute top-full right-0 mt-2 w-80 bg-background/95 backdrop-blur-xl border border-border rounded-2xl shadow-xl animate-fade-in overflow-hidden z-50">
                      <div className="px-4 py-3 flex items-center justify-between border-b border-border">
                        <h3 className="font-semibold text-foreground text-sm">Notifications</h3>
                        {unreadCount > 0 && <button onClick={markAllRead} className="text-xs text-primary font-medium hover:underline">Mark all read</button>}
                      </div>
                      <div className="max-h-80 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <p className="p-4 text-sm text-muted-foreground">No notifications yet.</p>
                        ) : notifications.map((notif) => (
                          <div key={notif.id} className={`px-4 py-3 flex items-start gap-3 ${!notif.is_read ? 'bg-primary/5' : ''}`}>
                            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">{getNotificationIcon(notif.type)}</div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm ${!notif.is_read ? 'font-medium text-foreground' : 'text-muted-foreground'}`}>{notif.title}</p>
                              {notif.body && <p className="text-xs text-muted-foreground mt-0.5">{notif.body}</p>}
                              <p className="text-[10px] text-muted-foreground mt-1">{new Date(notif.created_at).toLocaleString()}</p>
                            </div>
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
                          <img src={profile?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=50&h=50&fit=crop&crop=face'} alt="You" className="w-10 h-10 rounded-full object-cover" />
                          <div>
                            <p className="font-semibold text-foreground text-sm">{profile?.display_name || 'Traveler'}</p>
                            <p className="text-xs text-muted-foreground">{profile?.location || 'Unknown location'}</p>
                          </div>
                        </div>
                      </div>

                      <div className="lg:hidden p-2 border-b border-border">
                        {navItems.map((item) => (
                          <button key={item.id} onClick={() => { onNavigate(item.id); setUserMenuOpen(false); }} className={`w-full px-4 py-2.5 rounded-xl text-left text-sm font-medium transition-all ${activeSection === item.id ? 'gradient-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'}`}>
                            {item.label}
                          </button>
                        ))}
                      </div>

                      <div className="p-2">
                        {userMenuItems.map(({ icon: Icon, label, id, badge }) => (
                          <button key={id} onClick={() => { onNavigate(id); setUserMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-foreground hover:bg-muted transition-colors">
                            <Icon className="w-4 h-4 text-primary" />
                            <span className="flex-1 text-left">{label}</span>
                            {badge && badge > 0 && <span className="w-5 h-5 bg-destructive text-white text-[10px] font-bold rounded-full flex items-center justify-center">{badge}</span>}
                          </button>
                        ))}
                      </div>

                      <div className="p-2 border-t border-border">
                        <button onClick={() => { onLogout?.(); setUserMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/5 transition-colors">
                          <LogOut className="w-4 h-4" />Log Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
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
