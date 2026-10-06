import React from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { useLibrary } from '../../context/LibraryContext';
import {
  BookOpen,
  Users,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  RotateCcw,
  BookMarked,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const { books, members, borrowings } = useLibrary();

  const today = new Date().toISOString().split('T')[0];

  // 1. Data Real: Total Judul Buku Aktif
  const activeBooks = books.filter((book) => book.isActive);
  const totalBooks = activeBooks.length;

  // 2. Data Real: Total Anggota & Anggota Aktif
  const totalMembers = members.length;
  const activeMembersCount = members.filter((member) => member.status === 'Aktif').length;

  // 3. Data Real: Sedang Dipinjam (status aktif: 'Dipinjam' & 'Terlambat')
  const overdueCount = borrowings.filter(
    (trx) =>
      trx.status === 'Terlambat' ||
      (trx.status === 'Dipinjam' && trx.dueDate < today)
  ).length;

  const normalActiveCount = borrowings.filter(
    (trx) => trx.status === 'Dipinjam' && !(trx.dueDate < today)
  ).length;

  const currentlyBorrowed = normalActiveCount + overdueCount;

  // 4. Data Real: Buku Tersedia (Stok fisik buku aktif yang ada di rak)
  const availableStock = activeBooks.reduce((sum, book) => sum + Math.max(0, book.stock || 0), 0);
  const titlesWithStock = activeBooks.filter((book) => book.stock > 0).length;

  // Data Tambahan untuk Ringkasan Aktivitas
  const returnedCount = borrowings.filter((trx) => trx.status === 'Dikembalikan').length;

  // Transaksi terbaru: Urutkan berdasarkan tanggal pinjam terbaru, maksimal 5 data
  const recentBorrowings = [...borrowings]
    .sort((a, b) => {
      if (b.borrowedAt !== a.borrowedAt) {
        return b.borrowedAt.localeCompare(a.borrowedAt);
      }
      return b.id.localeCompare(a.id);
    })
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* A. PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-200/80 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Dashboard</h2>
          <p className="text-xs text-slate-500 mt-0.5">Ringkasan aktivitas perpustakaan.</p>
        </div>
      </div>

      {/* B. SUMMARY CARDS (4 KARTU STATISTIK UTAMA) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Total Buku */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Total Buku</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1 tracking-tight">{totalBooks}</h3>
            <p className="text-[11px] text-slate-500 mt-1 font-medium">Koleksi aktif</p>
          </div>
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-lg">
            <BookOpen size={20} />
          </div>
        </div>

        {/* 2. Total Anggota */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Total Anggota</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1 tracking-tight">{totalMembers}</h3>
            <p className="text-[11px] text-emerald-600 mt-1 font-medium">
              {activeMembersCount} anggota aktif
            </p>
          </div>
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg">
            <Users size={20} />
          </div>
        </div>

        {/* 3. Sedang Dipinjam */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Sedang Dipinjam</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1 tracking-tight">
              {currentlyBorrowed}
            </h3>
            <p className="text-[11px] text-blue-600 mt-1 font-medium">Peminjaman aktif</p>
          </div>
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
            <Clock size={20} />
          </div>
        </div>

        {/* 4. Buku Tersedia */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500">Buku Tersedia</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1 tracking-tight">
              {availableStock}
            </h3>
            <p className="text-[11px] text-slate-500 mt-1 font-medium">
              {titlesWithStock} judul siap dipinjam
            </p>
          </div>
          <div className="p-2.5 bg-slate-100 text-slate-700 rounded-lg">
            <CheckCircle2 size={20} />
          </div>
        </div>
      </div>

      {/* D. RINGKASAN AKTIVITAS PERPUSTAKAAN */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Peminjaman Aktif Info */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg shrink-0">
            <BookMarked size={18} />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-800">
              {currentlyBorrowed} Transaksi Berjalan
            </p>
            <p className="text-[11px] text-slate-500 truncate">
              Buku sedang berada di tangan anggota
            </p>
          </div>
        </div>

        {/* Pengembalian Selesai */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3.5">
          <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg shrink-0">
            <RotateCcw size={18} />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-800">
              {returnedCount} Buku Telah Kembali
            </p>
            <p className="text-[11px] text-slate-500 truncate">Stok buku fisik telah disinkronkan</p>
          </div>
        </div>

        {/* Buku Terlambat */}
        <div
          className={`p-4 rounded-xl border shadow-xs flex items-center gap-3.5 ${
            overdueCount > 0
              ? 'bg-rose-50/60 border-rose-200'
              : 'bg-white border-slate-200'
          }`}
        >
          <div
            className={`p-2 rounded-lg shrink-0 ${
              overdueCount > 0
                ? 'bg-rose-100 text-rose-600'
                : 'bg-slate-100 text-slate-500'
            }`}
          >
            <AlertTriangle size={18} />
          </div>
          <div className="min-w-0">
            <p
              className={`text-xs font-semibold ${
                overdueCount > 0 ? 'text-rose-900' : 'text-slate-800'
              }`}
            >
              {overdueCount} Buku Terlambat
            </p>
            <p
              className={`text-[11px] truncate ${
                overdueCount > 0 ? 'text-rose-700' : 'text-slate-500'
              }`}
            >
              {overdueCount > 0
                ? 'Perlu konfirmasi pengembalian anggota'
                : 'Tidak ada sirkulasi yang melewati jatuh tempo'}
            </p>
          </div>
        </div>
      </div>

      {/* C. TRANSAKSI TERBARU TABLE */}
      <Card
        title="Transaksi Terbaru"
        subtitle="Maksimal 5 data transaksi peminjaman dan pengembalian paling baru"
        footer={
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-500">
              Menampilkan {recentBorrowings.length} dari total {borrowings.length} rekaman transaksi
            </span>
            <Link
              to="/admin/borrowings"
              className="text-indigo-600 hover:text-indigo-800 font-semibold inline-flex items-center gap-1 transition-colors"
            >
              <span>Lihat Semua Transaksi</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        }
      >
        {recentBorrowings.length === 0 ? (
          <EmptyState
            title="Belum Ada Transaksi"
            description="Tidak ada catatan peminjaman atau pengembalian yang ditemukan dalam sistem perpustakaan."
          />
        ) : (
          <div className="overflow-x-auto -mx-5 -my-5">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50/80 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th scope="col" className="py-3 px-4">
                    ID Transaksi
                  </th>
                  <th scope="col" className="py-3 px-4">
                    Anggota
                  </th>
                  <th scope="col" className="py-3 px-4">
                    Buku
                  </th>
                  <th scope="col" className="py-3 px-4">
                    Tanggal Pinjam
                  </th>
                  <th scope="col" className="py-3 px-4">
                    Batas Pengembalian
                  </th>
                  <th scope="col" className="py-3 px-4 text-center">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentBorrowings.map((trx) => {
                  const member = members.find((m) => m.id === trx.memberId);
                  const book = books.find((b) => b.id === trx.bookId);

                  const isReturned = trx.status === 'Dikembalikan';
                  const isOverdue =
                    trx.status === 'Terlambat' || (!isReturned && trx.dueDate < today);
                  const displayStatus = isReturned
                    ? 'Dikembalikan'
                    : isOverdue
                    ? 'Terlambat'
                    : 'Dipinjam';

                  return (
                    <tr key={trx.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-medium text-slate-900">{trx.id}</td>
                      <td className="py-3 px-4">
                        <p className="font-semibold text-slate-900">{member?.name || 'Anggota tidak ditemukan'}</p>
                        <p className="text-[11px] text-slate-400">{member?.email || '-'}</p>
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-medium text-slate-900 leading-snug">{book?.title || 'Buku tidak ditemukan'}</p>
                        <p className="text-[11px] text-slate-400 font-mono">{book?.code || '-'}</p>
                      </td>
                      <td className="py-3 px-4 text-slate-600">{trx.borrowedAt}</td>
                      <td className="py-3 px-4">
                        <span
                          className={
                            displayStatus === 'Terlambat'
                              ? 'text-rose-600 font-semibold'
                              : 'text-slate-700'
                          }
                        >
                          {trx.dueDate}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge variant={displayStatus} size="sm" dot />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};
