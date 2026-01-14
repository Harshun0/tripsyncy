import React from 'react';
import { Search, BadgeCheck } from 'lucide-react';
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
        <h1 className="text-xl font-bold text-foreground mb-3">Messages</h1>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search conversations..."
            className="input-field pl-10"
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="px-4 mt-4 space-y-2">
        {chats.map((chat) => (
          <button
            key={chat.id}
            onClick={() => onOpenChat(chat.id)}
            className="w-full travel-card flex items-center gap-3 p-3 text-left hover:shadow-lg transition-shadow"
          >
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <img
                src={chat.avatar}
                alt={chat.name}
                className="w-14 h-14 rounded-full object-cover"
              />
              {chat.isOnline && <span className="status-online" />}
              {chat.verified && (
                <div className="absolute -top-1 -right-1 w-5 h-5 gradient-primary rounded-full flex items-center justify-center">
                  <BadgeCheck className="w-3 h-3 text-white" />
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-semibold text-foreground truncate">{chat.name}</h3>
                <span className="text-xs text-muted-foreground flex-shrink-0">{chat.time}</span>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground truncate pr-2">{chat.lastMessage}</p>
                {chat.unread > 0 && (
                  <span className="w-5 h-5 gradient-primary rounded-full text-[10px] font-bold text-white flex items-center justify-center flex-shrink-0">
                    {chat.unread}
                  </span>
                )}
              </div>
              
              {/* Match Score */}
              <div className="flex items-center gap-2 mt-1">
                <div className="w-12 h-1 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full gradient-primary rounded-full"
                    style={{ width: `${chat.matchScore}%` }}
                  />
                </div>
                <span className="text-[10px] text-primary font-medium">{chat.matchScore}% match</span>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Travel Requests */}
      <div className="px-4 mt-6">
        <h3 className="text-lg font-semibold text-foreground mb-3">Trip-Mate Requests</h3>
        
        <div className="travel-card p-4">
          <div className="flex items-center gap-3 mb-3">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=50&h=50&fit=crop&crop=face"
              alt="Sneha"
              className="w-12 h-12 rounded-full object-cover"
            />
            <div className="flex-1">
              <h4 className="font-semibold text-foreground">Sneha Kapoor</h4>
              <p className="text-xs text-muted-foreground">Wants to join your Goa trip</p>
            </div>
            <span className="chip chip-primary text-xs">81% match</span>
          </div>
          
          <div className="flex gap-2">
            <button className="flex-1 py-2 gradient-primary text-primary-foreground rounded-xl text-sm font-medium">
              Accept
            </button>
            <button className="flex-1 py-2 bg-muted text-muted-foreground rounded-xl text-sm font-medium">
              Decline
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatListScreen;
