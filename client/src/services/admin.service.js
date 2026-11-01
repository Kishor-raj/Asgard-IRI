import api from './api';

export const getAdminStats = () =>
  api.get('/admin/dashboard/stats').then((r) => r.data);

export const getAdminUsers = (params) =>
  api.get('/admin/users', { params }).then((r) => r.data);

export const getPendingUsers = () =>
  api.get('/admin/users/pending').then((r) => r.data);

export const approveUser = (id) =>
  api.patch(`/admin/users/${id}/approve`).then((r) => r.data);

export const rejectUser = (id) =>
  api.patch(`/admin/users/${id}/reject`).then((r) => r.data);

// Content CRUD
export const createResearchArea = (data) =>
  api.post('/admin/research/areas', data).then((r) => r.data);

export const createProject = (data) =>
  api.post('/admin/research/projects', data).then((r) => r.data);

export const updateProject = (id, data) =>
  api.put(`/admin/research/projects/${id}`, data).then((r) => r.data);

export const deleteProject = (id) =>
  api.delete(`/admin/research/projects/${id}`).then((r) => r.data);

export const createJournal = (data) =>
  api.post('/admin/journals', data).then((r) => r.data);

export const updateJournal = (id, data) =>
  api.put(`/admin/journals/${id}`, data).then((r) => r.data);

export const deleteJournal = (id) =>
  api.delete(`/admin/journals/${id}`).then((r) => r.data);

export const createPublication = (data) =>
  api.post('/admin/publications', data).then((r) => r.data);

export const updatePublication = (id, data) =>
  api.put(`/admin/publications/${id}`, data).then((r) => r.data);

export const deletePublication = (id) =>
  api.delete(`/admin/publications/${id}`).then((r) => r.data);

export const createConference = (data) =>
  api.post('/admin/conferences', data).then((r) => r.data);

export const updateConference = (id, data) =>
  api.put(`/admin/conferences/${id}`, data).then((r) => r.data);

export const deleteConference = (id) =>
  api.delete(`/admin/conferences/${id}`).then((r) => r.data);

export const createAcademyProgram = (data) =>
  api.post('/admin/academy/programs', data).then((r) => r.data);

export const updateAcademyProgram = (id, data) =>
  api.put(`/admin/academy/programs/${id}`, data).then((r) => r.data);

export const deleteAcademyProgram = (id) =>
  api.delete(`/admin/academy/programs/${id}`).then((r) => r.data);

export const createNews = (data) =>
  api.post('/admin/news', data).then((r) => r.data);

export const updateNews = (id, data) =>
  api.put(`/admin/news/${id}`, data).then((r) => r.data);

export const deleteNews = (id) =>
  api.delete(`/admin/news/${id}`).then((r) => r.data);

export const createEvent = (data) =>
  api.post('/admin/events', data).then((r) => r.data);

export const updateEvent = (id, data) =>
  api.put(`/admin/events/${id}`, data).then((r) => r.data);

export const deleteEvent = (id) =>
  api.delete(`/admin/events/${id}`).then((r) => r.data);

