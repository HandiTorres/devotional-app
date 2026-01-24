-- Expanded user profile fields for personalized devotionals
-- These fields capture deeper context about the user's faith journey

-- Age range
ALTER TABLE users ADD COLUMN age_range text;

-- Faith background
ALTER TABLE users ADD COLUMN faith_background text;
ALTER TABLE users ADD COLUMN faith_background_other text;

-- "Other" free-text fields for existing options
ALTER TABLE users ADD COLUMN life_stage_other text;
ALTER TABLE users ADD COLUMN challenge_other text;
ALTER TABLE users ADD COLUMN family_other text;

-- Primary goal
ALTER TABLE users ADD COLUMN primary_goal text;
ALTER TABLE users ADD COLUMN primary_goal_other text;

-- Free-form personal context
ALTER TABLE users ADD COLUMN personal_context text;

-- Add comments for documentation
COMMENT ON COLUMN users.age_range IS 'User age range: 18-24, 25-34, 35-44, 45-54, 55+, prefer_not_to_say';
COMMENT ON COLUMN users.faith_background IS 'Faith journey stage: new, few_years, lifelong, rediscovering, other';
COMMENT ON COLUMN users.faith_background_other IS 'Free text if faith_background is other';
COMMENT ON COLUMN users.life_stage_other IS 'Free text if life_stage is other';
COMMENT ON COLUMN users.challenge_other IS 'Free text if current_challenge is other';
COMMENT ON COLUMN users.family_other IS 'Free text if family_situation is other';
COMMENT ON COLUMN users.primary_goal IS 'Primary goal: peace, purpose, discipline, closer_to_god, community, other';
COMMENT ON COLUMN users.primary_goal_other IS 'Free text if primary_goal is other';
COMMENT ON COLUMN users.personal_context IS 'Free-form personal context shared during onboarding';
