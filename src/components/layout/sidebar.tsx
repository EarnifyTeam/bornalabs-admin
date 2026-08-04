"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Shield } from "lucide-react";
import { navItems } from "@/config/navigation";
import { siteConfig } from "@/config/site";
import { useAuth } from "@/providers/auth-provider";

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <aside className="w-64 sidebar-glass flex flex-col justify-between fixed top-0 bottom-0 left-0 z-30 p-4">
      <div className="flex flex-col gap-6">
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-2 py-1">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan to-violet flex items-center justify-center font-bricolage text-sm font-bold shadow-lg shadow-cyan/15 text-white">
            BL
          </div>
          <div className="flex flex-col">
            <h1 className="font-bricolage font-bold text-sm text-white tracking-tight">
              {siteConfig.shortName}
            </h1>
            <span className="text-[9px] text-cyan font-mono">{siteConfig.version}</span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex flex-col gap-1 text-xs">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3 py-2.5 rounded-sm transition-all ${
                  isActive
                    ? "bg-surface border border-border-active text-cyan font-semibold shadow-sm"
                    : "text-muted hover:text-foreground hover:bg-surface/30"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? "text-cyan" : "text-muted"}`} />
                  <span>{item.title}</span>
                </div>
                {item.badge && (
                  <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-sm bg-violet/10 border border-violet/20 text-violet uppercase">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer / User Profile Placeholder */}
      <div className="flex flex-col gap-3 border-t border-border pt-4 px-1 text-xs">
        <div className="flex items-center justify-between">
          <div className="flex flex-col truncate">
            <span className="text-[11px] font-bold text-white truncate">{user.fullName}</span>
            <span className="text-[9px] text-muted truncate">{user.email}</span>
          </div>
          <Link
            href="/logout"
            className="p-1.5 text-muted hover:text-red hover:bg-red/10 rounded-sm transition-all"
            title="Secure Logout"
          >
            <LogOut className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="flex items-center gap-1.5 text-[9px] text-muted/80 bg-surface2/25 px-2 py-1 rounded-sm">
          <Shield className="w-3 h-3 text-cyan" />
          <span>Foundation Protected</span>
        </div>
      </div>
    </aside>
  );
}
