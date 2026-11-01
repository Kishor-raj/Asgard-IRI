const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const contactController = require('../controllers/contact.controller');
const { handleValidation } = require('../middleware/validate.middleware');

const validateContact = [
  body('name').trim().notEmpty().withMessage('Name is required.'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required.'),
  body('subject').trim().notEmpty().isLength({ max: 200 }).withMessage('Subject is required.'),
  body('message').trim().notEmpty().isLength({ max: 5000 }).withMessage('Message is required.'),
];

router.post('/', validateContact, handleValidation, contactController.submitContact);

module.exports = router;
