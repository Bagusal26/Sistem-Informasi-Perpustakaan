import React from 'react';
import { Link } from 'react-router-dom';
import { Book } from '../../types';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { ArrowRight, BookOpen } from 'lucide-react';

export interface BookCardProps {
  book: Book;
}

export const BookCard: React.FC<BookCardProps> = ({ book }) => {
  const isAvailable = book.stock > 0;

  return (
    <div className="group bg-white rounded-xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col h-full">
      {/* Cover Image Container */}
      <div className="relative h-52 sm:h-56 bg-slate-100 overflow-hidden">
        <img
          src={book.cover}
          alt={book.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=400';
          }}
        />

        {/* Status Badge: Tersedia vs Habis */}
        <div className="absolute top-2.5 right-2.5">
          {isAvailable ? (
            <Badge variant="Aktif" size="sm" dot>
              Tersedia
            </Badge>
          ) : (
            <Badge variant="Tidak Aktif" size="sm" dot>
              Habis
            </Badge>
          )}
        </div>

        {/* Kategori Pill */}
        <div className="absolute bottom-2.5 left-2.5">
          <span className="text-[11px] font-medium bg-slate-900/80 backdrop-blur-xs text-white px-2.5 py-0.5 rounded-md shadow-xs">
            {book.category}
          </span>
        </div>
      </div>

      {/* Book Metadata & Info */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono mb-1">
            <span>{book.code}</span>
            <span>{book.year}</span>
          </div>

          <h3
            className="font-bold text-slate-900 text-sm leading-snug line-clamp-2 group-hover:text-indigo-600 transition-colors"
            title={book.title}
          >
            {book.title}
          </h3>

          <p className="text-xs text-slate-600 mt-1 line-clamp-1 font-medium">
            {book.author}
          </p>

          <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
            {book.publisher}
          </p>
        </div>

        {/* Card Footer: Stock & Detail Action */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <div className="text-xs">
            <span className="text-slate-400 text-[11px]">Sisa Stok: </span>
            <span
              className={`font-semibold ${
                isAvailable ? 'text-slate-700' : 'text-rose-600'
              }`}
            >
              {book.stock} eks.
            </span>
          </div>

          <Link to={`/member/books/${book.id}`}>
            <Button variant="outline" size="sm" icon={<ArrowRight size={14} />}>
              Detail
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
