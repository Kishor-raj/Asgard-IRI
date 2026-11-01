const express = require('express');
const router = express.Router();
const academyController = require('../controllers/academy.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.get('/programs', academyController.getPrograms);
router.get('/programs/:slug', academyController.getProgramBySlug);

// Phase 2: Program Enrollment
router.post('/programs/:id/register', authenticate, academyController.registerProgram);

module.exports = router;
