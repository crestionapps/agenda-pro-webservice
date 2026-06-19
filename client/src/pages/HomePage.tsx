import { useState, useEffect } from 'react'; import { Link } from 'react-router-dom'; import { api } from '../lib/api';
const labels: Record<string, string> = { BARBERSHOP: 'Barbearia', HAIRDRESSER: 'Cabeleireiro', SPA: 'Spa & Massagem', NAILS: 'Unhas', AESTHETICS: 'Estética', CLINIC: 'Clínica' };
const cats = [
  { k: 'BARBERSHOP', l: 'Barbearia', i: '💈', b: 'bg-amber-50' }, { k: 'HAIRDRESSER', l: 'Cabeleireiro', i: '💇', b: 'bg-pink-50' },
  { k: 'SPA', l: 'Spa & Massagem', i: '🧖', b: 'bg-green-50' }, { k: 'NAILS', l: 'Manicure & Pedicure', i: '💅', b: 'bg-purple-50' },
  { k: 'AESTHETICS', l: 'Estética', i: '✨', b: 'bg-orange-50' }, { k: 'CLINIC', l: 'Clínica', i: '🏥', b: 'bg-red-50' },
];
export default function HomePage() {
  const [tenants, setTenants] = useState<any[]>([]); const [search, setSearch] = useState(''); const [filter, setFilter] = useState(''); const [loading, setLoading] = useState(true);
  useEffect(() => { api.get(`/api/tenants?search=${search}&type=${filter}&limit=12`).then(d => setTenants(d.tenants)).finally(() => setLoading(false)); }, [search, filter]);
  return (<div>
    <section className="bg-gradient-to-br from-coral-500 via-rose-500 to-coral-600 text-white relative overflow-hidden py-20 md:py-28">
      <div className="max-w-4xl mx-auto px-4 text-center relative">
        <h1 className="text-4xl md:text-6xl font-extrabold mb-4">Encontra o teu<br />especialista de beleza</h1>
        <p className="text-coral-100 mb-8">Marca consultas online com os melhores profissionais perto de ti</p>
        <div className="bg-white rounded-2xl p-2 shadow-2xl max-w-2xl mx-auto flex flex-col md:flex-row gap-2">
          <input type="text" placeholder="Pesquisar..." value={search} onChange={e => setSearch(e.target.value)} className="flex-1 px-4 py-3 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-coral-300" />
          <select value={filter} onChange={e => setFilter(e.target.value)} className="md:w-44 px-4 py-3 rounded-xl text-gray-700 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-coral-300">
            <option value="">Todas</option>{cats.map(c => <option key={c.k} value={c.k}>{c.i} {c.l}</option>)}
          </select>
        </div>
        <div className="flex justify-center gap-2 mt-4 text-sm text-coral-100">Popular: {cats.slice(0, 4).map(c => <button key={c.k} onClick={() => setFilter(c.k)} className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20">{c.l}</button>)}</div>
      </div>
    </section>
    <section className="max-w-7xl mx-auto px-4 -mt-8 relative z-10">
      <div className="bg-white rounded-2xl shadow-lg border p-4">
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2">{cats.map(c => <button key={c.k} onClick={() => setFilter(filter === c.k ? '' : c.k)} className={`flex flex-col items-center gap-1 p-3 rounded-xl transition ${filter === c.k ? 'bg-coral-50 ring-2 ring-coral-300' : 'hover:bg-gray-50'}`}><div className={`w-10 h-10 ${c.b} rounded-xl flex items-center justify-center text-xl`}>{c.i}</div><span className="text-xs font-medium text-gray-600">{c.l}</span></button>)}</div>
      </div>
    </section>
    <section className="max-w-7xl mx-auto px-4 py-12">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">{filter ? labels[filter] || 'Resultados' : 'Negócios em destaque'}</h2>
      {loading ? <div className="text-center py-12 text-gray-500">A carregar...</div> : tenants.length === 0 ? <div className="text-center py-12"><p className="text-5xl mb-4">🔍</p><p className="text-gray-500">Nenhum negócio encontrado</p></div> :
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{tenants.map(t => <Link key={t.id} to={`/negocio/${t.slug}`} className="card card-hover overflow-hidden">
        <div className="h-32 bg-gradient-to-br from-coral-100 to-rose-100 flex items-center justify-center text-4xl">{t.name.charAt(0)}</div>
        <div className="p-5"><h3 className="font-semibold text-gray-900">{t.name}</h3>{t.address && <p className="text-sm text-gray-500 mt-1">📍 {t.address}</p>}
        <div className="flex gap-3 mt-2 text-xs text-gray-400"><span>{t.professionalCount} profissionais</span><span>•</span><span>{t.reviewCount} avaliações</span></div></div>
      </Link>)}</div>}
    </section>
    <section className="max-w-7xl mx-auto px-4 py-16">
      <div className="bg-gradient-to-br from-coral-500 to-rose-600 rounded-3xl p-8 md:p-12 text-white text-center">
        <h2 className="text-3xl font-extrabold mb-4">Tens um negócio?</h2>
        <p className="text-coral-100 mb-6">Cadastra a tua empresa no AgendaPro e começa a receber agendamentos online</p>
        <a href="#" className="inline-block bg-white text-coral-600 px-8 py-3.5 rounded-xl font-semibold hover:bg-coral-50 transition shadow-xl">Cadastrar minha empresa</a>
      </div>
    </section>
  </div>);
}
