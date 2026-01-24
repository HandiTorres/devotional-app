-- Add preferred_pastor column to users table
-- This will be used to personalize the Ask Pastor feature with different pastors' teaching styles

ALTER TABLE users ADD COLUMN preferred_pastor text DEFAULT 'landon';

-- Add comment for documentation
COMMENT ON COLUMN users.preferred_pastor IS 'The pastor whose teaching style is used for the Ask feature. Default is landon.';
