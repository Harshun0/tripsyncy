import React, { useState } from 'react';
import { X, MapPin, Mail, Lock, User, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { lovable } from '@/integrations/lovable';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const interestOptions = ['Adventure', 'Food', 'Culture', 'Nature', 'Photography', 'Beach'];

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onComplete }) => {
  const { signIn, signUp } = useAuth();
  const [step, setStep] = useState<'login' | 'signup'>('login');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    location: '',
    budget: 'Mid-Range',
    personality: 'Ambivert',
    interests: [] as string[],
  });

  const toggleInterest = (item: string) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.includes(item) ? prev.interests.filter((x) => x !== item) : [...prev.interests, item],
    }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signIn(formData.email, formData.password);
    setLoading(false);
    if (error) {
      toast({ title: 'Login failed', description: error, variant: 'destructive' });
      return;
    }
    toast({ title: 'Welcome back! 👋' });
    onComplete();
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password.length < 6) {
      toast({ title: 'Password too short', description: 'Must be at least 6 characters.', variant: 'destructive' });
      return;
    }
    if (!formData.location.trim()) {
      toast({ title: 'Location required', description: 'Please add your city/location.', variant: 'destructive' });
      return;
    }

    setLoading(true);
    const { error } = await signUp({
      email: formData.email,
      password: formData.password,
      displayName: formData.name,
      location: formData.location,
      budget: formData.budget,
      personality: formData.personality,
      interests: formData.interests,
    });
    setLoading(false);

    if (error) {
      toast({ title: 'Signup failed', description: error, variant: 'destructive' });
      return;
    }

    toast({ title: 'Check your email! 📧', description: 'Verify your email, then sign in.' });
    setStep('login');
  };

  const handleSocial = async (provider: 'google' | 'apple') => {
    setLoading(true);
    const { error } = await lovable.auth.signInWithOAuth(provider, { redirect_uri: window.location.origin });
    setLoading(false);
    if (error) toast({ title: 'Social login failed', description: error.message, variant: 'destructive' });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-xl bg-background rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="gradient-hero relative p-8">
          <button onClick={onClose} className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors">
            <X className="w-5 h-5" />
          </button>
          <div className="text-center text-white">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <MapPin className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold mb-1">TripSync</h1>
            <p className="text-white/80 text-sm">Real users. Real trips. Real connections.</p>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Button type="button" variant="outline" disabled={loading} onClick={() => handleSocial('google')} className="h-11 rounded-xl">
              Google
            </Button>
            <Button type="button" variant="outline" disabled={loading} onClick={() => handleSocial('apple')} className="h-11 rounded-xl">
              Apple
            </Button>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="h-px bg-border flex-1" />
            or continue with email
            <div className="h-px bg-border flex-1" />
          </div>

          {step === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="text-center mb-2">
                <h2 className="text-xl font-bold text-foreground">Welcome Back!</h2>
              </div>
              <div className="space-y-3">
                <div className="relative"><Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" /><input type="email" placeholder="Email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="input-field pl-12" required /></div>
                <div className="relative"><Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" /><input type="password" placeholder="Password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="input-field pl-12" required /></div>
              </div>
              <Button type="submit" disabled={loading} className="w-full h-12 gradient-primary text-primary-foreground rounded-xl font-semibold">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Sign In<ArrowRight className="w-5 h-5 ml-2" /></>}
              </Button>
              <p className="text-center text-sm text-muted-foreground">Don't have an account? <button type="button" onClick={() => setStep('signup')} className="text-primary font-semibold">Create one</button></p>
            </form>
          ) : (
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="text-center">
                <h2 className="text-xl font-bold text-foreground">Create your traveler profile</h2>
                <p className="text-sm text-muted-foreground">These details power matching from day one.</p>
              </div>

              <div className="relative"><User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" /><input type="text" placeholder="Display name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="input-field pl-12" required /></div>
              <div className="relative"><Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" /><input type="email" placeholder="Email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="input-field pl-12" required /></div>
              <div className="relative"><Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" /><input type="password" placeholder="Password (min 6)" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="input-field pl-12" minLength={6} required /></div>
              <div className="relative"><MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" /><input type="text" placeholder="Your city" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} className="input-field pl-12" required /></div>

              <div className="grid grid-cols-2 gap-2">
                {['Budget', 'Mid-Range', 'Luxury'].map((budget) => (
                  <button key={budget} type="button" onClick={() => setFormData({ ...formData, budget })} className={`px-3 py-2 rounded-xl text-sm ${formData.budget === budget ? 'gradient-primary text-white' : 'bg-muted text-foreground'}`}>
                    {budget}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-2">
                {['Introvert', 'Ambivert', 'Extrovert'].map((personality) => (
                  <button key={personality} type="button" onClick={() => setFormData({ ...formData, personality })} className={`px-3 py-2 rounded-xl text-sm ${formData.personality === personality ? 'gradient-primary text-white' : 'bg-muted text-foreground'}`}>
                    {personality}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap gap-2">
                {interestOptions.map((item) => (
                  <button key={item} type="button" onClick={() => toggleInterest(item)} className={`px-3 py-1.5 rounded-full text-xs ${formData.interests.includes(item) ? 'gradient-primary text-white' : 'bg-muted text-foreground'}`}>
                    {item}
                  </button>
                ))}
              </div>

              <Button type="submit" disabled={loading} className="w-full h-12 gradient-primary text-primary-foreground rounded-xl font-semibold">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Sparkles className="w-4 h-4 mr-2" />Create Account</>}
              </Button>
              <p className="text-center text-sm text-muted-foreground">Already have an account? <button type="button" onClick={() => setStep('login')} className="text-primary font-semibold">Sign in</button></p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
