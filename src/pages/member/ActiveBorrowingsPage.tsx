import React from 'react';
import { Link } from 'react-router-dom';
import { useLibrary } from '../../context/LibraryContext';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { Button } from '../../components/ui/Button';
import {
  Clock,
  BookOpen,
  Calendar,
  AlertCircle,
  Hash,
  ArrowRight,
  Info,
} from 'lucide-react';

export const ActiveBorrowingsPage: React.FC = () => {
  const { borrowings, books } = useLibrary();
  const { currentUser } = useAuth();

  const today = new Date().toISOString().split('T')[0];

  // Filter HANYA transaksi milik member yang sedang login yang berstatus aktif (Dipinjam / Terlambat)
  const activeLoans = borrowings.filter(
    (b) =>
      b.memberId === currentUser?.memberId &&
      (b.status === 'Dipinjam' || b.status === 'Terlambat')
  );

  return (
    <div className="space-y-6">
      {/* 1. Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Peminjaman Saya
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Daftar buku yang sedang Anda pinjam.
          </p>
        </div>
        <Link to="/member/catalog">
          <Button variant="outline" size="sm" icon={<BookOpen size={16} />}>
            Jelajahi Katalog
          </Button>
        </Link>
      </div>

      {activeLoans.length === 0 ? (
        <EmptyState
          title="Tidak Ada Peminjaman Aktif"
          description="Saat ini Anda tidak memiliki buku yang sedang dipinjam. Temukan koleksi buku menarik di katalog perpustakaan."
          icon={<Clock className="h-10 w-10 text-indigo-400 stroke-1" />}
          action={
            <Link to="/member/catalog">
              <Button icon={<BookOpen size={16} />}>Buka Katalog Buku</Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          {/* Petunjuk Pengembalian */}
          <div className="p-3.5 bg-blue-50/80 border border-blue-200/80 rounded-xl flex items-start gap-2.5 text-xs text-blue-900">
            <Info size={16} className="text-blue-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Buku fisik yang telah selesai dibaca dapat dikembalikan langsung ke petugas loket perpustakaan dengan menyebutkan <strong>ID Transaksi</strong> atau <strong>Kode Buku</strong>.
            </p>
          </div>

          {/* Desktop Table View */}
          <Card noPadding className="hidden md:block overflow-hidden border border-slate-200/90 shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50/80 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th scope="col" className="py-3.5 px-4">
                      ID Transaksi
                    </th>
                    <th scope="col" className="py-3.5 px-4">
                      Buku
                    </th>
                    <th scope="col" className="py-3.5 px-4">
                      Tanggal Pinjam
                    </th>
                    <th scope="col" className="py-3.5 px-4">
                      Batas Pengembalian
                    </th>
                    <th scope="col" className="py-3.5 px-4 text-center">
                      Status
                    </th>
                    <th scope="col" className="py-3.5 px-4 text-right">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {activeLoans.map((loan) => {
                    const book = books.find((b) => b.id === loan.bookId);
                    const isOverdue =
                      loan.status === 'Terlambat' ||
                      (loan.status === 'Dipinjam' && loan.dueDate < today);
                    const displayStatus = isOverdue ? 'Terlambat' : 'Dipinjam';

                    return (
                      <tr key={loan.id} className="hover:bg-slate-50/80 transition-colors">
                        {/* ID Transaksi */}
                        <td className="py-3.5 px-4 font-mono font-semibold text-slate-900 whitespace-nowrap">
                          {loan.id}
                        </td>

                        {/* Judul & Detail Buku */}
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
                                {book?.title || 'Judul Buku Tidak Ditemukan'}
                              </p>
                              <p className="text-xs text-slate-500 mt-0.5">
                                {book?.author || '-'} &bull; <span className="font-mono text-[11px] text-slate-400">{book?.code}</span>
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Tanggal Pinjam */}
                        <td className="py-3.5 px-4 text-slate-700 whitespace-nowrap">
                          {loan.borrowedAt}
                        </td>

                        {/* Batas Pengembalian */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span
                            className={`font-semibold ${
                              isOverdue ? 'text-rose-600' : 'text-slate-900'
                            }`}
                          >
                            {loan.dueDate}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4 text-center">
                          <Badge variant={displayStatus} size="sm" dot>
                            {displayStatus}
                          </Badge>
                        </td>

                        {/* Aksi */}
                        <td className="py-3.5 px-4 text-right">
                          {book ? (
                            <Link to={`/member/books/${book.id}`}>
                              <Button variant="ghost" size="sm" icon={<ArrowRight size={14} />}>
                                Rincian
                              </Button>
                            </Link>
                          ) : (
                            <span className="text-slate-400 text-xs">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Mobile / Tablet Responsive Cards */}
          <div className="md:hidden space-y-3">
            {activeLoans.map((loan) => {
              const book = books.find((b) => b.id === loan.bookId);
              const isOverdue =
                loan.status === 'Terlambat' ||
                (loan.status === 'Dipinjam' && loan.dueDate < today);
              const displayStatus = isOverdue ? 'Terlambat' : 'Dipinjam';

              return (
                <Card key={loan.id} noPadding className="p-4 border border-slate-200/90 shadow-sm">
                  <div className="flex gap-3.5">
                    <img
                      src={book?.cover}
                      alt={book?.title}
                      className="w-16 h-24 object-cover rounded-md shadow-2xs shrink-0 border border-slate-200"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=200';
                      }}
                    />

                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-[11px] font-mono font-semibold text-slate-700">
                            {loan.id}
                          </span>
                          <Badge variant={displayStatus} size="sm" dot>
                            {displayStatus}
                          </Badge>
                        </div>

                        <h3 className="font-semibold text-slate-900 text-sm leading-snug line-clamp-2">
                          {book?.title || 'Judul Buku'}
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5 truncate">
                          {book?.author}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-100 mt-2 text-xs space-y-1">
                        <div className="flex justify-between text-slate-600">
                          <span className="text-slate-400">Pinjam:</span>
                          <span>{loan.borrowedAt}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Batas Kembali:</span>
                          <span
                            className={`font-semibold ${
                              isOverdue ? 'text-rose-600' : 'text-slate-900'
                            }`}
                          >
                            {loan.dueDate}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {book && (
                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex justify-end">
                      <Link to={`/member/books/${book.id}`} className="w-full">
                        <Button variant="outline" size="sm" icon={<ArrowRight size={14} />} className="w-full">
                          Lihat Detail Buku
                        </Button>
                      </Link>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
