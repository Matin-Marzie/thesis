import Joi from 'joi';

const PasswordSchema = Joi.string()
    .min(8)
    .max(64)
    .required()
    .messages({
      'string.min': 'Password must be at least 8 characters long',
      'string.max': 'Password must be at most 64 characters long',
      'any.required': 'Password is required',
    });

export default PasswordSchema;