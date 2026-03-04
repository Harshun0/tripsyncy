import React from 'react';
import { Sparkles, Calendar, MapPin, Wallet, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ItineraryIntroSectionProps {
  onNavigate?: (section: string) => void;
  isLoggedIn?: boolean;
}

const ItineraryIntroSection: React.FC<ItineraryIntroSectionProps> = ({ onNavigate, isLoggedIn }) => {
  return (
    <section className="py-20 lg:py-32 bg-gradient-to-b from-muted/30 to-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium">
              <Sparkles className="w-4 h-4" />
              AI-Powered Planning
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground">
              Smart <span className="text-gradient">Itinerary Generator</span>
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Tell our AI your destination, budget, and interests — and get a complete day-by-day travel plan with cost estimates, local tips, and hidden gems. All personalized just for you.
            </p>
            <div className="space-y-4">
              {[
                { icon: MapPin, text: 'Any destination worldwide' },
                { icon: Calendar, text: 'Day-by-day detailed plans' },
                { icon: Wallet, text: 'Budget-aware cost breakdowns' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-foreground font-medium">{text}</span>
                </div>
              ))}
            </div>
            <Button
              onClick={() => onNavigate?.(isLoggedIn ? 'itinerary' : 'login')}
              size="lg"
              className="h-14 px-8 gradient-primary text-primary-foreground rounded-2xl text-lg font-semibold shadow-glow hover:shadow-lg transition-shadow"
            >
              {isLoggedIn ? 'Try AI Itinerary' : 'Sign In to Plan'}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>

          <div className="relative">
            <div className="travel-card p-8 bg-gradient-to-br from-card to-primary/5">
              <div className="flex items-center gap-2 mb-6">
                <Sparkles className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium text-primary">Sample AI Output</span>
              </div>
              <h3 className="text-xl font-bold text-foreground mb-4">5 Days in Goa 🏖️</h3>
              <div className="space-y-3">
                {[
                  { day: 1, title: 'Arrive → North Goa Beaches', cost: '₹3,000' },
                  { day: 2, title: 'Water Sports & Dolphin Watch', cost: '₹4,500' },
                  { day: 3, title: 'Old Goa Heritage & Spice Farm', cost: '₹2,800' },
                  { day: 4, title: 'South Goa – Palolem Beach', cost: '₹3,200' },
                  { day: 5, title: 'Leisure & Departure', cost: '₹1,500' },
                ].map(({ day, title, cost }) => (
                  <div key={day} className="flex items-center gap-3 p-3 bg-background/60 rounded-xl">
                    <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center text-white text-sm font-bold">{day}</div>
                    <div className="flex-1"><p className="text-sm font-medium text-foreground">{title}</p></div>
                    <span className="text-xs font-medium text-primary">{cost}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 bg-primary/10 rounded-xl flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Estimated Total</span>
                <span className="text-lg font-bold text-primary">₹15,000</span>
              </div>
            </div>
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/10 rounded-full blur-2xl" />
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-accent/10 rounded-full blur-2xl" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default ItineraryIntroSection;
