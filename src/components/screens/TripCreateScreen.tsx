import React, { useState } from 'react';
import { MapPin, Calendar, Wallet, Users, Sparkles, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

const db = supabase as any;

interface TripCreateScreenProps {
  onBack: () => void;
}

const TripCreateScreen: React.FC<TripCreateScreenProps> = ({ onBack }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    destination: '', startDate: '', endDate: '', budget: '', maxPeople: '1', description: '', interests: [] as string[],
  });

  const toggleInterest = (i: string) => setForm(p => ({ ...p, interests: p.interests.includes(i) ? p.interests.filter(x => x !== i) : [...p.interests, i] }));

  const handleCreate = async () => {
    if (!user || !form.destination.trim()) { toast({ title: 'Enter a destination', variant: 'destructive' }); return; }
    setLoading(true);
    const { error } = await db.from('trips').insert({
      user_id: user.id, destination: form.destination, start_date: form.startDate || null, end_date: form.endDate || null,
      budget: form.budget ? parseFloat(form.budget) : 0, max_people: parseInt(form.maxPeople) || 1,
      description: form.description, interests: form.interests, status: 'planning',
    });
    setLoading(false);
    if (error) { toast({ title: 'Failed', description: error.message, variant: 'destructive' }); }
    else { toast({ title: 'Trip created! 🎉' }); onBack(); }
  };

  return (
    <section className="py-20 lg:py-32 bg-background">
      <div className="max-w-2xl mx-auto px-4">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium mb-4"><Sparkles className="w-4 h-4" />Create Trip</div>
          <h1 className="text-3xl font-bold text-foreground">Plan Your Adventure</h1>
          <p className="text-muted-foreground mt-2">Create a trip and invite travel buddies</p>
        </div>
        <div className="travel-card p-8 space-y-5">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Destination</label>
            <div className="relative"><MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" /><input type="text" value={form.destination} onChange={e => setForm(p => ({ ...p, destination: e.target.value }))} placeholder="Where to?" className="input-field pl-12" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-foreground mb-2">Start Date</label><div className="relative"><Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" /><input type="date" value={form.startDate} onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))} className="input-field pl-12" /></div></div>
            <div><label className="block text-sm font-medium text-foreground mb-2">End Date</label><div className="relative"><Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" /><input type="date" value={form.endDate} onChange={e => setForm(p => ({ ...p, endDate: e.target.value }))} className="input-field pl-12" /></div></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-foreground mb-2">Budget (₹)</label><div className="relative"><Wallet className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" /><input type="number" value={form.budget} onChange={e => setForm(p => ({ ...p, budget: e.target.value }))} placeholder="20000" className="input-field pl-12" /></div></div>
            <div><label className="block text-sm font-medium text-foreground mb-2">Max People</label><div className="relative"><Users className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" /><input type="number" value={form.maxPeople} onChange={e => setForm(p => ({ ...p, maxPeople: e.target.value }))} min="1" max="20" className="input-field pl-12" /></div></div>
          </div>
          <div><label className="block text-sm font-medium text-foreground mb-2">Description</label><textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Tell others about your trip..." className="input-field min-h-[100px] resize-none" /></div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Interests</label>
            <div className="flex flex-wrap gap-2">
              {['Adventure', 'Food', 'Culture', 'Nature', 'Beach', 'Nightlife', 'History', 'Photography'].map(i => (
                <button key={i} onClick={() => toggleInterest(i)} className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${form.interests.includes(i) ? 'gradient-primary text-white' : 'bg-muted hover:bg-primary/10 hover:text-primary'}`}>{i}</button>
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button onClick={onBack} variant="outline" className="flex-1 h-12 rounded-xl">Cancel</Button>
            <Button onClick={handleCreate} disabled={loading} className="flex-1 h-12 gradient-primary text-primary-foreground rounded-xl font-semibold shadow-glow">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Create Trip<ArrowRight className="w-5 h-5 ml-2" /></>}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TripCreateScreen;
