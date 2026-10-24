'use client';

import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Loader2 } from 'lucide-react';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'tenant';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  block?: boolean;
  loading?: boolean;
  loadingText?: string;
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  block = false,
  loading = false,
  loadingText,
  className = '',
  children,
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles =
    'inline-flex items-center justify-center font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus disabled:opacity-40 disabled:cursor-not-allowed select-none rounded-pill whitespace-nowrap gap-2';

  const sizeStyles: Record<ButtonSize, string> = {
    sm: 'h-8 px-3 text-[13px] leading-5',
    md: 'h-10 px-4 text-[15px] leading-5',
    lg: 'h-12 px-6 text-[16px] leading-6',
  };

  const variantStyles: Record<ButtonVariant, string> = {
    primary:
      'bg-primary hover:bg-primary-hover active:opacity-90 text-on-primary border border-transparent shadow-xs',
    secondary:
      'bg-surface-sunken hover:bg-primary-soft hover:text-primary-ink active:bg-line text-ink border border-transparent',
    outline:
      'bg-surface-raised hover:border-vitta hover:text-primary-ink active:bg-surface-sunken text-ink border border-line shadow-xs',
    ghost: 'bg-transparent hover:bg-primary-soft text-primary-ink border border-transparent',
    danger:
      'bg-transparent hover:bg-danger-soft text-danger-ink border border-transparent active:opacity-90',
    tenant:
      'bg-tenant-accent hover:opacity-90 active:opacity-80 text-on-tenant-accent border border-transparent shadow-xs',
  };

  const isDisabled = disabled || loading;

  return (
    <button
      className={twMerge(
        clsx(baseStyles, sizeStyles[size], variantStyles[variant], block ? 'w-full' : '', className)
      )}
      disabled={isDisabled}
      aria-busy={loading}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden="true" />
          <span>{loadingText || children}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}

export default Button;
