const express = require('express');
const router = express.Router();
const publicationController = require('../controllers/publication.controller');

router.get('/', publicationController.getPublications);
router.get('/:slug', publicationController.getPublicationBySlug);

module.exports = router;
