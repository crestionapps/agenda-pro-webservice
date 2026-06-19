import { Request, Response, NextFunction } from 'express';
import { AppError } from '../lib/errors';

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) return res.status(err.statusCode).json({ error: err.message });
  console.error(err);
  res.status(500).json({ error: 'Erro interno' });
}
