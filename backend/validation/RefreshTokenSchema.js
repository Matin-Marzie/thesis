import Joi from 'joi';

const RefreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required(),
}).options({ stripUnknown: true });

export default RefreshTokenSchema;
