const express = require('express');
const crypto = require('crypto');
const { body } = require('express-validator');
const passport = require('../config/passport');
const pool = require('../config/db');
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { handleValidation } = require('../middleware/validate.middleware');
const { signToken } = require('../utils/token');

const router = express.Router();

const validateRegister = [
  body('fullName')
    .trim()
    .notEmpty()
    .withMessage('Full name is required.')
    .isLength({ max: 200 })
    .withMessage('Full name must be under 200 characters.'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email required.'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters.'),
  body('role')
    .isIn([
      'researcher',
      'author',
      'reviewer',
      'participant_applicant',
      'trainer_mentor',
      'content_editor',
      'journal_editor',
      'conference_admin',
      'academy_admin',
      'publication_editor',
      'technology_lab_admin',
      'innovation_admin',
      'careers_hr_admin',
    ])
    .withMessage('Invalid role selected.'),
];

router.post('/register', validateRegister, handleValidation, authController.register);
router.post('/login', authController.login);
router.post('/logout', authenticate, authController.logout);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.get('/me', authenticate, authController.getMe);
router.put('/me', authenticate, authController.updateMe);

// Helper to get normalized client URL
const getClientUrl = () => {
  const url = (process.env.CLIENT_URL || '').trim();
  if (url) return url.replace(/\/+$/, '');
  return process.env.NODE_ENV === 'production'
    ? 'https://asgard-iri.vercel.app'
    : 'http://localhost:5173';
};

// OAuth Helpers: generates JWT, sets cross-domain cookie, syncs session, and redirects to frontend callback
const createSessionAndRedirect = (req, user, res) => {
  return new Promise((resolve) => {
    const clientUrl = getClientUrl();
    if (!user) {
      res.redirect(`${clientUrl}/login?error=oauth_failed`);
      return resolve();
    }

    // 1. Generate JWT token
    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // 2. Set cross-domain secure HTTP-Only cookie
    const isProduction = process.env.NODE_ENV === 'production';
    const cookieSameSite = process.env.COOKIE_SAME_SITE || (isProduction ? 'none' : 'lax');
    const cookieSecure = isProduction || cookieSameSite === 'none';

    res.cookie('token', token, {
      httpOnly: true,
      secure: cookieSecure,
      sameSite: cookieSameSite,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/',
    });

    const redirectWithToken = async () => {
      try {
        const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
        await pool.query(
          `INSERT INTO sessions (user_id, token_hash, ip_address, user_agent, expires_at)
           VALUES ($1, $2, $3, $4, NOW() + INTERVAL '7 days')`,
          [user.id, tokenHash, req.ip || null, req.headers['user-agent'] || null]
        ).catch(() => {});
      } catch {
        // Ignored
      }

      res.redirect(`${clientUrl}/auth/callback?token=${encodeURIComponent(token)}`);
      resolve();
    };

    if (req.session) {
      req.session.regenerate((err) => {
        if (err) {
          console.error('Session regeneration error during OAuth callback:', err);
          return redirectWithToken();
        }
        req.session.userId = user.id;
        req.session.role = user.role;
        req.session.save((saveErr) => {
          if (saveErr) console.error('Session save error during OAuth callback:', saveErr);
          redirectWithToken();
        });
      });
    } else {
      redirectWithToken();
    }
  });
};

// Google OAuth initiation
router.get('/google', (req, res, next) => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return res.redirect(`${getClientUrl()}/login?error=oauth_not_configured`);
  }
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    prompt: 'select_account',
  })(req, res, next);
});

// Google OAuth callback
router.get(
  '/google/callback',
  (req, res, next) => {
    passport.authenticate('google', {
      failureRedirect: `${getClientUrl()}/login?error=oauth_failed`,
      session: true,
    })(req, res, next);
  },
  (req, res) => createSessionAndRedirect(req, req.user, res)
);

router.createSessionAndRedirect = createSessionAndRedirect;
router.getClientUrl = getClientUrl;

module.exports = router;

