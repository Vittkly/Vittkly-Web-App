'use client';

import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label?: string;
  hint?: string;
  error?: string;
  controlSize?: 'md' | 'lg';
  leftElement?: React.ReactNode;
  rightElement?: React.ReactNode;
}

export function TextField({
  id,
  label,
  hint,
  error,
  controlSize = 'lg',
  leftElement,
  rightElement,
  className = '',
  disabled,
  ...props
}: TextFieldProps) {
  const hasError = Boolean(error);
  const errorId = error ? `${id}-error` : undefined;
  const hintId = hint ? `${id}-hint` : undefined;

  const sizeClass = controlSize === 'lg' ? 'h-12 px-3.5 text-sm' : 'h-10 px-3 text-sm';

  return (
    <div className="flex w-full flex-col gap-1.5 text-left">
      {label && (
        <label
          htmlFor={id}
          className="text-soft text-xs font-semibold tracking-wide uppercase select-none"
        >
          {label}
        </label>
      )}

      <div className="relative flex w-full items-center">
        {leftElement && (
          <div className="text-soft absolute left-3 flex items-center justify-center pointer-events-none">
            {leftElement}
          </div>
        )}

        <input
          id={id}
          disabled={disabled}
          aria-invalid={hasError ? 'true' : undefined}
          aria-describedby={errorId || hintId}
          className={twMerge(
            clsx(
              'border-line text-ink bg-surface-raised placeholder:text-soft/60 focus-visible:outline-accent w-full rounded-md border transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 disabled:cursor-not-allowed disabled:opacity-50',
              sizeClass,
              leftElement ? 'pl-10' : '',
              rightElement ? 'pr-11' : '',
              hasError
                ? 'border-danger focus-visible:outline-danger'
                : 'hover:border-line-strong focus-visible:border-transparent',
              className
            )
          )}
          {...props}
        />

        {rightElement && (
          <div className="absolute right-3 flex items-center justify-center">
            {rightElement}
          </div>
        )}
      </div>

      {error ? (
        <p id={errorId} role="alert" className="text-danger-ink mt-0.5 text-xs font-medium">
          {error}
        </p>
      ) : hint ? (
        <p id={hintId} className="text-soft mt-0.5 text-xs">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export default TextField;
