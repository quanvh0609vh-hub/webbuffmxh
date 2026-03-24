import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSent(true);
    }, 1000);
  };

  if (sent) {
    return (
      <div className="w-full text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Da gui email!</h2>
        <p className="text-[#a0a0b0] mb-6">Kiem tra email de dat lai mat khau.</p>
        <Link to="/login" className="text-[#6C63FF] hover:text-[#8b85ff] font-medium">Quay lai dang nhap</Link>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Quen mat khau?</h2>
        <p className="text-[#a0a0b0]">Nhap email de khoi phuc tai khoan</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[#a0a0b0] mb-1.5">Email</label>
          <input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg bg-[#1a1a2e] border border-[#2d2d44] text-white text-sm placeholder:text-[#6b6b80] focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/50 focus:border-[#6C63FF] transition-all" />
        </div>
        <button type="submit" disabled={loading}
          className="w-full px-6 py-3 rounded-lg bg-[#6C63FF] hover:bg-[#5a52d5] text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed">
          {loading ? 'Đang gửi...' : 'Gửi email khôi phục'}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-[#a0a0b0]">
        Nhớ mật khẩu rồi?{' '}
        <Link to="/login" className="text-[#6C63FF] hover:text-[#8b85ff] font-medium transition-colors">Đăng nhập</Link>
      </p>
    </div>
  );
}
