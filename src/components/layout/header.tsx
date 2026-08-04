"use client";

import React from "react";
import { ShieldCheck, User } from "lucide-react";
import { useAuth } from "@/providers/auth-provider";

export function Header() {
  const { user } = useAuth();

  return (
    <header className="h-16 border-b border-border flex items-center justify-between px-8 bg-bg2/45 backdrop-blur-md sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <span className="text-[10px] bg-cyan/10 border border-cyan/20 text-cyan px-2.5 py-0.5 rounded-sm font-bold uppercase tracking-wider">
          Control Center
        </span>
        <span className="text-[10px] text-muted flex items-center gap-1">
          <ShieldCheck className="w-3 h-3 text-green" />
          Foundation Mode
        </span>
      </div>

      <div className="flex items-center gap-4 text-xs">
        <div className="flex items-center gap-2 bg-surface2/30 border border-border px-3 py-1 rounded-sm">
          <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-cyan to-violet flex items-center justify-center text-[10px] font-bold text-white">
            <User className="w-3 h-3" />
          </div>
          <div className="flex flex-col text-[10px]">
            <span className="font-bold text-white leading-none">{user.fullName}</span>
            <span className="text-muted text-[9px] leading-none">{user.role}</span>
          </div>
        </div>

        <div
          className="w-2.5 h-2.5 rounded-full bg-green pulse-green"
          title="Foundation operational"
        />
      </div>
    </header>
  );
}
