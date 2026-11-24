import apiClient from './apiClient';
import { getStorageItem, setStorageItem, removeStorageItem } from '../utils/storage';

const AUTH_STORAGE_KEY = 'OO Toys_auth';

// Real credentials seeded in Spring Boot MySQL backend
export const DEMO_USERS = {
  customer: {
    id: 2,
    name: 'Priya Sharma',
    email: 'priya@example.com',
    password: 'Customer@123456',
    role: 'customer',
    phone: '+91 98765 43210',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    addresses: [
      {
        id: 'addr_1',
        title: 'Home',
        street: 'Flat 402, Lotus Residency, MG Road',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560001',
        isDefault: true,
      },
    ],
  },
  admin: {
    id: 1,
    name: 'OO Toys Admin',
    email: 'admin@ootoys.com',
    password: 'Admin@123456',
    role: 'admin',
    phone: '+91 99999 88888',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
    addresses: [],
  },
};

const extractErrorMessage = (err, fallback = 'Operation failed') => {
  if (err.response?.data?.fieldErrors && err.response.data.fieldErrors.length > 0) {
    return err.response.data.fieldErrors.map((f) => f.message).join('. ');
  }
  if (err.response?.data?.message) {
    return err.response.data.message;
  }
  if (typeof err.response?.data === 'string' && err.response.data.trim()) {
    return err.response.data;
  }
  return err.message || fallback;
};

const mapBackendUser = (backendUser, token, refreshToken) => {
  const roles = backendUser.roles || [];
  const isAdmin = roles.some((r) => r === 'ROLE_ADMIN' || r === 'ROLE_SUPER_ADMIN' || r === 'admin');

  return {
    id: backendUser.id,
    name: `${backendUser.firstName || ''} ${backendUser.lastName || ''}`.trim() || backendUser.email?.split('@')[0] || 'User',
    firstName: backendUser.firstName,
    lastName: backendUser.lastName,
    email: backendUser.email,
    role: isAdmin ? 'admin' : 'customer',
    roles: roles,
    phone: backendUser.phoneNumber || '',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    addresses: [
      {
        id: 'addr_default',
        title: 'Home',
        street: 'Flat 402, Lotus Residency, MG Road',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560001',
        isDefault: true,
      },
    ],
    token,
    refreshToken,
  };
};

