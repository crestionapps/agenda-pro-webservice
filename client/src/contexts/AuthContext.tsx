import { createContext, useContext, useState, useEffect, ReactNode } from 'react'; import { api } from '../lib/api';
interface User { id: string; name: string; email: string; role: string; phone?: string; avatar?: string; tenantId?: string | null; tenant?: any; }
const AuthContext = createContext<any>(null!);
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null); const [loading, setLoading] = useState(true);
  useEffect(() => { const t = localStorage.getItem('token'); if (t) api.get('/api/auth/me').then(setUser).catch(() => localStorage.removeItem('token')).finally(() => setLoading(false)); else setLoading(false); }, []);
  const login = async (e: string, p: string) => { const d = await api.post('/api/auth/login', { email: e, password: p }); localStorage.setItem('token', d.token); setUser(d.user); };
  const register = async (n: string, e: string, p: string) => { const d = await api.post('/api/auth/register', { name: n, email: e, password: p }); localStorage.setItem('token', d.token); setUser(d.user); };
  const logout = () => { localStorage.removeItem('token'); setUser(null); };
  return <AuthContext.Provider value={{ user, loading, login, register, logout }}>{children}</AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);
