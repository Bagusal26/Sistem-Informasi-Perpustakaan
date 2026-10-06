import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  Users,
  ArrowLeftRight,
  BarChart3,
  LogOut,
  X,
  UserCog,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { AppLogo } from '../ui/AppLogo';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { currentUser, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    showToast('info', 'Anda telah berhasil keluar dari sistem.');
    navigate('/login');
  };

  const navItems = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Data Buku', path: '/admin/books', icon: BookOpen },
    { label: 'Data Anggota', path: '/admin/members', icon: Users },
    { label: 'Peminjaman', path: '/admin/borrowings', icon: ArrowLeftRight },
    { label: 'Laporan', path: '/admin/reports', icon: BarChart3 },
    { label: 'Profil Admin', path: '/admin/profile', icon: UserCog },
  ];

  const getInitials = (name?: string) => {
    if (!name) return 'A';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <>
      {/* Backdrop Mobile & Tablet */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 lg:hidden backdrop-blur-xs transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Aside Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
        aria-label="Sidebar Navigasi Admin"
      >
        {/* Brand Header */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <AppLogo className="w-9 h-9 rounded-lg" />
            <div>
              <h1 className="font-semibold text-white text-sm tracking-tight leading-none">
                SIP Perpustakaan
              </h1>
              <p className="text-[11px] text-slate-400 mt-1 font-normal">Panel Petugas</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            aria-label="Tutup navigasi"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation List */}
        <div className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
            Menu Utama
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                      : 'text-slate-400 hover:bg-slate-800/70 hover:text-slate-100'
                  }`
                }
              >
                <Icon size={17} className="shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>

        {/* User Identity & Logout at Bottom */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/40">
          <NavLink
            to="/admin/profile"
            onClick={onClose}
            className="flex items-center gap-3 p-2.5 rounded-lg bg-slate-800/50 hover:bg-slate-800 border border-slate-800/80 mb-2 transition-colors group"
            title="Pengaturan Profil Admin"
          >
            <div className="w-8 h-8 rounded-full bg-slate-700 group-hover:bg-indigo-600 text-slate-200 group-hover:text-white flex items-center justify-center font-bold text-xs shrink-0 transition-colors">
              {getInitials(currentUser?.name)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-slate-100 group-hover:text-white truncate transition-colors">
                {currentUser?.name || 'Petugas'}
              </p>
              <p className="text-[11px] text-slate-400 group-hover:text-slate-300 truncate transition-colors">{currentUser?.email}</p>
            </div>
          </NavLink>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-rose-400 hover:bg-rose-950/30 hover:text-rose-300 rounded-lg transition-colors border border-transparent hover:border-rose-900/30"
          >
            <LogOut size={15} />
            <span>Keluar Sistem</span>
          </button>
        </div>
      </aside>
    </>
  );
};
