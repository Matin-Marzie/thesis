import express from 'express';
import feedbackController from '../../controllers/feedbackController.js';
import { feedbackLimiter } from '../../middleware/rateLimiter.js';

const router = express.Router();

/**
 * @swagger
 * /feedback:
 *   post:
 *     summary: Submit feedback
 *     description: Public endpoint (no authentication required) backing the web Feedback page. Anyone, including users without an app account, can submit feedback.
 *     tags: [Feedback]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [category, message, email]
 *             properties:
 *               category:
 *                 type: string
 *                 enum: [bug, suggestion, question, account_access, other]
 *               message:
 *                 type: string
 *               email:
 *                 type: string
 *                 description: Required, so the team can follow up.
 *     responses:
 *       201:
 *         description: Feedback recorded
 *       400:
 *         description: Validation error
 *       429:
 *         description: Too many submissions
 *       500:
 *         description: Internal server error
 */
router.post('/', feedbackLimiter, feedbackController.submitFeedback);

export default router;
