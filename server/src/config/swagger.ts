export const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'AtomicSync Habit Tracker API',
    version: '1.0.0',
    description: 'Production REST API for AtomicSync Habit Tracker with JWT Auth, habit management, completion history, streaks, and analytics.',
  },
  servers: [
    {
      url: '/api',
      description: 'API Base URL',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
  paths: {
    '/health': {
      get: {
        summary: 'Server Health Check',
        tags: ['System'],
        responses: {
          200: {
            description: 'Server is healthy and online',
          },
        },
      },
    },
    '/auth/register': {
      post: {
        summary: 'Register a new user',
        tags: ['Auth'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'password'],
                properties: {
                  name: { type: 'string', example: 'Jaydeep Prajapati' },
                  email: { type: 'string', example: 'user@example.com' },
                  password: { type: 'string', example: 'Password123!' },
                  timezone: { type: 'string', example: 'Asia/Kolkata' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'User successfully created' },
          400: { description: 'Validation error' },
        },
      },
    },
    '/auth/login': {
      post: {
        summary: 'Sign in to account',
        tags: ['Auth'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', example: 'user@example.com' },
                  password: { type: 'string', example: 'Password123!' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Logged in successfully' },
          401: { description: 'Invalid credentials' },
        },
      },
    },
    '/auth/me': {
      get: {
        summary: 'Get current authenticated user profile',
        tags: ['Auth'],
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'User profile returned' },
          401: { description: 'Not authorized' },
        },
      },
    },
    '/habits': {
      get: {
        summary: 'Get all habits for user',
        tags: ['Habits'],
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'List of user habits' },
        },
      },
      post: {
        summary: 'Create a new habit',
        tags: ['Habits'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name'],
                properties: {
                  name: { type: 'string', example: 'Morning Exercise' },
                  description: { type: 'string', example: '30 mins workout' },
                  category: { type: 'string', example: 'Fitness' },
                  frequency: { type: 'string', enum: ['daily', 'weekly', 'custom'], example: 'daily' },
                  color: { type: 'string', example: '#6366F1' },
                  icon: { type: 'string', example: 'Activity' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Habit created successfully' },
        },
      },
    },
    '/habits/{id}/toggle': {
      post: {
        summary: 'Toggle habit completion for today',
        tags: ['Habits'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
        ],
        responses: {
          200: { description: 'Completion toggled' },
        },
      },
    },
    '/stats/dashboard': {
      get: {
        summary: 'Get dashboard summary & streak stats',
        tags: ['Stats'],
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Summary statistics returned' },
        },
      },
    },
  },
};
