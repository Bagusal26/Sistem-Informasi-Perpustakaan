import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, User, Phone, MapPin, UserPlus, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { AppLogo } from '../../components/ui/AppLogo';

export const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { register, isAuthenticated, role } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Redirect jika sudah dalam status login
  React.useEffect(() => {
    if (isAuthenticated) {
      if (role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/member/catalog', { replace: true });
      }
    }
  }, [isAuthenticated, role, navigate]);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    // 1. Nama Lengkap wajib
    if (!name.trim()) {
      errs.name = 'Nama lengkap wajib diisi.';
    } else if (name.trim().length < 2) {
      errs.name = 'Nama lengkap minimal 2 karakter.';
    }

    // 2. Email wajib & format valid
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      errs.email = 'Alamat email wajib diisi.';
    } else if (!emailRegex.test(email.trim())) {
      errs.email = 'Format alamat email tidak valid (contoh: anggota@email.com).';
    }

    // 3. Password wajib
    if (!password) {
      errs.password = 'Password tidak boleh kosong.';
    } else if (password.length < 6) {
      errs.password = 'Password minimal 6 karakter.';
    }

    // 4. Konfirmasi Password wajib & sama
    if (!confirmPassword) {
      errs.confirmPassword = 'Konfirmasi password tidak boleh kosong.';
    } else if (password !== confirmPassword) {
      errs.confirmPassword = 'Password dan konfirmasi password harus sama.';
    }

    // 5. Nomor HP wajib & format valid
    const cleanPhone = phone.trim().replace(/[\s-]/g, '');
    const phoneRegex = /^[0-9+]{8,18}$/;
    if (!phone.trim()) {
      errs.phone = 'Nomor HP tidak boleh kosong.';
    } else if (!phoneRegex.test(cleanPhone)) {
      errs.phone = 'Format nomor HP tidak valid (minimal 8-18 digit angka).';
    }

    // 6. Alamat wajib
    if (!address.trim()) {
      errs.address = 'Alamat tidak boleh kosong.';
    } else if (address.trim().length < 5) {
      errs.address = 'Alamat minimal 5 karakter.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!validate()) {
      showToast('error', 'Mohon periksa dan lengkapi data formulir pendaftaran.');
      return;
    }

    setIsLoading(true);
    const result = await register({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: password.trim(),
      confirmPassword: confirmPassword.trim(),
      phone: phone.trim(),
      address: address.trim(),
    });
    setIsLoading(false);

    if (result.success) {
      showToast('success', result.message);
      navigate('/login', { replace: true });
    } else {
      setFormError(result.message);
      showToast('error', result.message);
      if (result.message.toLowerCase().includes('email')) {
        setErrors((prev) => ({ ...prev, email: result.message }));
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-4 py-8">
      <div className="max-w-lg w-full">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <AppLogo className="w-20 h-20" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Pendaftaran Anggota
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Daftarkan diri Anda untuk meminjam koleksi buku perpustakaan.
          </p>
        </div>

        {/* Card Form */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {formError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg font-medium flex items-center gap-2">
                <AlertCircle size={15} className="shrink-0 text-rose-600" />
                <span>{formError}</span>
              </div>
            )}

            {/* Nama Lengkap */}
            <Input
              label="Nama Lengkap"
              type="text"
              placeholder="Masukkan nama lengkap Anda"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
              }}
              leftIcon={<User size={16} />}
              error={errors.name}
              required
            />

            {/* Email */}
            <Input
              label="Alamat Email"
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
            />

            {/* Password & Konfirmasi Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Password"
                type="password"
                placeholder="Minimal 6 karakter"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
                }}
                leftIcon={<Lock size={16} />}
                error={errors.password}
                required
              />

              <Input
                label="Konfirmasi Password"
                type="password"
                placeholder="Ulangi password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: '' }));
                }}
                leftIcon={<Lock size={16} />}
                error={errors.confirmPassword}
                required
              />
            </div>

            {/* Nomor HP */}
            <Input
              label="Nomor HP / WhatsApp"
              type="tel"
              placeholder="081234567890"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                if (errors.phone) setErrors((prev) => ({ ...prev, phone: '' }));
              }}
              leftIcon={<Phone size={16} />}
              error={errors.phone}
              required
            />

            {/* Alamat */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                <span>
                  Alamat Lengkap <span className="text-rose-500">*</span>
                </span>
                <span className="text-[11px] font-normal text-slate-400">Minimal 5 karakter</span>
              </label>
              <div className="relative">
                <textarea
                  rows={3}
                  placeholder="Masukkan alamat domisili lengkap Anda"
                  value={address}
                  onChange={(e) => {
                    setAddress(e.target.value);
                    if (errors.address) setErrors((prev) => ({ ...prev, address: '' }));
                  }}
                  className={`w-full rounded-lg border bg-white p-3 text-sm text-slate-900 placeholder-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                    errors.address
                      ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-200'
                      : 'border-slate-300 focus:border-indigo-500 focus:ring-indigo-100'
                  }`}
                  required
                />
              </div>
              {errors.address && (
                <p className="text-xs text-rose-600 font-medium">{errors.address}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full mt-2"
              isLoading={isLoading}
              icon={<UserPlus size={16} />}
            >
              Daftar Sebagai Anggota
            </Button>
          </form>

          {/* Link ke Login */}
          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500">
              Sudah punya akun?{' '}
              <Link
                to="/login"
                className="font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
              >
                Masuk di sini
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
