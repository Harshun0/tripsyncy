import React, { useEffect, useMemo, useRef, useState } from 'react';
import { MapPin, Menu, X, Sparkles, User, LogIn, LogOut, Bell, Search, Heart, Bookmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { requestNotificationPermission, showBrowserNotification } from '@/lib/notifications';

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  body: string | null;
  created_at: string;
  is_read: boolean;
  actor_id: string | null;
  actor_name?: string;
}

interface HeaderProps {
  activeSection: string;
  onNavigate: (section: string) => void;
  isLoggedIn: boolean;
  onLogin: () => void;
  onLogout?: () => void;
}

const Header: React.FC<HeaderProps> = ({ activeSection, onNavigate, isLoggedIn, onLogin, onLogout }) => {
  const { user, profile } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const menuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const prevCountRef = useRef(0);

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'explore', label: 'Explore' },
    { id: 'itinerary', label: 'AI Itinerary' },
    { id: 'expenses', label: 'Expenses' },
    { id: 'search', label: 'Search' },
    { id: 'lost-found', label: 'Lost & Found' },
  ];

  const unreadCount = useMemo(() => notifications.filter((n) => !n.is_read).length, [notifications]);

  // Request notification permission on login
  useEffect(() => {
    if (user) requestNotificationPermission();
  }, [user]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (userMenuOpen && menuRef.current && !menuRef.current.contains(e.target as Node)) setUserMenuOpen(false);
      if (notificationsOpen && notifRef.current && !notifRef.current.contains(e.target as Node)) setNotificationsOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [userMenuOpen, notificationsOpen]);

  useEffect(() => {
    if (!user) return;

    const loadNotifications = async () => {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (!data) return;

      const actorIds = [...new Set((data as any[]).filter(n => n.actor_id).map(n => n.actor_id))];
      let actorMap: Record<string, string> = {};
      if (actorIds.length > 0) {
        const { data: profiles } = await supabase.from('profiles').select('id,display_name').in('id', actorIds);
        (profiles || []).forEach((p: any) => { actorMap[p.id] = p.display_name; });
      }

      const mapped = (data as any[]).map(n => ({
        ...n,
        actor_name: n.actor_id ? actorMap[n.actor_id] : undefined,
      }));

      setNotifications(mapped);

      // Browser push for new notifications
      const newUnread = mapped.filter(n => !n.is_read).length;
      if (newUnread > prevCountRef.current && prevCountRef.current > 0) {
        const latest = mapped.find(n => !n.is_read);
        if (latest) {
          const name = latest.actor_name || 'Someone';
          showBrowserNotification('TripSync', getNotifTextStatic(latest, name));
        }
      }
      prevCountRef.current = newUnread;
    };

    loadNotifications();

    const channel = supabase
      .channel('header-notifications')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, () => loadNotifications())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const markAllRead = async () => {
    await supabase.from('notifications').update({ is_read: true }).eq('user_id', user?.id).eq('is_read', false);
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  const getNotifText = (notif: NotificationItem) => {
    const name = notif.actor_name || 'Someone';
    return getNotifTextStatic(notif, name);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-effect border-b border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          <button onClick={() => onNavigate(isLoggedIn ? 'home' : 'landing')} className="flex items-center gap-2 group flex-shrink-0">
            <img 
              src="/tripsync-logo.png" 
              alt="TripSync Logo" 
              className="w-10 h-10 object-contain group-hover:scale-105 transition-transform"
            />
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
                    {unreadCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-destructive text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
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
                        {notifications.length === 0 ? (
                          <p className="p-4 text-sm text-muted-foreground">No notifications yet.</p>
                        ) : (
                          notifications.map((notif) => (
                            <div key={notif.id} className={`px-4 py-3 border-b border-border/50 ${!notif.is_read ? 'bg-primary/5' : ''}`}>
                              <p className="text-sm font-medium text-foreground">{getNotifText(notif)}</p>
                              <p className="text-[11px] text-muted-foreground mt-1">{new Date(notif.created_at).toLocaleString()}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="relative" ref={menuRef}>
                  <button onClick={() => { setUserMenuOpen(!userMenuOpen); setNotificationsOpen(false); }} className="p-2 rounded-xl bg-muted hover:bg-muted/80 transition-colors">
                    {userMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                  </button>

                  {userMenuOpen && (
                    <div className="absolute top-full right-0 mt-2 w-64 bg-background/95 backdrop-blur-xl border border-border rounded-2xl shadow-xl animate-fade-in overflow-hidden z-50">
                      <div className="p-4 border-b border-border">
                        <div className="flex items-center gap-3">
                          <img src={profile?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=50&h=50&fit=crop&crop=face'} alt={profile?.display_name || 'User'} className="w-10 h-10 rounded-full object-cover" />
                          <div>
                            <p className="font-semibold text-foreground text-sm">{profile?.display_name || 'Traveler'}</p>
                            <p className="text-xs text-muted-foreground">{profile?.location || 'Set your location'}</p>
                          </div>
                        </div>
                      </div>

                      <div className="p-2 space-y-0.5">
                        <button onClick={() => { onNavigate('profile'); setUserMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-foreground hover:bg-muted transition-colors">
                          <User className="w-4 h-4 text-primary" />My Profile
                        </button>
                        <button onClick={() => { onNavigate('liked-posts'); setUserMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-foreground hover:bg-muted transition-colors">
                          <Heart className="w-4 h-4 text-destructive" />Liked Posts
                        </button>
                        <button onClick={() => { onNavigate('saved-posts'); setUserMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-foreground hover:bg-muted transition-colors">
                          <Bookmark className="w-4 h-4 text-primary" />Saved Posts
                        </button>
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

// Static helper to avoid closure issues
function getNotifTextStatic(notif: NotificationItem, name: string) {
  switch (notif.type) {
    case 'follow_request': return `${name} requested to follow you`;
    case 'follow_accepted': return `${name} started following you`;
    case 'follow_request_accepted': return `${name} accepted your follow request`;
    case 'post_like': return `${name} liked your post`;
    case 'post_comment': return `${name} commented: ${notif.body || ''}`;
    default: return notif.body || notif.title;
  }
}

export default Header;
