import { Routes, Route, Navigate } from 'react-router-dom'; import { useAuth } from './contexts/AuthContext'; import Layout from './components/Layout'; import HomePage from './pages/HomePage'; import LoginPage from './pages/LoginPage'; import RegisterPage from './pages/RegisterPage'; import TenantPage from './pages/TenantPage'; import CustomerDashboard from './pages/CustomerDashboard'; import ManagerDashboard from './pages/ManagerDashboard'; import BusinessAdminDashboard from './pages/BusinessAdminDashboard'; import PlatformAdminDashboard from './pages/PlatformAdminDashboard'; import BookingPage from './pages/BookingPage';
function ProtectedRoute({ children, roles }: { children: JSX.Element; roles?: string[] }) { const { user, loading } = useAuth(); if (loading) return <div className="p-8 text-center">A carregar...</div>; if (!user) return <Navigate to="/login" />; if (roles && !roles.includes(user.role)) return <Navigate to="/" />; return children; }
export default function App() {
  return (<Routes><Route element={<Layout />}>
    <Route path="/" element={<HomePage />} /><Route path="/login" element={<LoginPage />} /><Route path="/registar" element={<RegisterPage />} />
    <Route path="/negocio/:slug" element={<TenantPage />} /><Route path="/negocio/:slug/agendar" element={<BookingPage />} />
    <Route path="/cliente" element={<ProtectedRoute><CustomerDashboard /></ProtectedRoute>} />
    <Route path="/gestao" element={<ProtectedRoute roles={['MANAGER', 'ADMIN', 'SUPER_ADMIN']}><ManagerDashboard /></ProtectedRoute>} />
    <Route path="/admin/negocio" element={<ProtectedRoute roles={['ADMIN', 'SUPER_ADMIN']}><BusinessAdminDashboard /></ProtectedRoute>} />
    <Route path="/admin/plataforma" element={<ProtectedRoute roles={['SUPER_ADMIN']}><PlatformAdminDashboard /></ProtectedRoute>} />
  </Route></Routes>);
}
