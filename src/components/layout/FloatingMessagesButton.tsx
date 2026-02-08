import React from 'react';
import { MessageCircle, X } from 'lucide-react';

interface FloatingMessagesButtonProps {
  onClick: () => void;
  isOpen: boolean;
  unreadCount?: number;
}

const FloatingMessagesButton: React.FC<FloatingMessagesButtonProps> = ({ onClick, isOpen, unreadCount = 0 }) => {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 z-40 w-16 h-16 gradient-primary rounded-full flex items-center justify-center shadow-glow hover:shadow-lg transition-all hover:scale-105 group"
      aria-label={isOpen ? "Close Messages" : "Open Messages"}
    >
      {/* Pulse Ring Animation */}
      {!isOpen && unreadCount > 0 && (
        <span className="absolute inset-0 rounded-full gradient-primary animate-pulse-ring opacity-50" />
      )}
      
      {/* Unread Badge */}
      {!isOpen && unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 w-6 h-6 bg-secondary text-white text-xs font-bold rounded-full flex items-center justify-center">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
      
      {/* Icon */}
      {isOpen ? (
        <X className="w-7 h-7 text-white" />
      ) : (
        <MessageCircle className="w-7 h-7 text-white" />
      )}
      
      {/* Tooltip */}
      {!isOpen && (
        <span className="absolute right-full mr-4 px-4 py-2 bg-foreground text-background text-sm font-medium rounded-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg">
          Messages & Requests
        </span>
      )}
    </button>
  );
};

export default FloatingMessagesButton;
