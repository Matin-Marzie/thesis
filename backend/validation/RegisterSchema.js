import Joi from 'joi';
import UserProfileSchema from './UserProfileSchema.js';
import UserProgressSchema from './UserProgressSchema.js';
import PasswordSchema from './PasswordSchema.js';
import VocabularyChangesSchema from './VocabularyChangesSchema.js';

const RegisterSchema = Joi.object({
  password: PasswordSchema,
  email_verification_code: Joi.string().pattern(/^\d{6}$/).required().messages({
    'string.pattern.base': 'Code must be a 6-digit number',
    'any.required': 'Verification code is required',
  }),
  user_profile: UserProfileSchema.keys({
    first_name: UserProfileSchema.extract('first_name').required(),
    email: UserProfileSchema.extract('email').required(),
    age: UserProfileSchema.extract('age').required(),
    preferences: UserProfileSchema.extract('preferences').optional(),
    notifications: UserProfileSchema.extract('notifications').required(),
  }),
  user_progress: UserProgressSchema.keys({
    energy: UserProgressSchema.extract('energy').required(),
    coins: UserProgressSchema.extract('coins').required(),
    languages: UserProgressSchema.extract('languages').required(),
  }),
  vocabulary_changes: VocabularyChangesSchema,
}).options({ stripUnknown: true });

export default RegisterSchema;
