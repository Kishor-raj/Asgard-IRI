-- 004_create_journals.sql
CREATE TABLE IF NOT EXISTS journals (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  issn VARCHAR(50),
  external_url VARCHAR(500) NOT NULL,
  logo_url VARCHAR(500),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS journal_issues (
  id SERIAL PRIMARY KEY,
  journal_id INT REFERENCES journals(id) ON DELETE CASCADE,
  volume VARCHAR(50),
  issue_number VARCHAR(50),
  published_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS journal_articles (
  id SERIAL PRIMARY KEY,
  issue_id INT REFERENCES journal_issues(id) ON DELETE CASCADE,
  title VARCHAR(500) NOT NULL,
  authors_text TEXT,
  abstract TEXT,
  doi_url VARCHAR(500),
  pdf_url VARCHAR(500),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
