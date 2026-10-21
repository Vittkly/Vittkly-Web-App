import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'raised' | 'sunken' | 'outline';
  children: React.ReactNode;
}

export function Card({ variant = 'raised', className = '', children, ...props }: CardProps) {
  const variantStyles = {
    raised: 'bg-surface-raised border border-line shadow-xs',
    sunken: 'bg-surface-sunken border border-line',
    outline: 'bg-transparent border border-line-strong',
  };

  return (
    <div
      className={twMerge(
        clsx('rounded-lg p-4 transition-colors', variantStyles[variant], className)
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export default Card;
