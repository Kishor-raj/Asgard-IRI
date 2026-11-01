-- 02_research_areas.sql
INSERT INTO research_areas (name, slug, description) VALUES
  ('Artificial Intelligence', 'artificial-intelligence', 'AI and machine learning research'),
  ('Bioinformatics', 'bioinformatics', 'Computational approaches to biological data'),
  ('Environmental Science', 'environmental-science', 'Climate, ecology and sustainability research'),
  ('Data Science', 'data-science', 'Statistical and computational data analysis'),
  ('Public Health', 'public-health', 'Epidemiology and community health research'),
  ('Education Technology', 'education-technology', 'Technology-enhanced learning research')
ON CONFLICT (slug) DO NOTHING;
