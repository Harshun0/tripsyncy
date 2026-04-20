import React, { useEffect, useMemo, useRef, useState } from 'react';
import { X, MessageCircle, UserCheck, UserPlus, Send, ChevronLeft, Check, CheckCheck, Clock, Users, Smile, Image as ImageIcon, Loader2, Lock, Mic, Square, Plus, Settings, UserMinus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { compressImage } from '@/lib/imageCompression';
import { decryptDirectMessageContent, encryptDirectMessageContent } from '@/lib/directMessageEncryption';
import { ensureDirectConversation } from '@/services/directMessagesService';

interface MessagesPanelProps {
  isOpen: boolean;
  onClose: () => void;
  targetUserId?: string | null;
}

interface ChatMessage {
  id: string;
  senderId: string;
  senderName?: string;
  senderAvatar?: string;
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
  lastMessageAt: number;
}

interface GroupListItem {
  id: string;
  title: string;
  memberCount: number;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  lastMessageAt: number;
  createdBy: string;
}

interface Friend {
  id: string;
  display_name: string;
  avatar_url: string | null;
}

const EMOJI_LIST = ['😀','😂','😍','🥰','😎','🤩','😘','🥳','✈️','🏖️','🏔️','🌍','🎉','❤️','🔥','👍','👋','🙏','💯','⭐','🌅','🗺️','🧳','🏕️','🚀','🍕','☕','🎶','📸','🌸'];

type TabKey = 'messages' | 'groups' | 'requests';

const MessagesPanel: React.FC<MessagesPanelProps> = ({ isOpen, onClose, targetUserId }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabKey>('messages');

  // Selected conversation state. `selectedIsGroup` decides DM vs group rendering.
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [selectedChatUserId, setSelectedChatUserId] = useState<string | null>(null);
  const [selectedIsGroup, setSelectedIsGroup] = useState(false);

  const [inputValue, setInputValue] = useState('');
  const [chatMessages, setChatMessages] = useState<Record<string, ChatMessage[]>>({});
  const [acceptedChats, setAcceptedChats] = useState<ChatListItem[]>([]);
  const [groups, setGroups] = useState<GroupListItem[]>([]);
  const [tripRequests, setTripRequests] = useState<TripRequest[]>([]);
  const [showEmojis, setShowEmojis] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [notConnected, setNotConnected] = useState(false);
  const [notConnectedProfile, setNotConnectedProfile] = useState<any>(null);
  const [selectedChatProfile, setSelectedChatProfile] = useState<{ display_name: string; avatar_url: string | null } | null>(null);
  const [openingTargetChat, setOpeningTargetChat] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  // Group create / edit modal state
  const [friends, setFriends] = useState<Friend[]>([]);
  const [showGroupModal, setShowGroupModal] = useState<null | { mode: 'create' } | { mode: 'edit'; groupId: string }>(null);
  const [groupTitle, setGroupTitle] = useState('');
  const [selectedFriendIds, setSelectedFriendIds] = useState<Set<string>>(new Set());
  const [groupCurrentMembers, setGroupCurrentMembers] = useState<Friend[]>([]);
  const [savingGroup, setSavingGroup] = useState(false);

  const convToOtherUserIdRef = useRef<Record<string, string>>({});
  const convIsGroupRef = useRef<Record<string, boolean>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingStreamRef = useRef<MediaStream | null>(null);

  const pendingRequests = useMemo(() => tripRequests.filter((r) => r.status === 'pending'), [tripRequests]);

  const scrollToBottom = () => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); };
  useEffect(() => { scrollToBottom(); }, [chatMessages, selectedChat]);

  const stopRecordingTracks = () => {
    recordingStreamRef.current?.getTracks().forEach((track) => track.stop());
    recordingStreamRef.current = null;
    mediaRecorderRef.current = null;
  };

  useEffect(() => () => stopRecordingTracks(), []);

  const resolveOtherUserId = (conversationId: string, fallbackUserId?: string | null) => {
    if (fallbackUserId) return fallbackUserId;
    if (selectedChat === conversationId && selectedChatUserId) return selectedChatUserId;
    const fromMap = convToOtherUserIdRef.current[conversationId];
    if (fromMap) return fromMap;
    return acceptedChats.find((chat) => chat.id === conversationId)?.userId || null;
  };

  const getMessagePreview = (content: string) => {
    if (content.match(/\.(mp4|webm|mov)(\?.*)?$/i)) return '🎥 Video';
    if (content.match(/\.(mp3|wav|m4a|ogg|aac|webm)(\?.*)?$/i) && !content.match(/\.(mp4|webm|mov)(\?.*)?$/i)) return '🎙️ Audio';
    if (content.match(/\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i) || content.includes('supabase.co/storage')) return '📷 Photo';
    return content;
  };

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
    return ensureDirectConversation(otherUserId);
  };

  const decryptForMessage = async (m: any, conversationId: string, isGroup: boolean) => {
    if (isGroup) return m.content; // group messages stored plaintext
    const otherUserId = resolveOtherUserId(conversationId);
    return user && otherUserId ? await decryptDirectMessageContent(m.content, user.id, otherUserId) : m.content;
  };

  const loadMessagesForConversation = async (conversationId: string, otherUserIdArg?: string | null, isGroup?: boolean) => {
    const groupFlag = typeof isGroup === 'boolean' ? isGroup : convIsGroupRef.current[conversationId] || false;

    const { data } = await supabase
      .from('direct_messages')
      .select('id,sender_id,content,created_at,read_at')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    const rows = (data || []) as any[];

    // For groups, fetch sender names so the chat can show "From: …" for each bubble.
    let senderProfiles: Record<string, { display_name: string; avatar_url: string | null }> = {};
    if (groupFlag && rows.length) {
      const senderIds = [...new Set(rows.map((r) => r.sender_id))];
      const { data: profs } = await supabase.from('profiles').select('id,display_name,avatar_url').in('id', senderIds);
      (profs || []).forEach((p: any) => { senderProfiles[p.id] = { display_name: p.display_name, avatar_url: p.avatar_url }; });
    }

    const otherUserId = groupFlag ? null : resolveOtherUserId(conversationId, otherUserIdArg);
    const mapped = await Promise.all(rows.map(async (m) => {
      const content = groupFlag
        ? m.content
        : (user && otherUserId ? await decryptDirectMessageContent(m.content, user.id, otherUserId) : m.content);
      return {
        id: m.id,
        senderId: m.sender_id,
        senderName: groupFlag ? senderProfiles[m.sender_id]?.display_name : undefined,
        senderAvatar: groupFlag ? senderProfiles[m.sender_id]?.avatar_url || undefined : undefined,
        content,
        timestamp: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        readAt: m.read_at,
      } as ChatMessage;
    }));

    setChatMessages((prev) => ({ ...prev, [conversationId]: mapped }));

    if (user) {
      const unread = rows.filter((m) => m.sender_id !== user.id && !m.read_at);
      if (unread.length > 0) {
        const ids = unread.map((m) => m.id);
        await supabase.from('direct_messages').update({ read_at: new Date().toISOString() } as any).in('id', ids);
      }
    }
  };

  const loadFriends = async () => {
    if (!user) return;
    const { data: rels } = await supabase
      .from('follows')
      .select('follower_id,following_id')
      .eq('status', 'accepted')
      .or(`follower_id.eq.${user.id},following_id.eq.${user.id}`);
    const ids = [...new Set(((rels || []) as any[]).map((r) => r.follower_id === user.id ? r.following_id : r.follower_id))];
    if (!ids.length) { setFriends([]); return; }
    const { data: profs } = await supabase.from('profiles').select('id,display_name,avatar_url').in('id', ids);
    setFriends((profs || []) as Friend[]);
  };

  const loadData = async () => {
    if (!user) return;

    // Incoming follow requests
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

    // ALL conversations the user participates in (DMs + groups)
    const { data: myConvParts } = await supabase
      .from('conversation_participants')
      .select('conversation_id')
      .eq('user_id', user.id);
    const allConvIds = [...new Set(((myConvParts || []) as any[]).map((r) => r.conversation_id))];

    if (!allConvIds.length) {
      setAcceptedChats([]);
      setGroups([]);
      return;
    }

    // Fetch conversation metadata to split DMs vs groups
    const { data: convRows } = await supabase
      .from('conversations')
      .select('id, is_group, title, created_by')
      .in('id', allConvIds);
    const convMeta: Record<string, any> = {};
    (convRows || []).forEach((c: any) => {
      convMeta[c.id] = c;
      convIsGroupRef.current[c.id] = !!c.is_group;
    });

    // Fetch all participants for these conversations in one round-trip
    const { data: allParts } = await supabase
      .from('conversation_participants')
      .select('conversation_id, user_id')
      .in('conversation_id', allConvIds);
    const partsByConv: Record<string, string[]> = {};
    (allParts || []).forEach((p: any) => {
      if (!partsByConv[p.conversation_id]) partsByConv[p.conversation_id] = [];
      partsByConv[p.conversation_id].push(p.user_id);
    });

    // Profiles for all "other" users involved (DMs need this; groups optional)
    const otherUserIdSet = new Set<string>();
    Object.entries(partsByConv).forEach(([convId, uids]) => {
      const meta = convMeta[convId];
      if (meta && !meta.is_group) {
        const other = uids.find((u) => u !== user.id);
        if (other) otherUserIdSet.add(other);
      }
    });
    const otherUserIds = [...otherUserIdSet];
    let profileMap: Record<string, any> = {};
    if (otherUserIds.length) {
      const { data: profileRows } = await supabase.from('profiles').select('id,display_name,avatar_url').in('id', otherUserIds);
      (profileRows || []).forEach((p: any) => { profileMap[p.id] = p; });
    }

    // Last message + unread for every conversation in one query
    const { data: msgRows } = await supabase
      .from('direct_messages')
      .select('conversation_id,sender_id,content,created_at,read_at')
      .in('conversation_id', allConvIds)
      .order('created_at', { ascending: false });

    const lastMsgByConv: Record<string, any> = {};
    const unreadByConv: Record<string, number> = {};
    ((msgRows || []) as any[]).forEach((row) => {
      if (!lastMsgByConv[row.conversation_id]) lastMsgByConv[row.conversation_id] = row;
      if (row.sender_id !== user.id && !row.read_at) {
        unreadByConv[row.conversation_id] = (unreadByConv[row.conversation_id] || 0) + 1;
      }
    });

    // Build DM chat list
    const dmConvs = allConvIds.filter((id) => convMeta[id] && !convMeta[id].is_group);
    const dms: ChatListItem[] = await Promise.all(dmConvs.map(async (conversationId) => {
      const otherId = (partsByConv[conversationId] || []).find((u) => u !== user.id) || '';
      convToOtherUserIdRef.current[conversationId] = otherId;
      const lastMsg = lastMsgByConv[conversationId];
      const lastMessageContent = lastMsg?.content && otherId
        ? await decryptDirectMessageContent(lastMsg.content, user.id, otherId)
        : '';
      const lastTs = lastMsg?.created_at ? new Date(lastMsg.created_at).getTime() : 0;
      return {
        id: conversationId,
        userId: otherId,
        name: profileMap[otherId]?.display_name || 'Traveler',
        avatar: profileMap[otherId]?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&h=120&fit=crop&crop=face',
        lastMessage: getMessagePreview(lastMessageContent) || 'Start chatting',
        timestamp: lastMsg?.created_at ? new Date(lastMsg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
        unreadCount: unreadByConv[conversationId] || 0,
        lastMessageAt: lastTs,
      };
    }));
    dms.sort((a, b) => b.lastMessageAt - a.lastMessageAt);
    setAcceptedChats(dms);

    // Build group list
    const groupConvs = allConvIds.filter((id) => convMeta[id] && convMeta[id].is_group);
    const grps: GroupListItem[] = groupConvs.map((conversationId) => {
      const meta = convMeta[conversationId];
      const lastMsg = lastMsgByConv[conversationId];
      const lastTs = lastMsg?.created_at ? new Date(lastMsg.created_at).getTime() : 0;
      return {
        id: conversationId,
        title: meta?.title || 'Untitled group',
        memberCount: (partsByConv[conversationId] || []).length,
        lastMessage: lastMsg?.content ? getMessagePreview(lastMsg.content) : 'No messages yet',
        timestamp: lastMsg?.created_at ? new Date(lastMsg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
        unreadCount: unreadByConv[conversationId] || 0,
        lastMessageAt: lastTs,
        createdBy: meta?.created_by,
      };
    });
    grps.sort((a, b) => b.lastMessageAt - a.lastMessageAt);
    setGroups(grps);
  };

  useEffect(() => {
    if (!isOpen || !user) return;
    if (!targetUserId) {
      setNotConnected(false);
      setNotConnectedProfile(null);
    }
    loadData();
    loadFriends();

    const channel = supabase
      .channel('messages-panel-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'follows' }, () => loadData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'conversations' }, () => loadData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'conversation_participants' }, () => loadData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'direct_messages' }, (payload: any) => {
        const newRow = payload?.new || payload?.old;
        const convId = newRow?.conversation_id;
        if (!convId) return;
        const isGroup = convIsGroupRef.current[convId];
        const senderId: string | undefined = newRow?.sender_id;
        const otherFromPayload = !isGroup && senderId && senderId !== user.id ? senderId : undefined;
        if (otherFromPayload) convToOtherUserIdRef.current[convId] = otherFromPayload;
        const otherUserId = otherFromPayload || (!isGroup ? resolveOtherUserId(convId) : null);
        loadMessagesForConversation(convId, otherUserId, isGroup);
        loadData();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [isOpen, user]);

  // Auto-open chat with target user (DM only)
  useEffect(() => {
    if (!isOpen || !user || !targetUserId) return;
    const autoOpen = async () => {
      setOpeningTargetChat(true);
      setActiveTab('messages');
      setSelectedChat(null);
      setSelectedChatUserId(null);
      setSelectedChatProfile(null);
      setSelectedIsGroup(false);

      const [isFriend, profRes, conversationId] = await Promise.all([
        checkFriendship(targetUserId),
        supabase.from('profiles').select('display_name,avatar_url').eq('id', targetUserId).maybeSingle(),
        ensureDirectConversation(targetUserId).catch(() => null),
      ]);
      const prof = profRes?.data;

      if (!isFriend) {
        setNotConnected(true);
        setNotConnectedProfile(prof);
        setSelectedChat(null);
        setSelectedChatProfile(null);
        setOpeningTargetChat(false);
        return;
      }
      setNotConnected(false);
      setNotConnectedProfile(null);
      setSelectedChatProfile(prof as any);
      if (conversationId) {
        convToOtherUserIdRef.current[conversationId] = targetUserId;
        convIsGroupRef.current[conversationId] = false;
        setSelectedChatUserId(targetUserId);
        await openChat(conversationId, targetUserId, false);
        return;
      }
      setOpeningTargetChat(false);
    };
    autoOpen();
  }, [isOpen, targetUserId, user]);

  useEffect(() => {
    if (isOpen) return;
    setActiveTab('messages');
    setSelectedChat(null);
    setSelectedChatUserId(null);
    setSelectedChatProfile(null);
    setSelectedIsGroup(false);
    setNotConnected(false);
    setNotConnectedProfile(null);
    setOpeningTargetChat(false);
    setShowEmojis(false);
    setShowGroupModal(null);
  }, [isOpen]);

  const handleAcceptRequest = async (requestId: string) => {
    const request = tripRequests.find((r) => r.id === requestId);
    if (!request || !user) return;
    const { error } = await supabase.from('follows').update({ status: 'accepted' }).eq('id', requestId).eq('following_id', user.id);
    if (error) { toast({ title: 'Accept failed', description: error.message, variant: 'destructive' }); return; }
    await findOrCreateConversation(request.userId);
    toast({ title: 'Request accepted ✅' });
    await loadData();
  };

  const handleRejectRequest = async (requestId: string) => {
    await supabase.from('follows').update({ status: 'rejected' }).eq('id', requestId);
    await loadData();
  };

  const openChat = async (chatId: string, userId?: string, isGroup?: boolean) => {
    const groupFlag = typeof isGroup === 'boolean' ? isGroup : convIsGroupRef.current[chatId] || false;
    setActiveTab(groupFlag ? 'groups' : 'messages');
    setOpeningTargetChat(true);
    setNotConnected(false);
    setNotConnectedProfile(null);
    setSelectedChat(chatId);
    setSelectedIsGroup(groupFlag);
    if (userId && !groupFlag) {
      setSelectedChatUserId(userId);
      const existing = acceptedChats.find((c) => c.userId === userId);
      if (existing) {
        setSelectedChatProfile({ display_name: existing.name, avatar_url: existing.avatar });
      } else {
        const { data: prof } = await supabase.from('profiles').select('display_name,avatar_url').eq('id', userId).maybeSingle();
        if (prof) setSelectedChatProfile(prof as any);
      }
    } else if (groupFlag) {
      setSelectedChatUserId(null);
      const grp = groups.find((g) => g.id === chatId);
      setSelectedChatProfile(grp ? { display_name: grp.title, avatar_url: null } : null);
    }
    setShowEmojis(false);
    await loadMessagesForConversation(chatId, userId, groupFlag);
    setOpeningTargetChat(false);
  };

  const sendContent = async (content: string) => {
    if (!selectedChat || !user) return false;

    let storedContent = content;
    if (!selectedIsGroup) {
      const otherUserId = resolveOtherUserId(selectedChat, selectedChatUserId);
      if (!otherUserId) {
        toast({ title: 'Unable to open secure chat', description: 'Please reopen this conversation.', variant: 'destructive' });
        return false;
      }
      storedContent = await encryptDirectMessageContent(content, user.id, otherUserId);
    }

    const { error } = await supabase.from('direct_messages').insert({
      conversation_id: selectedChat,
      sender_id: user.id,
      content: storedContent,
    });

    if (error) {
      toast({ title: 'Message failed', description: error.message, variant: 'destructive' });
      return false;
    }

    await loadMessagesForConversation(selectedChat, selectedChatUserId, selectedIsGroup);
    return true;
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !selectedChat || !user) return;
    const text = inputValue.trim();
    setInputValue('');
    setShowEmojis(false);
    await sendContent(text);
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
      await sendContent(publicUrl);
    } catch {
      toast({ title: 'Upload failed', variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const toggleAudioRecording = async () => {
    if (isRecording) { mediaRecorderRef.current?.stop(); return; }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      recordingStreamRef.current = stream;
      const chunks: BlobPart[] = [];
      const recorder = new MediaRecorder(stream);
      recorder.ondataavailable = (event) => { if (event.data.size > 0) chunks.push(event.data); };
      recorder.onstop = async () => {
        setIsRecording(false);
        const audioBlob = new Blob(chunks, { type: recorder.mimeType || 'audio/webm' });
        const audioFile = new File([audioBlob], `voice-${Date.now()}.webm`, { type: audioBlob.type || 'audio/webm' });
        stopRecordingTracks();
        await handleMediaUpload(audioFile);
      };
      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
      toast({ title: 'Recording started 🎙️' });
    } catch {
      stopRecordingTracks();
      setIsRecording(false);
      toast({ title: 'Microphone access failed', description: 'Please allow microphone access to record audio.', variant: 'destructive' });
    }
  };

  const isMediaUrl = (content: string) => content.match(/\.(jpg|jpeg|png|gif|webp|mp4|webm|mov|mp3|wav|m4a|ogg|aac)(\?.*)?$/i) || content.includes('supabase.co/storage');
  const isVideoUrl = (content: string) => content.match(/\.(mp4|webm|mov)(\?.*)?$/i);
  const isAudioUrl = (content: string) => content.match(/\.(mp3|wav|m4a|ogg|aac|webm)(\?.*)?$/i) && !isVideoUrl(content);

  // ----------------- Group create / edit -----------------
  const openCreateGroup = () => {
    setGroupTitle('');
    setSelectedFriendIds(new Set());
    setShowGroupModal({ mode: 'create' });
  };

  const openEditGroup = async (groupId: string) => {
    const grp = groups.find((g) => g.id === groupId);
    setGroupTitle(grp?.title || '');
    // Fetch current participants
    const { data: parts } = await supabase
      .from('conversation_participants')
      .select('user_id')
      .eq('conversation_id', groupId);
    const memberIds = ((parts || []) as any[]).map((p) => p.user_id).filter((id) => id !== user?.id);
    const memberSet = new Set(memberIds);
    setSelectedFriendIds(memberSet);
    if (memberIds.length) {
      const { data: profs } = await supabase.from('profiles').select('id,display_name,avatar_url').in('id', memberIds);
      setGroupCurrentMembers((profs || []) as Friend[]);
    } else {
      setGroupCurrentMembers([]);
    }
    setShowGroupModal({ mode: 'edit', groupId });
  };

  const toggleFriendSelected = (id: string) => {
    setSelectedFriendIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleSaveGroup = async () => {
    if (!user) return;
    if (!groupTitle.trim()) { toast({ title: 'Group name is required', variant: 'destructive' }); return; }
    if (selectedFriendIds.size === 0) { toast({ title: 'Add at least one friend', variant: 'destructive' }); return; }

    setSavingGroup(true);
    try {
      if (showGroupModal && showGroupModal.mode === 'create') {
        // Create the group conversation, then add self + selected friends.
        const { data: convRow, error: convErr } = await supabase
          .from('conversations')
          .insert({ created_by: user.id, is_group: true, title: groupTitle.trim() })
          .select('id')
          .single();
        if (convErr || !convRow) throw convErr || new Error('Could not create group');

        const inserts = [
          { conversation_id: convRow.id, user_id: user.id },
          ...Array.from(selectedFriendIds).map((uid) => ({ conversation_id: convRow.id, user_id: uid })),
        ];
        const { error: partsErr } = await supabase.from('conversation_participants').insert(inserts);
        if (partsErr) throw partsErr;

        toast({ title: 'Group created 🎉' });
        setShowGroupModal(null);
        await loadData();
      } else if (showGroupModal && showGroupModal.mode === 'edit') {
        const groupId = showGroupModal.groupId;
        // Update title
        await supabase.from('conversations').update({ title: groupTitle.trim() }).eq('id', groupId);

        // Compute add/remove
        const currentIds = new Set(groupCurrentMembers.map((m) => m.id));
        const desiredIds = new Set(selectedFriendIds);
        const toAdd = [...desiredIds].filter((id) => !currentIds.has(id));
        const toRemove = [...currentIds].filter((id) => !desiredIds.has(id));

        if (toAdd.length) {
          await supabase.from('conversation_participants').insert(toAdd.map((uid) => ({ conversation_id: groupId, user_id: uid })));
        }
        if (toRemove.length) {
          await supabase.from('conversation_participants').delete().eq('conversation_id', groupId).in('user_id', toRemove);
        }
        toast({ title: 'Group updated ✅' });
        setShowGroupModal(null);
        await loadData();
      }
    } catch (e: any) {
      toast({ title: 'Failed', description: e?.message || 'Could not save group', variant: 'destructive' });
    } finally {
      setSavingGroup(false);
    }
  };

  const handleLeaveOrDeleteGroup = async (groupId: string, isCreator: boolean) => {
    if (!user) return;
    const confirmText = isCreator ? 'Delete this group for everyone?' : 'Leave this group?';
    if (!confirm(confirmText)) return;
    if (isCreator) {
      await supabase.from('conversations').delete().eq('id', groupId);
    } else {
      await supabase.from('conversation_participants').delete().eq('conversation_id', groupId).eq('user_id', user.id);
    }
    if (selectedChat === groupId) {
      setSelectedChat(null);
      setSelectedIsGroup(false);
    }
    await loadData();
    toast({ title: isCreator ? 'Group deleted' : 'You left the group' });
  };

  if (!isOpen) return null;

  if (openingTargetChat && !notConnected && !selectedChat) {
    return (
      <div className="fixed top-20 bottom-6 right-6 z-40 w-96 bg-background rounded-2xl shadow-2xl border border-border flex flex-col overflow-hidden animate-fade-in">
        <div className="px-4 py-3 flex items-center justify-between border-b border-border bg-card">
          <div className="flex items-center gap-2"><div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center"><MessageCircle className="w-5 h-5 text-white" /></div><h3 className="font-semibold text-foreground">Messages</h3></div>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center"><X className="w-4 h-4" /></button>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <div>
            <p className="font-medium text-foreground">Opening chat…</p>
            <p className="text-sm text-muted-foreground mt-1">Preparing your secure conversation.</p>
          </div>
        </div>
      </div>
    );
  }

  if (notConnected && targetUserId) {
    return (
      <div className="fixed top-20 bottom-6 right-6 z-40 w-96 bg-background rounded-2xl shadow-2xl border border-border flex flex-col overflow-hidden animate-fade-in">
        <div className="px-4 py-3 flex items-center justify-between border-b border-border bg-card">
          <div className="flex items-center gap-2"><div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center"><MessageCircle className="w-5 h-5 text-white" /></div><h3 className="font-semibold text-foreground">Messages</h3></div>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center"><X className="w-4 h-4" /></button>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
            {notConnectedProfile?.avatar_url ? (
              <img src={notConnectedProfile.avatar_url} alt="" className="w-20 h-20 rounded-full object-cover" />
            ) : <Lock className="w-10 h-10 text-muted-foreground" />}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">{notConnectedProfile?.display_name || 'This user'}</h3>
            <p className="text-sm text-muted-foreground mt-2">You need to be connected (mutual follow accepted) to start a chat.</p>
          </div>
          <div className="w-full p-4 bg-primary/5 rounded-2xl border border-primary/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center"><UserPlus className="w-5 h-5 text-primary" /></div>
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

  // Active chat view (DM or group)
  if (selectedChat) {
    let headerName = 'Chat';
    let headerAvatar = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&h=120&fit=crop&crop=face';
    let isGroupCreator = false;
    if (selectedIsGroup) {
      const grp = groups.find((g) => g.id === selectedChat);
      headerName = grp?.title || selectedChatProfile?.display_name || 'Group';
      isGroupCreator = grp?.createdBy === user?.id;
    } else {
      const chat = acceptedChats.find((c) => c.id === selectedChat);
      headerName = chat?.name || selectedChatProfile?.display_name || 'Chat';
      headerAvatar = chat?.avatar || selectedChatProfile?.avatar_url || headerAvatar;
    }
    const msgs = chatMessages[selectedChat] || [];

    return (
      <div className="fixed top-20 bottom-6 right-6 z-40 w-96 bg-background rounded-2xl shadow-2xl border border-border flex flex-col overflow-hidden animate-fade-in">
        <div className="px-4 py-3 flex items-center gap-3 border-b border-border bg-card">
          <button onClick={() => { setSelectedChat(null); setSelectedChatUserId(null); setSelectedChatProfile(null); setSelectedIsGroup(false); setShowEmojis(false); }} className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center"><ChevronLeft className="w-5 h-5" /></button>
          {selectedIsGroup ? (
            <div className="w-10 h-10 gradient-primary rounded-full flex items-center justify-center"><Users className="w-5 h-5 text-white" /></div>
          ) : (
            <img src={headerAvatar} alt={headerName} className="w-10 h-10 rounded-full object-cover" />
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground text-sm truncate">{headerName}</h3>
            {selectedIsGroup ? (
              <p className="text-xs text-muted-foreground">{groups.find((g) => g.id === selectedChat)?.memberCount || 0} members</p>
            ) : (
              <p className="text-xs text-success flex items-center gap-1"><span className="w-1.5 h-1.5 bg-success rounded-full" />Connected</p>
            )}
          </div>
          {selectedIsGroup && (
            <>
              <button onClick={() => openEditGroup(selectedChat)} className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center" title={isGroupCreator ? 'Edit members' : 'Group info'}>
                <Settings className="w-4 h-4" />
              </button>
              <button onClick={() => handleLeaveOrDeleteGroup(selectedChat, isGroupCreator)} className="w-8 h-8 rounded-full hover:bg-destructive/10 text-destructive flex items-center justify-center" title={isGroupCreator ? 'Delete group' : 'Leave group'}>
                {isGroupCreator ? <Trash2 className="w-4 h-4" /> : <UserMinus className="w-4 h-4" />}
              </button>
            </>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {msgs.length === 0 && (
            <div className="text-center py-8"><p className="text-sm text-muted-foreground">No messages yet. Say hello! 👋</p></div>
          )}
          {msgs.map((msg, idx) => {
            const isMe = msg.senderId === user?.id;
            const isMedia = isMediaUrl(msg.content);
            const isVideo = isVideoUrl(msg.content);
            const isAudio = isAudioUrl(msg.content);
            const isLastFromMe = isMe && (idx === msgs.length - 1 || msgs[idx + 1]?.senderId !== user?.id);
            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} gap-2`}>
                {selectedIsGroup && !isMe && (
                  <img src={msg.senderAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&h=80&fit=crop&crop=face'} alt={msg.senderName || ''} className="w-7 h-7 rounded-full object-cover flex-shrink-0 mt-1" />
                )}
                <div className={`max-w-[75%] rounded-2xl overflow-hidden ${isMe ? 'gradient-primary text-primary-foreground rounded-br-md' : 'bg-muted text-foreground rounded-bl-md'}`}>
                  {selectedIsGroup && !isMe && msg.senderName && (
                    <p className="px-3 pt-2 text-[11px] font-semibold text-primary">{msg.senderName}</p>
                  )}
                  {isMedia ? (
                    isVideo ? <video src={msg.content} className="w-full max-h-48 object-cover" controls />
                    : isAudio ? <div className="px-3 pt-3"><audio src={msg.content} className="w-full min-w-[220px]" controls /></div>
                    : <img src={msg.content} alt="Shared media" className="w-full max-h-48 object-cover cursor-pointer" onClick={() => window.open(msg.content, '_blank')} />
                  ) : (
                    <p className="text-sm px-4 py-2 whitespace-pre-wrap break-words">{msg.content}</p>
                  )}
                  <div className={`flex items-center gap-1 px-3 pb-1.5 ${isMe ? 'justify-end' : ''}`}>
                    <span className={`text-[10px] ${isMe ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>{msg.timestamp}</span>
                    {isMe && isLastFromMe && !selectedIsGroup && (
                      msg.readAt ? <CheckCheck className="w-3.5 h-3.5 text-blue-300" /> : <Check className="w-3.5 h-3.5 text-primary-foreground/50" />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {showEmojis && (
          <div className="px-3 py-2 bg-card border-t border-border">
            <div className="flex flex-wrap gap-1.5">
              {EMOJI_LIST.map((emoji) => (
                <button key={emoji} onClick={() => setInputValue(prev => prev + emoji)} className="w-8 h-8 text-lg hover:bg-muted rounded-lg flex items-center justify-center">
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="p-3 bg-card border-t border-border">
          <div className="flex items-center gap-2">
            <button onClick={() => setShowEmojis(!showEmojis)} className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${showEmojis ? 'bg-primary/10 text-primary' : 'hover:bg-muted text-muted-foreground'}`}><Smile className="w-5 h-5" /></button>
            <button onClick={() => fileInputRef.current?.click()} disabled={uploading} className="w-10 h-10 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground transition-colors">
              {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ImageIcon className="w-5 h-5" />}
            </button>
            <button onClick={toggleAudioRecording} className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isRecording ? 'bg-destructive/10 text-destructive' : 'hover:bg-muted text-muted-foreground'}`}>
              {isRecording ? <Square className="w-4 h-4" /> : <Mic className="w-5 h-5" />}
            </button>
            <input ref={fileInputRef} type="file" accept="image/*,video/*,audio/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleMediaUpload(f); }} />
            <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} placeholder="Type a message..." className="flex-1 h-10 px-4 bg-muted rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            <Button onClick={handleSendMessage} disabled={!inputValue.trim()} size="sm" className="w-10 h-10 p-0 rounded-full gradient-primary"><Send className="w-4 h-4" /></Button>
          </div>
        </div>

        {showGroupModal && <GroupModalRenderer />}
      </div>
    );
  }

  // ----------- Group create/edit modal renderer (used in both list and chat views) -----------
  function GroupModalRenderer() {
    if (!showGroupModal) return null;
    const isEdit = showGroupModal.mode === 'edit';
    return (
      <div className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowGroupModal(null)}>
        <div className="w-full max-w-md bg-background rounded-3xl p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground">{isEdit ? 'Edit group' : 'New group chat'}</h2>
            <button onClick={() => setShowGroupModal(null)} className="p-1.5 rounded-lg hover:bg-muted"><X className="w-5 h-5" /></button>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">Group name</label>
            <input value={groupTitle} onChange={(e) => setGroupTitle(e.target.value)} placeholder="e.g. Goa squad" className="w-full h-10 px-3 bg-muted rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">{isEdit ? 'Members' : 'Add friends'}</label>
            {friends.length === 0 ? (
              <p className="text-xs text-muted-foreground py-2">You don't have any mutual friends yet. Connect with travelers first.</p>
            ) : (
              <div className="max-h-64 overflow-y-auto space-y-1">
                {friends.map((f) => {
                  const checked = selectedFriendIds.has(f.id);
                  return (
                    <label key={f.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-muted cursor-pointer">
                      <input type="checkbox" checked={checked} onChange={() => toggleFriendSelected(f.id)} className="w-4 h-4 accent-primary" />
                      <img src={f.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&h=80&fit=crop&crop=face'} alt={f.display_name} className="w-8 h-8 rounded-full object-cover" />
                      <span className="text-sm text-foreground">{f.display_name}</span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>
          <Button onClick={handleSaveGroup} disabled={savingGroup} className="w-full h-11 gradient-primary text-primary-foreground">
            {savingGroup ? <Loader2 className="w-4 h-4 animate-spin" /> : (isEdit ? 'Save changes' : 'Create group')}
          </Button>
        </div>
      </div>
    );
  }

  // List view (Chats / Groups / Requests)
  return (
    <div className="fixed top-20 bottom-6 right-6 z-40 w-96 bg-background rounded-2xl shadow-2xl border border-border flex flex-col overflow-hidden animate-fade-in">
      <div className="px-4 py-3 flex items-center justify-between border-b border-border bg-card">
        <div className="flex items-center gap-2"><div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center"><MessageCircle className="w-5 h-5 text-white" /></div><div><h3 className="font-semibold text-foreground">Messages</h3><p className="text-xs text-muted-foreground">Chats, groups & requests</p></div></div>
        <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center"><X className="w-4 h-4" /></button>
      </div>

      <div className="flex border-b border-border">
        <button onClick={() => setActiveTab('messages')} className={`flex-1 px-3 py-3 text-sm font-medium transition-colors ${activeTab === 'messages' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}`}>
          <div className="flex items-center justify-center gap-1.5"><MessageCircle className="w-4 h-4" />Chats</div>
        </button>
        <button onClick={() => setActiveTab('groups')} className={`flex-1 px-3 py-3 text-sm font-medium transition-colors ${activeTab === 'groups' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}`}>
          <div className="flex items-center justify-center gap-1.5"><Users className="w-4 h-4" />Groups</div>
        </button>
        <button onClick={() => setActiveTab('requests')} className={`flex-1 px-3 py-3 text-sm font-medium transition-colors relative ${activeTab === 'requests' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground hover:text-foreground'}`}>
          <div className="flex items-center justify-center gap-1.5"><UserPlus className="w-4 h-4" />Requests
            {pendingRequests.length > 0 && <span className="w-5 h-5 bg-secondary text-secondary-foreground text-xs rounded-full flex items-center justify-center">{pendingRequests.length}</span>}
          </div>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {activeTab === 'messages' && (
          <div className="divide-y divide-border">
            {acceptedChats.length === 0 ? (
              <div className="p-8 text-center"><div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center"><MessageCircle className="w-8 h-8 text-muted-foreground" /></div><p className="text-muted-foreground text-sm">No conversations yet</p><p className="text-xs text-muted-foreground mt-1">Connect with travelers to start chatting</p></div>
            ) : (
              acceptedChats.map((chat) => (
                <button key={chat.id} onClick={() => openChat(chat.id, chat.userId, false)} className="w-full p-4 flex items-center gap-3 hover:bg-muted/50 transition-colors text-left">
                  <div className="relative">
                    <img src={chat.avatar} alt={chat.name} className="w-12 h-12 rounded-full object-cover" />
                    {chat.unreadCount > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 bg-secondary text-white text-[10px] font-bold rounded-full flex items-center justify-center">{chat.unreadCount}</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between"><h4 className={`font-medium text-sm ${chat.unreadCount > 0 ? 'text-foreground font-semibold' : 'text-foreground'}`}>{chat.name}</h4><span className="text-xs text-muted-foreground">{chat.timestamp}</span></div>
                    <p className={`text-sm truncate ${chat.unreadCount > 0 ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>{chat.lastMessage}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        )}

        {activeTab === 'groups' && (
          <div>
            <div className="p-3 border-b border-border">
              <Button onClick={openCreateGroup} className="w-full gradient-primary text-primary-foreground rounded-xl">
                <Plus className="w-4 h-4 mr-1" /> New group chat
              </Button>
            </div>
            <div className="divide-y divide-border">
              {groups.length === 0 ? (
                <div className="p-8 text-center"><div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center"><Users className="w-8 h-8 text-muted-foreground" /></div><p className="text-muted-foreground text-sm">No group chats yet</p><p className="text-xs text-muted-foreground mt-1">Tap "New group chat" to create one</p></div>
              ) : (
                groups.map((g) => (
                  <button key={g.id} onClick={() => openChat(g.id, undefined, true)} className="w-full p-4 flex items-center gap-3 hover:bg-muted/50 transition-colors text-left">
                    <div className="relative">
                      <div className="w-12 h-12 gradient-primary rounded-full flex items-center justify-center"><Users className="w-6 h-6 text-white" /></div>
                      {g.unreadCount > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 bg-secondary text-white text-[10px] font-bold rounded-full flex items-center justify-center">{g.unreadCount}</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className={`font-medium text-sm ${g.unreadCount > 0 ? 'text-foreground font-semibold' : 'text-foreground'} truncate`}>{g.title}</h4>
                        <span className="text-xs text-muted-foreground flex-shrink-0">{g.timestamp}</span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{g.memberCount} members · {g.lastMessage}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'requests' && (
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

      {showGroupModal && <GroupModalRenderer />}
    </div>
  );
};

export default MessagesPanel;
