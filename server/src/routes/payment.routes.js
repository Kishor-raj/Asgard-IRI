const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const pool = require('../config/db');
const { verifyToken } = require('../utils/token');

// Optional auth helper to attach user if logged in
const optionalAuth = async (req, res, next) => {
  let userId = null;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const rawToken = authHeader.substring(7).trim();
    const decoded = verifyToken(rawToken);
    if (decoded?.userId) {
      userId = decoded.userId;
    }
  }

  if (!userId && req.session?.userId) {
    userId = req.session.userId;
  }

  if (!userId && req.headers.cookie) {
    const rawCookies = req.headers.cookie.split(';');
    for (const cookie of rawCookies) {
      const [k, ...v] = cookie.trim().split('=');
      if (k === 'token') {
        const decoded = verifyToken(decodeURIComponent(v.join('=').trim()));
        if (decoded?.userId) {
          userId = decoded.userId;
          break;
        }
      }
    }
  }

  if (userId) {
    try {
      const { rows } = await pool.query(
        'SELECT id, email, full_name, role, status FROM users WHERE id = $1',
        [userId]
      );
      if (rows.length) {
        req.user = rows[0];
      }
    } catch {
      // Ignore error for optional auth
    }
  }
  next();
};

router.post('/create-order', optionalAuth, paymentController.createOrder);
router.post('/verify', optionalAuth, paymentController.verifyPayment);

module.exports = router;
