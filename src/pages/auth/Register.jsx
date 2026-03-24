import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username || !form.email || !form.password || !form.confirmPassword) {
      setError('Vui long dien day du thong tin');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Mat khau khong khop');
      return;
    }
    if (form.password.length < 6) {
      setError('Mat khau phai co it nhat 6 ky tu');
      return;
    }
    setLoading(true);
    setError('');
    const result = await register(form.username, form.email, form.password);
    setLoading(false);
    if (!result.success) {
      setError(result.error);
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="w-full">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Tao tai khoan</h2>
        <p className="text-[#a0a0b0]">Đăng ký để bắt đầu</p>
      </div>
      {error && (
        <div className="mb-5 px-4 py-3 rounded-lg bg-[#ff4757]/10 border border-[#ff4757]/20 text-[#ff4757] text-sm">{error}</div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[#a0a0b0] mb-1.5">Username</label>
          <input name="username" type="text" placeholder="yourname" value={form.username} onChange={handleChange}
            className="w-full px-4 py-2.5 rounded-lg bg-[#1a1a2e] border border-[#2d2d44] text-white text-sm placeholder:text-[#6b6b80] focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/50 focus:border-[#6C63FF] transition-all" />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#a0a0b0] mb-1.5">Email</label>
          <input name="email" type="email" placeholder="you@example.com" value={form.email} onChange={handleChange}
            className="w-full px-4 py-2.5 rounded-lg bg-[#1a1a2e] border border-[#2d2d44] text-white text-sm placeholder:text-[#6b6b80] focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/50 focus:border-[#6C63FF] transition-all" />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#a0a0b0] mb-1.5">Mật khẩu</label>
          <input name="password" type="password" placeholder="Ít nhất 6 ký tự" value={form.password} onChange={handleChange}
            className="w-full px-4 py-2.5 rounded-lg bg-[#1a1a2e] border border-[#2d2d44] text-white text-sm placeholder:text-[#6b6b80] focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/50 focus:border-[#6C63FF] transition-all" />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#a0a0b0] mb-1.5">Xác nhận mật khẩu</label>
          <input name="confirmPassword" type="password" placeholder="Nhập lại mật khẩu" value={form.confirmPassword} onChange={handleChange}
            className="w-full px-4 py-2.5 rounded-lg bg-[#1a1a2e] border border-[#2d2d44] text-white text-sm placeholder:text-[#6b6b80] focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/50 focus:border-[#6C63FF] transition-all" />
        </div>
        <button type="submit" disabled={loading}
          className="w-full px-6 py-3 rounded-lg bg-[#6C63FF] hover:bg-[#5a52d5] text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed">
          {loading ? 'Đang đăng ký...' : 'Đăng ký'}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-[#a0a0b0]">
        Đã có tài khoản?{' '}
        <Link to="/login" className="text-[#6C63FF] hover:text-[#8b85ff] font-medium transition-colors">Đăng nhập</Link>
      </p>
    </div>
  );
}
