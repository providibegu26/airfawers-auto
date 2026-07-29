import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiPath } from '@/config/api';
import { adminFetch } from '@/config/adminApi';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      try {
        const token = localStorage.getItem('adminToken');
        const adminInfo =
          localStorage.getItem('adminInfo') ||
          localStorage.getItem('adminUser');

        if (token && adminInfo) {
          const adminData = JSON.parse(adminInfo);
          setAdmin(adminData);
          setIsAuthenticated(true);
        } else {
          setAdmin(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Erreur vérification auth:', error);
        setAdmin(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await fetch(apiPath('/admin/auth/login'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success && data.token) {
        const adminUser = data.user || {
          id: data.admin?.id,
          email: data.admin?.email,
          role: 'admin',
        };
        if (!adminUser.role) adminUser.role = 'admin';

        localStorage.setItem('adminToken', data.token);
        localStorage.setItem('adminUser', JSON.stringify(adminUser));
        if (data.admin) {
          localStorage.setItem('adminInfo', JSON.stringify(data.admin));
        }
        setAdmin(data.admin || adminUser);
        setIsAuthenticated(true);
        return { success: true };
      }
      return {
        success: false,
        error: data.error || data.message || 'Email ou mot de passe incorrect',
      };
    } catch (error) {
      console.error('Erreur login:', error);
      return { success: false, error: 'Erreur de connexion au serveur' };
    }
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminInfo');
    localStorage.removeItem('adminUser');
    setAdmin(null);
    setIsAuthenticated(false);
  };

  const verifyToken = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        return false;
      }

      const response = await adminFetch('/admin/auth/verify');
      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error('Erreur vérification token:', error);
      return false;
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      const response = await adminFetch('/admin/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erreur changement mot de passe:', error);
      return { success: false, error: 'Erreur de connexion' };
    }
  };

  const value = {
    admin,
    loading,
    isAuthenticated,
    login,
    logout,
    verifyToken,
    changePassword,
  };

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
};
