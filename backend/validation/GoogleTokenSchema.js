import Joi from 'joi';

// Shared by both /auth/google/login and /auth/google/register - just what's
// needed to verify the Google ID token itself.
const GoogleTokenSchema = Joi.object({
  idToken: Joi.string().required().messages({
    'any.required': 'Google ID token is required',
    'string.base': 'Google ID token must be a string',
  }),
  platform: Joi.string()
    .valid('android', 'ios', 'web')
    .required()
    .messages({
      'any.only': 'Platform must be one of android, ios, or web',
      'any.required': 'Platform is required',
      'string.base': 'Platform must be a string',
    }),
}).options({ stripUnknown: true });

export default GoogleTokenSchema;
