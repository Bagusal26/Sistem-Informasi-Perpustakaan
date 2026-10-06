import React from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useLibrary } from '../../context/LibraryContext';
import { useToast } from '../../context/ToastContext';
import { BookForm } from '../../components/library/BookForm';
import { Button } from '../../components/ui/Button';
import { ArrowLeft } from 'lucide-react';

export const BookEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { books, updateBook } = useLibrary();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const currentBook = books.find((b) => b.id === id);
  const existingCodes = books.map((b) => b.code);

  if (!currentBook) {
    return (
      <div className="max-w-xl mx-auto text-center py-16">
        <h2 className="text-xl font-bold text-slate-800">Buku Tidak Ditemukan</h2>
        <p className="text-xs text-slate-500 mt-2 mb-6">
          Data buku yang ingin Anda ubah tidak ditemukan dalam database.
        </p>
        <Link to="/admin/books">
          <Button icon={<ArrowLeft size={16} />}>Kembali ke Data Buku</Button>
        </Link>
      </div>
    );
  }

  const handleSubmit = (data: {
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
  }) => {
    const res = updateBook(currentBook.id, data);

    if (res.success) {
      showToast('success', 'Data buku berhasil diperbarui.');
      navigate('/admin/books');
      return { success: true, message: res.message };
    } else {
      showToast('error', res.message);
      return { success: false, message: res.message };
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link to="/admin/books">
          <Button variant="ghost" size="sm" icon={<ArrowLeft size={16} />}>
            Kembali
          </Button>
        </Link>
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Edit Data Buku</h2>
          <p className="text-xs text-slate-500">
            Perbarui informasi bibliografi, stok, atau status keaktifan buku.
          </p>
        </div>
      </div>

      {/* Reusable BookForm */}
      <BookForm
        initialData={currentBook}
        isEdit={true}
        existingCodes={existingCodes}
        currentBookId={currentBook.id}
        onSubmit={handleSubmit}
        onCancel={() => navigate('/admin/books')}
      />
    </div>
  );
};

