import React from 'react';
import { Sparkles, Users, MapPin, Wallet, MessageCircle, ArrowRight, Globe, Zap, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FeaturesSectionProps {
  onNavigate?: (section: string) => void;
  isLoggedIn?: boolean;
}

const FeaturesSection: React.FC<FeaturesSectionProps> = ({ onNavigate, isLoggedIn }) => {
  const highlights = [
    {
      icon: Sparkles,
      title: 'AI-Powered Planning',
      description: 'Our smart AI creates personalized itineraries with cost breakdowns tailored to your style.',
      color: 'from-primary to-accent',
    },
    {
      icon: Users,
      title: 'Find Your Tribe',
      description: 'Get matched with compatible travel buddies based on interests, budget, and personality.',
      color: 'from-secondary to-sunset-pink',
    },
    {
      icon: Wallet,
      title: 'Hassle-Free Expenses',
      description: 'Split costs, track payments, and settle up instantly with integrated UPI support.',
      color: 'from-success to-primary',
    },
    {
      icon: MessageCircle,
      title: 'Safe Connections',
      description: 'Request-based messaging ensures you only chat with verified, trusted travelers.',
      color: 'from-accent to-secondary',
    },
  ];

  const handleGetStarted = () => {
    if (onNavigate) {
      onNavigate(isLoggedIn ? 'explore' : 'login');
    }
  };

  return (
    <section className="py-20 lg:py-32 bg-gradient-to-b from-background to-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            Why TripSync?
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Your All-in-One
            <span className="text-gradient"> Travel Companion</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            TripSync brings together everything you need — from smart planning to real connections — so you can focus on the adventure.
          </p>
        </div>

        {/* Highlight cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {highlights.map(({ icon: Icon, title, description, color }) => (
            <div key={title} className="group p-6 bg-card rounded-2xl border border-border hover:border-primary/30 hover:shadow-xl transition-all duration-300 text-center">
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center mb-5 mx-auto shadow-lg group-hover:scale-110 transition-transform`}>
                <Icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
            </div>
          ))}
        </div>

        {/* Big CTA banner */}
        <div className="relative overflow-hidden rounded-3xl gradient-hero p-10 sm:p-16 text-center">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-10 left-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-10 right-10 w-60 h-60 bg-white/5 rounded-full blur-3xl" />
          </div>
          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <div className="flex justify-center gap-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-white">
              Plan Smarter. Connect Safely. Travel Better.
            </h3>
            <p className="text-white/80 text-lg">
              Sign in to unlock AI itineraries, find travel buddies, split expenses, and explore a world of curated adventures.
            </p>
            <Button
              onClick={handleGetStarted}
              size="lg"
              className="h-14 px-10 bg-white text-primary hover:bg-white/90 rounded-2xl text-lg font-semibold shadow-xl transition-all"
            >
              {isLoggedIn ? 'Explore Now' : 'Get Started Free'}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
