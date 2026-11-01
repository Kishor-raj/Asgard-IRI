const express = require('express');
const router = express.Router();
const consultancyController = require('../controllers/consultancy.controller');

router.post('/request', consultancyController.createRequest);

module.exports = router;
