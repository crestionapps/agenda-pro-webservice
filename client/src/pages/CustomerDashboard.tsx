import { useState, useEffect } from 'react'; import { Link } from 'react-router-dom'; import { api } from '../lib/api';
const statusColors: Record<string, string> = { SCHEDULED: 'bg-blue-100 text-blue-800', CONFIRMED: 'bg-green-100 text-green-800', CANCELLED: 'bg-red-100 text-red-800', COMPLETED: 'bg-gray-100 text-gray-800', NO_SHOW: 'bg-yellow-100 text-yellow-800' };
const statusLabels: Record<string, string> = { SCHEDULED: 'Agendado', CONFIRMED: 'Confirmado', CANCELLED: 'Cancelado', COMPLETED: 'Realizado', NO_SHOW: 'Não compareceu' };
export default function CustomerDashboard() {
  const [appts, setAppts] = useState<any[]>([]); const [loading, setLoading] = useState(true);
  useEffect(() => { api.get('/api/appointments/my').then(setAppts).finally(() => setLoading(false)); }, []);
  const cancel = async (id: string) => { if (!confirm('Cancelar agendamento?')) return; await api.put(`/api/appointments/${id}/status`, { status: 'CANCELLED', reason: 'Cancelado pelo cliente' }); setAppts(appts.map(a => a.id === id ? { ...a, status: 'CANCELLED' } : a)); };
  return (<div className="max-w-4xl mx-auto px-4 py-8"><h1 className="text-2xl font-bold mb-6">Os meus agendamentos</h1>
    {loading ? <div className="text-center py-12 text-gray-500">A carregar...</div> : appts.length === 0 ? <div className="text-center py-12"><p className="text-gray-500 mb-4">Ainda não tens agendamentos.</p><Link to="/" className="btn-primary">Explorar negócios</Link></div> :
    <div className="space-y-4">{appts.map(a => <div key={a.id} className="card p-4"><div className="flex justify-between"><div><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[a.status]}`}>{statusLabels[a.status]}</span><p className="font-semibold mt-1">{a.tenant?.name}</p><p className="text-sm text-gray-500">{a.professional?.name} - {a.service?.name}<br />{new Date(a.date).toLocaleDateString('pt-PT')} às {a.startTime}</p></div>{a.status === 'SCHEDULED' && <button onClick={() => cancel(a.id)} className="text-sm text-red-500">Cancelar</button>}</div></div>)}</div>}
  </div>);
}
