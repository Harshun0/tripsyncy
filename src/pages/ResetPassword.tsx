import React, { useEffect, useState } from 'react';
import { Lock, Eye, EyeOff, ArrowRight, Loader2, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Check for recovery token in URL hash
    const hash = window.location.hash;
    if (hash.includes('type=recovery')) {
      setReady(true);
    } else {
      // Also check via session
      supabase.auth.getSession().then(({ data }) => {
        if (data.session) setReady(true);
      });
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { toast({ title: 'Passwords do not match', variant: 'destructive' }); return; }
    if (password.length < 6) { toast({ title: 'Password must be at least 6 characters', variant: 'destructive' }); return; }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) { toast({ title: 'Failed to reset password', description: error.message, variant: 'destructive' }); return; }

    toast({ title: 'Password reset successfully! 🔒' });
    navigate('/');
  };

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">Invalid or expired reset link.</p>
          <Button onClick={() => navigate('/')} variant="outline">Go Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md bg-card rounded-3xl shadow-xl p-8 space-y-6">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 gradient-primary rounded-2xl flex items-center justify-center">
            <MapPin className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Set New Password</h1>
          <p className="text-sm text-muted-foreground mt-1">Enter your new password below</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input type={showPassword ? 'text' : 'password'} placeholder="New password" value={password} onChange={(e) => setPassword(e.target.value)} className="input-field pl-12 pr-12" required minLength={6} />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input type={showPassword ? 'text' : 'password'} placeholder="Confirm password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className="input-field pl-12" required minLength={6} />
          </div>
          <Button type="submit" disabled={loading} className="w-full h-12 gradient-primary text-primary-foreground rounded-xl font-semibold">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Reset Password<ArrowRight className="w-5 h-5 ml-2" /></>}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
