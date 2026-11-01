import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // On mount, check if a valid session exists server-side
    api.get('/auth/me')
      .then((res) => setUser(res.data?.data || null))
      .catch(() => setUser(null)) // 401 means no active session — that's expected
      .finally(() => setLoading(false));
  }, []);

  const login = (userData) => {
    // Session cookie is already set by the server response — update UI state
    setUser(userData);
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Ignored
    }
    // Server destroys session; clear UI state
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const res = await api.get('/auth/me');
      setUser(res.data?.data || null);
      return res.data?.data;
    } catch {
      setUser(null);
      return null;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
