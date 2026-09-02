import jwt, { JwtPayload } from 'jsonwebtoken';
import User from '../models/User.js';
import asyncHandler from '../utils/asyncHandler.js';
import type { AuthRequest } from '../types/index.js';
import type { Response, NextFunction } from 'express';

export const protect = asyncHandler(async (req: AuthRequest, res: Response, next: NextFunction) => {
  let token: string | undefined;

  // 1. Read token from HTTP-only cookie first (preferred)
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }
  // 2. Or fallback to Bearer token in Authorization header
  else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route, please log in',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretkey12345') as JwtPayload;
    const user = await User.findById(decoded.id).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'The user belonging to this token no longer exists',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired session, please log in again',
    });
  }
});
