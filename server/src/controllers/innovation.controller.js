const pool = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const { uniqueSlug } = require('../utils/slugify');
const { logAction } = require('../utils/audit');
const { sendMail } = require('../utils/mailer');

// 1. GET /innovation/programs
exports.getPrograms = asyncHandler(async (req, res) => {
  const type = req.query.type || null;
  let query = 'SELECT * FROM innovation_programs WHERE is_active = true';
  const params = [];

  if (type && type !== 'all') {
    params.push(type);
    query += ' AND type = $1';
  }

  query += ' ORDER BY start_date ASC';
  const { rows } = await pool.query(query, params);
  res.status(200).json({ success: true, data: rows });
});

// 2. GET /innovation/programs/:slug
exports.getProgramBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  const isNumeric = /^\d+$/.test(slug);

  const { rows } = await pool.query(
    isNumeric
      ? 'SELECT * FROM innovation_programs WHERE id = $1'
      : 'SELECT * FROM innovation_programs WHERE slug = $1',
    [slug]
  );

  if (rows.length === 0) {
    return res.status(404).json({ success: false, error: 'Innovation program not found.' });
  }

  res.status(200).json({ success: true, data: rows[0] });
});

// 3. POST /innovation/programs/:id/apply 🔒
exports.applyToProgram = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { teamName, memberNames, projectTitle, domain } = req.body;
  const briefUrl = req.file ? req.file.path : req.body.briefUrl;
  const briefPublicId = req.file ? req.file.filename : null;

  if (!teamName || !projectTitle) {
    return res.status(400).json({
      success: false,
      error: 'Team name and project title are required.',
    });
  }

  // Verify programme exists
  const { rows: progRows } = await pool.query(
    'SELECT title, is_active FROM innovation_programs WHERE id = $1',
    [id]
  );
  if (progRows.length === 0) {
    return res.status(404).json({ success: false, error: 'Programme not found.' });
  }

  const { rows } = await pool.query(
    `INSERT INTO innovation_applications
       (program_id, user_id, team_name, member_names, project_title, brief_url, brief_public_id, domain, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'applied')
     RETURNING *`,
    [
      id,
      req.user.id,
      teamName,
      memberNames || '',
      projectTitle,
      briefUrl || null,
      briefPublicId,
      domain || null,
    ]
  );

  const application = rows[0];

  // Send email to applicant
  await sendMail({
    to: req.user.email,
    subject: `Application Received: ${progRows[0].title}`,
    html: `
      <h2>Innovation Hub Application Received</h2>
      <p>Dear ${req.user.full_name},</p>
      <p>Your team <strong>"${teamName}"</strong> has successfully submitted a proposal for <strong>"${progRows[0].title}"</strong>.</p>
      <p><strong>Project Title:</strong> ${projectTitle}</p>
      <p><strong>Domain:</strong> ${domain || 'DeepTech'}</p>
      <p>Our incubation committee and mentor panel will review your project brief.</p>
    `,
  });

  res.status(201).json({
    success: true,
    data: application,
    message: 'Innovation proposal submitted successfully.',
  });
});

// 4. GET /innovation/mentors
exports.getMentors = asyncHandler(async (req, res) => {
  const { rows } = await pool.query(
    'SELECT * FROM mentors WHERE is_active = true ORDER BY full_name ASC'
  );
  res.status(200).json({ success: true, data: rows });
});

// 5. GET /my/innovation-applications 🔒
exports.getMyInnovationApplications = asyncHandler(async (req, res) => {
  const { rows } = await pool.query(
    `SELECT ia.*, ip.title as program_title, ip.slug as program_slug, ip.type as program_type
     FROM innovation_applications ia
     JOIN innovation_programs ip ON ip.id = ia.program_id
     WHERE ia.user_id = $1
     ORDER BY ia.created_at DESC`,
    [req.user.id]
  );
  res.status(200).json({ success: true, data: rows });
});

