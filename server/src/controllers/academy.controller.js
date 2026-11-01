const pool = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const { uniqueSlug } = require('../utils/slugify');
const { logAction } = require('../utils/audit');
const { sendMail } = require('../utils/mailer');
const { deleteFromCloudinary } = require('../utils/cloudinaryDelete');
const { autoIssueCertificate } = require('./certificate.controller');

// GET /academy/programs
exports.getPrograms = asyncHandler(async (req, res) => {
  const type = req.query.type || null;
  const mode = req.query.mode || null;

  let query = 'SELECT * FROM academy_programs WHERE is_active = true';
  const conditions = [];
  const params = [];

  if (type) {
    params.push(type);
    conditions.push(`type = $${params.length}`);
  }
  if (mode) {
    params.push(mode);
    conditions.push(`mode = $${params.length}`);
  }

  if (conditions.length > 0) {
    query += ' AND ' + conditions.join(' AND ');
  }

  query += ' ORDER BY start_date ASC';
  const { rows } = await pool.query(query, params);

  res.status(200).json({ success: true, data: rows });
});

// GET /academy/programs/:slug
exports.getProgramBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  const isNumeric = /^\d+$/.test(slug);

  const { rows } = await pool.query(
    isNumeric
      ? 'SELECT * FROM academy_programs WHERE id = $1'
      : 'SELECT * FROM academy_programs WHERE slug = $1',
    [slug]
  );

  if (rows.length === 0) {
    return res.status(404).json({ success: false, error: 'Programme not found.' });
  }

  res.status(200).json({ success: true, data: rows[0] });
});

