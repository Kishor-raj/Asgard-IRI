const pool = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');

// GET /home/summary
exports.getHomeSummary = asyncHandler(async (req, res) => {
  // 1. Featured projects (3)
  const { rows: projects } = await pool.query(
    `SELECT id, title, slug, abstract, status, created_at
     FROM research_projects
     WHERE status = 'active'
     ORDER BY created_at DESC
     LIMIT 3`
  );

  // 2. Featured publications (3)
  const { rows: publications } = await pool.query(
    `SELECT id, title, slug, authors_text, type, year, cover_url, is_featured
     FROM publications
     ORDER BY is_featured DESC, year DESC, created_at DESC
     LIMIT 3`
  );

  // 3. Upcoming conferences (2)
  const { rows: conferences } = await pool.query(
    `SELECT id, title, slug, theme, status, start_date, end_date, venue, mode
     FROM conferences
     WHERE status = 'upcoming' OR status = 'ongoing'
     ORDER BY start_date ASC
     LIMIT 2`
  );

  // 4. Open opportunities count
  const { rows: oppCount } = await pool.query(
    "SELECT COUNT(*) FROM opportunities WHERE status = 'open'"
  );

  // 5. Latest news (3)
  const { rows: news } = await pool.query(
    `SELECT id, title, slug, type, published_at, cover_image_url
     FROM news
     ORDER BY published_at DESC
     LIMIT 3`
  );

  res.status(200).json({
    success: true,
    data: {
      projects,
      publications,
      conferences,
      openOpportunitiesCount: parseInt(oppCount[0]?.count || 0, 10),
      news,
    },
  });
});
