const pool = require('../config/db');

const logAction = async ({ userId, action, entityType, entityId, req }) => {
  try {
    await pool.query(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, ip_address)
       VALUES ($1, $2, $3, $4, $5)`,
      [userId || null, action, entityType, entityId || null, req?.ip || null]
    );
  } catch (err) {
    console.error('Audit log failed:', err.message);
    // Never throw — audit failure must not break the main operation
  }
};

module.exports = { logAction };
