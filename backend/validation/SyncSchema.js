import Joi from 'joi';

const wordIdKey = Joi.string().pattern(/^\d+$/).message('Word ID keys must be numeric strings');

const SyncSchema = Joi.object({

  user_progress: Joi.object({
    energy: Joi.number().integer().min(0).max(100).messages({
      'number.base': 'Energy must be a number',
      'number.integer': 'Energy must be an integer',
      'number.min': 'Energy must be at least 0',
      'number.max': 'Energy must be at most 100',
    }),
    coins: Joi.number().integer().min(0).max(100000000).messages({
      'number.base': 'Coins must be a number',
      'number.integer': 'Coins must be an integer',
      'number.min': 'Coins must be at least 0',
      'number.max': 'Coins must be at most 100000000',
    }),
  }).min(1).messages({
    'object.min': 'user_progress must contain at least one field (energy or coins)',
  }),

  vocabulary_changes: Joi.object({

    inserts: Joi.object().pattern(
      wordIdKey,
      Joi.object({
        language_id: Joi.number().integer().required().messages({
          'number.base': 'language_id must be a number',
          'number.integer': 'language_id must be an integer',
          'any.required': 'language_id is required for inserts',
        }),
        mastery_level: Joi.number().integer().min(0).max(6).required().messages({
          'number.base': 'mastery_level must be a number',
          'number.integer': 'mastery_level must be an integer',
          'number.min': 'mastery_level must be at least 0',
          'number.max': 'mastery_level must be at most 6',
          'any.required': 'mastery_level is required for inserts',
        }),
        last_review: Joi.date().allow(null).messages({
          'date.base': 'last_review must be a valid date or null',
        }),
        created_at: Joi.date().required().messages({
          'date.base': 'created_at must be a valid date',
          'any.required': 'created_at is required for inserts',
        }),
      })
    ).default({}).messages({
      'object.base': 'inserts must be an object',
    }),

    updates: Joi.object().pattern(
      wordIdKey,
      Joi.object({
        mastery_level: Joi.number().integer().min(0).max(6).messages({
          'number.base': 'mastery_level must be a number',
          'number.integer': 'mastery_level must be an integer',
          'number.min': 'mastery_level must be at least 0',
          'number.max': 'mastery_level must be at most 6',
        }),
        last_review: Joi.date().allow(null).messages({
          'date.base': 'last_review must be a valid date or null',
        }),
      }).min(1).messages({
        'object.min': 'Each update entry must have at least one field',
      })
    ).default({}).messages({
      'object.base': 'updates must be an object',
    }),

    deletes: Joi.object().pattern(
      wordIdKey,
      Joi.boolean().valid(true).messages({
        'any.only': 'Delete values must be true',
      })
    ).default({}).messages({
      'object.base': 'deletes must be an object',
    }),

  }),

}).min(1).messages({
  'object.min': 'Request body must contain at least user_progress or vocabulary_changes',
});

export default SyncSchema;
