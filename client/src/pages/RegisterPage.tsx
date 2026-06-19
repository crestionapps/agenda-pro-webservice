import { useState, FormEvent } from 'react'; import { Link, useNavigate } from 'react-router-dom'; import { useAuth } from '../contexts/AuthContext';
export default function RegisterPage() {
  const [name, setName] = useState(''); const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [error, setError] = useState(''); const { register } = useAuth(); const navigate = useNavigate();
  const handle = async (e: FormEvent) => { e.preventDefault(); setError(''); try { await register(name, email, password); navigate('/'); } catch (err: any) { setError(err.message); } };
  return (<div className="min-h-[80vh] flex items-center justify-center px-4">
    <div className="w-full max-w-md text-center mb-8"><div className="w-14 h-14 bg-coral-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-coral-200"><span className="text-white font-bold text-xl">AP</span></div><h1 className="text-2xl font-bold">Cria a tua conta</h1><p className="text-gray-500 mt-1">E começa a agendar já</p></div>
    <div className="bg-white rounded-2xl shadow-sm border p-8 max-w-md mx-auto">
      <form onSubmit={handle} className="space-y-4">{error && <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm">⚠️ {error}</div>}
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Nome</label><input type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-coral-400 outline-none" /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Email</label><input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-coral-400 outline-none" /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Senha</label><input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-coral-400 outline-none" /></div>
        <button type="submit" className="w-full btn-primary py-3">Criar Conta</button>
      </form><p className="text-sm text-gray-500 mt-4 text-center">Já tens conta? <Link to="/login" className="text-coral-500 font-medium hover:underline">Entra</Link></p>
    </div>
  </div>);
}
