import React, { useState } from 'react';
import { useLibrary } from '../../context/LibraryContext';
import { SearchInput } from '../../components/ui/SearchInput';
import { EmptyState } from '../../components/ui/EmptyState';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { BookCard } from '../../components/library/BookCard';
import { BookOpen, CheckCircle2, AlertCircle } from 'lucide-react';

export const CatalogPage: React.FC = () => {
  const { books } = useLibrary();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Anggota hanya dapat melihat buku yang berstatus aktif (isActive === true)
  const activeBooks = books.filter((b) => b.isActive);
  const categories = ['all', ...Array.from(new Set(activeBooks.map((b) => b.category)))];

  // Pencarian realtime berdasarkan judul, penulis, kode buku, atau kategori
  const filteredBooks = activeBooks.filter((book) => {
    const query = search.toLowerCase().trim();
    const matchesSearch =
      book.title.toLowerCase().includes(query) ||
      book.author.toLowerCase().includes(query) ||
      book.code.toLowerCase().includes(query) ||
      book.category.toLowerCase().includes(query) ||
      (book.isbn && book.isbn.toLowerCase().includes(query));

    const matchesCategory =
      selectedCategory === 'all' || book.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const availableCount = activeBooks.filter((b) => b.stock > 0).length;
  const outOfStockCount = activeBooks.filter((b) => b.stock === 0).length;

  return (
    <div className="space-y-6">
      {/* 1. Header Halaman */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Katalog Buku
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Temukan koleksi buku yang tersedia di perpustakaan.
          </p>
        </div>
      </div>

      {/* 2. Filter & Pencarian Buku */}
      <Card noPadding className="p-4 border border-slate-200/90 shadow-sm">
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
              <option value="all">Semua Kategori ({activeBooks.length})</option>
              {categories
                .filter((c) => c !== 'all')
                .map((cat) => {
                  const countInCat = activeBooks.filter((b) => b.category === cat).length;
                  return (
                    <option key={cat} value={cat}>
                      {cat} ({countInCat})
                    </option>
                  );
                })}
            </select>
          </div>
        </div>

        {/* Info Counter & Availability */}
        <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <BookOpen size={13} className="text-slate-400" />
            <span>
              Menampilkan <span className="font-semibold text-slate-800">{filteredBooks.length}</span> dari total{' '}
              <span className="font-semibold text-slate-800">{activeBooks.length}</span> buku aktif
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-medium border border-emerald-100">
              <CheckCircle2 size={11} /> {availableCount} Tersedia
            </span>
            {outOfStockCount > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[11px] font-medium border border-slate-200">
                <AlertCircle size={11} /> {outOfStockCount} Habis
              </span>
            )}
          </div>
        </div>
      </Card>

      {/* 3. Grid Kartu Katalog Buku */}
      {filteredBooks.length === 0 ? (
        <EmptyState
          type="search"
          title="Buku yang Anda cari tidak ditemukan"
          description="Coba gunakan kata kunci pencarian lain atau pilih kategori Semua Kategori."
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {filteredBooks.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      )}
    </div>
  );
};
