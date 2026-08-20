import axios from 'axios';

// Resolve base API URL from environment variable or fallback to local proxy '/api'
const envApiUrl = import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_BASE_URL;
const resolvedBaseURL = envApiUrl 
  ? (envApiUrl.startsWith('http') && !envApiUrl.endsWith('/api') && !envApiUrl.includes('/api') ? `${envApiUrl.replace(/\/$/, '')}/api` : envApiUrl)
  : '/api';

// Centralized Axios instance connecting through API proxy or hosted backend
const API = axios.create({
  baseURL: resolvedBaseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Callback listeners for toast notifications and unauthorized redirects
let toastCallback = null;
let logoutCallback = null;

export const setApiCallbacks = (onToast, onLogout) => {
  toastCallback = onToast;
  logoutCallback = onLogout;
};

// Request Interceptor: Automatically attach Bearer token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('powerhouse_jwt_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle errors and status codes
API.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const status = error.response ? error.response.status : null;
    const message = error.response?.data?.message || error.message || 'An unexpected error occurred.';
    const isMutation = error.config && ['post', 'put', 'delete', 'patch'].includes((error.config.method || '').toLowerCase());

    if (status === 401) {
      if (isMutation && toastCallback) {
        toastCallback('Session expired. Please log in again.', 'error');
      }
      localStorage.removeItem('powerhouse_jwt_token');
      localStorage.removeItem('powerhouse_user');
      if (logoutCallback) logoutCallback();
    } else if (isMutation && toastCallback) {
      if (status === 403) {
        toastCallback('Access Denied: You do not have permission for this action.', 'error');
      } else if (status === 400) {
        toastCallback(`Bad Request: ${message}`, 'error');
      } else if (status === 404) {
        toastCallback(`Not Found: ${message}`, 'error');
      } else if (status && status >= 500) {
        toastCallback(`Server Error (${status}): ${message}`, 'error');
      } else {
        toastCallback(`Error: ${message}`, 'error');
      }
    }

    return Promise.reject(error);
  }
);

export default API;
