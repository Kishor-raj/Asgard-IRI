-- 013_create_consultancy.sql
CREATE TABLE IF NOT EXISTS consultancy_requests (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  organisation VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  service_type VARCHAR(100) NOT NULL,
  project_description TEXT NOT NULL,
  budget_range VARCHAR(100),
  preferred_timeline VARCHAR(100),
  status VARCHAR(50) DEFAULT 'new', -- new, reviewed, in_discussion, engaged, closed
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
