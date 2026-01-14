import React, { useState } from 'react';
import { ArrowLeft, Phone, MapPin, Share2, Users, Hospital, ShieldAlert, Bluetooth, WifiOff, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmergencyScreenProps {
  onBack: () => void;
}

const EmergencyScreen: React.FC<EmergencyScreenProps> = ({ onBack }) => {
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

  return (
    <div className="h-full bg-background pb-4">
      {/* Header */}
      <div className="bg-destructive px-4 py-3 flex items-center gap-3">
        <button onClick={onBack} className="p-2 -ml-2 text-white/80 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-semibold text-white">Emergency & Safety</h1>
      </div>

      {/* SOS Button */}
      <div className="px-4 py-8 flex flex-col items-center">
        <button
          onClick={() => setSosActive(!sosActive)}
          className={`sos-button ${sosActive ? 'animate-pulse' : ''}`}
          style={{
            boxShadow: sosActive 
              ? '0 0 0 8px hsl(var(--destructive) / 0.3), 0 0 0 16px hsl(var(--destructive) / 0.2), 0 0 40px hsl(var(--destructive) / 0.4)'
              : undefined
          }}
        >
          <div className="text-center">
            <Phone className="w-8 h-8 mx-auto mb-1" />
            <span>{sosActive ? 'CANCEL' : 'SOS'}</span>
          </div>
        </button>
        <p className="text-sm text-muted-foreground mt-4 text-center max-w-xs">
          {sosActive 
            ? 'Emergency alert sent to all contacts! Tap to cancel.'
            : 'Tap and hold for 3 seconds to trigger emergency alert'
          }
        </p>
      </div>

      {/* Quick Actions */}
      <div className="px-4 mb-6">
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setLocationSharing(!locationSharing)}
            className={`travel-card flex items-center gap-3 ${locationSharing ? 'border-2 border-success' : ''}`}
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              locationSharing ? 'bg-success/10' : 'bg-primary/10'
            }`}>
              <Share2 className={`w-6 h-6 ${locationSharing ? 'text-success' : 'text-primary'}`} />
            </div>
            <div className="text-left">
              <p className="font-medium text-foreground">Live Location</p>
              <p className="text-xs text-muted-foreground">
                {locationSharing ? 'Sharing...' : 'Share with group'}
              </p>
            </div>
          </button>

          <button className="travel-card flex items-center gap-3">
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

      {/* Emergency Contacts */}
      <div className="px-4 mb-6">
        <h3 className="text-lg font-semibold text-foreground mb-3">Emergency Contacts</h3>
        
        <div className="space-y-2">
          {emergencyContacts.map((contact, index) => (
            <div key={index} className="travel-card flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                  <Phone className="w-5 h-5 text-destructive" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{contact.name}</p>
                  <p className="text-xs text-muted-foreground">{contact.relation}</p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="rounded-full border-destructive text-destructive">
                <Phone className="w-4 h-4 mr-1" />
                Call
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Nearby Services */}
      <div className="px-4 mb-6">
        <h3 className="text-lg font-semibold text-foreground mb-3">Nearby Emergency Services</h3>
        
        <div className="space-y-2">
          {nearbyServices.map((service, index) => {
            const Icon = service.icon;
            return (
              <div key={index} className="travel-card flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    service.type === 'Hospital' ? 'bg-success/10' : 'bg-accent/10'
                  }`}>
                    <Icon className={`w-5 h-5 ${
                      service.type === 'Hospital' ? 'text-success' : 'text-accent'
                    }`} />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{service.name}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {service.distance} away
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="rounded-full">
                  <Navigation className="w-4 h-4 mr-1" />
                  Navigate
                </Button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Offline Mode Banner */}
      <div className="px-4">
        <div className="travel-card bg-gradient-to-r from-muted to-muted/50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-foreground/10 flex items-center justify-center">
              <WifiOff className="w-6 h-6 text-foreground" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-foreground">Offline Survival Mode</h4>
              <p className="text-xs text-muted-foreground">Access maps & contacts without internet</p>
            </div>
            <div className="flex items-center gap-1 text-success">
              <Bluetooth className="w-4 h-4" />
              <span className="text-xs font-medium">SOS Ready</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmergencyScreen;
