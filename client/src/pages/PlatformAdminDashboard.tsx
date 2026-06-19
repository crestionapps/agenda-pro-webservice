import { useState, useEffect } from 'react'; import { api } from '../lib/api';
export default function PlatformAdminDashboard() {
  const [data, setData] = useState<any>(null); const [loading, setLoading] = useState(true);
  useEffect(() => { api.get('/api/admin/dashboard').then(setData).finally(() => setLoading(false)); }, []);
  if (loading) return <div className="text-center py-20">A carregar...</div>; if (!data) return <div className="text-center py-20">Erro</div>;
  const { kpis, tenantsByType, appointmentsByStatus, recentAppointments, topTenants } = data;
  return (<div className="max-w-7xl mx-auto px-4 py-8"><h1 className="text-2xl font-bold mb-6">Admin Plataforma</h1>
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
      {[{ label: 'Negócios', value: kpis.totalTenants, color: 'text-coral-500' }, { label: 'Ativos', value: kpis.activeTenants, color: 'text-green-600' }, { label: 'Utilizadores', value: kpis.totalUsers, color: 'text-blue-600' }, { label: 'Profissionais', value: kpis.totalProfessionals, color: 'text-purple-600' }, { label: 'Agendamentos', value: kpis.totalAppointments, color: 'text-orange-600' }].map(k => <div key={k.label} className="card p-4"><p className={`text-2xl font-bold ${k.color}`}>{k.value}</p><p className="text-xs text-gray-500">{k.label}</p></div>)}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      <div className="card p-6"><h2 className="font-semibold mb-4">Negócios por Tipo</h2>{tenantsByType?.map((t: any) => <div key={t.type} className="flex justify-between items-center py-1"><span>{t.type}</span><span className="font-semibold">{t._count}</span></div>)}</div>
      <div className="card p-6"><h2 className="font-semibold mb-4">Agendamentos por Status</h2>{appointmentsByStatus?.map((s: any) => <div key={s.status} className="flex justify-between items-center py-1"><span>{s.status}</span><span className="font-semibold">{s.count}</span></div>)}</div>
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="card p-6"><h2 className="font-semibold mb-4">Top Negócios</h2>{topTenants?.slice(0, 5).map((t: any) => <div key={t.id} className="flex justify-between items-center py-2 border-b last:border-0"><span className="font-medium">{t.name}</span><span className="text-sm text-gray-500">{t.appointmentCount} agendamentos</span></div>)}</div>
      <div className="card p-6"><h2 className="font-semibold mb-4">Últimos Agendamentos</h2>{recentAppointments?.map((a: any) => <div key={a.id} className="flex justify-between py-1 text-sm border-b last:border-0"><span>{a.customer?.name} - {a.tenant?.name}</span><span className="text-gray-400">{new Date(a.createdAt).toLocaleDateString('pt-PT')}</span></div>)}</div>
    </div>
  </div>);
}
