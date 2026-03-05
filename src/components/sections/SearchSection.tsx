import React, { useState, useEffect } from 'react';
import { Search, MapPin, BadgeCheck, UserPlus, UserCheck, X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

const db = supabase as any;

interface TravelerProfile {
  id: string;
  display_name: string;
  avatar_url: string | null;
  location: string | null;
  interests: string[];
  personality: string | null;
}

const SearchSection: React.FC = () => {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [profiles, setProfiles] = useState<TravelerProfile[]>([]);
  const [results, setResults] = useState<TravelerProfile[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [following, setFollowing] = useState<Set<string>>(new Set());

  useEffect(() => {
    const load = async () => {
      const [{ data: profileRows }, { data: followRows }] = await Promise.all([
        db.from('profiles').select('id, display_name, avatar_url, location, interests, personality').neq('id', user?.id || '').limit(100),
        user ? db.from('follows').select('following_id').eq('follower_id', user.id).eq('status', 'accepted') : Promise.resolve({ data: [] }),
      ]);
      setProfiles((profileRows || []) as TravelerProfile[]);
      setResults((profileRows || []) as TravelerProfile[]);
      setFollowing(new Set(((followRows || []) as any[]).map((f) => f.following_id)));
    };
    load();
  }, [user]);

  const handleSearch = (q: string) => {
    setQuery(q);
    if (!q.trim()) {
      setResults(profiles);
      setHasSearched(false);
      return;
    }
    setHasSearched(true);
    const lower = q.toLowerCase();
    setResults(
      profiles.filter(
        (p) =>
          p.display_name?.toLowerCase().includes(lower) ||
          p.location?.toLowerCase().includes(lower) ||
          p.interests?.some((i) => i.toLowerCase().includes(lower))
      )
    );
  };

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

    await db.from('follows').upsert({ follower_id: user.id, following_id: targetId, status: 'accepted' });
    setFollowing((prev) => new Set(prev).add(targetId));
    await db.from('notifications').insert({ user_id: targetId, actor_id: user.id, type: 'follow', title: 'New follower', body: 'started following you' });
    toast({ title: `Now following ${name}` });
  };

  return (
    <section className="py-20 lg:py-32 bg-background">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Search <span className="text-gradient">Travelers</span>
          </h2>
          <p className="text-muted-foreground">Find real users by name, location, or interests</p>
        </div>

        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input type="text" value={query} onChange={(e) => handleSearch(e.target.value)} placeholder="Search by name, location, or interest..." className="input-field pl-12 pr-10 h-14 text-lg rounded-2xl" />
          {query && (
            <button onClick={() => handleSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2">
              <X className="w-5 h-5 text-muted-foreground hover:text-foreground" />
            </button>
          )}
        </div>

        {hasSearched && results.length === 0 && (
          <div className="text-center py-12">
            <Search className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">No travelers found for "{query}"</p>
          </div>
        )}

        <div className="space-y-4">
          {results.map((profile) => (
            <div key={profile.id} className="travel-card p-4 flex items-center gap-4">
              <div className="relative flex-shrink-0">
                <img src={profile.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&h=120&fit=crop&crop=face'} alt={profile.display_name} className="w-14 h-14 rounded-2xl object-cover" />
                <div className="absolute -top-1 -right-1 w-5 h-5 gradient-primary rounded-full flex items-center justify-center">
                  <BadgeCheck className="w-3 h-3 text-white" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground">{profile.display_name}</h3>
                <p className="text-sm text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3" />{profile.location || 'Location not set'}</p>
                <div className="flex gap-1.5 mt-1 flex-wrap">
                  {(profile.interests || []).slice(0, 3).map((i) => (
                    <span key={i} className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full">{i}</span>
                  ))}
                </div>
              </div>
              <button onClick={() => handleFollow(profile.id, profile.display_name)} className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${following.has(profile.id) ? 'bg-muted text-foreground' : 'gradient-primary text-white'}`}>
                {following.has(profile.id) ? <><UserCheck className="w-3 h-3" /> Following</> : <><UserPlus className="w-3 h-3" /> Follow</>}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SearchSection;
