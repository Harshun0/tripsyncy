import React, { useEffect, useState, useMemo } from 'react';
import { MapPin, BadgeCheck, MessageCircle, UserPlus, UserCheck, Lock, Sparkles, Star, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface RecommendedProfile {
  id: string;
  display_name: string;
  avatar_url: string | null;
  location: string | null;
  bio: string | null;
  interests: string[];
  profile_visibility: string;
}

interface ScoredProfile extends RecommendedProfile {
  score: number;
  sharedInterests: string[];
}

function computeScore(userInterests: string[], travelerInterests: string[]): { score: number; shared: string[] } {
  if (!userInterests.length || !travelerInterests.length) return { score: 10, shared: [] };
  const uSet = new Set(userInterests.map(i => i.toLowerCase()));
  const shared = travelerInterests.filter(i => uSet.has(i.toLowerCase()));
  const union = new Set([...userInterests.map(i => i.toLowerCase()), ...travelerInterests.map(i => i.toLowerCase())]);
  const jaccardScore = Math.round((shared.length / union.size) * 100);
  return { score: Math.max(jaccardScore, 5), shared };
}

function scoreColor(score: number) {
  if (score >= 70) return { bg: 'from-emerald-500 to-teal-500', text: 'text-emerald-600', badge: 'bg-emerald-500', bar: 'from-emerald-400 to-teal-400' };
  if (score >= 40) return { bg: 'from-amber-500 to-orange-500', text: 'text-amber-600', badge: 'bg-amber-500', bar: 'from-amber-400 to-orange-400' };
  return { bg: 'from-primary to-primary', text: 'text-primary', badge: 'bg-primary/80', bar: 'from-primary/50 to-primary/70' };
}

const RecommendedSection: React.FC = () => {
  const { user, profile } = useAuth();
  const [travelers, setTravelers] = useState<RecommendedProfile[]>([]);
  const [followMap, setFollowMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('profiles')
        .select('id,display_name,avatar_url,location,bio,interests,profile_visibility')
        .neq('id', user.id)
        .limit(50);

      const profiles = (data || []) as RecommendedProfile[];
      setTravelers(profiles);

      if (profiles.length) {
        const ids = profiles.map(p => p.id);
        const { data: follows } = await supabase
          .from('follows')
          .select('following_id,status')
          .eq('follower_id', user.id)
          .in('following_id', ids);
        const map: Record<string, string> = {};
        (follows || []).forEach((f: any) => { map[f.following_id] = f.status; });
        setFollowMap(map);
      }
      setLoading(false);
    };
    load();
  }, [user]);

  const myInterests = useMemo(() => profile?.interests || [], [profile]);

  const scoredTravelers = useMemo(() => {
    return travelers
      .map(t => {
        const { score, shared } = computeScore(myInterests, t.interests || []);
        return { ...t, score, sharedInterests: shared } as ScoredProfile;
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 12);
  }, [travelers, myInterests]);

  const handleFollow = async (targetUserId: string, name: string, isPrivate: boolean) => {
    if (!user) return;
    const status = followMap[targetUserId];
    if (!status) {
      const newStatus = isPrivate ? 'pending' : 'accepted';
      const { error } = await supabase.from('follows').insert({ follower_id: user.id, following_id: targetUserId, status: newStatus });
      if (error) { toast({ title: 'Follow failed', description: error.message, variant: 'destructive' }); return; }
      setFollowMap(prev => ({ ...prev, [targetUserId]: newStatus }));
      toast({ title: isPrivate ? `Request sent to ${name}` : `Following ${name}` });
      return;
    }
    await supabase.from('follows').delete().eq('follower_id', user.id).eq('following_id', targetUserId);
    setFollowMap(prev => { const next = { ...prev }; delete next[targetUserId]; return next; });
    toast({ title: status === 'accepted' ? `Unfollowed ${name}` : 'Request cancelled' });
  };

  if (!user || loading) return null;
  if (!scoredTravelers.length) return null;

  return (
    <div className="mt-20">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground tracking-tight">
              Recommended <span className="text-gradient">for You</span>
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">People who match your travel style & interests</p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-full px-3 py-1.5">
          <TrendingUp className="w-3.5 h-3.5 text-primary" />
          <span>{scoredTravelers.length} matches</span>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {scoredTravelers.map((traveler, idx) => {
          const status = followMap[traveler.id];
          const isPrivate = traveler.profile_visibility !== 'public';
          const colors = scoreColor(traveler.score);

          return (
            <div
              key={traveler.id}
              className="group relative rounded-2xl border border-border/60 bg-card p-5 hover:shadow-lg hover:border-primary/20 transition-all duration-300 hover:-translate-y-0.5"
              style={{ animationDelay: `${idx * 60}ms` }}
            >
              {/* Top Row: Avatar + Info + Badge */}
              <div className="flex items-start gap-3.5 mb-4">
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <img
                    src={traveler.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&h=120&fit=crop&crop=face'}
                    alt={traveler.display_name}
                    className="w-14 h-14 rounded-xl object-cover ring-2 ring-border/50 group-hover:ring-primary/30 transition-all"
                  />
                  {isPrivate ? (
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-muted rounded-full flex items-center justify-center border-2 border-card shadow-sm">
                      <Lock className="w-2.5 h-2.5 text-muted-foreground" />
                    </div>
                  ) : (
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 gradient-primary rounded-full flex items-center justify-center border-2 border-card shadow-sm">
                      <BadgeCheck className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-semibold text-foreground truncate text-[15px]">{traveler.display_name}</h3>
                    {isPrivate && <Lock className="w-3 h-3 text-muted-foreground/60 flex-shrink-0" />}
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3" />
                    {traveler.location || 'Unknown'}
                  </p>
                  <p className="text-xs text-muted-foreground/80 mt-1 line-clamp-1">{traveler.bio || 'Explorer & adventure seeker'}</p>
                </div>

                {/* Score Badge */}
                <div className={`flex-shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-white text-xs font-bold shadow-md bg-gradient-to-r ${colors.bg}`}>
                  <Star className="w-3 h-3" />
                  {traveler.score}%
                </div>
              </div>

              {/* Score Bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] text-muted-foreground/70 font-medium">Match Score</span>
                  <span className={`text-xs font-bold ${colors.text}`}>{traveler.score}%</span>
                </div>
                <div className="w-full h-1.5 bg-muted/60 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ease-out bg-gradient-to-r ${colors.bar}`}
                    style={{ width: `${traveler.score}%` }}
                  />
                </div>
              </div>

              {/* Interests */}
              <div className="mb-4 min-h-[28px]">
                {traveler.sharedInterests.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {traveler.sharedInterests.slice(0, 3).map(interest => (
                      <span key={interest} className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/15">
                        ✦ {interest}
                      </span>
                    ))}
                    {traveler.sharedInterests.length > 3 && (
                      <span className="text-[11px] text-muted-foreground/60 self-center">+{traveler.sharedInterests.length - 3}</span>
                    )}
                  </div>
                ) : (traveler.interests || []).length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {(traveler.interests || []).slice(0, 3).map(interest => (
                      <span key={interest} className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-muted/80 text-muted-foreground">{interest}</span>
                    ))}
                  </div>
                ) : null}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-3 border-t border-border/50">
                <Button size="sm" variant="ghost" className="rounded-full h-8 px-3 text-xs flex-1 hover:bg-muted/80">
                  <MessageCircle className="w-3.5 h-3.5 mr-1.5" />Message
                </Button>
                <Button
                  size="sm"
                  className={`rounded-full h-8 px-3 text-xs flex-1 ${
                    status === 'accepted' ? 'bg-muted text-foreground hover:bg-muted/80' :
                    status === 'pending' ? 'bg-secondary/90 text-secondary-foreground hover:bg-secondary' :
                    'gradient-primary text-white shadow-sm hover:shadow-md'
                  }`}
                  onClick={() => handleFollow(traveler.id, traveler.display_name, isPrivate)}
                >
                  {status === 'accepted' ? <><UserCheck className="w-3.5 h-3.5 mr-1" />Following</> :
                   status === 'pending' ? <><UserPlus className="w-3.5 h-3.5 mr-1" />Requested</> :
                   <><UserPlus className="w-3.5 h-3.5 mr-1" />Follow</>}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RecommendedSection;
