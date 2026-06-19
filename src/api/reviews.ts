import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';

export const reviewsRouter = Router();

reviewsRouter.post('/', authenticate, validate(z.object({ tenantId: z.string(), rating: z.number().int().min(1).max(5), comment: z.string().optional().nullable() })), async (req: Request, _res: Response, next: NextFunction) => {
  try { _res.status(201).json(await prisma.review.create({ data: { ...req.body, customerId: req.user!.userId } })); } catch (e) { next(e); }
});

reviewsRouter.get('/tenant/:tenantId', async (req: Request, _res: Response, next: NextFunction) => {
  try {
    const reviews = await prisma.review.findMany({ where: { tenantId: req.params.tenantId }, include: { customer: { select: { name: true, avatar: true } } }, orderBy: { createdAt: 'desc' } });
    const avg = await prisma.review.aggregate({ where: { tenantId: req.params.tenantId }, _avg: { rating: true }, _count: true });
    _res.json({ reviews, average: avg._avg.rating ?? 0, total: avg._count });
  } catch (e) { next(e); }
});

reviewsRouter.put('/:id/reply', authenticate, async (req: Request, _res: Response, next: NextFunction) => {
  try { _res.json(await prisma.review.update({ where: { id: req.params.id }, data: { managerReply: req.body.managerReply } })); } catch (e) { next(e); }
});
