import { supabase } from '@/integrations/supabase/client';
import { encryptMessage, decryptMessage } from '@/lib/encryption';
export interface Conversation {
  id: string;
  title: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export const fetchConversations = async (userId: string): Promise<Conversation[]> => {
  const { data } = await supabase
    .from('chat_conversations')
    .select('id,title,updated_at')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });
  return (data || []) as Conversation[];
};

export const fetchChatMessages = async (conversationId: string): Promise<ChatMessage[]> => {
  const { data } = await supabase
    .from('chat_messages')
    .select('id,role,content')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });
  return ((data || []) as any[]).map((m) => ({ id: m.id, role: m.role, content: m.content }));
};

export const createConversation = async (userId: string, title: string) => {
  const { data } = await supabase
    .from('chat_conversations')
    .insert({ user_id: userId, title })
    .select()
    .single();
  return data as Conversation | null;
};

export const deleteConversation = async (conversationId: string) => {
  await supabase.from('chat_conversations').delete().eq('id', conversationId);
};

export const saveChatMessage = async (conversationId: string, role: string, content: string) => {
  await supabase.from('chat_messages').insert({ conversation_id: conversationId, role, content });
};

export const updateConversationTitle = async (conversationId: string, title: string) => {
  await supabase.from('chat_conversations').update({ title }).eq('id', conversationId);
};

export const invokeTravelAI = async (text: string, history: { role: string; content: string }[]) => {
  const { data, error } = await supabase.functions.invoke('ai-travel', {
    body: { type: 'chat', destination: text, history },
  });
  if (error) throw error;
  return data?.content || "I'm here to help!";
};
