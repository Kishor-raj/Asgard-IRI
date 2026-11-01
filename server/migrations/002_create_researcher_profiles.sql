-- 002_create_researcher_profiles.sql
CREATE TABLE IF NOT EXISTS researcher_profiles (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  designation VARCHAR(200),
  affiliation VARCHAR(255),
  orcid_url VARCHAR(500),
  google_scholar_url VARCHAR(500),
  scopus_url VARCHAR(500),
  research_interests TEXT,
  biography TEXT,
  cv_url VARCHAR(500),
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS researcher_publications (
  id SERIAL PRIMARY KEY,
  researcher_id INT REFERENCES researcher_profiles(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  journal VARCHAR(255),
  year INT,
  doi_url VARCHAR(500),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
