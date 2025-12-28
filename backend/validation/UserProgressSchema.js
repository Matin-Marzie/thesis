import Joi from 'joi';
import LanguageSchema from './LanguageSchema.js';

const PROFICIENCY_LEVELS = ['N', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

const UserProgressSchema = Joi.object({

  energy: Joi.number().integer().min(0).max(100).messages({
    'number.base': 'Energy must be a number',
    'number.min': 'Energy must be at least 0',
    'number.max': 'Energy must be at most 100',
  }),
  coins: Joi.number().integer().min(0).max(100000000).messages({
    'number.base': 'Coins must be a number',
    'number.min': 'Coins must be at least 0',
    'number.max': 'Coins must be at most 100000000',
  }),

  languages: Joi.array()
  .min(1)
  .items(
    Joi.object({
      id: Joi.number().integer().allow(null).messages({
        'number.base': 'languages[i].id must be a number',
        'number.integer': 'languages[i].id must be an integer',
      }),
      is_current_language: Joi.boolean().messages({
        'boolean.base': 'languages[i].is_current_language must be true or false',
      }),
      created_at: Joi.date().messages({
        'date.base': 'languages[i].created_at must be a valid date',
      }),
      proficiency_level: Joi.string().valid(...PROFICIENCY_LEVELS).messages({
        'any.only': `languages[i].proficiency_level must be one of ${PROFICIENCY_LEVELS.join(', ')}`,
      }),
      experience: Joi.number().integer().min(0).max(10000000).messages({
        'number.base': 'languages[i].experience must be a number',
        'number.min': 'languages[i].experience must be at least 0',
        'number.max': 'languages[i].experience must be at most 10000000',
      }),
      native_language: LanguageSchema.messages({
        'any.required': 'languages[i].native_language is required',
      }),
      learning_language: LanguageSchema.messages({
        'any.required': 'languages[i].learning_language is required',
      }),
    })
  ).messages({
    'array.base': 'Languages must be an array',
    'array.min': 'At least one language is required',
  }),
}).options({ stripUnknown: true });

export default UserProgressSchema;