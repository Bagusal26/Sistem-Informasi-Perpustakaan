export type UserRole = 'admin' | 'member';

export type MemberStatus = 'Aktif' | 'Tidak Aktif';

export type BorrowingStatus = 'Menunggu' | 'Dipinjam' | 'Dikembalikan' | 'Terlambat';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  memberId?: string; // Tautan ke ID Member jika user adalah anggota
}

export interface Book {
  id: string;
  code: string;
  isbn?: string;
  title: string;
  author: string;
  publisher: string;
  year: number;
  category: string;
  description: string;
  cover: string;
  stock: number;
  isActive: boolean;
}

export interface Member {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  registeredAt: string;
  status: MemberStatus;
}

export interface Borrowing {
  id: string;
  memberId: string; // Relasi ke Member.id
  bookId: string;   // Relasi ke Book.id
  borrowedAt: string;
  dueDate: string;
  returnedAt?: string | null;
  status: BorrowingStatus;
  notes?: string;
}

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
}
