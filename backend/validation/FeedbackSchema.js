import Joi from 'joi';

export const FEEDBACK_CATEGORIES = ['bug', 'suggestion', 'question', 'account_access', 'other'];

const FeedbackSchema = Joi.object({
  category: Joi.string().valid(...FEEDBACK_CATEGORIES).required().messages({
    'any.only': `category must be one of: ${FEEDBACK_CATEGORIES.join(', ')}`,
    'any.required': 'category is required',
  }),
  message: Joi.string().trim().min(5).max(4000).required().messages({
    'string.empty': 'message is required',
    'string.min': 'message must be at least 5 characters',
    'string.max': 'message must be at most 4000 characters',
    'any.required': 'message is required',
  }),
  email: Joi.string().trim().email({ tlds: false }).max(255).required().messages({
    'string.empty': 'email is required',
    'string.email': 'email must be a valid email address',
    'any.required': 'email is required',
  }),
});

export default FeedbackSchema;
