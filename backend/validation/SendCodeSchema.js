import Joi from 'joi';
import UserProfileSchema from './UserProfileSchema.js';

const SendCodeSchema = Joi.object({
  email: UserProfileSchema.extract('email').required(),
}).options({ stripUnknown: true });

export default SendCodeSchema;
