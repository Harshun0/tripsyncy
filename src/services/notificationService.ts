import { supabase } from '@/integrations/supabase/client';

export interface NotificationItem {
  id: string;
  type: string;
  title: string;
  body: string | null;
  created_at: string;
  is_read: boolean;
  actor_id: string | null;
  actor_name?: string;
}

export const fetchNotifications = async (userId: string): Promise<NotificationItem[]> => {
  const { data } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(20);

  if (!data) return [];

  const actorIds = [...new Set((data as any[]).filter(n => n.actor_id).map(n => n.actor_id))];
  let actorMap: Record<string, string> = {};
  if (actorIds.length > 0) {
    const { data: profiles } = await supabase.from('profiles').select('id,display_name').in('id', actorIds);
    (profiles || []).forEach((p: any) => { actorMap[p.id] = p.display_name; });
  }

  return (data as any[]).map(n => ({
    ...n,
    actor_name: n.actor_id ? actorMap[n.actor_id] : undefined,
  }));
};

export const markAllNotificationsRead = async (userId: string) => {
  await supabase.from('notifications').update({ is_read: true }).eq('user_id', userId).eq('is_read', false);
};
