import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { ValidationError } from '../lib/errors';

export const notificationsRouter = Router();

notificationsRouter.post('/send/:tenantId', authenticate, validate(z.object({ type: z.enum(['SMS', 'EMAIL', 'WHATSAPP']), recipient: z.string().min(1), message: z.string().min(1) })), async (req: Request, _res: Response, next: NextFunction) => {
  try {
    const { type, recipient } = req.body; const { tenantId } = req.params;
    const sub = await prisma.tenantSubscription.findUnique({ where: { tenantId }, include: { plan: true } });
    if (!sub?.isActive) throw new ValidationError('Sem subscrição ativa');
    const field = type === 'SMS' ? 'smsRemaining' : type === 'EMAIL' ? 'emailRemaining' : 'whatsappRemaining';
    if ((sub as any)[field] <= 0) throw new ValidationError(`Cota de ${type} esgotada`);
    await prisma.$transaction([prisma.tenantSubscription.update({ where: { tenantId }, data: { [field]: { decrement: 1 } } }), prisma.notificationLog.create({ data: { tenantId, type, recipient, status: 'SENT' } })]);
    _res.json({ success: true });
  } catch (e) { next(e); }
});
