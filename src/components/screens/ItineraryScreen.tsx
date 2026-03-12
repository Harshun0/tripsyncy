import React, { useState } from 'react';
import { ArrowLeft, MapPin, Clock, Wallet, ChevronDown, ChevronUp, Sparkles, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { itineraryDays } from '@/data/dummyProfiles';

interface ItineraryScreenProps {
  onBack: () => void;
}

const ItineraryScreen: React.FC<ItineraryScreenProps> = ({ onBack }) => {
  const [expandedDay, setExpandedDay] = useState<number | null>(1);
  
  const totalCost = itineraryDays.reduce(
    (total, day) => total + day.activities.reduce((sum, act) => sum + act.cost, 0),
    0
  );

  return (
    <div className="h-full bg-background pb-4">
      {/* Header */}
      <div className="gradient-primary px-4 py-4 flex items-center gap-3 relative overflow-hidden">
        <div className="absolute inset-0 pattern-dots opacity-10" />
        <button onClick={onBack} className="p-2 -ml-2 text-primary-foreground/80 hover:text-primary-foreground transition-colors relative z-10">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2 relative z-10">
          <div className="w-8 h-8 bg-primary-foreground/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
            <Calendar className="w-4 h-4 text-primary-foreground" />
          </div>
          <h1 className="text-lg font-semibold text-primary-foreground font-display">AI Smart Itinerary</h1>
        </div>
      </div>

      {/* Trip Summary */}
      <div className="px-4 py-4">
        <div className="travel-card-nature bg-gradient-to-br from-card to-muted/20 relative overflow-hidden">
          {/* Decorative */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/5 to-transparent rounded-bl-full" />
          
          <div className="flex items-center gap-2 mb-3 relative">
            <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <span className="text-sm font-semibold text-primary">AI Generated</span>
          </div>
          
          <h2 className="text-xl font-bold text-foreground mb-2 font-display">5 Days in Goa 🏖️</h2>
          
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5 bg-muted/40 px-3 py-1.5 rounded-lg">
              <MapPin className="w-3.5 h-3.5 text-primary" />
              <span>Goa, India</span>
            </div>
            <div className="flex items-center gap-1.5 bg-muted/40 px-3 py-1.5 rounded-lg">
              <Clock className="w-3.5 h-3.5 text-primary" />
              <span>5 Days</span>
            </div>
          </div>

          <div className="mt-4 p-4 bg-gradient-to-r from-primary/8 to-accent/8 rounded-2xl border border-primary/10">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Estimated Total</span>
                <p className="text-xs text-muted-foreground mt-0.5">Per person (excl. flights)</p>
              </div>
              <span className="text-2xl font-bold text-gradient font-display">₹{totalCost.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Day-wise Itinerary */}
      <div className="px-4 space-y-3">
        <h3 className="text-lg font-semibold text-foreground font-display">Day-wise Plan</h3>
        
        {itineraryDays.map((day, dayIdx) => (
          <div key={day.day} className="travel-card-nature animate-fade-in" style={{ animationDelay: `${dayIdx * 80}ms` }}>
            <button
              onClick={() => setExpandedDay(expandedDay === day.day ? null : day.day)}
              className="w-full flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 gradient-primary rounded-2xl flex items-center justify-center text-primary-foreground font-bold text-lg shadow-sm font-display">
                  {day.day}
                </div>
                <div className="text-left">
                  <h4 className="font-semibold text-foreground">Day {day.day}</h4>
                  <p className="text-sm text-muted-foreground">{day.title}</p>
                </div>
              </div>
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${expandedDay === day.day ? 'bg-primary/10' : 'bg-muted/50'}`}>
                {expandedDay === day.day ? (
                  <ChevronUp className="w-4 h-4 text-primary" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                )}
              </div>
            </button>

            {expandedDay === day.day && (
              <div className="mt-4 space-y-1 animate-fade-in">
                {day.activities.map((activity, index) => (
                  <div key={index} className="flex gap-3">
                    {/* Timeline */}
                    <div className="flex flex-col items-center">
                      <div className="w-3.5 h-3.5 rounded-lg gradient-primary shadow-sm" />
                      {index < day.activities.length - 1 && (
                        <div className="w-[2px] flex-1 bg-gradient-to-b from-primary/30 to-primary/5 mt-1" />
                      )}
                    </div>
                    
                    {/* Activity */}
                    <div className="flex-1 pb-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-primary bg-primary/8 px-2 py-0.5 rounded-md">{activity.time}</span>
                        {activity.cost > 0 && (
                          <span className="text-xs text-muted-foreground font-medium bg-muted/50 px-2 py-0.5 rounded-md">₹{activity.cost.toLocaleString()}</span>
                        )}
                      </div>
                      <p className="text-sm text-foreground mt-1.5 leading-relaxed">{activity.activity}</p>
                    </div>
                  </div>
                ))}
                
                {/* Day Cost Summary */}
                <div className="flex items-center justify-between pt-3 border-t border-border/50">
                  <span className="text-sm text-muted-foreground">Day {day.day} Total</span>
                  <span className="font-bold text-foreground bg-primary/8 px-3 py-1 rounded-lg">
                    ₹{day.activities.reduce((sum, act) => sum + act.cost, 0).toLocaleString()}
                  </span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="px-4 mt-6 space-y-3">
        <Button className="w-full h-14 gradient-primary text-primary-foreground rounded-2xl text-lg font-semibold shadow-glow hover:shadow-xl transition-shadow">
          <Wallet className="w-5 h-5 mr-2" />
          Save Itinerary
        </Button>
        <Button variant="outline" className="w-full h-14 rounded-2xl text-lg font-semibold border-2 border-primary text-primary hover:bg-primary/5 transition-colors">
          <Sparkles className="w-5 h-5 mr-2" />
          Regenerate with AI
        </Button>
      </div>
    </div>
  );
};

export default ItineraryScreen;
