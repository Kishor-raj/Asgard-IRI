-- 016_add_affiliation_to_users.sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS affiliation VARCHAR(255);
