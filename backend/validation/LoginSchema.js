import Joi from 'joi';

const LoginSchema = Joi.object({
  username: Joi.string()
    .pattern(/^[a-zA-Z0-9._]{3,30}$/)
    .min(3)
    .max(30)
    .messages({
      'string.pattern.base': 'Username must only contain letters, numbers, dots, and underscores',
      'string.min': 'Username must be at least 3 characters long',
      'string.max': 'Username must be at most 30 characters long',
    }),
  email: Joi.string().email().messages({
    'string.email': 'Please provide a valid email address',
  }),
  password: Joi.string()
    .min(8)
    .max(64)
    .required()
    .messages({
      'string.min': 'Password must be at least 8 characters long',
      'string.max': 'Password must be at most 64 characters long',
      'any.required': 'Password is required',
    }),
  coins: Joi.number().integer().min(0).max(100000000).messages({
    'number.base': 'Coins must be a number',
    'number.min': 'Coins must be at least 0',
    'number.max': 'Coins must be at most 100000000',
  }),
  // energy: Joi.number().integer().min(0).max(100).required().messages({
  //   'number.base': 'Energy must be a number',
  //   'number.min': 'Energy must be at least 0',
  //   'number.max': 'Energy must be at most 100',
  //   'any.required': 'Energy is required',
  // }),
  languages: Joi.array()
    .items(
      Joi.object({
        native_language_id: Joi.number().integer().required().messages({
          'any.required': 'Native language ID is required',
        }),
        learning_language_id: Joi.number().integer().required().messages({
          'any.required': 'Learning language ID is required',
        }),
        proficiency_level: Joi.string()
          .valid('N', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2')
          .required()
          .messages({
            'any.only': 'Proficiency level must be one of N, A1, A2, B1, B2, C1, C2',
            'any.required': 'Proficiency level is required',
          }),
        experience: Joi.number().integer().min(0).max(10000000).messages({
          'number.base': 'Experience must be a number',
          'number.min': 'Experience must be at least 0',
          'number.max': 'Experience must be at most 10000000',
        }),
        learned_vocabulary: Joi.array()
          .max(30000)
          .items(
            Joi.object({
              id: Joi.number().required().messages({
                'any.required': 'Vocabulary ID is required',
              }),
              mastery_level: Joi.number().integer().min(0).max(6).required().messages({
                'number.base': 'Mastery level must be a number',
                'number.min': 'Mastery level must be at least 0',
                'number.max': 'Mastery level must be at most 6',
                'any.required': 'Mastery level is required',
              }),
              last_review: Joi.date().required().messages({
                'date.base': 'Last review must be a valid date',
                'any.required': 'Last review date is required',
              }),
              created_at: Joi.date().required().messages({
                'date.base': 'Created at must be a valid date',
                'any.required': 'Created at date is required',
              }),
            })
          )
          .messages({
            'array.base': 'Learned vocabulary must be an array',
            'array.max': 'Learned vocabulary can have at most 30000 items',
          }),
      })
    )
    .messages({
      'array.base': 'Languages must be an array',
    }),
}).xor('username', 'email')
  .messages({
    'object.missing': 'Either username or email is required',
    'object.xor': 'Provide either username or email, not both',
  })
  .options({ stripUnknown: true });

export default LoginSchema;
