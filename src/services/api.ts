import axios, { AxiosInstance, AxiosError, AxiosRequestConfig } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 second timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as AxiosRequestConfig & { _retry?: boolean; _retryCount?: number };
    
    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      return Promise.reject(error);
    }

    // Retry logic for network errors or 5xx errors (max 3 attempts)
    const shouldRetry = (
      (!error.response || (error.response.status >= 500 && error.response.status < 600) || error.code === 'ECONNABORTED') &&
      config &&
      !config._retry
    );

    if (shouldRetry) {
      config._retryCount = config._retryCount || 0;
      
      if (config._retryCount < 2) {
        config._retryCount += 1;
        config._retry = true;
        
        // Exponential backoff: 1s, 2s
        const delay = Math.pow(2, config._retryCount) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        
        console.log(`Retrying request (attempt ${config._retryCount + 1}/3)...`);
        return api(config);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
