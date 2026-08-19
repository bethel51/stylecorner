import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'accent') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const fetchUser = async () => {
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const userData = await api.getMe();
      setUser(userData);
      localStorage.setItem('mockUser', JSON.stringify(userData));
    } catch (err) {
      console.warn('Auth token invalid or expired:', err.message);
      logout(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [token]);

  const login = async (email, password, role) => {
    const data = await api.login({ email, password, role });
    localStorage.setItem('token', data.token);
    localStorage.setItem('mockUser', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    showToast(`Welcome back, ${data.user.firstname || 'Stylist'}!`, 'success');
    return data.user;
  };

  const logout = (silent = false) => {
    localStorage.removeItem('token');
    localStorage.removeItem('mockUser');
    setToken(null);
    setUser(null);
    if (!silent) {
      showToast('Signed out successfully', 'accent');
    }
  };

  const register = async (userData) => {
    return await api.register(userData);
  };

  const verifyOtp = async (email, code) => {
    const data = await api.verifyOtp(email, code);
    localStorage.setItem('token', data.token);
    localStorage.setItem('mockUser', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    showToast('Account verified successfully!', 'success');
    return data.user;
  };

  const updateProfile = async (profileData) => {
    const updated = await api.updateProfile(profileData);
    setUser(updated);
    localStorage.setItem('mockUser', JSON.stringify(updated));
    showToast('Profile updated!', 'success');
    return updated;
  };

  const deleteAccount = async () => {
    // Grab the token BEFORE we clear state so the API call is authenticated
    const currentToken = localStorage.getItem('token');
    const res = await fetch('/api/users/account', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(currentToken ? { Authorization: `Bearer ${currentToken}` } : {}),
      },
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data?.error || 'Failed to delete account');
    }
    // Only clear state after confirmed server deletion
    localStorage.removeItem('token');
    localStorage.removeItem('mockUser');
    setToken(null);
    setUser(null);
    showToast('Your account has been permanently deleted.', 'accent');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
        register,
        verifyOtp,
        updateProfile,
        deleteAccount,
        showToast,
        isAuthenticated: !!user,
        role: user?.role || 'customer',
      }}
    >
      {children}
      {toast && (
        <div className="app-toast">
          <i
            className={`fas ${
              toast.type === 'success'
                ? 'fa-check-circle'
                : toast.type === 'error'
                ? 'fa-exclamation-triangle'
                : 'fa-info-circle'
            }`}
            style={{
              color:
                toast.type === 'success'
                  ? '#10b981'
                  : toast.type === 'error'
                  ? '#ef4444'
                  : '#d4af37',
              fontSize: '1.1rem',
            }}
          />
          <span>{toast.message}</span>
        </div>
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
