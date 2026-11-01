const crypto = require('crypto');
const Razorpay = require('razorpay');
const pool = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const { logAction } = require('../utils/audit');
const { autoIssueCertificate } = require('./certificate.controller');

let razorpayClient = null;
try {
  if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    razorpayClient = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
} catch (err) {
  console.warn('Razorpay client initialization warning:', err.message);
}

// POST /payments/create-order
exports.createOrder = asyncHandler(async (req, res) => {
  const { amount, currency = 'INR', entityType, entityId } = req.body;
  const userId = req.user ? req.user.id : null;

  if (!amount || !entityType || !entityId) {
    return res.status(400).json({
      success: false,
      error: 'amount, entityType, and entityId are required.',
    });
  }

  const numericAmount = parseFloat(amount);
  if (isNaN(numericAmount) || numericAmount <= 0) {
    return res.status(400).json({
      success: false,
      error: 'Valid positive amount is required.',
    });
  }

  let orderId = `order_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  // Attempt real Razorpay order creation if client exists
  if (razorpayClient && !process.env.RAZORPAY_KEY_ID.includes('mock') && !process.env.RAZORPAY_KEY_ID.includes('sandbox')) {
    try {
      const order = await razorpayClient.orders.create({
        amount: Math.round(numericAmount * 100), // paise
        currency,
        receipt: `rcpt_${entityType}_${entityId}_${Date.now()}`,
      });
      orderId = order.id;
    } catch (razorpayError) {
      console.warn('Razorpay gateway fallback to mock order:', razorpayError.message);
    }
  }

  // Record order in payments table
  const { rows } = await pool.query(
    `INSERT INTO payments
       (user_id, entity_type, entity_id, gateway, order_id, amount, currency, status)
     VALUES ($1, $2, $3, 'razorpay', $4, $5, $6, 'created')
     RETURNING *`,
    [userId, entityType, entityId, orderId, numericAmount, currency]
  );

  res.status(201).json({
    success: true,
    data: {
      orderId,
      amount: numericAmount,
      currency,
      keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_asgard_iri_sandbox_key',
      paymentRecordId: rows[0].id,
    },
  });
});

// POST /payments/verify
exports.verifyPayment = asyncHandler(async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    entityType,
    entityId,
  } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({
      success: false,
      error: 'razorpay_order_id, razorpay_payment_id, and razorpay_signature are required.',
    });
  }

  const secret = process.env.RAZORPAY_KEY_SECRET || 'rzp_test_asgard_iri_secret_key_987654321';
  const body = razorpay_order_id + '|' + razorpay_payment_id;
  const expectedSig = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex');

  // Verify HMAC signature
  if (expectedSig !== razorpay_signature) {
    // Record failed payment
    await pool.query(
      `UPDATE payments
       SET status = 'failed', payment_id = $1, updated_at = NOW()
       WHERE order_id = $2`,
      [razorpay_payment_id, razorpay_order_id]
    );

    return res.status(400).json({
      success: false,
      error: 'Payment signature verification failed.',
    });
  }

  // Update payments table to 'paid'
  const paymentResult = await pool.query(
    `UPDATE payments
     SET status = 'paid', payment_id = $1, updated_at = NOW()
     WHERE order_id = $2
     RETURNING *`,
    [razorpay_payment_id, razorpay_order_id]
  );

  let targetEntityType = entityType;
  let targetEntityId = entityId;

  if (paymentResult.rows.length > 0) {
    targetEntityType = targetEntityType || paymentResult.rows[0].entity_type;
    targetEntityId = targetEntityId || paymentResult.rows[0].entity_id;
  }

  let updatedRegistration = null;
  let issuedCertificate = null;

  // Process entity registration & auto-generate certificate
  if (targetEntityType === 'conference_registration' && targetEntityId) {
    const regRes = await pool.query(
      `UPDATE conference_registrations
       SET payment_status = 'paid', updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [targetEntityId]
    );
    if (regRes.rows.length > 0) {
      updatedRegistration = regRes.rows[0];
      // Fetch conference details for certificate label
      const confRes = await pool.query(
        'SELECT title FROM conferences WHERE id = $1',
        [updatedRegistration.conference_id]
      );
      const confTitle = confRes.rows[0]?.title || 'ASGARD-IRI International Conference';

      try {
        issuedCertificate = await autoIssueCertificate(
          updatedRegistration.user_id,
          'conference',
          updatedRegistration.conference_id,
          `${confTitle} — Delegate Credential`
        );
      } catch (certErr) {
        console.error('Auto certificate generation error (conference):', certErr);
      }
    }
  } else if (targetEntityType === 'academy_registration' && targetEntityId) {
    const regRes = await pool.query(
      `UPDATE academy_registrations
       SET payment_status = 'paid', status = 'confirmed', updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [targetEntityId]
    );
    if (regRes.rows.length > 0) {
      updatedRegistration = regRes.rows[0];
      const progRes = await pool.query(
        'SELECT title FROM academy_programs WHERE id = $1',
        [updatedRegistration.program_id]
      );
      const progTitle = progRes.rows[0]?.title || 'ASGARD Academy Programme';

      try {
        issuedCertificate = await autoIssueCertificate(
          updatedRegistration.user_id,
          'academy',
          updatedRegistration.program_id,
          `${progTitle} — Verified Completion`
        );
      } catch (certErr) {
        console.error('Auto certificate generation error (academy):', certErr);
      }
    }
  }

  res.status(200).json({
    success: true,
    message: 'Payment verified and confirmed successfully.',
    data: {
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      paymentStatus: 'paid',
      registration: updatedRegistration,
      certificate: issuedCertificate,
    },
  });
});

// Admin: GET /admin/payments
exports.adminGetPayments = asyncHandler(async (req, res) => {
  const { status, entityType, search, limit = 50, offset = 0 } = req.query;
  const conditions = [];
  const params = [];

  if (status && status !== 'all') {
    params.push(status);
    conditions.push(`p.status = $${params.length}`);
  }

  if (entityType && entityType !== 'all') {
    params.push(entityType);
    conditions.push(`p.entity_type = $${params.length}`);
  }

  if (search) {
    params.push(`%${search}%`);
    conditions.push(`(p.order_id ILIKE $${params.length} OR p.payment_id ILIKE $${params.length} OR u.email ILIKE $${params.length})`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  params.push(parseInt(limit, 10));
  const limitClause = `LIMIT $${params.length}`;
  params.push(parseInt(offset, 10));
  const offsetClause = `OFFSET $${params.length}`;

  const query = `
    SELECT p.*, u.full_name AS user_name, u.email AS user_email
    FROM payments p
    LEFT JOIN users u ON u.id = p.user_id
    ${whereClause}
    ORDER BY p.created_at DESC
    ${limitClause} ${offsetClause}
  `;

  const { rows } = await pool.query(query, params);

  const countQuery = `
    SELECT COUNT(*) FROM payments p
    LEFT JOIN users u ON u.id = p.user_id
    ${whereClause}
  `;
  const countRes = await pool.query(countQuery, params.slice(0, conditions.length));

  res.status(200).json({
    success: true,
    data: rows,
    total: parseInt(countRes.rows[0].count, 10),
  });
});

// Admin: POST /admin/payments/:id/refund
exports.adminRefundPayment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reason = 'Administrative refund' } = req.body;

  const { rows } = await pool.query(
    `UPDATE payments
     SET status = 'refunded', updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [id]
  );

  if (rows.length === 0) {
    return res.status(404).json({ success: false, error: 'Payment record not found.' });
  }

  const payment = rows[0];

  await logAction({
    userId: req.user.id,
    action: 'REFUND_PAYMENT',
    entityType: 'payment',
    entityId: payment.id,
    req,
  });

  res.status(200).json({
    success: true,
    data: payment,
    message: `Payment marked as refunded: ${reason}`,
  });
});

