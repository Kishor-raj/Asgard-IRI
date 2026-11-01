const pool = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const { uniqueSlug } = require('../utils/slugify');
const { logAction } = require('../utils/audit');
const { deleteFromCloudinary } = require('../utils/cloudinaryDelete');

// GET /publications
exports.getPublications = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, parseInt(req.query.limit, 10) || 12);
  const offset = (page - 1) * limit;

  const type = req.query.type || null;
  const year = req.query.year ? parseInt(req.query.year, 10) : null;
  const isFeatured = req.query.featured === 'true' ? true : null;

  let query = 'SELECT * FROM publications';
  const conditions = [];
  const params = [];

  if (type) {
    params.push(type);
    conditions.push(`type = $${params.length}`);
  }
  if (year) {
    params.push(year);
    conditions.push(`year = $${params.length}`);
  }
  if (isFeatured !== null) {
    params.push(isFeatured);
    conditions.push(`is_featured = $${params.length}`);
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }

  query += ` ORDER BY year DESC NULLS LAST, created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
  const queryParams = [...params, limit, offset];

  const { rows } = await pool.query(query, queryParams);

  let countQuery = 'SELECT COUNT(*) FROM publications';
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

// GET /publications/:slug
exports.getPublicationBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  const isNumeric = /^\d+$/.test(slug);

  const { rows } = await pool.query(
    isNumeric
      ? 'SELECT * FROM publications WHERE id = $1'
      : 'SELECT * FROM publications WHERE slug = $1',
    [slug]
  );

  if (rows.length === 0) {
    return res.status(404).json({ success: false, error: 'Publication not found.' });
  }

  res.status(200).json({ success: true, data: rows[0] });
});

// Admin: POST /admin/publications
exports.createPublication = asyncHandler(async (req, res) => {
  const { type, title, authorsText, abstract, isbn, year, pdfUrl, isFeatured } = req.body;
  const coverUrl = req.file ? req.file.path : req.body.coverUrl;
  const coverPublicId = req.file ? req.file.filename : null;
  const slug = await uniqueSlug('publications', title);

  const { rows } = await pool.query(
    `INSERT INTO publications (type, title, slug, authors_text, abstract, isbn, year, cover_url, cover_public_id, pdf_url, is_featured)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
    [type, title, slug, authorsText, abstract, isbn, year, coverUrl, coverPublicId, pdfUrl, isFeatured || false]
  );

  await logAction({
    userId: req.user.id,
    action: 'CREATE_PUBLICATION',
    entityType: 'publication',
    entityId: rows[0].id,
    req,
  });

  res.status(201).json({ success: true, data: rows[0] });
});

// Admin: PUT /admin/publications/:id
exports.updatePublication = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { type, title, authorsText, abstract, isbn, year, pdfUrl, isFeatured } = req.body;
  const coverUrl = req.file ? req.file.path : req.body.coverUrl;
  const coverPublicId = req.file ? req.file.filename : undefined;

  if (coverPublicId) {
    const { rows: oldPub } = await pool.query('SELECT cover_public_id FROM publications WHERE id = $1', [id]);
    if (oldPub[0]?.cover_public_id) {
      await deleteFromCloudinary(oldPub[0].cover_public_id, 'image');
    }
  }

  const { rows } = await pool.query(
    `UPDATE publications
     SET type = COALESCE($1, type),
         title = COALESCE($2, title),
         authors_text = COALESCE($3, authors_text),
         abstract = COALESCE($4, abstract),
         isbn = $5,
         year = $6,
         cover_url = COALESCE($7, cover_url),
         cover_public_id = COALESCE($8, cover_public_id),
         pdf_url = $9,
         is_featured = COALESCE($10, is_featured),
         updated_at = NOW()
     WHERE id = $11 RETURNING *`,
    [type, title, authorsText, abstract, isbn, year, coverUrl, coverPublicId, pdfUrl, isFeatured, id]
  );

  if (rows.length === 0) {
    return res.status(404).json({ success: false, error: 'Publication not found.' });
  }

  await logAction({
    userId: req.user.id,
    action: 'UPDATE_PUBLICATION',
    entityType: 'publication',
    entityId: id,
    req,
  });

  res.status(200).json({ success: true, data: rows[0] });
});

// Admin: DELETE /admin/publications/:id
exports.deletePublication = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { rows: pubRows } = await pool.query('SELECT cover_public_id FROM publications WHERE id = $1', [id]);
  if (pubRows.length === 0) {
    return res.status(404).json({ success: false, error: 'Publication not found.' });
  }

  if (pubRows[0].cover_public_id) {
    await deleteFromCloudinary(pubRows[0].cover_public_id, 'image');
  }

  await pool.query('DELETE FROM publications WHERE id = $1', [id]);

  await logAction({
    userId: req.user.id,
    action: 'DELETE_PUBLICATION',
    entityType: 'publication',
    entityId: id,
    req,
  });

  res.status(200).json({ success: true, message: 'Publication deleted successfully.' });
});
