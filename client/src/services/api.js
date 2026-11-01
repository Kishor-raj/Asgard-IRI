import axios from 'axios';

export function resolveApiBaseUrl() {
  let url = (import.meta.env.VITE_API_BASE_URL || '').trim();

  // If empty, fall back to localhost in dev
  if (!url) {
    return 'http://localhost:5000/api/v1';
  }

  // Handle markdown links if pasted by mistake, e.g. [https://url](https://url)
  if (url.includes('](')) {
    const match = url.match(/\((https?:\/\/[^\)]+)\)/);
    if (match) url = match[1];
  } else if (url.startsWith('[') && url.endsWith(']')) {
    url = url.slice(1, -1);
  }

  // Strip trailing slashes
  url = url.replace(/\/+$/, '');

  // Ensure /api/v1 prefix
  if (!url.endsWith('/api/v1') && !url.includes('/api/')) {
    url += '/api/v1';
  }

  return url;
}

export const API_BASE_URL = resolveApiBaseUrl();

export function getErrorMessage(err, fallback = 'Something went wrong.') {
  if (!err) return fallback;
  if (typeof err === 'string') return err;
  const dataError = err.response?.data?.error;
  if (typeof dataError === 'string') return dataError;
  if (dataError && typeof dataError === 'object') {
    return dataError.message || dataError.code || JSON.stringify(dataError);
  }
  const dataMessage = err.response?.data?.message;
  if (typeof dataMessage === 'string') return dataMessage;
  if (typeof err.message === 'string') return err.message;
  return fallback;
}

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Required: sends the session cookie on every request
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    // Normalize any object error payloads (e.g. { code, message } from proxies/Cloudflare/Render)
    // so React never crashes with Invariant #31 when rendering or toasting err.response.data.error
    if (err.response?.data?.error && typeof err.response.data.error === 'object') {
      err.response.data.error =
        err.response.data.error.message ||
        err.response.data.error.code ||
        JSON.stringify(err.response.data.error);
    } else if (err.response?.data && typeof err.response.data === 'object' && !err.response.data.error && err.response.data.message) {
      err.response.data.error = err.response.data.message;
    }

    if (err.response?.status === 401) {
      const path = typeof window !== 'undefined' ? window.location.pathname : '';
      const isAuthCheck = err.config?.url?.includes('/auth/me');
      const isPublicRoute =
        path === '/' ||
        path === '/login' ||
        path === '/register' ||
        path === '/forgot-password' ||
        path === '/reset-password';

      if (!isAuthCheck && !isPublicRoute && typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export default api;
