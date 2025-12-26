import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';
import swaggerUi from 'swagger-ui-express';

// Import config
import corsOptions from './config/corsOptions.js';
import swaggerSpec from './config/swagger.js';

// Import middleware
import credentials from './middleware/credentials.js';
import { logger } from './middleware/logEvents.js';
import errorHandler from './middleware/errorHandler.js';

// Import routes
import registerRouter from './routes/register.js';
import authRouter from './routes/auth.js';
import refreshRouter from './routes/refresh.js';
import logoutRouter from './routes/logout.js';
import usersRouter from './routes/api/users.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3500;
const API_VERSION = 'v1';

// Middleware
app.use(logger); // Custom logger
app.use(credentials); // Handle credentials before CORS
app.use(cors(corsOptions)); // CORS with options
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: false })); // Parse URL-encoded bodies
app.use(cookieParser()); // Parse cookies

// Serve static files
app.use('/static', express.static(path.join(__dirname, 'public')));

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Language Learning API Docs',
}));

// API Routes with versioning
app.use(`/api/${API_VERSION}/register`, registerRouter);
app.use(`/api/${API_VERSION}/auth`, authRouter);
app.use(`/api/${API_VERSION}/refresh`, refreshRouter);
app.use(`/api/${API_VERSION}/logout`, logoutRouter);
app.use(`/api/${API_VERSION}/users`, usersRouter);
// Root route
/**
 * @swagger
 * /:
 *   get:
 *     summary: API information
 *     description: Get API version and available endpoints
 *     tags: [Info]
 *     responses:
 *       200:
 *         description: API information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 documentation:
 *                   type: string
 *                 endpoints:
 *                   type: object
 */

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Personalized Language Learning API v1.0',
    documentation: '/api-docs',
    endpoints: {
      register: 'POST /api/v1/register',
      login: 'POST /api/v1/auth/login',
      googleAuth: 'POST /api/v1/auth/google',
      refresh: 'GET /api/v1/refresh',
      logout: 'POST /api/v1/logout',
      profile: 'GET /api/v1/users/me',
      updateProfile: 'PATCH /api/v1/users/me',
      getUser: 'GET /api/v1/users/:id',
      updateEnergy: 'PATCH /api/v1/users/me/energy',
      updateCoins: 'PATCH /api/v1/users/me/coins',
    },
  });
});

// 404 handler
app.all('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Error handler (must be last)
app.use(errorHandler);

// Start server
app.listen(PORT, async () => {
  console.log(`✓ Server running on port ${PORT}`);
  console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`✓ API Base URL: http://localhost:${PORT}/api/v1`);
});
