import React from 'react';
import { Sparkles, Users, MapPin, Wallet, MessageCircle, ArrowRight, Globe, Zap, Shield, TreePine, Compass, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FeaturesSectionProps {
  onNavigate?: (section: string) => void;
  isLoggedIn?: boolean;
}

const FeaturesSection: React.FC<FeaturesSectionProps> = ({ onNavigate, isLoggedIn }) => {
  const highlights = [
    {
      icon: Sparkles,
      title: 'AI Trip Planner',
      description: 'Generate personalized day-by-day itineraries with budget breakdowns tailored to your travel style.',
      color: 'bg-primary/10 text-primary',
      iconBg: 'gradient-primary',
      accent: 'border-primary/15 hover:border-primary/30',
    },
    {
      icon: Users,
      title: 'Find Your Tribe',
      description: 'Match with travel buddies by interests, budget, and vibe. Turn solo trips into shared adventures.',
      color: 'bg-secondary/10 text-secondary',
      iconBg: 'gradient-sunset',
      accent: 'border-secondary/15 hover:border-secondary/30',
    },
    {
      icon: Wallet,
      title: 'Smart Expenses',
      description: 'Split costs instantly, track who owes what, and settle up with integrated payment links.',
      color: 'bg-success/10 text-success',
      iconBg: 'gradient-nature',
      accent: 'border-success/15 hover:border-success/30',
    },
    {
      icon: Shield,
      title: 'Travel Safely',
      description: 'One-tap SOS, live location sharing with your group, and verified traveler profiles.',
      color: 'bg-accent/10 text-accent',
      iconBg: 'bg-gradient-to-br from-accent to-primary',
      accent: 'border-accent/15 hover:border-accent/30',
    },
  ];

  const handleGetStarted = () => {
    if (onNavigate) onNavigate(isLoggedIn ? 'explore' : 'login');
  };

  return (
    <section className="py-24 lg:py-36 bg-background relative overflow-hidden">
      {/* Organic background shapes */}
      <div className="absolute inset-0 gradient-mesh opacity-50 pointer-events-none" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/3 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-secondary/3 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary/8 rounded-full text-primary text-sm font-semibold mb-6 border border-primary/12">
            <TreePine className="w-4 h-4" />
            Why TripSync?
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6 font-display leading-tight">
            Everything for Your
            <span className="text-gradient"> Next Adventure</span>
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            From AI-powered planning to real human connections — TripSync is your complete travel toolkit.
          </p>
        </div>

        {/* Feature cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-20 stagger-children">
          {highlights.map(({ icon: Icon, title, description, color, iconBg, accent }) => (
            <div key={title} className={`group relative p-7 bg-card rounded-3xl border transition-all duration-400 ${accent} hover:shadow-lg`}>
              {/* Subtle corner accent */}
              <div className="absolute top-0 right-0 w-20 h-20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                <div className="w-full h-full bg-gradient-to-bl from-primary/5 to-transparent rounded-tr-3xl" />
              </div>
              
              <div className={`w-14 h-14 rounded-2xl ${iconBg} flex items-center justify-center mb-5 shadow-md group-hover:scale-110 group-hover:-rotate-3 transition-all duration-400`}>
                <Icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2.5 font-display">{title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
              
              {/* Bottom accent line */}
              <div className="mt-5 h-0.5 w-8 rounded-full bg-primary/20 group-hover:w-16 group-hover:bg-primary/40 transition-all duration-500" />
            </div>
          ))}
        </div>

        {/* CTA Banner with nature vibe */}
        <div className="relative overflow-hidden rounded-[2rem] p-10 sm:p-16 text-center">
          {/* Background image */}
          <div className="absolute inset-0">
            <img 
              src="https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1400&h=600&fit=crop&q=80" 
              alt="" 
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-primary/85 via-primary/75 to-accent/70 backdrop-blur-[2px]" />
          </div>
          
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-8 left-8 w-40 h-40 bg-white/8 rounded-full blur-3xl animate-float" />
            <div className="absolute bottom-8 right-8 w-56 h-56 bg-white/5 rounded-full blur-3xl animate-float-slow" />
          </div>

          <div className="relative z-10 max-w-2xl mx-auto space-y-8">
            <div className="flex justify-center gap-4">
              {[Globe, Compass, Heart].map((Icon, i) => (
                <div key={i} className="w-14 h-14 bg-white/15 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/15 hover:bg-white/25 transition-all duration-300 hover:scale-110 hover:-rotate-6">
                  <Icon className="w-7 h-7 text-white" />
                </div>
              ))}
            </div>
            <h3 className="text-2xl sm:text-4xl font-bold text-white font-display leading-tight">
              Your Next Adventure<br />Starts Here
            </h3>
            <p className="text-white/75 text-lg max-w-lg mx-auto">
              Join thousands of travelers who plan smarter, connect safer, and explore further with TripSync.
            </p>
            <Button onClick={handleGetStarted} size="lg" className="h-14 px-10 bg-white text-primary hover:bg-white/95 rounded-2xl text-lg font-semibold shadow-float transition-all duration-300 group">
              {isLoggedIn ? 'Explore Now' : 'Start Free'}
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1.5 transition-transform duration-300" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
