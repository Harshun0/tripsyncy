import React, { useEffect, useMemo, useState } from 'react';
import { Search, MapPin, BadgeCheck, UserPlus, UserCheck, X, Sparkles } from 'lucide-react';
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
    if (!q.trim()) { setResults([]); setHasSearched(false); return; }
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
      if (error) { toast({ title: 'Follow request failed', description: error.message, variant: 'destructive' }); return; }
      setFollowMap((prev) => ({ ...prev, [targetUserId]: 'pending' }));
      toast({ title: `Request sent to ${targetName}` });
      return;
    }
    await supabase.from('follows').delete().eq('follower_id', user.id).eq('following_id', targetUserId);
    setFollowMap((prev) => { const next = { ...prev }; delete next[targetUserId]; return next; });
    toast({ title: status === 'accepted' ? 'Unfollowed' : 'Request cancelled' });
  };

  return (
    <section className="py-24 lg:py-36 relative overflow-hidden">
      <div className="absolute inset-0 gradient-mesh opacity-30 pointer-events-none" />
      
      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent/8 rounded-full text-accent text-sm font-semibold mb-6 border border-accent/15">
            <Sparkles className="w-4 h-4" />
            Discover People
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 font-display">Search <span className="text-gradient">Travelers</span></h2>
          <p className="text-muted-foreground">Find people by name, location, or bio</p>
        </div>

        {/* Search input with glow effect */}
        <div className="relative mb-10 group">
          <div className="absolute -inset-1 rounded-3xl gradient-primary opacity-0 group-focus-within:opacity-20 blur-lg transition-opacity duration-500" />
          <div className="relative">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input type="text" value={query} onChange={(e) => handleSearch(e.target.value)} placeholder="Search by name, location, or bio..." className="w-full pl-14 pr-12 py-4 h-16 text-lg rounded-2xl bg-card border border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 outline-none shadow-card" />
            {query && (
              <button onClick={() => handleSearch('')} className="absolute right-5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center transition-colors"><X className="w-4 h-4 text-muted-foreground" /></button>
            )}
          </div>
        </div>

        {hasSearched && results.length === 0 && (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-4 rounded-3xl bg-muted/50 flex items-center justify-center">
              <Search className="w-10 h-10 text-muted-foreground/50" />
            </div>
            <p className="text-muted-foreground">No travelers found for "{query}"</p>
          </div>
        )}

        <div className="space-y-4 stagger-children">
          {results.map((profile) => {
            const followStatus = followMap[profile.id];
            return (
              <div key={profile.id} className="group p-5 bg-card rounded-2xl border border-border/50 hover:border-primary/20 flex items-center gap-4 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
                <div className="relative flex-shrink-0">
                  <img src={profile.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&h=120&fit=crop&crop=face'} alt={profile.display_name} className="w-14 h-14 rounded-2xl object-cover ring-2 ring-border/50 group-hover:ring-primary/30 transition-all" loading="lazy" decoding="async" />
                  <div className="absolute -top-1 -right-1 w-5 h-5 gradient-primary rounded-full flex items-center justify-center shadow-sm"><BadgeCheck className="w-3 h-3 text-white" /></div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground font-display">{profile.display_name}</h3>
                  <p className="text-sm text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3" />{profile.location || 'Unknown'}</p>
                  <div className="flex gap-1.5 mt-1.5 flex-wrap">{(profile.interests || []).slice(0, 3).map((i) => <span key={i} className="text-xs px-2.5 py-0.5 bg-primary/8 text-primary rounded-full font-medium">{i}</span>)}</div>
                </div>
                <button onClick={() => handleFollow(profile.id, profile.display_name)} className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-all duration-300 ${followStatus === 'accepted' ? 'bg-muted text-foreground hover:bg-muted/80' : followStatus === 'pending' ? 'bg-secondary/10 text-secondary' : 'gradient-primary text-white shadow-sm hover:shadow-glow'}`}>
                  {followStatus === 'accepted' ? <><UserCheck className="w-3.5 h-3.5" /> Following</> : followStatus === 'pending' ? <><UserPlus className="w-3.5 h-3.5" /> Requested</> : <><UserPlus className="w-3.5 h-3.5" /> Follow</>}
                </button>
              </div>
            );
          })}
        </div>

        {!hasSearched && (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
              <Search className="w-12 h-12 text-primary/40" />
            </div>
            <p className="text-muted-foreground text-lg">Start typing to search for travelers</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default SearchSection;
