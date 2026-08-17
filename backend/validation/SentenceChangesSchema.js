import Joi from 'joi';

const sentenceIdKey = Joi.string().pattern(/^\d+$/).message('Sentence ID keys must be numeric strings');

// Shared by registration/login flows - same structure as SyncSchema
const SentenceChangesSchema = Joi.object({
  inserts: Joi.object().pattern(
    sentenceIdKey,
    Joi.object({
      mastery_level: Joi.number().integer().min(0).max(6).required(),
      last_review: Joi.date().allow(null),
      created_at: Joi.date().required(),
    })
  ).default({}),
  updates: Joi.object().pattern(
    sentenceIdKey,
    Joi.object({
      mastery_level: Joi.number().integer().min(0).max(6),
      last_review: Joi.date().allow(null),
    }).min(1)
  ).default({}),
  deletes: Joi.object().pattern(
    sentenceIdKey,
    Joi.boolean().valid(true)
  ).default({}),
}).default({ inserts: {}, updates: {}, deletes: {} });

export default SentenceChangesSchema;
