import React, { useState, useEffect } from 'react';
import { MapPin, Users, BadgeCheck, Heart, MessageCircle, UserPlus, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface TravelersSectionProps {
  onOpenChat?: (userId: string) => void;
  onViewMatch?: (userId: string) => void;
}

const db = supabase as any;

interface Traveler {
  id: string;
  display_name: string;
  avatar_url: string | null;
  location: string | null;
  bio: string | null;
  interests: string[];
}

const TravelersSection: React.FC<TravelersSectionProps> = ({ onOpenChat, onViewMatch }) => {
  const { user } = useAuth();
  const [travelers, setTravelers] = useState<Traveler[]>([]);
  const [following, setFollowing] = useState<Set<string>>(new Set());

  useEffect(() => {
    const load = async () => {
      const [{ data: people }, { data: followRows }] = await Promise.all([
        db.from('profiles').select('id, display_name, avatar_url, location, bio, interests').neq('id', user?.id || '').limit(60),
        user ? db.from('follows').select('following_id,status').eq('follower_id', user.id) : Promise.resolve({ data: [] }),
      ]);

      setTravelers((people || []) as Traveler[]);
      setFollowing(new Set(((followRows || []) as any[]).filter((f) => f.status === 'accepted').map((f) => f.following_id)));
    };
    load();
  }, [user]);

  const handleFollow = async (targetId: string, name: string) => {
    if (!user) return;

    if (following.has(targetId)) {
      await db.from('follows').delete().eq('follower_id', user.id).eq('following_id', targetId);
      const next = new Set(following);
      next.delete(targetId);
      setFollowing(next);
      toast({ title: `Unfollowed ${name}` });
      return;
    }

    await db.from('follows').upsert({ follower_id: user.id, following_id: targetId, status: 'pending' });
    await db.from('notifications').insert({ user_id: targetId, actor_id: user.id, type: 'request', title: 'New follow request', body: 'sent you a request' });
    toast({ title: `Request sent to ${name}` });
  };

  return (
    <section className="py-20 lg:py-32 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
          <div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">Discover <span className="text-gradient">Travelers</span></h2>
            <p className="text-lg text-muted-foreground max-w-xl">All profiles below are real user-created traveler profiles.</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          <div className="lg:col-span-2 h-72 rounded-3xl overflow-hidden relative bg-gradient-to-br from-ocean-light to-teal-light shadow-lg">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 gradient-primary rounded-full flex items-center justify-center shadow-glow">
                <MapPin className="w-8 h-8 text-white" />
              </div>
            </div>
            <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-sm rounded-2xl px-4 py-3 shadow-lg">
              <p className="text-sm text-foreground font-medium flex items-center gap-2"><Users className="w-4 h-4 text-primary" />{travelers.length} active traveler profiles</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="travel-card p-6 bg-gradient-to-br from-primary/5 to-accent/5"><p className="text-3xl font-bold text-foreground">{travelers.length}</p><p className="text-muted-foreground">Traveler Profiles</p></div>
            <div className="travel-card p-6 bg-gradient-to-br from-secondary/5 to-sunset-pink/5"><p className="text-3xl font-bold text-foreground">100%</p><p className="text-muted-foreground">User-generated</p></div>
            <div className="travel-card p-6 bg-gradient-to-br from-success/5 to-primary/5"><p className="text-3xl font-bold text-foreground">Live</p><p className="text-muted-foreground">Real-time network</p></div>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {travelers.map((traveler) => (
            <div key={traveler.id} className="travel-card group hover:shadow-xl transition-all duration-300">
              <div className="flex items-start gap-4 mb-4">
                <div className="relative flex-shrink-0">
                  <img src={traveler.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&h=120&fit=crop&crop=face'} alt={traveler.display_name} className="w-16 h-16 rounded-2xl object-cover" />
                  <div className="absolute -top-1 -right-1 w-6 h-6 gradient-primary rounded-full flex items-center justify-center shadow-md"><BadgeCheck className="w-3.5 h-3.5 text-white" /></div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground truncate">{traveler.display_name}</h3>
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1"><MapPin className="w-3 h-3" />{traveler.location || 'Unknown location'}</p>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{traveler.bio || 'No bio yet'}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 mb-4">
                {(traveler.interests || []).slice(0, 4).map((interest) => (
                  <span key={interest} className="chip chip-primary text-xs">{interest}</span>
                ))}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-border">
                <button onClick={() => handleFollow(traveler.id, traveler.display_name)} className={`px-3 py-1.5 rounded-full text-xs font-medium ${following.has(traveler.id) ? 'bg-muted text-foreground' : 'gradient-primary text-white'}`}>
                  {following.has(traveler.id) ? <span className="inline-flex items-center gap-1"><UserCheck className="w-3 h-3" />Following</span> : <span className="inline-flex items-center gap-1"><UserPlus className="w-3 h-3" />Request</span>}
                </button>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="rounded-full h-9 w-9 p-0" onClick={() => onOpenChat?.(traveler.id)}><MessageCircle className="w-4 h-4" /></Button>
                  <Button size="sm" className="rounded-full h-9 w-9 p-0 gradient-primary text-white" onClick={() => onViewMatch?.(traveler.id)}><Heart className="w-4 h-4" /></Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TravelersSection;
