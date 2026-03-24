import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import ForgotPassword from '../pages/auth/ForgotPassword';

export default function AuthLayout({ page = 'login' }) {
  const renderPage = () => {
    switch (page) {
      case 'register': return <Register />;
      case 'forgot': return <ForgotPassword />;
      default: return <Login />;
    }
  };

  return (
    <div className="min-h-screen flex bg-[#0f0f1a]">
      {/* Left Panel - Banner only (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <img src="/banner-bg.png" alt="" className="w-full h-full object-cover" />
      </div>

      {/* Right Panel - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12 bg-[#0f0f1a] overflow-y-auto">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <img src="/WebBuffMXH.png" alt="webbuffMXH" className="h-16 w-auto" />
          </div>

          {renderPage()}
        </div>
      </div>
    </div>
  );
}
