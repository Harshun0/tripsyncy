import React, { useState } from 'react';
import { ArrowRight, Sparkles, Users, MapPin, Star, Play, X, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeroSectionProps {
  onGetStarted: () => void;
  onExplore: () => void;
  isLoggedIn?: boolean;
}

const HeroSection: React.FC<HeroSectionProps> = ({ onGetStarted, onExplore, isLoggedIn }) => {
  const [showVideo, setShowVideo] = useState(false);

  const stats = [
    { value: '50K+', label: 'Travelers' },
    { value: '10K+', label: 'Trips Planned' },
    { value: '95%', label: 'Match Success' },
  ];

  const demoSteps = [
    { title: 'Create Your Profile', description: 'Sign up and set your travel preferences, budget, and interests to find like-minded travelers.' },
    { title: 'Find Travel Buddies', description: 'Our AI matches you with compatible travelers based on interests, budget, and personality.' },
    { title: 'Plan with AI Itinerary', description: 'Generate personalized day-by-day travel plans with cost estimates using our smart AI.' },
    { title: 'Chat & Connect', description: 'Send trip requests, chat with matched travelers, and plan your adventure together.' },
    { title: 'Split Expenses', description: 'Track group expenses, split costs fairly, and settle up easily with UPI payments.' },
    { title: 'Travel Together!', description: 'Hit the road with your new travel companions and create unforgettable memories.' },
  ];

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      <div className="absolute inset-0 gradient-hero opacity-90" />
      
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-primary/20 rounded-full blur-3xl animate-pulse-slow" />
      </div>

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <MapPin className="absolute top-32 right-[20%] w-8 h-8 text-white/20 animate-float" style={{ animationDelay: '0.5s' }} />
        <Star className="absolute top-48 left-[15%] w-6 h-6 text-white/15 animate-float" style={{ animationDelay: '1s' }} />
        <MapPin className="absolute bottom-32 left-[25%] w-10 h-10 text-white/10 animate-float" style={{ animationDelay: '1.5s' }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="text-center space-y-8 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white/90 text-sm font-medium border border-white/20">
            <Sparkles className="w-4 h-4 text-secondary" />
            AI-Powered Travel Companion
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-tight">
            Travel Smarter.
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary via-sunset-pink to-accent">
              Travel Together.
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-white/80 max-w-xl mx-auto">
            Find your perfect travel companions with AI-powered matching, plan smart itineraries, and explore the world safely.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={onGetStarted}
              size="lg"
              className="h-14 px-8 bg-white text-primary hover:bg-white/90 rounded-2xl text-lg font-semibold shadow-xl hover:shadow-2xl transition-all group"
            >
              {isLoggedIn ? 'Explore Now' : 'Get Started Free'}
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              onClick={() => setShowVideo(true)}
              size="lg"
              className="h-14 px-8 bg-white text-primary hover:bg-white/90 rounded-2xl text-lg font-semibold shadow-xl hover:shadow-2xl transition-all group"
            >
              <Play className="w-5 h-5 mr-2" />
              See How It Works
            </Button>
          </div>

          <div className="flex flex-wrap gap-3 justify-center">
            {[
              { icon: Sparkles, label: 'AI-Powered Itineraries' },
              { icon: Users, label: 'Find Travel Buddies' },
            ].map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white text-sm border border-white/10"
              >
                <Icon className="w-4 h-4" />
                {label}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-20 pt-12 border-t border-white/10">
          <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
            {stats.map(({ value, label }) => (
              <div key={label} className="text-center">
                <p className="text-3xl sm:text-4xl font-bold text-white">{value}</p>
                <p className="text-white/60 text-sm sm:text-base">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path
            d="M0 120L48 110C96 100 192 80 288 70C384 60 480 60 576 65C672 70 768 80 864 85C960 90 1056 90 1152 85C1248 80 1344 70 1392 65L1440 60V120H0Z"
            fill="hsl(var(--background))"
          />
        </svg>
      </div>

      {/* How It Works Modal - Interactive Demo */}
      {showVideo && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-3xl bg-background rounded-3xl overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowVideo(false)}
              className="absolute top-4 right-4 z-10 w-10 h-10 bg-muted hover:bg-muted/80 rounded-full flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="p-8">
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium mb-4">
                  <Play className="w-4 h-4" />
                  How TripSync Works
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                  Your Journey in <span className="text-gradient">6 Simple Steps</span>
                </h2>
                <p className="text-muted-foreground mt-2">From signup to your dream trip — here's how TripSync makes it happen</p>
              </div>

              <div className="space-y-4">
                {demoSteps.map((step, index) => (
                  <div key={index} className="flex gap-4 p-4 bg-muted/50 rounded-2xl hover:bg-muted transition-colors group">
                    <div className="flex-shrink-0 w-12 h-12 gradient-primary rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-glow">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">{step.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground self-center opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                ))}
              </div>

              <div className="mt-8 text-center">
                <Button
                  onClick={() => { setShowVideo(false); onGetStarted(); }}
                  className="h-14 px-8 gradient-primary text-primary-foreground rounded-2xl text-lg font-semibold shadow-glow"
                >
                  Get Started Now
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default HeroSection;