// 6. Admin: POST /admin/innovation/programs
exports.createProgram = asyncHandler(async (req, res) => {
  const { type, title, description, startDate, endDate, isActive } = req.body;
  const slug = await uniqueSlug('innovation_programs', title);

  const { rows } = await pool.query(
    `INSERT INTO innovation_programs (type, title, slug, description, start_date, end_date, is_active)
     VALUES ($1, $2, $3, $4, $5, $6, COALESCE($7, true))
     RETURNING *`,
    [type || 'hackathon', title, slug, description, startDate || null, endDate || null, isActive]
  );

  await logAction({
    userId: req.user.id,
    action: 'CREATE_INNOVATION_PROGRAM',
    entityType: 'innovation_program',
    entityId: rows[0].id,
    req,
  });

  res.status(201).json({ success: true, data: rows[0] });
});

// 7. Admin: PUT /admin/innovation/programs/:id
exports.updateProgram = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { type, title, description, startDate, endDate, isActive } = req.body;

  const { rows } = await pool.query(
    `UPDATE innovation_programs
     SET type = COALESCE($1, type),
         title = COALESCE($2, title),
         description = COALESCE($3, description),
         start_date = $4,
         end_date = $5,
         is_active = COALESCE($6, is_active),
         updated_at = NOW()
     WHERE id = $7 RETURNING *`,
    [type, title, description, startDate, endDate, isActive, id]
  );

  if (rows.length === 0) {
    return res.status(404).json({ success: false, error: 'Programme not found.' });
  }

  await logAction({
    userId: req.user.id,
    action: 'UPDATE_INNOVATION_PROGRAM',
    entityType: 'innovation_program',
    entityId: id,
    req,
  });

  res.status(200).json({ success: true, data: rows[0] });
});

// 8. Admin: DELETE /admin/innovation/programs/:id
exports.deleteProgram = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { rowCount } = await pool.query('DELETE FROM innovation_programs WHERE id = $1', [id]);

  if (rowCount === 0) {
    return res.status(404).json({ success: false, error: 'Programme not found.' });
  }

  await logAction({
    userId: req.user.id,
    action: 'DELETE_INNOVATION_PROGRAM',
    entityType: 'innovation_program',
    entityId: id,
    req,
  });

  res.status(200).json({ success: true, message: 'Programme deleted successfully.' });
});

// 9. Admin: GET /admin/innovation/applications
exports.getAdminInnovationApplications = asyncHandler(async (req, res) => {
  const programId = req.query.programId || null;
  let query = `
    SELECT ia.*, ip.title as program_title, u.email as user_email, u.full_name as submitter_name
    FROM innovation_applications ia
    JOIN innovation_programs ip ON ip.id = ia.program_id
    LEFT JOIN users u ON u.id = ia.user_id
  `;
  const params = [];

  if (programId) {
    params.push(programId);
    query += ' WHERE ia.program_id = $1';
  }

  query += ' ORDER BY ia.created_at DESC';
  const { rows } = await pool.query(query, params);
  res.status(200).json({ success: true, data: rows });
});

// 10. Admin: PATCH /admin/innovation/applications/:id/status
exports.adminUpdateInnovationApplicationStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, reviewNotes } = req.body;

  const validStatuses = ['applied', 'under_review', 'shortlisted', 'accepted', 'rejected'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ success: false, error: 'Invalid application status.' });
  }

  const { rows } = await pool.query(
    `UPDATE innovation_applications
     SET status = $1, updated_at = NOW()
     WHERE id = $2 RETURNING *`,
    [status, id]
  );

  if (rows.length === 0) {
    return res.status(404).json({ success: false, error: 'Application not found.' });
  }

  const application = rows[0];

  // Send status update email if user has email
  const { rows: userRows } = await pool.query('SELECT email, full_name FROM users WHERE id = $1', [
    application.user_id,
  ]);
  if (userRows.length > 0) {
    await sendMail({
      to: userRows[0].email,
      subject: `Innovation Application Update: Team ${application.team_name}`,
      html: `
        <h2>Innovation Hub Status Update</h2>
        <p>Dear ${userRows[0].full_name},</p>
        <p>Your application for project <strong>"${application.project_title}"</strong> has been updated to: <strong>${status.toUpperCase()}</strong>.</p>
        ${reviewNotes ? `<p><strong>Feedback:</strong> ${reviewNotes}</p>` : ''}
        <p>Check your user dashboard for next steps and incubation milestone updates.</p>
      `,
    });
  }

  await logAction({
    userId: req.user.id,
    action: 'UPDATE_INNOVATION_APPLICATION_STATUS',
    entityType: 'innovation_application',
    entityId: id,
    req,
  });

  res.status(200).json({ success: true, data: application });
});

