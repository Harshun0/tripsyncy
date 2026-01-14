import React from 'react';
import { ArrowRight, Sparkles, Users, Shield, MapPin, Star, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeroSectionProps {
  onGetStarted: () => void;
  onExplore: () => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ onGetStarted, onExplore }) => {
  const features = [
    { icon: Sparkles, label: 'AI-Powered Itineraries', color: 'text-primary' },
    { icon: Users, label: 'Find Travel Buddies', color: 'text-secondary' },
    { icon: Shield, label: 'Travel Safe', color: 'text-success' },
  ];

  const stats = [
    { value: '50K+', label: 'Travelers' },
    { value: '10K+', label: 'Trips Planned' },
    { value: '95%', label: 'Match Success' },
  ];

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 gradient-hero opacity-90" />
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-primary/20 rounded-full blur-3xl animate-pulse-slow" />
      </div>

      {/* Decorative Icons */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <MapPin className="absolute top-32 right-[20%] w-8 h-8 text-white/20 animate-float" style={{ animationDelay: '0.5s' }} />
        <Star className="absolute top-48 left-[15%] w-6 h-6 text-white/15 animate-float" style={{ animationDelay: '1s' }} />
        <MapPin className="absolute bottom-32 left-[25%] w-10 h-10 text-white/10 animate-float" style={{ animationDelay: '1.5s' }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white/90 text-sm font-medium border border-white/20">
              <Sparkles className="w-4 h-4 text-secondary" />
              AI-Powered Travel Companion
            </div>

            {/* Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-tight">
              Travel Smarter.
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary via-sunset-pink to-accent">
                Travel Together.
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-lg sm:text-xl text-white/80 max-w-xl mx-auto lg:mx-0">
              Find your perfect travel companions with AI-powered matching, plan smart itineraries, and explore the world safely.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button
                onClick={onGetStarted}
                size="lg"
                className="h-14 px-8 bg-white text-primary hover:bg-white/90 rounded-2xl text-lg font-semibold shadow-xl hover:shadow-2xl transition-all group"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                onClick={onExplore}
                size="lg"
                variant="outline"
                className="h-14 px-8 border-2 border-white/30 text-white hover:bg-white/10 rounded-2xl text-lg font-semibold backdrop-blur-sm"
              >
                <Play className="w-5 h-5 mr-2" />
                See How It Works
              </Button>
            </div>

            {/* Features Pills */}
            <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
              {features.map(({ icon: Icon, label, color }) => (
                <div
                  key={label}
                  className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white text-sm border border-white/10"
                >
                  <Icon className={`w-4 h-4 ${color}`} />
                  {label}
                </div>
              ))}
            </div>
          </div>

          {/* Right Content - Demo Preview */}
          <div className="relative hidden lg:block">
            {/* Main App Preview Card */}
            <div className="relative bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/20 shadow-2xl">
              {/* Header Mock */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">TripSync AI</h3>
                  <p className="text-white/60 text-sm">Your Smart Travel Companion</p>
                </div>
              </div>

              {/* AI Suggestion Card */}
              <div className="bg-white/10 rounded-2xl p-4 mb-4">
                <p className="text-white/80 text-sm mb-3">🎯 AI Recommendation</p>
                <p className="text-white font-medium mb-3">
                  "Based on your interests, I found 3 travelers near you planning a Goa trip!"
                </p>
                <div className="flex gap-2">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map((i) => (
                      <img
                        key={i}
                        src={`https://images.unsplash.com/photo-${1494790108377 + i * 100000}-be9c29b29330?w=40&h=40&fit=crop&crop=face`}
                        alt=""
                        className="w-8 h-8 rounded-full border-2 border-white/20"
                      />
                    ))}
                  </div>
                  <span className="text-white/60 text-sm flex items-center">+92% Match Score</span>
                </div>
              </div>

              {/* Match Preview */}
              <div className="flex items-center justify-between bg-gradient-to-r from-primary/20 to-secondary/20 rounded-2xl p-4">
                <div className="flex items-center gap-3">
                  <img
                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=60&h=60&fit=crop&crop=face"
                    alt="Priya"
                    className="w-12 h-12 rounded-full border-2 border-white/30"
                  />
                  <div>
                    <p className="text-white font-medium">Priya Sharma</p>
                    <p className="text-white/60 text-sm">Adventure • Nature • Photography</p>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-white">87%</p>
                  <p className="text-white/60 text-xs">Match</p>
                </div>
              </div>
            </div>

            {/* Floating Stats Cards */}
            <div className="absolute -left-12 top-1/4 bg-white rounded-2xl p-4 shadow-2xl animate-float">
              <p className="text-3xl font-bold text-primary">50K+</p>
              <p className="text-muted-foreground text-sm">Active Travelers</p>
            </div>

            <div className="absolute -right-8 bottom-16 bg-white rounded-2xl p-4 shadow-2xl animate-float" style={{ animationDelay: '1s' }}>
              <div className="flex items-center gap-2">
                <Shield className="w-8 h-8 text-success" />
                <div>
                  <p className="font-semibold text-foreground">100% Safe</p>
                  <p className="text-muted-foreground text-xs">Verified Profiles</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Stats */}
        <div className="mt-20 pt-12 border-t border-white/10">
          <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto lg:mx-0">
            {stats.map(({ value, label }) => (
              <div key={label} className="text-center lg:text-left">
                <p className="text-3xl sm:text-4xl font-bold text-white">{value}</p>
                <p className="text-white/60 text-sm sm:text-base">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
          <path
            d="M0 120L48 110C96 100 192 80 288 70C384 60 480 60 576 65C672 70 768 80 864 85C960 90 1056 90 1152 85C1248 80 1344 70 1392 65L1440 60V120H0Z"
            fill="hsl(var(--background))"
          />
        </svg>
      </div>
    </section>
  );
};

export default HeroSection;
