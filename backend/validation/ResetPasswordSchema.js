import Joi from 'joi';
import UserProfileSchema from './UserProfileSchema.js';
import PasswordSchema from './PasswordSchema.js';

const ResetPasswordSchema = Joi.object({
  email: UserProfileSchema.extract('email').required(),
  code: Joi.string().pattern(/^\d{6}$/).required().messages({
    'string.pattern.base': 'Code must be a 6-digit number',
    'any.required': 'Verification code is required',
  }),
  new_password: PasswordSchema,
}).options({ stripUnknown: true });

export default ResetPasswordSchema;
