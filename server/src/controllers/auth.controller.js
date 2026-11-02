const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const pool = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const { sendMail } = require('../utils/mailer');
const { logAction } = require('../utils/audit');
const { signToken } = require('../utils/token');

// 1. POST /auth/register
exports.register = asyncHandler(async (req, res) => {
  const { fullName, email, password, role, affiliation } = req.body;

  // Check duplicate email
  const { rows: existing } = await pool.query(
    'SELECT id FROM users WHERE LOWER(email) = LOWER($1)',
    [email]
  );
  if (existing.length > 0) {
    return res.status(409).json({ success: false, error: 'Email already registered.' });
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, 12);

  // Insert user with status = 'pending'
  const { rows } = await pool.query(
    `INSERT INTO users (email, password_hash, full_name, role, status, affiliation)
     VALUES (LOWER($1), $2, $3, $4, 'pending', $5)
     RETURNING id, email, full_name, role, status, affiliation, created_at`,
    [email, passwordHash, fullName, role, affiliation || null]
  );

  const newUser = rows[0];

  // Send email to ADMIN_EMAIL
  await sendMail({
    to: process.env.ADMIN_EMAIL || 'admin@asgard-iri.org',
    subject: `New User Pending Approval – ${fullName}`,
    html: `
      <h2>New User Registration</h2>
      <p>A new user has registered and is pending approval:</p>
      <ul>
        <li><strong>Name:</strong> ${fullName}</li>
        <li><strong>Email:</strong> ${email}</li>
        <li><strong>Requested Role:</strong> ${role}</li>
      </ul>
      <p>Please review and approve in the Admin Panel.</p>
    `,
  });

  res.status(201).json({
    success: true,
    message: 'Registration successful. Awaiting admin approval.',
    data: {
      id: newUser.id,
      email: newUser.email,
      fullName: newUser.full_name,
      role: newUser.role,
      status: newUser.status,
    },
  });
});

// 2. POST /auth/login
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Email and password are required.' });
  }

  const { rows } = await pool.query(
    'SELECT * FROM users WHERE LOWER(email) = LOWER($1)',
    [email]
  );

  if (rows.length === 0) {
    return res.status(401).json({ success: false, error: 'Invalid credentials.' });
  }

  const user = rows[0];

  // If user only registered via OAuth
  if (user.oauth_provider && !user.password_hash) {
    return res.status(401).json({
      success: false,
      error: 'Please sign in with Google.',
    });
  }

  const matches = await bcrypt.compare(password, user.password_hash || '');
  if (!matches) {
    return res.status(401).json({ success: false, error: 'Invalid credentials.' });
  }

  if (user.status === 'pending') {
    return res.status(403).json({ success: false, error: 'Account pending admin approval.' });
  }

  if (user.status === 'rejected') {
    return res.status(403).json({
      success: false,
      error: 'Account application unsuccessful. Contact support.',
    });
  }

  if (user.status !== 'active') {
    return res.status(403).json({ success: false, error: 'Account is not active.' });
  }

  // Generate JWT token
  const token = signToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  const isProduction = process.env.NODE_ENV === 'production';
  const cookieSameSite = process.env.COOKIE_SAME_SITE || (isProduction ? 'none' : 'lax');
  const cookieSecure = isProduction || cookieSameSite === 'none';

  res.cookie('token', token, {
    httpOnly: true,
    secure: cookieSecure,
    sameSite: cookieSameSite,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  });

  const respondWithSuccess = async () => {
    // Record in sessions table
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    await pool.query(
      `INSERT INTO sessions (user_id, token_hash, ip_address, user_agent, expires_at)
       VALUES ($1, $2, $3, $4, NOW() + INTERVAL '7 days')`,
      [user.id, tokenHash, req.ip || null, req.headers['user-agent'] || null]
    ).catch(() => {});

    res.status(200).json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.full_name,
          role: user.role,
          status: user.status,
          profilePhoto: user.profile_photo,
          bio: user.bio,
          affiliation: user.affiliation || '',
        },
      },
    });
  };

  // Regenerate session to prevent session fixation
  if (req.session) {
    req.session.regenerate(async (err) => {
      if (err) {
        return res.status(500).json({ success: false, error: 'Failed to establish session.' });
      }

      req.session.userId = user.id;
      req.session.role = user.role;

      req.session.save(async (saveErr) => {
        if (saveErr) {
          return res.status(500).json({ success: false, error: 'Failed to save session.' });
        }
        await respondWithSuccess();
      });
    });
  } else {
    await respondWithSuccess();
  }
});

// 3. POST /auth/logout
exports.logout = asyncHandler(async (req, res) => {
  const userId = req.user?.id || req.session?.userId;
  const isProduction = process.env.NODE_ENV === 'production';
  const cookieSameSite = process.env.COOKIE_SAME_SITE || (isProduction ? 'none' : 'lax');
  const cookieSecure = isProduction || cookieSameSite === 'none';

  res.clearCookie('connect.sid', { path: '/', secure: cookieSecure, sameSite: cookieSameSite });
  res.clearCookie('token', { path: '/', secure: cookieSecure, sameSite: cookieSameSite });

  if (userId) {
    await pool.query('DELETE FROM sessions WHERE user_id = $1', [userId]).catch(() => {});
  }

  if (req.session) {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ success: false, error: 'Could not log out.' });
      }
      res.status(200).json({ success: true, message: 'Logged out successfully.' });
    });
  } else {
    res.status(200).json({ success: true, message: 'Logged out successfully.' });
  }
});

