import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React, { ReactNode } from 'react';
import { LibraryProvider, useLibrary } from '../src/context/LibraryContext';
import { INITIAL_BOOKS, INITIAL_BORROWINGS, INITIAL_MEMBERS } from '../src/data/mockData';

// Wrapper React Context Provider untuk pengujian hook
const wrapper = ({ children }: { children: ReactNode }) => (
  <LibraryProvider>{children}</LibraryProvider>
);

describe('White-Box Testing: createBorrowing (Modul 4)', () => {
  // Waktu statis deterministik untuk Stub Clock
  const MOCK_DATE_STR = '2026-10-21T08:00:00Z';
  const EXPECTED_BORROW_DATE = '2026-10-21';
  const EXPECTED_DUE_DATE = '2026-10-28';
  const EXPECTED_PREFIX = 'TRX-20261021';

  beforeEach(() => {
    localStorage.clear();
    // TEST DOUBLE 1: STUB (Mengisolasi system clock agar tanggal dan dueDate konsisten)
    vi.useFakeTimers();
    vi.setSystemTime(new Date(MOCK_DATE_STR));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    localStorage.clear();
  });

  // =========================================================================
  // SKENARIO NEGATIF (VALIDATION GUARDS)
  // =========================================================================

  it('TC-ST-01 / TC-BR-01: Menolak peminjaman jika data anggota tidak ditemukan (Branch B1, S1-S3)', () => {
    // Arrange: Siapkan ID anggota fiktif dan ID buku valid
    const { result } = renderHook(() => useLibrary(), { wrapper });
    const invalidMemberId = 'MBR-999';
    const validBookId = 'BK-001';
    const initialTxCount = result.current.borrowings.length;

    // Act: Jalankan peminjaman dengan memberId yang tidak terdaftar
    let response: { success: boolean; message: string; borrowingId?: string } = { success: false, message: '' };
    act(() => {
      response = result.current.createBorrowing(invalidMemberId, validBookId);
    });

    // Assert: Verifikasi penolakan dan tidak ada transaksi baru
    expect(response.success).toBe(false);
    expect(response.message).toBe('Data anggota tidak ditemukan.');
    expect(response.borrowingId).toBeUndefined();
    expect(result.current.borrowings.length).toBe(initialTxCount);
  });

  it('TC-ST-02 / TC-BR-02: Menolak peminjaman jika akun anggota berstatus Tidak Aktif (Branch B2, B3, S4-S5)', () => {
    // Arrange: Gunakan anggota MBR-004 yang berstatus "Tidak Aktif" di mockData
    const { result } = renderHook(() => useLibrary(), { wrapper });
    const inactiveMember = result.current.members.find((m) => m.status === 'Tidak Aktif')!;
    expect(inactiveMember).toBeDefined();
    expect(inactiveMember.status).toBe('Tidak Aktif');

    const validBook = result.current.books.find((b) => b.stock > 0)!;
    const initialStock = validBook.stock;
    const initialTxCount = result.current.borrowings.length;

    // Act: Jalankan peminjaman dengan anggota tidak aktif
    let response: { success: boolean; message: string; borrowingId?: string } = { success: false, message: '' };
    act(() => {
      response = result.current.createBorrowing(inactiveMember.id, validBook.id);
    });

    // Assert: Verifikasi pesan penolakan dan stok buku tidak berkurang
    expect(response.success).toBe(false);
    expect(response.message).toBe('Peminjaman tidak dapat dilakukan karena akun anggota tidak aktif.');
    expect(response.borrowingId).toBeUndefined();
    expect(result.current.borrowings.length).toBe(initialTxCount);

    const bookAfter = result.current.books.find((b) => b.id === validBook.id)!;
    expect(bookAfter.stock).toBe(initialStock);
  });

  it('TC-ST-03 / TC-BR-03: Menolak peminjaman jika data buku tidak ditemukan (Branch B4, B5, S6-S8)', () => {
    // Arrange: Gunakan anggota aktif valid dan ID buku yang tidak terdaftar
    const { result } = renderHook(() => useLibrary(), { wrapper });
    const activeMember = result.current.members.find((m) => m.status === 'Aktif')!;
    const invalidBookId = 'BK-NONEXISTENT';
    const initialTxCount = result.current.borrowings.length;

    // Act: Jalankan peminjaman dengan bookId fiktif
    let response: { success: boolean; message: string; borrowingId?: string } = { success: false, message: '' };
    act(() => {
      response = result.current.createBorrowing(activeMember.id, invalidBookId);
    });

    // Assert: Verifikasi penolakan buku tidak ditemukan
    expect(response.success).toBe(false);
    expect(response.message).toBe('Data buku tidak ditemukan.');
    expect(response.borrowingId).toBeUndefined();
    expect(result.current.borrowings.length).toBe(initialTxCount);
  });

  it('TC-ST-04 / TC-BR-04: Menolak peminjaman jika buku sedang tidak aktif / diarsipkan (Branch B6, B7, S9-S10)', () => {
    // Arrange: Nonaktifkan buku terlebih dahulu via toggleArchiveBook
    const { result } = renderHook(() => useLibrary(), { wrapper });
    const activeMember = result.current.members.find((m) => m.status === 'Aktif')!;
    const targetBook = result.current.books.find((b) => b.id === 'BK-002')!;

    // Ubah status buku menjadi tidak aktif (isActive = false)
    act(() => {
      result.current.toggleArchiveBook(targetBook.id);
    });
    const archivedBook = result.current.books.find((b) => b.id === targetBook.id)!;
    expect(archivedBook.isActive).toBe(false);

    const initialTxCount = result.current.borrowings.length;

    // Act: Jalankan peminjaman pada buku yang diarsipkan
    let response: { success: boolean; message: string; borrowingId?: string } = { success: false, message: '' };
    act(() => {
      response = result.current.createBorrowing(activeMember.id, archivedBook.id);
    });

    // Assert: Verifikasi penolakan buku tidak tersedia
    expect(response.success).toBe(false);
    expect(response.message).toBe('Buku sedang tidak tersedia.');
    expect(response.borrowingId).toBeUndefined();
    expect(result.current.borrowings.length).toBe(initialTxCount);
  });

  it('TC-ST-05 / TC-BR-05: Menolak peminjaman jika stok fisik buku habis (stok <= 0) (Branch B8, B9, S11-S12)', () => {
    // Arrange: Gunakan buku BK-005 yang memiliki stock: 0 di mockData
    const { result } = renderHook(() => useLibrary(), { wrapper });
    const activeMember = result.current.members.find((m) => m.status === 'Aktif')!;
    const outOfStockBook = result.current.books.find((b) => b.id === 'BK-005')!;
    expect(outOfStockBook.stock).toBe(0);
    expect(outOfStockBook.isActive).toBe(true);

    const initialTxCount = result.current.borrowings.length;

    // Act: Jalankan peminjaman pada buku dengan stok 0
    let response: { success: boolean; message: string; borrowingId?: string } = { success: false, message: '' };
    act(() => {
      response = result.current.createBorrowing(activeMember.id, outOfStockBook.id);
    });

    // Assert: Verifikasi penolakan stok habis dan transaksi tidak dibuat
    expect(response.success).toBe(false);
    expect(response.message).toBe('Buku sedang tidak tersedia (stok habis).');
    expect(response.borrowingId).toBeUndefined();
    expect(result.current.borrowings.length).toBe(initialTxCount);

    const bookAfter = result.current.books.find((b) => b.id === 'BK-005')!;
    expect(bookAfter.stock).toBe(0);
  });

  // =========================================================================
  // SKENARIO POSITIF & TEST DOUBLE INTEGRATION
  // =========================================================================

  it('TC-ST-06 / TC-BR-06: Peminjaman berhasil dengan pengurangan stok dan ID unik tanpa tabrakan (Branch B10, B12, S13-S21, S24-S27)', () => {
    // TEST DOUBLE 2: SPY (Memantau persistensi ke localStorage.setItem)
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');

    // Arrange: Gunakan anggota aktif dan buku dengan stok > 0
    const { result } = renderHook(() => useLibrary(), { wrapper });
    const activeMember = result.current.members.find((m) => m.id === 'MBR-001')!;
    const bookBefore = result.current.books.find((b) => b.id === 'BK-001')!;
    const initialStock = bookBefore.stock;
    const initialTxCount = result.current.borrowings.length;

    // TEST DOUBLE 3: DUMMY (Mengirim parameter catatan dummy untuk menguji field opsional)
    const dummyNote = 'Catatan uji white-box peminjaman mandiri';

    // Act: Jalankan fungsi createBorrowing
    let response: { success: boolean; message: string; borrowingId?: string } = { success: false, message: '' };
    act(() => {
      response = result.current.createBorrowing(activeMember.id, bookBefore.id, dummyNote);
    });

    // Assert: Verifikasi respon keberhasilan dan format ID deterministik (hasil Stub Timer)
    expect(response.success).toBe(true);
    expect(response.message).toBe('Peminjaman buku berhasil.');
    expect(response.borrowingId).toBe(`${EXPECTED_PREFIX}-005`);

    // Assert: Verifikasi stok berkurang 1
    const bookAfter = result.current.books.find((b) => b.id === 'BK-001')!;
    expect(bookAfter.stock).toBe(initialStock - 1);

    // Assert: Verifikasi transaksi baru tercatat dalam state
    expect(result.current.borrowings.length).toBe(initialTxCount + 1);
    const createdTx = result.current.borrowings.find((tx) => tx.id === response.borrowingId);
    expect(createdTx).toBeDefined();
    expect(createdTx?.memberId).toBe('MBR-001');
    expect(createdTx?.bookId).toBe('BK-001');
    expect(createdTx?.borrowedAt).toBe(EXPECTED_BORROW_DATE);
    expect(createdTx?.dueDate).toBe(EXPECTED_DUE_DATE);
    expect(createdTx?.returnedAt).toBeNull();
    expect(createdTx?.status).toBe('Dipinjam');
    expect(createdTx?.notes).toBe(dummyNote);

    // Assert: Verifikasi SPY mendeteksi penyimpanan ke localStorage
    expect(setItemSpy).toHaveBeenCalledWith('sip_library_borrowings', expect.any(String));
    expect(setItemSpy).toHaveBeenCalledWith('sip_library_books', expect.any(String));
  });

  it('TC-ST-06b: Peminjaman berhasil dengan catatan default jika parameter notes tidak diisi (Expression Fallback)', () => {
    // Arrange: Anggota aktif dan buku berstok
    const { result } = renderHook(() => useLibrary(), { wrapper });
    const activeMember = result.current.members.find((m) => m.id === 'MBR-002')!;
    const bookTarget = result.current.books.find((b) => b.id === 'BK-003')!;

    // Act: Panggil createBorrowing TANPA parameter notes (undefined)
    let response: { success: boolean; message: string; borrowingId?: string } = { success: false, message: '' };
    act(() => {
      response = result.current.createBorrowing(activeMember.id, bookTarget.id);
    });

    // Assert: Verifikasi fallback default string catatan terpasang
    expect(response.success).toBe(true);
    const createdTx = result.current.borrowings.find((tx) => tx.id === response.borrowingId)!;
    expect(createdTx.notes).toBe('Peminjaman melalui sistem web.');
  });

  it('TC-ST-07 / TC-BR-07: Menguji resolusi tabrakan ID transaksi sehingga perulangan while dijalankan (Branch B11, S21-S23)', () => {
    // Arrange: Buat kondisi tabrakan ID awal (collision).
    // Rumus ID: TRX-${dateStr}-${borrowings.length + 1}.
    // Dengan 4 transaksi awal dan tanggal 2026-10-21, ID default pertama adalah TRX-20261021-005.
    // Kita sengaja mengisi localStorage dengan transaksi tiruan yang SUDAH memiliki ID 'TRX-20261021-005'.
    const collisionTxId = `${EXPECTED_PREFIX}-005`;
    const preExistingCollisionTx = {
      id: collisionTxId,
      memberId: 'MBR-001',
      bookId: 'BK-002',
      borrowedAt: '2026-10-20',
      dueDate: '2026-10-27',
      returnedAt: null,
      status: 'Dipinjam' as const,
      notes: 'Transaksi yang sengaja bentrok dengan counter awal',
    };

    // Tulis ke localStorage sebelum hook dirender
    const seededBorrowings = [preExistingCollisionTx, ...INITIAL_BORROWINGS.slice(0, 3)];
    localStorage.setItem('sip_library_borrowings', JSON.stringify(seededBorrowings));

    // Render hook dengan data localStorage yang telah disiapkan
    const { result } = renderHook(() => useLibrary(), { wrapper });
    expect(result.current.borrowings.length).toBe(4);
    expect(result.current.borrowings.some((b) => b.id === collisionTxId)).toBe(true);

    const activeMember = result.current.members.find((m) => m.id === 'MBR-001')!;
    const bookTarget = result.current.books.find((b) => b.id === 'BK-001')!;

    // Act: Jalankan peminjaman baru.
    // Counter awal = 4 + 1 = 5 -> ID awal = 'TRX-20261021-005' (TABRAKAN!)
    // Loop while (borrowings.some(...)) bernilai TRUE (Branch B11)!
    // Statement S22 (counter++) dieksekusi -> counter menjadi 6.
    // Statement S23 (re-generate) dieksekusi -> ID menjadi 'TRX-20261021-006'.
    // Loop while bernilai FALSE (Branch B12) -> loop berhenti.
    let response: { success: boolean; message: string; borrowingId?: string } = { success: false, message: '' };
    act(() => {
      response = result.current.createBorrowing(activeMember.id, bookTarget.id, 'Uji loop collision');
    });

    // Assert: Verifikasi transaksi berhasil dibuat dengan ID baru setelah resolusi tabrakan
    expect(response.success).toBe(true);
    expect(response.borrowingId).toBe(`${EXPECTED_PREFIX}-006`);

    // Pastikan kedua transaksi (yang lama dan yang baru dibuat) ada di dalam state
    expect(result.current.borrowings.some((b) => b.id === collisionTxId)).toBe(true);
    expect(result.current.borrowings.some((b) => b.id === `${EXPECTED_PREFIX}-006`)).toBe(true);
    expect(result.current.borrowings.length).toBe(5);
  });
});

