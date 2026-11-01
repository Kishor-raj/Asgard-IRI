const express = require('express');
const router = express.Router();
const conferenceController = require('../controllers/conference.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { uploadPaper } = require('../middleware/upload.middleware');

router.get('/', conferenceController.getConferences);
router.get('/:slug', conferenceController.getConferenceBySlug);

// Phase 2: Submit paper & Register
router.post('/:id/submit', authenticate, uploadPaper.single('file'), conferenceController.submitPaper);
router.post('/:id/register', authenticate, conferenceController.registerConference);

module.exports = router;
