const pool = require('../config/db');

const authenticate = async (req, res, next) => {
  if (!req.session?.userId) {
    return res.status(401).json({ success: false, error: 'Not authenticated.' });
  }

  try {
    const { rows } = await pool.query(
      'SELECT id, email, full_name, role, status, affiliation FROM users WHERE id = $1',
      [req.session.userId]
    );
    if (!rows.length) {
      return res.status(401).json({ success: false, error: 'Session invalid.' });
    }

    req.user = rows[0]; // { id, email, full_name, role, status, affiliation }
    next();
  } catch {
    res.status(500).json({ success: false, error: 'Server error during authentication.' });
  }
};

module.exports = { authenticate };
