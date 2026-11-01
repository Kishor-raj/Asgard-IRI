const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');

// Optional auth helper to attach user if logged in
const optionalAuth = async (req, res, next) => {
  if (req.session?.userId) {
    try {
      const pool = require('../config/db');
      const { rows } = await pool.query(
        'SELECT id, email, full_name, role, status FROM users WHERE id = $1',
        [req.session.userId]
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
