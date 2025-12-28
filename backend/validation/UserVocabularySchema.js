import Joi from 'joi';

const UserVocabularySchema = Joi.object()
  .pattern(
    Joi.string(), // wordId as key
    Joi.object({
      language_id: Joi.number().integer().required().messages({
        'number.base': 'language_id must be a number',
        'number.integer': 'language_id must be an integer',
        'any.required': 'language_id is required',
      }),
      mastery_level: Joi.number().integer().min(0).max(6).required().messages({
        'number.base': 'mastery_level must be a number',
        'number.integer': 'mastery_level must be an integer',
        'number.min': 'mastery_level must be at least 0',
        'number.max': 'mastery_level must be at most 6',
        'any.required': 'mastery_level is required',
      }),
      last_review: Joi.date().allow(null).messages({
        'date.base': 'last_review must be a valid date or null',
      }),
      created_at: Joi.date().required().messages({
        'date.base': 'created_at must be a valid date',
        'any.required': 'created_at is required',
      }),
    })
  )
  .max(30000) // max 30000 words
  .required()
  .messages({
    'object.base': 'user_vocabulary must be an object',
    'object.max': 'user_vocabulary cannot have more than 30000 entries',
    'any.required': 'user_vocabulary is required',
  });

export default UserVocabularySchema;
