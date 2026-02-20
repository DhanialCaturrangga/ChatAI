-- ============================================
-- Supabase Real-Time Chat - Database Schema
-- Run this in Supabase Dashboard > SQL Editor
-- ============================================

-- 1. PROFILES TABLE (linked to auth.users)
create table if not exists profiles (
  id uuid primary key references auth.users on delete cascade,
  username text unique,
  full_name text,
  avatar_url text,
  updated_at timestamptz default now()
);

alter table profiles enable row level security;

create policy "Public profiles are viewable by everyone"
  on profiles for select
  to authenticated
  using (true);

create policy "Users can insert their own profile"
  on profiles for insert
  to authenticated
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update
  to authenticated
  using (auth.uid() = id);

-- Trigger: auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, username, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- 2. ROOMS TABLE
create table if not exists rooms (
  id uuid primary key default gen_random_uuid(),
  name text,
  type text not null default 'direct' check (type in ('direct', 'group')),
  created_by uuid references auth.users on delete set null,
  created_at timestamptz default now()
);

alter table rooms enable row level security;

create policy "Users can view rooms they belong to"
  on rooms for select
  to authenticated
  using (
    id in (
      select room_id from room_members
      where user_id = (select auth.uid())
    )
  );

create policy "Authenticated users can create rooms"
  on rooms for insert
  to authenticated
  with check (auth.uid() = created_by);


-- 3. ROOM_MEMBERS TABLE
create table if not exists room_members (
  id uuid primary key default gen_random_uuid(),
  room_id uuid references rooms on delete cascade not null,
  user_id uuid references auth.users on delete cascade not null,
  joined_at timestamptz default now(),
  unique (room_id, user_id)
);

alter table room_members enable row level security;

create policy "Users can view room members for their rooms"
  on room_members for select
  to authenticated
  using (
    room_id in (
      select room_id from room_members
      where user_id = (select auth.uid())
    )
  );

create policy "Users can join rooms"
  on room_members for insert
  to authenticated
  with check (auth.uid() = user_id);


-- 4. MESSAGES TABLE
create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  room_id uuid references rooms on delete cascade not null,
  user_id uuid references auth.users on delete cascade not null,
  content text not null,
  created_at timestamptz default now()
);

alter table messages enable row level security;

create policy "Users can read room messages"
  on messages for select
  to authenticated
  using (
    room_id in (
      select room_id from room_members
      where user_id = (select auth.uid())
    )
  );

create policy "Users can insert messages in their rooms"
  on messages for insert
  to authenticated
  with check (
    auth.uid() = user_id
    and room_id in (
      select room_id from room_members
      where user_id = (select auth.uid())
    )
  );


-- 5. ENABLE REALTIME for messages
alter publication supabase_realtime add table messages;
