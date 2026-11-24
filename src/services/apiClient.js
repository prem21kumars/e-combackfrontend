import axios from 'axios';

/**
 * OO Toys Enterprise API Client
 * Connected to Spring Boot 3.4 REST API (http://localhost:8080/api/v1)
 */

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: true,
});

// Interceptor for attaching real JWT bearer tokens
apiClient.interceptors.request.use(
  (config) => {
    try {
      const authData = localStorage.getItem('OO Toys_auth');
      if (authData) {
        const parsed = JSON.parse(authData);
        const token = parsed.accessToken || parsed.token;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    } catch (e) {
      console.warn('Could not parse auth data from localStorage', e);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const serverMessage = error.response?.data?.message || error.message;

    if (status === 401) {
      console.warn('Unauthorized API call or token expired:', serverMessage);
      const url = error.config?.url || '';
      if (!url.includes('/auth/login') && !url.includes('/auth/google') && !url.includes('/auth/register')) {
        try {
          localStorage.removeItem('OO Toys_auth');
        } catch (e) {
          // ignore
        }
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
