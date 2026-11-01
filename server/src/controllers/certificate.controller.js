const crypto = require('crypto');
const pool = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const { logAction } = require('../utils/audit');
const { generateAndUploadCertificate } = require('../utils/generateCertificate');

// Admin: POST /admin/certificates
exports.adminIssueCertificate = asyncHandler(async (req, res) => {
  const { userId, issuedForType, issuedForId, issuedForLabel, issuedDate } = req.body;
  let pdfUrl = req.file ? req.file.path : req.body.pdfUrl;
  let pdfPublicId = req.file ? req.file.filename : null;

  if (!userId || !issuedForType || !issuedForLabel) {
    return res.status(400).json({
      success: false,
      error: 'User ID, Issued For Type, and Label are required.',
    });
  }

  // Fetch user name if not provided
  let recipientName = req.body.recipientName;
  if (!recipientName) {
    const uRes = await pool.query('SELECT full_name FROM users WHERE id = $1', [userId]);
    recipientName = uRes.rows[0]?.full_name || 'Academic Scholar';
  }

  const certificateUid = crypto.randomUUID();

  // If no manual PDF was uploaded, auto-generate official PDF with QR code and upload to Cloudinary
  if (!pdfUrl) {
    const pdfGen = await generateAndUploadCertificate({
      recipientName,
      eventLabel: issuedForLabel,
      issuedDate: issuedDate || new Date(),
      certificateUid,
    });
    pdfUrl = pdfGen.pdfUrl;
    pdfPublicId = pdfGen.pdfPublicId;
  }

  const { rows } = await pool.query(
    `INSERT INTO certificates
       (user_id, issued_for_type, issued_for_id, issued_for_label, certificate_uid, pdf_url, pdf_public_id, issued_date, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, COALESCE($8, CURRENT_DATE), 'issued')
     RETURNING *`,
    [
      userId,
      issuedForType,
      issuedForId || null,
      issuedForLabel,
      certificateUid,
      pdfUrl || null,
      pdfPublicId || null,
      issuedDate || null,
    ]
  );

  const cert = rows[0];

  await logAction({
    userId: req.user.id,
    action: 'ISSUE_CERTIFICATE',
    entityType: 'certificate',
    entityId: cert.id,
    req,
  });

  res.status(201).json({
    success: true,
    data: cert,
    message: 'Official credential certificate issued and generated successfully.',
  });
});

// Admin: GET /admin/certificates
exports.adminGetCertificates = asyncHandler(async (req, res) => {
  const { rows } = await pool.query(
    `SELECT c.*, u.full_name AS user_full_name, u.email AS user_email
     FROM certificates c
     LEFT JOIN users u ON u.id = c.user_id
     ORDER BY c.created_at DESC`
  );
  res.status(200).json({ success: true, data: rows });
});

// User: GET /my/certificates
exports.getMyCertificates = asyncHandler(async (req, res) => {
  const { rows } = await pool.query(
    `SELECT * FROM certificates
     WHERE user_id = $1
     ORDER BY issued_date DESC`,
    [req.user.id]
  );
  res.status(200).json({ success: true, data: rows });
});

// Public: GET /certificates/verify/:uid
exports.verifyCertificate = asyncHandler(async (req, res) => {
  const { uid } = req.params;
  const { rows } = await pool.query(
    `SELECT c.*, COALESCE(u.full_name, 'Academic Scholar') AS recipient_name,
            c.issued_for_type AS credential_category
     FROM certificates c
     LEFT JOIN users u ON u.id = c.user_id
     WHERE c.certificate_uid::text = $1`,
    [uid]
  );

  if (rows.length === 0) {
    return res.status(404).json({
      success: false,
      error: 'Certificate not found. Please verify the 36-character UID.',
    });
  }

  const cert = rows[0];

  res.status(200).json({
    success: true,
    data: cert,
    message: 'Authentic certificate credential verified.',
  });
});

/**
 * Automatically generates, uploads to Cloudinary, and issues a certificate record.
 */
exports.autoIssueCertificate = async (userId, issuedForType, issuedForId, issuedForLabel) => {
  try {
    const uRes = await pool.query('SELECT full_name FROM users WHERE id = $1', [userId]);
    const recipientName = uRes.rows[0]?.full_name || 'Academic Scholar';
    const certificateUid = crypto.randomUUID();

    const { pdfUrl, pdfPublicId } = await generateAndUploadCertificate({
      recipientName,
      eventLabel: issuedForLabel,
      issuedDate: new Date(),
      certificateUid,
    });

    const { rows } = await pool.query(
      `INSERT INTO certificates
         (user_id, issued_for_type, issued_for_id, issued_for_label, certificate_uid, pdf_url, pdf_public_id, issued_date, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_DATE, 'active')
       RETURNING *`,
      [userId, issuedForType, issuedForId || null, issuedForLabel, certificateUid, pdfUrl, pdfPublicId]
    );

    return rows[0];
  } catch (err) {
    console.error('[Certificates] Auto-issue failed:', err);
    return null;
  }
};

