import React, { useState } from 'react';
import { useLibrary } from '../../context/LibraryContext';
import { useToast } from '../../context/ToastContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { SearchInput } from '../../components/ui/SearchInput';
import { EmptyState } from '../../components/ui/EmptyState';
import { Modal } from '../../components/ui/Modal';
import { CheckCircle2, RotateCcw, ArrowRight, User, BookOpen } from 'lucide-react';
import { Borrowing } from '../../types';

export const BorrowingsPage: React.FC = () => {
  const { borrowings, books, members, returnBook } = useLibrary();
  const { showToast } = useToast();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [selectedBorrowing, setSelectedBorrowing] = useState<Borrowing | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  const filteredBorrowings = borrowings.filter((trx) => {
    const member = members.find((m) => m.id === trx.memberId);
    const book = books.find((b) => b.id === trx.bookId);

    const matchesSearch =
      trx.id.toLowerCase().includes(search.toLowerCase().trim()) ||
      (member && member.name.toLowerCase().includes(search.toLowerCase().trim())) ||
      (book && book.title.toLowerCase().includes(search.toLowerCase().trim())) ||
      (book && book.code.toLowerCase().includes(search.toLowerCase().trim()));

    // Hitung status dinamis terlambat jika masih Dipinjam tapi melewati dueDate
    const isOverdue =
      trx.status === 'Terlambat' ||
      (trx.status === 'Dipinjam' && trx.dueDate < today);
    const effectiveStatus = isOverdue ? 'Terlambat' : trx.status;

    const matchesStatus =
      statusFilter === 'all' ||
      effectiveStatus === statusFilter ||
      trx.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleOpenReturnModal = (trx: Borrowing) => {
    // Perlindungan: tidak boleh memproses yang sudah dikembalikan
    if (trx.status === 'Dikembalikan') {
      showToast('error', 'Buku pada transaksi ini sudah pernah dikembalikan.');
      return;
    }
    setSelectedBorrowing(trx);
    setReturnModalOpen(true);
  };

  const handleConfirmReturn = () => {
    if (!selectedBorrowing) return;
    setIsSubmitting(true);
    const res = returnBook(selectedBorrowing.id);
    setIsSubmitting(false);

    if (res.success) {
      showToast('success', res.message);
    } else {
      showToast('error', res.message);
    }
    setReturnModalOpen(false);
    setSelectedBorrowing(null);
  };

  const selectedMember = selectedBorrowing
    ? members.find((m) => m.id === selectedBorrowing.memberId)
    : null;
  const selectedBook = selectedBorrowing
    ? books.find((b) => b.id === selectedBorrowing.bookId)
    : null;

  return (
    <div className="space-y-6">
      {/* Header Halaman */}
      <div className="border-b border-slate-200/80 pb-4">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">Sirkulasi & Peminjaman Buku</h2>
        <p className="text-xs text-slate-500 mt-1">
          Kelola transaksi peminjaman aktif dan proses pengembalian buku anggota.
        </p>
      </div>

      {/* Filter and Search */}
      <Card noPadding className="p-4 border border-slate-200/90 shadow-sm">
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="flex-1 w-full">
            <SearchInput
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClear={() => setSearch('')}
              placeholder="Cari ID transaksi, nama anggota, atau judul buku..."
            />
          </div>
          <div className="w-full md:w-56">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            >
              <option value="all">Semua Status Transaksi</option>
              <option value="Dipinjam">Dipinjam (Aktif)</option>
              <option value="Terlambat">Terlambat</option>
              <option value="Dikembalikan">Dikembalikan</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Table & Cards */}
      <Card noPadding className="border border-slate-200/90 shadow-sm overflow-hidden">
        {filteredBorrowings.length === 0 ? (
          <EmptyState
            type="search"
            title="Transaksi Tidak Ditemukan"
            description="Tidak ada catatan peminjaman atau pengembalian yang sesuai kriteria filter Anda."
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
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50/80 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th scope="col" className="py-3.5 px-4">ID Transaksi</th>
                    <th scope="col" className="py-3.5 px-4">Anggota</th>
                    <th scope="col" className="py-3.5 px-4">Buku</th>
                    <th scope="col" className="py-3.5 px-4">Tanggal Pinjam</th>
                    <th scope="col" className="py-3.5 px-4">Batas Pengembalian</th>
                    <th scope="col" className="py-3.5 px-4">Tanggal Pengembalian</th>
                    <th scope="col" className="py-3.5 px-4 text-center">Status</th>
                    <th scope="col" className="py-3.5 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredBorrowings.map((trx) => {
                    const member = members.find((m) => m.id === trx.memberId);
                    const book = books.find((b) => b.id === trx.bookId);
                    const isReturned = trx.status === 'Dikembalikan';
                    const isOverdue =
                      trx.status === 'Terlambat' ||
                      (!isReturned && trx.dueDate < today);
                    const displayStatus = isReturned
                      ? 'Dikembalikan'
                      : isOverdue
                      ? 'Terlambat'
                      : 'Dipinjam';

                    return (
                      <tr key={trx.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-semibold text-slate-900 whitespace-nowrap">
                          {trx.id}
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="font-semibold text-slate-900">{member?.name || trx.memberId}</p>
                          <p className="text-[11px] text-slate-500 font-mono">{member?.phone}</p>
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="font-medium text-slate-900 line-clamp-1">{book?.title || trx.bookId}</p>
                          <p className="text-[11px] text-slate-400 font-mono">{book?.code}</p>
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">{trx.borrowedAt}</td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className={isOverdue ? 'text-rose-600 font-semibold' : 'text-slate-800'}>
                            {trx.dueDate}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                          {trx.returnedAt || '-'}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <Badge variant={displayStatus} size="sm" dot>
                            {displayStatus}
                          </Badge>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          {!isReturned ? (
                            <Button
                              variant="secondary"
                              size="sm"
                              icon={<RotateCcw size={14} />}
                              onClick={() => handleOpenReturnModal(trx)}
                            >
                              Proses Pengembalian
                            </Button>
                          ) : (
                            <span className="text-[11px] text-emerald-700 font-medium inline-flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                              <CheckCircle2 size={13} /> Dikembalikan
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile / Tablet Cards View */}
            <div className="md:hidden divide-y divide-slate-100">
              {filteredBorrowings.map((trx) => {
                const member = members.find((m) => m.id === trx.memberId);
                const book = books.find((b) => b.id === trx.bookId);
                const isReturned = trx.status === 'Dikembalikan';
                const isOverdue =
                  trx.status === 'Terlambat' ||
                  (!isReturned && trx.dueDate < today);
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
                      </div>
                      <Badge variant={displayStatus} size="sm" dot>
                        {displayStatus}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      <div>
                        <span className="text-slate-400 text-[11px] block">Peminjam:</span>
                        <span className="font-medium text-slate-800">{member?.name || trx.memberId}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[11px] block">Tanggal Pinjam:</span>
                        <span className="text-slate-700">{trx.borrowedAt}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[11px] block">Batas Waktu:</span>
                        <span className={isOverdue ? 'text-rose-600 font-semibold' : 'text-slate-800'}>
                          {trx.dueDate}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 text-[11px] block">Dikembalikan:</span>
                        <span className="text-slate-700">{trx.returnedAt || '-'}</span>
                      </div>
                    </div>

                    {!isReturned ? (
                      <div className="pt-1">
                        <Button
                          variant="secondary"
                          size="sm"
                          icon={<RotateCcw size={14} />}
                          className="w-full"
                          onClick={() => handleOpenReturnModal(trx)}
                        >
                          Proses Pengembalian
                        </Button>
                      </div>
                    ) : (
                      <div className="pt-1 text-center">
                        <span className="text-xs text-emerald-700 font-medium inline-flex items-center gap-1.5 bg-emerald-50 px-3 py-1 rounded-md border border-emerald-100">
                          <CheckCircle2 size={14} /> Buku telah dikembalikan
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </Card>

      {/* Return Confirmation Modal */}
      <Modal
        isOpen={returnModalOpen}
        onClose={() => setReturnModalOpen(false)}
        title="Konfirmasi Pengembalian"
        description="Pastikan buku telah dikembalikan oleh anggota sebelum memproses transaksi ini."
        footer={
          <>
            <Button
              variant="outline"
              size="sm"
              disabled={isSubmitting}
              onClick={() => setReturnModalOpen(false)}
            >
              Batal
            </Button>
            <Button
              variant="primary"
              size="sm"
              isLoading={isSubmitting}
              onClick={handleConfirmReturn}
            >
              Konfirmasi Pengembalian
            </Button>
          </>
        }
      >
        <div className="space-y-3 text-xs text-slate-600">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/90 space-y-2">
            <div>
              <span className="text-[11px] text-slate-400 block">ID Transaksi</span>
              <span className="font-mono font-bold text-slate-800 text-sm">{selectedBorrowing?.id}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-200/70">
              <div>
                <span className="text-[11px] text-slate-400 block">Nama Anggota</span>
                <span className="font-semibold text-slate-900">{selectedMember?.name}</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block">Judul Buku</span>
                <span className="font-semibold text-slate-900">{selectedBook?.title}</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block">Tanggal Pinjam</span>
                <span className="font-medium text-slate-800">{selectedBorrowing?.borrowedAt}</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block">Batas Pengembalian</span>
                <span className="font-medium text-slate-800">{selectedBorrowing?.dueDate}</span>
              </div>
            </div>
          </div>
          <p className="text-slate-500 italic">
            * Menekan konfirmasi akan mengubah status transaksi menjadi &quot;Dikembalikan&quot; dan secara otomatis menambah stok buku sebanyak 1 eksemplar. Transaksi tidak akan dihapus dan tetap menjadi histori.
          </p>
        </div>
      </Modal>
    </div>
  );
};
