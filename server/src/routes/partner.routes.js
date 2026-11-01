const express = require('express');
const router = express.Router();
const partnerController = require('../controllers/partner.controller');

router.get('/', partnerController.getPublicPartners);
router.get('/portal', partnerController.getPartnerPortalData);

module.exports = router;
