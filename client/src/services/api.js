import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true, // Required: sends the session cookie on every request
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
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
