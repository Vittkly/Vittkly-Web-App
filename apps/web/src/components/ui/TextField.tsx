"use client";

import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label?: string;
  labelClassName?: string;
  hint?: string;
  error?: string;
  controlSize?: "md" | "lg";
  leftElement?: React.ReactNode;
  rightElement?: React.ReactNode;
}

export function TextField({
  id,
  label,
  labelClassName = "",
  hint,
  error,
  controlSize = "lg",
  leftElement,
  rightElement,
  className = "",
  disabled,
  ...props
}: TextFieldProps) {
  const hasError = Boolean(error);
  const errorId = error ? `${id}-error` : undefined;
  const hintId = hint ? `${id}-hint` : undefined;

  const sizeClass =
    controlSize === "lg" ? "h-12 px-3.5 text-sm" : "h-10 px-3 text-sm";

  return (
    <div className="flex w-full flex-col gap-1.5 text-left">
      {label && (
        <label
          htmlFor={id}
          className={twMerge(
            "text-ink text-xs font-semibold tracking-wider uppercase select-none",
            labelClassName,
          )}
        >
          {label}
        </label>
      )}

      <div className="relative flex w-full items-center">
        {leftElement && (
          <div className="text-ink-muted pointer-events-none absolute left-3.5 flex items-center justify-center">
            {leftElement}
          </div>
        )}

        <input
          id={id}
          disabled={disabled}
          aria-invalid={hasError ? "true" : undefined}
          aria-describedby={errorId || hintId}
          className={twMerge(
            clsx(
              "border-line text-ink bg-surface-sunken placeholder:text-ink-muted w-full rounded-lg border transition-all duration-150 focus:ring-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50",
              sizeClass,
              leftElement ? "pl-10" : "",
              rightElement ? "pr-11" : "",
              hasError
                ? "border-danger focus:border-danger focus:ring-danger/25"
                : "hover:border-line-strong focus:border-primary focus:ring-primary/20",
              className,
            ),
          )}
          {...props}
        />

        {rightElement && (
          <div className="absolute right-3.5 flex items-center justify-center">
            {rightElement}
          </div>
        )}
      </div>

      {error ? (
        <p
          id={errorId}
          role="alert"
          className="text-danger-ink mt-0.5 text-xs font-medium"
        >
          {error}
        </p>
      ) : hint ? (
        <p id={hintId} className="text-ink-muted mt-0.5 text-xs">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export default TextField;