// 11. Admin: GET /admin/innovation/applications/export
exports.exportInnovationApplicationsCSV = asyncHandler(async (req, res) => {
  const programId = req.query.programId || null;
  let query = `
    SELECT ia.id, ia.team_name, ia.project_title, ia.domain, ia.member_names,
           ia.status, ia.created_at, ip.title as program_title, u.email as user_email
    FROM innovation_applications ia
    JOIN innovation_programs ip ON ip.id = ia.program_id
    LEFT JOIN users u ON u.id = ia.user_id
  `;
  const params = [];

  if (programId) {
    params.push(programId);
    query += ' WHERE ia.program_id = $1';
  }

  query += ' ORDER BY ia.created_at DESC';
  const { rows } = await pool.query(query, params);

  const headers = ['Application ID', 'Programme', 'Team Name', 'Project Title', 'Domain', 'Members', 'Submitter Email', 'Status', 'Applied At'];
  const csvLines = [headers.join(',')];

  rows.forEach((r) => {
    const row = [
      r.id,
      `"${(r.program_title || '').replace(/"/g, '""')}"`,
      `"${(r.team_name || '').replace(/"/g, '""')}"`,
      `"${(r.project_title || '').replace(/"/g, '""')}"`,
      `"${(r.domain || '').replace(/"/g, '""')}"`,
      `"${(r.member_names || '').replace(/"/g, '""')}"`,
      `"${(r.user_email || '').replace(/"/g, '""')}"`,
      r.status || '',
      r.created_at ? new Date(r.created_at).toISOString() : '',
    ];
    csvLines.push(row.join(','));
  });

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="innovation-applications.csv"');
  res.status(200).send(csvLines.join('\n'));
});

// 12. Admin: POST /admin/innovation/mentors
exports.createMentor = asyncHandler(async (req, res) => {
  const { fullName, designation, organisation, domainTags, bio, photoUrl, isActive } = req.body;

  const { rows } = await pool.query(
    `INSERT INTO mentors (full_name, designation, organisation, domain_tags, bio, photo_url, is_active)
     VALUES ($1, $2, $3, $4, $5, $6, COALESCE($7, true))
     RETURNING *`,
    [fullName, designation, organisation, domainTags, bio, photoUrl || null, isActive]
  );

  await logAction({
    userId: req.user.id,
    action: 'CREATE_MENTOR',
    entityType: 'mentor',
    entityId: rows[0].id,
    req,
  });

  res.status(201).json({ success: true, data: rows[0] });
});

// 13. Admin: PUT /admin/innovation/mentors/:id
exports.updateMentor = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { fullName, designation, organisation, domainTags, bio, photoUrl, isActive } = req.body;

  const { rows } = await pool.query(
    `UPDATE mentors
     SET full_name = COALESCE($1, full_name),
         designation = COALESCE($2, designation),
         organisation = COALESCE($3, organisation),
         domain_tags = COALESCE($4, domain_tags),
         bio = COALESCE($5, bio),
         photo_url = COALESCE($6, photo_url),
         is_active = COALESCE($7, is_active),
         updated_at = NOW()
     WHERE id = $8 RETURNING *`,
    [fullName, designation, organisation, domainTags, bio, photoUrl, isActive, id]
  );

  if (rows.length === 0) {
    return res.status(404).json({ success: false, error: 'Mentor not found.' });
  }

  await logAction({
    userId: req.user.id,
    action: 'UPDATE_MENTOR',
    entityType: 'mentor',
    entityId: id,
    req,
  });

  res.status(200).json({ success: true, data: rows[0] });
});

// 14. Admin: DELETE /admin/innovation/mentors/:id
exports.deleteMentor = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { rowCount } = await pool.query('DELETE FROM mentors WHERE id = $1', [id]);

  if (rowCount === 0) {
    return res.status(404).json({ success: false, error: 'Mentor not found.' });
  }

  await logAction({
    userId: req.user.id,
    action: 'DELETE_MENTOR',
    entityType: 'mentor',
    entityId: id,
    req,
  });

  res.status(200).json({ success: true, message: 'Mentor deleted successfully.' });
});
