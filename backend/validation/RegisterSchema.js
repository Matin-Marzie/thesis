import Joi from 'joi';
import UserProfileSchema from './UserProfileSchema.js';
import UserProgressSchema from './UserProgressSchema.js';
import WordProgressSchema from './UserVocabularySchema.js';
import PasswordSchema from './PasswordSchema.js';

const RegisterSchema = Joi.object({
  password: PasswordSchema,
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
  user_vocabulary: WordProgressSchema.required(),
}).options({ stripUnknown: true });

export default RegisterSchema;
