-- 01_roles_and_admins.sql

INSERT INTO roles (name, description) VALUES
  ('super_admin', 'Full system access and root privileges'),
  ('foundation_admin', 'Foundation management and executive CMS privileges'),
  ('researcher', 'Researcher profile and publication management'),
  ('author', 'Author submissions and publication records'),
  ('reviewer', 'Peer reviewer for papers and proposals'),
  ('participant_applicant', 'Standard participant and applicant profile'),
  ('trainer_mentor', 'Trainer and mentor credentials'),
  ('content_editor', 'Content management and publishing'),
  ('journal_editor', 'Journal and issue management'),
  ('conference_admin', 'Conference management and paper reviews'),
  ('academy_admin', 'Academy programs and enrollment management'),
  ('publication_editor', 'Book and monograph catalog management'),
  ('technology_lab_admin', 'AI & Technology Lab project management'),
  ('innovation_admin', 'Innovation hub and hackathon management'),
  ('careers_hr_admin', 'Opportunities and careers management'),
  ('research_admin', 'Research operations and administration')
ON CONFLICT (name) DO NOTHING;

-- Insert super_admin and foundation_admin directly (never via public registration)
INSERT INTO users (email, password_hash, full_name, role, status)
VALUES
  ('superadmin@asgard-iri.org', '$2a$12$FuoJZAaHeMBg/RuVRLFUsuHiYBwylt4JBJqA5azsLO2TVOzpR8Klu', 'Super Admin', 'super_admin', 'active'),
  ('admin@asgard-iri.org',      '$2a$12$FuoJZAaHeMBg/RuVRLFUsuHiYBwylt4JBJqA5azsLO2TVOzpR8Klu', 'Foundation Admin', 'super_admin', 'active')
ON CONFLICT (email) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  role = EXCLUDED.role,
  status = EXCLUDED.status;

