import React, { useState } from 'react';
import { Phone, MapPin, Share2, Users, Hospital, ShieldAlert, Bluetooth, WifiOff, Navigation, Shield, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const SafetySection: React.FC = () => {
  const [sosActive, setSosActive] = useState(false);
  const [locationSharing, setLocationSharing] = useState(false);

  const emergencyContacts = [
    { name: 'Mom', phone: '+91 98765 43210', relation: 'Family' },
    { name: 'Dad', phone: '+91 98765 43211', relation: 'Family' },
    { name: 'Arjun (Trip Mate)', phone: '+91 87654 32109', relation: 'Travel Buddy' },
  ];

  const nearbyServices = [
    { type: 'Hospital', name: 'Apollo Hospital', distance: '2.3 km', icon: Hospital },
    { type: 'Police', name: 'Calangute Police Station', distance: '1.8 km', icon: ShieldAlert },
    { type: 'Hospital', name: 'Goa Medical College', distance: '5.1 km', icon: Hospital },
  ];

  const safetyFeatures = [
    { icon: Shield, title: 'Verified Profiles', description: 'All travelers are ID verified for your safety' },
    { icon: Share2, title: 'Live Location', description: 'Share your real-time location with trusted contacts' },
    { icon: Users, title: 'Group Alerts', description: 'Instantly alert your travel group in emergencies' },
    { icon: WifiOff, title: 'Offline SOS', description: 'Emergency features work even without internet' },
  ];

  return (
    <section className="py-24 lg:py-36 bg-gradient-to-b from-background to-destructive/5 relative overflow-hidden">
      {/* Subtle pattern background */}
      <div className="absolute inset-0 pattern-dots opacity-30 pointer-events-none" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-destructive/8 rounded-full text-destructive text-sm font-semibold mb-6 border border-destructive/15">
            <Shield className="w-4 h-4" />
            Travel Safe
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6 font-display leading-tight">
            Emergency & <span className="text-destructive">Safety</span> Features
          </h2>
          <p className="text-lg text-muted-foreground">
            Your safety is our priority. Access emergency services, share location, and stay connected even offline.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* SOS Card */}
            <div className="relative p-8 bg-card rounded-3xl border border-border/50 overflow-hidden">
              {/* Subtle radial glow behind SOS */}
              {sosActive && <div className="absolute inset-0 bg-destructive/5 animate-pulse" />}
              
              <h3 className="text-xl font-bold text-foreground mb-8 text-center font-display relative">Emergency SOS</h3>
              
              <div className="relative flex justify-center mb-8">
                {/* Pulsing rings */}
                {sosActive && (
                  <>
                    <span className="absolute w-40 h-40 rounded-full border-2 border-destructive/30 animate-pulse-ring" />
                    <span className="absolute w-52 h-52 rounded-full border border-destructive/15 animate-pulse-ring" style={{ animationDelay: '0.5s' }} />
                  </>
                )}
                <button
                  onClick={() => setSosActive(!sosActive)}
                  className={`relative w-32 h-32 rounded-full bg-destructive text-white font-bold text-2xl flex items-center justify-center transition-all duration-500 ${
                    sosActive ? 'scale-110' : 'hover:scale-105'
                  }`}
                  style={{
                    boxShadow: sosActive 
                      ? '0 0 0 10px hsl(var(--destructive) / 0.25), 0 0 60px hsl(var(--destructive) / 0.35)'
                      : '0 8px 32px hsl(var(--destructive) / 0.35)'
                  }}
                >
                  <div className="text-center">
                    <Phone className="w-10 h-10 mx-auto mb-1" />
                    <span className="text-lg font-bold">{sosActive ? 'CANCEL' : 'SOS'}</span>
                  </div>
                </button>
              </div>
              
              <p className="text-muted-foreground text-center max-w-sm mx-auto relative">
                {sosActive 
                  ? '🚨 Emergency alert sent to all contacts! Tap to cancel.'
                  : 'Tap and hold for 3 seconds to trigger emergency alert to all your contacts'
                }
              </p>

              <div className="grid grid-cols-2 gap-4 mt-8 relative">
                <button
                  onClick={() => setLocationSharing(!locationSharing)}
                  className={`p-5 rounded-2xl border flex items-center gap-4 transition-all duration-300 hover:-translate-y-0.5 ${locationSharing ? 'border-success/30 bg-success/5 shadow-md' : 'border-border/50 bg-card hover:shadow-md'}`}
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${locationSharing ? 'bg-success/15' : 'bg-primary/10'}`}>
                    <Share2 className={`w-6 h-6 ${locationSharing ? 'text-success' : 'text-primary'}`} />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-foreground">Live Location</p>
                    <p className="text-xs text-muted-foreground">{locationSharing ? 'Sharing active...' : 'Share with group'}</p>
                  </div>
                </button>

                <button className="p-5 rounded-2xl border border-border/50 bg-card flex items-center gap-4 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
                  <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center">
                    <Users className="w-6 h-6 text-accent" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-foreground">Alert Group</p>
                    <p className="text-xs text-muted-foreground">3 members</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Safety Features */}
            <div className="grid sm:grid-cols-2 gap-4 stagger-children">
              {safetyFeatures.map(({ icon: Icon, title, description }) => (
                <div key={title} className="group p-6 bg-card rounded-2xl border border-border/50 flex items-start gap-4 hover:border-primary/20 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <div className="w-12 h-12 rounded-2xl bg-primary/8 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/15 group-hover:scale-110 transition-all duration-300">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground mb-1 font-display">{title}</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="p-6 bg-card rounded-2xl border border-border/50">
              <h3 className="font-bold text-foreground mb-4 flex items-center gap-2 font-display">
                <Phone className="w-5 h-5 text-destructive" />Emergency Contacts
              </h3>
              <div className="space-y-3">
                {emergencyContacts.map((contact, index) => (
                  <div key={index} className="flex items-center justify-between p-3.5 bg-muted/40 rounded-xl hover:bg-muted/60 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
                        <Phone className="w-5 h-5 text-destructive" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground text-sm">{contact.name}</p>
                        <p className="text-xs text-muted-foreground">{contact.relation}</p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" className="rounded-full h-8 text-destructive border-destructive/30 hover:bg-destructive/10">Call</Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 bg-card rounded-2xl border border-border/50">
              <h3 className="font-bold text-foreground mb-4 flex items-center gap-2 font-display">
                <MapPin className="w-5 h-5 text-primary" />Nearby Services
              </h3>
              <div className="space-y-3">
                {nearbyServices.map((service, index) => {
                  const Icon = service.icon;
                  return (
                    <div key={index} className="flex items-center justify-between p-3.5 bg-muted/40 rounded-xl hover:bg-muted/60 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${service.type === 'Hospital' ? 'bg-success/10' : 'bg-accent/10'}`}>
                          <Icon className={`w-5 h-5 ${service.type === 'Hospital' ? 'text-success' : 'text-accent'}`} />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground text-sm">{service.name}</p>
                          <p className="text-xs text-muted-foreground">{service.distance}</p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" className="rounded-full h-8 w-8 p-0"><Navigation className="w-3.5 h-3.5" /></Button>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-6 bg-card rounded-2xl border border-border/50 bg-gradient-to-br from-card to-muted/30">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-foreground/8 flex items-center justify-center">
                  <WifiOff className="w-7 h-7 text-foreground" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-foreground font-display">Offline Mode</h4>
                  <p className="text-sm text-muted-foreground">Emergency features work offline</p>
                </div>
                <div className="flex items-center gap-1.5 text-success bg-success/10 px-3 py-1.5 rounded-full">
                  <Bluetooth className="w-4 h-4" />
                  <span className="text-xs font-semibold">Ready</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SafetySection;
