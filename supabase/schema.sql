-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- PROFILES
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  display_name text,
  daily_goal_minutes integer default 60,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- COURSES
create table public.courses (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  platform text,
  url text,
  status text default 'Not Started', -- 'Not Started', 'In Progress', 'Completed'
  type text default 'Course', -- 'Course', 'Book', 'Project', 'Other'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- COURSE NOTES
create table public.course_notes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  course_id uuid references public.courses(id) on delete cascade not null,
  title text not null,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- MODULES
create table public.modules (
  id uuid default gen_random_uuid() primary key,
  course_id uuid references public.courses(id) on delete cascade not null,
  title text not null,
  order_num integer,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- STUDY SESSIONS
create table public.study_sessions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  course_id uuid references public.courses(id) on delete cascade not null,
  module_id uuid references public.modules(id) on delete set null,
  start_time timestamp with time zone not null,
  end_time timestamp with time zone not null,
  duration_seconds integer not null,
  notes text,
  study_type text, -- 'Video', 'Reading', 'Practice', 'Other'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- DAILY STATS VIEW
create or replace view public.daily_stats as
select
  user_id,
  date(start_time) as date,
  sum(duration_seconds) / 60 as total_minutes
from
  public.study_sessions
group by
  user_id,
  date(start_time);

-- ROW LEVEL SECURITY
alter table public.profiles enable row level security;
alter table public.courses enable row level security;
alter table public.course_notes enable row level security;
alter table public.modules enable row level security;
alter table public.study_sessions enable row level security;

-- POLICIES

-- Profiles
create policy "Users can view their own profile"
  on public.profiles for select
  using ( auth.uid() = id );

create policy "Users can update their own profile"
  on public.profiles for update
  using ( auth.uid() = id );

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check ( auth.uid() = id );

-- Courses
create policy "Users can view their own courses"
  on public.courses for select
  using ( auth.uid() = user_id );

create policy "Users can insert their own courses"
  on public.courses for insert
  with check ( auth.uid() = user_id );

create policy "Users can update their own courses"
  on public.courses for update
  using ( auth.uid() = user_id );

create policy "Users can delete their own courses"
  on public.courses for delete
  using ( auth.uid() = user_id );

-- Modules
-- Access control for modules is based on the course they belong to.
create policy "Users can view modules of their courses"
  on public.modules for select
  using ( exists ( select 1 from public.courses where id = modules.course_id and user_id = auth.uid() ) );

create policy "Users can insert modules to their courses"
  on public.modules for insert
  with check ( exists ( select 1 from public.courses where id = modules.course_id and user_id = auth.uid() ) );

create policy "Users can update modules of their courses"
  on public.modules for update
  using ( exists ( select 1 from public.courses where id = modules.course_id and user_id = auth.uid() ) );

create policy "Users can delete modules of their courses"
  on public.modules for delete
  using ( exists ( select 1 from public.courses where id = modules.course_id and user_id = auth.uid() ) );

-- Course Notes
create policy "Users can view their own course notes"
  on public.course_notes for select
  using ( auth.uid() = user_id );

create policy "Users can insert their own course notes"
  on public.course_notes for insert
  with check ( auth.uid() = user_id );

create policy "Users can update their own course notes"
  on public.course_notes for update
  using ( auth.uid() = user_id );

create policy "Users can delete their own course notes"
  on public.course_notes for delete
  using ( auth.uid() = user_id );

-- Study Sessions
create policy "Users can view their own study sessions"
  on public.study_sessions for select
  using ( auth.uid() = user_id );

create policy "Users can insert their own study sessions"
  on public.study_sessions for insert
  with check ( auth.uid() = user_id );

create policy "Users can update their own study sessions"
  on public.study_sessions for update
  using ( auth.uid() = user_id );

create policy "Users can delete their own study sessions"
  on public.study_sessions for delete
  using ( auth.uid() = user_id );

-- FUNCTIONS & TRIGGERS

-- Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for new user signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
