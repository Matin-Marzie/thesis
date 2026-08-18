import Joi from 'joi';

const PROFICIENCY_LEVELS = ['N', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'EX'];

const AddLanguageSchema = Joi.object({
  native_language_id: Joi.number().integer().required().messages({
    'number.base': 'native_language_id must be a number',
    'number.integer': 'native_language_id must be an integer',
    'any.required': 'native_language_id is required',
  }),
  learning_language_id: Joi.number().integer().required().messages({
    'number.base': 'learning_language_id must be a number',
    'number.integer': 'learning_language_id must be an integer',
    'any.required': 'learning_language_id is required',
  }),
  proficiency_level: Joi.string().valid(...PROFICIENCY_LEVELS).required().messages({
    'any.only': `proficiency_level must be one of ${PROFICIENCY_LEVELS.join(', ')}`,
    'any.required': 'proficiency_level is required',
  }),
});

export default AddLanguageSchema;
