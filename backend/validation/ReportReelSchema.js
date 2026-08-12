import Joi from 'joi';

// Matches reel_interactions.report_reason (free text column) - kept to a
// fixed set here so reports stay bucketable/actionable for moderation.
export const REPORT_REASONS = [
  'spam',
  'nudity_or_sexual_content',
  'violence_or_dangerous_content',
  'hate_speech_or_symbols',
  'harassment_or_bullying',
  'false_information',
  'other',
];

const ReportReelSchema = Joi.object({
  reason: Joi.string().valid(...REPORT_REASONS).required().messages({
    'any.required': 'reason is required',
    'any.only': `reason must be one of: ${REPORT_REASONS.join(', ')}`,
  }),
});

export default ReportReelSchema;
