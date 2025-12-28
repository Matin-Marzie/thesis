import Joi from 'joi';
import UserProgressSchema from './UserProgressSchema.js';
import WordProgressSchema from './UserVocabularySchema.js';
import PasswordSchema from './PasswordSchema.js';
import UserProfileSchema from './UserProfileSchema.js';

const LoginSchema = Joi.object({
  username: UserProfileSchema.extract('username'),
  email: UserProfileSchema.extract('email'),
  password: PasswordSchema,
  user_progress: UserProgressSchema.keys({
    coins: UserProgressSchema.extract('coins').optional(),
    energy: UserProgressSchema.extract('energy').optional(),
    languages: UserProgressSchema.extract('languages').optional(),
  }).optional(),
  user_vocabulary: WordProgressSchema.optional(),
})
.xor('username', 'email') // Require either username or email, not both
.messages({
  'object.missing': 'Either username or email is required',
  'object.xor': 'Provide either username or email, not both',
})
.options({ stripUnknown: true });

export default LoginSchema;
