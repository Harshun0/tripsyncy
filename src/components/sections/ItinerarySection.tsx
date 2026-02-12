import React, { useState } from 'react';
import { MapPin, Clock, Wallet, ChevronDown, ChevronUp, Sparkles, Calendar, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { itineraryDays } from '@/data/dummyProfiles';
import { toast } from '@/hooks/use-toast';

interface GeneratedDay {
  day: number;
  title: string;
  activities: {
    time: string;
    activity: string;
    cost: number;
    tips?: string;
  }[];
}

interface GeneratedItinerary {
  destination: string;
  duration: string;
  totalBudget: number;
  currency: string;
  peopleCount?: number;
  budgetPerPerson?: number;
  summary: string;
  days: GeneratedDay[];
  tips: string[];
}

const ItinerarySection: React.FC = () => {
  const [expandedDay, setExpandedDay] = useState<number | null>(1);
  const [destination, setDestination] = useState('');
  const [days, setDays] = useState('');
  const [budget, setBudget] = useState('');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedItinerary, setGeneratedItinerary] = useState<GeneratedItinerary | null>(null);
  const [showGenerated, setShowGenerated] = useState(false);
  
  const displayDays = showGenerated && generatedItinerary ? generatedItinerary.days : itineraryDays;
  
  const totalCost = showGenerated && generatedItinerary 
    ? generatedItinerary.totalBudget
    : itineraryDays.reduce(
        (total, day) => total + day.activities.reduce((sum, act) => sum + act.cost, 0),
        0
      );

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev => 
      prev.includes(interest) 
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const handleGenerate = async () => {
    if (!destination.trim()) {
      toast({ title: "Missing destination", description: "Please enter a destination.", variant: "destructive" });
      return;
    }
    if (!days || parseInt(days) < 1) {
      toast({ title: "Invalid days", description: "Please enter valid number of days.", variant: "destructive" });
      return;
    }

    setIsGenerating(true);
    
    try {
      const peopleCount = 1;
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-travel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          type: 'itinerary',
          destination,
          days: parseInt(days),
          budget: budget || '20000',
          interests: selectedInterests.length > 0 ? selectedInterests : ['general sightseeing'],
          people: 1,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate itinerary');
      }

      const result = await response.json();
      
      if (result.type === 'itinerary' && result.data) {
        setGeneratedItinerary(result.data);
        setShowGenerated(true);
        setExpandedDay(1);
        toast({ title: "Itinerary Generated! 🎉", description: `Your ${days}-day ${destination} itinerary is ready.` });
      } else {
        toast({ title: "Itinerary Generated", description: result.content || "Your travel plan is ready!" });
      }
    } catch (error) {
      console.error('Error generating itinerary:', error);
      toast({ title: "Generation failed", description: error instanceof Error ? error.message : "Failed to generate itinerary.", variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <section className="py-20 lg:py-32 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
          <div className="space-y-6">
            <div className="travel-card p-8 bg-gradient-to-br from-card to-muted/30">
              <h3 className="text-xl font-semibold text-foreground mb-6">Plan Your Trip</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Destination</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <input type="text" value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="Where do you want to go?" className="input-field pl-12" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Days</label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <input type="number" value={days} onChange={(e) => setDays(e.target.value)} placeholder="5" min="1" max="30" className="input-field pl-12" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Budget (₹)</label>
                    <div className="relative">
                      <Wallet className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <input type="number" value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="20000" className="input-field pl-12" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Interests</label>
                  <div className="flex flex-wrap gap-2">
                    {['Adventure', 'Food', 'Culture', 'Nature', 'Beach', 'Nightlife'].map((interest) => (
                      <button key={interest} type="button" onClick={() => toggleInterest(interest)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${selectedInterests.includes(interest) ? 'gradient-primary text-white' : 'bg-muted hover:bg-primary/10 hover:text-primary'}`}
                      >
                        {interest}
                      </button>
                    ))}
                  </div>
                </div>

                <Button onClick={handleGenerate} disabled={isGenerating}
                  className="w-full h-14 mt-4 gradient-primary text-primary-foreground rounded-2xl text-lg font-semibold shadow-glow hover:shadow-lg transition-shadow disabled:opacity-70"
                >
                  {isGenerating ? (<><Loader2 className="w-5 h-5 mr-2 animate-spin" />Generating...</>) : (<><Sparkles className="w-5 h-5 mr-2" />Generate AI Itinerary</>)}
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="travel-card p-6 bg-gradient-to-br from-primary/5 to-accent/5">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium text-primary">
                  {showGenerated ? 'AI Generated Itinerary' : 'AI Generated Sample'}
                </span>
              </div>
              
              <h3 className="text-2xl font-bold text-foreground mb-3">
                {showGenerated && generatedItinerary 
                  ? `${generatedItinerary.duration} in ${generatedItinerary.destination}`
                  : '5 Days in Goa 🏖️'
                }
              </h3>
              
              <div className="flex items-center gap-6 text-muted-foreground mb-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{showGenerated && generatedItinerary ? generatedItinerary.destination : 'Goa, India'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{showGenerated && generatedItinerary ? generatedItinerary.duration : '5 Days'}</span>
                </div>
              </div>

              {showGenerated && generatedItinerary?.summary && (
                <p className="text-sm text-muted-foreground mb-4">{generatedItinerary.summary}</p>
              )}

              <div className="p-4 bg-primary/10 rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-sm text-muted-foreground">Estimated Total</span>
                  <p className="text-2xl font-bold text-primary">₹{totalCost.toLocaleString()}</p>
                </div>
                <span className="text-xs text-muted-foreground">Per person</span>
              </div>
            </div>

            <div className="space-y-3">
              {displayDays.map((day) => (
                <div key={day.day} className="travel-card">
                  <button onClick={() => setExpandedDay(expandedDay === day.day ? null : day.day)} className="w-full flex items-center justify-between p-2">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center text-white font-bold text-lg">{day.day}</div>
                      <div className="text-left">
                        <h4 className="font-semibold text-foreground">Day {day.day}</h4>
                        <p className="text-sm text-muted-foreground">{day.title}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-primary">₹{day.activities.reduce((sum, act) => sum + act.cost, 0).toLocaleString()}</span>
                      {expandedDay === day.day ? <ChevronUp className="w-5 h-5 text-muted-foreground" /> : <ChevronDown className="w-5 h-5 text-muted-foreground" />}
                    </div>
                  </button>
                  {expandedDay === day.day && (
                    <div className="mt-4 pt-4 border-t border-border space-y-3 animate-fade-in">
                      {day.activities.map((activity, index) => (
                        <div key={index} className="flex items-start gap-3 ml-2">
                          <div className="flex flex-col items-center">
                            <div className="w-3 h-3 rounded-full gradient-primary" />
                            {index < day.activities.length - 1 && <div className="w-0.5 flex-1 bg-primary/20 mt-1 min-h-[24px]" />}
                          </div>
                          <div className="flex-1 pb-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-medium text-primary">{activity.time}</span>
                              {activity.cost > 0 && <span className="text-xs text-muted-foreground">₹{activity.cost.toLocaleString()}</span>}
                            </div>
                            <p className="text-sm text-foreground mt-0.5">{activity.activity}</p>
                            {'tips' in activity && (activity as { tips?: string }).tips && (
                              <p className="text-xs text-muted-foreground mt-1 italic">💡 {(activity as { tips?: string }).tips}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {showGenerated && generatedItinerary?.tips && generatedItinerary.tips.length > 0 && (
              <div className="travel-card p-6">
                <h4 className="font-semibold text-foreground mb-3">💡 Travel Tips</h4>
                <ul className="space-y-2">
                  {generatedItinerary.tips.map((tip, index) => (
                    <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-primary">•</span>{tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ItinerarySection;
