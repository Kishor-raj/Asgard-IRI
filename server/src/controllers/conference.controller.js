const pool = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const { uniqueSlug } = require('../utils/slugify');
const { logAction } = require('../utils/audit');
const { sendMail } = require('../utils/mailer');
const { deleteFromCloudinary } = require('../utils/cloudinaryDelete');

// GET /conferences
exports.getConferences = asyncHandler(async (req, res) => {
  const status = req.query.status || null;
  let query = 'SELECT * FROM conferences';
  const params = [];

  if (status) {
    params.push(status);
    query += ' WHERE status = $1';
  }

  query += ' ORDER BY start_date ASC';
  const { rows } = await pool.query(query, params);

  res.status(200).json({ success: true, data: rows });
});

// GET /conferences/:slug
exports.getConferenceBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  const isNumeric = /^\d+$/.test(slug);

  const { rows } = await pool.query(
    isNumeric
      ? 'SELECT * FROM conferences WHERE id = $1'
      : 'SELECT * FROM conferences WHERE slug = $1',
    [slug]
  );

  if (rows.length === 0) {
    return res.status(404).json({ success: false, error: 'Conference not found.' });
  }

  res.status(200).json({ success: true, data: rows[0] });
});

// Admin: POST /admin/conferences
exports.createConference = asyncHandler(async (req, res) => {
  const { title, theme, status, startDate, endDate, venue, mode, description } = req.body;
  const coverUrl = req.file ? req.file.path : req.body.coverImageUrl || req.body.coverUrl || null;
  const coverPublicId = req.file ? req.file.filename : null;
  const slug = await uniqueSlug('conferences', title);

  const { rows } = await pool.query(
    `INSERT INTO conferences (title, slug, theme, status, start_date, end_date, venue, mode, description, cover_image_url, cover_public_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
    [title, slug, theme, status || 'upcoming', startDate, endDate, venue, mode || 'hybrid', description, coverUrl, coverPublicId]
  );

  await logAction({
    userId: req.user.id,
    action: 'CREATE_CONFERENCE',
    entityType: 'conference',
    entityId: rows[0].id,
    req,
  });

  res.status(201).json({ success: true, data: rows[0] });
});

// Admin: PUT /admin/conferences/:id
exports.updateConference = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, theme, status, startDate, endDate, venue, mode, description } = req.body;
  const coverUrl = req.file ? req.file.path : req.body.coverImageUrl || req.body.coverUrl;
  const coverPublicId = req.file ? req.file.filename : undefined;

  const { rows } = await pool.query(
    `UPDATE conferences
     SET title = COALESCE($1, title),
         theme = COALESCE($2, theme),
         status = COALESCE($3, status),
         start_date = $4,
         end_date = $5,
         venue = $6,
         mode = COALESCE($7, mode),
         description = COALESCE($8, description),
         cover_image_url = COALESCE($9, cover_image_url),
         cover_public_id = COALESCE($10, cover_public_id),
         updated_at = NOW()
     WHERE id = $11 RETURNING *`,
    [title, theme, status, startDate, endDate, venue, mode, description, coverUrl, coverPublicId, id]
  );

  if (rows.length === 0) {
    return res.status(404).json({ success: false, error: 'Conference not found.' });
  }

  await logAction({
    userId: req.user.id,
    action: 'UPDATE_CONFERENCE',
    entityType: 'conference',
    entityId: id,
    req,
  });

  res.status(200).json({ success: true, data: rows[0] });
});

// Admin: DELETE /admin/conferences/:id
exports.deleteConference = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { rows: confRows } = await pool.query('SELECT cover_public_id FROM conferences WHERE id = $1', [id]);
  if (confRows.length === 0) {
    return res.status(404).json({ success: false, error: 'Conference not found.' });
  }

  if (confRows[0].cover_public_id) {
    await deleteFromCloudinary(confRows[0].cover_public_id, 'image');
  }

  await pool.query('DELETE FROM conferences WHERE id = $1', [id]);

  await logAction({
    userId: req.user.id,
    action: 'DELETE_CONFERENCE',
    entityType: 'conference',
    entityId: id,
    req,
  });

  res.status(200).json({ success: true, message: 'Conference deleted successfully.' });
});

// Phase 2: POST /conferences/:id/submit
exports.submitPaper = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, abstract, authorsText, submissionType } = req.body;
  const fileUrl = req.file ? req.file.path : req.body.fileUrl;
  const filePublicId = req.file ? req.file.filename : null;
  const authors = authorsText || req.user.full_name || 'Author';

  if (!title || !abstract) {
    return res.status(400).json({
      success: false,
      error: 'Title and abstract are required.',
    });
  }

  // Verify conference exists
  const { rows: confRows } = await pool.query('SELECT title, status FROM conferences WHERE id = $1', [id]);
  if (confRows.length === 0) {
    return res.status(404).json({ success: false, error: 'Conference not found.' });
  }

  if (confRows[0].status === 'past') {
    return res.status(400).json({ success: false, error: 'Submissions are closed for past conferences.' });
  }

  const { rows } = await pool.query(
    `INSERT INTO conference_submissions
       (conference_id, user_id, title, abstract, authors_text, submission_type, file_url, file_public_id, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'submitted')
     RETURNING *`,
    [
      id,
      req.user.id,
      title,
      abstract,
      authors,
      submissionType || 'abstract',
      fileUrl || null,
      filePublicId,
    ]
  );

  const submission = rows[0];

  // Send confirmation email
  await sendMail({
    to: req.user.email,
    subject: `Paper Submission Received: ${title}`,
    html: `
      <h2>Conference Paper Submission Confirmation</h2>
      <p>Dear ${req.user.fullName || 'Author'},</p>
      <p>Your paper <strong>"${title}"</strong> has been successfully submitted to <strong>${confRows[0].title}</strong>.</p>
      <p><strong>Submission ID:</strong> #${submission.id}</p>
      <p><strong>Submission Type:</strong> ${submission.submission_type}</p>
      <p>Our editorial and scientific review committee will evaluate your abstract against standard peer criteria.</p>
    `,
  });

  res.status(201).json({
    success: true,
    data: submission,
    message: 'Paper submitted successfully.',
  });
});

// Phase 2: GET /my/conference-submissions
exports.getMySubmissions = asyncHandler(async (req, res) => {
  const { rows } = await pool.query(
    `SELECT cs.*, c.title AS conference_title, c.slug AS conference_slug, c.start_date, c.venue
     FROM conference_submissions cs
     JOIN conferences c ON c.id = cs.conference_id
     WHERE cs.user_id = $1
     ORDER BY cs.submitted_at DESC`,
    [req.user.id]
  );
  res.status(200).json({ success: true, data: rows });
});

// Phase 2: GET /admin/conferences/:id/submissions
exports.getAdminConferenceSubmissions = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { rows } = await pool.query(
    `SELECT cs.*, u.full_name AS submitter_name, u.email AS submitter_email
     FROM conference_submissions cs
     LEFT JOIN users u ON u.id = cs.user_id
     WHERE cs.conference_id = $1
     ORDER BY cs.submitted_at DESC`,
    [id]
  );
  res.status(200).json({ success: true, data: rows });
});

// Phase 2: PATCH /admin/submissions/:id/status
exports.adminUpdateSubmissionStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, reviewerNotes } = req.body;

  const validStatuses = ['submitted', 'accepted', 'rejected', 'revision_requested'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ success: false, error: 'Invalid submission status.' });
  }

  const { rows } = await pool.query(
    `UPDATE conference_submissions
     SET status = $1, reviewer_notes = COALESCE($2, reviewer_notes), updated_at = NOW()
     WHERE id = $3
     RETURNING *`,
    [status, reviewerNotes, id]
  );

  if (rows.length === 0) {
    return res.status(404).json({ success: false, error: 'Submission not found.' });
  }

  const submission = rows[0];

  // Send status update email if user has email
  const { rows: userRows } = await pool.query('SELECT email, full_name FROM users WHERE id = $1', [
    submission.user_id,
  ]);
  if (userRows.length > 0) {
    await sendMail({
      to: userRows[0].email,
      subject: `Update on Your Conference Paper Submission #${submission.id}`,
      html: `
        <h2>Conference Submission Status Update</h2>
        <p>Dear ${userRows[0].full_name},</p>
        <p>Your paper <strong>"${submission.title}"</strong> has been updated to: <strong>${status.toUpperCase()}</strong>.</p>
        ${reviewerNotes ? `<p><strong>Reviewer / Editorial Feedback:</strong> ${reviewerNotes}</p>` : ''}
        <p>You can check the latest status in your participant dashboard.</p>
      `,
    });
  }

  await logAction({
    userId: req.user.id,
    action: 'UPDATE_SUBMISSION_STATUS',
    entityType: 'conference_submission',
    entityId: id,
    req,
  });

  res.status(200).json({ success: true, data: submission });
});