export const authService = {
  /**
   * Get currently logged-in user session
   */
  getCurrentUser() {
    return getStorageItem(AUTH_STORAGE_KEY, null);
  },

  /**
   * Authenticate against Spring Boot API: POST /api/v1/auth/login
   */
  async login(email, password, role = 'customer') {
    try {
      const response = await apiClient.post('/auth/login', {
        email: email.trim(),
        password: password,
      });

      const authData = response.data.data;
      const user = mapBackendUser(authData.user, authData.accessToken, authData.refreshToken);

      const authPayload = {
        user,
        token: authData.accessToken,
        accessToken: authData.accessToken,
        refreshToken: authData.refreshToken,
        loginTime: new Date().toISOString(),
      };

      setStorageItem(AUTH_STORAGE_KEY, authPayload);
      return user;
    } catch (err) {
      removeStorageItem(AUTH_STORAGE_KEY);
      throw new Error(extractErrorMessage(err, 'Login failed'));
    }
  },

  /**
   * Google OAuth2 Login: POST /api/v1/auth/google
   */
  async loginWithGoogle(idToken = null, userEmail = null) {
    try {
      // In development or when using custom email input, pass mock_google_ or real ID token
      const token = idToken || (userEmail ? `mock_google_${userEmail.replace(/@.*/, '')}` : `mock_google_google.user_${Date.now()}`);
      
      const response = await apiClient.post('/auth/google', {
        idToken: token,
      });

      const authData = response.data.data;
      const user = mapBackendUser(authData.user, authData.accessToken, authData.refreshToken);

      const authPayload = {
        user,
        token: authData.accessToken,
        accessToken: authData.accessToken,
        refreshToken: authData.refreshToken,
        loginTime: new Date().toISOString(),
      };

      setStorageItem(AUTH_STORAGE_KEY, authPayload);
      return user;
    } catch (err) {
      throw new Error(extractErrorMessage(err, 'Google OAuth sign-in failed'));
    }
  },

  /**
   * Register against Spring Boot API: POST /api/v1/auth/register
   */
  async register(userData) {
    try {
      const names = (userData.name || '').trim().split(' ');
      const firstName = names[0] || 'Parent';
      const lastName = names.length > 1 ? names.slice(1).join(' ') : 'Member';

      const response = await apiClient.post('/auth/register', {
        email: userData.email.trim(),
        password: userData.password,
        firstName,
        lastName,
        phoneNumber: userData.phone || undefined,
      });

      const authData = response.data.data;
      const user = mapBackendUser(authData.user, authData.accessToken, authData.refreshToken);

      if (userData.street) {
        user.addresses = [
          {
            id: `addr_${Date.now()}`,
            title: 'Home',
            street: userData.street,
            city: userData.city || '',
            state: userData.state || '',
            pincode: userData.pincode || '',
            isDefault: true,
          },
        ];
      }

      const authPayload = {
        user,
        token: authData.accessToken,
        accessToken: authData.accessToken,
        refreshToken: authData.refreshToken,
        loginTime: new Date().toISOString(),
      };

      setStorageItem(AUTH_STORAGE_KEY, authPayload);
      return user;
    } catch (err) {
      throw new Error(extractErrorMessage(err, 'Registration failed'));
    }
  },

  /**
   * Update customer profile: PUT /api/v1/customers/me
   */
  async updateProfile(updatedData) {
    const current = this.getCurrentUser();
    if (!current) {
      throw new Error('No active user session');
    }

    try {
      const names = (updatedData.name || '').trim().split(' ');
      const firstName = names[0] || current.user.firstName;
      const lastName = names.length > 1 ? names.slice(1).join(' ') : current.user.lastName;

      await apiClient.put('/customers/me', {
        firstName,
        lastName,
        phoneNumber: updatedData.phone || current.user.phone,
      });

      const updatedUser = {
        ...current.user,
        ...updatedData,
        firstName,
        lastName,
      };

      const updatedPayload = {
        ...current,
        user: updatedUser,
      };

      setStorageItem(AUTH_STORAGE_KEY, updatedPayload);
      return updatedUser;
    } catch (err) {
      // Local fallback update if offline
      const updatedUser = { ...current.user, ...updatedData };
      setStorageItem(AUTH_STORAGE_KEY, { ...current, user: updatedUser });
      return updatedUser;
    }
  },

  /**
   * Logout from Spring Boot session: POST /api/v1/auth/logout
   */
  async logout() {
    try {
      const current = this.getCurrentUser();
      if (current?.refreshToken) {
        await apiClient.post('/auth/logout', { refreshToken: current.refreshToken });
      }
    } catch (e) {
      console.warn('Backend logout warning:', e);
    } finally {
      removeStorageItem(AUTH_STORAGE_KEY);
    }
    return true;
  },

  /**
   * Request password reset token: POST /api/v1/auth/forgot-password
   */
  async forgotPassword(email) {
    try {
      const response = await apiClient.post('/auth/forgot-password', { email });
      return {
        success: true,
        message: response.data?.message || 'Password recovery instructions sent.',
        token: response.data?.data,
      };
    } catch (err) {
      throw new Error(extractErrorMessage(err, 'Failed to process password recovery request'));
    }
  },

  /**
   * Reset password with token: POST /api/v1/auth/reset-password
   */
  async resetPassword(token, newPassword) {
    try {
      const response = await apiClient.post('/auth/reset-password', { token, newPassword });
      return {
        success: true,
        message: response.data?.message || 'Password reset successfully.',
      };
    } catch (err) {
      throw new Error(extractErrorMessage(err, 'Failed to reset password'));
    }
  },

  /**
   * Authenticated password change: POST /api/v1/auth/change-password
   */
  async changePassword(currentPassword, newPassword) {
    try {
      const response = await apiClient.post('/auth/change-password', { currentPassword, newPassword });
      return {
        success: true,
        message: response.data?.message || 'Password changed successfully.',
      };
    } catch (err) {
      throw new Error(extractErrorMessage(err, 'Failed to change password'));
    }
  },
};
