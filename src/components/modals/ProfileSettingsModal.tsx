import React, { useState } from 'react';
import { X, Bell, Shield, Moon, Globe, Lock, LogOut, ChevronRight, User, Eye, Trash2, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProfileSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
}

const ProfileSettingsModal: React.FC<ProfileSettingsModalProps> = ({ isOpen, onClose, onLogout }) => {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [profileVisibility, setProfileVisibility] = useState('public');

  if (!isOpen) return null;

  const settingsSections = [
    {
      title: 'Account',
      items: [
        { icon: User, label: 'Personal Information', action: 'navigate' },
        { icon: Lock, label: 'Password & Security', action: 'navigate' },
        { icon: Eye, label: 'Profile Visibility', action: 'select', value: profileVisibility },
      ],
    },
    {
      title: 'Preferences',
      items: [
        { icon: Bell, label: 'Notifications', action: 'toggle', value: notifications, onChange: setNotifications },
        { icon: Moon, label: 'Dark Mode', action: 'toggle', value: darkMode, onChange: setDarkMode },
        { icon: Globe, label: 'Language', action: 'navigate', value: 'English' },
      ],
    },
    {
      title: 'Privacy & Safety',
      items: [
        { icon: Shield, label: 'Blocked Users', action: 'navigate' },
        { icon: Eye, label: 'Who Can Message Me', action: 'navigate' },
      ],
    },
    {
      title: 'Support',
      items: [
        { icon: HelpCircle, label: 'Help Center', action: 'navigate' },
        { icon: Shield, label: 'Privacy Policy', action: 'navigate' },
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-background rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 glass-effect px-6 py-4 flex items-center justify-between border-b border-border z-10">
          <h2 className="text-xl font-bold text-foreground">Settings</h2>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full hover:bg-muted flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {settingsSections.map((section) => (
            <div key={section.title}>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">{section.title}</h3>
              <div className="bg-card rounded-2xl overflow-hidden divide-y divide-border">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.label}
                      className="w-full px-4 py-3 flex items-center justify-between hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                          <Icon className="w-5 h-5 text-primary" />
                        </div>
                        <span className="font-medium text-foreground">{item.label}</span>
                      </div>
                      
                      {item.action === 'toggle' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            item.onChange?.(!item.value);
                          }}
                          className={`w-12 h-7 rounded-full transition-colors ${
                            item.value ? 'bg-primary' : 'bg-muted'
                          }`}
                        >
                          <div
                            className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${
                              item.value ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      )}
                      
                      {item.action === 'navigate' && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          {item.value && <span className="text-sm">{item.value}</span>}
                          <ChevronRight className="w-5 h-5" />
                        </div>
                      )}
                      
                      {item.action === 'select' && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <span className="text-sm capitalize">{item.value}</span>
                          <ChevronRight className="w-5 h-5" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Danger Zone */}
          <div>
            <h3 className="text-sm font-medium text-destructive mb-3">Danger Zone</h3>
            <div className="bg-card rounded-2xl overflow-hidden divide-y divide-border">
              <button className="w-full px-4 py-3 flex items-center gap-3 hover:bg-destructive/5 transition-colors">
                <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                  <Trash2 className="w-5 h-5 text-destructive" />
                </div>
                <span className="font-medium text-destructive">Delete Account</span>
              </button>
            </div>
          </div>

          {/* Logout Button */}
          <Button
            onClick={onLogout}
            variant="outline"
            className="w-full h-12 rounded-xl border-destructive text-destructive hover:bg-destructive/5"
          >
            <LogOut className="w-5 h-5 mr-2" />
            Log Out
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettingsModal;