// 4. POST /auth/forgot-password
exports.forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, error: 'Email is required.' });
  }

  const { rows } = await pool.query(
    'SELECT id, email, full_name FROM users WHERE LOWER(email) = LOWER($1)',
    [email]
  );

  if (rows.length > 0) {
    const user = rows[0];
    const rawToken = uuidv4();
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

    // Invalidate existing unused tokens
    await pool.query(
      'UPDATE password_reset_tokens SET used = true WHERE user_id = $1 AND used = false',
      [user.id]
    );

    // Save token with 1h expiry
    await pool.query(
      `INSERT INTO password_reset_tokens (user_id, token_hash, expires_at, used)
       VALUES ($1, $2, NOW() + INTERVAL '1 hour', false)`,
      [user.id, tokenHash]
    );

    const resetLink = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password?token=${rawToken}`;

    await sendMail({
      to: user.email,
      subject: 'Reset Your ASGARD-IRI Password',
      html: `
        <h2>Reset Your Password</h2>
        <p>Dear ${user.full_name},</p>
        <p>We received a request to reset your password. Click the link below to set a new password:</p>
        <p><a href="${resetLink}" target="_blank">Reset Password</a></p>
        <p>This link will expire in 1 hour. If you did not request this, you can safely ignore this email.</p>
      `,
    });
  }

  // Always return 200 for security
  res.status(200).json({
    success: true,
    message: 'If your email is registered, you will receive a reset link.',
  });
});

// 5. POST /auth/reset-password
exports.resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) {
    return res.status(400).json({ success: false, error: 'Token and new password are required.' });
  }

  if (password.length < 8) {
    return res.status(400).json({
      success: false,
      error: 'Password must be at least 8 characters long.',
    });
  }

  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

  const { rows } = await pool.query(
    `SELECT id, user_id FROM password_reset_tokens
     WHERE token_hash = $1 AND used = false AND expires_at > NOW()`,
    [tokenHash]
  );

  if (rows.length === 0) {
    return res.status(400).json({ success: false, error: 'Invalid or expired reset token.' });
  }

  const resetRecord = rows[0];
  const newHash = await bcrypt.hash(password, 12);

  await pool.query('UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2', [
    newHash,
    resetRecord.user_id,
  ]);

  await pool.query('UPDATE password_reset_tokens SET used = true WHERE id = $1', [
    resetRecord.id,
  ]);

  res.status(200).json({
    success: true,
    message: 'Password reset successful. You may now log in.',
  });
});

// 6. GET /auth/me
exports.getMe = asyncHandler(async (req, res) => {
  const { rows } = await pool.query(
    'SELECT id, email, full_name, role, status, profile_photo, bio, affiliation, created_at FROM users WHERE id = $1',
    [req.user.id]
  );

  if (rows.length === 0) {
    return res.status(404).json({ success: false, error: 'User not found.' });
  }

  const u = rows[0];
  res.status(200).json({
    success: true,
    data: {
      id: u.id,
      email: u.email,
      fullName: u.full_name,
      role: u.role,
      status: u.status,
      profilePhoto: u.profile_photo,
      bio: u.bio,
      affiliation: u.affiliation || '',
      createdAt: u.created_at,
    },
  });
});

// 7. PUT /auth/me
exports.updateMe = asyncHandler(async (req, res) => {
  const { fullName, bio, profilePhoto, affiliation } = req.body;

  const updates = [];
  const params = [];

  if (fullName !== undefined) {
    params.push(fullName);
    updates.push(`full_name = $${params.length}`);
  }
  if (bio !== undefined) {
    params.push(bio);
    updates.push(`bio = $${params.length}`);
  }
  if (profilePhoto !== undefined) {
    params.push(profilePhoto);
    updates.push(`profile_photo = $${params.length}`);
  }
  if (affiliation !== undefined) {
    params.push(affiliation);
    updates.push(`affiliation = $${params.length}`);
  }

  updates.push('updated_at = NOW()');
  params.push(req.user.id);

  const { rows } = await pool.query(
    `UPDATE users
     SET ${updates.join(', ')}
     WHERE id = $${params.length}
     RETURNING id, email, full_name, role, status, profile_photo, bio, affiliation, created_at`,
    params
  );

  if (rows.length === 0) {
    return res.status(404).json({ success: false, error: 'User not found.' });
  }

  const u = rows[0];

  // If role is researcher, sync researcher_profiles table as well if it exists
  if (req.user.role === 'researcher' && affiliation !== undefined) {
    await pool.query(
      `UPDATE researcher_profiles SET affiliation = $1, updated_at = NOW() WHERE user_id = $2`,
      [affiliation, req.user.id]
    ).catch(() => {});
  }

  res.status(200).json({
    success: true,
    data: {
      id: u.id,
      email: u.email,
      fullName: u.full_name,
      role: u.role,
      status: u.status,
      profilePhoto: u.profile_photo,
      bio: u.bio,
      affiliation: u.affiliation || '',
      createdAt: u.created_at,
    },
    message: 'Profile updated successfully.',
  });
});

