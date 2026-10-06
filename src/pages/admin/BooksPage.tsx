import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLibrary } from '../../context/LibraryContext';
import { useToast } from '../../context/ToastContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { SearchInput } from '../../components/ui/SearchInput';
import { EmptyState } from '../../components/ui/EmptyState';
import { Modal } from '../../components/ui/Modal';
import { Plus, Edit, EyeOff, Eye } from 'lucide-react';
import { Book } from '../../types';

export const BooksPage: React.FC = () => {
  const { books, toggleArchiveBook } = useLibrary();
  const { showToast } = useToast();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [targetBook, setTargetBook] = useState<Book | null>(null);

  const categories = ['all', ...Array.from(new Set(books.map((b) => b.category)))];

  // Realtime search berdasarkan judul, penulis, atau kode buku
  const filteredBooks = books.filter((book) => {
    const query = search.toLowerCase().trim();
    const matchesSearch =
      book.title.toLowerCase().includes(query) ||
      book.author.toLowerCase().includes(query) ||
      book.code.toLowerCase().includes(query);

    const matchesCategory =
      selectedCategory === 'all' || book.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const handleOpenToggleModal = (book: Book) => {
    setTargetBook(book);
    setConfirmModalOpen(true);
  };

  const handleConfirmToggle = () => {
    if (!targetBook) return;
    const res = toggleArchiveBook(targetBook.id);
    if (res.success) {
      showToast('success', res.message);
    } else {
      showToast('error', res.message);
    }
    setConfirmModalOpen(false);
    setTargetBook(null);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Data Buku</h2>
          <p className="text-xs text-slate-500 mt-0.5">Kelola koleksi buku perpustakaan.</p>
        </div>
        <Link to="/admin/books/create">
          <Button icon={<Plus size={16} />}>Tambah Buku</Button>
        </Link>
      </div>

      {/* 2. Filter & Pencarian Buku */}
      <Card noPadding className="p-4">
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="flex-1 w-full">
            <SearchInput
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClear={() => setSearch('')}
              placeholder="Cari judul, penulis, atau kode buku..."
            />
          </div>
          <div className="w-full md:w-56">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            >
              <option value="all">Semua Kategori</option>
              {categories
                .filter((cat) => cat !== 'all')
                .map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
            </select>
          </div>
        </div>
      </Card>

      {/* 3. Tabel Data Buku */}
      <Card noPadding>
        {filteredBooks.length === 0 ? (
          <EmptyState
            type="search"
            title="Buku yang Anda cari tidak ditemukan"
            description="Coba ubah kata kunci pencarian atau reset filter kategori."
            action={
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearch('');
                  setSelectedCategory('all');
                }}
              >
                Reset Pencarian
              </Button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50/80 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th scope="col" className="py-3 px-4">
                    Kode Buku
                  </th>
                  <th scope="col" className="py-3 px-4">
                    Judul
                  </th>
                  <th scope="col" className="py-3 px-4">
                    Penulis
                  </th>
                  <th scope="col" className="py-3 px-4">
                    Kategori
                  </th>
                  <th scope="col" className="py-3 px-4">
                    Tahun
                  </th>
                  <th scope="col" className="py-3 px-4 text-center">
                    Stok
                  </th>
                  <th scope="col" className="py-3 px-4 text-center">
                    Status
                  </th>
                  <th scope="col" className="py-3 px-4 text-right">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBooks.map((book) => {
                  const isAvailable = book.stock > 0;

                  return (
                    <tr key={book.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Kode Buku */}
                      <td className="py-3 px-4 font-mono font-medium text-slate-900">
                        {book.code}
                      </td>

                      {/* Judul & Cover Thumbnail */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={book.cover}
                            alt={book.title}
                            className="w-9 h-12 object-cover rounded shadow-2xs shrink-0 border border-slate-200"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=200';
                            }}
                          />
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-900 text-sm leading-snug line-clamp-1">
                              {book.title}
                            </p>
                            <p className="text-[11px] text-slate-400 truncate">{book.publisher}</p>
                          </div>
                        </div>
                      </td>

                      {/* Penulis */}
                      <td className="py-3 px-4 text-slate-700">{book.author}</td>

                      {/* Kategori */}
                      <td className="py-3 px-4">
                        <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px] font-medium">
                          {book.category}
                        </span>
                      </td>

                      {/* Tahun */}
                      <td className="py-3 px-4 text-slate-600">{book.year}</td>

                      {/* Stok: Jika 0 tampilkan Habis */}
                      <td className="py-3 px-4 text-center">
                        {isAvailable ? (
                          <span className="font-semibold text-slate-900">{book.stock}</span>
                        ) : (
                          <span className="inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                            Habis
                          </span>
                        )}
                      </td>

                      {/* Status: Aktif / Tidak Aktif */}
                      <td className="py-3 px-4 text-center">
                        {book.isActive ? (
                          <Badge variant="Aktif" size="sm" dot>
                            Aktif
                          </Badge>
                        ) : (
                          <Badge variant="Tidak Aktif" size="sm" dot>
                            Tidak Aktif
                          </Badge>
                        )}
                      </td>

                      {/* Aksi: Edit & Nonaktifkan/Aktifkan */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link to={`/admin/books/edit/${book.id}`}>
                            <button
                              className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors"
                              title="Edit Data Buku"
                              aria-label={`Edit ${book.title}`}
                            >
                              <Edit size={15} />
                            </button>
                          </Link>

                          {book.isActive ? (
                            <button
                              onClick={() => handleOpenToggleModal(book)}
                              className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                              title="Nonaktifkan Buku"
                              aria-label={`Nonaktifkan ${book.title}`}
                            >
                              <EyeOff size={15} />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleOpenToggleModal(book)}
                              className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                              title="Aktifkan Buku"
                              aria-label={`Aktifkan ${book.title}`}
                            >
                              <Eye size={15} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Confirmation Modal untuk Nonaktifkan / Aktifkan Buku */}
      <Modal
        isOpen={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        title={targetBook?.isActive ? 'Nonaktifkan buku ini?' : 'Aktifkan buku ini?'}
        description={
          targetBook?.isActive
            ? 'Buku yang dinonaktifkan tidak dapat digunakan untuk peminjaman baru.'
            : 'Buku yang diaktifkan dapat kembali dicari dan dipinjam oleh anggota perpustakaan.'
        }
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setConfirmModalOpen(false)}>
              Batal
            </Button>
            <Button
              variant={targetBook?.isActive ? 'danger' : 'primary'}
              size="sm"
              onClick={handleConfirmToggle}
            >
              {targetBook?.isActive ? 'Nonaktifkan' : 'Aktifkan'}
            </Button>
          </>
        }
      >
        <div className="space-y-2 text-xs text-slate-600">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <p className="font-semibold text-slate-900 text-sm">{targetBook?.title}</p>
            <p className="text-slate-500 mt-0.5">
              Kode: <span className="font-mono text-slate-700">{targetBook?.code}</span> | Penulis:{' '}
              {targetBook?.author}
            </p>
          </div>
          {targetBook?.isActive ? (
            <p className="text-slate-500">
              Data buku dan riwayat transaksi sebelumnya akan tetap tersimpan secara aman dalam sistem.
            </p>
          ) : (
            <p className="text-slate-500">
              Status buku akan kembali Aktif dan muncul dalam katalog peminjaman.
            </p>
          )}
        </div>
      </Modal>
    </div>
  );
};

