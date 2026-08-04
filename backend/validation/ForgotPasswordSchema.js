import Joi from 'joi';
import UserProfileSchema from './UserProfileSchema.js';

const ForgotPasswordSchema = Joi.object({
  email: UserProfileSchema.extract('email').required(),
}).options({ stripUnknown: true });

export default ForgotPasswordSchema;
