import React from 'react';
import { Search, BadgeCheck, MessageSquare } from 'lucide-react';
import { dummyProfiles } from '@/data/dummyProfiles';

interface ChatListScreenProps {
  onOpenChat: (userId: string) => void;
}

const ChatListScreen: React.FC<ChatListScreenProps> = ({ onOpenChat }) => {
  const chats = dummyProfiles.slice(0, 5).map(profile => ({
    ...profile,
    lastMessage: getLastMessage(profile.id),
    unread: Math.random() > 0.5 ? Math.floor(Math.random() * 5) : 0,
    time: getRandomTime(),
  }));

  function getLastMessage(id: string): string {
    const messages = [
      "Hey! Are you still planning for the trip?",
      "The itinerary looks amazing! 🎉",
      "Let me know when you're free to discuss",
      "I found a great hostel in Goa!",
      "Can't wait for our adventure! 🏖️",
    ];
    return messages[parseInt(id) % messages.length];
  }

  function getRandomTime(): string {
    const times = ['Just now', '5m ago', '1h ago', '2h ago', 'Yesterday'];
    return times[Math.floor(Math.random() * times.length)];
  }

  return (
    <div className="pb-4">
      {/* Header */}
      <div className="sticky top-0 z-30 glass-effect px-4 py-3">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 gradient-primary rounded-xl flex items-center justify-center">
            <MessageSquare className="w-4 h-4 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-bold text-foreground font-display">Messages</h1>
        </div>
        
        {/* Search */}
        <div className="relative group">
          <div className="absolute -inset-0.5 rounded-2xl gradient-primary opacity-0 group-focus-within:opacity-10 blur-sm transition-opacity duration-300" />
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search conversations..."
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-card border border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 outline-none text-sm"
            />
          </div>
        </div>
      </div>

      {/* Chat List */}
      <div className="px-4 mt-4 space-y-2">
        {chats.map((chat, idx) => (
          <button
            key={chat.id}
            onClick={() => onOpenChat(chat.id)}
            className="w-full travel-card-nature flex items-center gap-3 p-3.5 text-left hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 animate-fade-in"
            style={{ animationDelay: `${idx * 60}ms` }}
          >
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className={`p-[2px] rounded-2xl ${chat.unread > 0 ? 'gradient-primary' : ''}`}>
                <img
                  src={chat.avatar}
                  alt={chat.name}
                  className={`w-14 h-14 rounded-[14px] object-cover ${chat.unread > 0 ? 'border-2 border-background' : ''}`}
                />
              </div>
              {chat.isOnline && <span className="status-online !bottom-0.5 !right-0.5" />}
              {chat.verified && (
                <div className="absolute -top-1 -right-1 w-5 h-5 gradient-primary rounded-lg flex items-center justify-center shadow-sm">
                  <BadgeCheck className="w-3 h-3 text-primary-foreground" />
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h3 className={`font-semibold text-foreground truncate ${chat.unread > 0 ? 'text-foreground' : ''}`}>{chat.name}</h3>
                <span className={`text-[11px] flex-shrink-0 ${chat.unread > 0 ? 'text-primary font-medium' : 'text-muted-foreground'}`}>{chat.time}</span>
              </div>
              <div className="flex items-center justify-between">
                <p className={`text-sm truncate pr-2 ${chat.unread > 0 ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>{chat.lastMessage}</p>
                {chat.unread > 0 && (
                  <span className="w-5 h-5 gradient-primary rounded-lg text-[10px] font-bold text-primary-foreground flex items-center justify-center flex-shrink-0 shadow-sm">
                    {chat.unread}
                  </span>
                )}
              </div>
              
              {/* Match Score */}
              <div className="flex items-center gap-2 mt-1.5">
                <div className="w-14 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full gradient-primary rounded-full"
                    style={{ width: `${chat.matchScore}%` }}
                  />
                </div>
                <span className="text-[10px] text-primary font-semibold">{chat.matchScore}% match</span>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Travel Requests */}
      <div className="px-4 mt-6">
        <h3 className="text-lg font-semibold text-foreground mb-3 font-display">Trip-Mate Requests</h3>
        
        <div className="travel-card-nature p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-[2px] gradient-sunset rounded-2xl">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=50&h=50&fit=crop&crop=face"
                alt="Sneha"
                className="w-12 h-12 rounded-[14px] object-cover border-2 border-background"
              />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-foreground">Sneha Kapoor</h4>
              <p className="text-xs text-muted-foreground">Wants to join your Goa trip</p>
            </div>
            <span className="text-xs px-3 py-1.5 gradient-primary text-primary-foreground rounded-xl font-semibold shadow-sm">81%</span>
          </div>
          
          <div className="flex gap-2">
            <button className="flex-1 py-2.5 gradient-primary text-primary-foreground rounded-xl text-sm font-semibold shadow-sm hover:shadow-glow transition-shadow">
              Accept
            </button>
            <button className="flex-1 py-2.5 bg-muted text-muted-foreground rounded-xl text-sm font-medium hover:bg-muted/80 transition-colors">
              Decline
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatListScreen;
