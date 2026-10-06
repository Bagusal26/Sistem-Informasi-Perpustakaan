import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, ArrowRight, ArrowLeft, KeyRound, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { AppLogo } from '../../components/ui/AppLogo';

export const ForgotPasswordPage: React.FC = () => {
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [memberName, setMemberName] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { checkEmailForReset, resetPassword, isAuthenticated, role } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

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

  const handleVerifyEmail = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setErrors({});

    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!cleanEmail) {
      setErrors({ email: 'Alamat email wajib diisi.' });
      return;
    }

    if (!emailRegex.test(cleanEmail)) {
      setErrors({ email: 'Format alamat email tidak valid (contoh: anggota@email.com).' });
      return;
    }

    setIsLoading(true);
    const result = checkEmailForReset(cleanEmail);
    setIsLoading(false);

    if (result.success && result.role === 'member') {
      setMemberName(result.name || '');
      setStep(2);
      showToast('info', 'Email anggota ditemukan. Silakan masukkan password baru.');
    } else {
      setFormError(result.message);
      showToast('error', result.message);
      if (result.message.toLowerCase().includes('email')) {
        setErrors({ email: result.message });
      }
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const errs: Record<string, string> = {};

    if (!newPassword) {
      errs.newPassword = 'Password baru wajib diisi.';
    } else if (newPassword.length < 6) {
      errs.newPassword = 'Password baru minimal 6 karakter.';
    }

    if (!confirmPassword) {
      errs.confirmPassword = 'Konfirmasi password wajib diisi.';
    } else if (newPassword !== confirmPassword) {
      errs.confirmPassword = 'Password baru dan konfirmasi harus sama.';
    }

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      showToast('error', 'Mohon periksa kembali isian password baru.');
      return;
    }

    setIsLoading(true);
    const result = await resetPassword(email, newPassword, confirmPassword);
    setIsLoading(false);

    if (result.success) {
      showToast('success', result.message);
      navigate('/login', { replace: true });
    } else {
      setFormError(result.message);
      showToast('error', result.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-4 py-8">
      <div className="max-w-md w-full">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-3">
            <AppLogo className="w-20 h-20" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Lupa Password
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {step === 1
              ? 'Masukkan email akun anggota Anda untuk mereset password.'
              : `Atur password baru untuk akun anggota ${memberName ? `(${memberName})` : ''}.`}
          </p>
        </div>

        {/* Card Form */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
          {formError && (
            <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg font-medium flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0 text-rose-600" />
              <span>{formError}</span>
            </div>
          )}

          {step === 1 ? (
            /* STEP 1: Verifikasi Email */
            <form onSubmit={handleVerifyEmail} className="space-y-4">
              <Input
                label="Email Anggota"
                type="email"
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
                }}
                leftIcon={<Mail size={16} />}
                error={errors.email}
                required
                helperText="Masukkan email yang terdaftar pada akun anggota perpustakaan"
              />

              <Button
                type="submit"
                className="w-full mt-2"
                isLoading={isLoading}
                icon={<ArrowRight size={16} />}
              >
                Reset Password
              </Button>
            </form>
          ) : (
            /* STEP 2: Masukkan Password Baru */
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600 flex items-center gap-2">
                <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                <span className="truncate">
                  Akun: <strong className="text-slate-900 font-mono">{email}</strong>
                </span>
              </div>

              <Input
                label="Password Baru"
                type="password"
                placeholder="Minimal 6 karakter"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  if (errors.newPassword) setErrors((prev) => ({ ...prev, newPassword: '' }));
                }}
                leftIcon={<Lock size={16} />}
                error={errors.newPassword}
                required
              />

              <Input
                label="Konfirmasi Password Baru"
                type="password"
                placeholder="Ulangi password baru"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: '' }));
                }}
                leftIcon={<Lock size={16} />}
                error={errors.confirmPassword}
                required
              />

              <Button
                type="submit"
                className="w-full mt-2"
                isLoading={isLoading}
                icon={<KeyRound size={16} />}
              >
                Simpan Password Baru
              </Button>

              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setNewPassword('');
                  setConfirmPassword('');
                  setErrors({});
                  setFormError(null);
                }}
                className="w-full text-xs text-slate-500 hover:text-slate-700 font-medium py-1 transition-colors"
              >
                Gunakan email lain
              </button>
            </form>
          )}

          {/* Link Kembali ke Login */}
          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
            >
              <ArrowLeft size={14} />
              <span>Kembali ke Halaman Login</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