// Admin: POST /admin/academy/programs
exports.createProgram = asyncHandler(async (req, res) => {
  const { type, title, description, duration, mode, startDate, endDate, seats, isActive } = req.body;
  const coverUrl = req.file ? req.file.path : req.body.coverImageUrl || req.body.coverUrl || null;
  const coverPublicId = req.file ? req.file.filename : null;
  const slug = await uniqueSlug('academy_programs', title);

  const { rows } = await pool.query(
    `INSERT INTO academy_programs (type, title, slug, description, duration, mode, start_date, end_date, seats, is_active, cover_image_url, cover_public_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
    [type, title, slug, description, duration, mode, startDate, endDate, seats, isActive !== undefined ? isActive : true, coverUrl, coverPublicId]
  );

  await logAction({
    userId: req.user.id,
    action: 'CREATE_ACADEMY_PROGRAM',
    entityType: 'academy_program',
    entityId: rows[0].id,
    req,
  });

  res.status(201).json({ success: true, data: rows[0] });
});

// Admin: PUT /admin/academy/programs/:id
exports.updateProgram = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { type, title, description, duration, mode, startDate, endDate, seats, isActive } = req.body;
  const coverUrl = req.file ? req.file.path : req.body.coverImageUrl || req.body.coverUrl;
  const coverPublicId = req.file ? req.file.filename : undefined;

  if (coverPublicId) {
    const { rows: oldProg } = await pool.query('SELECT cover_public_id FROM academy_programs WHERE id = $1', [id]);
    if (oldProg[0]?.cover_public_id) {
      await deleteFromCloudinary(oldProg[0].cover_public_id, 'image');
    }
  }

  const { rows } = await pool.query(
    `UPDATE academy_programs
     SET type = COALESCE($1, type),
         title = COALESCE($2, title),
         description = COALESCE($3, description),
         duration = $4,
         mode = COALESCE($5, mode),
         start_date = $6,
         end_date = $7,
         seats = $8,
         is_active = COALESCE($9, is_active),
         cover_image_url = COALESCE($10, cover_image_url),
         cover_public_id = COALESCE($11, cover_public_id),
         updated_at = NOW()
     WHERE id = $12 RETURNING *`,
    [type, title, description, duration, mode, startDate, endDate, seats, isActive, coverUrl, coverPublicId, id]
  );

  if (rows.length === 0) {
    return res.status(404).json({ success: false, error: 'Programme not found.' });
  }

  await logAction({
    userId: req.user.id,
    action: 'UPDATE_ACADEMY_PROGRAM',
    entityType: 'academy_program',
    entityId: id,
    req,
  });

  res.status(200).json({ success: true, data: rows[0] });
});

// Admin: DELETE /admin/academy/programs/:id
exports.deleteProgram = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { rows: progRows } = await pool.query('SELECT cover_public_id FROM academy_programs WHERE id = $1', [id]);
  if (progRows.length === 0) {
    return res.status(404).json({ success: false, error: 'Programme not found.' });
  }

  if (progRows[0].cover_public_id) {
    await deleteFromCloudinary(progRows[0].cover_public_id, 'image');
  }

  await pool.query('DELETE FROM academy_programs WHERE id = $1', [id]);

  await logAction({
    userId: req.user.id,
    action: 'DELETE_ACADEMY_PROGRAM',
    entityType: 'academy_program',
    entityId: id,
    req,
  });

  res.status(200).json({ success: true, message: 'Programme deleted successfully.' });
});

// Phase 2: POST /academy/programs/:id/register
exports.registerProgram = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, email, affiliation, designation } = req.body;

  if (!name || !email) {
    return res.status(400).json({ success: false, error: 'Name and email are required.' });
  }

  // Check duplicate registration
  const { rows: existing } = await pool.query(
    `SELECT id FROM academy_registrations
     WHERE program_id = $1 AND user_id = $2 AND status != 'cancelled'`,
    [id, req.user.id]
  );
  if (existing.length > 0) {
    return res.status(409).json({
      success: false,
      error: 'You are already enrolled in this programme.',
    });
  }

  // Check programme existence & capacity
  const { rows: progRows } = await pool.query(
    'SELECT title, seats, start_date FROM academy_programs WHERE id = $1',
    [id]
  );
  if (progRows.length === 0) {
    return res.status(404).json({ success: false, error: 'Programme not found.' });
  }

  const prog = progRows[0];
  if (prog.seats) {
    const { rows: countRows } = await pool.query(
      `SELECT COUNT(*) FROM academy_registrations WHERE program_id = $1 AND status != 'cancelled'`,
      [id]
    );
    const activeCount = parseInt(countRows[0]?.count || 0, 10);
    if (activeCount >= prog.seats) {
      return res.status(400).json({
        success: false,
        error: 'This programme cohort is currently full. Please contact the academy for the next cohort.',
      });
    }
  }

  const { rows } = await pool.query(
    `INSERT INTO academy_registrations
       (program_id, user_id, name, email, affiliation, designation, status, payment_status)
     VALUES ($1, $2, $3, $4, $5, $6, 'applied', 'dummy_paid')
     RETURNING *`,
    [id, req.user.id, name, email, affiliation || null, designation || null]
  );

  const registration = rows[0];

  // Send confirmation email
  await sendMail({
    to: email,
    subject: `Enrolled: ${prog.title} – ASGARD Academy`,
    html: `
      <h2>ASGARD Academy Enrollment Confirmed</h2>
      <p>Dear ${name},</p>
      <p>Your enrollment in <strong>"${prog.title}"</strong> has been registered.</p>
      <p><strong>Registration ID:</strong> #${registration.id}</p>
      <p><strong>Status:</strong> Applied (Provisional Access Confirmed)</p>
      <p><strong>Payment Status:</strong> Confirmed (Dummy Sandbox Sandbox)</p>
      <p>Instruction details, digital syllabus, and webinar schedule will be emailed prior to commencement.</p>
    `,
  });

  res.status(201).json({
    success: true,
    data: registration,
    message: 'Programme enrollment completed successfully.',
  });
});

// Phase 2: GET /my/academy-registrations
exports.getMyRegistrations = asyncHandler(async (req, res) => {
  const { rows } = await pool.query(
    `SELECT ar.*, p.title AS program_title, p.slug AS program_slug,
            p.type AS program_type, p.mode AS program_mode, p.duration, p.start_date, p.end_date
     FROM academy_registrations ar
     JOIN academy_programs p ON p.id = ar.program_id
     WHERE ar.user_id = $1
     ORDER BY ar.created_at DESC`,
    [req.user.id]
  );
  res.status(200).json({ success: true, data: rows });
});

// Phase 2: GET /admin/academy/registrations
exports.getAdminAcademyRegistrations = asyncHandler(async (req, res) => {
  const programId = req.query.programId || null;
  let query = `
    SELECT ar.*, p.title AS program_title, u.email AS user_email
    FROM academy_registrations ar
    JOIN academy_programs p ON p.id = ar.program_id
    LEFT JOIN users u ON u.id = ar.user_id
  `;
  const params = [];

  if (programId) {
    params.push(programId);
    query += ' WHERE ar.program_id = $1';
  }

  query += ' ORDER BY ar.created_at DESC';
  const { rows } = await pool.query(query, params);

  res.status(200).json({ success: true, data: rows });
});

// Phase 2: GET /admin/academy/registrations/export
exports.exportAcademyRegistrationsCSV = asyncHandler(async (req, res) => {
  const programId = req.query.programId || null;
  let query = `
    SELECT ar.id, ar.name, ar.email, ar.affiliation, ar.designation,
           ar.status, ar.payment_status, ar.created_at, p.title AS program_title
    FROM academy_registrations ar
    JOIN academy_programs p ON p.id = ar.program_id
  `;
  const params = [];

  if (programId) {
    params.push(programId);
    query += ' WHERE ar.program_id = $1';
  }

  query += ' ORDER BY ar.created_at DESC';
  const { rows } = await pool.query(query, params);

  const headers = ['Registration ID', 'Programme', 'Learner Name', 'Email', 'Affiliation', 'Designation', 'Status', 'Payment Status', 'Enrolled Date'];
  const csvLines = [headers.join(',')];

  rows.forEach((r) => {
    const row = [
      r.id,
      `"${(r.program_title || '').replace(/"/g, '""')}"`,
      `"${(r.name || '').replace(/"/g, '""')}"`,
      `"${(r.email || '').replace(/"/g, '""')}"`,
      `"${(r.affiliation || '').replace(/"/g, '""')}"`,
      `"${(r.designation || '').replace(/"/g, '""')}"`,
      r.status || '',
      r.payment_status || '',
      r.created_at ? new Date(r.created_at).toISOString() : '',
    ];
    csvLines.push(row.join(','));
  });

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="academy-registrations.csv"');
  res.status(200).send(csvLines.join('\n'));
});

