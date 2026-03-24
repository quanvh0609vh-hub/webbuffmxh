import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useLocation } from 'react-router-dom';
import { Menu, User, LogOut, ChevronDown, Wallet } from 'lucide-react';
import { formatCurrency } from '../utils/format';

const pageTitles = {
  '/dashboard': 'Bảng điều khiển',
  '/services': 'Dịch vụ',
  '/order/new': 'Đặt hàng',
  '/orders': 'Đơn hàng',
  '/funds': 'Tài chính',
  '/profile': 'Hồ sơ cá nhân',
  '/api-access': 'API',
  '/support': 'Hỗ trợ',
  '/admin': 'Quản trị',
  '/admin/users': 'Quản lý người dùng',
  '/admin/services': 'Quản lý dịch vụ',
  '/admin/orders': 'Quản lý đơn hàng',
  '/admin/settings': 'Cài đặt',
};

export default function Header({ onMenuClick }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const pageTitle = pageTitles[location.pathname] || 'webbuffMXH';

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
  };

  return (
    <header className="sticky top-0 z-30 bg-[#0f0f1a]/80 backdrop-blur-xl border-b border-border/50">
      <div className="flex items-center justify-between px-4 md:px-6 py-3">
        {/* Left side */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg hover:bg-white/5 text-text-secondary hover:text-white transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="text-lg md:text-xl font-semibold text-white">{pageTitle}</h1>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3 md:gap-4">
          {/* Balance */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-teal/10 border border-teal/20">
            <Wallet className="w-4 h-4 text-teal" />
            <span className="text-sm font-medium text-teal">
              {formatCurrency(user?.balance || 0)}
            </span>
          </div>

          {/* User Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 p-1.5 pr-3 rounded-lg hover:bg-white/5 transition-colors"
            >
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt="Avatar"
                  className="w-8 h-8 rounded-full object-cover border border-white/10"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-teal flex items-center justify-center">
                  <span className="text-sm font-semibold text-white">
                    {user?.username?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
              )}
              <span className="hidden md:block text-sm font-medium text-white">
                {user?.username || 'User'}
              </span>
              <ChevronDown className={`w-4 h-4 text-text-secondary transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 py-2 rounded-xl bg-card border border-border shadow-xl animate-scale-in">
                <div className="px-4 py-2 border-b border-border/50">
                  <p className="text-sm font-medium text-white">{user?.username}</p>
                  <p className="text-xs text-text-muted">{user?.email}</p>
                </div>

                {/* Mobile Balance */}
                <div className="sm:hidden px-4 py-2 border-b border-border/50">
                  <div className="flex items-center gap-2">
                    <Wallet className="w-4 h-4 text-teal" />
                    <span className="text-sm font-medium text-teal">
                      {formatCurrency(user?.balance || 0)}
                    </span>
                  </div>
                </div>

                <div className="py-1">
                  <Link
                    to="/profile"
                    onClick={() => setDropdownOpen(false)}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-text-secondary hover:text-white hover:bg-white/5 transition-colors"
                  >
                    <User className="w-4 h-4" />
                    <span>Hồ sơ</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-danger hover:bg-danger/5 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Đăng xuất</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
