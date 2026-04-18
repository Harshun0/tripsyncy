import { supabase } from '@/integrations/supabase/client';

export const ensureDirectConversation = async (otherUserId: string): Promise<string | null> => {
  const { data, error } = await supabase.functions.invoke('ensure-direct-conversation', {
    body: { otherUserId },
  });

  if (error) throw error;

  return data?.conversationId || null;
};