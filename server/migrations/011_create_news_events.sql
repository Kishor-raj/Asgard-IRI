-- 011_create_news_events.sql
CREATE TABLE IF NOT EXISTS news (
  id SERIAL PRIMARY KEY,
  type VARCHAR(50) NOT NULL, -- news, announcement, press_release, research_highlight, conference_report, training_update, award
  title VARCHAR(500) NOT NULL,
  slug VARCHAR(500) UNIQUE NOT NULL,
  content TEXT,
  author_id INT REFERENCES users(id) ON DELETE SET NULL,
  published_at TIMESTAMPTZ DEFAULT NOW(),
  is_featured BOOLEAN DEFAULT false,
  cover_image_url VARCHAR(500),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS events (
  id SERIAL PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  slug VARCHAR(500) UNIQUE NOT NULL,
  description TEXT,
  event_date TIMESTAMPTZ,
  location VARCHAR(255),
  mode VARCHAR(50) DEFAULT 'offline',
  registration_url VARCHAR(500),
  cover_image_url VARCHAR(500),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS gallery (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255),
  media_url VARCHAR(500) NOT NULL,
  media_type VARCHAR(50) DEFAULT 'image', -- image, video
  related_type VARCHAR(50),
  related_id INT,
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
