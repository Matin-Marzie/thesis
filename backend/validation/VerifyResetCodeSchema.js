import Joi from 'joi';
import UserProfileSchema from './UserProfileSchema.js';

const VerifyResetCodeSchema = Joi.object({
  email: UserProfileSchema.extract('email').required(),
  code: Joi.string().pattern(/^\d{6}$/).required().messages({
    'string.pattern.base': 'Code must be a 6-digit number',
    'any.required': 'Verification code is required',
  }),
}).options({ stripUnknown: true });

export default VerifyResetCodeSchema;
