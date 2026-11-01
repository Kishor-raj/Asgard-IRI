const pool = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const { sendMail } = require('../utils/mailer');
const { deleteFromCloudinary } = require('../utils/cloudinaryDelete');

// 1. GET /researchers?search=&area=&page=
exports.getResearchers = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, parseInt(req.query.limit, 10) || 12);
  const offset = (page - 1) * limit;

  const search = req.query.search?.trim();
  const area = req.query.area?.trim();

  let query = `
    SELECT rp.*, u.full_name, u.email, u.profile_photo
    FROM researcher_profiles rp
    JOIN users u ON rp.user_id = u.id
    WHERE rp.is_public = true AND u.status = 'active'
  `;
  const conditions = [];
  const params = [];

  if (search) {
    params.push(`%${search}%`);
    conditions.push(`(u.full_name ILIKE $${params.length} OR rp.affiliation ILIKE $${params.length} OR rp.research_interests ILIKE $${params.length})`);
  }

  if (area) {
    params.push(`%${area}%`);
    conditions.push(`rp.research_interests ILIKE $${params.length}`);
  }

  if (conditions.length > 0) {
    query += ' AND ' + conditions.join(' AND ');
  }

  query += ` ORDER BY u.full_name ASC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
  const queryParams = [...params, limit, offset];

  const { rows } = await pool.query(query, queryParams);

  let countQuery = `
    SELECT COUNT(*)
    FROM researcher_profiles rp
    JOIN users u ON rp.user_id = u.id
    WHERE rp.is_public = true AND u.status = 'active'
  `;
  if (conditions.length > 0) {
    countQuery += ' AND ' + conditions.join(' AND ');
  }
  const { rows: countRows } = await pool.query(countQuery, params);
  const total = parseInt(countRows[0].count, 10);

  res.status(200).json({
    success: true,
    data: rows,
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
  });
});

// 2. GET /researchers/:id
exports.getResearcherById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const { rows } = await pool.query(
    `SELECT rp.*, u.full_name, u.email, u.profile_photo, u.bio as user_bio
     FROM researcher_profiles rp
     JOIN users u ON rp.user_id = u.id
     WHERE rp.id = $1 OR rp.user_id = $1`,
    [id]
  );

  if (rows.length === 0) {
    return res.status(404).json({ success: false, error: 'Researcher not found.' });
  }

  const profile = rows[0];

  // Fetch researcher publications
  const { rows: publications } = await pool.query(
    'SELECT * FROM researcher_publications WHERE researcher_id = $1 ORDER BY year DESC NULLS LAST',
    [profile.id]
  );
  profile.publications = publications;

  // Fetch researcher projects
  const { rows: projects } = await pool.query(
    `SELECT p.* FROM research_projects p
     JOIN researcher_projects rp ON p.id = rp.project_id
     WHERE rp.researcher_id = $1`,
    [profile.id]
  );
  profile.projects = projects;

  // Fetch linked repository outputs
  const { rows: linkedOutputs } = await pool.query(
    `SELECT ro.*
     FROM research_outputs ro
     JOIN researcher_output_links rol ON ro.id = rol.output_id
     WHERE rol.researcher_id = $1
     ORDER BY ro.year DESC NULLS LAST, ro.created_at DESC`,
    [profile.id]
  );
  profile.linkedOutputs = linkedOutputs;

  res.status(200).json({ success: true, data: profile });
});

// 3. PUT /researchers/me 🔒 (role: researcher)
exports.updateMyProfile = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const {
    designation,
    affiliation,
    orcidUrl,
    googleScholarUrl,
    scopusUrl,
    researchInterests,
    biography,
    cvUrl,
    isPublic,
  } = req.body;

  const photoUrl = req.file?.path;
  const photoPublicId = req.file?.filename;

  if (photoUrl && photoPublicId) {
    const { rows: oldUser } = await pool.query('SELECT photo_public_id FROM users WHERE id = $1', [userId]);
    if (oldUser[0]?.photo_public_id) {
      await deleteFromCloudinary(oldUser[0].photo_public_id, 'image');
    }
    await pool.query(
      'UPDATE users SET profile_photo = $1, photo_public_id = $2, updated_at = NOW() WHERE id = $3',
      [photoUrl, photoPublicId, userId]
    );
  }

  // Find or create profile
  const { rows: existing } = await pool.query(
    'SELECT id FROM researcher_profiles WHERE user_id = $1',
    [userId]
  );

  let profile;
  if (existing.length === 0) {
    const { rows: created } = await pool.query(
      `INSERT INTO researcher_profiles (
         user_id, designation, affiliation, orcid_url, google_scholar_url,
         scopus_url, research_interests, biography, cv_url, is_public, photo_public_id
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
      [
        userId,
        designation,
        affiliation,
        orcidUrl,
        googleScholarUrl,
        scopusUrl,
        researchInterests,
        biography,
        cvUrl,
        isPublic !== undefined ? isPublic : true,
        photoPublicId || null,
      ]
    );
    profile = created[0];
  } else {
    const { rows: updated } = await pool.query(
      `UPDATE researcher_profiles
       SET designation = COALESCE($1, designation),
           affiliation = COALESCE($2, affiliation),
           orcid_url = $3,
           google_scholar_url = $4,
           scopus_url = $5,
           research_interests = COALESCE($6, research_interests),
           biography = COALESCE($7, biography),
           cv_url = COALESCE($8, cv_url),
           is_public = COALESCE($9, is_public),
           photo_public_id = COALESCE($10, photo_public_id),
           updated_at = NOW()
       WHERE user_id = $11 RETURNING *`,
      [
        designation,
        affiliation,
        orcidUrl,
        googleScholarUrl,
        scopusUrl,
        researchInterests,
        biography,
        cvUrl,
        isPublic,
        photoPublicId || null,
        userId,
      ]
    );
    profile = updated[0];
  }

  if (affiliation !== undefined) {
    await pool.query(
      'UPDATE users SET affiliation = $1, updated_at = NOW() WHERE id = $2',
      [affiliation, userId]
    ).catch(() => {});
  }

  res.status(200).json({ success: true, data: profile });
});

