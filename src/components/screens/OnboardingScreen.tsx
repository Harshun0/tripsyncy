import React, { useState } from 'react';
import { MapPin, Users, Shield, Sparkles, ArrowRight, Mail, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface OnboardingScreenProps {
  onComplete: () => void;
}

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const [step, setStep] = useState(0);

  const features = [
    {
      icon: Sparkles,
      title: 'AI-Powered Planning',
      description: 'Let our AI create perfect itineraries tailored to your preferences',
      color: 'from-primary to-accent',
    },
    {
      icon: Users,
      title: 'Find Trip Mates',
      description: 'Connect with compatible travelers based on your travel style',
      color: 'from-secondary to-sunset-pink',
    },
    {
      icon: Shield,
      title: 'Travel Safe',
      description: 'Emergency SOS, live location sharing & verified profiles',
      color: 'from-success to-primary',
    },
  ];

  if (step < 3) {
    const feature = features[step];
    const Icon = feature.icon;

    return (
      <div className="h-full flex flex-col bg-background">
        {/* Skip Button */}
        <div className="flex justify-end p-4">
          <button
            onClick={onComplete}
            className="text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            Skip
          </button>
        </div>

        {/* Illustration Area */}
        <div className="flex-1 flex flex-col items-center justify-center px-6">
          <div className={`w-32 h-32 rounded-full bg-gradient-to-br ${feature.color} flex items-center justify-center mb-8 shadow-glow animate-float`}>
            <Icon className="w-16 h-16 text-white" />
          </div>

          <h2 className="text-2xl font-bold text-foreground text-center mb-4">
            {feature.title}
          </h2>

          <p className="text-muted-foreground text-center text-base leading-relaxed max-w-xs">
            {feature.description}
          </p>
        </div>

        {/* Progress Dots & Next Button */}
        <div className="p-6 space-y-6">
          <div className="flex justify-center gap-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === step ? 'w-8 gradient-primary' : 'w-2 bg-muted'
                }`}
              />
            ))}
          </div>

          <Button
            onClick={() => setStep(step + 1)}
            className="w-full h-14 gradient-primary text-primary-foreground rounded-2xl text-lg font-semibold shadow-glow"
          >
            Next
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    );
  }

  // Login Screen
  return (
    <div className="h-full flex flex-col bg-background">
      {/* Hero Section */}
      <div className="gradient-hero h-64 relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white">
            <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <MapPin className="w-10 h-10" />
            </div>
            <h1 className="text-3xl font-bold mb-2">TripSync</h1>
            <p className="text-white/80 text-sm">Travel Smarter. Travel Together.</p>
          </div>
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute -bottom-1 left-0 right-0 h-8 bg-background rounded-t-3xl" />
      </div>

      {/* Login Form */}
      <div className="flex-1 px-6 pt-4 space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground">Welcome Back!</h2>
          <p className="text-muted-foreground mt-1">Sign in to continue your journey</p>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="email"
              placeholder="Email address"
              className="input-field pl-12"
            />
          </div>

          <div className="relative">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="tel"
              placeholder="Phone number"
              className="input-field pl-12"
            />
          </div>
        </div>

        <Button
          onClick={onComplete}
          className="w-full h-14 gradient-primary text-primary-foreground rounded-2xl text-lg font-semibold shadow-glow"
        >
          Continue
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-background text-muted-foreground">or continue with</span>
          </div>
        </div>

        <div className="flex gap-4">
          <button className="flex-1 h-14 bg-muted rounded-2xl flex items-center justify-center gap-2 font-medium hover:bg-muted/80 transition-colors">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Google
          </button>
          <button className="flex-1 h-14 bg-foreground text-background rounded-2xl flex items-center justify-center gap-2 font-medium hover:opacity-90 transition-opacity">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
            </svg>
            Apple
          </button>
        </div>

        <p className="text-center text-sm text-muted-foreground">
          Don't have an account?{' '}
          <button className="text-primary font-semibold">Sign up</button>
        </p>
      </div>
    </div>
  );
};

export default OnboardingScreen;
