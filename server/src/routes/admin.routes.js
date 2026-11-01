const express = require('express');
const router = express.Router();

const { authenticate } = require('../middleware/auth.middleware');
const { authorise } = require('../middleware/role.middleware');
const { uploadGallery, uploadCover, uploadCertificate, uploadPhoto } = require('../middleware/upload.middleware');

const adminController = require('../controllers/admin.controller');
const opportunityController = require('../controllers/opportunity.controller');
const researchController = require('../controllers/research.controller');
const journalController = require('../controllers/journal.controller');
const publicationController = require('../controllers/publication.controller');
const conferenceController = require('../controllers/conference.controller');
const academyController = require('../controllers/academy.controller');
const newsController = require('../controllers/news.controller');
const certificateController = require('../controllers/certificate.controller');
const innovationController = require('../controllers/innovation.controller');
const consultancyController = require('../controllers/consultancy.controller');
const settingsController = require('../controllers/settings.controller');
const paymentController = require('../controllers/payment.controller');
const partnerController = require('../controllers/partner.controller');

// Role constants
const ADMIN_ROLES = ['super_admin', 'foundation_admin'];
const CONTENT_ROLES = [...ADMIN_ROLES, 'content_editor', 'research_admin'];

// Protect all admin routes
router.use(authenticate);
router.use(authorise(...CONTENT_ROLES));

// Dashboard Stats & Reports
router.get('/dashboard/stats', adminController.getDashboardStats);
router.get('/reports/summary', adminController.getReportsSummary);

// Users Management (Super Admin & Foundation Admin only)
router.get('/users', authorise(...ADMIN_ROLES), adminController.getUsers);
router.get('/users/pending', authorise(...ADMIN_ROLES), adminController.getPendingUsers);
router.patch('/users/:id/approve', authorise(...ADMIN_ROLES), adminController.approveUser);
router.patch('/users/:id/reject', authorise(...ADMIN_ROLES), adminController.rejectUser);

// Opportunities Management
router.get('/opportunities', opportunityController.adminGetOpportunities);
router.post('/opportunities', opportunityController.adminCreateOpportunity);
router.put('/opportunities/:id', opportunityController.adminUpdateOpportunity);
router.delete('/opportunities/:id', opportunityController.adminDeleteOpportunity);
router.get('/applications', opportunityController.adminGetApplications);
router.get('/applications/export', opportunityController.adminExportApplicationsCSV);
router.patch('/applications/:id/status', opportunityController.adminUpdateApplicationStatus);
router.delete('/applications/:id', opportunityController.deleteApplication);

// Research Management
router.post('/research/areas', researchController.createArea);
router.post('/research/projects', researchController.createProject);
router.put('/research/projects/:id', researchController.updateProject);
router.delete('/research/projects/:id', researchController.deleteProject);
router.post('/research/outputs', researchController.createResearchOutput);
router.put('/research/outputs/:id', researchController.updateResearchOutput);
router.delete('/research/outputs/:id', researchController.deleteResearchOutput);

// Journals Management
router.post('/journals', journalController.createJournal);
router.put('/journals/:id', journalController.updateJournal);
router.delete('/journals/:id', journalController.deleteJournal);

// Publications Management
router.post('/publications', uploadCover.single('cover'), publicationController.createPublication);
router.put('/publications/:id', uploadCover.single('cover'), publicationController.updatePublication);
router.delete('/publications/:id', publicationController.deletePublication);

// Conferences Management
router.post('/conferences', uploadCover.single('cover'), conferenceController.createConference);
router.put('/conferences/:id', uploadCover.single('cover'), conferenceController.updateConference);
router.delete('/conferences/:id', conferenceController.deleteConference);
router.get('/conferences/:id/submissions', conferenceController.getAdminConferenceSubmissions);
router.patch('/submissions/:id/status', conferenceController.adminUpdateSubmissionStatus);
router.get('/conferences/:id/registrations', conferenceController.getAdminConferenceRegistrations);
router.get('/conferences/:id/registrations/export', conferenceController.exportConferenceRegistrationsCSV);

// Academy Management
router.post('/academy/programs', uploadCover.single('cover'), academyController.createProgram);
router.put('/academy/programs/:id', uploadCover.single('cover'), academyController.updateProgram);
router.delete('/academy/programs/:id', academyController.deleteProgram);
router.get('/academy/registrations', academyController.getAdminAcademyRegistrations);
router.get('/academy/registrations/export', academyController.exportAcademyRegistrationsCSV);
router.patch('/academy/registrations/:id/status', academyController.adminUpdateRegistrationStatus);

// Innovation Hub Management
router.post('/innovation/programs', innovationController.createProgram);
router.put('/innovation/programs/:id', innovationController.updateProgram);
router.delete('/innovation/programs/:id', innovationController.deleteProgram);
router.get('/innovation/applications', innovationController.getAdminInnovationApplications);
router.patch('/innovation/applications/:id/status', innovationController.adminUpdateInnovationApplicationStatus);
router.get('/innovation/applications/export', innovationController.exportInnovationApplicationsCSV);
router.post('/innovation/mentors', innovationController.createMentor);
router.put('/innovation/mentors/:id', innovationController.updateMentor);
router.delete('/innovation/mentors/:id', innovationController.deleteMentor);

// Certificates Management
router.post('/certificates', uploadCertificate.single('pdf'), certificateController.adminIssueCertificate);
router.get('/certificates', certificateController.adminGetCertificates);

// News & Media Management
router.post('/news', newsController.createNews);
router.put('/news/:id', newsController.updateNews);
router.delete('/news/:id', newsController.deleteNews);
router.post('/events', newsController.createEvent);
router.put('/events/:id', newsController.updateEvent);
router.delete('/events/:id', newsController.deleteEvent);
router.post('/gallery', uploadGallery.single('media'), newsController.createGallery);
router.delete('/gallery/:id', newsController.deleteGallery);

// Consultancy Requests Management
router.get('/consultancy/requests', consultancyController.getAdminRequests);
router.patch('/consultancy/requests/:id/status', consultancyController.updateRequestStatus);
router.get('/consultancy/requests/export', consultancyController.exportConsultancyRequestsCSV);

// Settings Management
router.put('/settings/public-school-active', authorise(...ADMIN_ROLES), settingsController.setPublicSchoolActive);

// Analytics Dashboard (Phase 5)
router.get('/analytics', adminController.getAdminAnalytics);

// Payments Management (Phase 5)
router.get('/payments', paymentController.adminGetPayments);
router.post('/payments/:id/refund', authorise(...ADMIN_ROLES), paymentController.adminRefundPayment);
router.get('/payments/export', paymentController.exportPaymentsCSV);

// Partners Management (Phase 5)
router.get('/partners', partnerController.adminGetPartners);
router.post('/partners', uploadPhoto.single('logo'), partnerController.adminCreatePartner);
router.patch('/partners/:id', uploadPhoto.single('logo'), partnerController.adminUpdatePartner);
router.delete('/partners/:id', authorise(...ADMIN_ROLES), partnerController.adminDeletePartner);

// Audit Logs (Phase 5)
router.get('/audit-logs', adminController.getAuditLogs);

module.exports = router;


