import api from './api';

// Home
export const getHomeSummary = () =>
  api.get('/home/summary').then((r) => r.data);

// Journals
export const getJournals = () =>
  api.get('/journals').then((r) => r.data);

// Publications
export const getPublications = (params) =>
  api.get('/publications', { params }).then((r) => r.data);

export const getPublicationBySlug = (slug) =>
  api.get(`/publications/${slug}`).then((r) => r.data);

// Conferences
export const getConferences = (params) =>
  api.get('/conferences', { params }).then((r) => r.data);

export const getConferenceBySlug = (slug) =>
  api.get(`/conferences/${slug}`).then((r) => r.data);

// Academy
export const getAcademyPrograms = (params) =>
  api.get('/academy/programs', { params }).then((r) => r.data);

export const getAcademyProgramBySlug = (slug) =>
  api.get(`/academy/programs/${slug}`).then((r) => r.data);

// News & Events
export const getNews = (params) =>
  api.get('/news', { params }).then((r) => r.data);

export const getNewsBySlug = (slug) =>
  api.get(`/news/${slug}`).then((r) => r.data);

export const getEvents = () =>
  api.get('/events').then((r) => r.data);

export const getGallery = () =>
  api.get('/gallery').then((r) => r.data);

// Contact & Consultancy
export const submitContact = (data) =>
  api.post('/contact', data).then((r) => r.data);

export const submitConsultancyRequest = (data) =>
  api.post('/consultancy/request', data).then((r) => r.data);

// Conferences Phase 2
export const submitConferencePaper = (id, formData) =>
  api.post(`/conferences/${id}/submit`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then((r) => r.data);

export const registerConference = (id, data) =>
  api.post(`/conferences/${id}/register`, data).then((r) => r.data);

export const getMyConferenceSubmissions = () =>
  api.get('/my/conference-submissions').then((r) => r.data);

export const getMyConferenceRegistrations = () =>
  api.get('/my/conference-registrations').then((r) => r.data);

// Academy Phase 2
export const registerAcademyProgram = (id, data) =>
  api.post(`/academy/programs/${id}/register`, data).then((r) => r.data);

export const getMyAcademyRegistrations = () =>
  api.get('/my/academy-registrations').then((r) => r.data);

// Certificates Phase 2
export const getMyCertificates = () =>
  api.get('/my/certificates').then((r) => r.data);

export const verifyCertificate = (uid) =>
  api.get(`/certificates/verify/${uid}`).then((r) => r.data);

// Innovation Hub Phase 3
export const getInnovationPrograms = (params) =>
  api.get('/innovation/programs', { params }).then((r) => r.data);

export const getInnovationProgramBySlug = (slug) =>
  api.get(`/innovation/programs/${slug}`).then((r) => r.data);

export const applyToInnovationProgram = (id, formData) =>
  api.post(`/innovation/programs/${id}/apply`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then((r) => r.data);

export const getInnovationMentors = () =>
  api.get('/innovation/mentors').then((r) => r.data);

export const getMyInnovationApplications = () =>
  api.get('/my/innovation-applications').then((r) => r.data);

// Search
export const searchContent = (params) =>
  api.get('/search', { params }).then((r) => r.data);

// Public School Status
export const getPublicSchoolActive = () =>
  api.get('/settings/public-school-active').then((r) => r.data);

// Phase 5: Partners
export const getPublicPartners = (type) =>
  api.get('/partners', { params: { type } }).then((r) => r.data);

export const getPartnerPortalData = () =>
  api.get('/partners/portal').then((r) => r.data);





