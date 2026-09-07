import axios from 'axios';
import { REELS_API_BASE_URL } from '../config/api.config.js';
import { getAccessToken } from './tokens.js';

/**
 * Axios instance for Reels Service
 * - For authenticated users: sends Bearer token
 * - For guest users: no Authorization header (gets random reels)
 */
const reelsClient = axios.create({
  baseURL: REELS_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'X-Client-Type': 'mobile',
  },
});

// Request interceptor to conditionally add access token
reelsClient.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    // Only add Authorization header if user is authenticated
    // Guest users should NOT have Authorization header to get random reels
    if (token && !config.skipAuth) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
reelsClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Normalize errors so UI can show a stable message without noisy console stack traces.
    const isNetworkError = !error.response;
    if (isNetworkError) {
      error.userMessage = 'Network Error';
      error.isServerUnreachable = true;
    } else if (error.response?.status >= 500) {
      error.userMessage = 'Server Error';
      error.isServerUnreachable = true;
    } else if (error.response?.data?.detail) {
      // Surface FastAPI's HTTPException detail (e.g. the comprehensibility
      // filter's "Populate your vocabulary and try again") instead of
      // axios's generic "Request failed with status code 404".
      error.userMessage = error.response.data.detail;
    }
    return Promise.reject(error);
  }
);

export default reelsClient;
