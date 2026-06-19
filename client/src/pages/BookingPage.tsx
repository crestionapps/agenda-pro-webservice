import { useState, useEffect, useMemo } from 'react'; import { useParams, useNavigate } from 'react-router-dom'; import { api } from '../lib/api'; import { useAuth } from '../contexts/AuthContext';
export default function BookingPage() {
  const { slug } = useParams(); const { user } = useAuth(); const navigate = useNavigate();
  const [tenant, setTenant] = useState<any>(null); const [profi, setProfi] = useState(''); const [svci, setSvci] = useState(''); const [date, setDate] = useState(''); const [slots, setSlots] = useState<any[]>([]); const [time, setTime] = useState(''); const [loading, setLoading] = useState(true); const [submitting, setSubmitting] = useState(false); const [error, setError] = useState(''); const [success, setSuccess] = useState(false);
  useEffect(() => { api.get(`/api/tenants/${slug}`).then(t => { setTenant(t); setLoading(false); }); }, [slug]);
  useEffect(() => { if (profi && date) api.get(`/api/appointments/availability?professionalId=${profi}&date=${date}`).then(d => setSlots(d.slots || [])).catch(() => setSlots([])); else setSlots([]); }, [profi, date]);
  useEffect(() => { setTime(''); }, [profi, svci, date]);
  const profsForSvc = useMemo(() => { if (!svci || !tenant?.services) return tenant?.professionals || []; const s = tenant.services.find((x: any) => x.id === svci); return s?.professionals || []; }, [svci, tenant]);
  const today = new Date().toISOString().split('T')[0];
  const handle = async () => { if (!user) { navigate('/login'); return; } setError(''); setSubmitting(true); try { await api.post('/api/appointments', { tenantId: tenant.id, professionalId: profi, serviceId: svci, date, startTime: time }); setSuccess(true); } catch (err: any) { setError(err.message); } finally { setSubmitting(false); } };
  if (loading) return <div className="text-center py-20 text-gray-500">A carregar...</div>; if (!tenant) return <div className="text-center py-20 text-gray-500">Negócio não encontrado</div>;
  if (success) return <div className="max-w-lg mx-auto px-4 py-20 text-center"><div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"><span className="text-3xl text-green-600">✓</span></div><h1 className="text-2xl font-bold mb-2">Agendamento Confirmado!</h1><button onClick={() => navigate('/cliente')} className="btn-primary mt-4">Ver meus agendamentos</button></div>;
  const selSvc = tenant.services?.find((s: any) => s.id === svci);
  return (<div className="max-w-2xl mx-auto px-4 py-8">
    <h1 className="text-2xl font-bold mb-4">Agendar em {tenant.name}</h1>
    {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm mb-4">⚠️ {error}</div>}
    <div className="card p-6 space-y-5">
      <div><label className="block font-medium text-sm mb-1">Serviço</label><select value={svci} onChange={e => { setSvci(e.target.value); setProfi(''); }} className="w-full border rounded-xl px-4 py-2.5"><option value="">Selecionar</option>{tenant.services?.map((s: any) => <option key={s.id} value={s.id}>{s.name} — {s.duration}min — {s.price.toFixed(2)}€</option>)}</select></div>
      <div><label className="block font-medium text-sm mb-1">Profissional</label><select value={profi} onChange={e => setProfi(e.target.value)} className="w-full border rounded-xl px-4 py-2.5"><option value="">Selecionar</option>{(svci ? profsForSvc : tenant.professionals)?.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
      <div><label className="block font-medium text-sm mb-1">Data</label><input type="date" value={date} min={today} onChange={e => setDate(e.target.value)} className="w-full border rounded-xl px-4 py-2.5" /></div>
      {slots.length > 0 && <div><label className="block font-medium text-sm mb-2">Horário</label><div className="grid grid-cols-4 gap-2">{slots.map((s: any) => <button key={s.time} onClick={() => setTime(s.time)} className={`px-3 py-2 rounded-xl border text-sm ${time === s.time ? 'bg-coral-500 text-white border-coral-500' : 'hover:bg-coral-50'}`}>{s.time}</button>)}</div></div>}
      {selSvc && <div className="bg-gradient-to-r from-coral-50 to-rose-50 rounded-xl p-4 flex justify-between items-center"><div><p className="font-semibold">{selSvc.name}</p><p className="text-sm text-gray-500">⏱ {selSvc.duration} min</p></div><p className="text-xl font-bold text-coral-500">{selSvc.price.toFixed(2)}€</p></div>}
      <button onClick={handle} disabled={!profi || !svci || !date || !time || submitting} className="w-full bg-coral-500 text-white py-3 rounded-xl hover:bg-coral-600 disabled:opacity-50 font-semibold shadow-lg shadow-coral-200">{submitting ? 'A agendar...' : 'Confirmar Agendamento'}</button>
    </div>
  </div>);
}
