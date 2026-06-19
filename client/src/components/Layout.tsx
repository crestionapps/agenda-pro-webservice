import { Link, Outlet, useNavigate } from 'react-router-dom'; import { useAuth } from '../contexts/AuthContext'; import { useState } from 'react';
export default function Layout() {
  const { user, logout } = useAuth(); const navigate = useNavigate(); const [menuOpen, setMenuOpen] = useState(false);
  const handleLogout = () => { logout(); navigate('/'); };
  return (<div className="min-h-screen flex flex-col">
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-coral-500 rounded-lg flex items-center justify-center"><span className="text-white font-bold text-sm">AP</span></div>
          <span className="text-xl font-bold text-gray-900">AgendaPro</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-sm font-medium text-gray-600 hover:text-coral-500 transition">Início</Link>
          {user ? (<>
            {user.role === 'CUSTOMER' && <Link to="/cliente" className="text-sm font-medium text-gray-600 hover:text-coral-500 transition">Os meus agendamentos</Link>}
            {(user.role === 'MANAGER' || user.role === 'ADMIN') && <Link to="/gestao" className="text-sm font-medium text-gray-600 hover:text-coral-500 transition">Gestão</Link>}
            {user.role === 'SUPER_ADMIN' && <Link to="/admin/plataforma" className="text-sm font-medium text-gray-600 hover:text-coral-500 transition">Admin</Link>}
            <button onClick={handleLogout} className="text-sm font-medium text-gray-400 hover:text-red-500 transition">Sair</button>
            <div className="flex items-center gap-2 pl-2 border-l"><div className="w-8 h-8 bg-coral-100 rounded-full flex items-center justify-center text-sm font-semibold text-coral-600">{user.name.charAt(0)}</div><span className="text-sm font-medium text-gray-700">{user.name}</span></div>
          </>) : (<>
            <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-coral-500 transition">Entrar</Link>
            <Link to="/registar" className="btn-primary text-sm">Registar</Link>
          </>)}
        </nav>
        <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={menuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} /></svg>
        </button>
      </div>
      {menuOpen && <div className="md:hidden border-t bg-white px-4 py-4 space-y-3">
        <Link to="/" className="block text-sm font-medium text-gray-600" onClick={() => setMenuOpen(false)}>Início</Link>
        {user ? (<>
          {user.role === 'CUSTOMER' && <Link to="/cliente" className="block text-sm font-medium text-gray-600" onClick={() => setMenuOpen(false)}>Agendamentos</Link>}
          {(user.role === 'MANAGER' || user.role === 'ADMIN') && <Link to="/gestao" className="block text-sm font-medium text-gray-600" onClick={() => setMenuOpen(false)}>Gestão</Link>}
          {user.role === 'SUPER_ADMIN' && <Link to="/admin/plataforma" className="block text-sm font-medium text-gray-600" onClick={() => setMenuOpen(false)}>Admin</Link>}
          <button onClick={() => { handleLogout(); setMenuOpen(false); }} className="block text-sm font-medium text-red-500">Sair</button>
        </>) : (<>
          <Link to="/login" className="block text-sm font-medium text-gray-600" onClick={() => setMenuOpen(false)}>Entrar</Link>
          <Link to="/registar" className="block text-sm font-medium text-coral-600" onClick={() => setMenuOpen(false)}>Registar</Link>
        </>)}
      </div>}
    </header>
    <main className="flex-1"><Outlet /></main>
    <footer className="bg-gray-900 text-gray-400 py-12">
      <div className="max-w-7xl mx-auto px-4 text-center text-sm">&copy; 2026 AgendaPro. Todos os direitos reservados.</div>
    </footer>
  </div>);
}
