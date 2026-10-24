'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Eye, EyeOff, Check, X } from 'lucide-react';
import { evaluatePasswordStrength } from '@vittkly/shared';

export interface PasswordFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  id: string;
  label?: string;
  hint?: string;
  error?: string;
  controlSize?: 'md' | 'lg';
  forgotPasswordHref?: string;
  showStrengthChecklist?: boolean;
}

export function PasswordField({
  id,
  label = 'Contraseña',
  hint,
  error,
  controlSize = 'lg',
  forgotPasswordHref,
  showStrengthChecklist = false,
  className = '',
  disabled,
  value,
  onChange,
  ...props
}: PasswordFieldProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [internalValue, setInternalValue] = useState('');

  const currentValue = typeof value === 'string' ? value : internalValue;
  const strength = evaluatePasswordStrength(currentValue);

  const hasError = Boolean(error);
  const errorId = error ? `${id}-error` : undefined;
  const hintId = hint ? `${id}-hint` : undefined;
  const sizeClass = controlSize === 'lg' ? 'h-12 pr-11 pl-3.5 text-sm' : 'h-10 pr-10 pl-3 text-sm';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (value === undefined) {
      setInternalValue(e.target.value);
    }
    onChange?.(e);
  };

  return (
    <div className="flex w-full flex-col gap-1.5 text-left">
      <div className="flex items-center justify-between">
        {label && (
          <label
            htmlFor={id}
            className="text-soft text-xs font-semibold tracking-wide uppercase select-none"
          >
            {label}
          </label>
        )}
        {forgotPasswordHref && (
          <Link
            href={forgotPasswordHref}
            tabIndex={disabled ? -1 : 0}
            className="text-accent hover:text-primary-hover text-xs font-semibold transition-colors focus-visible:underline"
          >
            ¿Olvidaste tu contraseña?
          </Link>
        )}
      </div>

      <div className="relative flex w-full items-center">
        <input
          id={id}
          type={showPassword ? 'text' : 'password'}
          disabled={disabled}
          value={value}
          onChange={handleChange}
          aria-invalid={hasError ? 'true' : undefined}
          aria-describedby={errorId || hintId}
          className={twMerge(
            clsx(
              'border-line text-ink bg-surface-raised placeholder:text-soft/60 focus-visible:outline-accent w-full rounded-md border transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 disabled:cursor-not-allowed disabled:opacity-50',
              sizeClass,
              hasError
                ? 'border-danger focus-visible:outline-danger'
                : 'hover:border-line-strong focus-visible:border-transparent',
              className
            )
          )}
          {...props}
        />

        <button
          type="button"
          tabIndex={-1}
          onClick={() => setShowPassword(!showPassword)}
          aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
          className="text-soft hover:text-ink absolute right-3 inline-flex p-1 transition-colors focus-visible:outline-none"
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Eye className="h-4 w-4" aria-hidden="true" />
          )}
        </button>
      </div>

      {showStrengthChecklist && currentValue.length > 0 && (
        <div className="border-line bg-surface-sunken/60 mt-1 flex flex-col gap-1 rounded-md border p-2.5 text-xs">
          <span className="text-soft font-semibold">Requisitos de seguridad:</span>
          <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
            <span
              className={clsx(
                'flex items-center gap-1.5',
                strength.minLength ? 'text-success-ink font-medium' : 'text-soft'
              )}
            >
              {strength.minLength ? (
                <Check className="text-success h-3.5 w-3.5 shrink-0" />
              ) : (
                <X className="text-soft/60 h-3.5 w-3.5 shrink-0" />
              )}
              8+ caracteres
            </span>

            <span
              className={clsx(
                'flex items-center gap-1.5',
                strength.hasUppercase ? 'text-success-ink font-medium' : 'text-soft'
              )}
            >
              {strength.hasUppercase ? (
                <Check className="text-success h-3.5 w-3.5 shrink-0" />
              ) : (
                <X className="text-soft/60 h-3.5 w-3.5 shrink-0" />
              )}
              Una mayúscula (A-Z)
            </span>

            <span
              className={clsx(
                'flex items-center gap-1.5',
                strength.hasNumber ? 'text-success-ink font-medium' : 'text-soft'
              )}
            >
              {strength.hasNumber ? (
                <Check className="text-success h-3.5 w-3.5 shrink-0" />
              ) : (
                <X className="text-soft/60 h-3.5 w-3.5 shrink-0" />
              )}
              Un número (0-9)
            </span>

            <span
              className={clsx(
                'flex items-center gap-1.5',
                strength.hasSpecialChar ? 'text-success-ink font-medium' : 'text-soft'
              )}
            >
              {strength.hasSpecialChar ? (
                <Check className="text-success h-3.5 w-3.5 shrink-0" />
              ) : (
                <X className="text-soft/60 h-3.5 w-3.5 shrink-0" />
              )}
              Un símbolo (!@#$...)
            </span>
          </div>
        </div>
      )}

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

export default PasswordField;
