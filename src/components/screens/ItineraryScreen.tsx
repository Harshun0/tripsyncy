import React, { useState } from 'react';
import { ArrowLeft, MapPin, Clock, Wallet, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
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
      <div className="gradient-primary px-4 py-3 flex items-center gap-3">
        <button onClick={onBack} className="p-2 -ml-2 text-white/80 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-semibold text-white">AI Smart Itinerary</h1>
      </div>

      {/* Trip Summary */}
      <div className="px-4 py-4">
        <div className="travel-card bg-gradient-to-br from-card to-muted/30">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-primary" />
            <span className="text-sm font-medium text-primary">AI Generated</span>
          </div>
          
          <h2 className="text-xl font-bold text-foreground mb-2">5 Days in Goa 🏖️</h2>
          
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              <span>Goa, India</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>5 Days</span>
            </div>
          </div>

          <div className="mt-4 p-3 bg-primary/10 rounded-xl">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Estimated Total Cost</span>
              <span className="text-lg font-bold text-primary">₹{totalCost.toLocaleString()}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Per person (excluding flights)</p>
          </div>
        </div>
      </div>

      {/* Day-wise Itinerary */}
      <div className="px-4 space-y-3">
        <h3 className="text-lg font-semibold text-foreground">Day-wise Plan</h3>
        
        {itineraryDays.map((day) => (
          <div key={day.day} className="travel-card">
            <button
              onClick={() => setExpandedDay(expandedDay === day.day ? null : day.day)}
              className="w-full flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center text-white font-bold">
                  {day.day}
                </div>
                <div className="text-left">
                  <h4 className="font-semibold text-foreground">Day {day.day}</h4>
                  <p className="text-sm text-muted-foreground">{day.title}</p>
                </div>
              </div>
              {expandedDay === day.day ? (
                <ChevronUp className="w-5 h-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-5 h-5 text-muted-foreground" />
              )}
            </button>

            {expandedDay === day.day && (
              <div className="mt-4 space-y-3 animate-fade-in">
                {day.activities.map((activity, index) => (
                  <div key={index} className="flex gap-3">
                    {/* Timeline */}
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 rounded-full gradient-primary" />
                      {index < day.activities.length - 1 && (
                        <div className="w-0.5 flex-1 bg-primary/20 mt-1" />
                      )}
                    </div>
                    
                    {/* Activity */}
                    <div className="flex-1 pb-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-primary">{activity.time}</span>
                        {activity.cost > 0 && (
                          <span className="text-xs text-muted-foreground">₹{activity.cost.toLocaleString()}</span>
                        )}
                      </div>
                      <p className="text-sm text-foreground mt-1">{activity.activity}</p>
                    </div>
                  </div>
                ))}
                
                {/* Day Cost Summary */}
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <span className="text-sm text-muted-foreground">Day {day.day} Total</span>
                  <span className="font-semibold text-foreground">
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
        <Button className="w-full h-14 gradient-primary text-primary-foreground rounded-2xl text-lg font-semibold shadow-glow">
          <Wallet className="w-5 h-5 mr-2" />
          Save Itinerary
        </Button>
        <Button variant="outline" className="w-full h-14 rounded-2xl text-lg font-semibold border-2 border-primary text-primary">
          <Sparkles className="w-5 h-5 mr-2" />
          Regenerate with AI
        </Button>
      </div>
    </div>
  );
};

export default ItineraryScreen;
