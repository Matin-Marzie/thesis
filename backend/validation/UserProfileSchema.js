import Joi from 'joi';

const UserProfileSchema = Joi.object({
    first_name: Joi.string().min(1).max(35).messages({
        'string.min': 'First name must be at least 1 character long',
        'string.max': 'First name must be at most 35 characters long',
    }),
    last_name: Joi.string().allow(null, '').messages({
        'string.base': 'Last name must be a string',
    }),
    username: Joi.string()
        .pattern(/^[a-zA-Z0-9._]{3,30}$/)
        .min(3)
        .max(30)
        .messages({
          'string.pattern.base': 'Username must only contain letters, numbers, dots, and underscores',
          'string.min': 'Username must be at least 3 characters long',
          'string.max': 'Username must be at most 30 characters long',
        }),
    email: Joi.string().email().messages({
        'string.email': 'Please provide a valid email address',
    }),
    profile_picture: Joi.string().uri().allow(null, '').messages({
        'string.uri': 'Profile picture must be a valid URI',
    }),
    joined_date: Joi.date().messages({
        'date.base': 'Joined date must be a valid date',
    }),
    age: Joi.number().integer().min(13).max(100).messages({
        'number.base': 'Age must be a number',
        'number.min': 'Age must be at least 13',
        'number.max': 'Age must be at most 100',
    }),
    notifications: Joi.boolean().messages({
        'boolean.base': 'Notifications must be true or false',
    }),
    preferences: Joi.string().max(100).messages({
        'string.base': 'Preferences must be a string',
        'string.max': 'Preferences can have at most 100 characters',
    }),
}).options({ stripUnknown: true });

export default UserProfileSchema;