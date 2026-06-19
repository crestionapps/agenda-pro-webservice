import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { NotFoundError } from '../lib/errors';

export const professionalsRouter = Router();

const schema = z.object({ name: z.string().min(2), email: z.string().email().optional().nullable(), phone: z.string().optional().nullable(), bio: z.string().optional().nullable(), photo: z.string().optional().nullable(), specialties: z.array(z.string()).default([]) });

professionalsRouter.get('/tenant/:tenantId', async (req: Request, _res: Response, next: NextFunction) => {
  try { _res.json(await prisma.professional.findMany({ where: { tenantId: req.params.tenantId, isActive: true }, include: { availabilities: true, _count: { select: { appointments: true } } }, orderBy: { name: 'asc' } })); } catch (e) { next(e); }
});

professionalsRouter.get('/:id', async (req: Request, _res: Response, next: NextFunction) => {
  try {
    const p = await prisma.professional.findUnique({ where: { id: req.params.id }, include: { availabilities: true } });
    if (!p) throw new NotFoundError('Profissional');
    _res.json(p);
  } catch (e) { next(e); }
});

professionalsRouter.post('/tenant/:tenantId', authenticate, validate(schema), async (req: Request, _res: Response, next: NextFunction) => {
  try { _res.status(201).json(await prisma.professional.create({ data: { ...req.body, tenantId: req.params.tenantId } })); } catch (e) { next(e); }
});

professionalsRouter.put('/:id', authenticate, async (req: Request, _res: Response, next: NextFunction) => {
  try { _res.json(await prisma.professional.update({ where: { id: req.params.id }, data: req.body })); } catch (e) { next(e); }
});

professionalsRouter.delete('/:id', authenticate, async (req: Request, _res: Response, next: NextFunction) => {
  try { _res.json(await prisma.professional.update({ where: { id: req.params.id }, data: { isActive: false } })); } catch (e) { next(e); }
});

professionalsRouter.put('/:id/availability', authenticate, async (req: Request, _res: Response, next: NextFunction) => {
  try {
    await prisma.availability.deleteMany({ where: { professionalId: req.params.id } });
    await prisma.availability.createMany({ data: req.body.availabilities.map((a: any) => ({ ...a, professionalId: req.params.id })) });
    _res.json({ success: true });
  } catch (e) { next(e); }
});

professionalsRouter.get('/:id/availability', async (req: Request, _res: Response, next: NextFunction) => {
  try { _res.json(await prisma.availability.findMany({ where: { professionalId: req.params.id }, orderBy: { dayOfWeek: 'asc' } })); } catch (e) { next(e); }
});
