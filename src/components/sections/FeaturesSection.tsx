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
      gradient: 'from-primary to-accent',
      glow: 'group-hover:shadow-glow',
    },
    {
      icon: Users,
      title: 'Find Your Tribe',
      description: 'Get matched with compatible travel buddies based on interests, budget, and personality.',
      gradient: 'from-secondary to-sunset-pink',
      glow: 'group-hover:shadow-glow-sunset',
    },
    {
      icon: Wallet,
      title: 'Hassle-Free Expenses',
      description: 'Split costs, track payments, and settle up instantly with integrated UPI support.',
      gradient: 'from-success to-primary',
      glow: 'group-hover:shadow-glow',
    },
    {
      icon: MessageCircle,
      title: 'Safe Connections',
      description: 'Request-based messaging ensures you only chat with verified, trusted travelers.',
      gradient: 'from-accent to-secondary',
      glow: 'group-hover:shadow-glow-sunset',
    },
  ];

  const handleGetStarted = () => {
    if (onNavigate) onNavigate(isLoggedIn ? 'explore' : 'login');
  };

  return (
    <section className="py-24 lg:py-36 bg-gradient-to-b from-background to-muted/30 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 gradient-mesh opacity-40 pointer-events-none" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary/8 rounded-full text-primary text-sm font-semibold mb-6 border border-primary/15">
            <Sparkles className="w-4 h-4" />
            Why TripSync?
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6 font-display leading-tight">
            Your All-in-One
            <span className="text-gradient"> Travel Companion</span>
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            TripSync brings together everything you need — from smart planning to real connections — so you can focus on the adventure.
          </p>
        </div>

        {/* Feature cards with staggered animation */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-20 stagger-children">
          {highlights.map(({ icon: Icon, title, description, gradient, glow }) => (
            <div key={title} className={`group relative p-7 bg-card rounded-3xl border border-border/50 hover:border-primary/20 transition-all duration-500 text-center ${glow}`}>
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-6 mx-auto shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
                <Icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-3 font-display">{title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
            </div>
          ))}
        </div>

        {/* CTA Banner */}
        <div className="relative overflow-hidden rounded-4xl gradient-hero p-10 sm:p-16 text-center texture-noise">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-10 left-10 w-44 h-44 bg-white/8 rounded-full blur-3xl animate-float" />
            <div className="absolute bottom-10 right-10 w-64 h-64 bg-white/5 rounded-full blur-3xl animate-float-slow" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 border border-white/5 rounded-full animate-spin-slow" />
          </div>
          <div className="relative z-10 max-w-2xl mx-auto space-y-8">
            <div className="flex justify-center gap-4">
              {[Globe, Zap, Shield].map((Icon, i) => (
                <div key={i} className="w-14 h-14 bg-white/15 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/10 hover:bg-white/25 transition-all duration-300 hover:scale-110">
                  <Icon className="w-7 h-7 text-white" />
                </div>
              ))}
            </div>
            <h3 className="text-2xl sm:text-4xl font-bold text-white font-display leading-tight">
              Plan Smarter. Connect Safely. Travel Better.
            </h3>
            <p className="text-white/70 text-lg">
              Sign in to unlock AI itineraries, find travel buddies, split expenses, and explore a world of curated adventures.
            </p>
            <Button onClick={handleGetStarted} size="lg" className="h-14 px-10 bg-white text-primary hover:bg-white/90 rounded-2xl text-lg font-semibold shadow-float transition-all duration-300 group">
              {isLoggedIn ? 'Explore Now' : 'Get Started Free'}
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1.5 transition-transform duration-300" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
