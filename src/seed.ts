import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const pwd = await bcrypt.hash('123456', 10);

  await prisma.user.upsert({ where: { email: 'admin@plataforma.pt' }, update: {}, create: { name: 'Admin Plataforma', email: 'admin@plataforma.pt', password: pwd, role: 'SUPER_ADMIN' } });
  console.log('Super admin: admin@plataforma.pt / 123456');

  const tenants = await Promise.all([
    prisma.tenant.upsert({ where: { slug: 'barbearia-classica' }, update: {}, create: { name: 'Barbearia Clássica', slug: 'barbearia-classica', type: 'BARBERSHOP', description: 'A melhor barbearia da cidade', address: 'Rua Principal, 123, Lisboa', phone: '912345678', email: 'info@barbeariaclassica.pt' } }),
    prisma.tenant.upsert({ where: { slug: 'spa-bem-estar' }, update: {}, create: { name: 'Spa Bem-Estar', slug: 'spa-bem-estar', type: 'SPA', description: 'Relaxamento e cuidados pessoais', address: 'Av. Liberdade, 456, Lisboa', phone: '913456789', email: 'info@spabemestar.pt' } }),
    prisma.tenant.upsert({ where: { slug: 'salon-charme' }, update: {}, create: { name: 'Salon Charme', slug: 'salon-charme', type: 'HAIRDRESSER', description: 'Cabelo e estética', address: 'Rua Flores, 789, Porto', phone: '914567890', email: 'info@saloncharme.pt' } }),
  ]);

  for (const t of tenants) {
    await prisma.user.upsert({ where: { email: `gerente@${t.slug}.pt` }, update: {}, create: { name: `Gerente ${t.name}`, email: `gerente@${t.slug}.pt`, password: pwd, role: 'MANAGER', tenantId: t.id } });
    console.log(`Gerente: gerente@${t.slug}.pt / 123456`);

    const profs = await Promise.all([1, 2, 3].map(i => prisma.professional.create({
      data: { name: `Profissional ${i}`, email: `prof${i}@${t.slug}.pt`, phone: `91${i}0000000`, specialties: t.type === 'BARBERSHOP' ? ['Corte', 'Barba'] : t.type === 'SPA' ? ['Massagem', 'Facial'] : ['Corte', 'Coloração'], tenantId: t.id },
    })));

    for (const p of profs) {
      for (let d = 1; d <= 5; d++) await prisma.availability.create({ data: { professionalId: p.id, dayOfWeek: d, startTime: '09:00', endTime: '18:00' } });
    }
    for (let d = 1; d <= 6; d++) await prisma.businessHour.create({ data: { tenantId: t.id, dayOfWeek: d, openTime: '09:00', closeTime: '19:00', isOpen: d <= 5 } });

    const svcs = t.type === 'BARBERSHOP'
      ? [{ name: 'Corte de Cabelo', category: 'Corte', duration: 30, price: 15 }, { name: 'Barba', category: 'Barba', duration: 20, price: 10 }, { name: 'Corte + Barba', category: 'Combo', duration: 45, price: 22 }]
      : t.type === 'SPA'
        ? [{ name: 'Massagem Relaxante', category: 'Massagem', duration: 60, price: 40 }, { name: 'Tratamento Facial', category: 'Facial', duration: 45, price: 35 }, { name: 'Manicure', category: 'Mãos', duration: 30, price: 20 }]
        : [{ name: 'Corte', category: 'Corte', duration: 30, price: 15 }, { name: 'Coloração', category: 'Cor', duration: 90, price: 50 }, { name: 'Hidratação', category: 'Tratamento', duration: 60, price: 30 }];

    for (const svc of svcs) {
      const created = await prisma.service.create({ data: { ...svc, tenantId: t.id } });
      for (const p of profs) await prisma.serviceProfessional.create({ data: { serviceId: created.id, professionalId: p.id } });
    }
  }

  const plan = await prisma.subscriptionPlan.upsert({ where: { id: 'basic' }, update: {}, create: { id: 'basic', name: 'Básico', description: '100 SMS, 200 Email, 50 WhatsApp', price: 19.90, smsLimit: 100, emailLimit: 200, whatsappLimit: 50 } });
  for (const t of tenants) await prisma.tenantSubscription.upsert({ where: { tenantId: t.id }, update: {}, create: { tenantId: t.id, planId: plan.id, smsRemaining: plan.smsLimit, emailRemaining: plan.emailLimit, whatsappRemaining: plan.whatsappLimit } });

  await prisma.user.upsert({ where: { email: 'cliente@teste.pt' }, update: {}, create: { name: 'Cliente Teste', email: 'cliente@teste.pt', password: pwd, phone: '910000000' } });
  console.log('Cliente: cliente@teste.pt / 123456');
}

main().catch(console.error).finally(() => prisma.$disconnect());
