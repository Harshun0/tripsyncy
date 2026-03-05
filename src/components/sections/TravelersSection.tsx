import React, { useState } from 'react';
import { MapPin, Filter, Users, BadgeCheck, Heart, MessageCircle } from 'lucide-react';
import { dummyProfiles, TravelerProfile } from '@/data/dummyProfiles';
import { Button } from '@/components/ui/button';

interface TravelersSectionProps {
  onOpenChat?: (userId: string) => void;
  onViewMatch?: (userId: string) => void;
}

const TravelersSection: React.FC<TravelersSectionProps> = ({ onOpenChat, onViewMatch }) => {
  const [selectedRadius, setSelectedRadius] = useState('25');
  const [travelers] = useState<TravelerProfile[]>(dummyProfiles);

  const radiusOptions = ['1', '5', '10', '25'];

  const filteredTravelers = travelers
    .filter(t => t.distance && t.distance <= parseInt(selectedRadius))
    .sort((a, b) => (a.distance || 0) - (b.distance || 0));

  return (
    <section className="py-20 lg:py-32 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
          <div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Discover <span className="text-gradient">Nearby Travelers</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl">
              Find compatible travel buddies in your area. Connect with verified travelers who share your interests.
            </p>
          </div>

          {/* Radius Filter */}
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-sm text-muted-foreground">Radius:</span>
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

        {/* Map Preview + Stats */}
        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          {/* Map Card */}
          <div className="lg:col-span-2 h-72 rounded-3xl overflow-hidden relative bg-gradient-to-br from-ocean-light to-teal-light shadow-lg">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                {/* Center marker (You) */}
                <div className="w-16 h-16 gradient-primary rounded-full flex items-center justify-center shadow-glow animate-pulse-slow">
                  <MapPin className="w-8 h-8 text-white" />
                </div>
                
                {/* Other markers */}
                {filteredTravelers.slice(0, 6).map((traveler, index) => {
                  const angles = [30, 80, 130, 200, 260, 320];
                  const distance = 60 + (traveler.distance || 1) * 4;
                  const angle = angles[index] * (Math.PI / 180);
                  const x = Math.cos(angle) * distance;
                  const y = Math.sin(angle) * distance;
                  
                  return (
                    <div
                      key={traveler.id}
                      className="absolute w-12 h-12 rounded-full border-3 border-white shadow-lg overflow-hidden hover:scale-110 transition-transform cursor-pointer"
                      style={{
                        transform: `translate(${x}px, ${y}px)`,
                        left: '50%',
                        top: '50%',
                        marginLeft: '-24px',
                        marginTop: '-24px',
                      }}
                    >
                      <img src={traveler.avatar} alt={traveler.name} className="w-full h-full object-cover" />
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-sm rounded-2xl px-4 py-3 shadow-lg">
              <p className="text-sm text-foreground font-medium flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                {filteredTravelers.length} travelers within {selectedRadius} km of your location
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="space-y-4">
            <div className="travel-card p-6 bg-gradient-to-br from-primary/5 to-accent/5">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 gradient-primary rounded-2xl flex items-center justify-center">
                  <Users className="w-7 h-7 text-white" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-foreground">{filteredTravelers.length}</p>
                  <p className="text-muted-foreground">Active Travelers</p>
                </div>
              </div>
            </div>
            <div className="travel-card p-6 bg-gradient-to-br from-secondary/5 to-sunset-pink/5">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-secondary to-sunset-pink rounded-2xl flex items-center justify-center">
                  <Heart className="w-7 h-7 text-white" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-foreground">92%</p>
                  <p className="text-muted-foreground">Highest Match</p>
                </div>
              </div>
            </div>
            <div className="travel-card p-6 bg-gradient-to-br from-success/5 to-primary/5">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-success to-primary rounded-2xl flex items-center justify-center">
                  <BadgeCheck className="w-7 h-7 text-white" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-foreground">100%</p>
                  <p className="text-muted-foreground">Verified Profiles</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Travelers Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTravelers.map((traveler) => (
            <div key={traveler.id} className="travel-card group hover:shadow-xl transition-all duration-300">
              {/* Header */}
              <div className="flex items-start gap-4 mb-4">
                <div className="relative flex-shrink-0">
                  <img
                    src={traveler.avatar}
                    alt={traveler.name}
                    className="w-16 h-16 rounded-2xl object-cover"
                  />
                  {traveler.isOnline && <span className="status-online" />}
                  {traveler.verified && (
                    <div className="absolute -top-1 -right-1 w-6 h-6 gradient-primary rounded-full flex items-center justify-center shadow-md">
                      <BadgeCheck className="w-3.5 h-3.5 text-white" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-foreground truncate">{traveler.name}, {traveler.age}</h3>
                    <span className="text-xs text-primary font-medium bg-primary/10 px-2 py-1 rounded-full">{traveler.distance} km</span>
                  </div>
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3" />
                    {traveler.location}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{traveler.bio}</p>
                </div>
              </div>

              {/* Interests */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                {traveler.interests.slice(0, 4).map((interest) => (
                  <span key={interest} className="chip chip-primary text-xs">
                    {interest}
                  </span>
                ))}
              </div>

              {/* Match Score & Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <div className="flex items-center gap-3">
                  <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full gradient-primary rounded-full transition-all"
                      style={{ width: `${traveler.matchScore}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-primary">{traveler.matchScore}%</span>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-full h-9 w-9 p-0"
                    onClick={() => onOpenChat?.(traveler.id)}
                  >
                    <MessageCircle className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    className="rounded-full h-9 w-9 p-0 gradient-primary text-white"
                    onClick={() => onViewMatch?.(traveler.id)}
                  >
                    <Heart className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TravelersSection;
