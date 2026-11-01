-- 003_create_research.sql
CREATE TABLE IF NOT EXISTS research_areas (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  slug VARCHAR(200) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS research_projects (
  id SERIAL PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  slug VARCHAR(500) UNIQUE NOT NULL,
  abstract TEXT,
  pi_user_id INT REFERENCES users(id) ON DELETE SET NULL,
  status VARCHAR(50) DEFAULT 'active',
  funding_source VARCHAR(255),
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS research_project_areas (
  id SERIAL PRIMARY KEY,
  project_id INT REFERENCES research_projects(id) ON DELETE CASCADE,
  area_id INT REFERENCES research_areas(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS research_outputs (
  id SERIAL PRIMARY KEY,
  project_id INT REFERENCES research_projects(id) ON DELETE SET NULL,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(500) NOT NULL,
  slug VARCHAR(500),
  authors_text TEXT,
  abstract TEXT,
  url VARCHAR(500),
  year INT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS researcher_projects (
  id SERIAL PRIMARY KEY,
  researcher_id INT REFERENCES researcher_profiles(id) ON DELETE CASCADE,
  project_id INT REFERENCES research_projects(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
