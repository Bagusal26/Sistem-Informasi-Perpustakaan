import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole, Member } from '../types';
import { INITIAL_USERS } from '../data/mockData';
import { useLibrary } from './LibraryContext';

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword?: string;
  phone: string;
  address: string;
}

export interface UpdateProfileData {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  role: UserRole | null;
  users: User[];
  login: (email: string, password: string) => Promise<{ success: boolean; message: string; role?: UserRole }>;
  register: (data: RegisterData) => Promise<{ success: boolean; message: string }>;
  checkEmailForReset: (email: string) => { success: boolean; message: string; role?: UserRole; name?: string };
  resetPassword: (email: string, newPassword: string, confirmPassword?: string) => Promise<{ success: boolean; message: string }>;
  updateProfile: (data: UpdateProfileData) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  syncUserWithMember: (memberId: string, updated: { name?: string; email?: string }) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'sip_auth_session';
const USERS_STORAGE_KEY = 'sip_auth_users';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { members, getNextMemberId, addMemberDirect, updateMember } = useLibrary();

  // State Users persisten di localStorage dengan normalisasi 1 Akun Admin resmi
  const [users, setUsers] = useState<User[]>(() => {
    const officialAdmin = INITIAL_USERS.find((u) => u.role === 'admin') || {
      id: 'USR-001',
      name: 'Budi Santoso (Petugas)',
      email: 'admin@perpustakaan.test',
      password: 'admin123',
      role: 'admin',
    };

    try {
      const stored = localStorage.getItem(USERS_STORAGE_KEY);
      if (stored) {
        const parsed: User[] = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Normalisasi: Hanya 1 akun Admin resmi, dan pertahankan seluruh member
          const nonAdminUsers = parsed.filter((u) => u.role !== 'admin');
          return [officialAdmin, ...nonAdminUsers];
        }
      }
      return INITIAL_USERS;
    } catch {
      return INITIAL_USERS;
    }
  });

  useEffect(() => {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  }, [users]);

  // State Current User (Sesi Login)
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, [currentUser]);

  const login = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; message: string; role?: UserRole }> => {
    // Normalisasi input
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      return { success: false, message: 'Email dan password wajib diisi.' };
    }

    const foundUser = users.find(
      (u) => u.email.toLowerCase() === cleanEmail && u.password === cleanPassword
    );

    if (!foundUser) {
      return {
        success: false,
        message: 'Email atau password yang Anda masukkan salah.',
      };
    }

    const sessionUser: User = {
      id: foundUser.id,
      name: foundUser.name,
      email: foundUser.email,
      role: foundUser.role,
      memberId: foundUser.memberId,
    };

    setCurrentUser(sessionUser);
    return { success: true, message: `Selamat datang, ${sessionUser.name}!`, role: sessionUser.role };
  };

  const register = async (
    data: RegisterData
  ): Promise<{ success: boolean; message: string }> => {
    const cleanName = data.name.trim();
    const cleanEmail = data.email.trim().toLowerCase();
    const cleanPassword = data.password ? data.password.trim() : '';
    const cleanConfirm = data.confirmPassword ? data.confirmPassword.trim() : '';
    const cleanPhone = data.phone.trim();
    const cleanAddress = data.address.trim();

    // 1. Validasi semua field wajib diisi
    if (!cleanName || !cleanEmail || !cleanPassword || !cleanPhone || !cleanAddress) {
      return { success: false, message: 'Semua field wajib diisi.' };
    }

    // 2. Format email valid
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return { success: false, message: 'Format alamat email tidak valid.' };
    }

    // 3. Konfirmasi password
    if (data.confirmPassword !== undefined && cleanPassword !== cleanConfirm) {
      return { success: false, message: 'Password dan konfirmasi password harus sama.' };
    }

    // 4. Cek email duplikat pada User maupun Member
    const emailExistsInUsers = users.some(
      (u) => u.email.toLowerCase() === cleanEmail
    );
    const emailExistsInMembers = members.some(
      (m) => m.email.toLowerCase() === cleanEmail
    );

    if (emailExistsInUsers || emailExistsInMembers) {
      return { success: false, message: 'Email sudah terdaftar.' };
    }

    // 5. Generate ID Anggota otomatis: MBR-001, MBR-002, dst.
    const newMemberId = getNextMemberId();
    const today = new Date().toISOString().split('T')[0];

    // 6. Buat data Member baru dengan status Aktif
    const newMember: Member = {
      id: newMemberId,
      name: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
      address: cleanAddress,
      registeredAt: today,
      status: 'Aktif',
    };

    // 7. Simpan Member ke LibraryContext
    const memberRes = addMemberDirect(newMember);
    if (!memberRes.success) {
      return { success: false, message: memberRes.message };
    }

    // 8. Buat data User baru dengan role 'member' dan tautan memberId
    const existingUserNums = users.map((u) => {
      const match = u.id.match(/\d+/);
      return match ? parseInt(match[0], 10) : 0;
    });
    const nextUserNum = Math.max(0, ...existingUserNums) + 1;
    const newUserId = `USR-${String(nextUserNum).padStart(3, '0')}`;

    const newUser: User = {
      id: newUserId,
      name: cleanName,
      email: cleanEmail,
      password: cleanPassword,
      role: 'member',
      memberId: newMemberId,
    };

    // 9. Simpan User ke AuthContext state
    setUsers((prev) => [...prev, newUser]);

    return {
      success: true,
      message: 'Pendaftaran anggota berhasil! Silakan masuk dengan akun Anda.',
    };
  };

  const checkEmailForReset = (
    email: string
  ): { success: boolean; message: string; role?: UserRole; name?: string } => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      return { success: false, message: 'Alamat email wajib diisi.' };
    }

    const foundUser = users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (!foundUser) {
      return { success: false, message: 'Email tidak ditemukan.' };
    }

    if (foundUser.role === 'admin') {
      return {
        success: false,
        message: 'Password akun Admin tidak dapat direset melalui halaman ini.',
      };
    }

    return {
      success: true,
      message: 'Email terverifikasi.',
      role: 'member',
      name: foundUser.name,
    };
  };

  const resetPassword = async (
    email: string,
    newPassword: string,
    confirmPassword?: string
  ): Promise<{ success: boolean; message: string }> => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = newPassword.trim();
    const cleanConfirm = confirmPassword ? confirmPassword.trim() : '';

    if (!cleanPass) {
      return { success: false, message: 'Password baru wajib diisi.' };
    }

    if (cleanPass.length < 6) {
      return { success: false, message: 'Password baru minimal 6 karakter.' };
    }

    if (confirmPassword !== undefined && cleanPass !== cleanConfirm) {
      return { success: false, message: 'Password baru dan konfirmasi harus sama.' };
    }

    const foundIndex = users.findIndex((u) => u.email.toLowerCase() === cleanEmail);
    if (foundIndex === -1) {
      return { success: false, message: 'Email tidak ditemukan.' };
    }

    if (users[foundIndex].role === 'admin') {
      return {
        success: false,
        message: 'Password akun Admin tidak dapat direset melalui halaman ini.',
      };
    }

    setUsers((prev) =>
      prev.map((u) => (u.email.toLowerCase() === cleanEmail ? { ...u, password: cleanPass } : u))
    );

    return {
      success: true,
      message: 'Password berhasil diubah. Silakan login kembali.',
    };
  };

  const updateProfile = async (
    data: UpdateProfileData
  ): Promise<{ success: boolean; message: string }> => {
    if (!currentUser) {
      return { success: false, message: 'Sesi login tidak valid.' };
    }

    const cleanName = data.name.trim();
    const cleanEmail = data.email.trim().toLowerCase();
    const cleanPhone = data.phone ? data.phone.trim() : '';
    const cleanAddress = data.address ? data.address.trim() : '';
    const cleanCurrentPass = data.currentPassword ? data.currentPassword.trim() : '';
    const cleanNewPass = data.newPassword ? data.newPassword.trim() : '';
    const cleanConfirmPass = data.confirmPassword ? data.confirmPassword.trim() : '';

    // 1. Validasi Nama
    if (!cleanName) {
      return { success: false, message: 'Nama lengkap wajib diisi.' };
    }
    if (cleanName.length < 2) {
      return { success: false, message: 'Nama lengkap minimal 2 karakter.' };
    }

    // 2. Validasi Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      return { success: false, message: 'Format alamat email tidak valid.' };
    }

    // 3. Cek Email duplikat (jika email diubah)
    if (cleanEmail !== currentUser.email.toLowerCase()) {
      const emailUsedInUsers = users.some(
        (u) => u.id !== currentUser.id && u.email.toLowerCase() === cleanEmail
      );
      const emailUsedInMembers = members.some(
        (m) => m.id !== currentUser.memberId && m.email.toLowerCase() === cleanEmail
      );
      if (emailUsedInUsers || emailUsedInMembers) {
        return { success: false, message: 'Email sudah terdaftar.' };
      }
    }

    // 4. Validasi khusus Member
    if (currentUser.role === 'member') {
      if (!cleanPhone) {
        return { success: false, message: 'Nomor HP wajib diisi.' };
      }
      const cleanDigits = cleanPhone.replace(/[\s-]/g, '');
      const phoneRegex = /^[0-9+]{8,18}$/;
      if (!phoneRegex.test(cleanDigits)) {
        return { success: false, message: 'Format nomor HP tidak valid (minimal 8-18 digit angka).' };
      }

      if (!cleanAddress) {
        return { success: false, message: 'Alamat domisili wajib diisi.' };
      }
      if (cleanAddress.length < 5) {
        return { success: false, message: 'Alamat domisili minimal 5 karakter.' };
      }
    }

    // 5. Validasi Perubahan Password (jika diisi)
    const isChangingPassword = Boolean(cleanCurrentPass || cleanNewPass || cleanConfirmPass);
    let finalPassword: string | undefined = undefined;

    if (isChangingPassword) {
      const userRecord = users.find((u) => u.id === currentUser.id);
      if (!userRecord || userRecord.password !== cleanCurrentPass) {
        return { success: false, message: 'Password saat ini salah.' };
      }
      if (!cleanNewPass) {
        return { success: false, message: 'Password baru wajib diisi.' };
      }
      if (cleanNewPass.length < 6) {
        return { success: false, message: 'Password baru minimal 6 karakter.' };
      }
      if (cleanNewPass !== cleanConfirmPass) {
        return { success: false, message: 'Password baru dan konfirmasi harus sama.' };
      }
      finalPassword = cleanNewPass;
    }

    // 6. Update User di AuthContext / users state
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === currentUser.id) {
          return {
            ...u,
            name: cleanName,
            email: cleanEmail,
            ...(finalPassword ? { password: finalPassword } : {}),
          };
        }
        return u;
      })
    );

    // 7. Update Sesi currentUser
    setCurrentUser((prev) => (prev ? { ...prev, name: cleanName, email: cleanEmail } : null));

    // 8. Sinkronisasi ke Member jika role member
    if (currentUser.role === 'member' && currentUser.memberId) {
      updateMember(currentUser.memberId, {
        name: cleanName,
        email: cleanEmail,
        phone: cleanPhone,
        address: cleanAddress,
      });
    }

    return {
      success: true,
      message: isChangingPassword
        ? 'Profil dan password berhasil diperbarui.'
        : 'Profil berhasil diperbarui.',
    };
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  const syncUserWithMember = (memberId: string, updated: { name?: string; email?: string }) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.memberId === memberId) {
          return {
            ...u,
            ...(updated.name ? { name: updated.name } : {}),
            ...(updated.email ? { email: updated.email.toLowerCase() } : {}),
          };
        }
        return u;
      })
    );
    if (currentUser?.memberId === memberId) {
      setCurrentUser((prev) =>
        prev
          ? {
              ...prev,
              ...(updated.name ? { name: updated.name } : {}),
              ...(updated.email ? { email: updated.email.toLowerCase() } : {}),
            }
          : null
      );
    }
  };

  const isAuthenticated = !!currentUser;
  const role = currentUser ? currentUser.role : null;

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated,
        role,
        users,
        login,
        register,
        checkEmailForReset,
        resetPassword,
        updateProfile,
        logout,
        syncUserWithMember,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
