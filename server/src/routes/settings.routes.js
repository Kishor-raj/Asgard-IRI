const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settings.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { authorise } = require('../middleware/role.middleware');

router.get('/public-school-active', settingsController.getPublicSchoolActive);
router.get('/site-tagline', settingsController.getSiteTagline);

router.put(
  '/public-school-active',
  authenticate,
  authorise('super_admin', 'foundation_admin'),
  settingsController.setPublicSchoolActive
);
router.put(
  '/site-tagline',
  authenticate,
  authorise('super_admin', 'foundation_admin'),
  settingsController.setSiteTagline
);

module.exports = router;
