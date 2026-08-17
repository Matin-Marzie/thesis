import Joi from 'joi';
import UserProgressSchema from './UserProgressSchema.js';
import PasswordSchema from './PasswordSchema.js';
import UserProfileSchema from './UserProfileSchema.js';
import VocabularyChangesSchema from './VocabularyChangesSchema.js';
import SentenceChangesSchema from './SentenceChangesSchema.js';

const LoginSchema = Joi.object({
  username: UserProfileSchema.extract('username'),
  email: UserProfileSchema.extract('email'),
  password: PasswordSchema,
  // Present only when the client is merging local guest progress into this
  // account on login - see mergeGuestProgress.js. vocabulary_changes (not
  // the full user_vocabulary) - the full vocabulary can easily be
  // thousands of words and blow past Express's JSON body size limit,
  // while the tracked changes are small by construction.
  user_profile: UserProfileSchema.keys({
    age: UserProfileSchema.extract('age').optional(),
    preferences: UserProfileSchema.extract('preferences').optional(),
    notifications: UserProfileSchema.extract('notifications').optional(),
  }).optional(),
  user_progress: UserProgressSchema.keys({
    coins: UserProgressSchema.extract('coins').optional(),
    energy: UserProgressSchema.extract('energy').optional(),
    languages: UserProgressSchema.extract('languages').optional(),
  }).optional(),
  vocabulary_changes: VocabularyChangesSchema,
  sentence_changes: SentenceChangesSchema,
})
.xor('username', 'email') // Require either username or email, not both
.messages({
  'object.missing': 'Either username or email is required',
  'object.xor': 'Provide either username or email, not both',
})
.options({ stripUnknown: true });

export default LoginSchema;
