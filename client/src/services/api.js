import axios from 'axios';

const getApiUrl = () => {
  let url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
  url = url.trim().replace(/\/+$/, '');
  if (!url.endsWith('/api')) {
    url += '/api';
  }
  return url;
};

const API_URL = getApiUrl();

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Attach Token to Requests & Normalize URL paths
api.interceptors.request.use(
  (config) => {
    // If request URL starts with '/api/' and baseURL already ends with '/api', remove duplicate '/api' prefix
    if (config.url && config.url.startsWith('/api/') && config.baseURL && config.baseURL.endsWith('/api')) {
      config.url = config.url.substring(4);
    }

    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('agentflow_token') || localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Global Error Interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('agentflow_token');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
