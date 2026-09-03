import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import connectDB from './config/db.js';
import { logger } from './utils/logger.js';

// Connect to MongoDB
connectDB();

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  logger.info(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: unknown) => {
  const message = err instanceof Error ? err.message : String(err);
  logger.fatal({ err }, `Unhandled Rejection: ${message}`);
  server.close(() => process.exit(1));
});

