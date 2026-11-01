const pool = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const { sendMail } = require('../utils/mailer');

// POST /contact
exports.submitContact = asyncHandler(async (req, res) => {
  const { name, email, phone, subject, message } = req.body;

  const { rows } = await pool.query(
    `INSERT INTO contact_enquiries (name, email, phone, subject, message, status)
     VALUES ($1, $2, $3, $4, $5, 'new') RETURNING *`,
    [name, email, phone || null, subject, message]
  );

  await sendMail({
    to: process.env.ADMIN_EMAIL || 'admin@asgard-iri.org',
    subject: `New Contact Enquiry – ${subject}`,
    html: `
      <h2>New Contact Enquiry</h2>
      <p><strong>From:</strong> ${name} (${email}, Phone: ${phone || 'N/A'})</p>
      <p><strong>Subject:</strong> ${subject}</p>
      <p><strong>Message:</strong></p>
      <p>${message}</p>
    `,
  });

  res.status(201).json({
    success: true,
    message: 'Your enquiry has been received. Our team will contact you shortly.',
    data: rows[0],
  });
});
