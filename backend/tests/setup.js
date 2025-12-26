// Set up test environment variables
process.env.ACCESS_TOKEN_SECRET = 'test-access-token-secret-key-for-testing-only';
process.env.REFRESH_TOKEN_SECRET = 'test-refresh-token-secret-key-for-testing-only';
process.env.ACCESS_TOKEN_EXPIRES_IN = '15m';
process.env.REFRESH_TOKEN_EXPIRES_IN = '30d';
process.env.NODE_ENV = 'test';

// Suppress console.error during tests to reduce noise
global.console = {
  ...console,
  error: () => {}, // Mock console.error to suppress error logs during tests
};
