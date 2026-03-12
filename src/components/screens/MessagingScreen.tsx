import React, { useState } from 'react';
import { ArrowLeft, Send, Shield, Phone, Video, MoreVertical, Image, Smile, Lock } from 'lucide-react';
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
      <div className="glass-effect px-4 py-3 flex items-center gap-3 border-b border-border/50">
        <button onClick={onBack} className="p-2 -ml-2 hover:bg-muted rounded-xl transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        
        <div className="relative">
          <div className="p-[2px] gradient-primary rounded-xl">
            <img
              src={chatUser.avatar}
              alt={chatUser.name}
              className="w-10 h-10 rounded-[10px] object-cover border-2 border-background"
            />
          </div>
          {chatUser.isOnline && <span className="status-online !bottom-0 !right-0" />}
        </div>
        
        <div className="flex-1">
          <h2 className="font-semibold text-foreground">{chatUser.name}</h2>
          <p className="text-xs text-success flex items-center gap-1">
            <span className="w-2 h-2 bg-success rounded-full animate-pulse" />
            Online
          </p>
        </div>
        
        <div className="flex items-center gap-1.5">
          <button className="w-9 h-9 rounded-xl bg-card border border-border/50 flex items-center justify-center hover:shadow-sm transition-shadow">
            <Phone className="w-4 h-4 text-foreground" />
          </button>
          <button className="w-9 h-9 rounded-xl bg-card border border-border/50 flex items-center justify-center hover:shadow-sm transition-shadow">
            <Video className="w-4 h-4 text-foreground" />
          </button>
          <button className="w-9 h-9 rounded-xl bg-card border border-border/50 flex items-center justify-center hover:shadow-sm transition-shadow">
            <MoreVertical className="w-4 h-4 text-foreground" />
          </button>
        </div>
      </div>

      {/* Safety Banner */}
      <div className="mx-4 mt-3 p-3 bg-gradient-to-r from-primary/8 to-accent/8 rounded-2xl flex items-center gap-3 border border-primary/10">
        <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
          <Shield className="w-4 h-4 text-primary" />
        </div>
        <p className="text-xs text-foreground leading-relaxed">
          <span className="font-semibold">Secure Chat:</span> Messages are enabled only after mutual acceptance. 
          Your safety is our priority.
        </p>
      </div>

      {/* E2E Encryption Badge */}
      <div className="mx-4 mt-2 flex justify-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-muted/40 rounded-full border border-border/30">
          <Lock className="w-3 h-3 text-primary" />
          <span className="text-[11px] text-muted-foreground font-medium">Messages are end-to-end encrypted</span>
        </div>
      </div>

      {/* Match Score Badge */}
      <div className="mx-4 mt-2 flex justify-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary/8 to-accent/8 rounded-full border border-primary/10">
          <span className="text-sm font-medium text-foreground">Travel Match:</span>
          <span className="text-sm font-bold text-gradient">{chatUser.matchScore}%</span>
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
                className="w-8 h-8 rounded-xl object-cover mr-2 flex-shrink-0"
              />
            )}
            <div
              className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                message.isMe
                  ? 'gradient-primary text-primary-foreground rounded-br-md shadow-sm'
                  : 'bg-card text-foreground rounded-bl-md border border-border/30 shadow-sm'
              }`}
            >
              <p className="text-sm leading-relaxed">{message.content}</p>
              <p className={`text-[10px] mt-1 ${message.isMe ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                {message.timestamp}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="p-4 bg-card border-t border-border/50 shadow-chat">
        <div className="flex items-center gap-2">
          <button className="w-10 h-10 rounded-xl bg-muted/50 border border-border/30 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
            <Image className="w-5 h-5" />
          </button>
          <div className="flex-1 relative">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type a message..."
              className="w-full px-4 py-3 pr-10 rounded-2xl bg-muted/30 border border-border/50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 outline-none text-sm"
            />
            <button className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
              <Smile className="w-5 h-5" />
            </button>
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

export default MessagingScreen;
