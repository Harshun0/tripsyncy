import React, { useState } from 'react';
import { X, MessageCircle, UserCheck, UserPlus, Send, ChevronLeft, Check, Clock, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { dummyProfiles } from '@/data/dummyProfiles';

interface MessagesPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ChatMessage {
  id: string;
  senderId: string;
  content: string;
  timestamp: string;
}

interface TripRequest {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  message: string;
  status: 'pending' | 'accepted' | 'rejected';
  timestamp: string;
}

const MessagesPanel: React.FC<MessagesPanelProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'messages' | 'requests'>('messages');
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [chatMessages, setChatMessages] = useState<Record<string, ChatMessage[]>>({
    '1': [
      { id: '1', senderId: 'other', content: 'Hey! Excited about the trip!', timestamp: '10:30 AM' },
      { id: '2', senderId: 'me', content: 'Same here! Which dates work for you?', timestamp: '10:32 AM' },
      { id: '3', senderId: 'other', content: 'I was thinking 15th to 20th', timestamp: '10:35 AM' },
      { id: '4', senderId: 'other', content: "Sounds great! Let's plan the itinerary", timestamp: '10:36 AM' },
    ],
    '2': [
      { id: '1', senderId: 'me', content: 'Hey, how much did we spend yesterday?', timestamp: '9:00 AM' },
      { id: '2', senderId: 'other', content: "I'll share the expense details", timestamp: '9:15 AM' },
    ],
  });

  const [acceptedChats, setAcceptedChats] = useState([
    {
      id: '1',
      name: 'Priya Sharma',
      avatar: dummyProfiles[0]?.avatar || '',
      lastMessage: "Sounds great! Let's plan the itinerary",
      unread: 2,
      timestamp: '2m ago',
    },
    {
      id: '2',
      name: 'Arjun Patel',
      avatar: dummyProfiles[1]?.avatar || '',
      lastMessage: "I'll share the expense details",
      unread: 0,
      timestamp: '1h ago',
    },
  ]);

  const [tripRequests, setTripRequests] = useState<TripRequest[]>([
    {
      id: '1',
      userId: '3',
      userName: 'Ananya Roy',
      userAvatar: dummyProfiles[2]?.avatar || '',
      message: 'Hey! I saw we have 87% match. Would love to join your Goa trip!',
      status: 'pending',
      timestamp: '30m ago',
    },
    {
      id: '2',
      userId: '4',
      userName: 'Rahul Mehta',
      userAvatar: dummyProfiles[3]?.avatar || '',
      message: 'Looking for travel buddies for Ladakh next month',
      status: 'pending',
      timestamp: '2h ago',
    },
    {
      id: '3',
      userId: '5',
      userName: 'Sneha Kapoor',
      userAvatar: dummyProfiles[4]?.avatar || '',
      message: 'Your photography interests match mine! Want to explore Jaipur together?',
      status: 'pending',
      timestamp: '5h ago',
    },
  ]);

  const handleAcceptRequest = (requestId: string) => {
    const request = tripRequests.find(r => r.id === requestId);
    if (!request) return;
    
    setTripRequests(prev =>
      prev.map(req =>
        req.id === requestId ? { ...req, status: 'accepted' as const } : req
      )
    );

    // Add to accepted chats
    const newChatId = `req-${requestId}`;
    setAcceptedChats(prev => [
      {
        id: newChatId,
        name: request.userName,
        avatar: request.userAvatar,
        lastMessage: 'Request accepted! Start chatting.',
        unread: 0,
        timestamp: 'Just now',
      },
      ...prev,
    ]);
    setChatMessages(prev => ({
      ...prev,
      [newChatId]: [
        {
          id: '1',
          senderId: 'system',
          content: '🎉 Trip request accepted! You can now chat.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ],
    }));
  };

  const handleRejectRequest = (requestId: string) => {
    setTripRequests(prev =>
      prev.map(req =>
        req.id === requestId ? { ...req, status: 'rejected' as const } : req
      )
    );
  };

  const handleSendMessage = () => {
    if (!inputValue.trim() || !selectedChat) return;
    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      senderId: 'me',
      content: inputValue,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setChatMessages(prev => ({
      ...prev,
      [selectedChat]: [...(prev[selectedChat] || []), newMsg],
    }));
    setAcceptedChats(prev =>
      prev.map(c =>
        c.id === selectedChat ? { ...c, lastMessage: inputValue, timestamp: 'Just now' } : c
      )
    );
    setInputValue('');
  };

  const pendingRequests = tripRequests.filter(r => r.status === 'pending');

  if (!isOpen) return null;

  // Chat View
  if (selectedChat) {
    const chat = acceptedChats.find(c => c.id === selectedChat);
    const msgs = chatMessages[selectedChat] || [];

    return (
      <div className="fixed top-20 bottom-6 right-6 z-40 w-96 bg-background rounded-2xl shadow-2xl border border-border flex flex-col overflow-hidden animate-fade-in">
        {/* Chat Header */}
        <div className="px-4 py-3 flex items-center gap-3 border-b border-border bg-card">
          <button
            onClick={() => setSelectedChat(null)}
            className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <img src={chat?.avatar} alt={chat?.name} className="w-10 h-10 rounded-full object-cover" />
          <div className="flex-1">
            <h3 className="font-semibold text-foreground text-sm">{chat?.name}</h3>
            <p className="text-xs text-success flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-success rounded-full" />
              Online
            </p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {msgs.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.senderId === 'me' ? 'justify-end' : msg.senderId === 'system' ? 'justify-center' : 'justify-start'}`}
            >
              {msg.senderId === 'system' ? (
                <div className="px-4 py-2 bg-primary/10 rounded-full text-xs text-primary font-medium">
                  {msg.content}
                </div>
              ) : (
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                    msg.senderId === 'me'
                      ? 'gradient-primary text-primary-foreground rounded-br-md'
                      : 'bg-muted text-foreground rounded-bl-md'
                  }`}
                >
                  <p className="text-sm">{msg.content}</p>
                  <p className={`text-[10px] mt-1 ${msg.senderId === 'me' ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                    {msg.timestamp}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="p-3 bg-card border-t border-border">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Type a message..."
              className="flex-1 h-10 px-4 bg-muted rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputValue.trim()}
              size="sm"
              className="w-10 h-10 p-0 rounded-full gradient-primary"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Main Panel
  return (
    <div className="fixed top-20 bottom-6 right-6 z-40 w-96 bg-background rounded-2xl shadow-2xl border border-border flex flex-col overflow-hidden animate-fade-in">
      {/* Header */}
      <div className="px-4 py-3 flex items-center justify-between border-b border-border bg-card">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center">
            <MessageCircle className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Messages</h3>
            <p className="text-xs text-muted-foreground">Stay connected with travelers</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border">
        <button
          onClick={() => setActiveTab('messages')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'messages'
              ? 'text-primary border-b-2 border-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <MessageCircle className="w-4 h-4" />
            Chats
          </div>
        </button>
        <button
          onClick={() => setActiveTab('requests')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors relative ${
            activeTab === 'requests'
              ? 'text-primary border-b-2 border-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <Users className="w-4 h-4" />
            Requests
            {pendingRequests.length > 0 && (
              <span className="w-5 h-5 bg-secondary text-white text-xs rounded-full flex items-center justify-center">
                {pendingRequests.length}
              </span>
            )}
          </div>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'messages' ? (
          <div className="divide-y divide-border">
            {acceptedChats.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                  <MessageCircle className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground text-sm">No conversations yet</p>
                <p className="text-muted-foreground text-xs mt-1">Accept a trip request to start chatting</p>
              </div>
            ) : (
              acceptedChats.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => setSelectedChat(chat.id)}
                  className="w-full p-4 flex items-center gap-3 hover:bg-muted/50 transition-colors text-left"
                >
                  <div className="relative">
                    <img src={chat.avatar} alt={chat.name} className="w-12 h-12 rounded-full object-cover" />
                    {chat.unread > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-white text-xs rounded-full flex items-center justify-center">
                        {chat.unread}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-foreground text-sm">{chat.name}</h4>
                      <span className="text-xs text-muted-foreground">{chat.timestamp}</span>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{chat.lastMessage}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        ) : (
          <div className="divide-y divide-border">
            {tripRequests.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                  <UserPlus className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground text-sm">No trip requests</p>
                <p className="text-muted-foreground text-xs mt-1">Explore travelers to find companions</p>
              </div>
            ) : (
              tripRequests.map((request) => (
                <div key={request.id} className="p-4">
                  <div className="flex items-start gap-3">
                    <img src={request.userAvatar} alt={request.userName} className="w-12 h-12 rounded-full object-cover" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium text-foreground text-sm">{request.userName}</h4>
                        <span className="text-xs text-muted-foreground">{request.timestamp}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{request.message}</p>
                      
                      {request.status === 'pending' ? (
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleAcceptRequest(request.id)}
                            size="sm"
                            className="flex-1 h-8 gradient-primary text-xs"
                          >
                            <Check className="w-3 h-3 mr-1" />
                            Accept
                          </Button>
                          <Button
                            onClick={() => handleRejectRequest(request.id)}
                            variant="outline"
                            size="sm"
                            className="flex-1 h-8 text-xs"
                          >
                            Decline
                          </Button>
                        </div>
                      ) : request.status === 'accepted' ? (
                        <div className="flex items-center gap-2 text-success text-sm">
                          <UserCheck className="w-4 h-4" />
                          <span>Request Accepted — Chat enabled</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-muted-foreground text-sm">
                          <Clock className="w-4 h-4" />
                          <span>Request Declined</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesPanel;
