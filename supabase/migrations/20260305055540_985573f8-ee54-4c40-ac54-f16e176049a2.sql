-- Extensions
create extension if not exists "pgcrypto";

-- Update timestamp helper
create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Profiles
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'Traveler',
  username text unique,
  bio text,
  location text,
  avatar_url text,
  cover_url text,
  budget text default 'Mid-Range',
  personality text default 'Ambivert',
  interests text[] not null default '{}',
  phone text,
  dark_mode boolean not null default false,
  notifications_enabled boolean not null default true,
  profile_visibility text not null default 'public',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profile_visibility_check check (profile_visibility in ('public','connections','private'))
);

alter table public.profiles enable row level security;

drop policy if exists "Profiles are readable to authenticated users" on public.profiles;
create policy "Profiles are readable to authenticated users"
on public.profiles
for select
to authenticated
using (true);

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile"
on public.profiles
for insert
to authenticated
with check (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

-- Auto-create profiles on signup
create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', 'Traveler'))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_profile on auth.users;
create trigger on_auth_user_created_profile
after insert on auth.users
for each row execute function public.handle_new_user_profile();

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.update_updated_at_column();

-- Posts
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  caption text,
  media_url text,
  location text,
  is_public boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.posts enable row level security;

create index if not exists idx_posts_user_id on public.posts(user_id);
create index if not exists idx_posts_created_at on public.posts(created_at desc);

-- Likes / comments / saves
create table if not exists public.post_likes (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(post_id, user_id)
);

create table if not exists public.post_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.saved_posts (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(post_id, user_id)
);

alter table public.post_likes enable row level security;
alter table public.post_comments enable row level security;
alter table public.saved_posts enable row level security;

create index if not exists idx_post_likes_post_id on public.post_likes(post_id);
create index if not exists idx_post_comments_post_id on public.post_comments(post_id);

-- Follows
create table if not exists public.follows (
  id uuid primary key default gen_random_uuid(),
  follower_id uuid not null references public.profiles(id) on delete cascade,
  following_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(follower_id, following_id),
  constraint follows_status_check check (status in ('pending','accepted','rejected')),
  constraint follows_not_self check (follower_id <> following_id)
);

alter table public.follows enable row level security;
create index if not exists idx_follows_following on public.follows(following_id, status);

-- Expenses
create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null references public.profiles(id) on delete cascade,
  trip_id uuid,
  title text not null,
  amount numeric(12,2) not null,
  paid_by uuid not null references public.profiles(id) on delete cascade,
  split_with uuid[] not null default '{}',
  status text not null default 'pending',
  payment_method text,
  upi_id text,
  payment_link text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint expenses_status_check check (status in ('pending','paid'))
);

alter table public.expenses enable row level security;

-- Trips
create table if not exists public.trips (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  destination text not null,
  start_date date,
  end_date date,
  budget numeric(12,2) not null default 0,
  max_people integer not null default 1,
  current_people integer not null default 1,
  description text,
  interests text[] not null default '{}',
  status text not null default 'planning',
  is_public boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint trips_status_check check (status in ('planning','booked','ongoing','completed','cancelled'))
);

alter table public.trips enable row level security;

create table if not exists public.trip_members (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid not null references public.trips(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null default 'member',
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  unique(trip_id, user_id),
  constraint trip_members_status_check check (status in ('pending','accepted','rejected'))
);

alter table public.trip_members enable row level security;

-- Reviews
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  reviewer_id uuid not null references public.profiles(id) on delete cascade,
  reviewee_id uuid not null references public.profiles(id) on delete cascade,
  trip_id uuid references public.trips(id) on delete set null,
  rating integer not null,
  content text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint reviews_rating_check check (rating between 1 and 5),
  constraint reviews_not_self check (reviewer_id <> reviewee_id)
);

alter table public.reviews enable row level security;

-- Direct messaging
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.conversation_participants (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(conversation_id, user_id)
);

create table if not exists public.direct_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);

alter table public.conversations enable row level security;
alter table public.conversation_participants enable row level security;
alter table public.direct_messages enable row level security;

