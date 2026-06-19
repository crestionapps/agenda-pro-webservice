import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, authorize } from '../middleware/auth';

export const adminRouter = Router();

adminRouter.get('/dashboard', authenticate, authorize('SUPER_ADMIN'), async (_req: Request, _res: Response, next: NextFunction) => {
  try {
    const now = new Date(); const startMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const [totalTenants, activeTenants, totalUsers, totalProfessionals, totalAppts, monthAppts, tenantsByType, apptsByStatus, recent, top] = await Promise.all([
      prisma.tenant.count(), prisma.tenant.count({ where: { isActive: true } }), prisma.user.count(), prisma.professional.count(),
      prisma.appointment.count(), prisma.appointment.count({ where: { createdAt: { gte: startMonth } } }),
      prisma.tenant.groupBy({ by: ['type'], _count: true }),
      prisma.appointment.groupBy({ by: ['status'], _count: true }),
      prisma.appointment.findMany({ take: 10, orderBy: { createdAt: 'desc' }, include: { tenant: { select: { name: true } }, customer: { select: { name: true } }, service: { select: { name: true, price: true } } } }),
      prisma.appointment.groupBy({ by: ['tenantId'], _count: true, orderBy: { _count: { id: 'desc' } }, take: 10 }).then(async g => {
        const ts = await prisma.tenant.findMany({ where: { id: { in: g.map(x => x.tenantId) } }, select: { id: true, name: true, slug: true, type: true, logo: true } });
        return g.map(x => ({ ...ts.find(t => t.id === x.tenantId), appointmentCount: x._count }));
      }),
    ]);
    _res.json({ kpis: { totalTenants, activeTenants, totalUsers, totalProfessionals, totalAppointments: totalAppts, monthlyAppointments: monthAppts }, tenantsByType, appointmentsByStatus: apptsByStatus.map(a => ({ status: a.status, count: a._count })), recentAppointments: recent, topTenants: top });
  } catch (e) { next(e); }
});
