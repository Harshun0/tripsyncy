import React, { useState } from 'react';
import { MapPin, Menu, X, Sparkles, User, LogIn, Heart, MessageSquare, Bookmark, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  activeSection: string;
  onNavigate: (section: string) => void;
  isLoggedIn: boolean;
  onLogin: () => void;
  onLogout?: () => void;
}

const Header: React.FC<HeaderProps> = ({ activeSection, onNavigate, isLoggedIn, onLogin, onLogout }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'explore', label: 'Explore' },
    { id: 'itinerary', label: 'AI Itinerary' },
    { id: 'expenses', label: 'Expenses' },
  ];

  const userMenuItems = [
    { icon: Heart, label: 'Liked Posts', id: 'liked' },
    { icon: MessageSquare, label: 'My Comments', id: 'comments' },
    { icon: Bookmark, label: 'Saved Posts', id: 'saved' },
    { icon: User, label: 'My Profile', id: 'profile' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-effect border-b border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <button 
            onClick={() => onNavigate('landing')}
            className="flex items-center gap-2 group flex-shrink-0"
          >
            <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center shadow-glow group-hover:scale-105 transition-transform">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gradient hidden sm:block">TripSync</span>
          </button>

          {/* Desktop Navigation - Center */}
          {isLoggedIn && (
            <nav className="hidden lg:flex items-center gap-1 flex-1 justify-center mx-4">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                    activeSection === item.id
                      ? 'gradient-primary text-primary-foreground shadow-md'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          )}

          {/* Right Section */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {/* AI Button - only when logged in */}
            {isLoggedIn && (
              <Button
                onClick={() => onNavigate('ai')}
                className="flex items-center gap-2 gradient-primary text-primary-foreground rounded-xl shadow-glow hover:shadow-lg transition-shadow"
              >
                <Sparkles className="w-4 h-4" />
                <span className="hidden md:inline">Ask AI</span>
              </Button>
            )}

            {isLoggedIn ? (
              <>
                <Button
                  onClick={() => onNavigate('profile')}
                  variant="outline"
                  className="hidden sm:flex items-center gap-2 rounded-xl border-2 border-primary text-primary"
                >
                  <User className="w-4 h-4" />
                  <span className="hidden md:inline">Profile</span>
                </Button>

                {/* User Menu Toggle (three lines) */}
                <div className="relative">
                  <button
                    onClick={() => { setUserMenuOpen(!userMenuOpen); setMobileMenuOpen(false); }}
                    className="p-2 rounded-xl bg-muted hover:bg-muted/80 transition-colors"
                  >
                    {userMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                  </button>

                  {/* User Dropdown Menu */}
                  {userMenuOpen && (
                    <div className="absolute top-full right-0 mt-2 w-64 bg-background/95 backdrop-blur-xl border border-border rounded-2xl shadow-xl animate-fade-in overflow-hidden z-50">
                      <div className="p-4 border-b border-border">
                        <div className="flex items-center gap-3">
                          <img
                            src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=50&h=50&fit=crop&crop=face"
                            alt="You"
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          <div>
                            <p className="font-semibold text-foreground text-sm">Traveler</p>
                            <p className="text-xs text-muted-foreground">Mumbai, India</p>
                          </div>
                        </div>
                      </div>

                      {/* Mobile nav items */}
                      <div className="lg:hidden p-2 border-b border-border">
                        {navItems.map((item) => (
                          <button
                            key={item.id}
                            onClick={() => { onNavigate(item.id); setUserMenuOpen(false); }}
                            className={`w-full px-4 py-2.5 rounded-xl text-left text-sm font-medium transition-all ${
                              activeSection === item.id
                                ? 'gradient-primary text-primary-foreground'
                                : 'text-muted-foreground hover:bg-muted'
                            }`}
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>

                      <div className="p-2">
                        {userMenuItems.map(({ icon: Icon, label, id }) => (
                          <button
                            key={id}
                            onClick={() => { onNavigate(id === 'profile' ? 'profile' : id); setUserMenuOpen(false); }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-foreground hover:bg-muted transition-colors"
                          >
                            <Icon className="w-4 h-4 text-primary" />
                            {label}
                          </button>
                        ))}
                      </div>

                      <div className="p-2 border-t border-border">
                        <button
                          onClick={() => { onLogout?.(); setUserMenuOpen(false); }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/5 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Log Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <Button
                onClick={onLogin}
                className="flex items-center gap-2 gradient-primary text-primary-foreground rounded-xl shadow-glow"
              >
                <LogIn className="w-4 h-4" />
                <span>Login</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
