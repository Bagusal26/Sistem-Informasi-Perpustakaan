import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLibrary } from '../../context/LibraryContext';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { Button } from '../../components/ui/Button';
import { SearchInput } from '../../components/ui/SearchInput';
import { History, BookOpen, Calendar, CheckCircle2, ArrowRight } from 'lucide-react';

export const BorrowingHistoryPage: React.FC = () => {
  const { borrowings, books } = useLibrary();
  const { currentUser } = useAuth();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const today = new Date().toISOString().split('T')[0];

  // 1. Filter HANYA riwayat milik anggota yang sedang login
  const userBorrowings = borrowings.filter(
    (b) => b.memberId === currentUser?.memberId
  );

  // 2. Filter pencarian dan status
  const filteredHistory = userBorrowings.filter((trx) => {
    const book = books.find((b) => b.id === trx.bookId);
    const query = search.toLowerCase().trim();

    const matchesSearch =
      trx.id.toLowerCase().includes(query) ||
      (book && book.title.toLowerCase().includes(query)) ||
      (book && book.author.toLowerCase().includes(query)) ||
      (book && book.code.toLowerCase().includes(query));

    const isReturned = trx.status === 'Dikembalikan';
    const isOverdue =
      trx.status === 'Terlambat' || (!isReturned && trx.dueDate < today);
    const effectiveStatus = isReturned
      ? 'Dikembalikan'
      : isOverdue
      ? 'Terlambat'
      : 'Dipinjam';

    const matchesStatus =
      statusFilter === 'all' ||
      effectiveStatus === statusFilter ||
      trx.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* 1. Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Riwayat Peminjaman
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Daftar riwayat peminjaman buku Anda.
          </p>
        </div>
        <Link to="/member/catalog">
          <Button variant="outline" size="sm" icon={<BookOpen size={16} />}>
            Jelajahi Katalog
          </Button>
        </Link>
      </div>

      {userBorrowings.length === 0 ? (
        <EmptyState
          title="Belum ada riwayat peminjaman."
          description="Anda belum pernah melakukan peminjaman buku dari perpustakaan ini."
          icon={<History className="h-10 w-10 text-indigo-400 stroke-1" />}
          action={
            <Link to="/member/catalog">
              <Button icon={<BookOpen size={16} />}>Jelajahi Katalog</Button>
            </Link>
          }
        />
      ) : (
        <>
          {/* Filter & Search Bar */}
          <Card noPadding className="p-4 border border-slate-200/90 shadow-sm">
            <div className="flex flex-col md:flex-row items-center gap-3">
              <div className="flex-1 w-full">
                <SearchInput
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onClear={() => setSearch('')}
                  placeholder="Cari ID transaksi, judul buku, atau penulis..."
                />
              </div>
              <div className="w-full md:w-56">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                >
                  <option value="all">Semua Status ({userBorrowings.length})</option>
                  <option value="Dipinjam">Dipinjam (Aktif)</option>
                  <option value="Terlambat">Terlambat</option>
                  <option value="Dikembalikan">Dikembalikan</option>
                </select>
              </div>
            </div>
          </Card>

          {filteredHistory.length === 0 ? (
            <EmptyState
              type="search"
              title="Riwayat Tidak Ditemukan"
              description="Tidak ada riwayat peminjaman yang cocok dengan kata kunci pencarian Anda."
              action={
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearch('');
                    setStatusFilter('all');
                  }}
                >
                  Reset Filter
                </Button>
              }
            />
          ) : (
            <Card noPadding className="border border-slate-200/90 shadow-sm overflow-hidden">
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50/80 text-slate-700 font-semibold border-b border-slate-200">
                    <tr>
                      <th scope="col" className="py-3.5 px-4">ID Transaksi</th>
                      <th scope="col" className="py-3.5 px-4">Buku</th>
                      <th scope="col" className="py-3.5 px-4">Tanggal Pinjam</th>
                      <th scope="col" className="py-3.5 px-4">Batas Pengembalian</th>
                      <th scope="col" className="py-3.5 px-4">Tanggal Pengembalian</th>
                      <th scope="col" className="py-3.5 px-4 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredHistory.map((trx) => {
                      // Tetap menampilkan info buku meskipun buku sudah diarsipkan/tidak aktif
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
                          {/* ID Transaksi */}
                          <td className="py-3.5 px-4 font-mono font-semibold text-slate-900 whitespace-nowrap">
                            {trx.id}
                          </td>

                          {/* Buku: Cover, Judul, Penulis, Kode */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={book?.cover}
                                alt={book?.title}
                                className="w-10 h-14 object-cover rounded shadow-2xs shrink-0 border border-slate-200"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src =
                                    'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=200';
                                }}
                              />
                              <div>
                                <p className="font-semibold text-slate-900 text-sm leading-snug line-clamp-1">
                                  {book?.title || trx.bookId}
                                </p>
                                <p className="text-xs text-slate-500 mt-0.5">
                                  {book?.author || '-'} &bull; <span className="font-mono text-[11px] text-slate-400">{book?.code}</span>
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Tanggal Pinjam */}
                          <td className="py-3.5 px-4 text-slate-700 whitespace-nowrap">
                            {trx.borrowedAt}
                          </td>

                          {/* Batas Pengembalian */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span
                              className={`font-semibold ${
                                isOverdue ? 'text-rose-600' : 'text-slate-800'
                              }`}
                            >
                              {trx.dueDate}
                            </span>
                          </td>

                          {/* Tanggal Pengembalian */}
                          <td className="py-3.5 px-4 text-slate-700 whitespace-nowrap">
                            {trx.returnedAt ? (
                              <span className="font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                                {trx.returnedAt}
                              </span>
                            ) : (
                              <span className="text-slate-400 font-mono">-</span>
                            )}
                          </td>

                          {/* Status */}
                          <td className="py-3.5 px-4 text-center">
                            <Badge variant={displayStatus} size="sm" dot>
                              {displayStatus}
                            </Badge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile / Tablet Cards View */}
              <div className="md:hidden divide-y divide-slate-100">
                {filteredHistory.map((trx) => {
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
                    <div key={trx.id} className="p-4 space-y-3 hover:bg-slate-50/60 transition-colors">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="font-mono text-xs font-semibold text-slate-800">{trx.id}</span>
                          <h4 className="font-bold text-slate-900 text-sm mt-0.5 line-clamp-1">
                            {book?.title || trx.bookId}
                          </h4>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {book?.author} &bull; <span className="font-mono text-[11px] text-slate-400">{book?.code}</span>
                          </p>
                        </div>
                        <Badge variant={displayStatus} size="sm" dot>
                          {displayStatus}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                        <div>
                          <span className="text-slate-400 text-[11px] block">Pinjam:</span>
                          <span className="text-slate-700">{trx.borrowedAt}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 text-[11px] block">Batas Waktu:</span>
                          <span className={isOverdue ? 'text-rose-600 font-semibold' : 'text-slate-800'}>
                            {trx.dueDate}
                          </span>
                        </div>
                        <div className="col-span-2 pt-1 border-t border-slate-200/60 flex items-center justify-between">
                          <span className="text-slate-400 text-[11px]">Tanggal Dikembalikan:</span>
                          <span className="font-semibold text-slate-800">
                            {trx.returnedAt ? (
                              <span className="text-emerald-700">{trx.returnedAt}</span>
                            ) : (
                              <span className="text-slate-400 font-mono">-</span>
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
};
