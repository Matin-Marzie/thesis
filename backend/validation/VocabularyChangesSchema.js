import Joi from 'joi';

const wordIdKey = Joi.string().pattern(/^\d+$/).message('Word ID keys must be numeric strings');

// Shared by registration flows (email + Google) - same structure as SyncSchema
const VocabularyChangesSchema = Joi.object({
  inserts: Joi.object().pattern(
    wordIdKey,
    Joi.object({
      mastery_level: Joi.number().integer().min(0).max(6).required(),
      last_review: Joi.date().allow(null),
      created_at: Joi.date().required(),
    })
  ).default({}),
  updates: Joi.object().pattern(
    wordIdKey,
    Joi.object({
      mastery_level: Joi.number().integer().min(0).max(6),
      last_review: Joi.date().allow(null),
    }).min(1)
  ).default({}),
  deletes: Joi.object().pattern(
    wordIdKey,
    Joi.boolean().valid(true)
  ).default({}),
}).default({ inserts: {}, updates: {}, deletes: {} });

export default VocabularyChangesSchema;
