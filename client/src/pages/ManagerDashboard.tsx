import { useState, useEffect } from 'react'; import { api } from '../lib/api'; import { useAuth } from '../contexts/AuthContext';
const sc: Record<string, string> = { SCHEDULED: 'bg-blue-100 text-blue-800', CONFIRMED: 'bg-green-100 text-green-800', CANCELLED: 'bg-red-100 text-red-800', COMPLETED: 'bg-gray-100 text-gray-800', NO_SHOW: 'bg-yellow-100 text-yellow-800' };
const sl: Record<string, string> = { SCHEDULED: 'Agendado', CONFIRMED: 'Confirmado', CANCELLED: 'Cancelado', COMPLETED: 'Realizado', NO_SHOW: 'Não compareceu' };
export default function ManagerDashboard() {
  const { user } = useAuth(); const tid = user?.tenantId;
  const [appts, setAppts] = useState<any[]>([]); const [stats, setStats] = useState<any>(null); const [date, setDate] = useState(new Date().toISOString().split('T')[0]); const [loading, setLoading] = useState(true);
  useEffect(() => { if (!tid) return; Promise.all([api.get(`/api/appointments/tenant/${tid}?date=${date}`), api.get(`/api/tenants/${tid}/stats`)]).then(([a, s]) => { setAppts(a); setStats(s); }).finally(() => setLoading(false)); }, [tid, date]);
  const upd = async (id: string, status: string) => { await api.put(`/api/appointments/${id}/status`, { status }); setAppts(appts.map(a => a.id === id ? { ...a, status } : a)); };
  if (loading) return <div className="text-center py-20">A carregar...</div>; if (!tid) return <div className="text-center py-20">Sem negócio associado</div>;
  return (<div className="max-w-7xl mx-auto px-4 py-8"><h1 className="text-2xl font-bold mb-6">Gestão de Agendamentos</h1>
    {stats && <div className="grid grid-cols-3 gap-4 mb-6"><div className="card p-4"><p className="text-2xl font-bold text-coral-500">{stats.totalAppointments}</p><p className="text-sm text-gray-500">Total</p></div><div className="card p-4"><p className="text-2xl font-bold text-green-600">{stats.monthlyAppointments}</p><p className="text-sm text-gray-500">Este mês</p></div><div className="card p-4"><p className="text-2xl font-bold text-blue-600">{stats.totalProfessionals}</p><p className="text-sm text-gray-500">Profissionais</p></div></div>}
    <div className="card p-6"><div className="flex justify-between mb-4"><h2 className="font-semibold">Agendamentos</h2><input type="date" value={date} onChange={e => setDate(e.target.value)} className="border rounded-lg px-3 py-1 text-sm" /></div>
    <table className="w-full text-sm">{appts.map(a => <tr key={a.id} className="border-b"><td className="py-2">{a.startTime}</td><td>{a.customer?.name}</td><td>{a.professional?.name}</td><td>{a.service?.name}</td><td><span className={`px-2 py-0.5 rounded-full text-xs ${sc[a.status]}`}>{sl[a.status]}</span></td>
    <td>{a.status === 'SCHEDULED' && <><button onClick={() => upd(a.id, 'CONFIRMED')} className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs mr-1">Confirmar</button><button onClick={() => upd(a.id, 'CANCELLED')} className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs">Cancelar</button></>}{a.status === 'CONFIRMED' && <button onClick={() => upd(a.id, 'COMPLETED')} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">Concluir</button>}</td></tr>)}</table></div>
  </div>);
}
