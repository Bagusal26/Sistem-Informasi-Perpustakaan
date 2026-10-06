import React, { ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  action?: ReactNode;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Terjadi Kesalahan',
  message = 'Tidak dapat memproses permintaan Anda saat ini.',
  action,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-rose-50/50 border border-rose-200 rounded-xl my-4">
      <div className="p-3 bg-rose-100 rounded-full mb-3 text-rose-600">
        <AlertCircle className="h-8 w-8" />
      </div>
      <h3 className="text-sm font-semibold text-rose-900">{title}</h3>
      <p className="text-xs text-rose-700 max-w-sm mt-1 mb-4 leading-relaxed">
        {message}
      </p>
      {action && <div>{action}</div>}
    </div>
  );
};
