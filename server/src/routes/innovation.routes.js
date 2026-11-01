const express = require('express');
const router = express.Router();
const innovationController = require('../controllers/innovation.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { uploadBrief } = require('../middleware/upload.middleware');

router.get('/programs', innovationController.getPrograms);
router.get('/programs/:slug', innovationController.getProgramBySlug);
router.post('/programs/:id/apply', authenticate, uploadBrief.single('brief'), innovationController.applyToProgram);
router.get('/mentors', innovationController.getMentors);

module.exports = router;
