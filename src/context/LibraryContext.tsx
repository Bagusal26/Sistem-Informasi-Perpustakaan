import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Book, Member, Borrowing, MemberStatus } from '../types';
import { INITIAL_BOOKS, INITIAL_MEMBERS, INITIAL_BORROWINGS } from '../data/mockData';

interface LibraryContextType {
  // Data
  books: Book[];
  members: Member[];
  borrowings: Borrowing[];

  // Operasi Buku
  addBook: (book: Omit<Book, 'id'>) => { success: boolean; message: string; bookId?: string };
  updateBook: (id: string, updated: Partial<Book>) => { success: boolean; message: string };
  toggleArchiveBook: (id: string) => { success: boolean; message: string };
  deleteBook: (id: string) => { success: boolean; message: string };

  // Operasi Anggota
  getNextMemberId: () => string;
  addMember: (member: Omit<Member, 'id' | 'registeredAt'>) => { success: boolean; message: string; memberId?: string };
  addMemberDirect: (member: Member) => { success: boolean; message: string; memberId?: string };
  updateMember: (id: string, updated: Partial<Member>) => { success: boolean; message: string };
  updateMemberStatus: (id: string, status: MemberStatus) => { success: boolean; message: string };

  // Operasi Peminjaman & Pengembalian (Centralized Stock Management)
  createBorrowing: (memberId: string, bookId: string, notes?: string) => { success: boolean; message: string; borrowingId?: string };
  returnBook: (borrowingId: string) => { success: boolean; message: string };

  // Reset Mock Data
  resetToInitialData: () => void;
}

const LibraryContext = createContext<LibraryContextType | undefined>(undefined);

const STORAGE_KEYS = {
  BOOKS: 'sip_library_books',
  MEMBERS: 'sip_library_members',
  BORROWINGS: 'sip_library_borrowings',
};

