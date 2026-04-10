// API Configuration

// import { API_URL, API_TOKEN } from '@env';
const ip_addr = '172.24.45.147';

// local IP for testing on physical device
// Base url for authentication, user engagement, and other services
export const API_BASE_URL = `http://${ip_addr}:3500/api/v1`;

// Base url for reels service
export const REELS_API_BASE_URL = `http://${ip_addr}:3600/api/v1`;

export default {
  API_BASE_URL,
  REELS_API_BASE_URL,
};
