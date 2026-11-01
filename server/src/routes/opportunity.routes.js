const express = require('express');
const router = express.Router();
const opportunityController = require('../controllers/opportunity.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { uploadResume } = require('../middleware/upload.middleware');

router.get('/', opportunityController.getOpportunities);
router.get('/:slug', opportunityController.getOpportunityBySlug);
router.post(
  '/:id/apply',
  authenticate,
  uploadResume.single('resume'),
  opportunityController.applyOpportunity
);

module.exports = router;