// 4. POST /researchers/me/publications 🔒
exports.addMyPublication = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { title, journal, year, doiUrl } = req.body;

  if (!title) {
    return res.status(400).json({ success: false, error: 'Title is required.' });
  }

  // Get researcher_profile
  let { rows: profiles } = await pool.query(
    'SELECT id FROM researcher_profiles WHERE user_id = $1',
    [userId]
  );
  if (profiles.length === 0) {
    const { rows: created } = await pool.query(
      'INSERT INTO researcher_profiles (user_id) VALUES ($1) RETURNING id',
      [userId]
    );
    profiles = created;
  }

  const { rows } = await pool.query(
    `INSERT INTO researcher_publications (researcher_id, title, journal, year, doi_url)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [profiles[0].id, title, journal, year ? parseInt(year, 10) : null, doiUrl]
  );

  res.status(201).json({ success: true, data: rows[0] });
});

// 5. DELETE /researchers/me/publications/:pubId 🔒
exports.deleteMyPublication = asyncHandler(async (req, res) => {
  const { pubId } = req.params;
  const userId = req.user.id;

  const { rowCount } = await pool.query(
    `DELETE FROM researcher_publications
     WHERE id = $1 AND researcher_id IN (SELECT id FROM researcher_profiles WHERE user_id = $2)`,
    [pubId, userId]
  );

  if (rowCount === 0) {
    return res.status(404).json({ success: false, error: 'Publication not found or not owned by you.' });
  }

  res.status(200).json({ success: true, message: 'Publication removed.' });
});

// 6. POST /researchers/:id/collaboration-request
exports.collaborationRequest = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, email, affiliation, subject, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ success: false, error: 'Name, email, and message are required.' });
  }

  // Lookup researcher and user email
  const { rows } = await pool.query(
    `SELECT rp.id as profile_id, u.full_name, u.email
     FROM researcher_profiles rp
     JOIN users u ON rp.user_id = u.id
     WHERE rp.id = $1 OR rp.user_id = $1`,
    [id]
  );

  if (rows.length === 0) {
    return res.status(404).json({ success: false, error: 'Researcher not found.' });
  }

  const researcher = rows[0];

  // Record in collaboration_requests
  await pool.query(
    `INSERT INTO collaboration_requests
       (researcher_id, sender_name, sender_email, sender_affiliation, subject, message, status)
     VALUES ($1, $2, $3, $4, $5, $6, 'pending')`,
    [
      researcher.profile_id,
      name,
      email,
      affiliation || null,
      subject || `Academic Collaboration Inquiry from ${name}`,
      message,
    ]
  );

  // Also record in contact_enquiries for admin oversight
  await pool.query(
    `INSERT INTO contact_enquiries (name, email, subject, message, status)
     VALUES ($1, $2, $3, $4, 'new')`,
    [name, email, subject || `Collaboration Request for ${researcher.full_name}`, message]
  );

  // Send email to researcher
  await sendMail({
    to: researcher.email,
    subject: `Academic Collaboration Request from ${name}`,
    html: `
      <h2>Academic Collaboration Request</h2>
      <p>Dear ${researcher.full_name},</p>
      <p>You have received a new research collaboration proposal via ASGARD-IRI:</p>
      <p><strong>From:</strong> ${name} (<a href="mailto:${email}">${email}</a>)</p>
      ${affiliation ? `<p><strong>Affiliation:</strong> ${affiliation}</p>` : ''}
      <p><strong>Subject:</strong> ${subject || 'Research Collaboration'}</p>
      <p><strong>Proposal Summary:</strong></p>
      <p style="background: #f4f4f4; padding: 12px; border-radius: 6px;">${message}</p>
    `,
  });

  res.status(200).json({
    success: true,
    message: 'Your collaboration request has been sent to the researcher.',
  });
});

// Phase 3: POST /researchers/me/link-output/:outputId 🔒
exports.linkMyOutput = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { outputId } = req.params;

  // Get researcher_profile
  let { rows: profiles } = await pool.query(
    'SELECT id FROM researcher_profiles WHERE user_id = $1',
    [userId]
  );
  if (profiles.length === 0) {
    const { rows: created } = await pool.query(
      'INSERT INTO researcher_profiles (user_id) VALUES ($1) RETURNING id',
      [userId]
    );
    profiles = created;
  }

  const profileId = profiles[0].id;

  // Check output exists
  const { rows: outputs } = await pool.query('SELECT id, title FROM research_outputs WHERE id = $1', [outputId]);
  if (outputs.length === 0) {
    return res.status(404).json({ success: false, error: 'Research output not found.' });
  }

  // Check if already linked
  const { rows: existing } = await pool.query(
    'SELECT id FROM researcher_output_links WHERE researcher_id = $1 AND output_id = $2',
    [profileId, outputId]
  );
  if (existing.length > 0) {
    return res.status(409).json({ success: false, error: 'This research output is already linked to your profile.' });
  }

  const { rows } = await pool.query(
    `INSERT INTO researcher_output_links (researcher_id, output_id)
     VALUES ($1, $2) RETURNING *`,
    [profileId, outputId]
  );

  res.status(201).json({
    success: true,
    data: rows[0],
    message: 'Research output linked to your profile successfully.',
  });
});

// Phase 3: DELETE /researchers/me/link-output/:outputId 🔒
exports.unlinkMyOutput = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { outputId } = req.params;

  const { rows: profiles } = await pool.query(
    'SELECT id FROM researcher_profiles WHERE user_id = $1',
    [userId]
  );
  if (profiles.length === 0) {
    return res.status(404).json({ success: false, error: 'Researcher profile not found.' });
  }

  const { rowCount } = await pool.query(
    'DELETE FROM researcher_output_links WHERE researcher_id = $1 AND output_id = $2',
    [profiles[0].id, outputId]
  );

  if (rowCount === 0) {
    return res.status(404).json({ success: false, error: 'Linked output not found on your profile.' });
  }

  res.status(200).json({ success: true, message: 'Research output unlinked from your profile.' });
});

// Phase 3: GET /researchers/me/linked-outputs 🔒
exports.getMyLinkedOutputs = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const { rows: profiles } = await pool.query(
    'SELECT id FROM researcher_profiles WHERE user_id = $1',
    [userId]
  );
  if (profiles.length === 0) {
    return res.status(200).json({ success: true, data: [] });
  }

  const { rows } = await pool.query(
    `SELECT ro.*
     FROM research_outputs ro
     JOIN researcher_output_links rol ON ro.id = rol.output_id
     WHERE rol.researcher_id = $1
     ORDER BY ro.year DESC NULLS LAST, ro.created_at DESC`,
    [profiles[0].id]
  );

  res.status(200).json({ success: true, data: rows });
});

