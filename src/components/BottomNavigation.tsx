import React from 'react';
import { Home, Compass, Sparkles, MessageCircle, User } from 'lucide-react';

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'explore', icon: Compass, label: 'Explore' },
    { id: 'ai', icon: Sparkles, label: 'AI' },
    { id: 'chat', icon: MessageCircle, label: 'Chat' },
    { id: 'profile', icon: User, label: 'Profile' },
  ];

  return (
    <div className="bottom-nav">
      <div className="flex items-center justify-around">
        {tabs.map(({ id, icon: Icon, label }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              className={`relative flex flex-col items-center gap-0.5 py-2 px-4 rounded-2xl transition-all duration-300 ${
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {isActive && (
                <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full gradient-primary" />
              )}
              <div className={`relative p-1.5 rounded-xl transition-all duration-300 ${isActive ? 'bg-primary/10 scale-110' : ''}`}>
                <Icon className="w-5 h-5" />
                {id === 'ai' && isActive && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-secondary animate-pulse" />
                )}
              </div>
              <span className={`text-[10px] font-semibold transition-all ${isActive ? 'text-primary' : ''}`}>{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNavigation;
