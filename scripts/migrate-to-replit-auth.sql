-- Migration: Add Replit Auth support
-- Safe additive-only changes to support dual authentication system

-- 1. Create sessions table for express-session storage
CREATE TABLE IF NOT EXISTS sessions (
  sid VARCHAR PRIMARY KEY,
  sess JSONB NOT NULL,
  expire TIMESTAMP NOT NULL
);
CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON sessions(expire);

-- 2. Add Replit Auth fields to v2_users (nullable for backward compatibility)
ALTER TABLE v2_users ADD COLUMN IF NOT EXISTS replit_auth_id VARCHAR UNIQUE;
ALTER TABLE v2_users ADD COLUMN IF NOT EXISTS first_name TEXT;
ALTER TABLE v2_users ADD COLUMN IF NOT EXISTS last_name TEXT;
ALTER TABLE v2_users ADD COLUMN IF NOT EXISTS profile_image_url TEXT;

-- 3. Update plan default for new users (espresso is the free tier)
ALTER TABLE v2_users ALTER COLUMN plan SET DEFAULT 'espresso';

-- Verify schema
SELECT 'Migration completed successfully' as status;
