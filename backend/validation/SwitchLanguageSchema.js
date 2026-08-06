import Joi from 'joi';

const SwitchLanguageSchema = Joi.object({
  user_languages_id: Joi.number().integer().required().messages({
    'number.base': 'user_languages_id must be a number',
    'number.integer': 'user_languages_id must be an integer',
    'any.required': 'user_languages_id is required',
  }),
});

export default SwitchLanguageSchema;
