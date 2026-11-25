import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React, { ReactNode } from 'react';
import { LibraryProvider, useLibrary } from '../src/context/LibraryContext';

const wrapper = ({ children }: { children: ReactNode }) => (
  <LibraryProvider>{children}</LibraryProvider>
);

describe('Borrowing & Return Business Rules', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('Test 6: Peminjaman dengan Anggota Aktif, Buku Aktif, dan Stok > 0 berhasil membuat transaksi dan mengurangi stok 1', () => {
    const { result } = renderHook(() => useLibrary(), { wrapper });

    // Cari anggota aktif dan buku dengan stok > 0 (misal BK-001 dengan stok awal 4)
    const activeMember = result.current.members.find((m) => m.status === 'Aktif')!;
    const bookBefore = result.current.books.find((b) => b.id === 'BK-001')!;
    const initialStock = bookBefore.stock;
    expect(initialStock).toBeGreaterThan(0);

    let borrowRes: { success: boolean; message: string; borrowingId?: string } = { success: false, message: '' };
    act(() => {
      borrowRes = result.current.createBorrowing(activeMember.id, bookBefore.id, 'Uji coba peminjaman');
    });

    expect(borrowRes.success).toBe(true);
    expect(borrowRes.borrowingId).toBeDefined();

    // Verifikasi stok buku berkurang 1
    const bookAfter = result.current.books.find((b) => b.id === 'BK-001')!;
    expect(bookAfter.stock).toBe(initialStock - 1);

    // Verifikasi transaksi tercatat dengan status Dipinjam
    const createdTx = result.current.borrowings.find((tx) => tx.id === borrowRes.borrowingId);
    expect(createdTx).toBeDefined();
    expect(createdTx?.status).toBe('Dipinjam');
    expect(createdTx?.returnedAt).toBeNull();
  });

  it('Test 7: Peminjaman pada buku dengan stok 0 ditolak, transaksi tidak dibuat, dan stok tetap 0', () => {
    const { result } = renderHook(() => useLibrary(), { wrapper });

    // BK-005 di mockData memiliki stok = 0
    const outOfStockBook = result.current.books.find((b) => b.id === 'BK-005')!;
    expect(outOfStockBook.stock).toBe(0);

    const activeMember = result.current.members.find((m) => m.status === 'Aktif')!;
    const initialTxCount = result.current.borrowings.length;

    let borrowRes: { success: boolean; message: string; borrowingId?: string } = { success: false, message: '' };
    act(() => {
      borrowRes = result.current.createBorrowing(activeMember.id, outOfStockBook.id);
    });

    expect(borrowRes.success).toBe(false);
    expect(borrowRes.message).toMatch(/stok habis/i);

    // Verifikasi jumlah transaksi tidak bertambah
    expect(result.current.borrowings.length).toBe(initialTxCount);

    // Verifikasi stok tetap 0
    const bookAfter = result.current.books.find((b) => b.id === 'BK-005')!;
    expect(bookAfter.stock).toBe(0);
  });

  it('Test 8: Peminjaman oleh anggota berstatus Tidak Aktif ditolak', () => {
    const { result } = renderHook(() => useLibrary(), { wrapper });

    // MBR-004 di mockData berstatus Tidak Aktif
    const inactiveMember = result.current.members.find((m) => m.status === 'Tidak Aktif')!;
    expect(inactiveMember).toBeDefined();

    const availableBook = result.current.books.find((b) => b.stock > 0)!;
    const initialTxCount = result.current.borrowings.length;

    let borrowRes: { success: boolean; message: string; borrowingId?: string } = { success: false, message: '' };
    act(() => {
      borrowRes = result.current.createBorrowing(inactiveMember.id, availableBook.id);
    });

    expect(borrowRes.success).toBe(false);
    expect(borrowRes.message).toMatch(/tidak aktif/i);
    expect(result.current.borrowings.length).toBe(initialTxCount);
  });

  it('Test 9: Pengembalian buku pada transaksi aktif mengubah status menjadi Dikembalikan, mengisi returnedAt, dan menambah stok 1', () => {
    const { result } = renderHook(() => useLibrary(), { wrapper });

    // TRX-20260915-002 di INITIAL_BORROWINGS berstatus 'Dipinjam' untuk buku BK-004
    const targetTx = result.current.borrowings.find((tx) => tx.id === 'TRX-20260915-002')!;
    expect(targetTx.status).toBe('Dipinjam');

    const bookBefore = result.current.books.find((b) => b.id === targetTx.bookId)!;
    const stockBefore = bookBefore.stock;

    let returnRes: { success: boolean; message: string } = { success: false, message: '' };
    act(() => {
      returnRes = result.current.returnBook(targetTx.id);
    });

    expect(returnRes.success).toBe(true);

    // Verifikasi status transaksi dan returnedAt
    const txAfter = result.current.borrowings.find((tx) => tx.id === targetTx.id)!;
    expect(txAfter.status).toBe('Dikembalikan');
    expect(txAfter.returnedAt).toBeTruthy();

    // Verifikasi stok buku bertambah 1
    const bookAfter = result.current.books.find((b) => b.id === targetTx.bookId)!;
    expect(bookAfter.stock).toBe(stockBefore + 1);
  });

  it('Test 10: Double return protection memastikan transaksi yang sudah Dikembalikan tidak menambah stok ganda', () => {
    const { result } = renderHook(() => useLibrary(), { wrapper });

    // TRX-20260901-001 di INITIAL_BORROWINGS sudah berstatus 'Dikembalikan' untuk BK-001
    const alreadyReturnedTx = result.current.borrowings.find((tx) => tx.id === 'TRX-20260901-001')!;
    expect(alreadyReturnedTx.status).toBe('Dikembalikan');
    const originalReturnedAt = alreadyReturnedTx.returnedAt;

    const bookBefore = result.current.books.find((b) => b.id === alreadyReturnedTx.bookId)!;
    const stockBefore = bookBefore.stock;

    let secondReturnRes: { success: boolean; message: string } = { success: false, message: '' };
    act(() => {
      secondReturnRes = result.current.returnBook(alreadyReturnedTx.id);
    });

    // Operasi kedua harus ditolak
    expect(secondReturnRes.success).toBe(false);
    expect(secondReturnRes.message).toMatch(/sudah pernah dikembalikan/i);

    // Stok buku tidak boleh bertambah lagi
    const bookAfter = result.current.books.find((b) => b.id === alreadyReturnedTx.bookId)!;
    expect(bookAfter.stock).toBe(stockBefore);

    // returnedAt tidak berubah
    const txAfter = result.current.borrowings.find((tx) => tx.id === alreadyReturnedTx.id)!;
    expect(txAfter.returnedAt).toBe(originalReturnedAt);
  });
});
