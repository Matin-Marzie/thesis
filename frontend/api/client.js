import axios from 'axios';
import { API_BASE_URL } from '../config/api.config.js';
import { getAccessToken, getRefreshToken, setAccessToken, storeRefreshToken } from './tokens.js';
import { apiEvents, API_EVENTS } from './apiEvents.js';

/**
 * Tracks whether the server was previously unreachable
 * Used to only emit SERVER_RECOVERED when transitioning from unreachable → reachable
 */
let wasServerUnreachable = false;

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

// Response interceptor to handle token refresh and server errors
apiClient.interceptors.response.use(
  (response) => {
    // Only emit recovery event if server was previously unreachable
    if (wasServerUnreachable) {
      wasServerUnreachable = false;
      apiEvents.emit(API_EVENTS.SERVER_RECOVERED);
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Check for network error (no response) or 5xx server error
    const isNetworkError = !error.response;
    const isServerError = error.response?.status >= 500 && error.response?.status < 600;

    if (isNetworkError || isServerError) {
      wasServerUnreachable = true;
      // Only emit SERVER_ERROR if not a silent background request
      // Silent requests (like periodic sync) shouldn't show the banner repeatedly - only the first one should trigger it
      if (!originalRequest?.silent) {
        apiEvents.emit(API_EVENTS.SERVER_ERROR, {
          isNetworkError,
          status: error.response?.status,
          message: isNetworkError 
            ? 'Unable to reach the server' 
            : `Server error: ${error.response?.status}`,
        });
      }
    }

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

          // Backend returns { data: { accessToken, refreshToken } } - it has extra {data} wrapper for consistency with other responses
          // TO DO: remove extra data wrapper in backend response for refresh endpoint data: { data: { accessToken, refreshToken } }
          if (response.data?.data?.accessToken) {
            setAccessToken(response.data.data.accessToken);
            
            // Update refresh token if backend rotates it
            if (response.data?.data?.refreshToken) {
              await storeRefreshToken(response.data.data.refreshToken);
            }
            
            originalRequest.headers.Authorization = `Bearer ${response.data.data.accessToken}`;
            return apiClient(originalRequest);
          }
        }
      } catch (refreshError) {
        // If refresh fails, clear tokens and reject the original request
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
