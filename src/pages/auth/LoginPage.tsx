import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Lock, Mail, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { AppLogo } from '../../components/ui/AppLogo';
import loginBg from '../../assets/login-bg.png';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const { login, isAuthenticated, role } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect jika sudah login
  React.useEffect(() => {
    if (isAuthenticated) {
      if (role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/member/catalog', { replace: true });
      }
    }
  }, [isAuthenticated, role, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsLoading(true);

    const result = await login(email, password);
    setIsLoading(false);

    if (result.success) {
      showToast('success', result.message);
      const fromPath = (location.state as { from?: { pathname: string } })?.from?.pathname;
      if (fromPath) {
        navigate(fromPath, { replace: true });
      } else {
        // Redirection berdasarkan role akun terautentikasi
        if (result.role === 'admin') {
          navigate('/admin/dashboard', { replace: true });
        } else {
          navigate('/member/catalog', { replace: true });
        }
      }
    } else {
      setFormError(result.message);
      showToast('error', result.message);
    }
  };

  return (
    <div
      className="min-h-screen w-full flex flex-col justify-center items-center p-4 relative bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${loginBg})` }}
    >
      {/* Subtle overlay for optimal contrast and clean readability */}
      <div className="absolute inset-0 bg-slate-900/10 pointer-events-none" />

      <div className="max-w-md w-full relative z-10 py-6">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <AppLogo className="w-20 h-20 drop-shadow-md" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight drop-shadow-xs">
            Sistem Informasi Perpustakaan
          </h1>
          <p className="text-sm text-slate-600 mt-1 font-medium">
            Kelola perpustakaan dengan lebih mudah.
          </p>
        </div>

        {/* Card Form */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xl p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {formError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg font-medium">
                {formError}
              </div>
            )}

            <Input
              label="Email"
              type="email"
              placeholder="nama@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail size={16} />}
              required
            />

            <div>
              <Input
                label="Password"
                type="password"
                placeholder="Masukkan password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                leftIcon={<Lock size={16} />}
                required
              />
              <div className="mt-1.5 flex justify-end">
                <Link
                  to="/forgot-password"
                  className="text-xs font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
                >
                  Lupa Password?
                </Link>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full mt-2"
              isLoading={isLoading}
              icon={<ArrowRight size={16} />}
            >
              Masuk ke Sistem
            </Button>
          </form>

          {/* Link Pendaftaran Anggota Baru */}
          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500">
              Belum punya akun?{' '}
              <Link
                to="/register"
                className="font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
              >
                Daftar
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

