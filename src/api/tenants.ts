import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { NotFoundError, ConflictError } from '../lib/errors';

export const tenantsRouter = Router();

tenantsRouter.get('/', async (req: Request, _res: Response, next: NextFunction) => {
  try {
    const { search, type, page = '1', limit = '20' } = req.query;
    const where: any = { isActive: true };
    if (search) where.OR = [{ name: { contains: search as string, mode: 'insensitive' } }, { address: { contains: search as string, mode: 'insensitive' } }, { description: { contains: search as string, mode: 'insensitive' } }];
    if (type) where.type = type;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const [tenants, total] = await Promise.all([
      prisma.tenant.findMany({ where, skip, take: parseInt(limit as string), orderBy: { name: 'asc' }, include: { _count: { select: { reviews: true, professionals: true } } } }),
      prisma.tenant.count({ where }),
    ]);
    _res.json({ tenants: tenants.map(t => ({ ...t, reviewCount: t._count.reviews, professionalCount: t._count.professionals, _count: undefined })), total, page: parseInt(page as string), totalPages: Math.ceil(total / parseInt(limit as string)) });
  } catch (e) { next(e); }
});

tenantsRouter.get('/:slug', async (req: Request, _res: Response, next: NextFunction) => {
  try {
    const tenant = await prisma.tenant.findUnique({
      where: { slug: req.params.slug },
      include: {
        professionals: { where: { isActive: true }, include: { serviceProfessionals: { include: { service: { select: { id: true, name: true, category: true } } } } } },
        services: { where: { isActive: true }, include: { serviceProfessionals: { include: { professional: { select: { id: true, name: true, photo: true } } } } }, orderBy: [{ category: 'asc' }, { name: 'asc' }] },
        businessHours: { orderBy: { dayOfWeek: 'asc' } },
        reviews: { include: { customer: { select: { name: true, avatar: true } } }, orderBy: { createdAt: 'desc' }, take: 20 },
      },
    });
    if (!tenant) throw new NotFoundError('Negócio');
    _res.json({
      ...tenant,
      services: tenant.services.map(s => ({ ...s, professionals: s.serviceProfessionals.map(sp => sp.professional), serviceProfessionals: undefined })),
      professionals: tenant.professionals.map(p => ({ ...p, services: p.serviceProfessionals.map(sp => sp.service), serviceProfessionals: undefined })),
    });
  } catch (e) { next(e); }
});

tenantsRouter.put('/:tenantId', authenticate, async (req: Request, _res: Response, next: NextFunction) => {
  try { _res.json(await prisma.tenant.update({ where: { id: req.params.tenantId }, data: req.body })); } catch (e) { next(e); }
});

tenantsRouter.get('/:tenantId/stats', authenticate, async (req: Request, _res: Response, next: NextFunction) => {
  try {
    const { tenantId } = req.params;
    const [totalAppointments, monthlyAppointments, totalProfessionals, customers] = await Promise.all([
      prisma.appointment.count({ where: { tenantId } }),
      prisma.appointment.count({ where: { tenantId, createdAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } } }),
      prisma.professional.count({ where: { tenantId, isActive: true } }),
      prisma.appointment.groupBy({ by: ['customerId'], where: { tenantId }, _count: true }),
    ]);
    _res.json({ totalAppointments, monthlyAppointments, totalProfessionals, totalCustomers: customers.length });
  } catch (e) { next(e); }
});
