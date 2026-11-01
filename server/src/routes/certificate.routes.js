const express = require('express');
const router = express.Router();
const certificateController = require('../controllers/certificate.controller');

router.get('/verify/:uid', certificateController.verifyCertificate);

module.exports = router;
