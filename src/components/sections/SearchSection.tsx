import React, { useEffect, useMemo, useState } from 'react';
import { Search, MapPin, BadgeCheck, UserPlus, UserCheck, X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface ProfileResult {
  id: string;
  display_name: string;
  location: string | null;
  avatar_url: string | null;
  interests: string[];
  bio: string | null;
}

const SearchSection: React.FC = () => {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ProfileResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [followMap, setFollowMap] = useState<Record<string, string>>({});

  const ids = useMemo(() => results.map((r) => r.id), [results]);

  useEffect(() => {
    if (!user || ids.length === 0) return;

    const loadFollowStatus = async () => {
      const { data } = await supabase.from('follows').select('following_id,status').eq('follower_id', user.id).in('following_id', ids);
      const map: Record<string, string> = {};
      (data || []).forEach((r: any) => { map[r.following_id] = r.status; });
      setFollowMap(map);
    };

    loadFollowStatus();
  }, [user, ids.join(',')]);

  const handleSearch = async (q: string) => {
    setQuery(q);

    if (!q.trim()) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    setHasSearched(true);

    const { data } = await supabase
      .from('profiles')
      .select('id,display_name,location,avatar_url,interests,bio')
      .neq('id', user?.id || '')
      .or(`display_name.ilike.%${q}%,location.ilike.%${q}%,bio.ilike.%${q}%`)
      .limit(40);

    setResults((data || []) as ProfileResult[]);
  };

  const handleFollow = async (targetUserId: string, targetName: string) => {
    if (!user) return;
    const status = followMap[targetUserId];

    if (!status) {
      const { error } = await supabase.from('follows').insert({ follower_id: user.id, following_id: targetUserId, status: 'pending' });
      if (error) {
        toast({ title: 'Follow request failed', description: error.message, variant: 'destructive' });
        return;
      }
      setFollowMap((prev) => ({ ...prev, [targetUserId]: 'pending' }));
      toast({ title: `Request sent to ${targetName}` });
      return;
    }

    await supabase.from('follows').delete().eq('follower_id', user.id).eq('following_id', targetUserId);
    setFollowMap((prev) => {
      const next = { ...prev };
      delete next[targetUserId];
      return next;
    });
    toast({ title: status === 'accepted' ? 'Unfollowed' : 'Request cancelled' });
  };

  return (
    <section className="py-20 lg:py-32 bg-background">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Search <span className="text-gradient">Travelers</span></h2>
          <p className="text-muted-foreground">Find people by name, location, or bio</p>
        </div>

        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input type="text" value={query} onChange={(e) => handleSearch(e.target.value)} placeholder="Search by name, location, or bio..." className="input-field pl-12 pr-10 h-14 text-lg rounded-2xl" />
          {query && (
            <button onClick={() => handleSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2"><X className="w-5 h-5 text-muted-foreground hover:text-foreground" /></button>
          )}
        </div>

        {hasSearched && results.length === 0 && (
          <div className="text-center py-12"><Search className="w-12 h-12 text-muted-foreground mx-auto mb-3" /><p className="text-muted-foreground">No travelers found for "{query}"</p></div>
        )}

        <div className="space-y-4">
          {results.map((profile) => {
            const followStatus = followMap[profile.id];
            return (
              <div key={profile.id} className="travel-card p-4 flex items-center gap-4">
                <div className="relative flex-shrink-0">
                  <img src={profile.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&h=120&fit=crop&crop=face'} alt={profile.display_name} className="w-14 h-14 rounded-2xl object-cover" />
                  <div className="absolute -top-1 -right-1 w-5 h-5 gradient-primary rounded-full flex items-center justify-center"><BadgeCheck className="w-3 h-3 text-white" /></div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground">{profile.display_name}</h3>
                  <p className="text-sm text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3" />{profile.location || 'Unknown'}</p>
                  <div className="flex gap-1.5 mt-1 flex-wrap">{(profile.interests || []).slice(0, 3).map((i) => <span key={i} className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full">{i}</span>)}</div>
                </div>
                <button onClick={() => handleFollow(profile.id, profile.display_name)} className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${followStatus === 'accepted' ? 'bg-muted text-foreground' : 'gradient-primary text-white'}`}>
                  {followStatus === 'accepted' ? <><UserCheck className="w-3 h-3" /> Following</> : followStatus === 'pending' ? <><UserPlus className="w-3 h-3" /> Requested</> : <><UserPlus className="w-3 h-3" /> Follow</>}
                </button>
              </div>
            );
          })}
        </div>

        {!hasSearched && (
          <div className="text-center py-12 text-muted-foreground"><Search className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" /><p>Start typing to search for travelers</p></div>
        )}
      </div>
    </section>
  );
};

export default SearchSection;
