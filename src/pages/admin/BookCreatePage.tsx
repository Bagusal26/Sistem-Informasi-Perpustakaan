import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLibrary } from '../../context/LibraryContext';
import { useToast } from '../../context/ToastContext';
import { BookForm } from '../../components/library/BookForm';
import { Button } from '../../components/ui/Button';
import { ArrowLeft } from 'lucide-react';

export const BookCreatePage: React.FC = () => {
  const { books, addBook } = useLibrary();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const existingCodes = books.map((b) => b.code);

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
    const res = addBook(data);

    if (res.success) {
      showToast('success', 'Buku berhasil ditambahkan.');
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
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Tambah Buku Baru</h2>
          <p className="text-xs text-slate-500">Daftarkan koleksi buku baru ke katalog perpustakaan.</p>
        </div>
      </div>

      {/* Reusable BookForm */}
      <BookForm
        isEdit={false}
        existingCodes={existingCodes}
        onSubmit={handleSubmit}
        onCancel={() => navigate('/admin/books')}
      />
    </div>
  );
};

