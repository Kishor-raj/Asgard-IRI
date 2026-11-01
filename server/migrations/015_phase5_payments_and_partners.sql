-- 015_phase5_payments_and_partners.sql

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE SET NULL,
  entity_type VARCHAR(50) NOT NULL, -- conference_registration | academy_registration
  entity_id INT NOT NULL,
  gateway VARCHAR(50) DEFAULT 'razorpay',
  order_id VARCHAR(100),
  payment_id VARCHAR(100),
  amount NUMERIC(10,2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'INR',
  status VARCHAR(50) DEFAULT 'created', -- created | paid | failed | refunded
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments (user_id);
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments (order_id);
CREATE INDEX IF NOT EXISTS idx_payments_entity ON payments (entity_type, entity_id);

-- Partners table
CREATE TABLE IF NOT EXISTS partners (
  id SERIAL PRIMARY KEY,
  organisation_name VARCHAR(255) NOT NULL,
  logo_url VARCHAR(500),
  website_url VARCHAR(500),
  collaboration_type VARCHAR(100) DEFAULT 'academic', -- academic | industry | institutional | research
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_partners_active ON partners (is_active);

-- Seed initial partner organisations if none exist
INSERT INTO partners (organisation_name, logo_url, website_url, collaboration_type, is_active)
SELECT 'Global Innovation Institute', '/uploads/partners/gii.png', 'https://example.org/gii', 'institutional', true
WHERE NOT EXISTS (SELECT 1 FROM partners WHERE organisation_name = 'Global Innovation Institute');

INSERT INTO partners (organisation_name, logo_url, website_url, collaboration_type, is_active)
SELECT 'Apex Quantum Research Labs', '/uploads/partners/apex.png', 'https://example.org/apex', 'research', true
WHERE NOT EXISTS (SELECT 1 FROM partners WHERE organisation_name = 'Apex Quantum Research Labs');

INSERT INTO partners (organisation_name, logo_url, website_url, collaboration_type, is_active)
SELECT 'Nordic Advanced AI Consortium', '/uploads/partners/naic.png', 'https://example.org/naic', 'academic', true
WHERE NOT EXISTS (SELECT 1 FROM partners WHERE organisation_name = 'Nordic Advanced AI Consortium');
