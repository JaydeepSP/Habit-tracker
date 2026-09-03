import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pinoHttp = require('pino-http') as typeof import('pino-http');
import swaggerUi from 'swagger-ui-express';
import { logger } from './utils/logger.js';
import { swaggerDocument } from './config/swagger.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import { apiLimiter } from './middleware/rateLimiter.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import habitRoutes from './routes/habitRoutes.js';
import completionRoutes from './routes/completionRoutes.js';
import statsRoutes from './routes/statsRoutes.js';
import userRoutes from './routes/userRoutes.js';

const app = express();

// Structured HTTP Request Logging — pino-http loaded via CJS interop
const httpLoggerMw = (pinoHttp as any).default ?? pinoHttp;
app.use(
  httpLoggerMw({
    logger,
    autoLogging: {
      ignore: (req: any) => req.url === '/api/health',
    },
  })
);

// Security HTTP headers
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

// CORS configuration for cookies & frontend communication
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(null, true); // Allow dev origins seamlessly
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// Body and cookie parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser(process.env.COOKIE_SECRET || 'cookie_secret_fallback'));

// Interactive API Documentation (Swagger / OpenAPI)
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Apply rate limiting to all standard API routes
app.use('/api', apiLimiter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'online',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/habits', habitRoutes);
app.use('/api/completions', completionRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/users', userRoutes);

// 404 & Error Handlers
app.use(notFound);
app.use(errorHandler);

export default app;

