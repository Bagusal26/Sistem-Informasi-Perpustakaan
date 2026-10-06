import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { BookOpen, Clock, History, LogOut, Menu, X, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { AppLogo } from '../ui/AppLogo';

export const Navbar: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    showToast('info', 'Anda telah berhasil keluar.');
    navigate('/login');
  };

  const navLinks = [
    { label: 'Katalog Buku', path: '/member/catalog', icon: BookOpen },
    { label: 'Peminjaman Saya', path: '/member/borrowings', icon: Clock },
    { label: 'Riwayat', path: '/member/history', icon: History },
  ];

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Brand */}
          <div className="flex items-center gap-3">
            <NavLink to="/member/catalog" className="flex items-center gap-2.5">
              <AppLogo className="w-8 h-8" />
              <span className="font-semibold text-slate-900 text-sm sm:text-base tracking-tight">
                Sistem Informasi Perpustakaan
              </span>
            </NavLink>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.path}
                  to={link.path}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-700 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`
                  }
                >
                  <Icon size={16} />
                  <span>{link.label}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* User info & Logout */}
          <div className="hidden md:flex items-center gap-3">
            <NavLink
              to="/member/profile"
              className={({ isActive }) =>
                `flex items-center gap-2.5 p-1.5 pr-3 rounded-xl transition-colors ${
                  isActive
                    ? 'bg-indigo-50 border border-indigo-200 text-indigo-900'
                    : 'hover:bg-slate-100 text-slate-800'
                }`
              }
              title="Buka Pengaturan Profil"
            >
              <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-semibold text-xs border border-indigo-200 shrink-0">
                <User size={14} />
              </div>
              <div className="text-left">
                <p className="text-xs font-semibold text-slate-800 leading-tight">
                  {currentUser?.name || 'Anggota'}
                </p>
                <span className="text-[10px] text-indigo-600 font-medium">Profil Saya</span>
              </div>
            </NavLink>

            <button
              onClick={handleLogout}
              className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              title="Keluar"
              aria-label="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>

          {/* Mobile hamburger button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1">
          <NavLink
            to="/member/profile"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-between p-3 bg-slate-50 hover:bg-indigo-50/60 rounded-lg border border-slate-100 mb-2 transition-colors"
          >
            <div>
              <p className="text-xs font-semibold text-slate-800">{currentUser?.name}</p>
              <p className="text-[11px] text-slate-500">{currentUser?.email}</p>
            </div>
            <span className="text-xs font-medium text-indigo-600">Profil &rarr;</span>
          </NavLink>

          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 font-semibold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`
                }
              >
                <Icon size={18} />
                <span>{link.label}</span>
              </NavLink>
            );
          })}

          <NavLink
            to="/member/profile"
            onClick={() => setMobileMenuOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium ${
                isActive
                  ? 'bg-indigo-50 text-indigo-700 font-semibold'
                  : 'text-slate-700 hover:bg-slate-50'
              }`
            }
          >
            <User size={18} />
            <span>Pengaturan Profil</span>
          </NavLink>

          <div className="pt-2">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 rounded-lg"
            >
              <LogOut size={18} />
              <span>Keluar</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
