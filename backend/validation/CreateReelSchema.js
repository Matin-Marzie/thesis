import Joi from 'joi';

const MAX_DURATION_SECONDS = 90;
const MAX_TITLE_LENGTH = 100;
const MAX_DESCRIPTION_LENGTH = 500;
const MAX_LINE_TEXT_LENGTH = 500;
const MAX_LINES = 200;

// Mirrors the DB's dialogue_sentences "valid_time" CHECK constraint
// (end_time_ms > start_time_ms) - this flow always supplies both, so the
// "both null" branch of the DB constraint is unreachable here.
const SubtitleLineSchema = Joi.object({
  position: Joi.number().integer().min(1).required().messages({
    'any.required': 'position is required',
  }),
  text: Joi.string().trim().min(1).max(MAX_LINE_TEXT_LENGTH).required().messages({
    'any.required': 'text is required',
    'string.empty': 'text cannot be empty',
  }),
  translation: Joi.string().trim().max(MAX_LINE_TEXT_LENGTH).allow(null, '').default(null),
  translation_language_id: Joi.number().integer().allow(null).default(null)
    .when('translation', {
      is: Joi.string().min(1),
      then: Joi.required().messages({
        'any.required': 'translation_language_id is required when a translation is provided',
      }),
    }),
  start_time_ms: Joi.number().integer().min(0).required().messages({
    'any.required': 'start_time_ms is required',
  }),
  end_time_ms: Joi.number().integer().min(0).required().messages({
    'any.required': 'end_time_ms is required',
  }),
}).custom((line, helpers) => {
  if (line.end_time_ms <= line.start_time_ms) {
    return helpers.message(`line ${line.position}: end_time_ms must be greater than start_time_ms`);
  }
  return line;
});

const CreateReelSchema = Joi.object({
  title: Joi.string().trim().min(1).max(MAX_TITLE_LENGTH).required().messages({
    'any.required': 'title is required',
    'string.empty': 'title cannot be empty',
  }),
  description: Joi.string().trim().max(MAX_DESCRIPTION_LENGTH).allow(null, '').default(null),
  language_id: Joi.number().integer().required().messages({
    'any.required': 'language_id is required',
  }),
  duration: Joi.number().integer().min(1).max(MAX_DURATION_SECONDS).required().messages({
    'any.required': 'duration is required',
    'number.max': `duration must not exceed ${MAX_DURATION_SECONDS} seconds`,
  }),
  lines: Joi.array().items(SubtitleLineSchema).min(1).max(MAX_LINES).required().messages({
    'array.min': 'At least one subtitle line is required',
    'any.required': 'lines is required',
  }),
});

export default CreateReelSchema;
