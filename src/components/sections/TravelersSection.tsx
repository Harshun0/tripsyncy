import React, { useEffect, useMemo, useRef, useCallback, useState, memo } from 'react';
import { MapPin, Users, BadgeCheck, Heart, MessageCircle, UserPlus, UserCheck, X, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import RecommendedSection from './RecommendedSection';

interface TravelerProfile {
  id: string;
  display_name: string;
  avatar_url: string | null;
  location: string | null;
  bio: string | null;
  interests: string[];
}

// Known city coordinates for geocoding
const CITY_COORDS: Record<string, [number, number]> = {
  'goa': [15.2993, 74.124],
  'kerala': [10.8505, 76.2711],
  'mumbai': [19.076, 72.8777],
  'delhi': [28.7041, 77.1025],
  'jaipur': [26.9124, 75.7873],
  'bangalore': [12.9716, 77.5946],
  'bengaluru': [12.9716, 77.5946],
  'chennai': [13.0827, 80.2707],
  'kolkata': [22.5726, 88.3639],
  'hyderabad': [17.385, 78.4867],
  'pune': [18.5204, 73.8567],
  'nagpur': [21.1458, 79.0882],
  'manali': [32.2396, 77.1887],
  'shimla': [31.1048, 77.1734],
  'dharamshala': [32.219, 76.3234],
  'rishikesh': [30.0869, 78.2676],
  'varanasi': [25.3176, 82.9739],
  'agra': [27.1767, 78.0081],
  'udaipur': [24.5854, 73.7125],
  'ladakh': [34.1526, 77.5771],
  'leh': [34.1526, 77.5771],
  'darjeeling': [27.041, 88.2663],
  'gangtok': [27.3389, 88.6065],
  'hampi': [15.335, 76.46],
  'ooty': [11.4102, 76.6950],
  'munnar': [10.0889, 77.0595],
  'pondicherry': [11.9416, 79.8083],
  'amritsar': [31.6340, 74.8723],
  'chandigarh': [30.7333, 76.7794],
  'lucknow': [26.8467, 80.9462],
  'ahmedabad': [23.0225, 72.5714],
  'coorg': [12.3375, 75.8069],
  'mysore': [12.2958, 76.6394],
  'indore': [22.7196, 75.8577],
  'bhopal': [23.2599, 77.4126],
  'surat': [21.1702, 72.8311],
  'paris': [48.8566, 2.3522],
  'london': [51.5074, -0.1278],
  'tokyo': [35.6762, 139.6503],
  'new york': [40.7128, -74.0060],
  'dubai': [25.2048, 55.2708],
  'singapore': [1.3521, 103.8198],
  'bali': [-8.3405, 115.092],
  'bangkok': [13.7563, 100.5018],
  'sydney': [-33.8688, 151.2093],
  'rome': [41.9028, 12.4964],
  'barcelona': [41.3874, 2.1686],
  'india': [20.5937, 78.9629],
};

const DEFAULT_CENTER: [number, number] = [20.5937, 78.9629]; // India center

function getCoords(location: string | null, index: number): [number, number] {
  if (!location) {
    // Spread around India with slight randomness
    return [DEFAULT_CENTER[0] + (Math.random() - 0.5) * 10, DEFAULT_CENTER[1] + (Math.random() - 0.5) * 10];
  }
  const lower = location.toLowerCase();
  for (const [city, coords] of Object.entries(CITY_COORDS)) {
    if (lower.includes(city)) {
      // Add slight jitter so markers don't overlap
      return [coords[0] + (Math.random() - 0.5) * 0.05, coords[1] + (Math.random() - 0.5) * 0.05];
    }
  }
  return [DEFAULT_CENTER[0] + (Math.random() - 0.5) * 8, DEFAULT_CENTER[1] + (Math.random() - 0.5) * 8];
}

function createAvatarIcon(avatarUrl: string) {
  return L.divIcon({
    className: 'custom-avatar-marker',
    html: `<div style="width:40px;height:40px;border-radius:50%;border:3px solid hsl(var(--primary));overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.3);"><img src="${avatarUrl}" style="width:100%;height:100%;object-fit:cover;" /></div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -24],
  });
}

const TravelersSection: React.FC = () => {
  const { user } = useAuth();
  const [selectedRadius, setSelectedRadius] = useState('25');
  const [travelers, setTravelers] = useState<TravelerProfile[]>([]);
  const [followMap, setFollowMap] = useState<Record<string, string>>({});
  const [showFullMap, setShowFullMap] = useState(false);

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

  // Memoize coordinates so they don't change on re-render
  const travelerCoords = useMemo(() => {
    return filteredTravelers.map((t, i) => ({
      ...t,
      coords: getCoords(t.location, i),
    }));
  }, [filteredTravelers]);

  const handleFollow = async (targetUserId: string, name: string) => {
    if (!user) return;
    const status = followMap[targetUserId];
    if (!status) {
      const { error } = await supabase.from('follows').insert({ follower_id: user.id, following_id: targetUserId, status: 'pending' });
      if (error) { toast({ title: 'Follow request failed', description: error.message, variant: 'destructive' }); return; }
      setFollowMap((prev) => ({ ...prev, [targetUserId]: 'pending' }));
      toast({ title: `Request sent to ${name}` });
      return;
    }
    await supabase.from('follows').delete().eq('follower_id', user.id).eq('following_id', targetUserId);
    setFollowMap((prev) => { const next = { ...prev }; delete next[targetUserId]; return next; });
    toast({ title: status === 'accepted' ? `Unfollowed ${name}` : 'Request cancelled' });
  };

  const mapCenter: [number, number] = travelerCoords.length > 0
    ? [travelerCoords.reduce((s, t) => s + t.coords[0], 0) / travelerCoords.length, travelerCoords.reduce((s, t) => s + t.coords[1], 0) / travelerCoords.length]
    : DEFAULT_CENTER;

  // Vanilla Leaflet map component
  const LeafletMap = useCallback(({ height, zoom, id }: { height: string; zoom: number; id: string }) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<L.Map | null>(null);

    useEffect(() => {
      if (!mapRef.current || mapInstanceRef.current) return;
      const map = L.map(mapRef.current, { center: mapCenter, zoom, scrollWheelZoom: true, zoomControl: false });
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);

      travelerCoords.forEach((t) => {
        const icon = createAvatarIcon(t.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face');
        const marker = L.marker(t.coords, { icon }).addTo(map);
        marker.bindPopup(`<div style="display:flex;align-items:center;gap:8px;min-width:140px;"><img src="${t.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=60&h=60&fit=crop&crop=face'}" style="width:40px;height:40px;border-radius:50%;object-fit:cover;" /><div><p style="font-weight:600;font-size:14px;margin:0;">${t.display_name}</p><p style="font-size:12px;color:#888;margin:0;">${t.location || 'Nearby'}</p></div></div>`);
      });

      mapInstanceRef.current = map;
      setTimeout(() => map.invalidateSize(), 100);

      return () => { map.remove(); mapInstanceRef.current = null; };
    }, []);

    return <div ref={mapRef} style={{ height, width: '100%' }} />;
  }, [mapCenter, travelerCoords]);

  return (
    <section className="py-20 lg:py-32 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
          <div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">Discover <span className="text-gradient">Nearby Travelers</span></h2>
            <p className="text-lg text-muted-foreground max-w-xl">Real user profiles shown on a live map.</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-sm text-muted-foreground">Radius:</span>
            {radiusOptions.map((radius) => (
              <button key={radius} onClick={() => setSelectedRadius(radius)} className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedRadius === radius ? 'gradient-primary text-primary-foreground shadow-md' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}>{radius} km</button>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          <div className="lg:col-span-2 h-80 rounded-3xl overflow-hidden relative shadow-lg cursor-pointer group" onClick={() => setShowFullMap(true)} style={{ zIndex: showFullMap ? 0 : 1 }}>
            {!showFullMap && <LeafletMap height="100%" zoom={5} id="main-map" />}
            {!showFullMap && (
              <div className="absolute top-4 right-4 z-[1000] w-10 h-10 bg-background/90 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg opacity-70 group-hover:opacity-100 transition-opacity">
                <Maximize2 className="w-5 h-5 text-foreground" />
              </div>
            )}
            {!showFullMap && (
              <div className="absolute bottom-4 left-4 right-4 z-[1000] bg-background/95 backdrop-blur-sm rounded-2xl px-4 py-3 shadow-lg">
                <p className="text-sm text-foreground font-medium flex items-center gap-2"><Users className="w-4 h-4 text-primary" />{filteredTravelers.length} travelers nearby · <span className="text-primary text-xs">Click to expand</span></p>
              </div>
            )}
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

        {/* Recommended for You */}
        <RecommendedSection />
      </div>

      {/* Full Screen Map Modal */}
      {showFullMap && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-all duration-300 animate-in fade-in" onClick={() => setShowFullMap(false)}>
          <div className="absolute inset-4 lg:inset-8 rounded-3xl overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShowFullMap(false)} className="absolute top-4 right-4 z-[1000] w-10 h-10 bg-background/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-background transition-colors">
              <X className="w-5 h-5 text-foreground" />
            </button>
            <div className="absolute top-4 left-4 z-[1000] bg-background/90 backdrop-blur-sm rounded-2xl px-4 py-2 shadow-lg">
              <h3 className="font-semibold text-foreground text-sm">Nearby Travelers Map</h3>
              <p className="text-xs text-muted-foreground">{filteredTravelers.length} travelers within {selectedRadius} km</p>
            </div>
            <LeafletMap height="100%" zoom={5} id="fullscreen-map" />
            <div className="absolute bottom-4 left-4 right-4 z-[1000] bg-background/95 backdrop-blur-sm rounded-2xl p-4 shadow-lg">
              <div className="flex gap-3 overflow-x-auto pb-1">
                {filteredTravelers.slice(0, 8).map((t) => (
                  <div key={t.id} className="flex-shrink-0 flex items-center gap-2 bg-muted/50 rounded-xl px-3 py-2">
                    <img src={t.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=40&h=40&fit=crop&crop=face'} alt={t.display_name} className="w-8 h-8 rounded-full object-cover" />
                    <div>
                      <p className="text-xs font-medium text-foreground">{t.display_name}</p>
                      <p className="text-[10px] text-muted-foreground">{t.location || 'Nearby'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default TravelersSection;
