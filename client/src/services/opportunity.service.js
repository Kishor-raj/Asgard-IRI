import api from './api';

export const getOpportunities = (params) =>
  api.get('/opportunities', { params }).then((r) => r.data);

export const getOpportunityBySlug = (slug) =>
  api.get(`/opportunities/${slug}`).then((r) => r.data);

export const applyToOpportunity = (id, formData) =>
  api.post(`/opportunities/${id}/apply`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then((r) => r.data);

export const getMyApplications = () =>
  api.get('/my/applications').then((r) => r.data);

export const adminGetOpportunities = (params) =>
  api.get('/admin/opportunities', { params }).then((r) => r.data);

export const adminCreateOpportunity = (data) =>
  api.post('/admin/opportunities', data).then((r) => r.data);

export const adminUpdateOpportunity = (id, data) =>
  api.put(`/admin/opportunities/${id}`, data).then((r) => r.data);

export const adminDeleteOpportunity = (id) =>
  api.delete(`/admin/opportunities/${id}`).then((r) => r.data);

export const adminGetApplications = (params) =>
  api.get('/admin/applications', { params }).then((r) => r.data);

export const adminUpdateApplicationStatus = (id, status) =>
  api.patch(`/admin/applications/${id}/status`, { status }).then((r) => r.data);
