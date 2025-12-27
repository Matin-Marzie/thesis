import Joi from 'joi';

const LANGUAGE_CODES = new Set([ 'en', 'el', 'fa']);

const LanguageCodeSchema = Joi.object({
    language_code: Joi.string().valid(...LANGUAGE_CODES).required().messages({
        'any.only': `language_code must be one of ${Array.from(LANGUAGE_CODES).join(', ')}`,
        'any.required': 'language_code is required',
    }),
    translation_language_code: Joi.string().valid(...LANGUAGE_CODES).required().messages({
        'any.only': `translation_language_code must be one of ${Array.from(LANGUAGE_CODES).join(', ')}`,
        'any.required': 'translation_language_code is required',
    }),
});

export default LanguageCodeSchema;