import React from "react";
import { cn } from "../../lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "brand" | "success" | "warning" | "danger" | "neutral" | "indigo";
  size?: "sm" | "md";
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "brand",
  size = "md",
  className,
}) => {
  const variants = {
    brand: "bg-brand-50 text-brand-700 border-brand-200",
    indigo: "bg-indigo-50 text-indigo-700 border-indigo-200",
    success: "bg-emerald-50 text-success border-emerald-200",
    warning: "bg-amber-50 text-warning border-amber-200",
    danger: "bg-red-50 text-danger border-red-200",
    neutral: "bg-slate-100 text-slate-700 border-slate-200",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-xs font-medium",
    md: "px-2.5 py-0.5 text-xs font-semibold",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border transition-colors",
        variants[variant],
        sizes[size],
        className
      )}
    >
      {children}
    </span>
  );
};
