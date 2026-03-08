import React, { useState } from 'react';
import { ArrowRight, Sparkles, Users, MapPin, Star, Play, X, Plane, Globe, Mountain } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeroSectionProps {
  onGetStarted: () => void;
  onExplore: () => void;
  isLoggedIn?: boolean;
}

const HeroSection: React.FC<HeroSectionProps> = ({ onGetStarted, onExplore, isLoggedIn }) => {
  const [showVideo, setShowVideo] = useState(false);

  const stats = [
    { value: '50K+', label: 'Travelers', icon: Users },
    { value: '10K+', label: 'Trips Planned', icon: Plane },
    { value: '95%', label: 'Match Success', icon: Star },
  ];

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Layered gradient background */}
      <div className="absolute inset-0 gradient-hero opacity-95" />
      <div className="absolute inset-0 pattern-dots opacity-10" />
      
      {/* Animated floating shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-16 left-[8%] w-80 h-80 bg-white/8 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-16 right-[5%] w-[28rem] h-[28rem] bg-secondary/15 rounded-full blur-3xl animate-float-slow" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[32rem] h-[32rem] bg-accent/10 rounded-full blur-3xl animate-pulse-slow" />
        
        {/* Decorative geometric shapes */}
        <div className="absolute top-24 right-[18%] w-20 h-20 border-2 border-white/10 rounded-2xl rotate-12 animate-float" style={{ animationDelay: '0.5s' }} />
        <div className="absolute bottom-40 left-[12%] w-16 h-16 border-2 border-white/8 rounded-full animate-float" style={{ animationDelay: '3s' }} />
        <div className="absolute top-[60%] right-[8%] w-12 h-12 bg-white/5 rounded-xl rotate-45 animate-float-slow" style={{ animationDelay: '1.5s' }} />
        
        {/* Floating icons */}
        <MapPin className="absolute top-32 right-[22%] w-8 h-8 text-white/15 animate-float" style={{ animationDelay: '0.5s' }} />
        <Star className="absolute top-48 left-[15%] w-6 h-6 text-white/10 animate-float" style={{ animationDelay: '1s' }} />
        <Globe className="absolute bottom-48 left-[20%] w-10 h-10 text-white/8 animate-float-slow" style={{ animationDelay: '2.5s' }} />
        <Mountain className="absolute top-[40%] right-[10%] w-7 h-7 text-white/10 animate-float" style={{ animationDelay: '1.8s' }} />
        <Plane className="absolute bottom-32 right-[30%] w-6 h-6 text-white/12 animate-float-slow" style={{ animationDelay: '0.8s' }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="text-center space-y-8 max-w-4xl mx-auto stagger-children">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 backdrop-blur-md rounded-full text-white/90 text-sm font-medium border border-white/20 shadow-lg">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-secondary"></span>
            </span>
            AI-Powered Travel Companion
          </div>

          {/* Main heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-[1.1] tracking-tight font-display">
            Travel Smarter.
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary via-sunset-pink to-white animate-gradient" style={{ backgroundSize: '200% auto' }}>
              Travel Together.
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-white/75 max-w-xl mx-auto leading-relaxed">
            Find your perfect travel companions with AI-powered matching, plan smart itineraries, and explore the world safely.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
            <Button
              onClick={onGetStarted}
              size="lg"
              className="h-14 px-8 bg-white text-primary hover:bg-white/90 rounded-2xl text-lg font-semibold shadow-float hover:shadow-xl transition-all duration-300 group"
            >
              {isLoggedIn ? 'Explore Now' : 'Get Started Free'}
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1.5 transition-transform duration-300" />
            </Button>
            <Button
              onClick={() => setShowVideo(true)}
              size="lg"
              className="h-14 px-8 bg-white/10 backdrop-blur-sm text-white border border-white/20 hover:bg-white/20 rounded-2xl text-lg font-semibold transition-all duration-300 group"
            >
              <Play className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
              See How It Works
            </Button>
          </div>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-3 justify-center pt-2">
            {[
              { icon: Sparkles, label: 'AI Itineraries' },
              { icon: Users, label: 'Find Travel Buddies' },
              { icon: MapPin, label: 'Smart Planning' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 px-4 py-2 bg-white/8 backdrop-blur-sm rounded-full text-white/80 text-sm border border-white/10 hover:bg-white/15 hover:text-white transition-all duration-300 cursor-default">
                <Icon className="w-4 h-4" />{label}
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="mt-20 pt-10 border-t border-white/10">
          <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto stagger-children">
            {stats.map(({ value, label, icon: Icon }) => (
              <div key={label} className="text-center group cursor-default">
                <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/20 transition-all duration-300 group-hover:scale-110">
                  <Icon className="w-6 h-6 text-white/80" />
                </div>
                <p className="text-3xl sm:text-4xl font-bold text-white font-display">{value}</p>
                <p className="text-white/50 text-sm mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Wave divider */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path d="M0 120L48 110C96 100 192 80 288 70C384 60 480 60 576 65C672 70 768 80 864 85C960 90 1056 90 1152 85C1248 80 1344 70 1392 65L1440 60V120H0Z" fill="hsl(var(--background))" />
        </svg>
      </div>

      {/* Video Modal */}
      {showVideo && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in" onClick={() => setShowVideo(false)}>
          <div className="relative w-full max-w-4xl bg-background rounded-3xl overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
            <button onClick={() => setShowVideo(false)} className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center transition-colors">
              <X className="w-5 h-5 text-white" />
            </button>
            <div className="aspect-video w-full">
              <iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&rel=0" title="How TripSync Works" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="w-full h-full" />
            </div>
            <div className="p-6 text-center">
              <h3 className="text-xl font-bold text-foreground mb-2 font-display">Ready to start your journey?</h3>
              <p className="text-muted-foreground mb-4">Sign up now and find your perfect travel companions</p>
              <Button onClick={() => { setShowVideo(false); onGetStarted(); }} className="h-12 px-8 gradient-primary text-primary-foreground rounded-2xl text-lg font-semibold shadow-glow">
                Get Started Now<ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default HeroSection;
