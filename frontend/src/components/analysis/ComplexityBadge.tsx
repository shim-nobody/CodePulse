import React from "react";
import { Badge } from "../ui/Badge";

interface ComplexityBadgeProps {
  notation: string;
  confidence?: string;
  className?: string;
}

export const ComplexityBadge: React.FC<ComplexityBadgeProps> = ({
  notation,
  confidence,
  className,
}) => {
  const getVariant = (comp: string) => {
    if (comp.includes("1") || comp.includes("log n")) return "success";
    if (comp.includes("n?") || comp.includes("n?") || comp.includes("2^n") || comp.includes("n!")) return "danger";
    if (comp.includes("n log n")) return "warning";
    return "brand";
  };

  return (
    <div className={`inline-flex items-center gap-1.5 ${className || ""}`}>
      <Badge variant={getVariant(notation)} size="md">
        <span className="font-mono font-bold tracking-tight">{notation}</span>
      </Badge>
      {confidence && (
        <span className="text-[10px] uppercase font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
          {confidence} conf.
        </span>
      )}
    </div>
  );
};
