import api from './api';

export const login = (credentials) =>
  api.post('/auth/login', credentials).then((r) => r.data);

export const register = (userData) =>
  api.post('/auth/register', userData).then((r) => r.data);

export const logout = () =>
  api.post('/auth/logout').then((r) => r.data);

export const getMe = () =>
  api.get('/auth/me').then((r) => r.data);

export const updateMe = (data) =>
  api.put('/auth/me', data).then((r) => r.data);

export const forgotPassword = (email) =>
  api.post('/auth/forgot-password', { email }).then((r) => r.data);

export const resetPassword = (token, password) =>
  api.post('/auth/reset-password', { token, password }).then((r) => r.data);

