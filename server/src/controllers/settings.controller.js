const pool = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const { logAction } = require('../utils/audit');

// GET /settings/public-school-active
exports.getPublicSchoolActive = asyncHandler(async (req, res) => {
  const { rows } = await pool.query(
    "SELECT value FROM site_settings WHERE key = 'public_school_active'"
  );
  const active = rows.length > 0 ? rows[0].value === 'true' : false;
  res.status(200).json({ success: true, active });
});

// GET /settings/site-tagline
exports.getSiteTagline = asyncHandler(async (req, res) => {
  const { rows } = await pool.query(
    "SELECT value FROM site_settings WHERE key = 'site_tagline'"
  );
  res.status(200).json({ success: true, tagline: rows[0]?.value || '' });
});

// Admin: PUT /settings/public-school-active 🔒🛡
exports.setPublicSchoolActive = asyncHandler(async (req, res) => {
  const { active } = req.body;
  const val = active ? 'true' : 'false';

  await pool.query(
    `INSERT INTO site_settings (key, value)
     VALUES ('public_school_active', $1)
     ON CONFLICT (key) DO UPDATE SET value = $1, updated_at = NOW()`,
    [val]
  );

  await logAction({
    userId: req.user.id,
    action: 'TOGGLE_PUBLIC_SCHOOL_VISIBILITY',
    entityType: 'setting',
    entityId: null,
    req,
  });

  res.status(200).json({ success: true, active: active === true });
});

// Admin: PUT /settings/site-tagline 🔒🛡
exports.setSiteTagline = asyncHandler(async (req, res) => {
  const { tagline } = req.body;

  await pool.query(
    `INSERT INTO site_settings (key, value)
     VALUES ('site_tagline', $1)
     ON CONFLICT (key) DO UPDATE SET value = $1, updated_at = NOW()`,
    [tagline]
  );

  await logAction({
    userId: req.user.id,
    action: 'UPDATE_SITE_TAGLINE',
    entityType: 'setting',
    entityId: null,
    req,
  });

  res.status(200).json({ success: true, tagline });
});
