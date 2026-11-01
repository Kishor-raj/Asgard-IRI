import api from './api';

export const getAreas = () =>
  api.get('/research/areas').then((r) => r.data);

export const getProjects = (params) =>
  api.get('/research/projects', { params }).then((r) => r.data);

export const getProjectBySlug = (slug) =>
  api.get(`/research/projects/${slug}`).then((r) => r.data);

export const getResearchers = (params) =>
  api.get('/researchers', { params }).then((r) => r.data);

export const getResearcherById = (id) =>
  api.get(`/researchers/${id}`).then((r) => r.data);

export const updateMyProfile = (data) =>
  api.put('/researchers/me', data).then((r) => r.data);

export const addMyPublication = (data) =>
  api.post('/researchers/me/publications', data).then((r) => r.data);

export const deleteMyPublication = (pubId) =>
  api.delete(`/researchers/me/publications/${pubId}`).then((r) => r.data);

export const sendCollaborationRequest = (researcherId, data) =>
  api.post(`/researchers/${researcherId}/collaboration-request`, data).then((r) => r.data);

// Phase 3 Research Outputs
export const getResearchOutputs = (params) =>
  api.get('/research/outputs', { params }).then((r) => r.data);

export const getResearchOutputBySlug = (slug) =>
  api.get(`/research/outputs/${slug}`).then((r) => r.data);

export const linkOutputToProfile = (outputId) =>
  api.post(`/researchers/me/link-output/${outputId}`).then((r) => r.data);

export const unlinkOutputFromProfile = (outputId) =>
  api.delete(`/researchers/me/link-output/${outputId}`).then((r) => r.data);

export const getMyLinkedOutputs = () =>
  api.get('/researchers/me/linked-outputs').then((r) => r.data);

