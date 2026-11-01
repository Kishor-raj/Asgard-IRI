const express = require('express');
const { body } = require('express-validator');
const passport = require('../config/passport');
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { handleValidation } = require('../middleware/validate.middleware');

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

// OAuth Helpers
const createSessionAndRedirect = (req, user, res) => {
  req.session.regenerate((err) => {
    if (err) return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/login?error=oauth_failed`);
    req.session.userId = user.id;
    req.session.role = user.role;
    req.session.save((saveErr) => {
      if (saveErr) return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/login?error=oauth_failed`);
      const redirectPath = ['super_admin', 'foundation_admin'].includes(user.role) ? '/admin' : '/dashboard';
      res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}${redirectPath}`);
    });
  });
};

// Google OAuth
router.get('/google', (req, res, next) => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/login?error=oauth_not_configured`);
  }
  passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
});

router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: `${process.env.CLIENT_URL || 'http://localhost:5173'}/login?error=oauth_failed`,
  }),
  (req, res) => createSessionAndRedirect(req, req.user, res)
);


module.exports = router;
