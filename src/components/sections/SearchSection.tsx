import React, { useState } from 'react';
import { Search, MapPin, BadgeCheck, UserPlus, UserCheck, X } from 'lucide-react';
import { dummyProfiles, TravelerProfile } from '@/data/dummyProfiles';
import { toast } from '@/hooks/use-toast';

interface SearchSectionProps {
  followedUsers: Set<string>;
  onFollow: (userId: string, userName: string) => void;
}

const SearchSection: React.FC<SearchSectionProps> = ({ followedUsers, onFollow }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<TravelerProfile[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = (q: string) => {
    setQuery(q);
    if (!q.trim()) {
      setResults([]);
      setHasSearched(false);
      return;
    }
    setHasSearched(true);
    const lower = q.toLowerCase();
    setResults(
      dummyProfiles.filter(
        p =>
          p.name.toLowerCase().includes(lower) ||
          p.location.toLowerCase().includes(lower) ||
          p.interests.some(i => i.toLowerCase().includes(lower))
      )
    );
  };

  return (
    <section className="py-20 lg:py-32 bg-background">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Search <span className="text-gradient">Travelers</span>
          </h2>
          <p className="text-muted-foreground">Find people by name, location, or interests</p>
        </div>

        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search by name, location, or interest..."
            className="input-field pl-12 pr-10 h-14 text-lg rounded-2xl"
          />
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
                <img src={profile.avatar} alt={profile.name} className="w-14 h-14 rounded-2xl object-cover" />
                {profile.verified && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 gradient-primary rounded-full flex items-center justify-center">
                    <BadgeCheck className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground">{profile.name}, {profile.age}</h3>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <MapPin className="w-3 h-3" />{profile.location}
                </p>
                <div className="flex gap-1.5 mt-1 flex-wrap">
                  {profile.interests.slice(0, 3).map(i => (
                    <span key={i} className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full">{i}</span>
                  ))}
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className="text-sm font-bold text-primary">{profile.matchScore}%</span>
                <button
                  onClick={() => onFollow(profile.id, profile.name)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    followedUsers.has(profile.id) ? 'bg-muted text-foreground' : 'gradient-primary text-white'
                  }`}
                >
                  {followedUsers.has(profile.id) ? (
                    <><UserCheck className="w-3 h-3" /> Following</>
                  ) : (
                    <><UserPlus className="w-3 h-3" /> Follow</>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        {!hasSearched && (
          <div className="text-center py-12 text-muted-foreground">
            <Search className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
            <p>Start typing to search for travelers</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default SearchSection;
