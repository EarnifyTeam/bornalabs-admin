import React from "react";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  hoverable?: boolean;
  accent?: "cyan" | "violet" | "gold" | "green" | "red" | "none";
  className?: string;
}

export function GlassCard({
  children,
  hoverable = true,
  accent = "none",
  className = "",
  ...props
}: GlassCardProps) {
  const accentGlow = {
    cyan: "before:bg-cyan/10 hover:border-cyan/30",
    violet: "before:bg-violet/10 hover:border-violet/30",
    gold: "before:bg-gold/10 hover:border-gold/30",
    green: "before:bg-green/10 hover:border-green/30",
    red: "before:bg-red/10 hover:border-red/30",
    none: "",
  };

  return (
    <div
      className={`glass-panel p-6 rounded-md relative overflow-hidden transition-all duration-300 ${
        hoverable ? "glass-panel-hover" : ""
      } ${accentGlow[accent]} ${className}`}
      {...props}
    >
      {accent !== "none" && (
        <div
          className={`absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl pointer-events-none opacity-40 ${
            accent === "cyan"
              ? "bg-cyan"
              : accent === "violet"
              ? "bg-violet"
              : accent === "gold"
              ? "bg-gold"
              : accent === "green"
              ? "bg-green"
              : "bg-red"
          }`}
        />
      )}
      {children}
    </div>
  );
}
