-- 010_create_innovation.sql
CREATE TABLE IF NOT EXISTS innovation_programs (
  id SERIAL PRIMARY KEY,
  type VARCHAR(50) NOT NULL, -- hackathon, challenge, incubation
  title VARCHAR(500) NOT NULL,
  slug VARCHAR(500) UNIQUE NOT NULL,
  description TEXT,
  start_date DATE,
  end_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS innovation_applications (
  id SERIAL PRIMARY KEY,
  program_id INT REFERENCES innovation_programs(id) ON DELETE CASCADE,
  user_id INT REFERENCES users(id) ON DELETE SET NULL,
  team_name VARCHAR(255),
  member_names TEXT,
  project_title VARCHAR(500),
  brief_url VARCHAR(500),
  domain VARCHAR(255),
  status VARCHAR(50) DEFAULT 'applied',
  applied_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS mentors (
  id SERIAL PRIMARY KEY,
  full_name VARCHAR(200) NOT NULL,
  designation VARCHAR(200),
  organisation VARCHAR(255),
  domain_tags TEXT,
  bio TEXT,
  photo_url VARCHAR(500),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
