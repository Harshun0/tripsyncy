import React from 'react';
import { ArrowLeft, Wallet, Heart, Compass, Users, MessageCircle, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { dummyProfiles } from '@/data/dummyProfiles';

interface MatchScoreScreenProps {
  onBack: () => void;
  matchedUserId?: string;
}

const MatchScoreScreen: React.FC<MatchScoreScreenProps> = ({ onBack, matchedUserId = '2' }) => {
  const matchedUser = dummyProfiles.find(p => p.id === matchedUserId) || dummyProfiles[1];
  const matchScore = matchedUser.matchScore || 92;

  const compatibilityFactors = [
    { 
      label: 'Budget Preference', 
      icon: Wallet, 
      userValue: 'Mid-Range', 
      matchValue: matchedUser.budget,
      score: matchedUser.budget === 'Mid-Range' ? 100 : matchedUser.budget === 'Budget' ? 80 : 60,
    },
    { 
      label: 'Personality Type', 
      icon: Heart, 
      userValue: 'Ambivert', 
      matchValue: matchedUser.personality,
      score: matchedUser.personality === 'Ambivert' ? 100 : 75,
    },
    { 
      label: 'Travel Interests', 
      icon: Compass, 
      userValue: 'Food, Culture', 
      matchValue: matchedUser.interests.slice(0, 2).join(', '),
      score: 95,
    },
    { 
      label: 'Travel Experience', 
      icon: Users, 
      userValue: '12 trips', 
      matchValue: `${matchedUser.trips} trips`,
      score: 88,
    },
  ];

  return (
    <div className="h-full bg-background pb-4">
      {/* Header */}
      <div className="gradient-primary px-4 py-3 flex items-center gap-3">
        <button onClick={onBack} className="p-2 -ml-2 text-white/80 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-semibold text-white">Travel Compatibility</h1>
      </div>

      {/* Match Score Circle */}
      <div className="px-4 py-8 flex flex-col items-center">
        <div className="relative w-48 h-48">
          {/* Background Ring */}
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="96"
              cy="96"
              r="88"
              stroke="hsl(var(--muted))"
              strokeWidth="12"
              fill="none"
            />
            <circle
              cx="96"
              cy="96"
              r="88"
              stroke="url(#gradient)"
              strokeWidth="12"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={`${(matchScore / 100) * 553} 553`}
              className="transition-all duration-1000 ease-out"
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="hsl(var(--primary))" />
                <stop offset="100%" stopColor="hsl(var(--accent))" />
              </linearGradient>
            </defs>
          </svg>
          
          {/* Center Content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-5xl font-bold text-gradient">{matchScore}%</span>
            <span className="text-sm text-muted-foreground mt-1">Compatible</span>
          </div>
        </div>

        {/* User Avatars */}
        <div className="flex items-center gap-4 mt-6">
          <div className="text-center">
            <img
              src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&h=80&fit=crop&crop=face"
              alt="You"
              className="w-16 h-16 rounded-full border-3 border-primary object-cover"
            />
            <p className="text-sm font-medium mt-2">You</p>
          </div>
          
          <div className="flex flex-col items-center gap-1">
            <Heart className="w-6 h-6 text-secondary fill-secondary" />
            <div className="w-12 h-0.5 gradient-sunset rounded" />
          </div>
          
          <div className="text-center">
            <img
              src={matchedUser.avatar}
              alt={matchedUser.name}
              className="w-16 h-16 rounded-full border-3 border-secondary object-cover"
            />
            <p className="text-sm font-medium mt-2">{matchedUser.name.split(' ')[0]}</p>
          </div>
        </div>

        <p className="text-center text-foreground mt-4 max-w-xs">
          You and <span className="font-semibold">{matchedUser.name}</span> are a great match for traveling together!
        </p>
      </div>

      {/* Compatibility Breakdown */}
      <div className="px-4 space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Compatibility Breakdown</h3>
        
        {compatibilityFactors.map(({ label, icon: Icon, userValue, matchValue, score }) => (
          <div key={label} className="travel-card">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">{label}</p>
                <p className="text-xs text-muted-foreground">{userValue} • {matchValue}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-primary">{score}%</span>
                {score >= 80 && <Check className="w-4 h-4 text-success" />}
              </div>
            </div>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full gradient-primary rounded-full transition-all duration-500"
                style={{ width: `${score}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="px-4 mt-6 space-y-3">
        <Button className="w-full h-14 gradient-primary text-primary-foreground rounded-2xl text-lg font-semibold shadow-glow">
          <Users className="w-5 h-5 mr-2" />
          Send Trip-Mate Request
        </Button>
        <Button variant="outline" className="w-full h-14 rounded-2xl text-lg font-semibold border-2 border-primary text-primary">
          <MessageCircle className="w-5 h-5 mr-2" />
          Start Conversation
        </Button>
      </div>
    </div>
  );
};

export default MatchScoreScreen;
