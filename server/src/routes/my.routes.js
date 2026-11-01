const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth.middleware');

const opportunityController = require('../controllers/opportunity.controller');
const conferenceController = require('../controllers/conference.controller');
const academyController = require('../controllers/academy.controller');
const certificateController = require('../controllers/certificate.controller');
const innovationController = require('../controllers/innovation.controller');

// Require authentication on all /my/* routes
router.use(authenticate);

router.get('/applications', opportunityController.getMyApplications);
router.get('/conference-submissions', conferenceController.getMySubmissions);
router.get('/conference-registrations', conferenceController.getMyRegistrations);
router.get('/academy-registrations', academyController.getMyRegistrations);
router.get('/certificates', certificateController.getMyCertificates);
router.get('/innovation-applications', innovationController.getMyInnovationApplications);

module.exports = router;
