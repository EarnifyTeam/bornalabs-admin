import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  error?: string;
}

export function Input({
  label,
  leftIcon,
  rightIcon,
  error,
  className = "",
  ...props
}: InputProps) {
  return (
    <div className="flex flex-col gap-1.5 w-full text-xs">
      {label && (
        <label className="text-muted font-bold text-[10px] uppercase">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {leftIcon && (
          <div className="absolute left-3 text-muted pointer-events-none">
            {leftIcon}
          </div>
        )}
        <input
          className={`bg-surface2/40 border border-border rounded-sm py-2 text-foreground focus:outline-none w-full focus:border-border-active transition-all ${
            leftIcon ? "pl-9" : "pl-3"
          } ${rightIcon ? "pr-9" : "pr-3"} ${
            error ? "border-red/40" : ""
          } ${className}`}
          {...props}
        />
        {rightIcon && (
          <div className="absolute right-3 text-muted">
            {rightIcon}
          </div>
        )}
      </div>
      {error && <span className="text-[10px] text-red">{error}</span>}
    </div>
  );
}
