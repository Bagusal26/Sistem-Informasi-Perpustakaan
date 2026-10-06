import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLibrary } from '../context/LibraryContext';
import { useToast } from '../context/ToastContext';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import {
  User,
  Mail,
  Phone,
  Lock,
  Save,
  Shield,
  Hash,
  AlertCircle,
  KeyRound,
  ShieldAlert,
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { currentUser, updateProfile } = useAuth();
  const { members } = useLibrary();
  const { showToast } = useToast();

  const isMember = currentUser?.role === 'member';
  const memberData = isMember
    ? members.find((m) => m.id === currentUser?.memberId)
    : null;

  // State Form Profile
  const [name, setName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [phone, setPhone] = useState(memberData?.phone || '');
  const [address, setAddress] = useState(memberData?.address || '');

  // State Form Password
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Sinkronisasi data awal saat profil berubah
  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name);
      setEmail(currentUser.email);
    }
    if (memberData) {
      setPhone(memberData.phone);
      setAddress(memberData.address);
    }
  }, [currentUser, memberData]);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    // 1. Nama wajib
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
      errs.email = 'Format alamat email tidak valid (contoh: user@email.com).';
    }

    // 3. Khusus Member: Nomor HP & Alamat
    if (isMember) {
      const cleanPhone = phone.trim().replace(/[\s-]/g, '');
      const phoneRegex = /^[0-9+]{8,18}$/;
      if (!phone.trim()) {
        errs.phone = 'Nomor HP wajib diisi.';
      } else if (!phoneRegex.test(cleanPhone)) {
        errs.phone = 'Format nomor HP tidak valid (minimal 8-18 digit angka).';
      }

      if (!address.trim()) {
        errs.address = 'Alamat domisili wajib diisi.';
      } else if (address.trim().length < 5) {
        errs.address = 'Alamat domisili minimal 5 karakter.';
      }
    }

    // 4. Ubah Password (jika ada salah satu field password yang diisi)
    const isChangingPassword = Boolean(currentPassword || newPassword || confirmPassword);
    if (isChangingPassword) {
      if (!currentPassword) {
        errs.currentPassword = 'Password saat ini wajib diisi untuk verifikasi.';
      }
      if (!newPassword) {
        errs.newPassword = 'Password baru wajib diisi.';
      } else if (newPassword.length < 6) {
        errs.newPassword = 'Password baru minimal 6 karakter.';
      }

      if (!confirmPassword) {
        errs.confirmPassword = 'Konfirmasi password baru wajib diisi.';
      } else if (newPassword !== confirmPassword) {
        errs.confirmPassword = 'Password baru dan konfirmasi harus sama.';
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!validate()) {
      showToast('error', 'Mohon periksa dan perbaiki isian data profil.');
      return;
    }

    setIsLoading(true);
    const result = await updateProfile({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: isMember ? phone.trim() : undefined,
      address: isMember ? address.trim() : undefined,
      currentPassword: currentPassword ? currentPassword.trim() : undefined,
      newPassword: newPassword ? newPassword.trim() : undefined,
      confirmPassword: confirmPassword ? confirmPassword.trim() : undefined,
    });
    setIsLoading(false);

    if (result.success) {
      showToast('success', result.message);
      // Bersihkan field password setelah berhasil
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setFormError(result.message);
      showToast('error', result.message);
      if (result.message.toLowerCase().includes('email')) {
        setErrors((prev) => ({ ...prev, email: result.message }));
      }
      if (result.message.toLowerCase().includes('password saat ini')) {
        setErrors((prev) => ({ ...prev, currentPassword: result.message }));
      }
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header Halaman */}
      <div className="border-b border-slate-200/80 pb-4">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Pengaturan Profil
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          {isMember
            ? 'Kelola informasi identitas akun anggota dan keamanan kata sandi Anda.'
            : 'Kelola informasi nama, email, dan keamanan akun petugas perpustakaan.'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {formError && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg font-medium flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0 text-rose-600" />
            <span>{formError}</span>
          </div>
        )}

        {/* 1. KARTU INFORMASI AKUN & IDENTITAS */}
        <Card noPadding className="border border-slate-200/90 shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User size={16} className="text-indigo-600" />
              <h2 className="text-sm font-bold text-slate-900">Informasi Akun</h2>
            </div>
            <span className="text-[11px] font-medium text-slate-500">
              Peran: <strong className="text-slate-800">{isMember ? 'Anggota Perpustakaan' : 'Petugas / Admin'}</strong>
            </span>
          </div>

          <div className="p-6 space-y-5">
            {/* Bagian Status & ID (Read-only) */}
            {isMember ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200/80">
                <div className="space-y-1">
                  <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1.5">
                    <Hash size={13} className="text-slate-400" />
                    <span>ID Anggota (Sistem)</span>
                  </span>
                  <p className="font-mono font-bold text-slate-800 text-sm">
                    {currentUser?.memberId || memberData?.id || 'MBR-000'}
                  </p>
                  <p className="text-[11px] text-slate-400">ID unik tidak dapat diubah</p>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1.5">
                    <Shield size={13} className="text-slate-400" />
                    <span>Status Keanggotaan</span>
                  </span>
                  <div className="pt-0.5">
                    <Badge variant={memberData?.status || 'Aktif'} size="sm" dot>
                      {memberData?.status || 'Aktif'}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-slate-400">Status dikelola oleh petugas</p>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1.5">
                    <Shield size={13} className="text-indigo-600" />
                    <span>Hak Akses Akun</span>
                  </span>
                  <p className="font-semibold text-slate-800 text-sm mt-0.5">
                    Administrator Perpustakaan
                  </p>
                </div>
                <Badge variant="Aktif" size="sm" dot>
                  Admin Utama
                </Badge>
              </div>
            )}

            {/* Peringatan jika akun anggota tidak aktif */}
            {isMember && memberData?.status === 'Tidak Aktif' && (
              <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-lg flex items-center gap-2">
                <ShieldAlert size={16} className="text-amber-600 shrink-0" />
                <span>
                  Akun Anda saat ini berstatus <strong>Tidak Aktif</strong>. Anda tetap dapat memperbarui profil, namun tidak dapat mengajukan peminjaman buku baru sebelum diaktifkan oleh petugas.
                </span>
              </div>
            )}

            {/* Input Nama & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Nama Lengkap"
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
                }}
                leftIcon={<User size={16} />}
                error={errors.name}
                required
              />

              <Input
                label="Alamat Email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
                }}
                leftIcon={<Mail size={16} />}
                error={errors.email}
                required
                helperText="Digunakan sebagai username saat login"
              />
            </div>

            {/* Input Khusus Anggota: Nomor HP & Alamat */}
            {isMember && (
              <>
                <Input
                  label="Nomor Telepon / WhatsApp"
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

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                    <span>
                      Alamat Domisili <span className="text-rose-500">*</span>
                    </span>
                    <span className="text-[11px] font-normal text-slate-400">Minimal 5 karakter</span>
                  </label>
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
                  {errors.address && (
                    <p className="text-xs text-rose-600 font-medium">{errors.address}</p>
                  )}
                </div>
              </>
            )}
          </div>
        </Card>

        {/* 2. KARTU UBAH PASSWORD (OPSIONAL) */}
        <Card noPadding className="border border-slate-200/90 shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <KeyRound size={16} className="text-indigo-600" />
              <h2 className="text-sm font-bold text-slate-900">Ubah Password</h2>
            </div>
            <span className="text-[11px] text-slate-400">Opsional</span>
          </div>

          <div className="p-6 space-y-4">
            <p className="text-xs text-slate-500">
              Biarkan ketiga isian di bawah ini kosong jika Anda tidak ingin mengubah password akun Anda saat ini.
            </p>

            <Input
              label="Password Saat Ini"
              type="password"
              placeholder="Masukkan password saat ini untuk konfirmasi"
              value={currentPassword}
              onChange={(e) => {
                setCurrentPassword(e.target.value);
                if (errors.currentPassword) setErrors((prev) => ({ ...prev, currentPassword: '' }));
              }}
              leftIcon={<Lock size={16} />}
              error={errors.currentPassword}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              />
            </div>
          </div>
        </Card>

        {/* Footer Submit Button */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            type="submit"
            size="md"
            isLoading={isLoading}
            icon={<Save size={16} />}
          >
            Simpan Perubahan
          </Button>
        </div>
      </form>
    </div>
  );
};
