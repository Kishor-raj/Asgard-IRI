-- 007_create_academy.sql
CREATE TABLE IF NOT EXISTS academy_programs (
  id SERIAL PRIMARY KEY,
  type VARCHAR(50) NOT NULL, -- course, fdp, workshop, seminar, research_methodology, ai_ml, academic_writing
  title VARCHAR(500) NOT NULL,
  slug VARCHAR(500) UNIQUE NOT NULL,
  description TEXT,
  duration VARCHAR(100),
  mode VARCHAR(50),
  start_date DATE,
  end_date DATE,
  seats INT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS academy_registrations (
  id SERIAL PRIMARY KEY,
  program_id INT REFERENCES academy_programs(id) ON DELETE CASCADE,
  user_id INT REFERENCES users(id) ON DELETE SET NULL,
  name VARCHAR(200),
  email VARCHAR(255),
  affiliation VARCHAR(255),
  designation VARCHAR(200),
  status VARCHAR(50) DEFAULT 'applied', -- applied, confirmed, completed, cancelled
  payment_status VARCHAR(50) DEFAULT 'dummy',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
