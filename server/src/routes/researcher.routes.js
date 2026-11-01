const express = require('express');
const router = express.Router();
const researcherController = require('../controllers/researcher.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { authorise } = require('../middleware/role.middleware');
const { uploadPhoto } = require('../middleware/upload.middleware');

router.get('/', researcherController.getResearchers);
router.get('/:id', researcherController.getResearcherById);
router.put('/me', authenticate, authorise('researcher', 'super_admin'), uploadPhoto.single('profilePhoto'), researcherController.updateMyProfile);
router.post('/me/publications', authenticate, authorise('researcher', 'super_admin'), researcherController.addMyPublication);
router.delete('/me/publications/:pubId', authenticate, authorise('researcher', 'super_admin'), researcherController.deleteMyPublication);
router.get('/me/linked-outputs', authenticate, authorise('researcher', 'super_admin'), researcherController.getMyLinkedOutputs);
router.post('/me/link-output/:outputId', authenticate, authorise('researcher', 'super_admin'), researcherController.linkMyOutput);
router.delete('/me/link-output/:outputId', authenticate, authorise('researcher', 'super_admin'), researcherController.unlinkMyOutput);
router.post('/:id/collaboration-request', researcherController.collaborationRequest);

module.exports = router;
