import axios from 'axios';

// Remote Railway backend endpoint fallback
export const DIRECT_RAILWAY_URL = 'https://gymmanagementsystem-production-72ab.up.railway.app';

// Resolve base API URL from environment variable or fallback to local proxy '/api'
const envApiUrl = import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_BASE_URL;

function determineBaseURL() {
  if (!envApiUrl) return '/api';
  const clean = envApiUrl.trim().replace(/\/$/, '');
  // If explicitly pointed to railway backend, use railway base without /api
  if (clean.includes('railway.app') && !clean.endsWith('/api')) {
    return clean;
  }
  return clean;
}

const resolvedBaseURL = determineBaseURL();

// Centralized Axios instance connecting through API proxy or hosted backend
const API = axios.create({
  baseURL: resolvedBaseURL,
  timeout: 15000,
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
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle HTML fallback from static hosting, errors, and auto-retry to Railway
API.interceptors.response.use(
  async (response) => {
    // If a static host returned index.html for an API route, retry directly against Railway backend
    if (
      typeof response.data === 'string' &&
      (response.data.includes('<!DOCTYPE html>') || response.data.includes('<html') || response.data.includes('<head>')) &&
      response.config &&
      !response.config._directFallback
    ) {
      try {
        const cleanPath = (response.config.url || '').replace(/^\/?api\/?/, '/');
        const fallbackUrl = `${DIRECT_RAILWAY_URL}${cleanPath.startsWith('/') ? '' : '/'}${cleanPath}`;
        const fallbackConfig = {
          ...response.config,
          url: fallbackUrl,
          baseURL: '',
          _directFallback: true,
        };
        return await axios(fallbackConfig);
      } catch (e) {
        return response;
      }
    }
    return response;
  },
  async (error) => {
    const config = error.config;
    const status = error.response ? error.response.status : null;
    const message = error.response?.data?.message || error.message || 'An unexpected error occurred.';
    const isMutation = config && ['post', 'put', 'delete', 'patch'].includes((config.method || '').toLowerCase());

    // If request failed on local /api (e.g. static hosting 404, 502, network error), retry directly on Railway
    if (
      config &&
      !config._directFallback &&
      (!status || status === 404 || status === 502 || status === 503 || error.code === 'ERR_NETWORK') &&
      (!config.baseURL || config.baseURL === '/api' || config.baseURL.startsWith('/'))
    ) {
      try {
        const cleanPath = (config.url || '').replace(/^\/?api\/?/, '/');
        const fallbackUrl = `${DIRECT_RAILWAY_URL}${cleanPath.startsWith('/') ? '' : '/'}${cleanPath}`;
        const fallbackConfig = {
          ...config,
          url: fallbackUrl,
          baseURL: '',
          _directFallback: true,
        };
        return await axios(fallbackConfig);
      } catch (fallbackError) {
        // Continue to error handling below
      }
    }

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
