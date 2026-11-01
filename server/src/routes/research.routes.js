const express = require('express');
const router = express.Router();
const researchController = require('../controllers/research.controller');

router.get('/areas', researchController.getAreas);
router.get('/projects', researchController.getProjects);
router.get('/projects/:slug', researchController.getProjectBySlug);
router.get('/outputs', researchController.getResearchOutputs);
router.get('/outputs/:slug', researchController.getResearchOutputBySlug);

module.exports = router;
