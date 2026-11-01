-- 014_phase3_features.sql

-- 1. Researcher Output Links
CREATE TABLE IF NOT EXISTS researcher_output_links (
  id SERIAL PRIMARY KEY,
  researcher_id INT REFERENCES researcher_profiles(id) ON DELETE CASCADE,
  output_id INT REFERENCES research_outputs(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (researcher_id, output_id)
);

-- 2. Collaboration Requests
CREATE TABLE IF NOT EXISTS collaboration_requests (
  id SERIAL PRIMARY KEY,
  researcher_id INT REFERENCES researcher_profiles(id) ON DELETE CASCADE,
  sender_name VARCHAR(255) NOT NULL,
  sender_email VARCHAR(255) NOT NULL,
  sender_affiliation VARCHAR(255),
  subject VARCHAR(500) NOT NULL,
  message TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Full-Text Search tsvectors and GIN indexes
ALTER TABLE research_outputs ADD COLUMN IF NOT EXISTS search_vector tsvector;
ALTER TABLE publications     ADD COLUMN IF NOT EXISTS search_vector tsvector;
ALTER TABLE news             ADD COLUMN IF NOT EXISTS search_vector tsvector;
ALTER TABLE opportunities    ADD COLUMN IF NOT EXISTS search_vector tsvector;

-- Populate vectors
UPDATE research_outputs SET search_vector =
  to_tsvector('english', coalesce(title,'') || ' ' || coalesce(abstract,'') || ' ' || coalesce(authors_text,''));
UPDATE publications SET search_vector =
  to_tsvector('english', coalesce(title,'') || ' ' || coalesce(abstract,'') || ' ' || coalesce(authors_text,''));
UPDATE news SET search_vector =
  to_tsvector('english', coalesce(title,'') || ' ' || coalesce(content,''));
UPDATE opportunities SET search_vector =
  to_tsvector('english', coalesce(title,'') || ' ' || coalesce(description,''));

-- GIN indexes
CREATE INDEX IF NOT EXISTS idx_research_outputs_fts ON research_outputs USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS idx_publications_fts     ON publications     USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS idx_news_fts             ON news             USING GIN(search_vector);
CREATE INDEX IF NOT EXISTS idx_opportunities_fts    ON opportunities    USING GIN(search_vector);

-- Automatic Triggers to maintain search_vector on INSERT / UPDATE
CREATE OR REPLACE FUNCTION update_research_outputs_search_vector() RETURNS trigger AS $$
BEGIN
  NEW.search_vector := to_tsvector('english', coalesce(NEW.title,'') || ' ' || coalesce(NEW.abstract,'') || ' ' || coalesce(NEW.authors_text,''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_research_outputs_search_vector ON research_outputs;
CREATE TRIGGER trg_research_outputs_search_vector
BEFORE INSERT OR UPDATE ON research_outputs
FOR EACH ROW EXECUTE FUNCTION update_research_outputs_search_vector();

CREATE OR REPLACE FUNCTION update_publications_search_vector() RETURNS trigger AS $$
BEGIN
  NEW.search_vector := to_tsvector('english', coalesce(NEW.title,'') || ' ' || coalesce(NEW.abstract,'') || ' ' || coalesce(NEW.authors_text,''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_publications_search_vector ON publications;
CREATE TRIGGER trg_publications_search_vector
BEFORE INSERT OR UPDATE ON publications
FOR EACH ROW EXECUTE FUNCTION update_publications_search_vector();

CREATE OR REPLACE FUNCTION update_news_search_vector() RETURNS trigger AS $$
BEGIN
  NEW.search_vector := to_tsvector('english', coalesce(NEW.title,'') || ' ' || coalesce(NEW.content,''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_news_search_vector ON news;
CREATE TRIGGER trg_news_search_vector
BEFORE INSERT OR UPDATE ON news
FOR EACH ROW EXECUTE FUNCTION update_news_search_vector();

CREATE OR REPLACE FUNCTION update_opportunities_search_vector() RETURNS trigger AS $$
BEGIN
  NEW.search_vector := to_tsvector('english', coalesce(NEW.title,'') || ' ' || coalesce(NEW.description,''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_opportunities_search_vector ON opportunities;
CREATE TRIGGER trg_opportunities_search_vector
BEFORE INSERT OR UPDATE ON opportunities
FOR EACH ROW EXECUTE FUNCTION update_opportunities_search_vector();
