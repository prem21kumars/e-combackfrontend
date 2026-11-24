import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService, DEMO_USERS } from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authData, setAuthData] = useState(() => authService.getCurrentUser());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check initial session
    const current = authService.getCurrentUser();
    setAuthData(current);
  }, []);

  const login = async (email, password, role = 'customer') => {
    setLoading(true);
    try {
      const user = await authService.login(email, password, role);
      setAuthData(authService.getCurrentUser());
      return { success: true, user };
    } catch (err) {
      setAuthData(null);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async (idToken = null, userEmail = null) => {
    setLoading(true);
    try {
      const user = await authService.loginWithGoogle(idToken, userEmail);
      setAuthData(authService.getCurrentUser());
      return { success: true, user };
    } catch (err) {
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const user = await authService.register(userData);
      setAuthData(authService.getCurrentUser());
      return { success: true, user };
    } catch (err) {
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updatedData) => {
    try {
      const updatedUser = await authService.updateProfile(updatedData);
      setAuthData(authService.getCurrentUser());
      return { success: true, user: updatedUser };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const logout = async () => {
    await authService.logout();
    setAuthData(null);
  };

  // Quick 1-click demo helpers
  const demoLoginCustomer = () => {
    return login(DEMO_USERS.customer.email, DEMO_USERS.customer.password, 'customer');
  };

  const demoLoginAdmin = () => {
    return login(DEMO_USERS.admin.email, DEMO_USERS.admin.password, 'admin');
  };

  const user = authData?.user || null;
  const isLoggedIn = !!user;
  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn,
        isAdmin,
        loading,
        login,
        loginWithGoogle,
        register,
        logout,
        updateProfile,
        demoLoginCustomer,
        demoLoginAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
