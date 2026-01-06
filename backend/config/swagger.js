import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Personalized Language Learning API',
      version: '1.0.0',
      description: 'API documentation for the Personalized Language Learning Application',
      contact: {
        name: 'API Support',
      },
    },
    servers: [
      {
        url: 'http://localhost:3500/api/v1',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token',
        },
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'jwt',
          description: 'JWT token stored in HTTP-only cookie',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'User ID',
            },
            username: {
              type: 'string',
              description: 'Username',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address',
            },
            google_id: {
              type: 'string',
              description: 'Google OAuth ID',
              nullable: true,
            },
            native_language_id: {
              type: 'integer',
              description: 'Native language ID',
            },
            target_language_id: {
              type: 'integer',
              description: 'Target language ID',
            },
            energy: {
              type: 'integer',
              description: 'User energy points',
              default: 100,
            },
            coins: {
              type: 'integer',
              description: 'User coins',
              default: 0,
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'Account creation timestamp',
            },
          },
        },
        RegisterRequest: {
          type: 'object',
          required: ['first_name', 'email', 'password'],
          properties: {
            first_name: {
              type: 'string',
              minLength: 1,
              maxLength: 100,
              description: 'First name',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address',
            },
            password: {
              type: 'string',
              minLength: 8,
              description: 'Password (minimum 8 characters, must contain uppercase, lowercase, number, and special character)',
            },
          },
        },
        LoginRequest: {
          type: 'object',
          required: ['password'],
          properties: {
            username: {
              type: 'string',
              description: 'Username (provide either username or email)',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email address (provide either username or email)',
            },
            password: {
              type: 'string',
              description: 'Password',
            },
          },
          oneOf: [
            { required: ['username', 'password'] },
            { required: ['email', 'password'] }
          ],
        },
        GoogleAuthRequest: {
          type: 'object',
          required: ['idToken'],
          properties: {
            idToken: {
              type: 'string',
              description: 'Google ID token from OAuth',
            },
            nativeLanguageId: {
              type: 'integer',
              description: 'Native language ID (required for new users)',
            },
            targetLanguageId: {
              type: 'integer',
              description: 'Target language ID (required for new users)',
            },
          },
        },
        AuthResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              description: 'Request success status',
            },
            accessToken: {
              type: 'string',
              description: 'JWT access token',
            },
            user: {
              $ref: '#/components/schemas/User',
            },
          },
        },
        UpdateProfileRequest: {
          type: 'object',
          properties: {
            username: {
              type: 'string',
              minLength: 3,
              maxLength: 50,
              description: 'New username',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'New email address',
            },
            nativeLanguageId: {
              type: 'integer',
              description: 'New native language ID',
            },
            targetLanguageId: {
              type: 'integer',
              description: 'New target language ID',
            },
          },
        },
        UpdateEnergyRequest: {
          type: 'object',
          required: ['energy'],
          properties: {
            energy: {
              type: 'integer',
              minimum: 0,
              description: 'New energy value',
            },
          },
        },
        UpdateCoinsRequest: {
          type: 'object',
          required: ['coins'],
          properties: {
            coins: {
              type: 'integer',
              minimum: 0,
              description: 'New coins value',
            },
          },
        },
        UserLanguage: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'User language ID',
            },
            user_id: {
              type: 'integer',
              description: 'User ID',
            },
            native_language: {
              type: 'object',
              description: 'Native language object',
            },
            learning_language: {
              type: 'object',
              description: 'Language being learned',
            },
            is_current_language: {
              type: 'boolean',
              description: 'Whether this is the currently active language',
            },
          },
        },
        UserVocabulary: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Vocabulary ID',
            },
            user_id: {
              type: 'integer',
              description: 'User ID',
            },
            word_id: {
              type: 'integer',
              description: 'Word ID',
            },
            language_id: {
              type: 'integer',
              description: 'Language ID',
            },
            status: {
              type: 'string',
              enum: ['new', 'learning', 'practiced', 'mastered'],
              description: 'Learning status of the word',
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'When the word was added to vocabulary',
            },
          },
        },
        UserProfile: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'User ID',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email',
            },
            username: {
              type: 'string',
              description: 'Username',
            },
            first_name: {
              type: 'string',
              description: 'First name',
            },
            last_name: {
              type: 'string',
              description: 'Last name',
              nullable: true,
            },
            profile_picture: {
              type: 'string',
              description: 'Profile picture URL',
              nullable: true,
            },
            age: {
              type: 'integer',
              description: 'User age',
              nullable: true,
            },
            preferences: {
              type: 'object',
              description: 'User preferences',
              nullable: true,
            },
            notifications: {
              type: 'boolean',
              description: 'Notifications enabled',
            },
            joined_date: {
              type: 'string',
              format: 'date-time',
              description: 'Account creation date',
            },
          },
        },
        UserProgress: {
          type: 'object',
          properties: {
            energy: {
              type: 'integer',
              description: 'Current energy points',
            },
            coins: {
              type: 'integer',
              description: 'Current coins',
            },
            languages: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/UserLanguage',
              },
              description: 'Languages the user is learning',
            },
          },
        },
        UserProfileProgressResponse: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
            },
            user_profile: {
              $ref: '#/components/schemas/UserProfile',
            },
            user_progress: {
              $ref: '#/components/schemas/UserProgress',
            },
            user_vocabulary: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/UserVocabulary',
              },
            },
          },
        },
        Word: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Word ID',
            },
            word: {
              type: 'string',
              description: 'The word',
            },
            description: {
              type: 'string',
              description: 'Word description or definition',
            },
            example: {
              type: 'string',
              description: 'Example sentence using the word',
              nullable: true,
            },
            pronunciation: {
              type: 'string',
              description: 'Pronunciation guide',
              nullable: true,
            },
            translation: {
              type: 'string',
              description: 'Word translation (when requesting with translation language)',
              nullable: true,
            },
          },
        },
        DictionaryResponse: {
          type: 'object',
          properties: {
            language_code: {
              type: 'string',
              description: 'Language code (e.g., en, el, fa)',
            },
            translation_language_code: {
              type: 'string',
              description: 'Translation language code (if applicable)',
              nullable: true,
            },
            words: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Word',
              },
              description: 'List of words in the dictionary',
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            message: {
              type: 'string',
              description: 'Error message',
            },
          },
        },
        DictionaryError: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Error message',
            },
          },
        },
      },
    },
  },
  apis: ['./routes/**/*.js', './controllers/**/*.js', './server.js'],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
