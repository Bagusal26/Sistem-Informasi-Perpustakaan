import React from 'react';

export interface LoadingStateProps {
  message?: string;
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Memuat data...',
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-12 text-slate-500 gap-3 ${className}`}
    >
      <div className="relative">
        <div className="w-8 h-8 rounded-full border-2 border-slate-200 border-t-indigo-600 animate-spin" />
      </div>
      <p className="text-xs font-medium text-slate-600 animate-pulse">{message}</p>
    </div>
  );
};
