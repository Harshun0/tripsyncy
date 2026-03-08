import React from 'react';
import { Sparkles, Calendar, MapPin, Wallet, ArrowRight, Clock, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ItineraryIntroSectionProps {
  onNavigate?: (section: string) => void;
  isLoggedIn?: boolean;
}

const ItineraryIntroSection: React.FC<ItineraryIntroSectionProps> = ({ onNavigate, isLoggedIn }) => {
  return (
    <section className="py-24 lg:py-36 bg-gradient-to-b from-muted/20 to-background relative overflow-hidden">
      {/* Organic background */}
      <div className="absolute inset-0 gradient-mesh opacity-30 pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-7">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/8 rounded-full text-primary text-sm font-medium border border-primary/12">
              <Sparkles className="w-4 h-4" />
              AI-Powered Planning
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground font-display leading-tight">
              Smart <span className="text-gradient">Itinerary</span> Generator
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Tell our AI your destination, budget, and interests — get a complete day-by-day travel plan with cost estimates, local tips, and hidden gems.
            </p>
            <div className="space-y-4">
              {[
                { icon: MapPin, text: 'Any destination worldwide', desc: 'From Goa to Bali to Paris' },
                { icon: Calendar, text: 'Day-by-day detailed plans', desc: 'Activities, dining & transport' },
                { icon: Wallet, text: 'Budget-aware breakdowns', desc: 'Know costs before you go' },
              ].map(({ icon: Icon, text, desc }) => (
                <div key={text} className="flex items-start gap-4 p-3 rounded-2xl hover:bg-muted/40 transition-colors group">
                  <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/15 transition-colors">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <span className="text-foreground font-semibold">{text}</span>
                    <p className="text-sm text-muted-foreground">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <Button
              onClick={() => onNavigate?.(isLoggedIn ? 'itinerary' : 'login')}
              size="lg"
              className="h-14 px-8 gradient-primary text-primary-foreground rounded-2xl text-lg font-semibold shadow-glow hover:shadow-lg transition-all group"
            >
              {isLoggedIn ? 'Try AI Itinerary' : 'Sign In to Plan'}
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>

          <div className="relative">
            {/* Itinerary preview card */}
            <div className="travel-card-nature p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-semibold text-primary">AI Generated</span>
                </div>
                <div className="flex items-center gap-1 px-3 py-1 bg-warning/10 rounded-full">
                  <Star className="w-3.5 h-3.5 text-warning fill-warning" />
                  <span className="text-xs font-semibold text-warning">Popular</span>
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-foreground mb-1 font-display">5 Days in Goa 🏖️</h3>
              <p className="text-sm text-muted-foreground mb-5 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />Nov 15 – Nov 19</p>
              
              <div className="space-y-3">
                {[
                  { day: 1, title: 'Arrive → North Goa Beaches', cost: '₹3,000', emoji: '🏖️' },
                  { day: 2, title: 'Water Sports & Dolphin Watch', cost: '₹4,500', emoji: '🐬' },
                  { day: 3, title: 'Old Goa Heritage & Spice Farm', cost: '₹2,800', emoji: '🏛️' },
                  { day: 4, title: 'South Goa – Palolem Beach', cost: '₹3,200', emoji: '🌅' },
                  { day: 5, title: 'Leisure & Departure', cost: '₹1,500', emoji: '✈️' },
                ].map(({ day, title, cost, emoji }) => (
                  <div key={day} className="flex items-center gap-3 p-3.5 bg-muted/40 rounded-xl hover:bg-muted/60 transition-colors group/day">
                    <div className="w-9 h-9 gradient-primary rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0 group-hover/day:scale-105 transition-transform">{day}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{emoji} {title}</p>
                    </div>
                    <span className="text-xs font-semibold text-primary bg-primary/8 px-2.5 py-1 rounded-full">{cost}</span>
                  </div>
                ))}
              </div>
              
              <div className="mt-5 p-4 gradient-primary rounded-xl flex items-center justify-between">
                <span className="text-sm text-white/80">Estimated Total</span>
                <span className="text-xl font-bold text-white">₹15,000</span>
              </div>
            </div>
            
            {/* Decorative blobs */}
            <div className="absolute -top-6 -right-6 w-28 h-28 bg-primary/8 rounded-full blur-2xl" />
            <div className="absolute -bottom-6 -left-6 w-36 h-36 bg-accent/8 rounded-full blur-2xl" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default ItineraryIntroSection;
