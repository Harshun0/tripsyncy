import React, { useEffect, useState } from 'react';
import { X, Bell, Shield, Moon, Globe, Lock, LogOut, ChevronRight, User, Eye, Trash2, HelpCircle, ChevronLeft, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface ProfileSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
}

const ProfileSettingsModal: React.FC<ProfileSettingsModalProps> = ({ isOpen, onClose, onLogout }) => {
  const { profile, updateProfile, updatePassword } = useAuth();
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [profileVisibility, setProfileVisibility] = useState('public');
  const [activeSubPage, setActiveSubPage] = useState<string | null>(null);
  const [personalInfo, setPersonalInfo] = useState({ name: '', phone: '' });
  const [passwords, setPasswords] = useState({ current: '', newPass: '', confirm: '' });
  const [language, setLanguage] = useState(localStorage.getItem('ts_language') || 'English');
  const [messagingPref, setMessagingPref] = useState(localStorage.getItem('ts_messaging_pref') || 'Everyone');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setNotifications(profile.notifications_enabled ?? true);
    setDarkMode(profile.dark_mode ?? false);
    setProfileVisibility(profile.profile_visibility || 'public');
    setPersonalInfo({ name: profile.display_name || '', phone: profile.phone || '' });
  }, [profile]);

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [darkMode]);

  if (!isOpen) return null;

  const handleToggleDarkMode = async (val: boolean) => {
    setDarkMode(val);
    await updateProfile({ dark_mode: val } as any);
    toast({ title: `${val ? 'Dark' : 'Light'} mode ${val ? 'enabled' : 'disabled'} ${val ? '🌙' : '☀️'}` });
  };

  const handleToggleNotifications = async (val: boolean) => {
    setNotifications(val);
    await updateProfile({ notifications_enabled: val } as any);
    toast({ title: `Notifications ${val ? 'enabled 🔔' : 'disabled 🔕'}` });
  };

  const handleSavePersonalInfo = async () => {
    const { error } = await updateProfile({ display_name: personalInfo.name, phone: personalInfo.phone } as any);
    if (error) {
      toast({ title: 'Failed to save', description: error, variant: 'destructive' });
      return;
    }
    toast({ title: 'Personal information updated! ✅' });
    setActiveSubPage(null);
  };

  const handleChangePassword = async () => {
    if (passwords.newPass !== passwords.confirm) {
      toast({ title: 'Passwords do not match', variant: 'destructive' });
      return;
    }
    if (passwords.newPass.length < 6) {
      toast({ title: 'Password must be at least 6 characters', variant: 'destructive' });
      return;
    }

    const { error } = await updatePassword(passwords.newPass);
    if (error) {
      toast({ title: 'Password update failed', description: error, variant: 'destructive' });
      return;
    }

    toast({ title: 'Password updated! 🔒' });
    setPasswords({ current: '', newPass: '', confirm: '' });
    setActiveSubPage(null);
  };

  const handleDeleteAccount = () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      return;
    }
    toast({ title: 'Delete account flow', description: 'Please contact support to complete secure account deletion.' });
    setShowDeleteConfirm(false);
    setActiveSubPage(null);
  };

  const updateVisibility = async (value: string) => {
    setProfileVisibility(value);
    await updateProfile({ profile_visibility: value } as any);
    toast({ title: `Visibility set to ${value} 👁️` });
    setActiveSubPage(null);
  };

  const saveLanguage = (value: string) => {
    setLanguage(value);
    localStorage.setItem('ts_language', value);
    toast({ title: `Language set to ${value} 🌐` });
    setActiveSubPage(null);
  };

  const saveMessagingPref = (value: string) => {
    setMessagingPref(value);
    localStorage.setItem('ts_messaging_pref', value);
    toast({ title: `Messaging set to: ${value} 💬` });
    setActiveSubPage(null);
  };

  if (activeSubPage) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in" onClick={onClose}>
        <div className="w-full max-w-lg bg-background rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
          <div className="sticky top-0 glass-effect px-6 py-4 flex items-center gap-3 border-b border-border z-10">
            <button onClick={() => { setActiveSubPage(null); setShowDeleteConfirm(false); }} className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center"><ChevronLeft className="w-5 h-5" /></button>
            <h2 className="text-lg font-bold text-foreground">{activeSubPage}</h2>
          </div>

          <div className="p-6 space-y-4">
            {activeSubPage === 'Personal Information' && (
              <>
                <div><label className="block text-sm font-medium text-foreground mb-2">Full Name</label><input type="text" value={personalInfo.name} onChange={(e) => setPersonalInfo({ ...personalInfo, name: e.target.value })} className="input-field" /></div>
                <div><label className="block text-sm font-medium text-foreground mb-2">Phone</label><input type="tel" value={personalInfo.phone} onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })} className="input-field" /></div>
                <Button onClick={handleSavePersonalInfo} className="w-full h-12 gradient-primary text-primary-foreground rounded-xl font-semibold">Save Changes</Button>
              </>
            )}

            {activeSubPage === 'Password & Security' && (
              <>
                <div><label className="block text-sm font-medium text-foreground mb-2">Current Password</label><input type="password" value={passwords.current} onChange={(e) => setPasswords({ ...passwords, current: e.target.value })} className="input-field" placeholder="For your reference" /></div>
                <div><label className="block text-sm font-medium text-foreground mb-2">New Password</label><input type="password" value={passwords.newPass} onChange={(e) => setPasswords({ ...passwords, newPass: e.target.value })} className="input-field" placeholder="Min 6 characters" /></div>
                <div><label className="block text-sm font-medium text-foreground mb-2">Confirm New Password</label><input type="password" value={passwords.confirm} onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })} className="input-field" placeholder="Re-enter new password" /></div>
                <Button onClick={handleChangePassword} className="w-full h-12 gradient-primary text-primary-foreground rounded-xl font-semibold">Update Password</Button>
              </>
            )}

            {activeSubPage === 'Profile Visibility' && (
              <div className="space-y-2">{['public', 'friends', 'private'].map((opt) => (
                <button key={opt} onClick={() => updateVisibility(opt)} className={`w-full p-4 rounded-xl text-left font-medium transition-all ${profileVisibility === opt ? 'gradient-primary text-white' : 'bg-muted hover:bg-muted/80'}`}>
                  <span className="capitalize">{opt}</span>
                  <p className="text-xs mt-1 opacity-70">{opt === 'public' ? 'Everyone can see your profile' : opt === 'friends' ? 'Only connections can see' : 'Only you can see'}</p>
                </button>
              ))}</div>
            )}

            {activeSubPage === 'Language' && (
              <div className="space-y-2">{['English', 'Hindi', 'Tamil', 'Bengali', 'Telugu', 'Marathi', 'Kannada'].map((lang) => (
                <button key={lang} onClick={() => saveLanguage(lang)} className={`w-full p-4 rounded-xl text-left font-medium transition-all ${language === lang ? 'gradient-primary text-white' : 'bg-muted hover:bg-muted/80'}`}>{lang}</button>
              ))}</div>
            )}

            {activeSubPage === 'Who Can Message Me' && (
              <div className="space-y-2">{['Everyone', 'Connections Only', 'Nobody'].map((opt) => (
                <button key={opt} onClick={() => saveMessagingPref(opt)} className={`w-full p-4 rounded-xl text-left font-medium transition-all ${messagingPref === opt ? 'gradient-primary text-white' : 'bg-muted hover:bg-muted/80'}`}>
                  {opt}
                </button>
              ))}</div>
            )}

            {activeSubPage === 'Blocked Users' && <div className="text-center py-8"><Shield className="w-12 h-12 text-muted-foreground mx-auto mb-3" /><p className="text-foreground font-medium mb-1">No blocked users</p></div>}
            {activeSubPage === 'Help Center' && <div className="p-4 bg-muted/50 rounded-xl"><p className="text-sm text-muted-foreground">Support: help@tripsync.com</p></div>}
            {activeSubPage === 'Privacy Policy' && <div className="p-4 bg-muted/50 rounded-xl"><p className="text-sm text-muted-foreground">Your data is processed securely and only for app functionality.</p></div>}

            {activeSubPage === 'Delete Account' && (
              <div className="space-y-4">
                <div className="p-4 bg-destructive/10 rounded-xl border border-destructive/20">
                  <h4 className="font-semibold text-destructive mb-2">⚠️ Warning</h4>
                  <p className="text-sm text-muted-foreground">This action cannot be undone.</p>
                </div>
                {showDeleteConfirm ? (
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-foreground text-center">Are you absolutely sure?</p>
                    <div className="flex gap-3">
                      <Button onClick={() => setShowDeleteConfirm(false)} variant="outline" className="flex-1 h-12 rounded-xl">Cancel</Button>
                      <Button onClick={handleDeleteAccount} className="flex-1 h-12 rounded-xl bg-destructive text-white hover:bg-destructive/90">Yes, Delete</Button>
                    </div>
                  </div>
                ) : (
                  <Button onClick={handleDeleteAccount} className="w-full h-12 rounded-xl bg-destructive text-white hover:bg-destructive/90"><Trash2 className="w-5 h-5 mr-2" />Delete My Account</Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  const settingsSections = [
    {
      title: 'Account',
      items: [
        { icon: User, label: 'Personal Information', action: 'navigate' as const },
        { icon: Lock, label: 'Password & Security', action: 'navigate' as const },
        { icon: Eye, label: 'Profile Visibility', action: 'navigate' as const, value: profileVisibility },
      ],
    },
    {
      title: 'Preferences',
      items: [
        { icon: Bell, label: 'Notifications', action: 'toggle' as const, value: notifications, onChange: handleToggleNotifications },
        { icon: darkMode ? Moon : Sun, label: 'Dark Mode', action: 'toggle' as const, value: darkMode, onChange: handleToggleDarkMode },
        { icon: Globe, label: 'Language', action: 'navigate' as const, value: language },
      ],
    },
    {
      title: 'Privacy & Safety',
      items: [
        { icon: Shield, label: 'Blocked Users', action: 'navigate' as const },
        { icon: Eye, label: 'Who Can Message Me', action: 'navigate' as const, value: messagingPref },
      ],
    },
    {
      title: 'Support',
      items: [
        { icon: HelpCircle, label: 'Help Center', action: 'navigate' as const },
        { icon: Shield, label: 'Privacy Policy', action: 'navigate' as const },
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="w-full max-w-lg bg-background rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 glass-effect px-6 py-4 flex items-center justify-between border-b border-border z-10">
          <h2 className="text-xl font-bold text-foreground">Settings</h2>
          <button onClick={onClose} className="w-10 h-10 rounded-full hover:bg-muted flex items-center justify-center transition-colors"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-6 space-y-6">
          {settingsSections.map((section) => (
            <div key={section.title}>
              <h3 className="text-sm font-medium text-muted-foreground mb-3">{section.title}</h3>
              <div className="bg-card rounded-2xl overflow-hidden divide-y divide-border">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button key={item.label} onClick={() => {
                      if (item.action === 'navigate') setActiveSubPage(item.label);
                      if (item.action === 'toggle' && 'onChange' in item) (item.onChange as (val: boolean) => void)(!item.value);
                    }} className="w-full px-4 py-3 flex items-center justify-between hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center"><Icon className="w-5 h-5 text-primary" /></div>
                        <span className="font-medium text-foreground">{item.label}</span>
                      </div>
                      {item.action === 'toggle' && (
                        <div className={`w-12 h-7 rounded-full transition-colors ${item.value ? 'bg-primary' : 'bg-muted'}`}><div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${item.value ? 'translate-x-6' : 'translate-x-1'} mt-1`} /></div>
                      )}
                      {item.action === 'navigate' && <div className="flex items-center gap-2 text-muted-foreground">{'value' in item && item.value && <span className="text-sm capitalize">{String(item.value)}</span>}<ChevronRight className="w-5 h-5" /></div>}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          <div>
            <h3 className="text-sm font-medium text-destructive mb-3">Danger Zone</h3>
            <div className="bg-card rounded-2xl overflow-hidden">
              <button onClick={() => setActiveSubPage('Delete Account')} className="w-full px-4 py-3 flex items-center gap-3 hover:bg-destructive/5 transition-colors">
                <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center"><Trash2 className="w-5 h-5 text-destructive" /></div>
                <span className="font-medium text-destructive">Delete Account</span>
              </button>
            </div>
          </div>

          <Button onClick={onLogout} variant="outline" className="w-full h-12 rounded-xl border-destructive text-destructive hover:bg-destructive/5">
            <LogOut className="w-5 h-5 mr-2" />Log Out
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettingsModal;
