-- Forge progress table (may already exist - use IF NOT EXISTS)
CREATE TABLE IF NOT EXISTS forge_progress (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date date NOT NULL,
  challenge_text text,
  challenge_verse text,
  weekly_theme text,
  completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, date)
);

ALTER TABLE forge_progress ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'forge_progress' AND policyname = 'Users can manage own forge progress'
  ) THEN
    CREATE POLICY "Users can manage own forge progress" ON forge_progress
      FOR ALL USING (auth.uid() = user_id);
  END IF;
END $$;

-- Garden progress table
CREATE TABLE IF NOT EXISTS garden_progress (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date date NOT NULL,
  seed_text text,
  seed_verse text,
  weekly_theme text,
  completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, date)
);

ALTER TABLE garden_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own garden progress" ON garden_progress
  FOR ALL USING (auth.uid() = user_id);

-- Dark mode column on users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS dark_mode boolean DEFAULT false;
