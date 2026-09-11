import React, { createContext, useContext, useState, useCallback } from 'react';
import * as api from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('token') || null;
  });

  const [loading, setLoading] = useState(false);

  const persistAuth = (userData, tokenData) => {
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', tokenData);
    setToken(tokenData);
    setUser(userData);
  };

  const clearAuth = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const signup = useCallback(async (formData) => {
    setLoading(true);
    try {
      const { data } = await api.signup(formData);
      persistAuth(data.user, data.token);
      return { success: true, message: data.message };
    } catch (err) {
      return { 
        success: false, 
        message: err.response?.data?.message || 'Signup failed.' 
      };
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (formData) => {
    setLoading(true);
    try {
      const { data } = await api.login(formData);
      persistAuth(data.user, data.token);
      return { success: true, message: data.message };
    } catch (err) {
      return { 
        success: false, 
        message: err.response?.data?.message || 'Login failed.' 
      };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    clearAuth();
  }, []);

  const isAuthenticated = !!token && !!user;

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        token, 
        loading, 
        isAuthenticated, 
        signup, 
        login, 
        logout 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};