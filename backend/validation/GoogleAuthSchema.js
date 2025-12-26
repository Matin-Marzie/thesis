import Joi from 'joi';

const GoogleAuthSchema = Joi.object({
  idToken: Joi.string().required().messages({
    'any.required': 'Google ID token is required',
  }),

  age: Joi.number().integer().min(13).max(100).required().messages({
    'number.base': 'Age must be a number',
    'number.min': 'Age must be at least 13',
    'number.max': 'Age must be at most 100',
    'any.required': 'Age is required',
  }),

  preferences: Joi.string().max(100).allow(null, '').messages({
    'string.base': 'Preferences must be a string',
    'string.max': 'Preferences can have at most 100 characters',
  }),

  coins: Joi.number().integer().min(0).max(100000000).required().messages({
    'number.base': 'Coins must be a number',
    'number.min': 'Coins must be at least 0',
    'number.max': 'Coins must be at most 100000000',
    'any.required': 'Coins is required',
  }),

  energy: Joi.number().integer().min(0).max(100).required().messages({
    'number.base': 'Energy must be a number',
    'number.min': 'Energy must be at least 0',
    'number.max': 'Energy must be at most 100',
    'any.required': 'Energy is required',
  }),

  joined_date: Joi.date().required().messages({
    'date.base': 'Joined date must be a valid date',
    'any.required': 'Joined date is required',
  }),

  platform: Joi.string().valid('android', 'ios', 'web').required().messages({
    'any.only': 'Platform must be one of android, ios, or web',
    'any.required': 'Platform is required',
  }),

  languages: Joi.array()
    .min(1)
    .items(
      Joi.object({
        is_current_language: Joi.boolean().required(),
        native_language_id: Joi.number().integer().required(),
        learning_language_id: Joi.number().integer().required(),
        proficiency_level: Joi.string()
          .valid('N', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2')
          .required(),
        experience: Joi.number().integer().min(0).max(10000000).required(),
      })
    )
    .required()
    .messages({
      'array.base': 'Languages must be an array',
      'any.required': 'Languages is required',
    }),
}).options({ stripUnknown: true });

export default GoogleAuthSchema;
