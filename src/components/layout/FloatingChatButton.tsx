import React from 'react';
import { Bot, X } from 'lucide-react';

interface FloatingChatButtonProps {
  onClick: () => void;
  isOpen: boolean;
}

const FloatingChatButton: React.FC<FloatingChatButtonProps> = ({ onClick, isOpen }) => {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 z-40 w-16 h-16 gradient-primary rounded-full flex items-center justify-center shadow-glow hover:shadow-lg transition-all hover:scale-105 group"
      aria-label={isOpen ? "Close AI Assistant" : "Open AI Assistant"}
    >
      {/* Pulse Ring Animation */}
      {!isOpen && (
        <span className="absolute inset-0 rounded-full gradient-primary animate-pulse-ring opacity-50" />
      )}
      
      {/* Icon */}
      {isOpen ? (
        <X className="w-7 h-7 text-white" />
      ) : (
        <Bot className="w-7 h-7 text-white" />
      )}
      
      {/* Tooltip */}
      {!isOpen && (
        <span className="absolute right-full mr-4 px-4 py-2 bg-foreground text-background text-sm font-medium rounded-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg">
          Ask TripSync AI
        </span>
      )}
    </button>
  );
};

export default FloatingChatButton;
