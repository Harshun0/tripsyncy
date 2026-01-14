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
    <section className="py-20 lg:py-32 bg-gradient-to-b from-background to-destructive/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-destructive/10 rounded-full text-destructive text-sm font-medium mb-6">
            <Shield className="w-4 h-4" />
            Travel Safe
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Emergency & <span className="text-destructive">Safety</span> Features
          </h2>
          <p className="text-lg text-muted-foreground">
            Your safety is our priority. Access emergency services, share location, and stay connected even offline.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main SOS Panel */}
          <div className="lg:col-span-2 space-y-8">
            {/* SOS Button Card */}
            <div className="travel-card p-8 bg-gradient-to-br from-card to-destructive/5 text-center">
              <h3 className="text-xl font-semibold text-foreground mb-6">Emergency SOS</h3>
              
              <button
                onClick={() => setSosActive(!sosActive)}
                className={`w-32 h-32 mx-auto rounded-full bg-destructive text-white font-bold text-2xl flex items-center justify-center transition-all duration-300 ${
                  sosActive ? 'animate-pulse scale-110' : 'hover:scale-105'
                }`}
                style={{
                  boxShadow: sosActive 
                    ? '0 0 0 12px hsl(var(--destructive) / 0.3), 0 0 0 24px hsl(var(--destructive) / 0.15), 0 0 60px hsl(var(--destructive) / 0.4)'
                    : '0 10px 40px hsl(var(--destructive) / 0.4)'
                }}
              >
                <div className="text-center">
                  <Phone className="w-10 h-10 mx-auto mb-1" />
                  <span className="text-lg">{sosActive ? 'CANCEL' : 'SOS'}</span>
                </div>
              </button>
              
              <p className="text-muted-foreground mt-6 max-w-sm mx-auto">
                {sosActive 
                  ? '🚨 Emergency alert sent to all contacts! Tap to cancel.'
                  : 'Tap and hold for 3 seconds to trigger emergency alert to all your contacts'
                }
              </p>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-4 mt-8">
                <button
                  onClick={() => setLocationSharing(!locationSharing)}
                  className={`travel-card p-4 flex items-center gap-3 ${locationSharing ? 'border-2 border-success' : ''}`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    locationSharing ? 'bg-success/10' : 'bg-primary/10'
                  }`}>
                    <Share2 className={`w-6 h-6 ${locationSharing ? 'text-success' : 'text-primary'}`} />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-foreground">Live Location</p>
                    <p className="text-xs text-muted-foreground">
                      {locationSharing ? 'Sharing active...' : 'Share with group'}
                    </p>
                  </div>
                </button>

                <button className="travel-card p-4 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                    <Users className="w-6 h-6 text-accent" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-foreground">Alert Group</p>
                    <p className="text-xs text-muted-foreground">3 members</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Safety Features Grid */}
            <div className="grid sm:grid-cols-2 gap-4">
              {safetyFeatures.map(({ icon: Icon, title, description }) => (
                <div key={title} className="travel-card p-6 flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">{title}</h4>
                    <p className="text-sm text-muted-foreground">{description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Emergency Contacts */}
            <div className="travel-card p-6">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <Phone className="w-5 h-5 text-destructive" />
                Emergency Contacts
              </h3>
              <div className="space-y-3">
                {emergencyContacts.map((contact, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                        <Phone className="w-5 h-5 text-destructive" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground text-sm">{contact.name}</p>
                        <p className="text-xs text-muted-foreground">{contact.relation}</p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" className="rounded-full h-8 text-destructive border-destructive">
                      Call
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Nearby Services */}
            <div className="travel-card p-6">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" />
                Nearby Services
              </h3>
              <div className="space-y-3">
                {nearbyServices.map((service, index) => {
                  const Icon = service.icon;
                  return (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          service.type === 'Hospital' ? 'bg-success/10' : 'bg-accent/10'
                        }`}>
                          <Icon className={`w-5 h-5 ${
                            service.type === 'Hospital' ? 'text-success' : 'text-accent'
                          }`} />
                        </div>
                        <div>
                          <p className="font-medium text-foreground text-sm">{service.name}</p>
                          <p className="text-xs text-muted-foreground">{service.distance}</p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" className="rounded-full h-8">
                        <Navigation className="w-3 h-3" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Offline Mode */}
            <div className="travel-card p-6 bg-gradient-to-br from-muted/50 to-muted">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-foreground/10 flex items-center justify-center">
                  <WifiOff className="w-7 h-7 text-foreground" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground">Offline Mode</h4>
                  <p className="text-sm text-muted-foreground">Emergency features work offline</p>
                </div>
                <div className="flex items-center gap-1 text-success">
                  <Bluetooth className="w-4 h-4" />
                  <span className="text-xs font-medium">Ready</span>
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