-- App notifications
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  actor_id uuid references public.profiles(id) on delete set null,
  type text not null,
  title text not null,
  body text,
  entity_type text,
  entity_id uuid,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.notifications enable row level security;
create index if not exists idx_notifications_user_created on public.notifications(user_id, created_at desc);

-- AI chat persistence
create table if not exists public.chat_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null default 'New Chat',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.chat_conversations(id) on delete cascade,
  role text not null,
  content text not null,
  created_at timestamptz not null default now(),
  constraint chat_role_check check (role in ('user','assistant'))
);

alter table public.chat_conversations enable row level security;
alter table public.chat_messages enable row level security;

-- Storage buckets for profile/post images
insert into storage.buckets (id, name, public)
values ('profile-media', 'profile-media', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('post-media', 'post-media', true)
on conflict (id) do nothing;

-- RLS policies

drop policy if exists "Posts readable by authenticated" on public.posts;
create policy "Posts readable by authenticated" on public.posts
for select to authenticated
using (is_public = true or user_id = auth.uid());

drop policy if exists "Users can create own posts" on public.posts;
create policy "Users can create own posts" on public.posts
for insert to authenticated
with check (user_id = auth.uid());

drop policy if exists "Users can update own posts" on public.posts;
create policy "Users can update own posts" on public.posts
for update to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "Users can delete own posts" on public.posts;
create policy "Users can delete own posts" on public.posts
for delete to authenticated
using (user_id = auth.uid());

create policy "Likes readable by authenticated" on public.post_likes
for select to authenticated using (true);
create policy "Users can like as self" on public.post_likes
for insert to authenticated with check (user_id = auth.uid());
create policy "Users can unlike as self" on public.post_likes
for delete to authenticated using (user_id = auth.uid());

create policy "Comments readable by authenticated" on public.post_comments
for select to authenticated using (true);
create policy "Users can comment as self" on public.post_comments
for insert to authenticated with check (user_id = auth.uid());
create policy "Users can update own comments" on public.post_comments
for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "Users can delete own comments" on public.post_comments
for delete to authenticated using (user_id = auth.uid());

create policy "Saved posts readable by owner" on public.saved_posts
for select to authenticated using (user_id = auth.uid());
create policy "Users can save as self" on public.saved_posts
for insert to authenticated with check (user_id = auth.uid());
create policy "Users can unsave as self" on public.saved_posts
for delete to authenticated using (user_id = auth.uid());

create policy "Follows visible to involved users" on public.follows
for select to authenticated using (follower_id = auth.uid() or following_id = auth.uid() or status = 'accepted');
create policy "Users can create follow requests" on public.follows
for insert to authenticated with check (follower_id = auth.uid());
create policy "Users can update incoming follow requests" on public.follows
for update to authenticated using (following_id = auth.uid()) with check (following_id = auth.uid());
create policy "Users can delete own follow relation" on public.follows
for delete to authenticated using (follower_id = auth.uid() or following_id = auth.uid());

create policy "Expenses visible to involved users" on public.expenses
for select to authenticated
using (
  created_by = auth.uid() or paid_by = auth.uid() or auth.uid() = any(split_with)
);
create policy "Expenses insert by owner" on public.expenses
for insert to authenticated
with check (created_by = auth.uid());
create policy "Expenses update by owner" on public.expenses
for update to authenticated
using (created_by = auth.uid())
with check (created_by = auth.uid());
create policy "Expenses delete by owner" on public.expenses
for delete to authenticated
using (created_by = auth.uid());

create policy "Public trips visible" on public.trips
for select to authenticated using (is_public = true or user_id = auth.uid());
create policy "Users create own trips" on public.trips
for insert to authenticated with check (user_id = auth.uid());
create policy "Users update own trips" on public.trips
for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "Users delete own trips" on public.trips
for delete to authenticated using (user_id = auth.uid());

create policy "Trip members visible to trip owner or member" on public.trip_members
for select to authenticated using (
  user_id = auth.uid() or exists (
    select 1 from public.trips t where t.id = trip_id and t.user_id = auth.uid()
  )
);
create policy "Trip member insert by owner or self" on public.trip_members
for insert to authenticated with check (
  user_id = auth.uid() or exists (
    select 1 from public.trips t where t.id = trip_id and t.user_id = auth.uid()
  )
);
create policy "Trip member update by owner or self" on public.trip_members
for update to authenticated using (
  user_id = auth.uid() or exists (
    select 1 from public.trips t where t.id = trip_id and t.user_id = auth.uid()
  )
);

create policy "Reviews readable by authenticated" on public.reviews
for select to authenticated using (true);
create policy "Users create own reviews" on public.reviews
for insert to authenticated with check (reviewer_id = auth.uid());

create policy "Conversations visible to participants" on public.conversations
for select to authenticated using (
  exists (select 1 from public.conversation_participants cp where cp.conversation_id = id and cp.user_id = auth.uid())
);
create policy "Users create conversations" on public.conversations
for insert to authenticated with check (created_by = auth.uid());

create policy "Participants visible to participants" on public.conversation_participants
for select to authenticated using (
  user_id = auth.uid() or exists (select 1 from public.conversation_participants cp where cp.conversation_id = conversation_id and cp.user_id = auth.uid())
);
create policy "Participants insert if self" on public.conversation_participants
for insert to authenticated with check (user_id = auth.uid());

create policy "Messages visible to participants" on public.direct_messages
for select to authenticated using (
  exists (select 1 from public.conversation_participants cp where cp.conversation_id = conversation_id and cp.user_id = auth.uid())
);
create policy "Messages insert by participant" on public.direct_messages
for insert to authenticated with check (
  sender_id = auth.uid() and exists (select 1 from public.conversation_participants cp where cp.conversation_id = conversation_id and cp.user_id = auth.uid())
);

create policy "Notifications visible to owner" on public.notifications
for select to authenticated using (user_id = auth.uid());
create policy "Notifications insert for owner only by self" on public.notifications
for insert to authenticated with check (user_id = auth.uid());
create policy "Notifications update by owner" on public.notifications
for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "Chat conversations owner only" on public.chat_conversations
for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "Chat messages owner conversation only" on public.chat_messages
for all to authenticated using (
  exists (select 1 from public.chat_conversations c where c.id = conversation_id and c.user_id = auth.uid())
) with check (
  exists (select 1 from public.chat_conversations c where c.id = conversation_id and c.user_id = auth.uid())
);

-- Storage policies
create policy "Public read profile media"
on storage.objects for select
to public
using (bucket_id = 'profile-media');

create policy "Users upload own profile media"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'profile-media'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Users update own profile media"
on storage.objects for update
to authenticated
using (
  bucket_id = 'profile-media'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Users delete own profile media"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'profile-media'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Public read post media"
on storage.objects for select
to public
using (bucket_id = 'post-media');

create policy "Users upload own post media"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'post-media'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Users update own post media"
on storage.objects for update
to authenticated
using (
  bucket_id = 'post-media'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Users delete own post media"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'post-media'
  and auth.uid()::text = (storage.foldername(name))[1]
);

-- Triggers
create trigger posts_set_updated_at
before update on public.posts
for each row execute function public.update_updated_at_column();

create trigger follows_set_updated_at
before update on public.follows
for each row execute function public.update_updated_at_column();

create trigger expenses_set_updated_at
before update on public.expenses
for each row execute function public.update_updated_at_column();

create trigger trips_set_updated_at
before update on public.trips
for each row execute function public.update_updated_at_column();

create trigger reviews_set_updated_at
before update on public.reviews
for each row execute function public.update_updated_at_column();

create trigger post_comments_set_updated_at
before update on public.post_comments
for each row execute function public.update_updated_at_column();

create trigger conversations_set_updated_at
before update on public.conversations
for each row execute function public.update_updated_at_column();

create trigger chat_conversations_set_updated_at
before update on public.chat_conversations
for each row execute function public.update_updated_at_column();