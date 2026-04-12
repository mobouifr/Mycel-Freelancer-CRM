// API client configuration
import axios, { type AxiosInstance, AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { type ApiError } from '../types/common.types';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor - add auth token when available
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // TODO: Add JWT token from localStorage when auth is implemented
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Redirect to login on 401 (session expired or not authenticated)
    if (error.response?.status === 401) {
      const isAuthPage = window.location.pathname.startsWith('/login') ||
        window.location.pathname.startsWith('/register') ||
        window.location.pathname.startsWith('/auth');
      if (!isAuthPage) {
        window.location.href = '/login';
      }
    }

    const apiError: ApiError = {
      message: error.message || 'An error occurred',
      statusCode: error.response?.status,
    };

    if (error.response?.data) {
      const data = error.response.data as any;
      if (data.message) {
        apiError.message = data.message;
      }
      if (data.errors) {
        apiError.errors = data.errors;
      }
    }

    return Promise.reject(apiError);
  }
);

export default apiClient;

