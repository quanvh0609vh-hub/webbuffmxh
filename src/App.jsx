import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import AuthLayout from './layouts/AuthLayout';
import MainLayout from './layouts/MainLayout';
import AuthSuccess from './pages/auth/AuthSuccess';
import Dashboard from './pages/Dashboard';
import Services from './pages/Services';
import NewOrder from './pages/NewOrder';
import Orders from './pages/Orders';
import Funds from './pages/Funds';
import Profile from './pages/Profile';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminServices from './pages/admin/AdminServices';
import AdminOrders from './pages/admin/AdminOrders';
import AdminSettings from './pages/admin/AdminSettings';
import AdminChat from './pages/admin/AdminChat';
import AdminTransactions from './pages/admin/AdminTransactions';

function Spinner() {
  return (
    <div className="min-h-screen bg-[#0f0f1a] flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-[#6C63FF]/30 border-t-[#6C63FF] rounded-full animate-spin" />
    </div>
  );
}

function ProtectedRoute({ children }) {
  const { user, token, loading } = useAuth();
  if (loading) return <Spinner />;
  if (!token || !user) return <Navigate to="/login" replace />;
  return children;
}

function AdminRoute({ children }) {
  const { user, token, loading } = useAuth();
  if (loading) return <Spinner />;
  if (!token || !user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
}

function GuestRoute({ children }) {
  const { user, token, loading } = useAuth();
  if (loading) return <Spinner />;
  if (token && user) return <Navigate to="/dashboard" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<GuestRoute><AuthLayout page="login" /></GuestRoute>} />
      <Route path="/register" element={<GuestRoute><AuthLayout page="register" /></GuestRoute>} />
      <Route path="/forgot-password" element={<GuestRoute><AuthLayout page="forgot" /></GuestRoute>} />
      <Route path="/auth/success" element={<AuthSuccess />} />

      <Route path="/admin" element={<AdminRoute><MainLayout /></AdminRoute>}>
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="services" element={<AdminServices />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="transactions" element={<AdminTransactions />} />
        <Route path="chat" element={<AdminChat />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>

      <Route path="/" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="services" element={<Services />} />
        <Route path="order/new" element={<NewOrder />} />
        <Route path="orders" element={<Orders />} />
        <Route path="funds" element={<Funds />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
