-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Users table (extends Supabase auth)
create table users (
  id uuid references auth.users on delete cascade primary key,
  email text,
  gender text check (gender in ('him', 'her')),
  life_stage text,
  current_challenge text,
  family_situation text,
  onboarding_complete boolean default false,
  created_at timestamptz default now()
);

-- Streaks
create table streaks (
  user_id uuid references users on delete cascade primary key,
  current_streak int default 0,
  longest_streak int default 0,
  last_completed_date date,
  total_extensions int default 0
);

-- Daily completions
create table completions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users on delete cascade,
  completed_date date,
  devotional_content jsonb,
  time_spent_seconds int,
  created_at timestamptz default now(),
  unique(user_id, completed_date)
);

-- Donations (streak extensions + voluntary)
create table donations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users on delete cascade,
  amount_cents int,
  type text check (type in ('streak_extension', 'voluntary')),
  stripe_payment_id text,
  created_at timestamptz default now()
);

-- Enable Row Level Security
alter table users enable row level security;
alter table streaks enable row level security;
alter table completions enable row level security;
alter table donations enable row level security;

-- RLS Policies for users table
create policy "Users can view own profile"
  on users for select
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on users for insert
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on users for update
  using (auth.uid() = id);

-- RLS Policies for streaks table
create policy "Users can view own streaks"
  on streaks for select
  using (auth.uid() = user_id);

create policy "Users can insert own streaks"
  on streaks for insert
  with check (auth.uid() = user_id);

create policy "Users can update own streaks"
  on streaks for update
  using (auth.uid() = user_id);

-- RLS Policies for completions table
create policy "Users can view own completions"
  on completions for select
  using (auth.uid() = user_id);

create policy "Users can insert own completions"
  on completions for insert
  with check (auth.uid() = user_id);

-- RLS Policies for donations table
create policy "Users can view own donations"
  on donations for select
  using (auth.uid() = user_id);

create policy "Users can insert own donations"
  on donations for insert
  with check (auth.uid() = user_id);

-- Function to create user profile and streak on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email)
  values (new.id, new.email);

  insert into public.streaks (user_id)
  values (new.id);

  return new;
end;
$$ language plpgsql security definer;

-- Trigger to auto-create profile on signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Index for faster completion lookups
create index completions_user_date_idx on completions(user_id, completed_date);
create index donations_user_idx on donations(user_id);
