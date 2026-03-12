import React, { useState } from 'react';
import { MapPin, Filter, Users, BadgeCheck, Heart, Sparkles } from 'lucide-react';
import { dummyProfiles, TravelerProfile } from '@/data/dummyProfiles';

const ExploreScreen: React.FC = () => {
  const [selectedRadius, setSelectedRadius] = useState('10');
  const [travelers] = useState<TravelerProfile[]>(dummyProfiles);

  const radiusOptions = ['1', '5', '10', '25'];

  const filteredTravelers = travelers
    .filter(t => t.distance && t.distance <= parseInt(selectedRadius))
    .sort((a, b) => (a.distance || 0) - (b.distance || 0));

  return (
    <div className="pb-4">
      {/* Header */}
      <div className="sticky top-0 z-30 glass-effect px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 gradient-primary rounded-xl flex items-center justify-center">
              <Users className="w-4 h-4 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold text-foreground font-display">Nearby Travelers</h1>
          </div>
          <button className="w-10 h-10 rounded-full bg-card border border-border/50 flex items-center justify-center shadow-sm hover:shadow-md transition-shadow">
            <Filter className="w-5 h-5 text-foreground" />
          </button>
        </div>

        {/* Radius Filter */}
        <div className="flex gap-2">
          {radiusOptions.map((radius) => (
            <button
              key={radius}
              onClick={() => setSelectedRadius(radius)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                selectedRadius === radius
                  ? 'gradient-primary text-primary-foreground shadow-glow scale-[1.02]'
                  : 'bg-card border border-border/50 text-muted-foreground hover:border-primary/30 hover:text-foreground'
              }`}
            >
              {radius} km
            </button>
          ))}
        </div>
      </div>

      {/* Map Preview */}
      <div className="mx-4 mt-4 h-48 rounded-3xl overflow-hidden relative bg-gradient-to-br from-teal-light via-ocean-light to-sand border border-border/30 shadow-sm">
        {/* Decorative pattern */}
        <div className="absolute inset-0 pattern-dots opacity-30" />
        
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative">
            {/* Center marker (You) */}
            <div className="w-14 h-14 gradient-primary rounded-2xl flex items-center justify-center shadow-glow animate-pulse-slow rotate-[8deg]">
              <MapPin className="w-7 h-7 text-primary-foreground -rotate-[8deg]" />
            </div>
            
            {/* Other markers */}
            {filteredTravelers.slice(0, 4).map((traveler, index) => {
              const angles = [45, 135, 225, 315];
              const distance = 40 + (traveler.distance || 1) * 5;
              const angle = angles[index] * (Math.PI / 180);
              const x = Math.cos(angle) * distance;
              const y = Math.sin(angle) * distance;
              
              return (
                <div
                  key={traveler.id}
                  className="absolute w-9 h-9 rounded-xl border-[2.5px] border-background shadow-md overflow-hidden hover:scale-110 transition-transform"
                  style={{
                    transform: `translate(${x}px, ${y}px)`,
                    left: '50%',
                    top: '50%',
                    marginLeft: '-18px',
                    marginTop: '-18px',
                  }}
                >
                  <img src={traveler.avatar} alt={traveler.name} className="w-full h-full object-cover" />
                </div>
              );
            })}
          </div>
        </div>
        
        <div className="absolute bottom-3 left-3 right-3 bg-card/90 backdrop-blur-md rounded-2xl px-4 py-2.5 border border-border/30">
          <p className="text-xs text-foreground font-medium flex items-center gap-1.5">
            <div className="w-5 h-5 gradient-primary rounded-lg flex items-center justify-center">
              <Users className="w-3 h-3 text-primary-foreground" />
            </div>
            <span>{filteredTravelers.length} travelers within {selectedRadius} km</span>
          </p>
        </div>
      </div>

      {/* Travelers List */}
      <div className="px-4 mt-6 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground font-display">Travelers Near You</h2>
          <div className="flex items-center gap-1 text-xs text-primary font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{filteredTravelers.length} found</span>
          </div>
        </div>
        
        {filteredTravelers.map((traveler, idx) => (
          <div key={traveler.id} className="travel-card-nature flex gap-4 animate-fade-in" style={{ animationDelay: `${idx * 80}ms` }}>
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="p-[2px] gradient-primary rounded-2xl">
                <img
                  src={traveler.avatar}
                  alt={traveler.name}
                  className="w-16 h-16 rounded-[14px] object-cover border-2 border-background"
                />
              </div>
              {traveler.isOnline && <span className="status-online !bottom-0.5 !right-0.5" />}
              {traveler.verified && (
                <div className="absolute -top-1 -right-1 w-5 h-5 gradient-primary rounded-lg flex items-center justify-center shadow-sm">
                  <BadgeCheck className="w-3 h-3 text-primary-foreground" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-foreground truncate">{traveler.name}, {traveler.age}</h3>
                <span className="text-xs gradient-primary text-primary-foreground px-2.5 py-1 rounded-lg font-semibold shadow-sm">{traveler.distance} km</span>
              </div>
              
              <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3 text-primary" />
                {traveler.location}
              </p>
              
              <div className="flex flex-wrap gap-1.5 mt-2">
                {traveler.interests.slice(0, 3).map((interest) => (
                  <span key={interest} className="text-[11px] px-2.5 py-1 bg-primary/8 text-primary rounded-lg font-medium">
                    {interest}
                  </span>
                ))}
              </div>

              {/* Match Score */}
              {traveler.matchScore && (
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full gradient-primary rounded-full transition-all duration-500"
                        style={{ width: `${traveler.matchScore}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold text-primary">{traveler.matchScore}%</span>
                  </div>
                  <button className="w-9 h-9 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary hover:bg-secondary/20 hover:scale-105 active:scale-95 transition-all">
                    <Heart className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExploreScreen;
