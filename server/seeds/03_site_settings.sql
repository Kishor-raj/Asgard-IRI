-- 03_site_settings.sql
INSERT INTO site_settings (key, value) VALUES
  ('public_school_active', 'false'),
  ('maintenance_mode',     'false'),
  ('site_tagline',         'Building institutional credibility through research, publication, education and collaboration.')
ON CONFLICT (key) DO NOTHING;
