import React, { useState } from 'react';
import { X, MapPin, Mail, Lock, User, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onComplete }) => {
  const { signIn, signUp } = useAuth();
  const [step, setStep] = useState<'login' | 'signup'>('login');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '', name: '' });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signIn(formData.email, formData.password);
    setLoading(false);
    if (error) {
      toast({ title: 'Login failed', description: error, variant: 'destructive' });
    } else {
      toast({ title: 'Welcome back! 👋' });
      onComplete();
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password.length < 6) {
      toast({ title: 'Password too short', description: 'Must be at least 6 characters.', variant: 'destructive' });
      return;
    }
    setLoading(true);
    const { error } = await signUp(formData.email, formData.password, formData.name);
    setLoading(false);
    if (error) {
      toast({ title: 'Signup failed', description: error, variant: 'destructive' });
    } else {
      toast({ title: 'Check your email! 📧', description: 'We sent a verification link. Please confirm your email to sign in.' });
      setStep('login');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-background rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="gradient-hero relative p-8">
          <button onClick={onClose} className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors">
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

        <div className="p-6">
          {step === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-foreground">Welcome Back!</h2>
                <p className="text-muted-foreground text-sm mt-1">Sign in to continue your journey</p>
              </div>
              <div className="space-y-3">
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input type="email" placeholder="Email address" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="input-field pl-12" required />
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input type="password" placeholder="Password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="input-field pl-12" required />
                </div>
              </div>
              <Button type="submit" disabled={loading} className="w-full h-12 gradient-primary text-primary-foreground rounded-xl font-semibold">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Sign In<ArrowRight className="w-5 h-5 ml-2" /></>}
              </Button>
              <p className="text-center text-sm text-muted-foreground mt-4">
                Don't have an account?{' '}
                <button type="button" onClick={() => setStep('signup')} className="text-primary font-semibold">Sign up</button>
              </p>
            </form>
          ) : (
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-foreground">Create Account</h2>
                <p className="text-muted-foreground text-sm mt-1">Join our community of travelers</p>
              </div>
              <div className="space-y-3">
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input type="text" placeholder="Display name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="input-field pl-12" required />
                </div>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input type="email" placeholder="Email address" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="input-field pl-12" required />
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <input type="password" placeholder="Create password (min 6 chars)" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="input-field pl-12" required minLength={6} />
                </div>
              </div>
              <Button type="submit" disabled={loading} className="w-full h-12 gradient-primary text-primary-foreground rounded-xl font-semibold">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Create Account<ArrowRight className="w-5 h-5 ml-2" /></>}
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{' '}
                <button type="button" onClick={() => setStep('login')} className="text-primary font-semibold">Sign in</button>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
