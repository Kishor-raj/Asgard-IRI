const pool = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const { uniqueSlug } = require('../utils/slugify');
const { logAction } = require('../utils/audit');

// GET /research/areas
exports.getAreas = asyncHandler(async (req, res) => {
  const { rows } = await pool.query(
    'SELECT * FROM research_areas ORDER BY name ASC'
  );
  res.status(200).json({ success: true, data: rows });
});

// GET /research/projects
exports.getProjects = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, parseInt(req.query.limit, 10) || 12);
  const offset = (page - 1) * limit;
  const status = req.query.status || null;
  const areaId = req.query.areaId ? parseInt(req.query.areaId, 10) : null;

  let query = `
    SELECT p.*, u.full_name as pi_name
    FROM research_projects p
    LEFT JOIN users u ON p.pi_user_id = u.id
  `;
  const conditions = [];
  const params = [];

  if (status) {
    params.push(status);
    conditions.push(`p.status = $${params.length}`);
  }

  if (areaId) {
    params.push(areaId);
    conditions.push(`EXISTS (SELECT 1 FROM research_project_areas rpa WHERE rpa.project_id = p.id AND rpa.area_id = $${params.length})`);
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }

  query += ` ORDER BY p.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
  const queryParams = [...params, limit, offset];

  const { rows } = await pool.query(query, queryParams);

  // Count query
  let countQuery = 'SELECT COUNT(*) FROM research_projects p';
  if (conditions.length > 0) {
    countQuery += ' WHERE ' + conditions.join(' AND ');
  }
  const { rows: countRows } = await pool.query(countQuery, params);
  const total = parseInt(countRows[0].count, 10);

  res.status(200).json({
    success: true,
    data: rows,
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
  });
});

// GET /research/projects/:slug
exports.getProjectBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  const { rows } = await pool.query(
    `SELECT p.*, u.full_name as pi_name, u.email as pi_email
     FROM research_projects p
     LEFT JOIN users u ON p.pi_user_id = u.id
     WHERE p.slug = $1`,
    [slug]
  );

  if (rows.length === 0) {
    return res.status(404).json({ success: false, error: 'Project not found.' });
  }

  const project = rows[0];

  // Get project areas
  const { rows: areas } = await pool.query(
    `SELECT a.* FROM research_areas a
     JOIN research_project_areas rpa ON a.id = rpa.area_id
     WHERE rpa.project_id = $1`,
    [project.id]
  );
  project.areas = areas;

  res.status(200).json({ success: true, data: project });
});

// Admin: POST /admin/research/areas
exports.createArea = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  const slug = await uniqueSlug('research_areas', name);

  const { rows } = await pool.query(
    `INSERT INTO research_areas (name, slug, description)
     VALUES ($1, $2, $3) RETURNING *`,
    [name, slug, description]
  );

  await logAction({
    userId: req.user.id,
    action: 'CREATE_RESEARCH_AREA',
    entityType: 'research_area',
    entityId: rows[0].id,
    req,
  });

  res.status(201).json({ success: true, data: rows[0] });
});

// Admin: POST /admin/research/projects
exports.createProject = asyncHandler(async (req, res) => {
  const { title, abstract, piUserId, status, fundingSource, startDate, endDate, areaIds } = req.body;
  const slug = await uniqueSlug('research_projects', title);

  const { rows } = await pool.query(
    `INSERT INTO research_projects (title, slug, abstract, pi_user_id, status, funding_source, start_date, end_date)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
    [title, slug, abstract, piUserId || null, status || 'active', fundingSource || null, startDate || null, endDate || null]
  );

  const project = rows[0];

  if (Array.isArray(areaIds)) {
    for (const aId of areaIds) {
      await pool.query(
        'INSERT INTO research_project_areas (project_id, area_id) VALUES ($1, $2)',
        [project.id, aId]
      );
    }
  }

  await logAction({
    userId: req.user.id,
    action: 'CREATE_RESEARCH_PROJECT',
    entityType: 'research_project',
    entityId: project.id,
    req,
  });

  res.status(201).json({ success: true, data: project });
});

// Admin: PUT /admin/research/projects/:id
exports.updateProject = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, abstract, piUserId, status, fundingSource, startDate, endDate } = req.body;

  const { rows } = await pool.query(
    `UPDATE research_projects
     SET title = COALESCE($1, title),
         abstract = COALESCE($2, abstract),
         pi_user_id = $3,
         status = COALESCE($4, status),
         funding_source = $5,
         start_date = $6,
         end_date = $7,
         updated_at = NOW()
     WHERE id = $8 RETURNING *`,
    [title, abstract, piUserId, status, fundingSource, startDate, endDate, id]
  );

  if (rows.length === 0) {
    return res.status(404).json({ success: false, error: 'Project not found.' });
  }

  await logAction({
    userId: req.user.id,
    action: 'UPDATE_RESEARCH_PROJECT',
    entityType: 'research_project',
    entityId: id,
    req,
  });

  res.status(200).json({ success: true, data: rows[0] });
});

// Admin: DELETE /admin/research/projects/:id
exports.deleteProject = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { rowCount } = await pool.query('DELETE FROM research_projects WHERE id = $1', [id]);

  if (rowCount === 0) {
    return res.status(404).json({ success: false, error: 'Project not found.' });
  }

  await logAction({
    userId: req.user.id,
    action: 'DELETE_RESEARCH_PROJECT',
    entityType: 'research_project',
    entityId: id,
    req,
  });

  res.status(200).json({ success: true, message: 'Project deleted successfully.' });
});

