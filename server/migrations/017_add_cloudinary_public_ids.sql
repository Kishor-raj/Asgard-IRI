-- Migration 017: Add Cloudinary public_id tracking columns

ALTER TABLE opportunity_applications
  ADD COLUMN IF NOT EXISTS resume_public_id VARCHAR(255);

ALTER TABLE conference_submissions
  ADD COLUMN IF NOT EXISTS file_public_id VARCHAR(255);

ALTER TABLE innovation_applications
  ADD COLUMN IF NOT EXISTS brief_public_id VARCHAR(255);

ALTER TABLE certificates
  ADD COLUMN IF NOT EXISTS pdf_public_id VARCHAR(255);

ALTER TABLE researcher_profiles
  ADD COLUMN IF NOT EXISTS photo_public_id VARCHAR(255);

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS photo_public_id VARCHAR(255);

ALTER TABLE gallery
  ADD COLUMN IF NOT EXISTS media_public_id VARCHAR(255);

ALTER TABLE publications
  ADD COLUMN IF NOT EXISTS cover_public_id VARCHAR(255);

ALTER TABLE conferences
  ADD COLUMN IF NOT EXISTS cover_image_url VARCHAR(500),
  ADD COLUMN IF NOT EXISTS cover_public_id VARCHAR(255);

ALTER TABLE academy_programs
  ADD COLUMN IF NOT EXISTS cover_image_url VARCHAR(500),
  ADD COLUMN IF NOT EXISTS cover_public_id VARCHAR(255);

ALTER TABLE partners
  ADD COLUMN IF NOT EXISTS logo_public_id VARCHAR(255);

