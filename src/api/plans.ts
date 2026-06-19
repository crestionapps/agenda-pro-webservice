import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { NotFoundError, ValidationError } from '../lib/errors';

export const plansRouter = Router();

plansRouter.get('/', async (_req: Request, _res: Response, next: NextFunction) => {
  try { _res.json(await prisma.subscriptionPlan.findMany({ where: { isActive: true }, orderBy: { price: 'asc' } })); } catch (e) { next(e); }
});

plansRouter.post('/', authenticate, authorize('SUPER_ADMIN'), validate(z.object({ name: z.string().min(2), description: z.string().optional().nullable(), price: z.number().min(0), smsLimit: z.number().int().min(0).default(0), emailLimit: z.number().int().min(0).default(0), whatsappLimit: z.number().int().min(0).default(0) })), async (req: Request, _res: Response, next: NextFunction) => {
  try { _res.status(201).json(await prisma.subscriptionPlan.create({ data: req.body })); } catch (e) { next(e); }
});

plansRouter.get('/tenant/:tenantId', authenticate, async (req: Request, _res: Response, next: NextFunction) => {
  try {
    const sub = await prisma.tenantSubscription.findUnique({ where: { tenantId: req.params.tenantId }, include: { plan: true } });
    if (!sub) return _res.json({ hasSubscription: false, plan: null, quotas: { sms: 0, email: 0, whatsapp: 0 } });
    _res.json({ hasSubscription: true, plan: sub.plan, isActive: sub.isActive, quotas: { sms: { used: sub.plan.smsLimit - sub.smsRemaining, remaining: sub.smsRemaining, total: sub.plan.smsLimit }, email: { used: sub.plan.emailLimit - sub.emailRemaining, remaining: sub.emailRemaining, total: sub.plan.emailLimit }, whatsapp: { used: sub.plan.whatsappLimit - sub.whatsappRemaining, remaining: sub.whatsappRemaining, total: sub.plan.whatsappLimit } } });
  } catch (e) { next(e); }
});
