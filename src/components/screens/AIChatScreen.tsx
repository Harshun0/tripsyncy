import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Send, Sparkles, MapPin, Users, Calendar, Wallet, AlertTriangle, WifiOff, Mic, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: string;
  actions?: { label: string; icon: React.ElementType }[];
}

interface AIChatScreenProps {
  onClose: () => void;
}

const AIChatScreen: React.FC<AIChatScreenProps> = ({ onClose }) => {
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
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: 'Just now',
    };

    setMessages([...messages, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: getAIResponse(inputValue),
        timestamp: 'Just now',
        actions: getResponseActions(inputValue),
      };
      setMessages((prev) => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const getAIResponse = (input: string): string => {
    const lowerInput = input.toLowerCase();
    
    if (lowerInput.includes('goa') || lowerInput.includes('trip') || lowerInput.includes('plan')) {
      return "🏖️ Great choice! Goa is amazing! Based on your preferences, I've prepared a 5-day itinerary:\n\n**Day 1:** Arrive → North Goa beaches → Sunset at Chapora Fort\n\n**Day 2:** Water sports at Calangute → Dolphin watching\n\n**Day 3:** Heritage walk in Old Goa → Spice plantation\n\n**Day 4:** South Goa exploration → Palolem Beach\n\n**Day 5:** Leisure → Departure\n\n💰 Estimated Budget: ₹18,000 per person\n\nWould you like me to refine this itinerary?";
    }
    
    if (lowerInput.includes('nearby') || lowerInput.includes('travelers')) {
      return "📍 I found 6 travelers near you!\n\n**Within 5 km:**\n• Rahul M. (1.2 km) - 65% match\n• Priya S. (2.5 km) - 87% match\n\n**Within 10 km:**\n• Arjun P. (4.8 km) - 92% match\n• Ananya R. (8.2 km) - 78% match\n\nYour highest match is Arjun (92%)! You both love budget travel and food adventures.";
    }
    
    if (lowerInput.includes('expense') || lowerInput.includes('split')) {
      return "💸 Here's your group expense summary:\n\n**Total Trip Expense:** ₹20,100\n\n**Who Owes Whom:**\n• You owe Arjun: ₹2,800\n• Priya owes you: ₹1,100\n\n**Pending Payments:** 2\n**Completed:** 2\n\nShall I send UPI payment reminders?";
    }
    
    if (lowerInput.includes('sos') || lowerInput.includes('emergency')) {
      return "🚨 **Emergency Mode Activated**\n\nI'm here to help. You can:\n\n• One-tap SOS to alert emergency contacts\n• Share live location with your group\n• Find nearest hospital (2.3 km)\n• Find nearest police station (1.8 km)\n\nStay calm. Your safety is my priority. Should I activate emergency protocols?";
    }
    
    return "I understand! Let me help you with that. Could you tell me more about:\n\n• Your destination preference?\n• Travel dates?\n• Budget range?\n• Any specific interests?\n\nThe more details you share, the better I can assist! 🌟";
  };

  const getResponseActions = (input: string): { label: string; icon: React.ElementType }[] | undefined => {
    const lowerInput = input.toLowerCase();
    
    if (lowerInput.includes('goa') || lowerInput.includes('trip')) {
      return [
        { label: 'View Itinerary', icon: Calendar },
        { label: 'Adjust Budget', icon: Wallet },
      ];
    }
    
    if (lowerInput.includes('nearby') || lowerInput.includes('travelers')) {
      return [
        { label: 'View All', icon: Users },
        { label: 'Send Request', icon: MapPin },
      ];
    }
    
    if (lowerInput.includes('sos') || lowerInput.includes('emergency')) {
      return [
        { label: 'Activate SOS', icon: AlertTriangle },
        { label: 'Share Location', icon: MapPin },
      ];
    }
    
    return undefined;
  };

  const handleQuickAction = (label: string) => {
    setInputValue(label);
    setTimeout(() => {
      handleSend();
    }, 100);
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="glass-effect px-4 py-3 flex items-center gap-3 border-b border-border/50">
        <button onClick={onClose} className="p-2 -ml-2 hover:bg-muted rounded-xl transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="w-10 h-10 gradient-primary rounded-2xl flex items-center justify-center shadow-glow">
          <Bot className="w-5 h-5 text-primary-foreground" />
        </div>
        <div className="flex-1">
          <h2 className="font-semibold text-foreground font-display">TripSync AI</h2>
          <p className="text-xs text-success flex items-center gap-1">
            <span className="w-2 h-2 bg-success rounded-full animate-pulse" />
            Always online
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-4 py-3 bg-gradient-to-b from-muted/30 to-transparent">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
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
              className="flex items-center gap-1.5 px-4 py-2 bg-card rounded-xl text-sm font-medium whitespace-nowrap border border-border/40 hover:border-primary/30 hover:shadow-sm transition-all duration-300"
            >
              <Icon className="w-4 h-4 text-primary" />
              <span className="text-foreground">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                message.type === 'user'
                  ? 'gradient-primary text-primary-foreground rounded-br-md shadow-sm'
                  : 'bg-card border border-border/30 shadow-sm rounded-bl-md'
              }`}
            >
              {message.type === 'ai' && (
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 gradient-primary rounded-lg flex items-center justify-center">
                    <Bot className="w-3 h-3 text-primary-foreground" />
                  </div>
                  <span className="text-xs font-semibold text-primary">TripSync AI</span>
                </div>
              )}
              <p className={`text-sm whitespace-pre-line leading-relaxed ${message.type === 'ai' ? 'text-foreground' : ''}`}>
                {message.content}
              </p>
              
              {message.actions && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {message.actions.map(({ label, icon: Icon }) => (
                    <button
                      key={label}
                      onClick={() => handleQuickAction(label)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/8 rounded-xl text-xs font-semibold text-primary hover:bg-primary/15 border border-primary/10 transition-all duration-200"
                    >
                      <Icon className="w-3 h-3" />
                      {label}
                    </button>
                  ))}
                </div>
              )}
              
              <p className={`text-[10px] mt-2 ${message.type === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                {message.timestamp}
              </p>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start animate-fade-in">
            <div className="bg-card border border-border/30 shadow-sm rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 gradient-primary rounded-lg flex items-center justify-center">
                  <Bot className="w-3 h-3 text-primary-foreground" />
                </div>
                <div className="flex gap-1.5">
                  <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-card border-t border-border/50 shadow-chat">
        <div className="flex items-center gap-2">
          <button className="w-10 h-10 rounded-xl bg-muted/50 border border-border/30 flex items-center justify-center text-primary hover:bg-primary/10 transition-colors">
            <Mic className="w-5 h-5" />
          </button>
          <div className="flex-1 relative">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask TripSync AI..."
              className="w-full px-4 py-3 pr-4 rounded-2xl bg-muted/30 border border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 outline-none text-sm"
            />
          </div>
          <Button
            onClick={handleSend}
            disabled={!inputValue.trim()}
            className="w-10 h-10 p-0 rounded-xl gradient-primary shadow-glow hover:shadow-xl transition-shadow"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AIChatScreen;
