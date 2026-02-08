import React, { useState } from 'react';
import { X, MapPin, Mail, Lock, Phone, User, ArrowRight, Camera, Mountain, Utensils, Compass, Sunrise, Heart, BadgeCheck, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onComplete }) => {
  const [step, setStep] = useState<'login' | 'signup' | 'profile'>('login');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
    budget: '',
    personality: '',
    interests: [] as string[],
  });

  const interestOptions = [
    { id: 'adventure', label: 'Adventure', icon: Mountain },
    { id: 'food', label: 'Food', icon: Utensils },
    { id: 'culture', label: 'Culture', icon: Compass },
    { id: 'nature', label: 'Nature', icon: Sunrise },
    { id: 'spirituality', label: 'Spirituality', icon: Heart },
  ];

  const handleInterestToggle = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 'login') {
      onComplete();
    } else if (step === 'signup') {
      setStep('profile');
    } else {
      onComplete();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-background rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="gradient-hero relative p-8">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="text-center text-white">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <MapPin className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold mb-1">TripSync</h1>
            <p className="text-white/80 text-sm">Travel Smarter. Travel Together.</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 'login' && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-foreground">Welcome Back!</h2>
                <p className="text-muted-foreground text-sm mt-1">Sign in to continue your journey</p>
              </div>

              <div className="space-y-3">
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="email"
                    placeholder="Email address"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="input-field pl-12"
                    required
                  />
                </div>

                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="input-field pl-12"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="rounded border-border" />
                  <span className="text-muted-foreground">Remember me</span>
                </label>
                <button type="button" className="text-primary font-medium">Forgot password?</button>
              </div>

              <Button type="submit" className="w-full h-12 gradient-primary text-primary-foreground rounded-xl font-semibold">
                Sign In
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-background text-muted-foreground">or continue with</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button type="button" className="h-12 bg-muted rounded-xl flex items-center justify-center gap-2 font-medium hover:bg-muted/80 transition-colors">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Google
                </button>
                <button type="button" className="h-12 bg-foreground text-background rounded-xl flex items-center justify-center gap-2 font-medium hover:opacity-90 transition-opacity">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                  </svg>
                  Apple
                </button>
              </div>

              <p className="text-center text-sm text-muted-foreground mt-4">
                Don't have an account?{' '}
                <button type="button" onClick={() => setStep('signup')} className="text-primary font-semibold">
                  Sign up
                </button>
              </p>
            </form>
          )}

          {step === 'signup' && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-foreground">Create Account</h2>
                <p className="text-muted-foreground text-sm mt-1">Join our community of travelers</p>
              </div>

              <div className="space-y-3">
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Full name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input-field pl-12"
                    required
                  />
                </div>

                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="email"
                    placeholder="Email address"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="input-field pl-12"
                    required
                  />
                </div>

                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="tel"
                    placeholder="Phone number"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="input-field pl-12"
                    required
                  />
                </div>

                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input
                    type="password"
                    placeholder="Create password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="input-field pl-12"
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full h-12 gradient-primary text-primary-foreground rounded-xl font-semibold">
                Continue
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{' '}
                <button type="button" onClick={() => setStep('login')} className="text-primary font-semibold">
                  Sign in
                </button>
              </p>
            </form>
          )}

          {step === 'profile' && (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-foreground">Complete Your Profile</h2>
                <p className="text-muted-foreground text-sm mt-1">Help us find your perfect travel companions</p>
              </div>

              {/* Avatar Upload */}
              <div className="flex justify-center">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center">
                    <User className="w-10 h-10 text-muted-foreground" />
                  </div>
                  <button type="button" className="absolute bottom-0 right-0 w-8 h-8 gradient-primary rounded-full flex items-center justify-center shadow-lg">
                    <Camera className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>

              {/* Budget Preference */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  <Wallet className="w-4 h-4 inline mr-2" />
                  Travel Budget
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['Budget', 'Mid-Range', 'Luxury'].map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setFormData({ ...formData, budget: option })}
                      className={`py-3 rounded-xl text-sm font-medium transition-all ${
                        formData.budget === option
                          ? 'gradient-primary text-white'
                          : 'bg-muted hover:bg-muted/80'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              {/* Personality */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  <Heart className="w-4 h-4 inline mr-2" />
                  Personality Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['Introvert', 'Ambivert', 'Extrovert'].map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setFormData({ ...formData, personality: option })}
                      className={`py-3 rounded-xl text-sm font-medium transition-all ${
                        formData.personality === option
                          ? 'gradient-primary text-white'
                          : 'bg-muted hover:bg-muted/80'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              {/* Interests */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  <BadgeCheck className="w-4 h-4 inline mr-2" />
                  Travel Interests
                </label>
                <div className="flex flex-wrap gap-2">
                  {interestOptions.map(({ id, label, icon: Icon }) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => handleInterestToggle(id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        formData.interests.includes(id)
                          ? 'gradient-primary text-white'
                          : 'bg-muted hover:bg-muted/80'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <Button type="submit" className="w-full h-12 gradient-primary text-primary-foreground rounded-xl font-semibold">
                Complete Setup
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