// Phase 2: PATCH /admin/academy/registrations/:id/status
exports.adminUpdateRegistrationStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ['applied', 'confirmed', 'cancelled', 'completed'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ success: false, error: 'Invalid enrollment status.' });
  }

  const { rows } = await pool.query(
    `UPDATE academy_registrations
     SET status = $1, updated_at = NOW()
     WHERE id = $2
     RETURNING *`,
    [status, id]
  );

  if (rows.length === 0) {
    return res.status(404).json({ success: false, error: 'Enrollment record not found.' });
  }

  const registration = rows[0];

  // Send email if user has email
  if (registration.email) {
    await sendMail({
      to: registration.email,
      subject: `Academy Enrollment Update: #${registration.id} is now ${status.toUpperCase()}`,
      html: `
        <h2>ASGARD Academy Status Update</h2>
        <p>Dear ${registration.name || 'Learner'},</p>
        <p>Your enrollment status for programme #${registration.program_id} has been updated to: <strong>${status.toUpperCase()}</strong>.</p>
        <p>Log in to your participant dashboard to view class schedules and learning materials.</p>
      `,
    });
  }

  // Auto-issue certificate if status is completed and registration is linked to a user
  if (status === 'completed' && registration.user_id) {
    const { rows: progRows } = await pool.query('SELECT title FROM academy_programs WHERE id = $1', [registration.program_id]);
    const progTitle = progRows[0]?.title || 'ASGARD Academy Programme';
    await autoIssueCertificate(registration.user_id, 'academy', registration.program_id, `${progTitle} — Certificate of Completion`);
  }

  await logAction({
    userId: req.user.id,
    action: 'UPDATE_ACADEMY_REGISTRATION_STATUS',
    entityType: 'academy_registration',
    entityId: id,
    req,
  });

  res.status(200).json({ success: true, data: registration });
});

