import React from "react";
import { cn } from "@/lib/utils";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  hoverable?: boolean;
  accent?: "cyan" | "violet" | "gold" | "green" | "none";
}

export const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ children, className, hoverable = true, accent = "none", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "glass-panel rounded-lg p-6 relative overflow-hidden transition-all duration-300",
          hoverable && "glass-panel-hover",
          accent === "cyan" && "before:absolute before:top-0 before:left-0 before:w-full before:h-1 before:bg-cyan",
          accent === "violet" && "before:absolute before:top-0 before:left-0 before:w-full before:h-1 before:bg-violet",
          accent === "gold" && "before:absolute before:top-0 before:left-0 before:w-full before:h-1 before:bg-gold",
          accent === "green" && "before:absolute before:top-0 before:left-0 before:w-full before:h-1 before:bg-green",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

GlassCard.displayName = "GlassCard";
