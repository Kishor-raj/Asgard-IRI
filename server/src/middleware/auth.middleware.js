const pool = require('../config/db');
const { verifyToken } = require('../utils/token');

const authenticate = async (req, res, next) => {
  let userId = null;

  // 1. Check Authorization header: Bearer <token>
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const rawToken = authHeader.substring(7).trim();
    const decoded = verifyToken(rawToken);
    if (decoded?.userId) {
      userId = decoded.userId;
    }
  }

  // 2. Check active express-session if no Bearer token
  if (!userId && req.session?.userId) {
    userId = req.session.userId;
  }

  // 3. Check token cookie if present in request headers
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

  if (!userId) {
    return res.status(401).json({ success: false, error: 'Not authenticated.' });
  }

  try {
    const { rows } = await pool.query(
      'SELECT id, email, full_name, role, status, affiliation FROM users WHERE id = $1',
      [userId]
    );
    if (!rows.length) {
      return res.status(401).json({ success: false, error: 'Session invalid.' });
    }

    req.user = rows[0]; // { id, email, full_name, role, status, affiliation }

    // Synchronize session if session store is active
    if (req.session) {
      req.session.userId = req.user.id;
      req.session.role = req.user.role;
    }

    next();
  } catch {
    res.status(500).json({ success: false, error: 'Server error during authentication.' });
  }
};

module.exports = { authenticate };

