import React, { useState } from 'react';
import { ArrowRight, Sparkles, Users, MapPin, Star, Play, X, Plane, Globe, Mountain, Compass, TreePine } from 'lucide-react';
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
      {/* Travel photo background */}
      <div className="absolute inset-0">
        <img 
          src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1920&h=1080&fit=crop&q=80" 
          alt="" 
          className="w-full h-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent" />
      </div>
      
      {/* Subtle animated elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-[10%] w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-24 right-[8%] w-80 h-80 bg-secondary/8 rounded-full blur-3xl animate-float-slow" style={{ animationDelay: '2s' }} />
        
        {/* Floating travel icons */}
        <Compass className="absolute top-28 right-[20%] w-7 h-7 text-white/10 animate-float" style={{ animationDelay: '0.5s' }} />
        <TreePine className="absolute top-48 left-[12%] w-6 h-6 text-white/8 animate-float" style={{ animationDelay: '1s' }} />
        <Globe className="absolute bottom-44 left-[18%] w-8 h-8 text-white/6 animate-float-slow" style={{ animationDelay: '2.5s' }} />
        <Mountain className="absolute top-[45%] right-[12%] w-7 h-7 text-white/8 animate-float" style={{ animationDelay: '1.8s' }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="text-center space-y-8 max-w-4xl mx-auto stagger-children">
          {/* Badge */}
          <div className="inline-flex items-center gap-2.5 px-5 py-2.5 bg-white/12 backdrop-blur-md rounded-full text-white/90 text-sm font-medium border border-white/15 shadow-lg">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-400"></span>
            </span>
            AI-Powered Travel Companion
          </div>

          {/* Main heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-[1.08] tracking-tight font-display">
            Explore the World.
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-300 via-emerald-300 to-cyan-300 animate-gradient" style={{ backgroundSize: '200% auto' }}>
              Find Your Tribe.
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-white/70 max-w-2xl mx-auto leading-relaxed">
            Match with like-minded travelers, generate AI itineraries, split expenses effortlessly, and turn strangers into travel companions.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button
              onClick={onGetStarted}
              size="lg"
              className="h-14 px-10 bg-white text-foreground hover:bg-white/95 rounded-2xl text-lg font-semibold shadow-float hover:shadow-xl transition-all duration-300 group"
            >
              {isLoggedIn ? 'Explore Now' : 'Start Your Journey'}
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1.5 transition-transform duration-300" />
            </Button>
            <Button
              onClick={() => setShowVideo(true)}
              size="lg"
              className="h-14 px-8 bg-white/10 backdrop-blur-sm text-white border border-white/20 hover:bg-white/20 rounded-2xl text-lg font-semibold transition-all duration-300 group"
            >
              <Play className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
              Watch Demo
            </Button>
          </div>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-3 justify-center pt-2">
            {[
              { icon: Sparkles, label: 'AI Itineraries' },
              { icon: Users, label: 'Travel Buddy Matching' },
              { icon: MapPin, label: 'Live Traveler Map' },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 px-4 py-2.5 bg-white/8 backdrop-blur-sm rounded-full text-white/75 text-sm border border-white/10 hover:bg-white/15 hover:text-white transition-all duration-300 cursor-default">
                <Icon className="w-4 h-4 text-green-300" />{label}
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="mt-20 pt-10 border-t border-white/10">
          <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto stagger-children">
            {stats.map(({ value, label, icon: Icon }) => (
              <div key={label} className="text-center group cursor-default">
                <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/20 transition-all duration-300 group-hover:scale-110 border border-white/10">
                  <Icon className="w-6 h-6 text-green-300" />
                </div>
                <p className="text-3xl sm:text-4xl font-bold text-white font-display">{value}</p>
                <p className="text-white/45 text-sm mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Wave divider */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path d="M0 120L60 108C120 96 240 72 360 60C480 48 600 48 720 56C840 64 960 80 1080 86C1200 92 1320 88 1380 86L1440 84V120H0Z" fill="hsl(var(--background))" />
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
