import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If a token was returned in the query parameter (e.g. redirected anywhere with ?token=...)
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlToken = params.get('token');
      if (urlToken) {
        localStorage.setItem('asgard_token', urlToken);
        // Clean the token from the browser address bar without triggering reload
        params.delete('token');
        const query = params.toString();
        const cleanUrl = window.location.pathname + (query ? `?${query}` : '') + window.location.hash;
        window.history.replaceState({}, document.title, cleanUrl);
      }
    }

    // On mount, check if a valid session/token exists server-side
    api.get('/auth/me')
      .then((res) => setUser(res.data?.data || null))
      .catch(() => {
        // 401 means no active session or invalid token — clean up stale token
        if (typeof window !== 'undefined') {
          localStorage.removeItem('asgard_token');
        }
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = (userData, token) => {
    if (token && typeof window !== 'undefined') {
      localStorage.setItem('asgard_token', token);
    }
    setUser(userData);
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Ignored
    }
    if (typeof window !== 'undefined') {
      localStorage.removeItem('asgard_token');
    }
    setUser(null);
  };

  const handleOAuthCallback = useCallback(async (token) => {
    if (token && typeof window !== 'undefined') {
      localStorage.setItem('asgard_token', token);
    }
    const res = await api.get('/auth/me');
    const userData = res.data?.data || null;
    setUser(userData);
    return userData;
  }, []);

  const refreshUser = async () => {
    try {
      const res = await api.get('/auth/me');
      setUser(res.data?.data || null);
      return res.data?.data;
    } catch {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('asgard_token');
      }
      setUser(null);
      return null;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        refreshUser,
        setUser,
        handleOAuthCallback,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