// Phase 3: GET /research/outputs?author=&year=&type=&area=&q=&page=&limit=
exports.getResearchOutputs = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, parseInt(req.query.limit, 10) || 12);
  const offset = (page - 1) * limit;

  const author = req.query.author?.trim();
  const year = req.query.year ? parseInt(req.query.year, 10) : null;
  const type = req.query.type?.trim();
  const areaId = req.query.area ? parseInt(req.query.area, 10) : null;
  const q = req.query.q?.trim();

  let query = `
    SELECT ro.*, rp.title as project_title, rp.slug as project_slug
    FROM research_outputs ro
    LEFT JOIN research_projects rp ON ro.project_id = rp.id
  `;
  const conditions = [];
  const params = [];

  if (author) {
    params.push(`%${author}%`);
    conditions.push(`ro.authors_text ILIKE $${params.length}`);
  }

  if (year) {
    params.push(year);
    conditions.push(`ro.year = $${params.length}`);
  }

  if (type && type !== 'all') {
    params.push(type);
    conditions.push(`ro.type = $${params.length}`);
  }

  if (areaId) {
    params.push(areaId);
    conditions.push(`EXISTS (
      SELECT 1 FROM research_project_areas rpa 
      WHERE rpa.project_id = ro.project_id AND rpa.area_id = $${params.length}
    )`);
  }

  if (q && q.length >= 2) {
    params.push(`%${q}%`);
    conditions.push(`(ro.title ILIKE $${params.length} OR ro.abstract ILIKE $${params.length} OR ro.authors_text ILIKE $${params.length})`);
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }

  query += ` ORDER BY ro.year DESC NULLS LAST, ro.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
  const queryParams = [...params, limit, offset];

  const { rows } = await pool.query(query, queryParams);

  // Count total
  let countQuery = 'SELECT COUNT(*) FROM research_outputs ro';
  if (conditions.length > 0) {
    countQuery += ' WHERE ' + conditions.join(' AND ');
  }
  const { rows: countRows } = await pool.query(countQuery, params);
  const total = parseInt(countRows[0]?.count || 0, 10);

  res.status(200).json({
    success: true,
    data: rows,
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
  });
});

// Phase 3: GET /research/outputs/:slug
exports.getResearchOutputBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  const isNumeric = /^\d+$/.test(slug);

  const { rows } = await pool.query(
    isNumeric
      ? `SELECT ro.*, rp.title as project_title, rp.slug as project_slug
         FROM research_outputs ro
         LEFT JOIN research_projects rp ON ro.project_id = rp.id
         WHERE ro.id = $1`
      : `SELECT ro.*, rp.title as project_title, rp.slug as project_slug
         FROM research_outputs ro
         LEFT JOIN research_projects rp ON ro.project_id = rp.id
         WHERE ro.slug = $1`,
    [slug]
  );

  if (rows.length === 0) {
    return res.status(404).json({ success: false, error: 'Research output not found.' });
  }

  res.status(200).json({ success: true, data: rows[0] });
});

// Phase 3 Admin: POST /admin/research/outputs
exports.createResearchOutput = asyncHandler(async (req, res) => {
  const { projectId, type, title, authorsText, abstract, url, year } = req.body;
  const slug = await uniqueSlug('research_outputs', title);

  const { rows } = await pool.query(
    `INSERT INTO research_outputs (project_id, type, title, slug, authors_text, abstract, url, year)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
    [projectId || null, type || 'journal_article', title, slug, authorsText || '', abstract || '', url || null, year || new Date().getFullYear()]
  );

  await logAction({
    userId: req.user.id,
    action: 'CREATE_RESEARCH_OUTPUT',
    entityType: 'research_output',
    entityId: rows[0].id,
    req,
  });

  res.status(201).json({ success: true, data: rows[0] });
});

// Phase 3 Admin: PUT /admin/research/outputs/:id
exports.updateResearchOutput = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { projectId, type, title, authorsText, abstract, url, year } = req.body;

  const { rows } = await pool.query(
    `UPDATE research_outputs
     SET project_id = $1,
         type = COALESCE($2, type),
         title = COALESCE($3, title),
         authors_text = COALESCE($4, authors_text),
         abstract = COALESCE($5, abstract),
         url = $6,
         year = COALESCE($7, year),
         updated_at = NOW()
     WHERE id = $8 RETURNING *`,
    [projectId, type, title, authorsText, abstract, url, year, id]
  );

  if (rows.length === 0) {
    return res.status(404).json({ success: false, error: 'Research output not found.' });
  }

  await logAction({
    userId: req.user.id,
    action: 'UPDATE_RESEARCH_OUTPUT',
    entityType: 'research_output',
    entityId: id,
    req,
  });

  res.status(200).json({ success: true, data: rows[0] });
});

// Phase 3 Admin: DELETE /admin/research/outputs/:id
exports.deleteResearchOutput = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { rowCount } = await pool.query('DELETE FROM research_outputs WHERE id = $1', [id]);

  if (rowCount === 0) {
    return res.status(404).json({ success: false, error: 'Research output not found.' });
  }

  await logAction({
    userId: req.user.id,
    action: 'DELETE_RESEARCH_OUTPUT',
    entityType: 'research_output',
    entityId: id,
    req,
  });

  res.status(200).json({ success: true, message: 'Research output deleted successfully.' });
});

