import React, { useEffect, useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface FollowersModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  mode: 'followers' | 'following';
  onViewProfile: (userId: string) => void;
}

interface UserItem {
  id: string;
  display_name: string;
  avatar_url: string | null;
  location: string | null;
}

const FollowersModal: React.FC<FollowersModalProps> = ({ isOpen, onClose, userId, mode, onViewProfile }) => {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;
    const load = async () => {
      setLoading(true);
      let userIds: string[] = [];

      if (mode === 'followers') {
        const { data } = await supabase
          .from('follows')
          .select('follower_id')
          .eq('following_id', userId)
          .eq('status', 'accepted');
        userIds = ((data || []) as any[]).map((r) => r.follower_id);
      } else {
        const { data } = await supabase
          .from('follows')
          .select('following_id')
          .eq('follower_id', userId)
          .eq('status', 'accepted');
        userIds = ((data || []) as any[]).map((r) => r.following_id);
      }

      if (userIds.length === 0) {
        setUsers([]);
        setLoading(false);
        return;
      }

      const { data: profiles } = await supabase
        .from('profiles')
        .select('id,display_name,avatar_url,location')
        .in('id', userIds);

      setUsers((profiles || []) as UserItem[]);
      setLoading(false);
    };
    load();
  }, [isOpen, userId, mode]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-md bg-background rounded-2xl shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 className="text-lg font-semibold text-foreground capitalize">{mode}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center"><X className="w-4 h-4" /></button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto">
          {loading ? (
            <div className="py-12 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" /></div>
          ) : users.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground text-sm">No {mode} yet</div>
          ) : (
            <div className="divide-y divide-border">
              {users.map((u) => (
                <button
                  key={u.id}
                  onClick={() => { onClose(); onViewProfile(u.id); }}
                  className="w-full flex items-center gap-3 px-5 py-3 hover:bg-muted/50 transition-colors text-left"
                >
                  <img
                    src={u.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&h=120&fit=crop&crop=face'}
                    alt={u.display_name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-foreground text-sm truncate">{u.display_name}</h4>
                    {u.location && <p className="text-xs text-muted-foreground truncate">{u.location}</p>}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FollowersModal;
