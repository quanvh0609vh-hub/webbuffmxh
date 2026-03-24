import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

export default function AuthSuccess() {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    console.log('[AuthSuccess] Component mounted');
    console.log('[AuthSuccess] All params:', Object.fromEntries(searchParams.entries()));

    const authToken = searchParams.get('token');
    const refreshToken = searchParams.get('refreshToken');

    console.log('[AuthSuccess] Token:', authToken ? 'present' : 'missing');
    console.log('[AuthSuccess] RefreshToken:', refreshToken ? 'present' : 'missing');

    if (!authToken) {
      console.log('[AuthSuccess] No token, redirecting to login');
      window.location.href = '/login?error=auth_failed';
      return;
    }

    // Save tokens to localStorage
    localStorage.setItem('token', authToken);
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
    }

    console.log('[AuthSuccess] Tokens saved, redirecting to dashboard');

    // Full page reload so AuthContext reinitializes with new token
    window.location.href = '/dashboard';
  }, []);

  return (
    <div className="min-h-screen bg-[#0f0f1a] flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-[#6C63FF]/30 border-t-[#6C63FF] rounded-full animate-spin mx-auto mb-4" />
        <p className="text-[#a0a0b0]">Đang đăng nhập...</p>
      </div>
    </div>
  );
}
