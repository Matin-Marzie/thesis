import Joi from 'joi';

const LANGUAGE_MAP = {
  English: 'en',
  Farsi: 'fa',
  Greek: 'el',
};

const LanguageSchema = Joi.object({
  id: Joi.number().integer().messages({
    'number.base': 'ID must be a number',
    'number.integer': 'ID must be an integer',
  }),
  name: Joi.string()
    .valid(...Object.keys(LANGUAGE_MAP))
    .optional()
    .messages({
      'any.only': `Name must be one of ${Object.keys(LANGUAGE_MAP).join(', ')}`,
    }),
  code: Joi.string()
    .valid(...Object.values(LANGUAGE_MAP))
    .required()
    .messages({
      'any.only': `Code must be one of ${Object.values(LANGUAGE_MAP).join(', ')}`,
      'string.base': 'Code must be a string',
      'any.required': 'Code is required',
    }),
}).custom((value, helpers) => {
  // Only validate name ↔ code match if name exists
  if (value.name && value.code && LANGUAGE_MAP[value.name] !== value.code) {
    return helpers.error('any.invalid', { message: `Name and code must match: ${value.name} → ${LANGUAGE_MAP[value.name]}` });
  }
  return value;
}).messages({
  'any.invalid': '{{#message}}',
});

export default LanguageSchema;
