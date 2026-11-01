-- 006_create_conferences.sql
CREATE TABLE IF NOT EXISTS conferences (
  id SERIAL PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  slug VARCHAR(500) UNIQUE NOT NULL,
  theme TEXT,
  status VARCHAR(50) DEFAULT 'upcoming', -- upcoming, ongoing, past
  start_date DATE,
  end_date DATE,
  venue VARCHAR(255),
  mode VARCHAR(50) DEFAULT 'hybrid', -- online, offline, hybrid
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS conference_submissions (
  id SERIAL PRIMARY KEY,
  conference_id INT REFERENCES conferences(id) ON DELETE CASCADE,
  user_id INT REFERENCES users(id) ON DELETE SET NULL,
  title VARCHAR(500) NOT NULL,
  abstract TEXT,
  authors_text TEXT,
  submission_type VARCHAR(50) DEFAULT 'abstract', -- abstract, full_paper
  file_url VARCHAR(500),
  status VARCHAR(50) DEFAULT 'submitted', -- submitted, accepted, rejected, revision_requested
  reviewer_notes TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS conference_registrations (
  id SERIAL PRIMARY KEY,
  conference_id INT REFERENCES conferences(id) ON DELETE CASCADE,
  user_id INT REFERENCES users(id) ON DELETE SET NULL,
  name VARCHAR(200) NOT NULL,
  email VARCHAR(255) NOT NULL,
  affiliation VARCHAR(255),
  designation VARCHAR(200),
  mode_preference VARCHAR(50),
  payment_status VARCHAR(50) DEFAULT 'dummy',
  registration_date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
