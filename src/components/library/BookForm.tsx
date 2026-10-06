import React, { useState, useEffect } from 'react';
import { Book } from '../../types';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Save, ArrowLeft, Image as ImageIcon } from 'lucide-react';

export interface BookFormProps {
  initialData?: Partial<Book>;
  isEdit?: boolean;
  onSubmit: (data: {
    code: string;
    isbn?: string;
    title: string;
    author: string;
    publisher: string;
    year: number;
    category: string;
    description: string;
    cover: string;
    stock: number;
    isActive: boolean;
  }) => { success: boolean; message: string };
  onCancel: () => void;
  existingCodes?: string[];
  currentBookId?: string;
}

export const BookForm: React.FC<BookFormProps> = ({
  initialData,
  isEdit = false,
  onSubmit,
  onCancel,
  existingCodes = [],
}) => {
  const [form, setForm] = useState({
    code: initialData?.code || '',
    isbn: initialData?.isbn || '',
    title: initialData?.title || '',
    author: initialData?.author || '',
    publisher: initialData?.publisher || '',
    year: initialData?.year || new Date().getFullYear(),
    category: initialData?.category || '',
    description: initialData?.description || '',
    cover:
      initialData?.cover ||
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=600',
    stock: initialData?.stock ?? 1,
    isActive: initialData?.isActive ?? true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setForm({
        code: initialData.code || '',
        isbn: initialData.isbn || '',
        title: initialData.title || '',
        author: initialData.author || '',
        publisher: initialData.publisher || '',
        year: initialData.year || new Date().getFullYear(),
        category: initialData.category || '',
        description: initialData.description || '',
        cover:
          initialData.cover ||
          'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=600',
        stock: initialData.stock ?? 0,
        isActive: initialData.isActive ?? true,
      });
    }
  }, [initialData]);

  const validate = () => {
    const errs: Record<string, string> = {};

    // 1. Kode Buku wajib
    if (!form.code.trim()) {
      errs.code = 'Kode Buku wajib diisi.';
    } else {
      // Cek duplikasi kode buku
      const isDuplicate = existingCodes.some(
        (c) =>
          c.toLowerCase() === form.code.trim().toLowerCase() &&
          (!isEdit || c.toLowerCase() !== initialData?.code?.toLowerCase())
      );
      if (isDuplicate) {
        errs.code = `Kode Buku "${form.code.trim()}" sudah digunakan.`;
      }
    }

    // 2. Judul wajib
    if (!form.title.trim()) {
      errs.title = 'Judul Buku wajib diisi.';
    }

    // 3. Penulis wajib
    if (!form.author.trim()) {
      errs.author = 'Nama Penulis wajib diisi.';
    }

    // 4. Tahun Terbit harus angka valid
    const yearNum = Number(form.year);
    if (!form.year || isNaN(yearNum) || yearNum < 1000 || yearNum > 2100) {
      errs.year = 'Tahun Terbit harus berupa tahun yang valid (contoh: 2024).';
    }

    // 5. Stok harus angka >= 0
    const stockNum = Number(form.stock);
    if (isNaN(stockNum) || stockNum < 0) {
      errs.stock = 'Stok harus berupa angka dan tidak boleh bernilai negatif.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    const result = onSubmit({
      code: form.code.trim(),
      isbn: form.isbn.trim(),
      title: form.title.trim(),
      author: form.author.trim(),
      publisher: form.publisher.trim() || 'Penerbit Umum',
      year: Number(form.year),
      category: form.category.trim() || 'Umum',
      description: form.description.trim(),
      cover:
        form.cover.trim() ||
        'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=600',
      stock: Number(form.stock),
      isActive: form.isActive,
    });
    setIsSubmitting(false);

    if (!result.success) {
      setErrors((prev) => ({ ...prev, form: result.message }));
    }
  };

  return (
    <Card noPadding className="overflow-hidden">
      <form onSubmit={handleSubmit}>
        <div className="p-6 sm:p-8 space-y-6">
          {errors.form && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg font-medium">
              {errors.form}
            </div>
          )}

          {/* Baris 1: Kode Buku & ISBN */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Kode Buku"
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
              placeholder="Contoh: BK-009"
              error={errors.code}
              required
              helperText="Kode identitas unik buku di perpustakaan"
            />
            <Input
              label="ISBN (Opsional)"
              value={form.isbn}
              onChange={(e) => setForm({ ...form, isbn: e.target.value })}
              placeholder="Contoh: 978-602-03-8591-4"
              helperText="Nomor standar buku internasional jika tersedia"
            />
          </div>

          {/* Baris 2: Judul Buku */}
          <Input
            label="Judul Buku"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Masukkan judul buku lengkap"
            error={errors.title}
            required
          />

          {/* Baris 3: Penulis & Penerbit */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Penulis"
              value={form.author}
              onChange={(e) => setForm({ ...form, author: e.target.value })}
              placeholder="Nama pengarang / penulis"
              error={errors.author}
              required
            />
            <Input
              label="Penerbit"
              value={form.publisher}
              onChange={(e) => setForm({ ...form, publisher: e.target.value })}
              placeholder="Nama penerbit buku"
            />
          </div>

          {/* Baris 4: Tahun Terbit, Kategori, Stok */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Tahun Terbit"
              type="number"
              value={form.year}
              onChange={(e) => setForm({ ...form, year: Number(e.target.value) })}
              error={errors.year}
              required
            />
            <Input
              label="Kategori"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              placeholder="Contoh: Fiksi, IT, Sains"
            />
            <Input
              label="Jumlah Stok"
              type="number"
              min={0}
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
              error={errors.stock}
              required
              helperText={Number(form.stock) === 0 ? 'Stok 0 = Status Habis' : 'Jumlah eksemplar fisik'}
            />
          </div>

          {/* Baris 5: Cover URL & Preview */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-start">
            <div className="sm:col-span-3">
              <Input
                label="URL Gambar Cover"
                value={form.cover}
                onChange={(e) => setForm({ ...form, cover: e.target.value })}
                placeholder="https://..."
                helperText="Tautan gambar cover buku (format JPG/PNG/WebP)"
              />
            </div>
            <div className="flex flex-col items-center justify-center p-2 bg-slate-50 border border-slate-200 rounded-lg">
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                Preview Cover
              </span>
              {form.cover ? (
                <img
                  src={form.cover}
                  alt="Preview"
                  className="w-14 h-20 object-cover rounded shadow-xs border border-slate-200"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=200';
                  }}
                />
              ) : (
                <div className="w-14 h-20 bg-slate-200 rounded flex items-center justify-center text-slate-400">
                  <ImageIcon size={20} />
                </div>
              )}
            </div>
          </div>

          {/* Baris 6: Deskripsi */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700">Sinopsis / Deskripsi Buku</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Deskripsi singkat mengenai isi buku..."
              className="w-full rounded-lg border border-slate-300 p-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500"
            />
          </div>

          {/* Status Buku (Hanya di mode Edit) */}
          {isEdit && (
            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-800">Status Keaktifan Buku</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Buku aktif dapat dicari dan dipinjam anggota. Buku tidak aktif tidak dapat dipinjam.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                <span className="ml-2 text-xs font-medium text-slate-700">
                  {form.isActive ? 'Aktif' : 'Tidak Aktif'}
                </span>
              </label>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2.5">
          <Button variant="outline" type="button" onClick={onCancel}>
            <ArrowLeft size={15} />
            <span>Batal</span>
          </Button>
          <Button type="submit" isLoading={isSubmitting} icon={<Save size={15} />}>
            <span>{isEdit ? 'Simpan Perubahan' : 'Tambah Buku'}</span>
          </Button>
        </div>
      </form>
    </Card>
  );
};
