import React, { useEffect, useMemo, useState } from 'react';
import { MapPin, Users, BadgeCheck, Heart, MessageCircle, UserPlus, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface TravelerProfile {
  id: string;
  display_name: string;
  avatar_url: string | null;
  location: string | null;
  bio: string | null;
  interests: string[];
}

const TravelersSection: React.FC = () => {
  const { user } = useAuth();
  const [selectedRadius, setSelectedRadius] = useState('25');
  const [travelers, setTravelers] = useState<TravelerProfile[]>([]);
  const [followMap, setFollowMap] = useState<Record<string, string>>({});

  const radiusOptions = ['1', '5', '10', '25'];

  useEffect(() => {
    const loadTravelers = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('id,display_name,avatar_url,location,bio,interests')
        .neq('id', user?.id || '')
        .limit(30);

      setTravelers((data || []) as TravelerProfile[]);

      if (user && data && data.length) {
        const ids = data.map((p: any) => p.id);
        const { data: follows } = await supabase.from('follows').select('following_id,status').eq('follower_id', user.id).in('following_id', ids);
        const map: Record<string, string> = {};
        (follows || []).forEach((f: any) => { map[f.following_id] = f.status; });
        setFollowMap(map);
      }
    };

    loadTravelers();
  }, [user]);

  const filteredTravelers = useMemo(() => travelers, [travelers]);

  const handleFollow = async (targetUserId: string, name: string) => {
    if (!user) return;

    const status = followMap[targetUserId];
    if (!status) {
      const { error } = await supabase.from('follows').insert({
        follower_id: user.id,
        following_id: targetUserId,
        status: 'pending',
      });
      if (error) {
        toast({ title: 'Follow request failed', description: error.message, variant: 'destructive' });
        return;
      }
      setFollowMap((prev) => ({ ...prev, [targetUserId]: 'pending' }));
      toast({ title: `Request sent to ${name}` });
      return;
    }

    await supabase.from('follows').delete().eq('follower_id', user.id).eq('following_id', targetUserId);
    setFollowMap((prev) => {
      const next = { ...prev };
      delete next[targetUserId];
      return next;
    });
    toast({ title: status === 'accepted' ? `Unfollowed ${name}` : 'Request cancelled' });
  };

  return (
    <section className="py-20 lg:py-32 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
          <div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">Discover <span className="text-gradient">Nearby Travelers</span></h2>
            <p className="text-lg text-muted-foreground max-w-xl">All profiles shown here are real user profiles.</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-sm text-muted-foreground">Radius:</span>
            {radiusOptions.map((radius) => (
              <button key={radius} onClick={() => setSelectedRadius(radius)} className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedRadius === radius ? 'gradient-primary text-primary-foreground shadow-md' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>{radius} km</button>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          <div className="lg:col-span-2 h-72 rounded-3xl overflow-hidden relative bg-gradient-to-br from-ocean-light to-teal-light shadow-lg">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                <div className="w-16 h-16 gradient-primary rounded-full flex items-center justify-center shadow-glow animate-pulse-slow"><MapPin className="w-8 h-8 text-white" /></div>
                {filteredTravelers.slice(0, 6).map((traveler, index) => {
                  const angles = [30, 80, 130, 200, 260, 320];
                  const distance = 60 + (index + 1) * 8;
                  const angle = angles[index] * (Math.PI / 180);
                  const x = Math.cos(angle) * distance;
                  const y = Math.sin(angle) * distance;
                  return (
                    <div key={traveler.id} className="absolute w-12 h-12 rounded-full border-2 border-background shadow-lg overflow-hidden" style={{ transform: `translate(${x}px, ${y}px)`, left: '50%', top: '50%', marginLeft: '-24px', marginTop: '-24px' }}>
                      <img src={traveler.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face'} alt={traveler.display_name} className="w-full h-full object-cover" />
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="absolute bottom-4 left-4 right-4 bg-background/95 backdrop-blur-sm rounded-2xl px-4 py-3 shadow-lg"><p className="text-sm text-foreground font-medium flex items-center gap-2"><Users className="w-4 h-4 text-primary" />{filteredTravelers.length} real travelers nearby</p></div>
          </div>

          <div className="space-y-4">
            <div className="travel-card p-6 bg-gradient-to-br from-primary/5 to-accent/5"><div className="flex items-center gap-4"><div className="w-14 h-14 gradient-primary rounded-2xl flex items-center justify-center"><Users className="w-7 h-7 text-white" /></div><div><p className="text-3xl font-bold text-foreground">{filteredTravelers.length}</p><p className="text-muted-foreground">Active Travelers</p></div></div></div>
            <div className="travel-card p-6 bg-gradient-to-br from-secondary/5 to-accent/5"><div className="flex items-center gap-4"><div className="w-14 h-14 bg-gradient-to-br from-secondary to-accent rounded-2xl flex items-center justify-center"><Heart className="w-7 h-7 text-white" /></div><div><p className="text-3xl font-bold text-foreground">Live</p><p className="text-muted-foreground">Follow Requests</p></div></div></div>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTravelers.map((traveler) => {
            const status = followMap[traveler.id];
            return (
              <div key={traveler.id} className="travel-card group hover:shadow-xl transition-all duration-300">
                <div className="flex items-start gap-4 mb-4">
                  <div className="relative flex-shrink-0">
                    <img src={traveler.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&h=120&fit=crop&crop=face'} alt={traveler.display_name} className="w-16 h-16 rounded-2xl object-cover" />
                    <div className="absolute -top-1 -right-1 w-6 h-6 gradient-primary rounded-full flex items-center justify-center shadow-md"><BadgeCheck className="w-3.5 h-3.5 text-white" /></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground truncate">{traveler.display_name}</h3>
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1"><MapPin className="w-3 h-3" />{traveler.location || 'Unknown'}</p>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{traveler.bio || 'No bio added yet.'}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-4">{(traveler.interests || []).slice(0, 4).map((interest) => <span key={interest} className="chip chip-primary text-xs">{interest}</span>)}</div>
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <Button size="sm" variant="outline" className="rounded-full h-9 px-3"><MessageCircle className="w-4 h-4 mr-1" />Message</Button>
                  <Button size="sm" className={`rounded-full h-9 px-3 ${status === 'accepted' ? 'bg-muted text-foreground' : status === 'pending' ? 'bg-secondary text-secondary-foreground' : 'gradient-primary text-white'}`} onClick={() => handleFollow(traveler.id, traveler.display_name)}>
                    {status === 'accepted' ? <><UserCheck className="w-4 h-4 mr-1" />Following</> : status === 'pending' ? <><UserPlus className="w-4 h-4 mr-1" />Requested</> : <><UserPlus className="w-4 h-4 mr-1" />Follow</>}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default TravelersSection;
