const pool = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const { sendMail } = require('../utils/mailer');
const { logAction } = require('../utils/audit');

// 1. POST /consultancy/request (Public)
exports.createRequest = asyncHandler(async (req, res) => {
  const name = req.body.name?.trim();
  const organisation = (req.body.organisation || req.body.organization)?.trim();
  const email = req.body.email?.trim();
  const phone = (req.body.phone || 'N/A').trim();
  const serviceType = (req.body.serviceType || req.body.service_type)?.trim();
  const projectDescription = (req.body.projectDescription || req.body.project_description)?.trim();
  const budgetRange = (req.body.budgetRange || req.body.budget_range || '').trim();
  const preferredTimeline = (req.body.preferredTimeline || req.body.preferred_timeline || '').trim();

  if (!name || !organisation || !email || !serviceType || !projectDescription) {
    return res.status(400).json({
      success: false,
      error: 'Please provide all required fields: name, organisation, email, serviceType, and projectDescription.',
    });
  }

  const { rows } = await pool.query(
    `INSERT INTO consultancy_requests (
       name, organisation, email, phone, service_type, project_description,
       budget_range, preferred_timeline, status
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'new') RETURNING *`,
    [
      name,
      organisation,
      email,
      phone,
      serviceType,
      projectDescription,
      budgetRange || null,
      preferredTimeline || null,
    ]
  );

  await sendMail({
    to: process.env.ADMIN_EMAIL || 'admin@asgard-iri.org',
    subject: `New Consultation Request – ${name} (${organisation})`,
    html: `
      <h2>New Institutional / Corporate Consultation Inquiry</h2>
      <p><strong>Principal Contact:</strong> ${name}</p>
      <p><strong>Organisation / Client:</strong> ${organisation}</p>
      <p><strong>Email:</strong> ${email} | <strong>Phone:</strong> ${phone}</p>
      <p><strong>Specialized Service Domain:</strong> ${serviceType}</p>
      <p><strong>Budget Envelope:</strong> ${budgetRange || 'Unspecified'}</p>
      <p><strong>Target Timeline:</strong> ${preferredTimeline || 'Flexible'}</p>
      <hr/>
      <h3>Project Brief & Scope of Inquiry:</h3>
      <p style="white-space: pre-wrap;">${projectDescription}</p>
    `,
  });

  res.status(201).json({
    success: true,
    message: 'Your consultation request has been submitted. Our team will contact you within 3 business days.',
    data: rows[0],
  });
});

// 2. Admin: GET /admin/consultancy/requests 🔒🛡
exports.getAdminRequests = asyncHandler(async (req, res) => {
  const { status, serviceType, startDate, endDate } = req.query;

  let query = 'SELECT * FROM consultancy_requests';
  const conditions = [];
  const params = [];

  if (status) {
    params.push(status);
    conditions.push(`status = $${params.length}`);
  }

  if (serviceType) {
    params.push(serviceType);
    conditions.push(`service_type = $${params.length}`);
  }

  if (startDate) {
    params.push(startDate);
    conditions.push(`created_at >= $${params.length}`);
  }

  if (endDate) {
    params.push(endDate);
    conditions.push(`created_at <= $${params.length}`);
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }

  query += ' ORDER BY created_at DESC';
  const { rows } = await pool.query(query, params);

  res.status(200).json({ success: true, data: rows });
});

// 3. Admin: PATCH /admin/consultancy/requests/:id/status 🔒🛡
exports.updateRequestStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const status = req.body.status;
  const adminNotes = req.body.adminNotes || req.body.admin_notes || null;

  const validStatuses = ['new', 'reviewed', 'in_discussion', 'engaged', 'closed'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
    });
  }

  const { rows } = await pool.query(
    `UPDATE consultancy_requests
     SET status = $1, admin_notes = COALESCE($2, admin_notes), updated_at = NOW()
     WHERE id = $3
     RETURNING *`,
    [status, adminNotes, id]
  );

  if (rows.length === 0) {
    return res.status(404).json({ success: false, error: 'Consultancy request not found.' });
  }

  await logAction({
    userId: req.user.id,
    action: 'UPDATE_CONSULTANCY_REQUEST_STATUS',
    entityType: 'consultancy_request',
    entityId: id,
    req,
  });

  res.status(200).json({ success: true, data: rows[0] });
});

// 4. Admin: GET /admin/consultancy/requests/export 🔒🛡
exports.exportConsultancyRequestsCSV = asyncHandler(async (req, res) => {
  const { status, serviceType } = req.query;

  let query = 'SELECT * FROM consultancy_requests';
  const conditions = [];
  const params = [];

  if (status) {
    params.push(status);
    conditions.push(`status = $${params.length}`);
  }

  if (serviceType) {
    params.push(serviceType);
    conditions.push(`service_type = $${params.length}`);
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }

  query += ' ORDER BY created_at DESC';
  const { rows } = await pool.query(query, params);

  const headers = [
    'Request ID',
    'Client Name',
    'Organisation',
    'Email',
    'Phone',
    'Service Domain',
    'Budget Range',
    'Preferred Timeline',
    'Status',
    'Submitted At',
    'Admin Notes',
  ];
  const csvRows = [headers.join(',')];

  rows.forEach((r) => {
    const values = [
      r.id,
      `"${(r.name || '').replace(/"/g, '""')}"`,
      `"${(r.organisation || '').replace(/"/g, '""')}"`,
      `"${(r.email || '').replace(/"/g, '""')}"`,
      `"${(r.phone || '').replace(/"/g, '""')}"`,
      `"${(r.service_type || '').replace(/"/g, '""')}"`,
      `"${(r.budget_range || '').replace(/"/g, '""')}"`,
      `"${(r.preferred_timeline || '').replace(/"/g, '""')}"`,
      r.status,
      r.created_at ? new Date(r.created_at).toISOString() : '',
      `"${(r.admin_notes || '').replace(/"/g, '""')}"`,
    ];
    csvRows.push(values.join(','));
  });

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="asgard_consultancy_requests.csv"');
  res.status(200).send(csvRows.join('\n'));
});
