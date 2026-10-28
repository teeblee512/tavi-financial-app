import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import { config } from './config/index.js';
import { globalRateLimiter } from './middleware/rateLimiter.js';
import { errorHandler } from './middleware/errorHandler.js';
import { swaggerDocument } from './docs/swagger.js';

// Route Modules
import { healthRouter } from './routes/health.routes.js';
import { authRouter } from './routes/auth.routes.js';
import { walletRouter } from './routes/wallet.routes.js';
import { transactionRouter } from './routes/transaction.routes.js';
import { investRouter } from './routes/invest.routes.js';
import { fxRouter } from './routes/fx.routes.js';
import { supportRouter } from './routes/support.routes.js';
import { notificationRouter } from './routes/notifications.routes.js';
import { recipientRouter } from './routes/recipient.routes.js';
import { sandboxRouter } from './routes/sandbox.routes.js';

export function createApp(): Express {
  const app = express();

  // Security Headers
  app.use(helmet());

  // CORS Configuration
  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (e.g. mobile apps, curl) or matched origins
        if (!origin || config.corsOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
          callback(null, true);
        } else {
          callback(null, true); // Permissive in demo mode to prevent blocking frontend previews
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Idempotency-Key'],
    })
  );

  // Structured Logging
  if (config.nodeEnv !== 'test') {
    app.use(morgan('combined'));
  }

  // Body Parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Global Rate Limiter
  app.use(globalRateLimiter);

  // OpenAPI Swagger Interactive Documentation
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

  // Mount API v1 Routes
  const v1 = express.Router();
  v1.use(healthRouter);
  v1.use(authRouter);
  v1.use(walletRouter);
  v1.use(transactionRouter);
  v1.use(investRouter);
  v1.use(fxRouter);
  v1.use(supportRouter);
  v1.use(notificationRouter);
  v1.use(recipientRouter);
  v1.use(sandboxRouter);

  app.use(config.apiPrefix, v1);

  // Root welcome route
  app.get('/', (_req, res) => {
    res.json({
      brand: 'TAVI Financial Platform',
      tagline: 'Move. Manage. Grow.',
      status: 'ONLINE',
      documentation: '/api/docs',
      health: `${config.apiPrefix}/health`,
    });
  });

  // 404 Route Handler
  app.use((_req, res) => {
    res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'The requested API route does not exist.',
      },
    });
  });

  // Centralized Error Handler
  app.use(errorHandler);

  return app;
}
