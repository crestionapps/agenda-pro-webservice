import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { ValidationError } from '../lib/errors';

export function validate(schema: ZodSchema, src: 'body' | 'query' | 'params' = 'body') {
  return (req: Request, _res: Response, next: NextFunction) => {
    const r = schema.safeParse(req[src]);
    if (!r.success) return next(new ValidationError(r.error.issues.map(i => i.message).join(', ')));
    req[src] = r.data;
    next();
  };
}
