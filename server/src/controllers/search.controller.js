const pool = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');

// Phase 3: GET /search?q=&type=&yearFrom=&yearTo=&page=&limit=
exports.globalSearch = asyncHandler(async (req, res) => {
  const q = req.query.q?.trim();
  const type = req.query.type || 'all';
  const yearFrom = req.query.yearFrom ? parseInt(req.query.yearFrom, 10) : null;
  const yearTo = req.query.yearTo ? parseInt(req.query.yearTo, 10) : null;
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, parseInt(req.query.limit, 10) || 10);

  if (!q || q.length < 2) {
    return res.status(400).json({ success: false, error: 'Search query must be at least 2 characters.' });
  }

  // Construct tsquery term safely
  // Clean alphanumeric words
  const words = q
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(Boolean);

  const tsQueryTerm = words.length > 0 ? words.map((w) => `${w}:*`).join(' & ') : q;
  const fallbackTerm = `%${q}%`;

  const results = {
    outputs: [],
    publications: [],
    news: [],
    opportunities: [],
    researchers: [],
    counts: { outputs: 0, publications: 0, news: 0, opportunities: 0, researchers: 0, total: 0 },
  };

  try {
    // 1. Research Outputs FTS
    if (type === 'all' || type === 'outputs') {
      let query = `
        SELECT id, title, authors_text, type, year, slug, url,
               ts_rank_cd(search_vector, to_tsquery('english', $1)) AS rank
        FROM research_outputs
        WHERE search_vector @@ to_tsquery('english', $1)
      `;
      const params = [tsQueryTerm];

      if (yearFrom) {
        params.push(yearFrom);
        query += ` AND year >= $${params.length}`;
      }
      if (yearTo) {
        params.push(yearTo);
        query += ` AND year <= $${params.length}`;
      }

      query += ` ORDER BY rank DESC, year DESC LIMIT ${limit}`;
      const { rows } = await pool.query(query, params);
      results.outputs = rows;
      results.counts.outputs = rows.length;
    }

    // 2. Publications FTS
    if (type === 'all' || type === 'publications') {
      let query = `
        SELECT id, title, authors_text, type, year, slug, pdf_url as doi_url,
               ts_rank_cd(search_vector, to_tsquery('english', $1)) AS rank
        FROM publications
        WHERE search_vector @@ to_tsquery('english', $1)
      `;
      const params = [tsQueryTerm];

      if (yearFrom) {
        params.push(yearFrom);
        query += ` AND year >= $${params.length}`;
      }
      if (yearTo) {
        params.push(yearTo);
        query += ` AND year <= $${params.length}`;
      }

      query += ` ORDER BY rank DESC, year DESC LIMIT ${limit}`;
      const { rows } = await pool.query(query, params);
      results.publications = rows;
      results.counts.publications = rows.length;
    }

    // 3. News & Media FTS
    if (type === 'all' || type === 'news') {
      const { rows } = await pool.query(
        `SELECT id, title, slug, type, published_at,
                ts_rank_cd(search_vector, to_tsquery('english', $1)) AS rank
         FROM news
         WHERE search_vector @@ to_tsquery('english', $1)
         ORDER BY rank DESC, published_at DESC LIMIT ${limit}`,
        [tsQueryTerm]
      );
      results.news = rows;
      results.counts.news = rows.length;
    }

    // 4. Opportunities FTS
    if (type === 'all' || type === 'opportunities') {
      const { rows } = await pool.query(
        `SELECT id, title, slug, category, department, mode, deadline,
                ts_rank_cd(search_vector, to_tsquery('english', $1)) AS rank
         FROM opportunities
         WHERE status = 'open' AND search_vector @@ to_tsquery('english', $1)
         ORDER BY rank DESC, deadline ASC LIMIT ${limit}`,
        [tsQueryTerm]
      );
      results.opportunities = rows;
      results.counts.opportunities = rows.length;
    }

    // 5. Researchers
    if (type === 'all' || type === 'researchers') {
      const { rows } = await pool.query(
        `SELECT rp.id, u.full_name, rp.designation, rp.affiliation, rp.research_interests
         FROM researcher_profiles rp
         JOIN users u ON rp.user_id = u.id
         WHERE rp.is_public = true AND (u.full_name ILIKE $1 OR rp.research_interests ILIKE $1 OR rp.affiliation ILIKE $1)
         LIMIT ${limit}`,
        [fallbackTerm]
      );
      results.researchers = rows;
      results.counts.researchers = rows.length;
    }
  } catch (err) {
    // Fallback to ILIKE if tsquery syntax fails on specific inputs
    console.warn('FTS query fallback to ILIKE:', err.message);

    if (type === 'all' || type === 'outputs') {
      const { rows } = await pool.query(
        'SELECT id, title, authors_text, type, year, slug, url FROM research_outputs WHERE title ILIKE $1 OR authors_text ILIKE $1 LIMIT 10',
        [fallbackTerm]
      );
      results.outputs = rows;
    }
    if (type === 'all' || type === 'publications') {
      const { rows } = await pool.query(
        'SELECT id, title, authors_text, type, year, slug, pdf_url as doi_url FROM publications WHERE title ILIKE $1 OR authors_text ILIKE $1 LIMIT 10',
        [fallbackTerm]
      );
      results.publications = rows;
    }
    if (type === 'all' || type === 'news') {
      const { rows } = await pool.query(
        'SELECT id, title, slug, type, published_at FROM news WHERE title ILIKE $1 OR content ILIKE $1 LIMIT 10',
        [fallbackTerm]
      );
      results.news = rows;
    }
    if (type === 'all' || type === 'opportunities') {
      const { rows } = await pool.query(
        'SELECT id, title, slug, category, department, mode, deadline FROM opportunities WHERE status = $1 AND (title ILIKE $2 OR department ILIKE $2) LIMIT 10',
        ['open', fallbackTerm]
      );
      results.opportunities = rows;
    }
    if (type === 'all' || type === 'researchers') {
      const { rows } = await pool.query(
        `SELECT rp.id, u.full_name, rp.designation, rp.affiliation, rp.research_interests
         FROM researcher_profiles rp
         JOIN users u ON rp.user_id = u.id
         WHERE rp.is_public = true AND (u.full_name ILIKE $1 OR rp.research_interests ILIKE $1) LIMIT 10`,
        [fallbackTerm]
      );
      results.researchers = rows;
    }
  }

  results.counts.total =
    results.outputs.length +
    results.publications.length +
    results.news.length +
    results.opportunities.length +
    results.researchers.length;

  res.status(200).json({ success: true, data: results, query: q });
});