export const uploadGallery = (formData) =>
  api.post('/admin/gallery', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then((r) => r.data);

export const deleteGallery = (id) =>
  api.delete(`/admin/gallery/${id}`).then((r) => r.data);

export const getSiteTagline = () =>
  api.get('/settings/site-tagline').then((r) => r.data);

export const updateSiteTagline = (tagline) =>
  api.put('/settings/site-tagline', { tagline }).then((r) => r.data);

// Conferences Phase 2 Admin
export const getAdminConferenceSubmissions = (conferenceId) =>
  api.get(`/admin/conferences/${conferenceId}/submissions`).then((r) => r.data);

export const adminUpdateSubmissionStatus = (submissionId, data) =>
  api.patch(`/admin/submissions/${submissionId}/status`, data).then((r) => r.data);

export const getAdminConferenceRegistrations = (conferenceId) =>
  api.get(`/admin/conferences/${conferenceId}/registrations`).then((r) => r.data);

export const exportConferenceRegistrationsCSV = async (conferenceId) => {
  const response = await api.get(`/admin/conferences/${conferenceId}/registrations/export`, {
    responseType: 'blob',
  });
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `conference-${conferenceId}-registrations.csv`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

// Academy Phase 2 Admin
export const getAdminAcademyRegistrations = (params) =>
  api.get('/admin/academy/registrations', { params }).then((r) => r.data);

export const adminUpdateAcademyRegistrationStatus = (id, data) =>
  api.patch(`/admin/academy/registrations/${id}/status`, data).then((r) => r.data);

export const exportAcademyRegistrationsCSV = async (params) => {
  const response = await api.get('/admin/academy/registrations/export', {
    params,
    responseType: 'blob',
  });
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'academy-registrations.csv');
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

// Certificates Phase 2 Admin
export const adminIssueCertificate = (formData) =>
  api.post('/admin/certificates', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then((r) => r.data);

export const adminGetCertificates = () =>
  api.get('/admin/certificates').then((r) => r.data);

// Phase 3 Reports Summary
export const getReportsSummary = () =>
  api.get('/admin/reports/summary').then((r) => r.data);

// Phase 3 Research Outputs Admin
export const adminCreateResearchOutput = (data) =>
  api.post('/admin/research/outputs', data).then((r) => r.data);

export const adminUpdateResearchOutput = (id, data) =>
  api.put(`/admin/research/outputs/${id}`, data).then((r) => r.data);

export const adminDeleteResearchOutput = (id) =>
  api.delete(`/admin/research/outputs/${id}`).then((r) => r.data);

// Phase 3 Innovation Hub Admin
export const adminCreateInnovationProgram = (data) =>
  api.post('/admin/innovation/programs', data).then((r) => r.data);

export const adminUpdateInnovationProgram = (id, data) =>
  api.put(`/admin/innovation/programs/${id}`, data).then((r) => r.data);

export const adminDeleteInnovationProgram = (id) =>
  api.delete(`/admin/innovation/programs/${id}`).then((r) => r.data);

export const getAdminInnovationApplications = (params) =>
  api.get('/admin/innovation/applications', { params }).then((r) => r.data);

export const adminUpdateInnovationApplicationStatus = (id, data) =>
  api.patch(`/admin/innovation/applications/${id}/status`, data).then((r) => r.data);

export const exportInnovationApplicationsCSV = async (params) => {
  const response = await api.get('/admin/innovation/applications/export', {
    params,
    responseType: 'blob',
  });
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'innovation-applications.csv');
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

export const adminCreateMentor = (data) =>
  api.post('/admin/innovation/mentors', data).then((r) => r.data);

export const adminUpdateMentor = (id, data) =>
  api.put(`/admin/innovation/mentors/${id}`, data).then((r) => r.data);

export const adminDeleteMentor = (id) =>
  api.delete(`/admin/innovation/mentors/${id}`).then((r) => r.data);


export const exportApplicationsCSV = async (params) => {
  const response = await api.get('/admin/applications/export', {
    params,
    responseType: 'blob',
  });
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'opportunity-applications.csv');
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

// Phase 4: Consultancy Admin
export const getAdminConsultancyRequests = (params) =>
  api.get('/admin/consultancy/requests', { params }).then((r) => r.data);

export const adminUpdateConsultancyRequestStatus = (id, data) =>
  api.patch(`/admin/consultancy/requests/${id}/status`, data).then((r) => r.data);

export const exportConsultancyRequestsCSV = async (params) => {
  const response = await api.get('/admin/consultancy/requests/export', {
    params,
    responseType: 'blob',
  });
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'consultancy-requests.csv');
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

// Phase 4: Public School Visibility Toggle
export const setPublicSchoolActive = (active) =>
  api.put('/admin/settings/public-school-active', { active }).then((r) => r.data);

// Phase 5: Analytics
export const getAdminAnalytics = () =>
  api.get('/admin/analytics').then((r) => r.data);

// Phase 5: Payments Admin
export const getAdminPayments = (params) =>
  api.get('/admin/payments', { params }).then((r) => r.data);

export const adminRefundPayment = (id, reason) =>
  api.post(`/admin/payments/${id}/refund`, { reason }).then((r) => r.data);

export const exportPaymentsCSV = async () => {
  const response = await api.get('/admin/payments/export', { responseType: 'blob' });
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'asgard-payments.csv');
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

// Phase 5: Partners Admin
export const getAdminPartners = () =>
  api.get('/admin/partners').then((r) => r.data);

export const createAdminPartner = (formData) =>
  api.post('/admin/partners', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then((r) => r.data);

export const updateAdminPartner = (id, formData) =>
  api.patch(`/admin/partners/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then((r) => r.data);

export const deleteAdminPartner = (id) =>
  api.delete(`/admin/partners/${id}`).then((r) => r.data);






