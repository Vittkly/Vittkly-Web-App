import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function Skeleton({ className = '', ...props }: SkeletonProps) {
  return (
    <div
      className={twMerge(
        clsx('bg-line/60 dark:bg-line/40 animate-pulse rounded-md', className)
      )}
      {...props}
    />
  );
}

export default Skeleton;
