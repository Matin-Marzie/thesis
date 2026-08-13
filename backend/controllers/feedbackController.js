import FeedbackSchema from '../validation/FeedbackSchema.js';
import feedbackModel from '../models/feedbackModel.js';

const feedbackController = {
  // Public, no-auth endpoint backing backend/public/feedback.html - anyone
  // (including users without an account) can submit feedback from the web.
  async submitFeedback(req, res) {
    try {
      const { error, value } = FeedbackSchema.validate(req.body);
      if (error) {
        return res.status(400).json({ message: error.details[0].message });
      }

      await feedbackModel.create({
        category: value.category,
        message: value.message,
        email: value.email || null,
        userAgent: req.headers['user-agent'],
        ipAddress: req.ip,
      });

      res.status(201).json({ message: 'Thanks for the feedback!' });
    } catch (error) {
      console.error('Submit feedback error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },
};

export default feedbackController;
