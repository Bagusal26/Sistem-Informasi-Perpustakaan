import React from 'react';
import { useToast } from '../../context/ToastContext';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none"
    >
      {toasts.map((toast) => {
        const getToastConfig = () => {
          switch (toast.type) {
            case 'success':
              return {
                icon: <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />,
                border: 'border-emerald-200 bg-white shadow-emerald-900/5',
              };
            case 'error':
              return {
                icon: <AlertCircle className="h-5 w-5 text-rose-500 shrink-0" />,
                border: 'border-rose-200 bg-white shadow-rose-900/5',
              };
            case 'warning':
              return {
                icon: <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />,
                border: 'border-amber-200 bg-white shadow-amber-900/5',
              };
            case 'info':
            default:
              return {
                icon: <Info className="h-5 w-5 text-indigo-500 shrink-0" />,
                border: 'border-indigo-200 bg-white shadow-indigo-900/5',
              };
          }
        };

        const config = getToastConfig();

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border shadow-lg transition-all animate-in slide-in-from-bottom-2 ${config.border}`}
          >
            {config.icon}
            <div className="flex-1 text-xs text-slate-800 font-medium leading-relaxed">
              {toast.message}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-600 p-0.5 rounded transition-colors"
              aria-label="Tutup notifikasi"
            >
              <X size={15} />
            </button>
          </div>
        );
      })}
    </div>
  );
};
