import React from 'react';
import { MapPin, Users, ArrowRight, Globe, Compass, BadgeCheck, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TravelersIntroSectionProps {
  onNavigate?: (section: string) => void;
  isLoggedIn?: boolean;
}

const TravelersIntroSection: React.FC<TravelersIntroSectionProps> = ({ onNavigate, isLoggedIn }) => {
  const sampleTravelers = [
    { name: 'Priya S.', location: 'Goa, India', interests: ['Adventure', 'Food'], match: 92, avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&fit=crop&crop=face' },
    { name: 'Arjun P.', location: 'Manali, India', interests: ['Trekking', 'Photography'], match: 87, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop&crop=face' },
    { name: 'Sneha K.', location: 'Kerala, India', interests: ['Culture', 'Nature'], match: 81, avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&h=120&fit=crop&crop=face' },
  ];

  return (
    <section className="py-24 lg:py-36 bg-background relative overflow-hidden">
      {/* Organic background */}
      <div className="absolute inset-0 gradient-mesh opacity-30 pointer-events-none" />
      <div className="absolute top-0 left-0 w-80 h-80 bg-accent/4 rounded-full blur-3xl -translate-y-1/3 -translate-x-1/4" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/4 rounded-full blur-3xl translate-y-1/3 translate-x-1/4" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Info */}
          <div className="space-y-7">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/8 rounded-full text-accent text-sm font-medium border border-accent/12">
              <Globe className="w-4 h-4" />
              Live Traveler Map
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground font-display leading-tight">
              Discover <span className="text-gradient">Nearby Travelers</span>
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              See who's traveling near you on a real-time map. Connect with like-minded explorers, send follow requests, and turn solo trips into shared adventures.
            </p>
            <div className="space-y-4">
              {[
                { icon: MapPin, text: 'Real-time traveler map', desc: 'See who\'s near your destination' },
                { icon: Users, text: 'AI-powered matching', desc: 'Match by interests, budget & vibe' },
                { icon: Heart, text: 'Follow & connect', desc: 'Build your travel network safely' },
              ].map(({ icon: Icon, text, desc }) => (
                <div key={text} className="flex items-start gap-4 p-3 rounded-2xl hover:bg-muted/40 transition-colors group">
                  <div className="w-11 h-11 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0 group-hover:bg-accent/15 transition-colors">
                    <Icon className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <span className="text-foreground font-semibold">{text}</span>
                    <p className="text-sm text-muted-foreground">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <Button
              onClick={() => onNavigate?.(isLoggedIn ? 'explore' : 'login')}
              size="lg"
              className="h-14 px-8 gradient-primary text-primary-foreground rounded-2xl text-lg font-semibold shadow-glow hover:shadow-lg transition-all group"
            >
              {isLoggedIn ? 'Explore Travelers' : 'Sign In to Explore'}
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          {/* Right: Preview card */}
          <div className="relative">
            <div className="travel-card-nature p-6">
              {/* Map preview image */}
              <div className="relative h-48 rounded-2xl overflow-hidden mb-5">
                <img
                  src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&h=400&fit=crop&q=80"
                  alt="Map preview"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card/80 to-transparent" />
                {/* Fake map pins */}
                <div className="absolute top-8 left-[30%] w-10 h-10 gradient-primary rounded-full flex items-center justify-center shadow-lg border-2 border-white animate-pulse-slow">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <div className="absolute top-16 right-[25%] w-8 h-8 rounded-full border-2 border-white shadow-lg overflow-hidden">
                  <img src={sampleTravelers[0].avatar} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="absolute bottom-16 left-[20%] w-8 h-8 rounded-full border-2 border-white shadow-lg overflow-hidden">
                  <img src={sampleTravelers[1].avatar} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="absolute top-24 right-[40%] w-8 h-8 rounded-full border-2 border-white shadow-lg overflow-hidden">
                  <img src={sampleTravelers[2].avatar} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="absolute bottom-3 left-3 right-3 bg-card/90 backdrop-blur-sm rounded-xl px-3 py-2">
                  <p className="text-xs font-medium text-foreground flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-primary" />
                    12 travelers near your destination
                  </p>
                </div>
              </div>

              {/* Sample travelers */}
              <div className="space-y-3">
                {sampleTravelers.map((t) => (
                  <div key={t.name} className="flex items-center gap-3 p-3 bg-muted/40 rounded-xl hover:bg-muted/60 transition-colors group/t">
                    <div className="relative flex-shrink-0">
                      <img src={t.avatar} alt={t.name} className="w-11 h-11 rounded-xl object-cover" />
                      <div className="absolute -top-1 -right-1 w-5 h-5 gradient-primary rounded-full flex items-center justify-center">
                        <BadgeCheck className="w-3 h-3 text-white" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground">{t.name}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3" />{t.location}</p>
                    </div>
                    <span className="text-xs font-semibold text-primary bg-primary/8 px-2.5 py-1 rounded-full">{t.match}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Decorative blobs */}
            <div className="absolute -top-6 -right-6 w-28 h-28 bg-accent/8 rounded-full blur-2xl" />
            <div className="absolute -bottom-6 -left-6 w-36 h-36 bg-primary/8 rounded-full blur-2xl" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default TravelersIntroSection;
