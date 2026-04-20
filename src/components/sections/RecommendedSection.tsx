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

interface RecommendedSectionProps {
  onMessageUser?: (userId: string) => void;
  onViewUserProfile?: (userId: string) => void;
}

function computeScore(userInterests: string[], travelerInterests: string[]): { score: number; shared: string[] } {
  if (!userInterests.length || !travelerInterests.length) return { score: 10, shared: [] };
  const uSet = new Set(userInterests.map(i => i.toLowerCase()));
  const shared = travelerInterests.filter(i => uSet.has(i.toLowerCase()));
  const union = new Set([...userInterests.map(i => i.toLowerCase()), ...travelerInterests.map(i => i.toLowerCase())]);
  const jaccardScore = Math.round((shared.length / union.size) * 100);
  return { score: Math.max(jaccardScore, 5), shared };
}

const RecommendedSection: React.FC<RecommendedSectionProps> = ({ onMessageUser, onViewUserProfile }) => {
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
        const { data: follows } = await supabase.from('follows').select('following_id,status').eq('follower_id', user.id).in('following_id', ids);
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
    <div className="mt-16">
      {/* Header — matches Discover Nearby Travelers style */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
        <div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Recommended <span className="text-gradient">for You</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl">People who match your travel style & interests</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <TrendingUp className="w-4 h-4 text-primary" />
          <span>{scoredTravelers.length} matches found</span>
        </div>
      </div>

      {/* Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {scoredTravelers.map((traveler) => {
          const status = followMap[traveler.id];
          const isPrivate = traveler.profile_visibility !== 'public';
          const scorePercent = traveler.score;

          return (
            <div
              key={traveler.id}
              role="button"
              tabIndex={0}
              onClick={() => onViewUserProfile?.(traveler.id)}
              onKeyDown={(e) => { if (e.key === 'Enter') onViewUserProfile?.(traveler.id); }}
              className="travel-card group hover:shadow-xl transition-all duration-300 cursor-pointer"
            >
              {/* Top: avatar + name + score */}
              <div className="flex items-start gap-4 mb-4">
                <div className="relative flex-shrink-0">
                  <img
                    src={traveler.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&h=120&fit=crop&crop=face'}
                    alt={traveler.display_name}
                    className="w-16 h-16 rounded-2xl object-cover"
                  />
                  {isPrivate ? (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-muted rounded-full flex items-center justify-center border-2 border-background">
                      <Lock className="w-2.5 h-2.5 text-muted-foreground" />
                    </div>
                  ) : (
                    <div className="absolute -top-1 -right-1 w-6 h-6 gradient-primary rounded-full flex items-center justify-center shadow-md">
                      <BadgeCheck className="w-3.5 h-3.5 text-white" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-semibold text-foreground truncate hover:text-primary transition-colors">{traveler.display_name}</h3>
                    {isPrivate && <Lock className="w-3 h-3 text-muted-foreground flex-shrink-0" />}
                  </div>
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3" />{traveler.location || 'Unknown'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{traveler.bio || 'No bio added yet.'}</p>
                </div>
              </div>

              {/* Match Score Bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold text-white shadow-sm ${
                      scorePercent >= 70 ? 'bg-gradient-to-r from-emerald-500 to-teal-500' :
                      scorePercent >= 40 ? 'bg-gradient-to-r from-amber-500 to-orange-500' :
                      'gradient-primary'
                    }`}>
                      <Star className="w-3 h-3" />
                      {scorePercent}% Match
                    </div>
                  </div>
                </div>
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      scorePercent >= 70 ? 'bg-gradient-to-r from-emerald-400 to-teal-400' :
                      scorePercent >= 40 ? 'bg-gradient-to-r from-amber-400 to-orange-400' :
                      'gradient-primary'
                    }`}
                    style={{ width: `${scorePercent}%` }}
                  />
                </div>
              </div>

              {/* Interests */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {traveler.sharedInterests.length > 0 ? (
                  <>
                    {traveler.sharedInterests.slice(0, 4).map(interest => (
                      <span key={interest} className="chip chip-primary text-xs">{interest}</span>
                    ))}
                    {traveler.sharedInterests.length > 4 && (
                      <span className="text-xs text-muted-foreground">+{traveler.sharedInterests.length - 4}</span>
                    )}
                  </>
                ) : (traveler.interests || []).length > 0 ? (
                  (traveler.interests || []).slice(0, 4).map(interest => (
                    <span key={interest} className="chip text-xs bg-muted text-muted-foreground">{interest}</span>
                  ))
                ) : null}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <Button size="sm" variant="outline" className="rounded-full h-9 px-3" onClick={(e) => { e.stopPropagation(); onMessageUser?.(traveler.id); }}>
                  <MessageCircle className="w-4 h-4 mr-1" />Message
                </Button>
                <Button
                  size="sm"
                  className={`rounded-full h-9 px-3 ${
                    status === 'accepted' ? 'bg-muted text-foreground' :
                    status === 'pending' ? 'bg-secondary text-secondary-foreground' :
                    'gradient-primary text-white'
                  }`}
                  onClick={(e) => { e.stopPropagation(); handleFollow(traveler.id, traveler.display_name, isPrivate); }}
                >
                  {status === 'accepted' ? <><UserCheck className="w-4 h-4 mr-1" />Following</> :
                   status === 'pending' ? <><UserPlus className="w-4 h-4 mr-1" />Requested</> :
                   <><UserPlus className="w-4 h-4 mr-1" />Follow</>}
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
