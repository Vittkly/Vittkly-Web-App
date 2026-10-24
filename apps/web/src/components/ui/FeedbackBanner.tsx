import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export type FeedbackVariant = 'info' | 'success' | 'warning' | 'danger';

export interface FeedbackBannerProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: FeedbackVariant;
  title?: string;
  message?: React.ReactNode;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  onClose?: () => void;
  children?: React.ReactNode;
}

export function FeedbackBanner({
  variant = 'info',
  title,
  message,
  icon,
  action,
  onClose,
  className = '',
  children,
  ...props
}: FeedbackBannerProps) {
  const variantConfig: Record<
    FeedbackVariant,
    { container: string; text: string; defaultIcon: React.ReactNode }
  > = {
    info: {
      container: 'border-primary/20 bg-primary-soft text-primary-ink',
      text: 'text-primary-ink',
      defaultIcon: <Info className="text-primary mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />,
    },
    success: {
      container: 'border-success/30 bg-success-soft text-success-ink',
      text: 'text-success-ink',
      defaultIcon: <CheckCircle2 className="text-success mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />,
    },
    warning: {
      container: 'border-warning/30 bg-warning-soft text-warning-ink',
      text: 'text-warning-ink',
      defaultIcon: <AlertTriangle className="text-warning mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />,
    },
    danger: {
      container: 'border-danger/30 bg-danger-soft text-danger-ink',
      text: 'text-danger-ink',
      defaultIcon: <AlertCircle className="text-danger mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />,
    },
  };

  const current = variantConfig[variant] || variantConfig.info;

  return (
    <div
      role={variant === 'danger' || variant === 'warning' ? 'alert' : 'status'}
      className={twMerge(
        clsx(
          'flex items-start gap-3 rounded-lg border p-3.5 text-xs transition-colors',
          current.container,
          className
        )
      )}
      {...props}
    >
      {icon || current.defaultIcon}

      <div className="flex flex-1 flex-col gap-0.5 text-left">
        {title && <span className="font-bold tracking-tight">{title}</span>}
        {(message || children) && (
          <div className={clsx('leading-relaxed', current.text)}>
            {message}
            {children}
          </div>
        )}
      </div>

      {action && <div className="shrink-0">{action}</div>}

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar notificación"
          className="text-soft hover:text-ink -mr-1 -mt-1 rounded-sm p-1 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

export default FeedbackBanner;
