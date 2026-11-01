const pool = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const { uniqueSlug } = require('../utils/slugify');
const { logAction } = require('../utils/audit');

// GET /journals
exports.getJournals = asyncHandler(async (req, res) => {
  const { rows } = await pool.query(
    'SELECT * FROM journals WHERE is_active = true ORDER BY name ASC'
  );
  res.status(200).json({ success: true, data: rows });
});

// GET /journals/:id
exports.getJournalById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const isNumeric = /^\d+$/.test(id);
  const { rows } = await pool.query(
    isNumeric
      ? 'SELECT * FROM journals WHERE id = $1'
      : 'SELECT * FROM journals WHERE slug = $1',
    [id]
  );

  if (rows.length === 0) {
    return res.status(404).json({ success: false, error: 'Journal not found.' });
  }

  res.status(200).json({ success: true, data: rows[0] });
});

// Admin: POST /admin/journals
exports.createJournal = asyncHandler(async (req, res) => {
  const { name, description, issn, externalUrl, logoUrl, isActive } = req.body;
  const slug = await uniqueSlug('journals', name);

  const { rows } = await pool.query(
    `INSERT INTO journals (name, slug, description, issn, external_url, logo_url, is_active)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
    [name, slug, description, issn, externalUrl, logoUrl, isActive !== undefined ? isActive : true]
  );

  await logAction({
    userId: req.user.id,
    action: 'CREATE_JOURNAL',
    entityType: 'journal',
    entityId: rows[0].id,
    req,
  });

  res.status(201).json({ success: true, data: rows[0] });
});

// Admin: PUT /admin/journals/:id
exports.updateJournal = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, description, issn, externalUrl, logoUrl, isActive } = req.body;

  const { rows } = await pool.query(
    `UPDATE journals
     SET name = COALESCE($1, name),
         description = COALESCE($2, description),
         issn = $3,
         external_url = COALESCE($4, external_url),
         logo_url = $5,
         is_active = COALESCE($6, is_active),
         updated_at = NOW()
     WHERE id = $7 RETURNING *`,
    [name, description, issn, externalUrl, logoUrl, isActive, id]
  );

  if (rows.length === 0) {
    return res.status(404).json({ success: false, error: 'Journal not found.' });
  }

  await logAction({
    userId: req.user.id,
    action: 'UPDATE_JOURNAL',
    entityType: 'journal',
    entityId: id,
    req,
  });

  res.status(200).json({ success: true, data: rows[0] });
});

// Admin: DELETE /admin/journals/:id
exports.deleteJournal = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { rowCount } = await pool.query('DELETE FROM journals WHERE id = $1', [id]);

  if (rowCount === 0) {
    return res.status(404).json({ success: false, error: 'Journal not found.' });
  }

  await logAction({
    userId: req.user.id,
    action: 'DELETE_JOURNAL',
    entityType: 'journal',
    entityId: id,
    req,
  });

  res.status(200).json({ success: true, message: 'Journal deleted successfully.' });
});
