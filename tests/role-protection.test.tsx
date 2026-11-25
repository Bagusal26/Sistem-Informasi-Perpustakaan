import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from '../src/routes/ProtectedRoute';
import { AuthProvider } from '../src/context/AuthContext';
import { LibraryProvider } from '../src/context/LibraryContext';
import { User } from '../src/types';

const AUTH_STORAGE_KEY = 'sip_auth_session';

const renderProtectedRouteTest = (initialEntry: string) => {
  return render(
    <LibraryProvider>
      <AuthProvider>
        <MemoryRouter initialEntries={[initialEntry]}>
          <Routes>
            <Route path="/login" element={<div>Halaman Login Publik</div>} />
            <Route path="/member/catalog" element={<div>Katalog Anggota</div>} />
            <Route path="/admin/dashboard" element={<div>Dashboard Admin</div>} />
            <Route
              path="/admin/books"
              element={
                <ProtectedRoute allowedRole="admin">
                  <div>Halaman Kelola Buku Admin</div>
                </ProtectedRoute>
              }
            />
            <Route
              path="/member/borrowings"
              element={
                <ProtectedRoute allowedRole="member">
                  <div>Halaman Peminjaman Anggota</div>
                </ProtectedRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    </LibraryProvider>
  );
};

describe('Role Protection & Route Security', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('Test 11: Member yang mencoba mengakses route admin dialihkan ke katalog anggota', () => {
    // Simpan session member di localStorage sebelum render
    const memberSession: User = {
      id: 'USR-002',
      name: 'Ahmad Fauzi',
      email: 'anggota@perpustakaan.test',
      role: 'member',
      memberId: 'MBR-001',
    };
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(memberSession));

    renderProtectedRouteTest('/admin/books');

    // Karena role adalah member dan mencoba akses allowedRole="admin", harus dialihkan ke /member/catalog
    expect(screen.getByText('Katalog Anggota')).toBeInTheDocument();
    expect(screen.queryByText('Halaman Kelola Buku Admin')).not.toBeInTheDocument();
  });

  it('Test 12: Admin yang mengakses route admin diperbolehkan dan konten admin dirender', () => {
    // Simpan session admin di localStorage sebelum render
    const adminSession: User = {
      id: 'USR-001',
      name: 'Budi Santoso (Petugas)',
      email: 'admin@perpustakaan.test',
      role: 'admin',
    };
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(adminSession));

    renderProtectedRouteTest('/admin/books');

    // Admin diperbolehkan mengakses halaman admin
    expect(screen.getByText('Halaman Kelola Buku Admin')).toBeInTheDocument();
    expect(screen.queryByText('Halaman Login Publik')).not.toBeInTheDocument();
  });

  it('Test 13: Pengguna yang belum login dialihkan ke halaman login saat mengakses route terproteksi', () => {
    // Tanpa login (localStorage bersih)
    renderProtectedRouteTest('/admin/books');

    // Belum login harus dialihkan ke /login
    expect(screen.getByText('Halaman Login Publik')).toBeInTheDocument();
    expect(screen.queryByText('Halaman Kelola Buku Admin')).not.toBeInTheDocument();
  });
});
