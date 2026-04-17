import React, { useEffect, useMemo, useRef, useState } from 'react';
import { X, MessageCircle, UserCheck, UserPlus, Send, ChevronLeft, Check, CheckCheck, Clock, Users, Smile, Image as ImageIcon, Loader2, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { compressImage } from '@/lib/imageCompression';

interface MessagesPanelProps {
  isOpen: boolean;
  onClose: () => void;
  targetUserId?: string | null;
}

interface ChatMessage {
  id: string;
  senderId: string;
  content: string;
  timestamp: string;
  readAt: string | null;
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

interface ChatListItem {
  id: string;
  name: string;
  avatar: string;
  userId: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
}

const EMOJI_LIST = ['😀','😂','😍','🥰','😎','🤩','😘','🥳','✈️','🏖️','🏔️','🌍','🎉','❤️','🔥','👍','👋','🙏','💯','⭐','🌅','🗺️','🧳','🏕️','🚀','🍕','☕','🎶','📸','🌸'];

const MessagesPanel: React.FC<MessagesPanelProps> = ({ isOpen, onClose, targetUserId }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'messages' | 'requests'>('messages');
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [selectedChatUserId, setSelectedChatUserId] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [chatMessages, setChatMessages] = useState<Record<string, ChatMessage[]>>({});
  const [acceptedChats, setAcceptedChats] = useState<ChatListItem[]>([]);
  const [tripRequests, setTripRequests] = useState<TripRequest[]>([]);
  const [showEmojis, setShowEmojis] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [notConnected, setNotConnected] = useState(false);
  const [notConnectedProfile, setNotConnectedProfile] = useState<any>(null);
  const [selectedChatProfile, setSelectedChatProfile] = useState<{ display_name: string; avatar_url: string | null } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const pendingRequests = useMemo(() => tripRequests.filter((r) => r.status === 'pending'), [tripRequests]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => { scrollToBottom(); }, [chatMessages, selectedChat]);

  const checkFriendship = async (otherUserId: string): Promise<boolean> => {
    if (!user) return false;
    const { data } = await supabase
      .from('follows')
      .select('status')
      .or(`and(follower_id.eq.${user.id},following_id.eq.${otherUserId}),and(follower_id.eq.${otherUserId},following_id.eq.${user.id})`)
      .eq('status', 'accepted');
    return (data || []).length > 0;
  };

  const findOrCreateConversation = async (otherUserId: string) => {
    if (!user) return null;

    const { data: mine } = await supabase.from('conversation_participants').select('conversation_id').eq('user_id', user.id);
    const { data: theirs } = await supabase.from('conversation_participants').select('conversation_id').eq('user_id', otherUserId);

    const myIds = new Set((mine || []).map((m: any) => m.conversation_id));
    const existing = (theirs || []).find((t: any) => myIds.has(t.conversation_id));
    if (existing) return existing.conversation_id as string;

    const { data: conversation, error: convError } = await supabase.from('conversations').insert({ created_by: user.id }).select('id').single();
    if (convError || !conversation) return null;

    const conversationId = (conversation as any).id;
    await supabase.from('conversation_participants').insert([
      { conversation_id: conversationId, user_id: user.id },
      { conversation_id: conversationId, user_id: otherUserId },
    ]);

    return conversationId;
  };

  const loadMessagesForConversation = async (conversationId: string) => {
    const { data } = await supabase
      .from('direct_messages')
      .select('id,sender_id,content,created_at,read_at')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    const mapped = ((data || []) as any[]).map((m) => ({
      id: m.id,
      senderId: m.sender_id,
      content: m.content,
      timestamp: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      readAt: m.read_at,
    }));

    setChatMessages((prev) => ({ ...prev, [conversationId]: mapped }));

    // Mark unread messages from others as read
    if (user) {
      const unread = ((data || []) as any[]).filter((m) => m.sender_id !== user.id && !m.read_at);
      if (unread.length > 0) {
        const ids = unread.map((m) => m.id);
        await supabase.from('direct_messages').update({ read_at: new Date().toISOString() } as any).in('id', ids);
      }
    }
  };

  const loadData = async () => {
    if (!user) return;

    const { data: incoming } = await supabase
      .from('follows')
      .select('id,follower_id,status,created_at,profiles!follows_follower_id_fkey(display_name,avatar_url)')
      .eq('following_id', user.id)
      .in('status', ['pending', 'accepted']);

    const reqs: TripRequest[] = ((incoming || []) as any[])
      .filter((r) => r.status === 'pending')
      .map((r) => ({
        id: r.id,
        userId: r.follower_id,
        userName: r.profiles?.display_name || 'Traveler',
        userAvatar: r.profiles?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&h=120&fit=crop&crop=face',
        message: 'Sent you a follow request',
        status: 'pending',
        timestamp: new Date(r.created_at).toLocaleString(),
      }));

    setTripRequests(reqs);

    const { data: acceptedRelations } = await supabase
      .from('follows')
      .select('follower_id,following_id,status')
      .eq('status', 'accepted')
      .or(`follower_id.eq.${user.id},following_id.eq.${user.id}`);

    const otherUserIds = [...new Set(((acceptedRelations || []) as any[]).map((r) => (r.follower_id === user.id ? r.following_id : r.follower_id)))];

    if (!otherUserIds.length) {
      setAcceptedChats([]);
      return;
    }

    const { data: profileRows } = await supabase.from('profiles').select('id,display_name,avatar_url').in('id', otherUserIds);
    const profileMap: Record<string, any> = {};
    (profileRows || []).forEach((p: any) => { profileMap[p.id] = p; });

    const chats: ChatListItem[] = [];

    for (const otherId of otherUserIds) {
      const conversationId = await findOrCreateConversation(otherId);
      if (!conversationId) continue;

      const { data: lastMsg } = await supabase
        .from('direct_messages')
        .select('content,created_at')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      // Count unread
      const { count: unreadCount } = await supabase
        .from('direct_messages')
        .select('*', { count: 'exact', head: true })
        .eq('conversation_id', conversationId)
        .neq('sender_id', user.id)
        .is('read_at', null);

      chats.push({
        id: conversationId,
        userId: otherId,
        name: profileMap[otherId]?.display_name || 'Traveler',
        avatar: profileMap[otherId]?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&h=120&fit=crop&crop=face',
        lastMessage: (lastMsg as any)?.content || 'Start chatting',
        timestamp: (lastMsg as any)?.created_at ? new Date((lastMsg as any).created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'now',
        unreadCount: unreadCount || 0,
      });
    }

    setAcceptedChats(chats);
  };

  useEffect(() => {
    if (!isOpen || !user) return;
    setNotConnected(false);
    setNotConnectedProfile(null);
    loadData();

    const channel = supabase
      .channel('messages-panel-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'follows' }, () => loadData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'direct_messages' }, () => {
        loadData();
        if (selectedChat) loadMessagesForConversation(selectedChat);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isOpen, user, selectedChat]);

  // Auto-open chat with target user when specified
  useEffect(() => {
    if (!isOpen || !user || !targetUserId) return;
    const autoOpen = async () => {
      // Check if they are friends
      const isFriend = await checkFriendship(targetUserId);
      if (!isFriend) {
        // Load their profile to show "connect first"
        const { data: prof } = await supabase.from('profiles').select('display_name,avatar_url').eq('id', targetUserId).maybeSingle();
        setNotConnected(true);
        setNotConnectedProfile(prof);
        setSelectedChat(null);
        return;
      }
      setNotConnected(false);
      setNotConnectedProfile(null);
      const conversationId = await findOrCreateConversation(targetUserId);
      if (conversationId) {
        setSelectedChatUserId(targetUserId);
        await openChat(conversationId, targetUserId);
      }
    };
    autoOpen();
  }, [isOpen, targetUserId, user]);

  const handleAcceptRequest = async (requestId: string) => {
    const request = tripRequests.find((r) => r.id === requestId);
    if (!request || !user) return;

    const { error } = await supabase.from('follows').update({ status: 'accepted' }).eq('id', requestId).eq('following_id', user.id);
    if (error) {
      toast({ title: 'Accept failed', description: error.message, variant: 'destructive' });
      return;
    }

    await findOrCreateConversation(request.userId);
    toast({ title: 'Request accepted ✅' });
    await loadData();
  };

  const handleRejectRequest = async (requestId: string) => {
    await supabase.from('follows').update({ status: 'rejected' }).eq('id', requestId);
    await loadData();
  };

  const openChat = async (chatId: string, userId?: string) => {
    setSelectedChat(chatId);
    if (userId) setSelectedChatUserId(userId);
    setShowEmojis(false);
    await loadMessagesForConversation(chatId);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !selectedChat || !user) return;

    const text = inputValue.trim();
    setInputValue('');
    setShowEmojis(false);

    const { error } = await supabase.from('direct_messages').insert({
      conversation_id: selectedChat,
      sender_id: user.id,
      content: text,
    });

    if (error) {
      toast({ title: 'Message failed', description: error.message, variant: 'destructive' });
      return;
    }

    await loadMessagesForConversation(selectedChat);
  };

  const handleMediaUpload = async (file: File) => {
    if (!user || !selectedChat) return;
    setUploading(true);
    try {
      const processed = file.type.startsWith('image/') ? await compressImage(file) : file;
      const ext = processed.name.split('.').pop() || 'jpg';
      const path = `${user.id}/dm-${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage.from('post-media').upload(path, processed, { upsert: true });
      if (uploadError) throw uploadError;
      const publicUrl = supabase.storage.from('post-media').getPublicUrl(path).data.publicUrl;

      await supabase.from('direct_messages').insert({
        conversation_id: selectedChat,
        sender_id: user.id,
        content: publicUrl,
      });

      await loadMessagesForConversation(selectedChat);
    } catch (e) {
      toast({ title: 'Upload failed', variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const isMediaUrl = (content: string) => {
    return content.match(/\.(jpg|jpeg|png|gif|webp|mp4|webm|mov)(\?.*)?$/i) || content.includes('supabase.co/storage');
  };

  const isVideoUrl = (content: string) => content.match(/\.(mp4|webm|mov)(\?.*)?$/i);

  if (!isOpen) return null;

  // "Connect first" screen
  if (notConnected && targetUserId) {
    return (
      <div className="fixed top-20 bottom-6 right-6 z-40 w-96 bg-background rounded-2xl shadow-2xl border border-border flex flex-col overflow-hidden animate-fade-in">
        <div className="px-4 py-3 flex items-center justify-between border-b border-border bg-card">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center"><MessageCircle className="w-5 h-5 text-white" /></div>
            <h3 className="font-semibold text-foreground">Messages</h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center"><X className="w-4 h-4" /></button>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
            {notConnectedProfile?.avatar_url ? (
              <img src={notConnectedProfile.avatar_url} alt="" className="w-20 h-20 rounded-full object-cover" />
            ) : (
              <Lock className="w-10 h-10 text-muted-foreground" />
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">{notConnectedProfile?.display_name || 'This user'}</h3>
            <p className="text-sm text-muted-foreground mt-2">You need to be connected (mutual follow accepted) to start a chat.</p>
          </div>
          <div className="w-full p-4 bg-primary/5 rounded-2xl border border-primary/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                <UserPlus className="w-5 h-5 text-primary" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-foreground">Connect First</p>
                <p className="text-xs text-muted-foreground">Send a follow request and wait for acceptance to chat</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Chat view
  if (selectedChat) {
    const chat = acceptedChats.find((c) => c.id === selectedChat);
    const msgs = chatMessages[selectedChat] || [];

    return (
      <div className="fixed top-20 bottom-6 right-6 z-40 w-96 bg-background rounded-2xl shadow-2xl border border-border flex flex-col overflow-hidden animate-fade-in">
        <div className="px-4 py-3 flex items-center gap-3 border-b border-border bg-card">
          <button onClick={() => { setSelectedChat(null); setSelectedChatUserId(null); setShowEmojis(false); }} className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center"><ChevronLeft className="w-5 h-5" /></button>
          <img src={chat?.avatar} alt={chat?.name} className="w-10 h-10 rounded-full object-cover" />
          <div className="flex-1"><h3 className="font-semibold text-foreground text-sm">{chat?.name}</h3><p className="text-xs text-success flex items-center gap-1"><span className="w-1.5 h-1.5 bg-success rounded-full" />Connected</p></div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {msgs.length === 0 && (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">No messages yet. Say hello! 👋</p>
            </div>
          )}
          {msgs.map((msg, idx) => {
            const isMe = msg.senderId === user?.id;
            const isMedia = isMediaUrl(msg.content);
            const isVideo = isVideoUrl(msg.content);
            // Check if next message from same sender has read_at (for last message blue tick)
            const isLastFromMe = isMe && (idx === msgs.length - 1 || msgs[idx + 1]?.senderId !== user?.id);

            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] rounded-2xl overflow-hidden ${isMe ? 'gradient-primary text-primary-foreground rounded-br-md' : 'bg-muted text-foreground rounded-bl-md'}`}>
                  {isMedia ? (
                    isVideo ? (
                      <video src={msg.content} className="w-full max-h-48 object-cover" controls />
                    ) : (
                      <img src={msg.content} alt="Shared media" className="w-full max-h-48 object-cover cursor-pointer" onClick={() => window.open(msg.content, '_blank')} />
                    )
                  ) : (
                    <p className="text-sm px-4 py-2">{msg.content}</p>
                  )}
                  <div className={`flex items-center gap-1 px-3 pb-1.5 ${isMe ? 'justify-end' : ''}`}>
                    <span className={`text-[10px] ${isMe ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>{msg.timestamp}</span>
                    {isMe && isLastFromMe && (
                      msg.readAt ? (
                        <CheckCheck className="w-3.5 h-3.5 text-blue-300" />
                      ) : (
                        <Check className="w-3.5 h-3.5 text-primary-foreground/50" />
                      )
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Emoji picker */}
        {showEmojis && (
          <div className="px-3 py-2 bg-card border-t border-border">
            <div className="flex flex-wrap gap-1.5">
              {EMOJI_LIST.map((emoji) => (
                <button key={emoji} onClick={() => { setInputValue(prev => prev + emoji); }} className="w-8 h-8 text-lg hover:bg-muted rounded-lg flex items-center justify-center transition-colors">
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="p-3 bg-card border-t border-border">
          <div className="flex items-center gap-2">
            <button onClick={() => setShowEmojis(!showEmojis)} className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${showEmojis ? 'bg-primary/10 text-primary' : 'hover:bg-muted text-muted-foreground'}`}>
              <Smile className="w-5 h-5" />
            </button>
            <button onClick={() => fileInputRef.current?.click()} disabled={uploading} className="w-10 h-10 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground transition-colors">
              {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ImageIcon className="w-5 h-5" />}
            </button>
            <input ref={fileInputRef} type="file" accept="image/*,video/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleMediaUpload(f); }} />
            <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} placeholder="Type a message..." className="flex-1 h-10 px-4 bg-muted rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            <Button onClick={handleSendMessage} disabled={!inputValue.trim()} size="sm" className="w-10 h-10 p-0 rounded-full gradient-primary"><Send className="w-4 h-4" /></Button>
          </div>
        </div>
      </div>
    );
  }

  // Chat list view
  return (
    <div className="fixed top-20 bottom-6 right-6 z-40 w-96 bg-background rounded-2xl shadow-2xl border border-border flex flex-col overflow-hidden animate-fade-in">
      <div className="px-4 py-3 flex items-center justify-between border-b border-border bg-card">
        <div className="flex items-center gap-2"><div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center"><MessageCircle className="w-5 h-5 text-white" /></div><div><h3 className="font-semibold text-foreground">Messages</h3><p className="text-xs text-muted-foreground">Real follow requests & DMs</p></div></div>
        <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center"><X className="w-4 h-4" /></button>
      </div>

      <div className="flex border-b border-border">
        <button onClick={() => setActiveTab('messages')} className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${activeTab === 'messages' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}`}><div className="flex items-center justify-center gap-2"><MessageCircle className="w-4 h-4" />Chats</div></button>
        <button onClick={() => setActiveTab('requests')} className={`flex-1 px-4 py-3 text-sm font-medium transition-colors relative ${activeTab === 'requests' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}`}><div className="flex items-center justify-center gap-2"><Users className="w-4 h-4" />Requests{pendingRequests.length > 0 && <span className="w-5 h-5 bg-secondary text-secondary-foreground text-xs rounded-full flex items-center justify-center">{pendingRequests.length}</span>}</div></button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {activeTab === 'messages' ? (
          <div className="divide-y divide-border">
            {acceptedChats.length === 0 ? (
              <div className="p-8 text-center"><div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center"><MessageCircle className="w-8 h-8 text-muted-foreground" /></div><p className="text-muted-foreground text-sm">No conversations yet</p><p className="text-xs text-muted-foreground mt-1">Connect with travelers to start chatting</p></div>
            ) : (
              acceptedChats.map((chat) => (
                <button key={chat.id} onClick={() => openChat(chat.id, chat.userId)} className="w-full p-4 flex items-center gap-3 hover:bg-muted/50 transition-colors text-left">
                  <div className="relative">
                    <img src={chat.avatar} alt={chat.name} className="w-12 h-12 rounded-full object-cover" />
                    {chat.unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-secondary text-white text-[10px] font-bold rounded-full flex items-center justify-center">{chat.unreadCount}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className={`font-medium text-sm ${chat.unreadCount > 0 ? 'text-foreground font-semibold' : 'text-foreground'}`}>{chat.name}</h4>
                      <span className="text-xs text-muted-foreground">{chat.timestamp}</span>
                    </div>
                    <p className={`text-sm truncate ${chat.unreadCount > 0 ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                      {chat.lastMessage.includes('supabase.co/storage') ? '📷 Photo' : chat.lastMessage}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        ) : (
          <div className="divide-y divide-border">
            {tripRequests.length === 0 ? (
              <div className="p-8 text-center"><div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center"><UserPlus className="w-8 h-8 text-muted-foreground" /></div><p className="text-muted-foreground text-sm">No follow requests</p></div>
            ) : (
              tripRequests.map((request) => (
                <div key={request.id} className="p-4">
                  <div className="flex items-start gap-3">
                    <img src={request.userAvatar} alt={request.userName} className="w-12 h-12 rounded-full object-cover" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1"><h4 className="font-medium text-foreground text-sm">{request.userName}</h4><span className="text-xs text-muted-foreground">{request.timestamp}</span></div>
                      <p className="text-sm text-muted-foreground mb-3">{request.message}</p>
                      {request.status === 'pending' ? (
                        <div className="flex gap-2">
                          <Button onClick={() => handleAcceptRequest(request.id)} size="sm" className="flex-1 h-8 gradient-primary text-xs"><Check className="w-3 h-3 mr-1" />Accept</Button>
                          <Button onClick={() => handleRejectRequest(request.id)} variant="outline" size="sm" className="flex-1 h-8 text-xs">Decline</Button>
                        </div>
                      ) : request.status === 'accepted' ? (
                        <div className="flex items-center gap-2 text-success text-sm"><UserCheck className="w-4 h-4" /><span>Request Accepted — Chat enabled</span></div>
                      ) : (
                        <div className="flex items-center gap-2 text-muted-foreground text-sm"><Clock className="w-4 h-4" /><span>Request Declined</span></div>
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
