import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Grid3x3,
  Plus,
  ShoppingCart,
  Wallet,
  User,
  Key,
  Shield,
  X,
  ChevronRight,
  MessageSquare,
  Receipt,
} from 'lucide-react';

const navItems = [
  { path: '/dashboard', label: 'Bảng điều khiển', icon: LayoutDashboard },
  { path: '/services', label: 'Dịch vụ', icon: Grid3x3 },
  { path: '/order/new', label: 'Đặt hàng', icon: Plus },
  { path: '/orders', label: 'Đơn hàng', icon: ShoppingCart },
  { path: '/funds', label: 'Tài chính', icon: Wallet },
  { path: '/profile', label: 'Hồ sơ', icon: User },
];

const adminItems = [
  { path: '/admin', label: 'Tổng quan', icon: Shield },
  { path: '/admin/chat', label: 'Hỗ trợ', icon: MessageSquare },
  { path: '/admin/users', label: 'Quản lý người dùng', icon: Shield },
  { path: '/admin/services', label: 'Quản lý dịch vụ', icon: Grid3x3 },
  { path: '/admin/orders', label: 'Quản lý đơn hàng', icon: ShoppingCart },
  { path: '/admin/transactions', label: 'Quản lý giao dịch', icon: Receipt },
  { path: '/admin/settings', label: 'Cài đặt', icon: Key },
];

function NavItem({ path, label, icon: Icon, onClick }) {
  const location = useLocation();
  const isActive = location.pathname === path || (path !== '/admin' && location.pathname.startsWith(path));

  return (
    <NavLink
      to={path}
      onClick={onClick}
      className={`
        flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
        ${isActive
          ? 'bg-accent/15 text-accent-light border-l-2 border-accent'
          : 'text-text-secondary hover:text-white hover:bg-white/5'
        }
      `}
    >
      <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-accent' : ''}`} />
      <span>{label}</span>
      {isActive && <ChevronRight className="w-4 h-4 ml-auto opacity-50" />}
    </NavLink>
  );
}

export default function Sidebar({ isOpen, onClose }) {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 bg-sidebar flex-shrink-0 fixed top-0 left-0 h-full z-50 sidebar-transition">
        <SidebarContent isAdmin={isAdmin} onItemClick={() => {}} />
      </aside>

      {/* Mobile Sidebar */}
      <aside
        className={`
          lg:hidden fixed top-0 left-0 h-full w-72 bg-sidebar z-50 sidebar-transition
          transform ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <SidebarContent isAdmin={isAdmin} onItemClick={onClose} isMobile />
      </aside>
    </>
  );
}

function SidebarContent({ isAdmin, onItemClick, isMobile }) {
  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-6 border-b border-white/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/WebBuffMXH.png" alt="webbuffMXH" className="h-10 w-auto" />
          </div>
          {isMobile && (
            <button
              onClick={onItemClick}
              className="p-1.5 rounded-lg hover:bg-white/10 text-text-secondary hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavItem key={item.path} {...item} onClick={onItemClick} />
        ))}

        {isAdmin && (
          <>
            <div className="pt-4 pb-2">
              <div className="px-3 text-xs font-semibold text-text-muted uppercase tracking-wider">
                Admin
              </div>
            </div>
            {adminItems.map((item) => (
              <NavItem key={item.path} {...item} onClick={onItemClick} />
            ))}
          </>
        )}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-white/5">
        <p className="text-xs text-text-muted text-center">
          webbuffMXH v1.0.0
        </p>
      </div>
    </div>
  );
}
