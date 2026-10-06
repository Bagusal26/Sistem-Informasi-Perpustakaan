import React from 'react';
import { useLibrary } from '../../context/LibraryContext';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import {
  BookOpen,
  Users,
  Clock,
  RotateCcw,
  AlertTriangle,
  ArrowLeftRight,
  TrendingUp,
  Award,
  Layers,
  CheckCircle2,
  Calendar,
} from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const { books, members, borrowings } = useLibrary();

  const today = new Date().toISOString().split('T')[0];

  // 1. Perhitungan Statistik Koleksi Buku
  const activeBooks = books.filter((b) => b.isActive);
  const totalBooksCount = activeBooks.length; // Jumlah judul buku aktif
  const totalRegisteredBooks = books.length; // Total seluruh judul (termasuk nonaktif)
  const totalPhysicalStock = books.reduce((sum, b) => sum + (b.stock || 0), 0);
  // Buku Tersedia: total stok fisik buku aktif yang memiliki stok > 0
  const availableBooksStock = activeBooks.reduce((sum, b) => sum + Math.max(0, b.stock || 0), 0);
  const availableTitlesCount = activeBooks.filter((b) => b.stock > 0).length;

  // 2. Perhitungan Statistik Anggota
  const totalMembers = members.length;
  const activeMembersCount = members.filter((m) => m.status === 'Aktif').length;
  const inactiveMembersCount = members.filter((m) => m.status === 'Tidak Aktif').length;

  // 3. Perhitungan Statistik Transaksi Sirkulasi
  const totalBorrowings = borrowings.length;
  const returnedCount = borrowings.filter((b) => b.status === 'Dikembalikan').length;

  // Evaluasi dinamis status Terlambat vs Dipinjam (sesuai implementasi Tahap 8)
  const overdueCount = borrowings.filter((b) => {
    if (b.status === 'Dikembalikan') return false;
    return b.status === 'Terlambat' || (b.status === 'Dipinjam' && b.dueDate < today);
  }).length;

  const activeLoanCount = borrowings.filter((b) => {
    if (b.status === 'Dikembalikan') return false;
    return b.status === 'Dipinjam' && !(b.dueDate < today);
  }).length;

  // Total yang sedang dipinjam (Dipinjam + Terlambat)
  const totalCurrentlyBorrowed = activeLoanCount + overdueCount;

  // 4. Statistik Buku Paling Sering Dipinjam
  // Menghitung frekuensi kemunculan bookId di data Borrowing
  const borrowCountsByBookId = borrowings.reduce<Record<string, number>>((acc, trx) => {
    acc[trx.bookId] = (acc[trx.bookId] || 0) + 1;
    return acc;
  }, {});

  const mostBorrowedBooks = Object.entries(borrowCountsByBookId)
    .map(([bookId, count]) => {
      const book = books.find((b) => b.id === bookId);
      return {
        bookId,
        count,
        title: book?.title || 'Buku tidak ditemukan',
        code: book?.code || '-',
        author: book?.author || 'Penulis tidak diketahui',
        category: book?.category || 'Kategori Umum',
        cover: book?.cover,
        stock: book?.stock ?? 0,
        isActive: book?.isActive ?? false,
      };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 5); // Tampilkan 5 buku teratas

  // 5. 5 Aktivitas Transaksi Peminjaman Terbaru
  const recentTransactions = [...borrowings]
    .sort((a, b) => {
      // Urutkan berdasarkan tanggal pinjam terbaru atau ID
      if (b.borrowedAt !== a.borrowedAt) {
        return b.borrowedAt.localeCompare(a.borrowedAt);
      }
      return b.id.localeCompare(a.id);
    })
    .slice(0, 5);

  return (
    <div className="space-y-8">
      {/* 1. Header Halaman */}
      <div className="border-b border-slate-200/80 pb-4">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Laporan & Statistik Perpustakaan
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Rekapitulasi data riil koleksi buku, keanggotaan, peredaran sirkulasi, dan transaksi peminjaman.
        </p>
      </div>

      {/* 2. Empat Ringkasan Statistik Utama */}
      <div>
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
          Ringkasan Utama Perpustakaan
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Buku */}
          <Card noPadding className="p-5 border border-slate-200/90 shadow-sm flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500">Total Judul Buku</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1 tracking-tight">
                  {totalBooksCount} <span className="text-xs font-medium text-slate-400">judul</span>
                </h3>
              </div>
              <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-lg">
                <BookOpen size={20} />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Fisik koleksi:</span>
              <span className="font-semibold text-slate-700">{totalPhysicalStock} eksemplar</span>
            </div>
          </Card>

          {/* Card 2: Total Anggota */}
          <Card noPadding className="p-5 border border-slate-200/90 shadow-sm flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500">Total Anggota</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1 tracking-tight">
                  {totalMembers} <span className="text-xs font-medium text-slate-400">orang</span>
                </h3>
              </div>
              <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg">
                <Users size={20} />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Status aktif:</span>
              <span className="font-semibold text-emerald-700">
                {activeMembersCount} aktif <span className="text-slate-400 font-normal">({inactiveMembersCount} nonaktif)</span>
              </span>
            </div>
          </Card>

          {/* Card 3: Sedang Dipinjam */}
          <Card noPadding className="p-5 border border-slate-200/90 shadow-sm flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500">Sedang Dipinjam</p>
                <h3 className="text-2xl font-bold text-sky-900 mt-1 tracking-tight">
                  {totalCurrentlyBorrowed} <span className="text-xs font-medium text-slate-400">transaksi</span>
                </h3>
              </div>
              <div className="p-2.5 bg-sky-50 text-sky-600 rounded-lg">
                <Clock size={20} />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Kondisi sirkulasi:</span>
              <span className="font-semibold text-slate-700">
                {activeLoanCount} normal &bull;{' '}
                <span className={overdueCount > 0 ? 'text-rose-600 font-bold' : 'text-slate-500'}>
                  {overdueCount} telat
                </span>
              </span>
            </div>
          </Card>

          {/* Card 4: Buku Tersedia */}
          <Card noPadding className="p-5 border border-slate-200/90 shadow-sm flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500">Buku Tersedia (Stok &gt; 0)</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1 tracking-tight">
                  {availableBooksStock} <span className="text-xs font-medium text-slate-400">eksemplar</span>
                </h3>
              </div>
              <div className="p-2.5 bg-amber-50 text-amber-600 rounded-lg">
                <Layers size={20} />
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Judul siap pinjam:</span>
              <span className="font-semibold text-slate-700">{availableTitlesCount} judul</span>
            </div>
          </Card>
        </div>
      </div>

      {/* 3. Statistik Detail Sirkulasi Transaksi */}
      <div>
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
          Rincian Transaksi Sirkulasi
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 bg-white rounded-xl border border-slate-200/90 shadow-2xs">
            <div className="flex items-center gap-2 text-slate-500 mb-1">
              <ArrowLeftRight size={15} className="text-slate-600" />
              <span className="text-xs font-medium">Total Seluruh Transaksi</span>
            </div>
            <p className="text-xl font-bold text-slate-900">{totalBorrowings}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Sepanjang waktu</p>
          </div>

          <div className="p-4 bg-white rounded-xl border border-slate-200/90 shadow-2xs">
            <div className="flex items-center gap-2 text-sky-600 mb-1">
              <Clock size={15} />
              <span className="text-xs font-medium text-slate-700">Aktif Dipinjam</span>
            </div>
            <p className="text-xl font-bold text-sky-700">{activeLoanCount}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Sesuai tenggat waktu</p>
          </div>

          <div className="p-4 bg-white rounded-xl border border-slate-200/90 shadow-2xs">
            <div className="flex items-center gap-2 text-rose-600 mb-1">
              <AlertTriangle size={15} />
              <span className="text-xs font-medium text-slate-700">Terlambat</span>
            </div>
            <p className="text-xl font-bold text-rose-600">{overdueCount}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Melewati batas tanggal</p>
          </div>

          <div className="p-4 bg-white rounded-xl border border-slate-200/90 shadow-2xs">
            <div className="flex items-center gap-2 text-emerald-600 mb-1">
              <RotateCcw size={15} />
              <span className="text-xs font-medium text-slate-700">Sudah Dikembalikan</span>
            </div>
            <p className="text-xl font-bold text-emerald-700">{returnedCount}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Transaksi selesai</p>
          </div>
        </div>
      </div>

      {/* 4. Bagian Dua Kolom: Buku Paling Sering Dipinjam & Transaksi Terbaru */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Kolom Kiri: Statistik Buku Paling Sering Dipinjam */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <Award size={16} className="text-indigo-600" />
                <span>Buku Paling Sering Dipinjam</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Peringkat buku dengan frekuensi peminjaman tertinggi.
              </p>
            </div>
          </div>

          <Card noPadding className="border border-slate-200/90 shadow-sm overflow-hidden">
            {mostBorrowedBooks.length === 0 ? (
              <EmptyState
                type="data"
                title="Belum Ada Data Peminjaman"
                description="Belum ada transaksi peminjaman buku yang tercatat untuk menghitung statistik popularitas."
              />
            ) : (
              <div className="divide-y divide-slate-100">
                {mostBorrowedBooks.map((item, index) => (
                  <div key={item.bookId} className="p-3.5 flex items-center gap-3.5 hover:bg-slate-50/70 transition-colors">
                    {/* Ranking Badge */}
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                        index === 0
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : index === 1
                          ? 'bg-slate-200 text-slate-700 border border-slate-300'
                          : index === 2
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      #{index + 1}
                    </div>

                    {/* Book Thumbnail */}
                    <img
                      src={item.cover}
                      alt={item.title}
                      className="w-10 h-14 object-cover rounded shadow-2xs shrink-0 border border-slate-200"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=200';
                      }}
                    />

                    {/* Book Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] text-slate-400 font-semibold">{item.code}</span>
                        {!item.isActive && (
                          <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200">
                            Nonaktif
                          </span>
                        )}
                      </div>
                      <h3 className="font-semibold text-slate-900 text-sm leading-snug truncate" title={item.title}>
                        {item.title}
                      </h3>
                      <p className="text-xs text-slate-500 truncate mt-0.5">
                        {item.author} &bull; <span className="text-slate-400">{item.category}</span>
                      </p>
                    </div>

                    {/* Count Pill */}
                    <div className="text-right shrink-0">
                      <span className="inline-block px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                        {item.count}x dipinjam
                      </span>
                      <p className="text-[11px] text-slate-400 mt-0.5">Sisa stok: {item.stock}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Kolom Kanan: Transaksi Terbaru */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <Calendar size={16} className="text-emerald-600" />
                <span>Transaksi Peminjaman Terbaru</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                5 transaksi terakhir yang tercatat dalam sistem perpustakaan.
              </p>
            </div>
          </div>

          <Card noPadding className="border border-slate-200/90 shadow-sm overflow-hidden">
            {recentTransactions.length === 0 ? (
              <EmptyState
                type="data"
                title="Belum Ada Transaksi"
                description="Belum ada riwayat transaksi peminjaman yang tercatat dalam sistem."
              />
            ) : (
              <div className="divide-y divide-slate-100">
                {recentTransactions.map((trx) => {
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
                    <div key={trx.id} className="p-3.5 hover:bg-slate-50/70 transition-colors flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-xs font-semibold text-slate-800">{trx.id}</span>
                          <span className="text-[11px] text-slate-400">&bull; {trx.borrowedAt}</span>
                        </div>
                        <p className="text-sm font-semibold text-slate-900 leading-snug truncate">
                          {book?.title || 'Buku tidak ditemukan'}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5 truncate">
                          Peminjam: <span className="font-medium text-slate-700">{member?.name || 'Anggota tidak ditemukan'}</span>
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <Badge variant={displayStatus} size="sm" dot>
                          {displayStatus}
                        </Badge>
                        <p className="text-[11px] text-slate-400 mt-1 font-mono">
                          {isReturned
                            ? `Kembali: ${trx.returnedAt || '-'}`
                            : `Tempo: ${trx.dueDate}`}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
