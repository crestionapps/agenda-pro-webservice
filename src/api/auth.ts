import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { signToken } from '../lib/jwt';
import { validate } from '../middleware/validate';
import { authenticate } from '../middleware/auth';
import { ConflictError, UnauthorizedError, NotFoundError } from '../lib/errors';

export const authRouter = Router();

authRouter.post('/register', validate(z.object({
  name: z.string().min(2), email: z.string().email(), password: z.string().min(6), phone: z.string().optional(),
})), async (req: Request, _res: Response, next: NextFunction) => {
  try {
    const { name, email, password, phone } = req.body;
    if (await prisma.user.findUnique({ where: { email } })) throw new ConflictError('Email já registado');
    const user = await prisma.user.create({ data: { name, email, password: await bcrypt.hash(password, 10), phone, role: 'CUSTOMER' } });
    const token = signToken({ userId: user.id, email: user.email, role: user.role, tenantId: user.tenantId });
    _res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (e) { next(e); }
});

authRouter.post('/login', validate(z.object({ email: z.string().email(), password: z.string().min(1) })), async (req: Request, _res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) throw new UnauthorizedError('Email ou senha inválidos');
    if (!user.isActive) throw new UnauthorizedError('Conta desativada');
    const token = signToken({ userId: user.id, email: user.email, role: user.role, tenantId: user.tenantId });
    _res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, tenantId: user.tenantId } });
  } catch (e) { next(e); }
});

authRouter.get('/me', authenticate, async (req: Request, _res: Response, next: NextFunction) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user!.userId }, include: { tenant: true } });
    if (!user) throw new NotFoundError('Utilizador');
    _res.json({ id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone, avatar: user.avatar, tenantId: user.tenantId, tenant: user.tenant });
  } catch (e) { next(e); }
});
