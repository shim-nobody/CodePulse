import React from "react";
import { cn } from "../../lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  hover = false,
  ...props
}) => {
  return (
    <div
      className={cn(
        "bg-white border border-slate-200 rounded-lg p-5 shadow-card",
        hover && "transition-shadow hover:shadow-card-hover hover:border-slate-300",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