export const LibraryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // State Buku
  const [books, setBooks] = useState<Book[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.BOOKS);
      return stored ? JSON.parse(stored) : INITIAL_BOOKS;
    } catch {
      return INITIAL_BOOKS;
    }
  });

  // State Anggota
  const [members, setMembers] = useState<Member[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.MEMBERS);
      return stored ? JSON.parse(stored) : INITIAL_MEMBERS;
    } catch {
      return INITIAL_MEMBERS;
    }
  });

  // State Peminjaman
  const [borrowings, setBorrowings] = useState<Borrowing[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.BORROWINGS);
      return stored ? JSON.parse(stored) : INITIAL_BORROWINGS;
    } catch {
      return INITIAL_BORROWINGS;
    }
  });

  // Sinkronisasi ke LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BOOKS, JSON.stringify(books));
  }, [books]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(members));
  }, [members]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BORROWINGS, JSON.stringify(borrowings));
  }, [borrowings]);

  // ==================== OPERASI BUKU ====================
  const addBook = (bookData: Omit<Book, 'id'>) => {
    // Validasi kode/ISBN duplikat
    const codeExists = books.some(
      (b) => b.code.toLowerCase() === bookData.code.trim().toLowerCase()
    );
    if (codeExists) {
      return { success: false, message: `Kode buku "${bookData.code}" sudah digunakan.` };
    }

    if (bookData.stock < 0) {
      return { success: false, message: 'Jumlah stok tidak boleh bernilai negatif.' };
    }

    const newId = `BK-${String(books.length + 1).padStart(3, '0')}`;
    const newBook: Book = {
      ...bookData,
      id: newId,
      code: bookData.code.trim(),
      stock: Number(bookData.stock) || 0,
      isActive: true,
    };

    setBooks((prev) => [newBook, ...prev]);
    return { success: true, message: 'Buku berhasil ditambahkan.', bookId: newId };
  };

  const updateBook = (id: string, updated: Partial<Book>) => {
    const existing = books.find((b) => b.id === id);
    if (!existing) {
      return { success: false, message: 'Data buku tidak ditemukan.' };
    }

    if (updated.stock !== undefined && updated.stock < 0) {
      return { success: false, message: 'Jumlah stok tidak boleh negatif.' };
    }

    // Jika kode diubah, cek duplikat selain buku ini
    if (updated.code && updated.code.toLowerCase() !== existing.code.toLowerCase()) {
      const codeExists = books.some(
        (b) => b.id !== id && b.code.toLowerCase() === updated.code?.trim().toLowerCase()
      );
      if (codeExists) {
        return { success: false, message: `Kode buku "${updated.code}" sudah digunakan oleh buku lain.` };
      }
    }

    setBooks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...updated } : b))
    );
    return { success: true, message: 'Data buku berhasil diperbarui.' };
  };

  const toggleArchiveBook = (id: string) => {
    const existing = books.find((b) => b.id === id);
    if (!existing) {
      return { success: false, message: 'Buku tidak ditemukan.' };
    }
    const nextStatus = !existing.isActive;
    setBooks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, isActive: nextStatus } : b))
    );
    return {
      success: true,
      message: nextStatus ? 'Buku berhasil diaktifkan.' : 'Buku berhasil dinonaktifkan.',
    };
  };

  const deleteBook = (id: string) => {
    // Cek apakah buku memiliki riwayat peminjaman aktif
    const hasActiveBorrowing = borrowings.some(
      (trx) => trx.bookId === id && (trx.status === 'Dipinjam' || trx.status === 'Terlambat')
    );
    if (hasActiveBorrowing) {
      return {
        success: false,
        message: 'Buku tidak dapat dihapus karena masih tercatat dalam transaksi peminjaman aktif.',
      };
    }

    setBooks((prev) => prev.filter((b) => b.id !== id));
    return { success: true, message: 'Data buku berhasil dihapus.' };
  };

  // ==================== OPERASI ANGGOTA ====================
  const getNextMemberId = () => {
    const existingNums = members.map((m) => {
      const match = m.id.match(/\d+/);
      return match ? parseInt(match[0], 10) : 0;
    });
    const nextNum = Math.max(0, ...existingNums) + 1;
    return `MBR-${String(nextNum).padStart(3, '0')}`;
  };

  const addMember = (memberData: Omit<Member, 'id' | 'registeredAt'>) => {
    const emailExists = members.some(
      (m) => m.email.toLowerCase() === memberData.email.trim().toLowerCase()
    );
    if (emailExists) {
      return { success: false, message: `Email "${memberData.email}" sudah terdaftar sebagai anggota.` };
    }

    const newId = getNextMemberId();
    const today = new Date().toISOString().split('T')[0];
    const newMember: Member = {
      ...memberData,
      id: newId,
      registeredAt: today,
      status: memberData.status || 'Aktif',
    };

    setMembers((prev) => [newMember, ...prev]);
    return { success: true, message: 'Anggota berhasil ditambahkan.', memberId: newId };
  };

  const addMemberDirect = (newMember: Member) => {
    const emailExists = members.some(
      (m) => m.email.toLowerCase() === newMember.email.trim().toLowerCase()
    );
    if (emailExists) {
      return { success: false, message: 'Email sudah terdaftar.' };
    }

    setMembers((prev) => [newMember, ...prev]);
    return { success: true, message: 'Anggota berhasil ditambahkan.', memberId: newMember.id };
  };

  const updateMember = (id: string, updated: Partial<Member>) => {
    const existing = members.find((m) => m.id === id);
    if (!existing) {
      return { success: false, message: 'Data anggota tidak ditemukan.' };
    }

    if (updated.email && updated.email.toLowerCase() !== existing.email.toLowerCase()) {
      const emailExists = members.some(
        (m) => m.id !== id && m.email.toLowerCase() === updated.email?.trim().toLowerCase()
      );
      if (emailExists) {
        return { success: false, message: `Email "${updated.email}" sudah digunakan anggota lain.` };
      }
    }

    setMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...updated } : m))
    );
    return { success: true, message: 'Data anggota berhasil diperbarui.' };
  };

  const updateMemberStatus = (id: string, status: MemberStatus) => {
    const existing = members.find((m) => m.id === id);
    if (!existing) {
      return { success: false, message: 'Anggota tidak ditemukan.' };
    }
    setMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, status } : m))
    );
    const msg = status === 'Aktif' ? 'Anggota berhasil diaktifkan.' : 'Anggota berhasil dinonaktifkan.';
    return { success: true, message: msg };
  };

  // ==================== OPERASI PEMINJAMAN & PENGEMBALIAN ====================
  const createBorrowing = (memberId: string, bookId: string, notes?: string) => {
    // 1. Verifikasi Anggota
    const member = members.find((m) => m.id === memberId);
    if (!member) {
      return { success: false, message: 'Data anggota tidak ditemukan.' };
    }
    if (member.status !== 'Aktif') {
      return {
        success: false,
        message: 'Peminjaman tidak dapat dilakukan karena akun anggota tidak aktif.',
      };
    }

    // 2. Verifikasi Buku
    const book = books.find((b) => b.id === bookId);
    if (!book) {
      return { success: false, message: 'Data buku tidak ditemukan.' };
    }
    if (!book.isActive) {
      return { success: false, message: 'Buku sedang tidak tersedia.' };
    }
    if (book.stock <= 0) {
      return { success: false, message: 'Buku sedang tidak tersedia (stok habis).' };
    }

    // 3. Batas Peminjaman: Tanggal hari ini + 7 hari jatuh tempo
    const now = new Date();
    const borrowedAt = now.toISOString().split('T')[0];
    const due = new Date();
    due.setDate(due.getDate() + 7);
    const dueDate = due.toISOString().split('T')[0];

    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    let counter = borrowings.length + 1;
    let borrowingId = `TRX-${dateStr}-${String(counter).padStart(3, '0')}`;
    while (borrowings.some((b) => b.id === borrowingId)) {
      counter++;
      borrowingId = `TRX-${dateStr}-${String(counter).padStart(3, '0')}`;
    }

    const newBorrowing: Borrowing = {
      id: borrowingId,
      memberId,
      bookId,
      borrowedAt,
      dueDate,
      returnedAt: null,
      status: 'Dipinjam',
      notes: notes || 'Peminjaman melalui sistem web.',
    };

    // 4. Logika Sentral: Kurangi Stok Buku secara Atomik di State
    setBooks((prevBooks) =>
      prevBooks.map((b) => (b.id === bookId ? { ...b, stock: Math.max(0, b.stock - 1) } : b))
    );

    // 5. Tambah transaksi
    setBorrowings((prev) => [newBorrowing, ...prev]);

    return {
      success: true,
      message: 'Peminjaman buku berhasil.',
      borrowingId,
    };
  };

  const returnBook = (borrowingId: string) => {
    const borrowing = borrowings.find((b) => b.id === borrowingId);
    if (!borrowing) {
      return { success: false, message: 'Data transaksi peminjaman tidak ditemukan.' };
    }

    if (borrowing.status === 'Dikembalikan') {
      return { success: false, message: 'Buku pada transaksi ini sudah pernah dikembalikan.' };
    }

    const today = new Date().toISOString().split('T')[0];

    // 1. Perbarui status transaksi (tetap disimpan, tidak dihapus!)
    setBorrowings((prev) =>
      prev.map((item) =>
        item.id === borrowingId
          ? {
              ...item,
              status: 'Dikembalikan',
              returnedAt: today,
            }
          : item
      )
    );

    // 2. Logika Sentral: Tambah Stok Buku kembali (+1)
    setBooks((prevBooks) =>
      prevBooks.map((b) => (b.id === borrowing.bookId ? { ...b, stock: b.stock + 1 } : b))
    );

    return { success: true, message: 'Buku berhasil dikembalikan.' };
  };

  const resetToInitialData = () => {
    setBooks(INITIAL_BOOKS);
    setMembers(INITIAL_MEMBERS);
    setBorrowings(INITIAL_BORROWINGS);
    localStorage.removeItem(STORAGE_KEYS.BOOKS);
    localStorage.removeItem(STORAGE_KEYS.MEMBERS);
    localStorage.removeItem(STORAGE_KEYS.BORROWINGS);
  };

  return (
    <LibraryContext.Provider
      value={{
        books,
        members,
        borrowings,
        addBook,
        updateBook,
        toggleArchiveBook,
        deleteBook,
        getNextMemberId,
        addMember,
        addMemberDirect,
        updateMember,
        updateMemberStatus,
        createBorrowing,
        returnBook,
        resetToInitialData,
      }}
    >
      {children}
    </LibraryContext.Provider>
  );
};

export const useLibrary = (): LibraryContextType => {
  const context = useContext(LibraryContext);
  if (!context) {
    throw new Error('useLibrary must be used within a LibraryProvider');
  }
  return context;
};
