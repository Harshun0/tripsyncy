import React from 'react';
import { Bot } from 'lucide-react';

interface FloatingAIButtonProps {
  onClick: () => void;
}

const FloatingAIButton: React.FC<FloatingAIButtonProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="floating-ai-btn group"
      aria-label="Open AI Assistant"
    >
      {/* Pulse Ring Animation */}
      <span className="absolute inset-0 rounded-full gradient-primary animate-pulse-ring" />
      
      {/* Bot Icon */}
      <Bot className="w-6 h-6 relative z-10 transition-transform duration-300 group-hover:scale-110" />
      
      {/* Tooltip */}
      <span className="absolute right-full mr-3 px-3 py-1.5 bg-foreground text-background text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
        Ask TripSync AI
      </span>
    </button>
  );
};

export default FloatingAIButton;
