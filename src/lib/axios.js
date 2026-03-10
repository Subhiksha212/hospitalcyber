// src/lib/axios.js
import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://localhost:5000',
  timeout: 10000,
});

// Request interceptor to add token
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('Request:', config.method.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiration
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Response error:', error.response?.status, error.config?.url);
    
    if (error.response?.status === 401) {
      // Token expired or invalid
      console.log('Token expired or invalid, redirecting to login');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Only redirect if not already on login page
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/patient/login';
      }
    }
    return Promise.reject(error);
  }
);

export default instance;