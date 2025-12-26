import Joi from 'joi';

const UserSchema = Joi.object({
  first_name: Joi.string().min(1).max(35).required().messages({
    'string.min': 'First name must be at least 1 character long',
    'string.max': 'First name must be at most 35 characters long',
    'any.required': 'First name is required',
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required',
  }),
  password: Joi.string()
    .min(8)
    .max(64)
    .required()
    .messages({
      'string.min': 'Password must be at least 8 characters long',
      'string.pattern.base':
        'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character',
      'any.required': 'Password is required',
    }),
  age: Joi.number().integer().min(13).max(100).required().messages({
    'number.base': 'Age must be a number',
    'number.min': 'Age must be at least 13',
    'number.max': 'Age must be at most 100',
    'any.required': 'Age is required',
  }),
  preferences: Joi.string().max(100).messages({
    'string.base': 'Preferences must be a string',
    'string.max': 'Preferences can have at most 100 characters',
  }),
  notifications: Joi.boolean().required().messages({
    'boolean.base': 'Notifications must be true or false',
    'any.required': 'Notifications is required',
  }),
  energy: Joi.number().integer().min(0).max(100).required().messages({
    'number.base': 'Energy must be a number',
    'number.min': 'Energy must be at least 0',
    'number.max': 'Energy must be at most 100',
    'any.required': 'Energy is required',
  }),
  coins: Joi.number().integer().min(0).max(100000000).required().messages({
    'number.base': 'Coins must be a number',
    'number.min': 'Coins must be at least 0',
    'number.max': 'Coins must be at most 100000000',
    'any.required': 'Coins is required',
  }),
  languages: Joi.array()
    .items(
      Joi.object({
        native_language_id: Joi.number().integer().required().messages({
          'any.required': 'languages[i].native_language_id is required',
        }),
        learning_language_id: Joi.number().integer().required().messages({
          'any.required': 'languages[i].learning_language_id is required',
        }),
        created_at: Joi.date().required().messages({
          'date.base': 'languages[i].created_at must be a valid date',
          'any.required': 'languages[i].created_at date is required',
        }),
        proficiency_level: Joi.string()
          .valid('N', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2')
          .required()
          .messages({
            'any.only': 'languages[i].proficiency_level must be one of N, A1, A2, B1, B2, C1, C2',
            'any.required': 'languages[i].proficiency_level is required',
          }),
        experience: Joi.number().integer().min(0).max(10000000).required().messages({
          'number.base': 'languages[i].experience must be a number',
          'number.min': 'languages[i].experience must be at least 0',
          'number.max': 'languages[i].experience must be at most 100000000',
          'any.required': 'languages[i].experience is required',
        }),
        is_current_language: Joi.boolean().required().messages({
          'boolean.base': 'languages[i].is_current_language must be true or false',
          'any.required': 'languages[i].is_current_language is required',
        }),
        learned_vocabulary: Joi.array()
          .max(30000)
          .items(
            Joi.object({
              id: Joi.number().required().messages({
                'any.required': 'learned_vocabulary[i].id is required',
              }),
              mastery_level: Joi.number().integer().min(0).max(6).required().messages({
                'number.base': 'learned_vocabulary[i].mastery_level must be a number',
                'number.min': 'learned_vocabulary[i].mastery_level must be at least 0',
                'number.max': 'learned_vocabulary[i].mastery_level must be at most 6',
                'any.required': 'learned_vocabulary[i].mastery_level is required',
              }),
              last_review: Joi.date().required().messages({
                'date.base': 'learned_vocabulary[i].last_review must be a valid date',
                'any.required': 'learned_vocabulary[i].last_review date is required',
              }),
              created_at: Joi.date().required().messages({
                'date.base': 'learned_vocabulary[i].created_at must be a valid date',
                'any.required': 'learned_vocabulary[i].created_at date is required',
              }),
            })
          )
          .required()
          .messages({
            'array.base': 'learned_vocabulary must be an array',
            'array.max': 'learned_vocabulary can have at most 30000 items',
            'any.required': 'learned_vocabulary is required',
          }),
      })
    )
    .required()
    .messages({
      'array.length': 'Languages must have exactly one element',
      'any.required': 'Languages is required',
    }),
}).options({ stripUnknown: true });

export default UserSchema;
