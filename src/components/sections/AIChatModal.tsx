import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Sparkles, MapPin, Users, Calendar, Wallet, AlertTriangle, WifiOff, Mic, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: string;
  actions?: { label: string; icon: React.ElementType }[];
  isLoading?: boolean;
}

interface AIChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AIChatModal: React.FC<AIChatModalProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: "Hello! 👋 I'm TripSync AI, your smart travel companion. I can help you with:\n\n• Plan personalized itineraries\n• Find compatible travel buddies\n• Discover nearby travelers\n• Split group expenses\n• Emergency assistance\n\nWhat would you like to do today?",
      timestamp: 'Just now',
      actions: [
        { label: 'Plan a Trip', icon: Calendar },
        { label: 'Find Trip Mates', icon: Users },
        { label: 'Nearby Travelers', icon: MapPin },
      ],
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: 'Just now',
    };

    const loadingMessage: Message = {
      id: (Date.now() + 1).toString(),
      type: 'ai',
      content: '',
      timestamp: 'Just now',
      isLoading: true,
    };

    setMessages(prev => [...prev, userMessage, loadingMessage]);
    const userInput = inputValue;
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-travel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          type: 'chat',
          destination: userInput, // Using destination field for the message in chat mode
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get AI response');
      }

      const result = await response.json();
      
      const aiResponse: Message = {
        id: (Date.now() + 2).toString(),
        type: 'ai',
        content: result.content || result.data?.summary || "I'm here to help! Could you tell me more about what you're looking for?",
        timestamp: 'Just now',
        actions: getResponseActions(userInput),
      };

      setMessages(prev => prev.filter(m => !m.isLoading).concat(aiResponse));
    } catch (error) {
      console.error('Error getting AI response:', error);
      
      // Remove loading message and show error
      setMessages(prev => prev.filter(m => !m.isLoading));
      
      toast({
        title: "AI Response Failed",
        description: error instanceof Error ? error.message : "Failed to get AI response. Please try again.",
        variant: "destructive",
      });

      // Add a fallback response
      const fallbackResponse: Message = {
        id: (Date.now() + 2).toString(),
        type: 'ai',
        content: "I apologize, but I'm having trouble connecting right now. Please try again in a moment, or you can explore the app's features directly using the navigation menu.",
        timestamp: 'Just now',
      };
      setMessages(prev => [...prev, fallbackResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  const getResponseActions = (input: string): { label: string; icon: React.ElementType }[] | undefined => {
    const lowerInput = input.toLowerCase();
    
    if (lowerInput.includes('trip') || lowerInput.includes('travel') || lowerInput.includes('plan') || lowerInput.includes('itinerary')) {
      return [
        { label: 'Generate Itinerary', icon: Calendar },
        { label: 'Set Budget', icon: Wallet },
      ];
    }
    
    if (lowerInput.includes('nearby') || lowerInput.includes('travelers') || lowerInput.includes('people')) {
      return [
        { label: 'View All', icon: Users },
        { label: 'Send Request', icon: MapPin },
      ];
    }
    
    if (lowerInput.includes('sos') || lowerInput.includes('emergency') || lowerInput.includes('help') || lowerInput.includes('safe')) {
      return [
        { label: 'Activate SOS', icon: AlertTriangle },
        { label: 'Share Location', icon: MapPin },
      ];
    }
    
    return undefined;
  };

  const handleQuickAction = (label: string) => {
    setInputValue(label);
    setTimeout(() => handleSend(), 100);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-2xl h-[80vh] bg-background rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="glass-effect px-6 py-4 flex items-center gap-4 border-b border-border">
          <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center shadow-glow">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-foreground">TripSync AI</h2>
            <p className="text-sm text-success flex items-center gap-1">
              <span className="w-2 h-2 bg-success rounded-full" />
              Always online
            </p>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full hover:bg-muted flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Actions */}
        <div className="px-6 py-3 bg-muted/30 border-b border-border">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {[
              { icon: Calendar, label: 'Plan Trip' },
              { icon: Users, label: 'Find Mates' },
              { icon: MapPin, label: 'Nearby' },
              { icon: Wallet, label: 'Expenses' },
              { icon: WifiOff, label: 'Offline' },
              { icon: AlertTriangle, label: 'SOS' },
            ].map(({ icon: Icon, label }) => (
              <button
                key={label}
                onClick={() => handleQuickAction(label)}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 bg-card rounded-full text-sm font-medium whitespace-nowrap shadow-sm hover:shadow-md transition-all hover:bg-primary/5 disabled:opacity-50"
              >
                <Icon className="w-4 h-4 text-primary" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-5 py-4 ${
                  message.type === 'user'
                    ? 'gradient-primary text-primary-foreground rounded-br-md'
                    : 'bg-card shadow-md rounded-bl-md border border-border'
                }`}
              >
                {message.type === 'ai' && (
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 gradient-primary rounded-full flex items-center justify-center">
                      <Sparkles className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-xs font-medium text-primary">TripSync AI</span>
                  </div>
                )}
                
                {message.isLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    <span className="text-sm text-muted-foreground">Thinking...</span>
                  </div>
                ) : (
                  <p className={`text-sm whitespace-pre-line leading-relaxed ${message.type === 'ai' ? 'text-foreground' : ''}`}>
                    {message.content}
                  </p>
                )}
                
                {message.actions && !message.isLoading && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {message.actions.map(({ label, icon: Icon }) => (
                      <button
                        key={label}
                        onClick={() => handleQuickAction(label)}
                        className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-sm font-medium text-primary hover:bg-primary/20 transition-colors"
                      >
                        <Icon className="w-4 h-4" />
                        {label}
                      </button>
                    ))}
                  </div>
                )}
                
                {!message.isLoading && (
                  <p className={`text-[10px] mt-3 ${message.type === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                    {message.timestamp}
                  </p>
                )}
              </div>
            </div>
          ))}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-6 bg-card border-t border-border">
          <div className="flex items-center gap-3">
            <button className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-primary hover:bg-muted/80 transition-colors">
              <Mic className="w-5 h-5" />
            </button>
            <div className="flex-1">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask TripSync AI anything..."
                className="input-field h-12"
                disabled={isLoading}
              />
            </div>
            <Button
              onClick={handleSend}
              disabled={!inputValue.trim() || isLoading}
              className="w-12 h-12 p-0 rounded-full gradient-primary shadow-glow"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIChatModal;
