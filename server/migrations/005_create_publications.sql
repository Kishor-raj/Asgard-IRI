-- 005_create_publications.sql
CREATE TABLE IF NOT EXISTS publications (
  id SERIAL PRIMARY KEY,
  type VARCHAR(50) NOT NULL, -- book, ebook, monograph, proceedings, report, technical, educational
  title VARCHAR(500) NOT NULL,
  slug VARCHAR(500) UNIQUE NOT NULL,
  authors_text TEXT,
  abstract TEXT,
  isbn VARCHAR(50),
  year INT,
  cover_url VARCHAR(500),
  pdf_url VARCHAR(500),
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