// Phase 2: POST /conferences/:id/register
exports.registerConference = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, email, affiliation, designation, modePreference } = req.body;

  if (!name || !email) {
    return res.status(400).json({ success: false, error: 'Name and email are required.' });
  }

  // Check duplicate registration
  const { rows: existing } = await pool.query(
    'SELECT id FROM conference_registrations WHERE conference_id = $1 AND user_id = $2',
    [id, req.user.id]
  );
  if (existing.length > 0) {
    return res.status(409).json({
      success: false,
      error: 'You are already registered for this conference.',
    });
  }

  const { rows: confRows } = await pool.query('SELECT title, venue, start_date FROM conferences WHERE id = $1', [id]);
  if (confRows.length === 0) {
    return res.status(404).json({ success: false, error: 'Conference not found.' });
  }

  const { rows } = await pool.query(
    `INSERT INTO conference_registrations
       (conference_id, user_id, name, email, affiliation, designation, mode_preference, payment_status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, 'dummy_paid')
     RETURNING *`,
    [
      id,
      req.user.id,
      name,
      email,
      affiliation || null,
      designation || null,
      modePreference || 'hybrid',
    ]
  );

  const registration = rows[0];

  // Send confirmation emails
  await sendMail({
    to: email,
    subject: `Registration Confirmed: ${confRows[0].title}`,
    html: `
      <h2>Conference Registration Confirmed</h2>
      <p>Dear ${name},</p>
      <p>Your registration for <strong>"${confRows[0].title}"</strong> has been successfully confirmed.</p>
      <p><strong>Registration ID:</strong> #${registration.id}</p>
      <p><strong>Mode:</strong> ${modePreference || 'hybrid'}</p>
      <p><strong>Payment Status:</strong> Confirmed (Phase 2 Dummy Sandbox)</p>
      <p>Access passes and webinar links will be dispatched prior to the event.</p>
    `,
  });

  res.status(201).json({
    success: true,
    data: registration,
    message: 'Registration completed successfully.',
  });
});

