import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Home } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const NotFoundPage: React.FC = () => {
  const { role, isAuthenticated } = useAuth();

  const homePath = !isAuthenticated
    ? '/login'
    : role === 'admin'
    ? '/admin/dashboard'
    : '/member/catalog';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
      <div className="text-6xl font-black text-indigo-600 mb-2">404</div>
      <h1 className="text-xl font-bold text-slate-900">Halaman Tidak Ditemukan</h1>
      <p className="text-xs text-slate-500 max-w-sm mt-1 mb-6">
        Tautan yang Anda tuju mungkin salah, telah dipindahkan, atau Anda tidak memiliki hak akses.
      </p>
      <Link to={homePath}>
        <Button icon={<Home size={16} />}>Kembali ke Halaman Utama</Button>
      </Link>
    </div>
  );
};
