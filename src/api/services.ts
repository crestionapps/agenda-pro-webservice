import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';

export const servicesRouter = Router();

const schema = z.object({ name: z.string().min(2), description: z.string().optional().nullable(), category: z.string().optional().nullable(), duration: z.number().int().min(5), price: z.number().min(0), professionalIds: z.array(z.string()).optional().default([]) });

servicesRouter.get('/tenant/:tenantId', async (req: Request, _res: Response, next: NextFunction) => {
  try {
    const svcs = await prisma.service.findMany({ where: { tenantId: req.params.tenantId, isActive: true }, include: { serviceProfessionals: { include: { professional: { select: { id: true, name: true, photo: true } } } } }, orderBy: [{ category: 'asc' }, { name: 'asc' }] });
    _res.json(svcs.map(s => ({ ...s, professionals: s.serviceProfessionals.map(sp => sp.professional), serviceProfessionals: undefined })));
  } catch (e) { next(e); }
});

servicesRouter.get('/:id', async (req: Request, _res: Response, next: NextFunction) => {
  try {
    const s = await prisma.service.findUnique({ where: { id: req.params.id }, include: { serviceProfessionals: { include: { professional: { select: { id: true, name: true, photo: true } } } } } });
    _res.json({ ...s, professionals: s?.serviceProfessionals.map(sp => sp.professional), serviceProfessionals: undefined });
  } catch (e) { next(e); }
});

servicesRouter.post('/tenant/:tenantId', authenticate, validate(schema), async (req: Request, _res: Response, next: NextFunction) => {
  try {
    const { professionalIds, ...data } = req.body;
    const s = await prisma.service.create({ data: { ...data, tenantId: req.params.tenantId, serviceProfessionals: { create: professionalIds.map((p: string) => ({ professionalId: p })) } } });
    _res.status(201).json(s);
  } catch (e) { next(e); }
});

servicesRouter.put('/:id', authenticate, async (req: Request, _res: Response, next: NextFunction) => {
  try {
    const { professionalIds, ...data } = req.body;
    if (professionalIds) { await prisma.serviceProfessional.deleteMany({ where: { serviceId: req.params.id } }); await prisma.serviceProfessional.createMany({ data: professionalIds.map((p: string) => ({ serviceId: req.params.id, professionalId: p })) }); }
    _res.json(await prisma.service.update({ where: { id: req.params.id }, data }));
  } catch (e) { next(e); }
});

servicesRouter.delete('/:id', authenticate, async (req: Request, _res: Response, next: NextFunction) => {
  try { _res.json(await prisma.service.update({ where: { id: req.params.id }, data: { isActive: false } })); } catch (e) { next(e); }
});
