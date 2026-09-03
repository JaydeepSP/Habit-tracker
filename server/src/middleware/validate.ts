import type { Request, Response, NextFunction } from 'express';
import { ZodError, ZodType } from 'zod';

export const validate = (schema: ZodType<any>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      if (parsed.body) req.body = parsed.body;
      if (parsed.query) req.query = parsed.query;
      if (parsed.params) req.params = parsed.params;

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const issues = error.issues.map((issue) => ({
          field: issue.path.slice(1).join('.'),
          message: issue.message,
        }));

        return res.status(400).json({
          success: false,
          message: issues.map((i) => i.message).join(', ') || 'Validation error',
          errors: issues,
        });
      }

      next(error);
    }
  };
};
