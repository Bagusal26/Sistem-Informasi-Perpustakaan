import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React, { ReactNode } from 'react';
import { AuthProvider, useAuth } from '../src/context/AuthContext';
import { LibraryProvider } from '../src/context/LibraryContext';

const wrapper = ({ children }: { children: ReactNode }) => (
  <LibraryProvider>
    <AuthProvider>{children}</AuthProvider>
  </LibraryProvider>
);

describe('Authentication & Forgot Password Flows', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('Test 1: Login dengan credential valid berhasil membuat session dan role yang sesuai', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    let loginRes: { success: boolean; message: string; role?: string } = { success: false, message: '' };
    await act(async () => {
      loginRes = await result.current.login('admin@perpustakaan.test', 'admin123');
    });

    expect(loginRes.success).toBe(true);
    expect(loginRes.role).toBe('admin');
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.currentUser?.email).toBe('admin@perpustakaan.test');
    expect(result.current.role).toBe('admin');
  });

  it('Test 2: Login dengan password salah gagal dan tidak membuat session valid', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    let loginRes: { success: boolean; message: string } = { success: false, message: '' };
    await act(async () => {
      loginRes = await result.current.login('admin@perpustakaan.test', 'passwordSalah123');
    });

    expect(loginRes.success).toBe(false);
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.currentUser).toBeNull();
    expect(result.current.role).toBeNull();
  });

  it('Test 3: Register anggota dengan data valid berhasil tersimpan dalam sistem', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    const newMemberData = {
      name: 'Testing User Baru',
      email: 'userbaru@test.local',
      password: 'password123',
      confirmPassword: 'password123',
      phone: '081299887766',
      address: 'Jl. Pengujian No. 99, Jakarta',
    };

    let regRes: { success: boolean; message: string } = { success: false, message: '' };
    await act(async () => {
      regRes = await result.current.register(newMemberData);
    });

    expect(regRes.success).toBe(true);

    // Verifikasi user baru dapat login dengan password yang didaftarkan
    let loginRes: { success: boolean; message: string; role?: string } = { success: false, message: '' };
    await act(async () => {
      loginRes = await result.current.login('userbaru@test.local', 'password123');
    });

    expect(loginRes.success).toBe(true);
    expect(loginRes.role).toBe('member');
    expect(result.current.currentUser?.name).toBe('Testing User Baru');
  });

  it('Test 4: Register menggunakan email yang sudah digunakan ditolak dan tidak menduplikasi akun', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    const duplicateData = {
      name: 'User Duplikat',
      email: 'anggota@perpustakaan.test', // Email yang sudah ada di INITIAL_USERS
      password: 'password123',
      confirmPassword: 'password123',
      phone: '081211223344',
      address: 'Jl. Duplikat No. 1',
    };

    let regRes: { success: boolean; message: string } = { success: false, message: '' };
    await act(async () => {
      regRes = await result.current.register(duplicateData);
    });

    expect(regRes.success).toBe(false);
    expect(regRes.message).toMatch(/Email sudah terdaftar/i);
  });

  it('Test 5: Forgot Password dengan email valid mereset password dan password baru dapat digunakan login', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    // Step 1: Check email reset
    const checkRes = result.current.checkEmailForReset('anggota@perpustakaan.test');
    expect(checkRes.success).toBe(true);

    // Step 2: Reset password
    let resetRes: { success: boolean; message: string } = { success: false, message: '' };
    await act(async () => {
      resetRes = await result.current.resetPassword('anggota@perpustakaan.test', 'passwordBaru2026', 'passwordBaru2026');
    });
    expect(resetRes.success).toBe(true);

    // Step 3: Login dengan password lama harus gagal
    let oldLoginRes: { success: boolean; message: string } = { success: false, message: '' };
    await act(async () => {
      oldLoginRes = await result.current.login('anggota@perpustakaan.test', 'anggota123');
    });
    expect(oldLoginRes.success).toBe(false);

    // Step 4: Login dengan password baru harus berhasil
    let newLoginRes: { success: boolean; message: string; role?: string } = { success: false, message: '' };
    await act(async () => {
      newLoginRes = await result.current.login('anggota@perpustakaan.test', 'passwordBaru2026');
    });
    expect(newLoginRes.success).toBe(true);
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.currentUser?.email).toBe('anggota@perpustakaan.test');
  });
});