// Admin: GET /admin/payments/export
exports.exportPaymentsCSV = asyncHandler(async (req, res) => {
  const { rows } = await pool.query(
    `SELECT p.id, p.order_id, p.payment_id, p.amount, p.currency, p.status, p.entity_type, p.entity_id,
            p.created_at, u.full_name AS user_name, u.email AS user_email
     FROM payments p
     LEFT JOIN users u ON u.id = p.user_id
     ORDER BY p.created_at DESC`
  );

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="asgard_payments_export.csv"');

  const headers = ['ID', 'Order ID', 'Payment ID', 'Amount', 'Currency', 'Status', 'Entity Type', 'Entity ID', 'User Name', 'User Email', 'Created At'];
  res.write(headers.join(',') + '\n');

  for (const row of rows) {
    const csvLine = [
      row.id,
      `"${row.order_id || ''}"`,
      `"${row.payment_id || ''}"`,
      row.amount,
      row.currency,
      row.status,
      row.entity_type,
      row.entity_id,
      `"${(row.user_name || '').replace(/"/g, '""')}"`,
      `"${(row.user_email || '').replace(/"/g, '""')}"`,
      `"${row.created_at ? new Date(row.created_at).toISOString() : ''}"`,
    ].join(',');
    res.write(csvLine + '\n');
  }

  res.end();
});
