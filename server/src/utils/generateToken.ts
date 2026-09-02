import jwt from 'jsonwebtoken';
import type { Response } from 'express';
import type { IUserDoc } from '../types/index.js';

export const generateToken = (id: string): string => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'secretkey12345',
    { expiresIn: (process.env.JWT_EXPIRE || '30d') as jwt.SignOptions['expiresIn'] }
  );
};

export const sendTokenResponse = (user: IUserDoc, statusCode: number, res: Response): void => {
  const token = generateToken(user._id.toString());

  const cookieExpireDays = parseInt(process.env.COOKIE_EXPIRE || '30', 10);
  const options = {
    expires: new Date(Date.now() + cookieExpireDays * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: (process.env.NODE_ENV === 'production' ? 'none' : 'lax') as 'none' | 'lax' | 'strict',
  };

  // Remove password before outputting
  const userObj = user.toObject ? user.toObject() : { ...user };
  delete (userObj as any).password;
  delete (userObj as any).resetPasswordToken;
  delete (userObj as any).resetPasswordExpire;

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      data: {
        user: userObj,
      },
    });
};
