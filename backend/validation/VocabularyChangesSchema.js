import Joi from 'joi';

const wordIdKey = Joi.string().pattern(/^\d+$/).message('Word ID keys must be numeric strings');

// Shared by registration flows (email + Google) - same structure as SyncSchema
const VocabularyChangesSchema = Joi.object({
  inserts: Joi.object().pattern(
    wordIdKey,
    Joi.object({
      last_review: Joi.date().allow(null),
      created_at: Joi.date().required(),
      review_count: Joi.number().integer().min(0),
      next_review_at: Joi.date().allow(null),
      stability: Joi.number().allow(null),
      difficulty: Joi.number().allow(null),
      lapses: Joi.number().integer().min(0),
      fsrs_state: Joi.number().integer().min(0).max(3),
      learning_steps: Joi.number().integer().min(0),
    })
  ).default({}),
  updates: Joi.object().pattern(
    wordIdKey,
    Joi.object({
      last_review: Joi.date().allow(null),
      review_count: Joi.number().integer().min(0),
      next_review_at: Joi.date().allow(null),
      stability: Joi.number().allow(null),
      difficulty: Joi.number().allow(null),
      lapses: Joi.number().integer().min(0),
      fsrs_state: Joi.number().integer().min(0).max(3),
      learning_steps: Joi.number().integer().min(0),
    }).min(1)
  ).default({}),
  deletes: Joi.object().pattern(
    wordIdKey,
    Joi.boolean().valid(true)
  ).default({}),
}).default({ inserts: {}, updates: {}, deletes: {} });

export default VocabularyChangesSchema;
