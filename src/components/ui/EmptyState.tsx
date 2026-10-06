import React, { ReactNode } from 'react';
import { SearchX, FolderOpen } from 'lucide-react';

export interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  type?: 'search' | 'data';
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'Data Tidak Ditemukan',
  description = 'Tidak ada rekaman data yang cocok untuk ditampilkan.',
  icon,
  action,
  type = 'data',
}) => {
  const defaultIcon =
    type === 'search' ? (
      <SearchX className="h-10 w-10 text-slate-400 stroke-1" />
    ) : (
      <FolderOpen className="h-10 w-10 text-slate-400 stroke-1" />
    );

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-white border border-dashed border-slate-200 rounded-xl my-4">
      <div className="p-3 bg-slate-50 rounded-full mb-3 text-slate-500">
        {icon || defaultIcon}
      </div>
      <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
      <p className="text-xs text-slate-500 max-w-sm mt-1 mb-4 leading-relaxed">
        {description}
      </p>
      {action && <div>{action}</div>}
    </div>
  );
};
