import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '', remember: false });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError('Vui lòng điền đầy đủ thông tin');
      return;
    }
    setLoading(true);
    setError('');
    const result = await login(form.email, form.password);
    setLoading(false);
    if (!result.success) {
      setError(result.error);
    } else {
      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 1000);
    }
  };

  return (
    <div className="w-full">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Chào mừng bạn</h2>
        <p className="text-[#a0a0b0]">Đăng nhập để tiếp tục</p>
      </div>

      {success ? (
        <div className="flex flex-col items-center gap-3 py-8 animate-fade-in">
          <div className="w-16 h-16 rounded-full bg-[#00d4aa]/20 flex items-center justify-center">
            <svg className="w-8 h-8 text-[#00d4aa]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-white">Đăng nhập thành công!</h3>
          <p className="text-[#a0a0b0]">Đang chuyển hướng...</p>
        </div>
      ) : error ? (
        <div className="mb-5 px-4 py-3 rounded-lg bg-[#ff4757]/10 border border-[#ff4757]/20 text-[#ff4757] text-sm">
          {error}
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[#a0a0b0] mb-1.5">Email</label>
          <input
            name="email"
            type="email"
            placeholder="user@example.com"
            value={form.email}
            onChange={handleChange}
            autoComplete="email"
            className="w-full px-4 py-2.5 rounded-lg bg-[#1a1a2e] border border-[#2d2d44] text-white text-sm placeholder:text-[#6b6b80] focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/50 focus:border-[#6C63FF] transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#a0a0b0] mb-1.5">Mật khẩu</label>
          <input
            name="password"
            type="password"
            placeholder="Nhập mật khẩu"
            value={form.password}
            onChange={handleChange}
            autoComplete="current-password"
            className="w-full px-4 py-2.5 rounded-lg bg-[#1a1a2e] border border-[#2d2d44] text-white text-sm placeholder:text-[#6b6b80] focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/50 focus:border-[#6C63FF] transition-all"
          />
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="remember"
              checked={form.remember}
              onChange={handleChange}
              className="w-4 h-4 rounded border-[#2d2d44] bg-[#1a1a2e] text-[#6C63FF] focus:ring-[#6C63FF]/50 cursor-pointer"
            />
            <span className="text-sm text-[#a0a0b0]">Ghi nhớ</span>
          </label>
          <Link to="/forgot-password" className="text-sm text-[#6C63FF] hover:text-[#8b85ff] transition-colors">
            Quên mật khẩu?
          </Link>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full px-6 py-3 rounded-lg bg-[#6C63FF] hover:bg-[#5a52d5] text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </button>
      </form>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[#2d2d44]" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="px-3 bg-[#0f0f1a] text-[#6b6b80]">hoặc</span>
        </div>
      </div>

      <button
        type="button"
        onClick={() => window.location.href = '/api/auth/google'}
        className="w-full px-6 py-3 rounded-lg border border-[#2d2d44] text-[#a0a0b0] hover:text-white hover:border-[#6C63FF]/50 hover:bg-[#6C63FF]/5 font-medium transition-all flex items-center justify-center gap-2"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Đăng nhập với Google
      </button>

      <p className="mt-6 text-center text-sm text-[#a0a0b0]">
        Chưa có tài khoản?{' '}
        <Link to="/register" className="text-[#6C63FF] hover:text-[#8b85ff] font-medium transition-colors">
          Đăng ký ngay
        </Link>
      </p>
    </div>
  );
}
