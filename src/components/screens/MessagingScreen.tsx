import React, { useState } from 'react';
import { ArrowLeft, Send, Shield, Phone, Video, MoreVertical, Image, Smile } from 'lucide-react';
import { dummyMessages, dummyProfiles } from '@/data/dummyProfiles';
import { Button } from '@/components/ui/button';

interface MessagingScreenProps {
  onBack: () => void;
  chatWithId?: string;
}

const MessagingScreen: React.FC<MessagingScreenProps> = ({ onBack, chatWithId = '2' }) => {
  const [messages, setMessages] = useState(dummyMessages);
  const [inputValue, setInputValue] = useState('');
  const chatUser = dummyProfiles.find(p => p.id === chatWithId) || dummyProfiles[1];

  const handleSend = () => {
    if (!inputValue.trim()) return;
    
    const newMessage = {
      id: Date.now().toString(),
      senderId: 'me',
      content: inputValue,
      timestamp: 'Just now',
      isMe: true,
    };
    
    setMessages([...messages, newMessage]);
    setInputValue('');
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="glass-effect px-4 py-3 flex items-center gap-3 border-b border-border">
        <button onClick={onBack} className="p-2 -ml-2 hover:bg-muted rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        
        <div className="relative">
          <img
            src={chatUser.avatar}
            alt={chatUser.name}
            className="w-10 h-10 rounded-full object-cover"
          />
          {chatUser.isOnline && <span className="status-online" />}
        </div>
        
        <div className="flex-1">
          <h2 className="font-semibold text-foreground">{chatUser.name}</h2>
          <p className="text-xs text-success flex items-center gap-1">
            <span className="w-2 h-2 bg-success rounded-full" />
            Online
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <button className="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
            <Phone className="w-4 h-4 text-foreground" />
          </button>
          <button className="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
            <Video className="w-4 h-4 text-foreground" />
          </button>
          <button className="w-9 h-9 rounded-full bg-muted flex items-center justify-center">
            <MoreVertical className="w-4 h-4 text-foreground" />
          </button>
        </div>
      </div>

      {/* Safety Banner */}
      <div className="mx-4 mt-3 p-3 bg-primary/10 rounded-xl flex items-center gap-3">
        <Shield className="w-5 h-5 text-primary flex-shrink-0" />
        <p className="text-xs text-foreground">
          <span className="font-medium">Secure Chat:</span> Messages are enabled only after mutual acceptance. 
          Your safety is our priority.
        </p>
      </div>

      {/* Match Score Badge */}
      <div className="mx-4 mt-3 flex justify-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary/10 to-accent/10 rounded-full">
          <span className="text-sm font-medium text-foreground">Travel Match Score:</span>
          <span className="text-sm font-bold text-primary">{chatUser.matchScore}%</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.isMe ? 'justify-end' : 'justify-start'} animate-fade-in`}
          >
            {!message.isMe && (
              <img
                src={chatUser.avatar}
                alt={chatUser.name}
                className="w-8 h-8 rounded-full object-cover mr-2 flex-shrink-0"
              />
            )}
            <div
              className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                message.isMe
                  ? 'gradient-primary text-primary-foreground rounded-br-md'
                  : 'bg-muted text-foreground rounded-bl-md'
              }`}
            >
              <p className="text-sm">{message.content}</p>
              <p className={`text-[10px] mt-1 ${message.isMe ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                {message.timestamp}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="p-4 bg-card border-t border-border">
        <div className="flex items-center gap-2">
          <button className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
            <Image className="w-5 h-5" />
          </button>
          <div className="flex-1 relative">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type a message..."
              className="input-field pr-10"
            />
            <button className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              <Smile className="w-5 h-5" />
            </button>
          </div>
          <Button
            onClick={handleSend}
            disabled={!inputValue.trim()}
            className="w-10 h-10 p-0 rounded-full gradient-primary shadow-glow"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MessagingScreen;
