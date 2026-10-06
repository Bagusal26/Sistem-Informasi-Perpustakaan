import React, { useState } from 'react';
import { Outlet, useLocation, useNavigate, NavLink } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Menu, LogOut, ChevronRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const AdminLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { currentUser, logout } = useAuth();
  const { showToast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  // Dynamic Page Title
  const getPageInfo = () => {
    const path = location.pathname;
    if (path.includes('/admin/dashboard')) return { title: 'Dashboard', section: 'Admin' };
    if (path.includes('/admin/books/create')) return { title: 'Tambah Buku', section: 'Data Buku' };
    if (path.includes('/admin/books/edit')) return { title: 'Edit Buku', section: 'Data Buku' };
    if (path.includes('/admin/books')) return { title: 'Data Buku', section: 'Katalog' };
    if (path.includes('/admin/members/create')) return { title: 'Tambah Anggota', section: 'Data Anggota' };
    if (path.includes('/admin/members/edit')) return { title: 'Edit Anggota', section: 'Data Anggota' };
    if (path.includes('/admin/members')) return { title: 'Data Anggota', section: 'Keanggotaan' };
    if (path.includes('/admin/borrowings')) return { title: 'Peminjaman & Sirkulasi', section: 'Sirkulasi' };
    if (path.includes('/admin/reports')) return { title: 'Laporan Perpustakaan', section: 'Laporan' };
    if (path.includes('/admin/profile')) return { title: 'Pengaturan Profil', section: 'Profil' };
    return { title: 'Admin Panel', section: 'Admin' };
  };

  const pageInfo = getPageInfo();

  const handleLogout = () => {
    logout();
    showToast('info', 'Anda telah berhasil keluar dari sistem.');
    navigate('/login');
  };

  const getInitials = (name?: string) => {
    if (!name) return 'A';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex">
      {/* Sidebar Nav */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:pl-64 min-w-0">
        {/* Topbar Header */}
        <header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Left: Mobile Toggle & Breadcrumb */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              aria-label="Buka Menu Navigasi"
            >
              <Menu size={19} />
            </button>

            <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className="font-medium text-slate-400">Admin</span>
              <ChevronRight size={13} className="text-slate-400" />
              <span className="font-semibold text-slate-800">{pageInfo.title}</span>
            </nav>
          </div>

          {/* Right: User Profile & Quick Logout */}
          <div className="flex items-center gap-3 sm:gap-4">
            <NavLink
              to="/admin/profile"
              className="flex items-center gap-3 p-1.5 pr-2.5 rounded-xl hover:bg-slate-100 transition-colors group"
              title="Buka Pengaturan Profil Admin"
            >
              <div className="text-right">
                <p className="text-xs font-semibold text-slate-900 leading-tight group-hover:text-indigo-600 transition-colors">
                  {currentUser?.name || 'Administrator'}
                </p>
                <span className="inline-block text-[10px] font-medium text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full mt-0.5">
                  Admin / Petugas
                </span>
              </div>

              <div
                className="w-8 h-8 rounded-full bg-slate-800 group-hover:bg-indigo-600 text-slate-100 flex items-center justify-center font-bold text-xs ring-2 ring-slate-100 select-none shrink-0 transition-colors"
              >
                {getInitials(currentUser?.name)}
              </div>
            </NavLink>

            <div className="h-5 w-px bg-slate-200 hidden sm:block" />

            <button
              onClick={handleLogout}
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors hidden sm:flex items-center gap-1.5 text-xs font-medium"
              title="Keluar dari sistem"
              aria-label="Logout"
            >
              <LogOut size={16} />
              <span className="hidden md:inline">Keluar</span>
            </button>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
