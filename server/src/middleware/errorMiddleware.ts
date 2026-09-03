import type { Request, Response, NextFunction } from 'express';
import createHttpError from 'http-errors';
import logger from '../utils/logger.js';

export const notFound = (req: Request, res: Response, next: NextFunction) => {
  next(createHttpError(404, `Not Found - ${req.originalUrl}`));
};

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) => {
  let statusCode: number = err?.status || err?.statusCode || (res.statusCode === 200 ? 500 : res.statusCode);
  let message: string = err?.message || 'Internal Server Error';

  // Mongoose Bad ObjectId CastError
  if (err.name === 'CastError') {
    message = `Resource not found with id of ${err.value}`;
    statusCode = 404;
  }

  // Mongoose Duplicate Key Error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue ?? {})[0];
    message = `Duplicate field value entered: ${field}. Please use another value!`;
    statusCode = 409;
  }

  // Mongoose Validation Error
  if (err.name === 'ValidationError') {
    message = Object.values(err.errors as Record<string, { message: string }>)
      .map((val) => val.message)
      .join(', ');
    statusCode = 400;
  }

  // JWT Errors
  if (err.name === 'JsonWebTokenError') {
    message = 'Invalid token, please log in again';
    statusCode = 401;
  }

  if (err.name === 'TokenExpiredError') {
    message = 'Your token has expired! Please log in again.';
    statusCode = 401;
  }

  if (statusCode >= 500) {
    logger.error({ err, path: req.originalUrl, method: req.method }, message);
  } else {
    logger.warn({ status: statusCode, path: req.originalUrl, method: req.method }, message);
  }

  res.status(statusCode).json({
    success: false,
    message,
    errors: err.errors || undefined,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

