import React, { useState } from 'react';
import { MapPin, Filter, Users, BadgeCheck, Heart } from 'lucide-react';
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
          <h1 className="text-xl font-bold text-foreground">Nearby Travelers</h1>
          <button className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
            <Filter className="w-5 h-5 text-foreground" />
          </button>
        </div>

        {/* Radius Filter */}
        <div className="flex gap-2">
          {radiusOptions.map((radius) => (
            <button
              key={radius}
              onClick={() => setSelectedRadius(radius)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedRadius === radius
                  ? 'gradient-primary text-primary-foreground shadow-md'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {radius} km
            </button>
          ))}
        </div>
      </div>

      {/* Map Preview */}
      <div className="mx-4 mt-4 h-48 rounded-2xl overflow-hidden relative bg-gradient-to-br from-ocean-light to-teal-light">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative">
            {/* Center marker (You) */}
            <div className="w-12 h-12 gradient-primary rounded-full flex items-center justify-center shadow-glow animate-pulse-slow">
              <MapPin className="w-6 h-6 text-white" />
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
                  className="absolute w-8 h-8 rounded-full border-2 border-white shadow-lg overflow-hidden"
                  style={{
                    transform: `translate(${x}px, ${y}px)`,
                    left: '50%',
                    top: '50%',
                    marginLeft: '-16px',
                    marginTop: '-16px',
                  }}
                >
                  <img src={traveler.avatar} alt={traveler.name} className="w-full h-full object-cover" />
                </div>
              );
            })}
          </div>
        </div>
        
        <div className="absolute bottom-3 left-3 right-3 bg-white/90 backdrop-blur-sm rounded-xl px-3 py-2">
          <p className="text-xs text-foreground font-medium flex items-center gap-1">
            <Users className="w-3 h-3 text-primary" />
            {filteredTravelers.length} travelers within {selectedRadius} km
          </p>
        </div>
      </div>

      {/* Travelers List */}
      <div className="px-4 mt-6 space-y-3">
        <h2 className="text-lg font-semibold text-foreground">Travelers Near You</h2>
        
        {filteredTravelers.map((traveler) => (
          <div key={traveler.id} className="travel-card flex gap-4">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <img
                src={traveler.avatar}
                alt={traveler.name}
                className="w-16 h-16 rounded-xl object-cover"
              />
              {traveler.isOnline && <span className="status-online" />}
              {traveler.verified && (
                <div className="absolute -top-1 -right-1 w-5 h-5 gradient-primary rounded-full flex items-center justify-center">
                  <BadgeCheck className="w-3 h-3 text-white" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-foreground truncate">{traveler.name}, {traveler.age}</h3>
                <span className="text-xs text-primary font-medium">{traveler.distance} km</span>
              </div>
              
              <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3" />
                {traveler.location}
              </p>
              
              <div className="flex flex-wrap gap-1 mt-2">
                {traveler.interests.slice(0, 3).map((interest) => (
                  <span key={interest} className="chip chip-primary text-xs py-1">
                    {interest}
                  </span>
                ))}
              </div>

              {/* Match Score */}
              {traveler.matchScore && (
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full gradient-primary rounded-full transition-all"
                        style={{ width: `${traveler.matchScore}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-primary">{traveler.matchScore}% Match</span>
                  </div>
                  <button className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center text-secondary hover:bg-secondary/20 transition-colors">
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
