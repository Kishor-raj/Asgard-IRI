const pool = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const { uniqueSlug } = require('../utils/slugify');
const { logAction } = require('../utils/audit');
const { deleteFromCloudinary } = require('../utils/cloudinaryDelete');

// GET /news
exports.getNews = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, parseInt(req.query.limit, 10) || 12);
  const offset = (page - 1) * limit;
  const type = req.query.type || null;

  let query = `
    SELECT n.*, u.full_name as author_name
    FROM news n
    LEFT JOIN users u ON n.author_id = u.id
  `;
  const conditions = [];
  const params = [];

  if (type && type !== 'all') {
    params.push(type);
    conditions.push(`n.type = $${params.length}`);
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }

  query += ` ORDER BY n.published_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
  const queryParams = [...params, limit, offset];

  const { rows } = await pool.query(query, queryParams);

  let countQuery = 'SELECT COUNT(*) FROM news n';
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

// GET /news/:slug
exports.getNewsBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  const isNumeric = /^\d+$/.test(slug);

  const { rows } = await pool.query(
    isNumeric
      ? `SELECT n.*, u.full_name as author_name FROM news n LEFT JOIN users u ON n.author_id = u.id WHERE n.id = $1`
      : `SELECT n.*, u.full_name as author_name FROM news n LEFT JOIN users u ON n.author_id = u.id WHERE n.slug = $1`,
    [slug]
  );

  if (rows.length === 0) {
    return res.status(404).json({ success: false, error: 'Article not found.' });
  }

  res.status(200).json({ success: true, data: rows[0] });
});

// GET /events
exports.getEvents = asyncHandler(async (req, res) => {
  const { rows } = await pool.query(
    'SELECT * FROM events ORDER BY event_date ASC'
  );
  res.status(200).json({ success: true, data: rows });
});

// GET /gallery
exports.getGallery = asyncHandler(async (req, res) => {
  const { rows } = await pool.query(
    'SELECT * FROM gallery ORDER BY uploaded_at DESC'
  );
  res.status(200).json({ success: true, data: rows });
});

// Admin: POST /admin/news
exports.createNews = asyncHandler(async (req, res) => {
  const { type, title, content, isFeatured, coverImageUrl } = req.body;
  const slug = await uniqueSlug('news', title);

  const { rows } = await pool.query(
    `INSERT INTO news (type, title, slug, content, author_id, is_featured, cover_image_url)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
    [type || 'news', title, slug, content, req.user?.id || null, isFeatured || false, coverImageUrl || null]
  );

  await logAction({
    userId: req.user.id,
    action: 'CREATE_NEWS',
    entityType: 'news',
    entityId: rows[0].id,
    req,
  });

  res.status(201).json({ success: true, data: rows[0] });
});

// Admin: POST /admin/events
exports.createEvent = asyncHandler(async (req, res) => {
  const { title, description, eventDate, location, mode, registrationUrl, coverImageUrl } = req.body;
  const slug = await uniqueSlug('events', title);

  const { rows } = await pool.query(
    `INSERT INTO events (title, slug, description, event_date, location, mode, registration_url, cover_image_url)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
    [title, slug, description, eventDate, location, mode || 'offline', registrationUrl, coverImageUrl]
  );

  await logAction({
    userId: req.user.id,
    action: 'CREATE_EVENT',
    entityType: 'event',
    entityId: rows[0].id,
    req,
  });

  res.status(201).json({ success: true, data: rows[0] });
});

// Admin: POST /admin/gallery
exports.createGallery = asyncHandler(async (req, res) => {
  const { title, mediaType, relatedType, relatedId } = req.body;
  const fileUrl = req.file ? req.file.path : req.body.mediaUrl;
  const mediaPublicId = req.file ? req.file.filename : null;

  if (!fileUrl) {
    return res.status(400).json({ success: false, error: 'Media file or URL is required.' });
  }

  const { rows } = await pool.query(
    `INSERT INTO gallery (title, media_url, media_public_id, media_type, related_type, related_id)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [title, fileUrl, mediaPublicId, mediaType || 'image', relatedType, relatedId]
  );

  await logAction({
    userId: req.user.id,
    action: 'UPLOAD_GALLERY',
    entityType: 'gallery',
    entityId: rows[0].id,
    req,
  });

  res.status(201).json({ success: true, data: rows[0] });
});

