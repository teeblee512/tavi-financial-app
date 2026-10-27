export const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'TAVI Financial Platform API',
    version: '1.0.0',
    description: 'Authoritative REST API and Double-Entry Ledger documentation for TAVI Financial Super App.',
    contact: {
      name: 'TAVI Engineering',
      url: 'https://tavi-financial-app.onrender.com',
    },
  },
  servers: [
    {
      url: '/api/v1',
      description: 'API v1 Base Route',
    },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
  paths: {
    '/health': {
      get: {
        summary: 'Platform Health and Service Check',
        responses: {
          200: { description: 'Platform is online and operating smoothly.' },
        },
      },
    },
    '/auth/register': {
      post: {
        summary: 'Register a new user account',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['phone', 'password', 'firstName', 'lastName'],
                properties: {
                  phone: { type: 'string', example: '07030000000' },
                  email: { type: 'string', example: 'user@taviapp.ng' },
                  password: { type: 'string', example: 'Password123!' },
                  firstName: { type: 'string', example: 'Amara' },
                  lastName: { type: 'string', example: 'Okonkwo' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'User successfully registered.' },
          400: { description: 'Phone or email already exists.' },
        },
      },
    },
    '/auth/login': {
      post: {
        summary: 'Authenticate and receive JWT token',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['phoneOrEmail', 'passwordOrPin'],
                properties: {
                  phoneOrEmail: { type: 'string', example: '07030000000' },
                  passwordOrPin: { type: 'string', example: '1234' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Login successful. Returns user and tokens.' },
          401: { description: 'Invalid credentials.' },
        },
      },
    },
    '/wallets': {
      get: {
        summary: 'List user wallets across all currencies',
        security: [{ BearerAuth: [] }],
        responses: {
          200: { description: 'List of multi-currency wallets.' },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/transactions': {
      get: {
        summary: 'Retrieve authoritative transaction history',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'counterparty', in: 'query', schema: { type: 'string' } },
          { name: 'type', in: 'query', schema: { type: 'string', enum: ['all', 'debit', 'credit'] } },
        ],
        responses: {
          200: { description: 'Filtered list of transactions.' },
        },
      },
    },
    '/transactions/transfer': {
      post: {
        summary: 'Execute transfer with 4-digit PIN confirmation',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['recipientIdentifier', 'recipientName', 'amountMinor', 'pin'],
                properties: {
                  recipientIdentifier: { type: 'string', example: '0123456789' },
                  recipientName: { type: 'string', example: 'Ada Chukwu' },
                  recipientBank: { type: 'string', example: 'GTBank' },
                  amountMinor: { type: 'integer', example: 2500000 },
                  currency: { type: 'string', example: 'NGN' },
                  narration: { type: 'string', example: 'Consulting fees' },
                  pin: { type: 'string', example: '1234' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Transfer executed successfully.' },
          400: { description: 'Insufficient funds.' },
          401: { description: 'Invalid PIN.' },
        },
      },
    },
    '/invest/stocks': {
      get: {
        summary: 'List active Nigerian Exchange (NGX) equities',
        responses: {
          200: { description: 'List of quoted stocks with price and volume.' },
        },
      },
    },
    '/fx/rates': {
      get: {
        summary: 'Retrieve current multi-currency exchange rates',
        responses: {
          200: { description: 'Indicative currency exchange rates.' },
        },
      },
    },
  },
};
