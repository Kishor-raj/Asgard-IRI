const pool = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const { logAction } = require('../utils/audit');
const { deleteFromCloudinary } = require('../utils/cloudinaryDelete');

// Public: GET /partners
exports.getPublicPartners = asyncHandler(async (req, res) => {
  const { type } = req.query;
  const conditions = ['is_active = true'];
  const params = [];

  if (type) {
    params.push(type);
    conditions.push(`collaboration_type = $${params.length}`);
  }

  const query = `
    SELECT id, organisation_name, logo_url, website_url, collaboration_type, created_at
    FROM partners
    WHERE ${conditions.join(' AND ')}
    ORDER BY organisation_name ASC
  `;

  const { rows } = await pool.query(query, params);
  res.status(200).json({ success: true, data: rows });
});

// Partner Portal: GET /partners/portal
exports.getPartnerPortalData = asyncHandler(async (req, res) => {
  // Returns collaborative initiatives, publications with external affiliations, and upcoming partner events
  const [partnersRes, pubsRes, confsRes] = await Promise.all([
    pool.query('SELECT * FROM partners WHERE is_active = true ORDER BY organisation_name ASC'),
    pool.query(`
      SELECT p.id, p.title, p.authors_text AS authors, p.year, p.type, p.pdf_url
      FROM publications p
      ORDER BY p.year DESC, p.created_at DESC
      LIMIT 10
    `),
    pool.query(`
      SELECT id, title, start_date, end_date, venue, mode, theme
      FROM conferences
      WHERE status IN ('upcoming', 'ongoing')
      ORDER BY start_date ASC
      LIMIT 5
    `),
  ]);

  res.status(200).json({
    success: true,
    data: {
      partners: partnersRes.rows,
      jointPublications: pubsRes.rows,
      collaborativeConferences: confsRes.rows,
      portalNotice: 'Welcome to the ASGARD-IRI Partner Collaboration Portal. Access active joint research initiatives and institutional agreements.',
    },
  });
});

// Admin: GET /admin/partners
exports.adminGetPartners = asyncHandler(async (req, res) => {
  const { rows } = await pool.query(
    'SELECT * FROM partners ORDER BY created_at DESC'
  );
  res.status(200).json({ success: true, data: rows });
});

// Admin: POST /admin/partners
exports.adminCreatePartner = asyncHandler(async (req, res) => {
  const { organisation_name, website_url, collaboration_type = 'academic', is_active = true } = req.body;
  const logo_url = req.file ? req.file.path : req.body.logo_url;
  const logo_public_id = req.file ? req.file.filename : null;

  if (!organisation_name) {
    return res.status(400).json({ success: false, error: 'Organisation name is required.' });
  }

  const { rows } = await pool.query(
    `INSERT INTO partners (organisation_name, logo_url, logo_public_id, website_url, collaboration_type, is_active)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [organisation_name, logo_url || null, logo_public_id, website_url || null, collaboration_type, is_active]
  );

  const partner = rows[0];

  await logAction({
    userId: req.user.id,
    action: 'CREATE_PARTNER',
    entityType: 'partner',
    entityId: partner.id,
    req,
  });

  res.status(201).json({ success: true, data: partner, message: 'Partner organisation created.' });
});

// Admin: PATCH /admin/partners/:id
exports.adminUpdatePartner = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { organisation_name, website_url, collaboration_type, is_active } = req.body;
  const logo_url = req.file ? req.file.path : req.body.logo_url;
  const logo_public_id = req.file ? req.file.filename : undefined;

  if (logo_public_id) {
    const { rows: oldPartner } = await pool.query('SELECT logo_public_id FROM partners WHERE id = $1', [id]);
    if (oldPartner[0]?.logo_public_id) {
      await deleteFromCloudinary(oldPartner[0].logo_public_id, 'image');
    }
  }

  const { rows } = await pool.query(
    `UPDATE partners
     SET organisation_name = COALESCE($1, organisation_name),
         website_url = COALESCE($2, website_url),
         collaboration_type = COALESCE($3, collaboration_type),
         is_active = COALESCE($4, is_active),
         logo_url = COALESCE($5, logo_url),
         logo_public_id = COALESCE($6, logo_public_id),
         updated_at = NOW()
     WHERE id = $7
     RETURNING *`,
    [organisation_name, website_url, collaboration_type, is_active, logo_url, logo_public_id, id]
  );

  if (rows.length === 0) {
    return res.status(404).json({ success: false, error: 'Partner not found.' });
  }

  const partner = rows[0];

  await logAction({
    userId: req.user.id,
    action: 'UPDATE_PARTNER',
    entityType: 'partner',
    entityId: partner.id,
    req,
  });

  res.status(200).json({ success: true, data: partner, message: 'Partner organisation updated.' });
});

// Admin: DELETE /admin/partners/:id
exports.adminDeletePartner = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { rows: pRows } = await pool.query('SELECT logo_public_id FROM partners WHERE id = $1', [id]);
  if (pRows.length === 0) {
    return res.status(404).json({ success: false, error: 'Partner not found.' });
  }

  if (pRows[0].logo_public_id) {
    await deleteFromCloudinary(pRows[0].logo_public_id, 'image');
  }

  await pool.query('DELETE FROM partners WHERE id = $1', [id]);

  await logAction({
    userId: req.user.id,
    action: 'DELETE_PARTNER',
    entityType: 'partner',
    entityId: id,
    req,
  });

  res.status(200).json({ success: true, message: 'Partner organisation deleted.' });
});