// Admin: PUT /admin/news/:id
exports.updateNews = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { type, title, content, isFeatured, coverImageUrl } = req.body;

  const { rows } = await pool.query(
    `UPDATE news
     SET type = COALESCE($1, type),
         title = COALESCE($2, title),
         content = COALESCE($3, content),
         is_featured = COALESCE($4, is_featured),
         cover_image_url = $5,
         updated_at = NOW()
     WHERE id = $6 RETURNING *`,
    [type, title, content, isFeatured, coverImageUrl, id]
  );

  if (rows.length === 0) {
    return res.status(404).json({ success: false, error: 'News item not found.' });
  }

  await logAction({
    userId: req.user.id,
    action: 'UPDATE_NEWS',
    entityType: 'news',
    entityId: id,
    req,
  });

  res.status(200).json({ success: true, data: rows[0] });
});

// Admin: DELETE /admin/news/:id
exports.deleteNews = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { rowCount } = await pool.query('DELETE FROM news WHERE id = $1', [id]);

  if (rowCount === 0) {
    return res.status(404).json({ success: false, error: 'News item not found.' });
  }

  await logAction({
    userId: req.user.id,
    action: 'DELETE_NEWS',
    entityType: 'news',
    entityId: id,
    req,
  });

  res.status(200).json({ success: true, message: 'News item deleted successfully.' });
});

// Admin: PUT /admin/events/:id
exports.updateEvent = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, description, eventDate, location, mode, registrationUrl, coverImageUrl } = req.body;

  const { rows } = await pool.query(
    `UPDATE events
     SET title = COALESCE($1, title),
         description = COALESCE($2, description),
         event_date = $3,
         location = $4,
         mode = COALESCE($5, mode),
         registration_url = $6,
         cover_image_url = $7,
         updated_at = NOW()
     WHERE id = $8 RETURNING *`,
    [title, description, eventDate, location, mode, registrationUrl, coverImageUrl, id]
  );

  if (rows.length === 0) {
    return res.status(404).json({ success: false, error: 'Event not found.' });
  }

  await logAction({
    userId: req.user.id,
    action: 'UPDATE_EVENT',
    entityType: 'event',
    entityId: id,
    req,
  });

  res.status(200).json({ success: true, data: rows[0] });
});

// Admin: DELETE /admin/events/:id
exports.deleteEvent = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { rowCount } = await pool.query('DELETE FROM events WHERE id = $1', [id]);

  if (rowCount === 0) {
    return res.status(404).json({ success: false, error: 'Event not found.' });
  }

  await logAction({
    userId: req.user.id,
    action: 'DELETE_EVENT',
    entityType: 'event',
    entityId: id,
    req,
  });

  res.status(200).json({ success: true, message: 'Event deleted successfully.' });
});

// Admin: DELETE /admin/gallery/:id
exports.deleteGallery = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { rows } = await pool.query('SELECT media_public_id, media_type FROM gallery WHERE id = $1', [id]);

  if (rows.length === 0) {
    return res.status(404).json({ success: false, error: 'Gallery item not found.' });
  }

  if (rows[0].media_public_id) {
    await deleteFromCloudinary(rows[0].media_public_id, rows[0].media_type === 'image' ? 'image' : 'raw');
  }

  await pool.query('DELETE FROM gallery WHERE id = $1', [id]);

  await logAction({
    userId: req.user.id,
    action: 'DELETE_GALLERY',
    entityType: 'gallery',
    entityId: id,
    req,
  });

  res.status(200).json({ success: true, message: 'Gallery item deleted successfully.' });
});
