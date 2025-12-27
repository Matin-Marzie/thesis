import axios from 'axios';
import { API_BASE_URL } from '../config/api.config.js';
import { getAccessToken, getRefreshToken, setAccessToken, storeRefreshToken, clearTokens } from './tokens.js';

/**
 * Axios instance with default configuration
 * Includes automatic token injection and refresh logic
 */
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'X-Client-Type': 'mobile', // Identify as mobile client
  },
});

// Request interceptor to add access token to headers
apiClient.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 or 403 and we haven't retried yet
    if (
      (error.response?.status === 401 || error.response?.status === 403) &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        const refreshToken = await getRefreshToken();
        
        if (refreshToken) {
          // Send refresh token in request body (not cookies)
          const response = await axios.post(
            `${API_BASE_URL}/refresh`,
            { refreshToken },
            {
              headers: {
                'Content-Type': 'application/json',
              },
            }
          );

          if (response.data?.accessToken) {
            setAccessToken(response.data.accessToken);
            
            // Update refresh token if backend rotates it
            if (response.data?.refreshToken) {
              await storeRefreshToken(response.data.refreshToken);
            }
            
            originalRequest.headers.Authorization = `Bearer ${response.data.accessToken}`;
            return apiClient(originalRequest);
          }
        }
      } catch (refreshError) {
        // Refresh failed, clear tokens and redirect to login
        await clearTokens();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
