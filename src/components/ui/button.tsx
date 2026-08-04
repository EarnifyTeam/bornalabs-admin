import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
  icon?: React.ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  children,
  icon,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center font-bold rounded-sm transition-all focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed";

  const sizeStyles = {
    sm: "px-3 py-1.5 text-[10px]",
    md: "px-4 py-2 text-xs",
    lg: "px-6 py-3 text-sm",
  };

  const variantStyles = {
    primary:
      "bg-gradient-to-tr from-cyan to-violet text-white shadow-md hover:opacity-90",
    secondary:
      "bg-surface border border-border text-foreground hover:bg-surface/60 hover:border-border-active",
    outline:
      "border border-cyan/40 text-cyan hover:bg-cyan/10",
    danger:
      "bg-red/10 border border-red/20 text-red hover:bg-red/20",
    ghost:
      "bg-transparent text-muted hover:text-foreground hover:bg-surface/30",
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  );
}
