import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "raised" | "sunken" | "outline" | "interactive" | "glass";
  padding?: "none" | "sm" | "md" | "lg";
  children: React.ReactNode;
}

export function Card({
  variant = "raised",
  padding = "md",
  className = "",
  children,
  ...props
}: CardProps) {
  const variantStyles = {
    raised: "bg-surface-raised border border-line shadow-xs",
    sunken: "bg-surface-sunken border border-line",
    outline: "bg-transparent border border-line-strong",
    interactive:
      "bg-surface-raised border border-line shadow-xs hover:border-line-strong hover:shadow-1 transition-all duration-200 cursor-pointer",
    glass: "bg-surface-raised/80 backdrop-blur-md border border-line shadow-xs",
  };

  const paddingStyles = {
    none: "p-0",
    sm: "p-3",
    md: "p-4 sm:p-5",
    lg: "p-6 sm:p-8",
  };

  return (
    <div
      className={twMerge(
        clsx(
          "rounded-xl transition-colors",
          variantStyles[variant],
          paddingStyles[padding],
          className,
        ),
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export default Card;
