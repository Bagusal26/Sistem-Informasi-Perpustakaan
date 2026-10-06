import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useLibrary } from '../../context/LibraryContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { EmptyState } from '../../components/ui/EmptyState';
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  Layers,
  Building,
  Hash,
  Bookmark,
  CheckCircle2,
  XCircle,
  Info,
  ShieldAlert,
  User,
} from 'lucide-react';

export const BookDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { books, members, createBorrowing } = useLibrary();
  const { currentUser, isAuthenticated, role } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Cari buku berdasarkan parameter ID
  const book = books.find((b) => b.id === id);

  // Jika ID buku tidak ditemukan atau buku berstatus tidak aktif (isActive === false)
  if (!book || !book.isActive) {
    return (
      <div className="max-w-2xl mx-auto py-8">
        <EmptyState
          type="search"
          title="Buku Tidak Ditemukan"
          description="Buku yang Anda cari tidak tersedia dalam katalog aktif perpustakaan atau tautan yang Anda tuju salah."
          action={
            <Link to="/member/catalog">
              <Button icon={<ArrowLeft size={16} />}>Kembali ke Katalog Buku</Button>
            </Link>
          }
        />
      </div>
    );
  }

  // Profil anggota yang sedang login
  const memberProfile = members.find((m) => m.id === currentUser?.memberId);
  const isMemberActive = memberProfile?.status === 'Aktif';
  const isStockAvailable = book.stock > 0;

  // Tombol hanya aktif jika: login, role member, member aktif, buku aktif, stock > 0
  const canBorrow =
    isAuthenticated &&
    role === 'member' &&
    !!currentUser?.memberId &&
    isMemberActive &&
    isStockAvailable;

  // Tanggal peminjaman & batas pengembalian (7 hari)
  const today = new Date();
  const borrowDateStr = today.toISOString().split('T')[0];
  const dueDateObj = new Date();
  dueDateObj.setDate(dueDateObj.getDate() + 7);
  const dueDateStr = dueDateObj.toISOString().split('T')[0];

  const handleOpenBorrowModal = () => {
    // Validasi sebelum membuka modal konfirmasi
    if (!currentUser?.memberId || !memberProfile) {
      showToast('error', 'Sesi login anggota tidak valid.');
      return;
    }
    if (!isMemberActive) {
      showToast('error', 'Peminjaman tidak dapat dilakukan karena akun anggota tidak aktif.');
      return;
    }
    if (!book.isActive) {
      showToast('error', 'Buku sedang tidak tersedia.');
      return;
    }
    if (book.stock <= 0) {
      showToast('error', 'Buku sedang tidak tersedia (stok habis).');
      return;
    }

    setConfirmModalOpen(true);
  };

  const handleConfirmBorrow = () => {
    if (!currentUser?.memberId) {
      showToast('error', 'Sesi login anggota tidak valid.');
      setConfirmModalOpen(false);
      return;
    }

    setIsSubmitting(true);
    const res = createBorrowing(currentUser.memberId, book.id);
    setIsSubmitting(false);

    if (res.success) {
      showToast('success', 'Peminjaman buku berhasil.');
      setConfirmModalOpen(false);
      navigate('/member/borrowings');
    } else {
      showToast('error', res.message);
      setConfirmModalOpen(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* 1. Navigasi Kembali */}
      <div className="flex items-center justify-between">
        <Link to="/member/catalog">
          <Button variant="ghost" size="sm" icon={<ArrowLeft size={16} />}>
            Kembali ke Katalog
          </Button>
        </Link>
        <span className="text-xs text-slate-400 font-mono">ID: {book.id}</span>
      </div>

      {/* 2. Kartu Utama Detail Buku */}
      <Card noPadding className="overflow-hidden border border-slate-200/90 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3">
          {/* Kolom Kiri: Cover Buku & Kode */}
          <div className="bg-slate-100/80 p-6 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-slate-200">
            <div className="relative group">
              <img
                src={book.cover}
                alt={book.title}
                className="w-48 sm:w-56 h-72 object-cover rounded-lg shadow-md border border-slate-200"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=400';
                }}
              />
            </div>
            <div className="mt-4 text-center">
              <span className="text-xs font-mono text-slate-600 bg-white px-3 py-1 rounded-md border border-slate-200 shadow-2xs font-semibold">
                Kode: {book.code}
              </span>
            </div>
          </div>

          {/* Kolom Kanan: Rincian Lengkap Buku */}
          <div className="p-6 md:p-8 md:col-span-2 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              {/* Kategori & Status Ketersediaan */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-full">
                  {book.category}
                </span>

                {isStockAvailable ? (
                  <Badge variant="Aktif" size="sm" dot>
                    Tersedia
                  </Badge>
                ) : (
                  <Badge variant="Tidak Aktif" size="sm" dot>
                    Habis
                  </Badge>
                )}
              </div>

              {/* Judul & Penulis */}
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug tracking-tight">
                  {book.title}
                </h1>
                <p className="text-sm text-slate-600 mt-1.5 font-medium">
                  Penulis: <span className="text-slate-900 font-semibold">{book.author}</span>
                </p>
              </div>

              {/* Tabel / Grid Metadata Bibliografi */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 bg-slate-50/80 rounded-xl border border-slate-200/80 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px] mb-0.5">Penerbit</span>
                  <span className="font-semibold text-slate-800">{book.publisher}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px] mb-0.5">Tahun Terbit</span>
                  <span className="font-semibold text-slate-800">{book.year}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px] mb-0.5">ISBN</span>
                  <span className="font-semibold font-mono text-slate-800">{book.isbn || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px] mb-0.5">Sisa Stok</span>
                  <span className={`font-semibold ${isStockAvailable ? 'text-emerald-700' : 'text-rose-600'}`}>
                    {book.stock} Eksemplar
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px] mb-0.5">Status Sirkulasi</span>
                  <span className="font-semibold text-slate-800">
                    {isStockAvailable ? 'Bisa Dipinjam' : 'Tidak Tersedia'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px] mb-0.5">Kategori</span>
                  <span className="font-semibold text-slate-800">{book.category}</span>
                </div>
              </div>

              {/* Deskripsi / Sinopsis */}
              <div className="pt-2">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Bookmark size={14} className="text-indigo-600" />
                  <span>Deskripsi & Sinopsis</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line bg-slate-50/50 p-4 rounded-lg border border-slate-100">
                  {book.description || 'Belum ada deskripsi lengkap untuk buku ini.'}
                </p>
              </div>

              {/* Peringatan Akun Anggota Tidak Aktif */}
              {memberProfile && !isMemberActive && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2.5 text-xs text-rose-800">
                  <ShieldAlert size={16} className="text-rose-600 shrink-0" />
                  <span>
                    Status akun Anda saat ini <strong>Tidak Aktif</strong>. Peminjaman buku tidak dapat dilakukan sebelum akun diaktifkan oleh petugas.
                  </span>
                </div>
              )}
            </div>

            {/* Action Bar */}
            <div className="pt-5 border-t border-slate-100 space-y-3">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-xs text-slate-500 text-center sm:text-left flex items-center gap-1.5">
                  <Info size={14} className="text-slate-400 shrink-0" />
                  <span>
                    Durasi standar peminjaman: <strong>7 hari</strong>
                  </span>
                </div>

                {/* Tombol Ajukan Peminjaman */}
                <Button
                  size="md"
                  disabled={!canBorrow}
                  onClick={handleOpenBorrowModal}
                  icon={<BookOpen size={16} />}
                >
                  {isStockAvailable
                    ? 'Ajukan Peminjaman'
                    : 'Stok Habis'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Confirmation Modal Peminjaman Buku */}
      <Modal
        isOpen={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        title="Konfirmasi Peminjaman"
        description="Periksa kembali detail buku dan batas pengembalian sebelum mengonfirmasi."
        footer={
          <>
            <Button
              variant="outline"
              size="sm"
              disabled={isSubmitting}
              onClick={() => setConfirmModalOpen(false)}
            >
              Batal
            </Button>
            <Button
              variant="primary"
              size="sm"
              isLoading={isSubmitting}
              icon={<CheckCircle2 size={15} />}
              onClick={handleConfirmBorrow}
            >
              Konfirmasi Peminjaman
            </Button>
          </>
        }
      >
        <div className="space-y-3 text-xs text-slate-600">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/90 space-y-2">
            <div>
              <span className="text-[11px] text-slate-400 block">Judul Buku</span>
              <p className="font-bold text-slate-900 text-sm leading-snug">{book.title}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-200/60 text-xs">
              <div>
                <span className="text-slate-400 text-[11px] block">Penulis</span>
                <span className="font-semibold text-slate-800">{book.author}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block">Tanggal Peminjaman</span>
                <span className="font-semibold text-slate-800">{borrowDateStr}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[11px] block">Batas Pengembalian</span>
                <span className="font-semibold text-indigo-700">{dueDateStr}</span>
              </div>
            </div>
          </div>

          <p className="text-slate-600 font-medium">
            Apakah Anda yakin ingin meminjam buku ini?
          </p>
        </div>
      </Modal>
    </div>
  );
};
