import { Request, Response, NextFunction } from 'express';
import { verifyToken, JwtPayload } from '../lib/jwt';
import { UnauthorizedError, ForbiddenError } from '../lib/errors';

declare global { namespace Express { interface Request { user?: JwtPayload; } } }

export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const h = req.headers.authorization;
  if (!h?.startsWith('Bearer ')) return next(new UnauthorizedError('Token não fornecido'));
  try { req.user = verifyToken(h.split(' ')[1]); next(); }
  catch { next(new UnauthorizedError('Token inválido')); }
}

export function authorize(...roles: string[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) return next(new UnauthorizedError());
    if (!roles.includes(req.user.role)) return next(new ForbiddenError());
    next();
  };
}
