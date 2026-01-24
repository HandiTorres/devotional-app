-- Daily devotionals cache (pre-completion)
-- Stores generated devotionals so refreshes don't trigger new API calls

create table daily_devotionals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users on delete cascade,
  date date not null,
  verse_reference text not null,
  devotional_content jsonb not null,
  created_at timestamptz default now(),
  unique(user_id, date)
);

-- Enable Row Level Security
alter table daily_devotionals enable row level security;

-- RLS Policies
create policy "Users can view own daily devotionals"
  on daily_devotionals for select
  using (auth.uid() = user_id);

create policy "Users can insert own daily devotionals"
  on daily_devotionals for insert
  with check (auth.uid() = user_id);

-- Index for fast lookups
create index daily_devotionals_user_date_idx on daily_devotionals(user_id, date);
