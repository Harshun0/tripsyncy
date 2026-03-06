-- Improve data integrity and realtime behavior for social + messaging features

-- 1) Ensure profile defaults support first-time user onboarding
alter table public.profiles
  alter column display_name set default 'Traveler',
  alter column interests set default '{}'::text[];

-- 2) Add integrity constraints
create unique index if not exists uq_post_likes_post_user on public.post_likes (post_id, user_id);
create unique index if not exists uq_saved_posts_post_user on public.saved_posts (post_id, user_id);
create unique index if not exists uq_follows_pair on public.follows (follower_id, following_id);

-- Prevent self-follow
alter table public.follows
  drop constraint if exists follows_no_self_follow;
alter table public.follows
  add constraint follows_no_self_follow check (follower_id <> following_id);

-- 3) Add useful indexes
create index if not exists idx_posts_created_at on public.posts (created_at desc);
create index if not exists idx_comments_post_created on public.post_comments (post_id, created_at desc);
create index if not exists idx_notifications_user_created on public.notifications (user_id, created_at desc);
create index if not exists idx_chat_conversations_user_updated on public.chat_conversations (user_id, updated_at desc);
create index if not exists idx_chat_messages_conversation_created on public.chat_messages (conversation_id, created_at asc);
create index if not exists idx_dm_conversation_created on public.direct_messages (conversation_id, created_at asc);

-- 4) Fix broken conversation RLS policies (self-referencing aliases)
drop policy if exists "Conversations visible to participants" on public.conversations;
create policy "Conversations visible to participants"
on public.conversations
for select
using (
  exists (
    select 1
    from public.conversation_participants cp
    where cp.conversation_id = conversations.id
      and cp.user_id = auth.uid()
  )
);

drop policy if exists "Participants visible to participants" on public.conversation_participants;
create policy "Participants visible to participants"
on public.conversation_participants
for select
using (
  user_id = auth.uid()
  or exists (
    select 1
    from public.conversation_participants cp
    where cp.conversation_id = conversation_participants.conversation_id
      and cp.user_id = auth.uid()
  )
);

drop policy if exists "Messages visible to participants" on public.direct_messages;
create policy "Messages visible to participants"
on public.direct_messages
for select
using (
  exists (
    select 1
    from public.conversation_participants cp
    where cp.conversation_id = direct_messages.conversation_id
      and cp.user_id = auth.uid()
  )
);

drop policy if exists "Messages insert by participant" on public.direct_messages;
create policy "Messages insert by participant"
on public.direct_messages
for insert
with check (
  sender_id = auth.uid()
  and exists (
    select 1
    from public.conversation_participants cp
    where cp.conversation_id = direct_messages.conversation_id
      and cp.user_id = auth.uid()
  )
);

-- 5) Notification trigger for follows
create or replace function public.create_follow_notification()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.notifications (user_id, actor_id, entity_id, entity_type, type, title, body)
    values (
      new.following_id,
      new.follower_id,
      new.id,
      'follow',
      case when new.status = 'accepted' then 'follow_accepted' else 'follow_request' end,
      case when new.status = 'accepted' then 'New follower' else 'New follow request' end,
      case when new.status = 'accepted' then 'Someone started following you' else 'Someone requested to follow you' end
    );
  elsif tg_op = 'UPDATE' and old.status <> new.status and new.status = 'accepted' then
    insert into public.notifications (user_id, actor_id, entity_id, entity_type, type, title, body)
    values (
      old.follower_id,
      new.following_id,
      new.id,
      'follow',
      'follow_request_accepted',
      'Follow request accepted',
      'Your follow request was accepted'
    );
  end if;

  return new;
end;
$$;

drop trigger if exists trg_follow_notifications on public.follows;
create trigger trg_follow_notifications
after insert or update on public.follows
for each row
execute function public.create_follow_notification();

-- 6) Notification trigger for likes + comments on posts
create or replace function public.create_post_interaction_notification()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_post_owner uuid;
begin
  if tg_table_name = 'post_likes' then
    select p.user_id into v_post_owner from public.posts p where p.id = new.post_id;
    if v_post_owner is not null and v_post_owner <> new.user_id then
      insert into public.notifications (user_id, actor_id, entity_id, entity_type, type, title, body)
      values (v_post_owner, new.user_id, new.post_id, 'post', 'post_like', 'New like', 'Someone liked your post');
    end if;
  elsif tg_table_name = 'post_comments' then
    select p.user_id into v_post_owner from public.posts p where p.id = new.post_id;
    if v_post_owner is not null and v_post_owner <> new.user_id then
      insert into public.notifications (user_id, actor_id, entity_id, entity_type, type, title, body)
      values (v_post_owner, new.user_id, new.post_id, 'post', 'post_comment', 'New comment', coalesce(left(new.content, 120), 'Someone commented on your post'));
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_like_notifications on public.post_likes;
create trigger trg_like_notifications
after insert on public.post_likes
for each row
execute function public.create_post_interaction_notification();

drop trigger if exists trg_comment_notifications on public.post_comments;
create trigger trg_comment_notifications
after insert on public.post_comments
for each row
execute function public.create_post_interaction_notification();

-- 7) Keep chat conversation updated_at fresh when new message arrives
create or replace function public.bump_chat_conversation_updated_at()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.chat_conversations
  set updated_at = now()
  where id = new.conversation_id;
  return new;
end;
$$;

drop trigger if exists trg_bump_chat_conversation_updated_at on public.chat_messages;
create trigger trg_bump_chat_conversation_updated_at
after insert on public.chat_messages
for each row
execute function public.bump_chat_conversation_updated_at();

-- 8) Enable realtime for key tables
alter publication supabase_realtime add table public.notifications;
alter publication supabase_realtime add table public.direct_messages;
alter publication supabase_realtime add table public.follows;
alter publication supabase_realtime add table public.post_likes;
alter publication supabase_realtime add table public.post_comments;
alter publication supabase_realtime add table public.posts;