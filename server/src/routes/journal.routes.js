const express = require('express');
const router = express.Router();
const journalController = require('../controllers/journal.controller');

router.get('/', journalController.getJournals);
router.get('/:id', journalController.getJournalById);

module.exports = router;
