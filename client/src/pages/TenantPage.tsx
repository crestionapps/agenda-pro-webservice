import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../lib/api';

const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const catIcons: Record<string, string> = {
  Corte: '✂️', Barba: '🧔', Combo: '✨', Massagem: '💆',
  Facial: '🧴', Mãos: '💅', Pés: '🦶', Cor: '🎨',
  Tratamento: '💧', Design: '✏️',
};

export default function TenantPage() {
  const { slug } = useParams();
  const [tenant, setTenant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'servicos' | 'profissionais' | 'horarios' | 'avaliacoes'>('servicos');

  useEffect(() => {
    api.get(`/api/tenants/${slug}`).then(setTenant).finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div className="text-center py-20 text-gray-500">A carregar...</div>;
  if (!tenant) return <div className="text-center py-20 text-gray-500">Negócio não encontrado</div>;

  const groups = tenant.services?.reduce((acc: any, s: any) => {
    const c = s.category || 'Outros';
    if (!acc[c]) acc[c] = [];
    acc[c].push(s);
    return acc;
  }, {}) || {};

  return (
    <div>
      <div className="h-48 md:h-64 bg-gradient-to-br from-coral-500 to-rose-500" />
      <div className="max-w-6xl mx-auto px-4 -mt-16 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end gap-4 mb-6">
          <div className="w-28 h-28 rounded-2xl bg-white shadow-xl flex items-center justify-center text-4xl font-bold text-coral-500 border-4 border-white shrink-0">
            {tenant.logo ? (
              <img src={tenant.logo} alt="" className="w-full h-full rounded-2xl object-cover" />
            ) : (
              tenant.name.charAt(0)
            )}
          </div>
          <div className="flex-1 bg-white/90 backdrop-blur rounded-xl p-5 shadow-lg">
            <div className="flex flex-col md:flex-row md:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold">{tenant.name}</h1>
                <p className="text-gray-500">{tenant.address}</p>
              </div>
              <Link to={`/negocio/${slug}/agendar`} className="btn-primary text-center whitespace-nowrap">
                Agendar agora
              </Link>
            </div>
          </div>
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto">
          {(['servicos', 'profissionais', 'horarios', 'avaliacoes'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap ${
                tab === t ? 'bg-coral-500 text-white shadow-lg' : 'bg-white text-gray-600 border hover:bg-gray-50'
              }`}
            >
              {t === 'servicos' ? '📋 Serviços' : t === 'profissionais' ? '👥 Profissionais' : t === 'horarios' ? '🕐 Horários' : '⭐ Avaliações'}
            </button>
          ))}
        </div>

        {tab === 'servicos' && (
          <div className="space-y-6 mb-8">
            {Object.entries(groups).map(([cat, svcs]: [string, any]) => (
              <div key={cat}>
                <h3 className="font-semibold text-lg mb-3">{catIcons[cat] || '📌'} {cat}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {svcs.map((s: any) => (
                    <div key={s.id} className="card p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold">{s.name}</h4>
                        <span className="text-lg font-bold text-coral-500">{s.price.toFixed(2)}€</span>
                      </div>
                      <p className="text-sm text-gray-400">⏱ {s.duration} min</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'profissionais' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {tenant.professionals?.map((p: any) => (
              <div key={p.id} className="card p-5 text-center">
                <div className="w-16 h-16 rounded-full mx-auto mb-3 bg-coral-100 flex items-center justify-center text-xl font-bold text-coral-500">
                  {p.photo ? (
                    <img src={p.photo} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    p.name.charAt(0)
                  )}
                </div>
                <h3 className="font-semibold">{p.name}</h3>
                {p.email && <p className="text-sm text-gray-500">✉️ {p.email}</p>}
                {p.phone && <p className="text-sm text-gray-500">📞 {p.phone}</p>}
              </div>
            ))}
          </div>
        )}

        {tab === 'horarios' && (
          <div className="card p-6 mb-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {tenant.businessHours?.map((h: any) => (
                <div
                  key={h.id}
                  className={`flex justify-between p-3 rounded-lg ${h.isOpen ? 'bg-green-50' : 'bg-red-50'}`}
                >
                  <span className="font-medium">{weekDays[h.dayOfWeek]}</span>
                  {h.isOpen ? (
                    <span className="text-green-700">{h.openTime} - {h.closeTime}</span>
                  ) : (
                    <span className="text-red-500">Fechado</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'avaliacoes' && (
          <div className="card p-6 mb-8">
            {tenant.reviews?.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Sem avaliações</p>
            ) : (
              <div className="space-y-4">
                {tenant.reviews?.map((r: any) => (
                  <div key={r.id} className="border-b pb-4 last:border-0">
                    <p className="font-medium">{r.customer?.name}</p>
                    <p className="text-sm text-gray-600">{r.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
