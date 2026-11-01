const pool = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const { uniqueSlug } = require('../utils/slugify');
const { logAction } = require('../utils/audit');
const { sendMail } = require('../utils/mailer');
const { deleteFromCloudinary } = require('../utils/cloudinaryDelete');

// 1. GET /opportunities
exports.getOpportunities = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, parseInt(req.query.limit, 10) || 12);
  const offset = (page - 1) * limit;

  const category = req.query.category || null;
  const mode = req.query.mode || null;
  const status = req.query.status || 'open';

  let query = 'SELECT * FROM opportunities WHERE status = $1';
  const params = [status];

  if (category && category !== 'all') {
    params.push(category);
    query += ` AND category = $${params.length}`;
  }

  if (mode && mode !== 'all') {
    params.push(mode);
    query += ` AND mode = $${params.length}`;
  }

  query += ` ORDER BY deadline ASC NULLS LAST, created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
  const queryParams = [...params, limit, offset];

  const { rows } = await pool.query(query, queryParams);

  let countQuery = 'SELECT COUNT(*) FROM opportunities WHERE status = $1';
  const countParams = [status];
  if (category && category !== 'all') {
    countParams.push(category);
    countQuery += ` AND category = $${countParams.length}`;
  }
  if (mode && mode !== 'all') {
    countParams.push(mode);
    countQuery += ` AND mode = $${countParams.length}`;
  }

  const { rows: countRows } = await pool.query(countQuery, countParams);
  const total = parseInt(countRows[0].count, 10);

  res.status(200).json({
    success: true,
    data: rows,
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
  });
});

// 2. GET /opportunities/:slug
exports.getOpportunityBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  const isNumeric = /^\d+$/.test(slug);

  const { rows } = await pool.query(
    isNumeric
      ? 'SELECT * FROM opportunities WHERE id = $1'
      : 'SELECT * FROM opportunities WHERE slug = $1',
    [slug]
  );

  if (rows.length === 0) {
    return res.status(404).json({ success: false, error: 'Opportunity not found.' });
  }

  res.status(200).json({ success: true, data: rows[0] });
});

// 3. POST /opportunities/:id/apply 🔒
exports.applyOpportunity = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { coverLetter } = req.body;
  const userId = req.user.id;

  // Check opportunity exists and is open
  const { rows: opps } = await pool.query(
    'SELECT * FROM opportunities WHERE id = $1',
    [id]
  );
  if (opps.length === 0) {
    return res.status(404).json({ success: false, error: 'Opportunity not found.' });
  }
  if (opps[0].status !== 'open') {
    return res.status(400).json({ success: false, error: 'This opportunity is closed.' });
  }

  // Check duplicate application
  const { rows: existing } = await pool.query(
    'SELECT id FROM opportunity_applications WHERE opportunity_id = $1 AND user_id = $2',
    [id, userId]
  );
  if (existing.length > 0) {
    return res.status(409).json({ success: false, error: 'You have already applied to this opportunity.' });
  }

  const resumeUrl = req.file ? req.file.path : req.body.resumeUrl || null;
  const resumePublicId = req.file ? req.file.filename : null;

  const { rows } = await pool.query(
    `INSERT INTO opportunity_applications (opportunity_id, user_id, cover_letter, resume_url, resume_public_id, status, applied_at)
     VALUES ($1, $2, $3, $4, $5, 'applied', NOW()) RETURNING *`,
    [id, userId, coverLetter, resumeUrl, resumePublicId]
  );

  // Notify HR Admin
  await sendMail({
    to: process.env.ADMIN_EMAIL || 'admin@asgard-iri.org',
    subject: `New Application – ${opps[0].title}`,
    html: `
      <h2>New Opportunity Application</h2>
      <p><strong>Candidate:</strong> ${req.user.full_name} (${req.user.email})</p>
      <p><strong>Position:</strong> ${opps[0].title} (${opps[0].category})</p>
      <p><strong>Cover Letter:</strong></p>
      <p>${coverLetter}</p>
      ${resumeUrl ? `<p><a href="${process.env.CLIENT_URL || 'http://localhost:5173'}${resumeUrl}">Download Resume</a></p>` : ''}
    `,
  });

  res.status(201).json({
    success: true,
    message: 'Application submitted successfully.',
    data: rows[0],
  });
});

// 4. GET /my/applications 🔒
exports.getMyApplications = asyncHandler(async (req, res) => {
  const { rows } = await pool.query(
    `SELECT oa.*, o.title as opportunity_title, o.category, o.department, o.mode, o.deadline
     FROM opportunity_applications oa
     JOIN opportunities o ON oa.opportunity_id = o.id
     WHERE oa.user_id = $1
     ORDER BY oa.applied_at DESC`,
    [req.user.id]
  );

  res.status(200).json({ success: true, data: rows });
});

// Admin: GET /admin/opportunities 🔒🛡
exports.adminGetOpportunities = asyncHandler(async (req, res) => {
  const status = req.query.status || null;
  let query = 'SELECT * FROM opportunities';
  const params = [];

  if (status) {
    params.push(status);
    query += ' WHERE status = $1';
  }

  query += ' ORDER BY created_at DESC';
  const { rows } = await pool.query(query, params);

  res.status(200).json({ success: true, data: rows });
});

// Admin: POST /admin/opportunities 🔒🛡
exports.adminCreateOpportunity = asyncHandler(async (req, res) => {
  const {
    category,
    title,
    department,
    location,
    mode,
    eligibility,
    description,
    responsibilities,
    requiredSkills,
    duration,
    seats,
    stipendInfo,
    deadline,
    status,
  } = req.body;

  const slug = await uniqueSlug('opportunities', title);

  const { rows } = await pool.query(
    `INSERT INTO opportunities (
       category, title, slug, department, location, mode, eligibility,
       description, responsibilities, required_skills, duration, seats,
       stipend_info, deadline, status
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
     RETURNING *`,
    [
      category,
      title,
      slug,
      department,
      location,
      mode || 'remote',
      eligibility,
      description,
      responsibilities,
      requiredSkills,
      duration,
      seats ? parseInt(seats, 10) : null,
      stipendInfo,
      deadline || null,
      status || 'open',
    ]
  );

  await logAction({
    userId: req.user.id,
    action: 'CREATE_OPPORTUNITY',
    entityType: 'opportunity',
    entityId: rows[0].id,
    req,
  });

  res.status(201).json({ success: true, data: rows[0] });
});

// Admin: PUT /admin/opportunities/:id 🔒🛡
exports.adminUpdateOpportunity = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    category,
    title,
    department,
    location,
    mode,
    eligibility,
    description,
    responsibilities,
    requiredSkills,
    duration,
    seats,
    stipendInfo,
    deadline,
    status,
  } = req.body;

  const { rows } = await pool.query(
    `UPDATE opportunities
     SET category = COALESCE($1, category),
         title = COALESCE($2, title),
         department = $3,
         location = $4,
         mode = COALESCE($5, mode),
         eligibility = $6,
         description = COALESCE($7, description),
         responsibilities = $8,
         required_skills = $9,
         duration = $10,
         seats = $11,
         stipend_info = $12,
         deadline = $13,
         status = COALESCE($14, status),
         updated_at = NOW()
     WHERE id = $15 RETURNING *`,
    [
      category,
      title,
      department,
      location,
      mode,
      eligibility,
      description,
      responsibilities,
      requiredSkills,
      duration,
      seats ? parseInt(seats, 10) : null,
      stipendInfo,
      deadline || null,
      status,
      id,
    ]
  );

  if (rows.length === 0) {
    return res.status(404).json({ success: false, error: 'Opportunity not found.' });
  }

  await logAction({
    userId: req.user.id,
    action: 'UPDATE_OPPORTUNITY',
    entityType: 'opportunity',
    entityId: id,
    req,
  });

  res.status(200).json({ success: true, data: rows[0] });
});

// Admin: DELETE /admin/opportunities/:id 🔒🛡 (Soft delete)
exports.adminDeleteOpportunity = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const { rows } = await pool.query(
    "UPDATE opportunities SET status = 'closed', updated_at = NOW() WHERE id = $1 RETURNING *",
    [id]
  );

  if (rows.length === 0) {
    return res.status(404).json({ success: false, error: 'Opportunity not found.' });
  }

  await logAction({
    userId: req.user.id,
    action: 'CLOSE_OPPORTUNITY',
    entityType: 'opportunity',
    entityId: id,
    req,
  });

  res.status(200).json({ success: true, message: 'Opportunity closed successfully.' });
});

// Admin: GET /admin/applications 🔒🛡
exports.adminGetApplications = asyncHandler(async (req, res) => {
  const { status, opportunityId } = req.query;

  let query = `
    SELECT oa.*, o.title as opportunity_title, o.category as opportunity_category,
           u.full_name as applicant_name, u.email as applicant_email
    FROM opportunity_applications oa
    JOIN opportunities o ON oa.opportunity_id = o.id
    JOIN users u ON oa.user_id = u.id
  `;
  const conditions = [];
  const params = [];

  if (status) {
    params.push(status);
    conditions.push(`oa.status = $${params.length}`);
  }

  if (opportunityId) {
    params.push(opportunityId);
    conditions.push(`oa.opportunity_id = $${params.length}`);
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }

  query += ' ORDER BY oa.applied_at DESC';
  const { rows } = await pool.query(query, params);

  res.status(200).json({ success: true, data: rows });
});

// Admin: PATCH /admin/applications/:id/status 🔒🛡
exports.adminUpdateApplicationStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ['applied', 'under_review', 'shortlisted', 'selected', 'rejected'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ success: false, error: 'Invalid application status.' });
  }

  const { rows } = await pool.query(
    `UPDATE opportunity_applications
     SET status = $1, updated_at = NOW()
     WHERE id = $2 RETURNING *`,
    [status, id]
  );

  if (rows.length === 0) {
    return res.status(404).json({ success: false, error: 'Application not found.' });
  }

  const appRecord = rows[0];

  // Lookup applicant and opportunity details for email
  const { rows: details } = await pool.query(
    `SELECT u.full_name, u.email, o.title
     FROM users u, opportunities o
     WHERE u.id = $1 AND o.id = $2`,
    [appRecord.user_id, appRecord.opportunity_id]
  );

  if (details.length > 0) {
    const { full_name, email, title } = details[0];
    await sendMail({
      to: email,
      subject: `Application Status Updated – ${title}`,
      html: `
        <h2>Application Status Update</h2>
        <p>Dear ${full_name},</p>
        <p>Your application status for <strong>${title}</strong> has been updated to: <strong>${status.replace('_', ' ').toUpperCase()}</strong>.</p>
        <p>You can check your status on your dashboard at any time.</p>
      `,
    });
  }

  await logAction({
    userId: req.user.id,
    action: 'UPDATE_APPLICATION_STATUS',
    entityType: 'opportunity_application',
    entityId: id,
    req,
  });

  res.status(200).json({ success: true, data: appRecord });
});

// Admin: GET /admin/applications/export 🔒🛡
exports.adminExportApplicationsCSV = asyncHandler(async (req, res) => {
  const { status, opportunityId } = req.query;

  let query = `
    SELECT oa.id, o.title as opportunity_title, o.category,
           u.full_name as applicant_name, u.email as applicant_email,
           oa.status, oa.applied_at, oa.resume_url
    FROM opportunity_applications oa
    JOIN opportunities o ON oa.opportunity_id = o.id
    JOIN users u ON oa.user_id = u.id
  `;
  const conditions = [];
  const params = [];

  if (status) {
    params.push(status);
    conditions.push(`oa.status = $${params.length}`);
  }

  if (opportunityId) {
    params.push(opportunityId);
    conditions.push(`oa.opportunity_id = $${params.length}`);
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }

  query += ' ORDER BY oa.applied_at DESC';
  const { rows } = await pool.query(query, params);

  const headers = ['Application ID', 'Opportunity Title', 'Category', 'Applicant Name', 'Applicant Email', 'Status', 'Applied At', 'Resume URL'];
  const csvRows = [headers.join(',')];

  rows.forEach((r) => {
    const values = [
      r.id,
      `"${(r.opportunity_title || '').replace(/"/g, '""')}"`,
      `"${(r.category || '').replace(/"/g, '""')}"`,
      `"${(r.applicant_name || '').replace(/"/g, '""')}"`,
      `"${(r.applicant_email || '').replace(/"/g, '""')}"`,
      r.status,
      r.applied_at ? new Date(r.applied_at).toISOString() : '',
      `"${(r.resume_url || '').replace(/"/g, '""')}"`,
    ];
    csvRows.push(values.join(','));
  });

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="asgard_opportunity_applications.csv"');
  res.status(200).send(csvRows.join('\n'));
});

// Admin / User: DELETE /admin/applications/:id
exports.deleteApplication = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { rows } = await pool.query('SELECT resume_public_id FROM opportunity_applications WHERE id = $1', [id]);
  if (rows.length === 0) {
    return res.status(404).json({ success: false, error: 'Application not found.' });
  }

  if (rows[0].resume_public_id) {
    await deleteFromCloudinary(rows[0].resume_public_id, 'raw');
  }

  await pool.query('DELETE FROM opportunity_applications WHERE id = $1', [id]);
  res.status(200).json({ success: true, message: 'Application deleted successfully.' });
});


