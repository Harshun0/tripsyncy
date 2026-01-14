import React, { useState } from 'react';
import { MapPin, Clock, Wallet, ChevronDown, ChevronUp, Sparkles, Calendar, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { itineraryDays } from '@/data/dummyProfiles';

const ItinerarySection: React.FC = () => {
  const [expandedDay, setExpandedDay] = useState<number | null>(1);
  const [destination, setDestination] = useState('');
  const [days, setDays] = useState('');
  const [budget, setBudget] = useState('');
  
  const totalCost = itineraryDays.reduce(
    (total, day) => total + day.activities.reduce((sum, act) => sum + act.cost, 0),
    0
  );

  return (
    <section className="py-20 lg:py-32 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            AI-Powered Planning
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Smart <span className="text-gradient">Itinerary Generator</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Tell us your destination and preferences, and our AI will create a personalized day-by-day travel plan with cost estimates.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Input Form */}
          <div className="space-y-6">
            <div className="travel-card p-8 bg-gradient-to-br from-card to-muted/30">
              <h3 className="text-xl font-semibold text-foreground mb-6">Plan Your Trip</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Destination</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input
                      type="text"
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      placeholder="Where do you want to go?"
                      className="input-field pl-12"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Number of Days</label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <input
                        type="number"
                        value={days}
                        onChange={(e) => setDays(e.target.value)}
                        placeholder="5"
                        className="input-field pl-12"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Budget (₹)</label>
                    <div className="relative">
                      <Wallet className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <input
                        type="number"
                        value={budget}
                        onChange={(e) => setBudget(e.target.value)}
                        placeholder="20000"
                        className="input-field pl-12"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Interests</label>
                  <div className="flex flex-wrap gap-2">
                    {['Adventure', 'Food', 'Culture', 'Nature', 'Beach', 'Nightlife'].map((interest) => (
                      <button
                        key={interest}
                        className="px-4 py-2 rounded-full text-sm font-medium bg-muted hover:bg-primary/10 hover:text-primary transition-colors"
                      >
                        {interest}
                      </button>
                    ))}
                  </div>
                </div>

                <Button className="w-full h-14 mt-4 gradient-primary text-primary-foreground rounded-2xl text-lg font-semibold shadow-glow hover:shadow-lg transition-shadow">
                  <Sparkles className="w-5 h-5 mr-2" />
                  Generate AI Itinerary
                </Button>
              </div>
            </div>
          </div>

          {/* Sample Itinerary Display */}
          <div className="space-y-6">
            {/* Trip Summary Card */}
            <div className="travel-card p-6 bg-gradient-to-br from-primary/5 to-accent/5">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium text-primary">AI Generated Sample</span>
              </div>
              
              <h3 className="text-2xl font-bold text-foreground mb-3">5 Days in Goa 🏖️</h3>
              
              <div className="flex items-center gap-6 text-muted-foreground mb-4">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>Goa, India</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>5 Days</span>
                </div>
              </div>

              <div className="p-4 bg-primary/10 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-sm text-muted-foreground">Estimated Total</span>
                  <p className="text-2xl font-bold text-primary">₹{totalCost.toLocaleString()}</p>
                </div>
                <span className="text-xs text-muted-foreground">Per person</span>
              </div>
            </div>

            {/* Day-wise Itinerary */}
            <div className="space-y-3">
              {itineraryDays.map((day) => (
                <div key={day.day} className="travel-card">
                  <button
                    onClick={() => setExpandedDay(expandedDay === day.day ? null : day.day)}
                    className="w-full flex items-center justify-between p-2"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center text-white font-bold text-lg">
                        {day.day}
                      </div>
                      <div className="text-left">
                        <h4 className="font-semibold text-foreground">Day {day.day}</h4>
                        <p className="text-sm text-muted-foreground">{day.title}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-primary">
                        ₹{day.activities.reduce((sum, act) => sum + act.cost, 0).toLocaleString()}
                      </span>
                      {expandedDay === day.day ? (
                        <ChevronUp className="w-5 h-5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>
                  </button>

                  {expandedDay === day.day && (
                    <div className="mt-4 pt-4 border-t border-border space-y-3 animate-fade-in">
                      {day.activities.map((activity, index) => (
                        <div key={index} className="flex items-start gap-3 ml-2">
                          <div className="flex flex-col items-center">
                            <div className="w-3 h-3 rounded-full gradient-primary" />
                            {index < day.activities.length - 1 && (
                              <div className="w-0.5 flex-1 bg-primary/20 mt-1 min-h-[24px]" />
                            )}
                          </div>
                          <div className="flex-1 pb-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-medium text-primary">{activity.time}</span>
                              {activity.cost > 0 && (
                                <span className="text-xs text-muted-foreground">₹{activity.cost.toLocaleString()}</span>
                              )}
                            </div>
                            <p className="text-sm text-foreground mt-0.5">{activity.activity}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ItinerarySection;
