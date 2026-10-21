'use client';

import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label?: string;
  hint?: string;
  error?: string;
}

export function TextField({
  id,
  label,
  hint,
  error,
  className = '',
  disabled,
  ...props
}: TextFieldProps) {
  const hasError = Boolean(error);

  return (
    <div className="flex w-full flex-col gap-1 text-left">
      {label && (
        <label
          htmlFor={id}
          className="text-ink-muted text-xs font-semibold tracking-wide uppercase select-none"
        >
          {label}
        </label>
      )}

      <input
        id={id}
        disabled={disabled}
        className={twMerge(
          clsx(
            'bg-surface-raised text-ink placeholder:text-ink-muted/60 h-10 rounded-md border px-3 py-2 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 disabled:cursor-not-allowed disabled:opacity-50',
            hasError
              ? 'border-danger focus-visible:outline-danger'
              : 'border-line-strong focus-visible:outline-focus',
            className
          )
        )}
        {...props}
      />

      {error ? (
        <p className="text-danger-ink mt-0.5 text-xs font-medium">{error}</p>
      ) : hint ? (
        <p className="text-ink-muted mt-0.5 text-xs">{hint}</p>
      ) : null}
    </div>
  );
}

export default TextField;
