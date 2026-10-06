import React, { ReactNode } from 'react';

export type BadgeVariant =
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral'
  | 'Aktif'
  | 'Tidak Aktif'
  | 'Menunggu'
  | 'Dipinjam'
  | 'Dikembalikan'
  | 'Terlambat';

export interface BadgeProps {
  children?: ReactNode;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  dot?: boolean;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  dot = false,
  className = '',
}) => {
  // Mapping varian teks dan status SKPL
  const getStyle = (): { bg: string; text: string; dotColor: string } => {
    switch (variant) {
      case 'Aktif':
      case 'Dikembalikan':
      case 'success':
        return {
          bg: 'bg-emerald-50 border-emerald-200',
          text: 'text-emerald-700',
          dotColor: 'bg-emerald-500',
        };
      case 'Dipinjam':
      case 'info':
        return {
          bg: 'bg-blue-50 border-blue-200',
          text: 'text-blue-700',
          dotColor: 'bg-blue-500',
        };
      case 'Menunggu':
      case 'warning':
        return {
          bg: 'bg-amber-50 border-amber-200',
          text: 'text-amber-800',
          dotColor: 'bg-amber-500',
        };
      case 'Tidak Aktif':
      case 'Terlambat':
      case 'danger':
        return {
          bg: 'bg-rose-50 border-rose-200',
          text: 'text-rose-700',
          dotColor: 'bg-rose-500',
        };
      case 'neutral':
      default:
        return {
          bg: 'bg-slate-100 border-slate-200',
          text: 'text-slate-700',
          dotColor: 'bg-slate-400',
        };
    }
  };

  const style = getStyle();
  const sizeStyle =
    size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-0.5 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${style.bg} ${style.text} ${sizeStyle} ${className}`}
    >
      {dot && <span className={`h-1.5 w-1.5 rounded-full ${style.dotColor}`} />}
      {children || variant}
    </span>
  );
};
