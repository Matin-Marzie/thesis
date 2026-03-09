import Joi from 'joi';
import UserProfileSchema from './UserProfileSchema.js';
import UserProgressSchema from './UserProgressSchema.js';
import PasswordSchema from './PasswordSchema.js';

const wordIdKey = Joi.string().pattern(/^\d+$/).message('Word ID keys must be numeric strings');

// Vocabulary changes schema for registration (same structure as SyncSchema)
const VocabularyChangesSchema = Joi.object({
  inserts: Joi.object().pattern(
    wordIdKey,
    Joi.object({
      mastery_level: Joi.number().integer().min(0).max(6).required(),
      last_review: Joi.date().allow(null),
      created_at: Joi.date().required(),
    })
  ).default({}),
  updates: Joi.object().pattern(
    wordIdKey,
    Joi.object({
      mastery_level: Joi.number().integer().min(0).max(6),
      last_review: Joi.date().allow(null),
    }).min(1)
  ).default({}),
  deletes: Joi.object().pattern(
    wordIdKey,
    Joi.boolean().valid(true)
  ).default({}),
}).default({ inserts: {}, updates: {}, deletes: {} });

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
  vocabulary_changes: VocabularyChangesSchema,
}).options({ stripUnknown: true });

export default RegisterSchema;
