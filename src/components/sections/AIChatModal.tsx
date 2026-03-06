import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, Send, Sparkles, MapPin, Users, Calendar, Wallet, AlertTriangle, Loader2, Plus, MessageCircle, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import ReactMarkdown from 'react-markdown';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isLoading?: boolean;
}

interface Conversation {
  id: string;
  title: string;
  updated_at: string;
}

interface AIChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AIChatModal: React.FC<AIChatModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvoId, setActiveConvoId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  useEffect(() => { scrollToBottom(); }, [messages]);

  const loadConversations = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase.from('chat_conversations').select('id,title,updated_at').eq('user_id', user.id).order('updated_at', { ascending: false });
    if (data) setConversations(data as Conversation[]);
  }, [user]);

  const loadMessages = useCallback(async (convoId: string) => {
    const { data } = await supabase.from('chat_messages').select('id,role,content').eq('conversation_id', convoId).order('created_at', { ascending: true });
    if (data) setMessages((data as any[]).map((m) => ({ id: m.id, role: m.role, content: m.content })));
  }, []);

  useEffect(() => {
    if (isOpen && user) loadConversations();
  }, [isOpen, user, loadConversations]);

  const startNewChat = async () => {
    if (!user) return;
    const { data } = await supabase.from('chat_conversations').insert({ user_id: user.id, title: 'New Chat' }).select().single();
    if (data) {
      setActiveConvoId((data as any).id);
      setMessages([]);
      setShowSidebar(false);
      await loadConversations();
    }
  };

  const selectConversation = async (convoId: string) => {
    setActiveConvoId(convoId);
    await loadMessages(convoId);
    setShowSidebar(false);
  };

  const deleteConversation = async (convoId: string) => {
    await supabase.from('chat_conversations').delete().eq('id', convoId);
    if (activeConvoId === convoId) {
      setActiveConvoId(null);
      setMessages([]);
    }
    await loadConversations();
  };

  const handleSend = async (forcedText?: string) => {
    const text = (forcedText ?? inputValue).trim();
    if (!text || isLoading || !user) return;

    let convoId = activeConvoId;
    if (!convoId) {
      const { data } = await supabase.from('chat_conversations').insert({ user_id: user.id, title: text.slice(0, 50) }).select().single();
      if (!data) return;
      convoId = (data as any).id;
      setActiveConvoId(convoId);
    }

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text };
    const loadingMsg: Message = { id: 'loading', role: 'assistant', content: '', isLoading: true };

    setMessages((prev) => [...prev, userMsg, loadingMsg]);
    setInputValue('');
    setIsLoading(true);

    await supabase.from('chat_messages').insert({ conversation_id: convoId, role: 'user', content: text });

    try {
      const history = [...messages, userMsg]
        .filter((m) => !m.isLoading)
        .slice(-12)
        .map((m) => ({ role: m.role, content: m.content }));

      const { data, error } = await supabase.functions.invoke('ai-travel', {
        body: { type: 'chat', destination: text, history },
      });

      if (error) throw error;

      const aiContent = data?.content || "I'm here to help!";

      await supabase.from('chat_messages').insert({ conversation_id: convoId, role: 'assistant', content: aiContent });
      await supabase.from('chat_conversations').update({ title: messages.length === 0 ? text.slice(0, 50) : undefined }).eq('id', convoId);

      await loadConversations();
      setMessages((prev) => prev.filter((m) => !m.isLoading).concat({ id: `${Date.now()}-ai`, role: 'assistant', content: aiContent }));
    } catch (error) {
      setMessages((prev) => prev.filter((m) => !m.isLoading));
      toast({ title: 'AI Response Failed', description: error instanceof Error ? error.message : 'Try again.', variant: 'destructive' });
      setMessages((prev) => [...prev, { id: `${Date.now()}-error`, role: 'assistant', content: 'Sorry, please try again.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (label: string) => {
    setInputValue(label);
    handleSend(label);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="w-full max-w-3xl h-[85vh] bg-background rounded-3xl shadow-2xl flex overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {showSidebar && (
          <div className="w-72 border-r border-border flex flex-col bg-muted/30">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h3 className="font-semibold text-foreground text-sm">Chat History</h3>
              <button onClick={startNewChat} className="p-2 rounded-lg hover:bg-muted transition-colors"><Plus className="w-4 h-4 text-primary" /></button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {conversations.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">No chats yet</div>
              ) : conversations.map((c) => (
                <div key={c.id} className={`px-4 py-3 flex items-center gap-2 cursor-pointer hover:bg-muted/50 transition-colors ${activeConvoId === c.id ? 'bg-primary/10' : ''}`}>
                  <button onClick={() => selectConversation(c.id)} className="flex-1 text-left">
                    <p className="text-sm font-medium text-foreground truncate">{c.title}</p>
                    <p className="text-[10px] text-muted-foreground">{new Date(c.updated_at).toLocaleDateString()}</p>
                  </button>
                  <button onClick={() => deleteConversation(c.id)} className="p-1 rounded hover:bg-destructive/10"><Trash2 className="w-3 h-3 text-muted-foreground hover:text-destructive" /></button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex-1 flex flex-col">
          <div className="glass-effect px-6 py-4 flex items-center gap-4 border-b border-border">
            <button onClick={() => setShowSidebar(!showSidebar)} className="p-2 rounded-lg hover:bg-muted transition-colors"><MessageCircle className="w-5 h-5 text-primary" /></button>
            <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center shadow-glow"><Sparkles className="w-5 h-5 text-white" /></div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-foreground">TripSync AI</h2>
              <p className="text-sm text-success flex items-center gap-1"><span className="w-2 h-2 bg-success rounded-full" />Fast mode enabled</p>
            </div>
            <button onClick={startNewChat} className="p-2 rounded-lg hover:bg-muted transition-colors"><Plus className="w-5 h-5" /></button>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted transition-colors"><X className="w-5 h-5" /></button>
          </div>

          <div className="px-6 py-3 bg-muted/30 border-b border-border">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              {[{ icon: Calendar, label: 'Plan Trip' }, { icon: Users, label: 'Find Mates' }, { icon: MapPin, label: 'Nearby' }, { icon: Wallet, label: 'Expenses' }, { icon: AlertTriangle, label: 'SOS' }].map(({ icon: Icon, label }) => (
                <button key={label} onClick={() => handleQuickAction(label)} disabled={isLoading} className="flex items-center gap-2 px-4 py-2 bg-card rounded-full text-sm font-medium whitespace-nowrap shadow-sm hover:shadow-md transition-all hover:bg-primary/5 disabled:opacity-50">
                  <Icon className="w-4 h-4 text-primary" />{label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
            {messages.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-glow"><Sparkles className="w-8 h-8 text-white" /></div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Welcome to TripSync AI</h3>
                <p className="text-muted-foreground text-sm max-w-md mx-auto">Ask anything — I keep your chat history and context.</p>
              </div>
            )}
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                <div className={`max-w-[80%] rounded-2xl px-5 py-4 ${message.role === 'user' ? 'gradient-primary text-primary-foreground rounded-br-md' : 'bg-card shadow-md rounded-bl-md border border-border'}`}>
                  {message.role === 'assistant' && (
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-6 h-6 gradient-primary rounded-full flex items-center justify-center"><Sparkles className="w-3 h-3 text-white" /></div>
                      <span className="text-xs font-medium text-primary">TripSync AI</span>
                    </div>
                  )}
                  {message.isLoading ? (
                    <div className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin text-primary" /><span className="text-sm text-muted-foreground">Thinking...</span></div>
                  ) : (
                    <div className={`text-sm leading-relaxed prose prose-sm max-w-none ${message.role === 'assistant' ? 'text-foreground' : ''}`}>
                      {message.role === 'assistant' ? <ReactMarkdown>{message.content}</ReactMarkdown> : message.content}
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-6 bg-card border-t border-border">
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} placeholder="Ask TripSync AI anything..." className="input-field h-12" disabled={isLoading} />
              </div>
              <Button onClick={() => handleSend()} disabled={!inputValue.trim() || isLoading} className="w-12 h-12 p-0 rounded-full gradient-primary shadow-glow">
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIChatModal;
