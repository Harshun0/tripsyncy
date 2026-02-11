import React, { useState, useEffect } from 'react';
import { X, Camera, MapPin, Wallet, Heart, Mountain, Utensils, Compass, Sunrise, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

interface ProfileData {
  displayName: string;
  bio: string;
  location: string;
  budget: string;
  personality: string;
  interests: string[];
}

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ProfileData) => void;
  initialData?: ProfileData;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState<ProfileData>({
    displayName: 'Traveler',
    bio: 'Exploring the world one trip at a time ✈️ | Budget traveler | Coffee lover ☕',
    location: 'Mumbai, India',
    budget: 'Mid-Range',
    personality: 'Ambivert',
    interests: ['Adventure', 'Food', 'Culture', 'Nature', 'Photography'],
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData, isOpen]);

  const interestOptions = [
    { id: 'Adventure', label: 'Adventure', icon: Mountain },
    { id: 'Food', label: 'Food', icon: Utensils },
    { id: 'Culture', label: 'Culture', icon: Compass },
    { id: 'Nature', label: 'Nature', icon: Sunrise },
    { id: 'Spirituality', label: 'Spirituality', icon: Heart },
    { id: 'Photography', label: 'Photography', icon: Camera },
  ];

  const handleInterestToggle = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest],
    }));
  };

  const handleChangeAvatar = () => {
    toast({ title: 'Profile photo updated! 📸', description: 'Your new avatar will be visible to other travelers.' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.displayName.trim()) {
      toast({ title: 'Name is required', variant: 'destructive' });
      return;
    }
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="w-full max-w-lg bg-background rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 glass-effect px-6 py-4 flex items-center justify-between border-b border-border z-10">
          <h2 className="text-xl font-bold text-foreground">Edit Profile</h2>
          <button onClick={onClose} className="w-10 h-10 rounded-full hover:bg-muted flex items-center justify-center transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="flex justify-center">
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face"
                alt="Profile"
                className="w-28 h-28 rounded-full object-cover border-4 border-primary/20"
              />
              <button type="button" onClick={handleChangeAvatar}
                className="absolute bottom-0 right-0 w-10 h-10 gradient-primary rounded-full flex items-center justify-center shadow-lg"
              >
                <Camera className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Display Name</label>
              <input type="text" value={formData.displayName} onChange={(e) => setFormData({ ...formData, displayName: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Bio</label>
              <textarea value={formData.bio} onChange={(e) => setFormData({ ...formData, bio: e.target.value })} rows={3} className="input-field resize-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                <MapPin className="w-4 h-4 inline mr-2" />Location
              </label>
              <input type="text" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} className="input-field" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-3">
              <Wallet className="w-4 h-4 inline mr-2" />Travel Budget
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['Budget', 'Mid-Range', 'Luxury'].map((option) => (
                <button key={option} type="button" onClick={() => setFormData({ ...formData, budget: option })}
                  className={`py-3 rounded-xl text-sm font-medium transition-all ${formData.budget === option ? 'gradient-primary text-white' : 'bg-muted hover:bg-muted/80'}`}
                >{option}</button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-3">
              <Heart className="w-4 h-4 inline mr-2" />Personality Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['Introvert', 'Ambivert', 'Extrovert'].map((option) => (
                <button key={option} type="button" onClick={() => setFormData({ ...formData, personality: option })}
                  className={`py-3 rounded-xl text-sm font-medium transition-all ${formData.personality === option ? 'gradient-primary text-white' : 'bg-muted hover:bg-muted/80'}`}
                >{option}</button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-3">Travel Interests</label>
            <div className="flex flex-wrap gap-2">
              {interestOptions.map(({ id, label, icon: Icon }) => (
                <button key={id} type="button" onClick={() => handleInterestToggle(id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${formData.interests.includes(id) ? 'gradient-primary text-white' : 'bg-muted hover:bg-muted/80'}`}
                >
                  <Icon className="w-4 h-4" />{label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 h-12 rounded-xl">Cancel</Button>
            <Button type="submit" className="flex-1 h-12 gradient-primary text-primary-foreground rounded-xl font-semibold">
              <Save className="w-5 h-5 mr-2" />Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;
