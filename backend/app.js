import express from 'express';
import cookieParser from 'cookie-parser';
import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';
import swaggerUi from 'swagger-ui-express';

// Import config
import swaggerSpec from './config/swagger.js';

// Import middleware
import { logger } from './middleware/logEvents.js';
import errorHandler from './middleware/errorHandler.js';

// Import routes
import registerRouter from './routes/register.js';
import authRouter from './routes/auth.js';
import refreshRouter from './routes/refresh.js';
import logoutRouter from './routes/logout.js';
import userRouter from './routes/api/user.js';
import languageRouter from './routes/api/language.js';
import dictionaryRouter from './routes/api/dictionary.js';
import reelRouter from './routes/api/reel.js';
import feedbackRouter from './routes/api/feedback.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const API_VERSION = 'v1';

// Middleware
app.use(logger); // Custom logger
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: false })); // Parse URL-encoded bodies
app.use(cookieParser()); // Parse cookies

// Serve static files
app.use('/static', express.static(path.join(__dirname, 'public')));

// Swagger documentation
app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Language Learning API Docs',
}));

// API Routes with versioning
app.use(`/api/${API_VERSION}/register`, registerRouter);
app.use(`/api/${API_VERSION}/auth`, authRouter);
app.use(`/api/${API_VERSION}/refresh`, refreshRouter);
app.use(`/api/${API_VERSION}/logout`, logoutRouter);
app.use(`/api/${API_VERSION}/user`, userRouter);
app.use(`/api/${API_VERSION}/language`, languageRouter);
app.use(`/api/${API_VERSION}/dictionary`, dictionaryRouter);
app.use(`/api/${API_VERSION}/reel`, reelRouter);
app.use(`/api/${API_VERSION}/feedback`, feedbackRouter);
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
 *                 message:
 *                   type: string
 *                 documentation:
 *                   type: string
 *                 endpoints:
 *                   type: object
 */

app.get('/', (req, res) => {
  res.json({
    message: 'Personalized Language Learning API v1.0',
    documentation: '/api-docs',
    endpoints: {
      register: 'POST /api/v1/register',
      login: 'POST /api/v1/auth/login',
      googleAuth: 'POST /api/v1/auth/google',
      refresh: 'POST /api/v1/refresh',
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
    message: 'Route not found',
  });
});

// Error handler (must be last)
app.use(errorHandler);

export default app;
