-- 008_create_certificates.sql
CREATE TABLE IF NOT EXISTS certificates (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE SET NULL,
  issued_for_type VARCHAR(50) NOT NULL, -- academy, conference, journal
  issued_for_id INT,
  issued_for_label VARCHAR(255),
  certificate_uid UUID DEFAULT gen_random_uuid(),
  pdf_url VARCHAR(500),
  issued_date DATE DEFAULT CURRENT_DATE,
  status VARCHAR(50) DEFAULT 'placeholder',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_certificates_uid ON certificates (certificate_uid);