// Phase 2: GET /my/conference-registrations
exports.getMyRegistrations = asyncHandler(async (req, res) => {
  const { rows } = await pool.query(
    `SELECT cr.*, c.title AS conference_title, c.slug AS conference_slug,
            c.start_date, c.end_date, c.venue, c.mode
     FROM conference_registrations cr
     JOIN conferences c ON c.id = cr.conference_id
     WHERE cr.user_id = $1
     ORDER BY cr.registration_date DESC`,
    [req.user.id]
  );
  res.status(200).json({ success: true, data: rows });
});

// Phase 2: GET /admin/conferences/:id/registrations
exports.getAdminConferenceRegistrations = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { rows } = await pool.query(
    `SELECT cr.*, u.full_name AS user_full_name, u.email AS user_email
     FROM conference_registrations cr
     LEFT JOIN users u ON u.id = cr.user_id
     WHERE cr.conference_id = $1
     ORDER BY cr.registration_date DESC`,
    [id]
  );
  res.status(200).json({ success: true, data: rows });
});

// Phase 2: GET /admin/conferences/:id/registrations/export
exports.exportConferenceRegistrationsCSV = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { rows } = await pool.query(
    `SELECT cr.id, cr.name, cr.email, cr.affiliation, cr.designation,
            cr.mode_preference, cr.payment_status, cr.registration_date, c.title AS conference_title
     FROM conference_registrations cr
     JOIN conferences c ON c.id = cr.conference_id
     WHERE cr.conference_id = $1
     ORDER BY cr.registration_date DESC`,
    [id]
  );

  const headers = ['Registration ID', 'Conference', 'Name', 'Email', 'Affiliation', 'Designation', 'Mode', 'Payment Status', 'Registration Date'];
  const csvLines = [headers.join(',')];

  rows.forEach((r) => {
    const row = [
      r.id,
      `"${(r.conference_title || '').replace(/"/g, '""')}"`,
      `"${(r.name || '').replace(/"/g, '""')}"`,
      `"${(r.email || '').replace(/"/g, '""')}"`,
      `"${(r.affiliation || '').replace(/"/g, '""')}"`,
      `"${(r.designation || '').replace(/"/g, '""')}"`,
      r.mode_preference || '',
      r.payment_status || '',
      r.registration_date ? new Date(r.registration_date).toISOString() : '',
    ];
    csvLines.push(row.join(','));
  });

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="conference-${id}-registrations.csv"`);
  res.status(200).send(csvLines.join('\n'));
});

