const allowedOrigins = [
  'http://localhost:8081',
  'http://localhost:19006', // Expo default
  'http://localhost:3000',
  'exp://localhost:8081',
  'http://10.169.21.147:8081', // Your local network IP
  'exp://10.169.21.147:8081',
  // Allow all origins for development (React Native doesn't send origin header properly)
  null, // For React Native clients
  undefined,
];

export default allowedOrigins;
