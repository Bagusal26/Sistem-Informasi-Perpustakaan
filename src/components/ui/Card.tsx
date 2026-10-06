import React, { HTMLAttributes, ReactNode } from 'react';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
  title?: string;
  subtitle?: string;
  noPadding?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  header,
  footer,
  title,
  subtitle,
  noPadding = false,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden transition-all ${className}`}
      {...props}
    >
      {(header || title) && (
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          {header ? (
            header
          ) : (
            <div>
              {title && <h3 className="font-semibold text-slate-800 text-base">{title}</h3>}
              {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
            </div>
          )}
        </div>
      )}
      <div className={noPadding ? '' : 'p-5'}>{children}</div>
      {footer && <div className="px-5 py-3.5 bg-slate-50/70 border-t border-slate-100">{footer}</div>}
    </div>
  );
};
