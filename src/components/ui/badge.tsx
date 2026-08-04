import React from "react";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "active" | "warning" | "danger" | "info" | "neutral";
  className?: string;
}

export function Badge({
  children,
  variant = "neutral",
  className = "",
}: BadgeProps) {
  const variantStyles = {
    active: "bg-green/10 border-green/20 text-green",
    warning: "bg-gold/10 border-gold/20 text-gold",
    danger: "bg-red/10 border-red/20 text-red",
    info: "bg-cyan/10 border-cyan/20 text-cyan",
    neutral: "bg-surface2/30 border-border text-muted",
  };

  return (
    <span
      className={`text-[9px] font-bold px-2 py-0.5 rounded-sm border uppercase tracking-wider ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
