import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export type BadgeVariant =
  | 'primary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'neutral'
  | 'tenant'
  | 'outline'
  | 'plan'
  | 'role';

export type BadgeSize = 'sm' | 'md';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
  mono?: boolean;
  dot?: boolean;
  children: React.ReactNode;
}

export function Badge({
  variant = 'neutral',
  size = 'md',
  mono = false,
  dot = false,
  className = '',
  children,
  ...props
}: BadgeProps) {
  const sizeStyles: Record<BadgeSize, string> = {
    sm: 'text-[11px] px-2 py-0.5 leading-4',
    md: 'text-xs px-2.5 py-1 leading-4 font-semibold',
  };

  const variantStyles: Record<BadgeVariant, { badge: string; dot: string }> = {
    primary: {
      badge: 'bg-primary-soft text-primary-ink border border-primary/20',
      dot: 'bg-primary',
    },
    success: {
      badge: 'bg-success-soft text-success-ink border border-success/30',
      dot: 'bg-success',
    },
    warning: {
      badge: 'bg-warning-soft text-warning-ink border border-warning/30',
      dot: 'bg-warning',
    },
    danger: {
      badge: 'bg-danger-soft text-danger-ink border border-danger/30',
      dot: 'bg-danger',
    },
    neutral: {
      badge: 'bg-surface-sunken text-soft border border-line',
      dot: 'bg-soft',
    },
    tenant: {
      badge: 'bg-tenant-accent-soft text-on-tenant-accent border border-tenant-accent/30',
      dot: 'bg-tenant-accent',
    },
    outline: {
      badge: 'bg-transparent text-ink border border-line',
      dot: 'bg-line-strong',
    },
    plan: {
      badge: 'bg-primary-ink text-white border border-transparent shadow-xs',
      dot: 'bg-white',
    },
    role: {
      badge: 'bg-surface-raised text-ink border border-line-strong shadow-xs',
      dot: 'bg-primary',
    },
  };

  const selected = variantStyles[variant] || variantStyles.neutral;

  return (
    <span
      className={twMerge(
        clsx(
          'rounded-pill inline-flex items-center gap-1.5 whitespace-nowrap select-none',
          sizeStyles[size],
          selected.badge,
          mono ? 'font-mono' : '',
          className
        )
      )}
      {...props}
    >
      {dot && <span className={clsx('h-1.5 w-1.5 shrink-0 rounded-full', selected.dot)} />}
      <span>{children}</span>
    </span>
  );
}

export default Badge;
