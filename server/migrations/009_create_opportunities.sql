-- 009_create_opportunities.sql
CREATE TABLE IF NOT EXISTS opportunities (
  id SERIAL PRIMARY KEY,
  category VARCHAR(50) NOT NULL, -- career, internship, ra, fellowship, student_project, volunteering, editorial, conference, trainer, grant
  title VARCHAR(500) NOT NULL,
  slug VARCHAR(500) UNIQUE NOT NULL,
  department VARCHAR(255),
  location VARCHAR(255),
  mode VARCHAR(50), -- remote, on-site, hybrid
  eligibility TEXT,
  description TEXT,
  responsibilities TEXT,
  required_skills TEXT,
  duration VARCHAR(100),
  seats INT,
  stipend_info VARCHAR(255),
  deadline DATE,
  status VARCHAR(50) DEFAULT 'open', -- open, closed
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS opportunity_applications (
  id SERIAL PRIMARY KEY,
  opportunity_id INT REFERENCES opportunities(id) ON DELETE CASCADE,
  user_id INT REFERENCES users(id) ON DELETE SET NULL,
  cover_letter TEXT,
  resume_url VARCHAR(500),
  status VARCHAR(50) DEFAULT 'applied', -- applied, under_review, shortlisted, selected, rejected
  applied_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
