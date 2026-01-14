import React, { useState } from 'react';
import { MapPin, Menu, X, Sparkles, User, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  activeSection: string;
  onNavigate: (section: string) => void;
  isLoggedIn: boolean;
  onLogin: () => void;
}

const Header: React.FC<HeaderProps> = ({ activeSection, onNavigate, isLoggedIn, onLogin }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'explore', label: 'Explore' },
    { id: 'itinerary', label: 'AI Itinerary' },
    { id: 'safety', label: 'Safety' },
    { id: 'expenses', label: 'Expenses' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-effect border-b border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <button 
            onClick={() => onNavigate('landing')}
            className="flex items-center gap-2 group"
          >
            <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center shadow-glow group-hover:scale-105 transition-transform">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gradient hidden sm:block">TripSync</span>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
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

          {/* Right Section */}
          <div className="flex items-center gap-3">
            {/* AI Button */}
            <Button
              onClick={() => onNavigate('ai')}
              className="hidden sm:flex items-center gap-2 gradient-primary text-primary-foreground rounded-xl shadow-glow hover:shadow-lg transition-shadow"
            >
              <Sparkles className="w-4 h-4" />
              <span className="hidden md:inline">Ask AI</span>
            </Button>

            {isLoggedIn ? (
              <Button
                onClick={() => onNavigate('profile')}
                variant="outline"
                className="hidden sm:flex items-center gap-2 rounded-xl border-2 border-primary text-primary"
              >
                <User className="w-4 h-4" />
                <span className="hidden md:inline">Profile</span>
              </Button>
            ) : (
              <Button
                onClick={onLogin}
                variant="outline"
                className="hidden sm:flex items-center gap-2 rounded-xl border-2 border-primary text-primary"
              >
                <LogIn className="w-4 h-4" />
                <span className="hidden md:inline">Login</span>
              </Button>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl bg-muted hover:bg-muted/80 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-background/95 backdrop-blur-xl border-b border-border shadow-xl animate-fade-in">
          <div className="max-w-7xl mx-auto px-4 py-4 space-y-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full px-4 py-3 rounded-xl text-left font-medium transition-all ${
                  activeSection === item.id
                    ? 'gradient-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted'
                }`}
              >
                {item.label}
              </button>
            ))}
            <div className="pt-2 border-t border-border flex gap-2">
              <Button
                onClick={() => {
                  onNavigate('ai');
                  setMobileMenuOpen(false);
                }}
                className="flex-1 gradient-primary text-primary-foreground rounded-xl"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Ask AI
              </Button>
              {!isLoggedIn && (
                <Button
                  onClick={() => {
                    onLogin();
                    setMobileMenuOpen(false);
                  }}
                  variant="outline"
                  className="flex-1 rounded-xl border-2 border-primary text-primary"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Login
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
