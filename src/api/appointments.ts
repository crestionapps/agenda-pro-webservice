import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { NotFoundError, ConflictError, ValidationError } from '../lib/errors';

export const appointmentsRouter = Router();

function addMin(t: string, m: number): string {
  const [h, mn] = t.split(':').map(Number); const tot = h * 60 + mn + m;
  return `${String(Math.floor(tot / 60)).padStart(2, '0')}:${String(tot % 60).padStart(2, '0')}`;
}

appointmentsRouter.post('/', authenticate, validate(z.object({
  tenantId: z.string(), professionalId: z.string(), serviceId: z.string(),
  date: z.string().refine(v => !isNaN(Date.parse(v))), startTime: z.string().regex(/^\d{2}:\d{2}$/),
  notes: z.string().optional().nullable(),
})), async (req: Request, _res: Response, next: NextFunction) => {
  try {
    const { tenantId, professionalId, serviceId, date, startTime, notes } = req.body;
    const service = await prisma.service.findUnique({ where: { id: serviceId } });
    if (!service?.isActive) throw new ValidationError('Serviço indisponível');
    const { dayOfWeek } = { dayOfWeek: new Date(date).getDay() };
    const av = await prisma.availability.findUnique({ where: { professionalId_dayOfWeek: { professionalId, dayOfWeek } } });
    if (!av) throw new ValidationError('Profissional não disponível neste dia');
    const endTime = addMin(startTime, service.duration);
    if (startTime < av.startTime || endTime > av.endTime) throw new ValidationError('Fora do horário');
    const overlap = await prisma.appointment.findFirst({ where: { professionalId, date: new Date(date), status: { notIn: ['CANCELLED'] }, AND: [{ startTime: { lt: endTime } }, { endTime: { gt: startTime } }] } });
    if (overlap) throw new ConflictError('Já existe agendamento neste horário');
    const apt = await prisma.appointment.create({ data: { tenantId, customerId: req.user!.userId, professionalId, serviceId, date: new Date(date), startTime, endTime, notes } });
    _res.status(201).json(apt);
  } catch (e) { next(e); }
});

appointmentsRouter.get('/my', authenticate, async (req: Request, _res: Response, next: NextFunction) => {
  try {
    const { status, page = '1', limit = '20' } = req.query;
    const where: any = { customerId: req.user!.userId };
    if (status) where.status = status;
    _res.json(await prisma.appointment.findMany({ where, include: { tenant: { select: { id: true, name: true, slug: true, logo: true } }, professional: { select: { id: true, name: true, photo: true } }, service: { select: { id: true, name: true, duration: true, price: true } } }, orderBy: { date: 'desc' }, skip: (parseInt(page as string) - 1) * parseInt(limit as string), take: parseInt(limit as string) }));
  } catch (e) { next(e); }
});

appointmentsRouter.get('/tenant/:tenantId', authenticate, async (req: Request, _res: Response, next: NextFunction) => {
  try {
    const { status, date, professionalId, page = '1', limit = '50' } = req.query;
    const where: any = { tenantId: req.params.tenantId };
    if (status) where.status = status; if (date) where.date = new Date(date as string); if (professionalId) where.professionalId = professionalId;
    _res.json(await prisma.appointment.findMany({ where, include: { customer: { select: { id: true, name: true, email: true, phone: true } }, professional: { select: { id: true, name: true, photo: true } }, service: { select: { id: true, name: true, duration: true, price: true } } }, orderBy: [{ date: 'asc' }, { startTime: 'asc' }] }));
  } catch (e) { next(e); }
});

appointmentsRouter.get('/availability', async (req: Request, _res: Response, next: NextFunction) => {
  try {
    const { professionalId, date } = req.query;
    if (!professionalId || !date) throw new ValidationError('professionalId e date obrigatórios');
    const d = new Date(date as string);
    const av = await prisma.availability.findUnique({ where: { professionalId_dayOfWeek: { professionalId: professionalId as string, dayOfWeek: d.getDay() } } });
    if (!av) return _res.json({ slots: [] });
    const appointments = await prisma.appointment.findMany({ where: { professionalId: professionalId as string, date: d, status: { notIn: ['CANCELLED'] } }, orderBy: { startTime: 'asc' } });
    const [sh, sm] = av.startTime.split(':').map(Number); const [eh, em] = av.endTime.split(':').map(Number);
    const startM = sh * 60 + sm, endM = eh * 60 + em;
    const busy = appointments.map(a => ({ start: a.startTime, end: a.endTime }));
    const slots: { time: string }[] = [];
    for (let m = startM; m < endM; m += 15) {
      const t = `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
      if (!busy.some(b => t >= b.start && t < b.end)) slots.push({ time: t });
    }
    _res.json({ slots });
  } catch (e) { next(e); }
});

appointmentsRouter.put('/:id/status', authenticate, async (req: Request, _res: Response, next: NextFunction) => {
  try {
    const { status, reason } = req.body;
    const data: any = { status };
    if (status === 'CANCELLED') { data.cancelledAt = new Date(); data.cancelReason = reason || null; }
    _res.json(await prisma.appointment.update({ where: { id: req.params.id }, data }));
  } catch (e) { next(e); }
});
