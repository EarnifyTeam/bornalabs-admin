"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Layers, 
  Chrome, 
  Key, 
  Users, 
  Settings, 
  LogOut, 
  Terminal, 
  Code
} from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Products", href: "/products", icon: Layers },
  { name: "Extensions", href: "/extensions", icon: Chrome },
  { name: "Licenses", href: "/licenses", icon: Key },
  { name: "Users", href: "/users", icon: Users },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 h-screen fixed left-0 top-0 sidebar-glass flex flex-col justify-between py-6 px-4 z-40">
      <div class="flex flex-col gap-8">
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-cyan to-violet flex items-center justify-center font-bricolage text-sm font-bold shadow-lg shadow-cyan/15 text-white">
            BL
          </div>
          <div>
            <h1 className="font-bricolage font-bold text-sm leading-none tracking-tight">BornaLabs</h1>
            <span className="text-[10px] text-muted tracking-wider uppercase font-semibold">Build. Create. Automate.</span>
          </div>
        </div>

        {/* Menu Navigation */}
        <nav className="flex flex-col gap-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-sm text-xs font-semibold tracking-wide transition-all duration-200 border border-transparent",
                  isActive
                    ? "bg-surface text-foreground border-border shadow-md"
                    : "text-muted hover:text-foreground hover:bg-surface/40"
                )}
              >
                <Icon className={cn("w-4 h-4", isActive ? "text-cyan" : "text-muted")} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Logout / User Info */}
      <div className="flex flex-col gap-4 border-t border-border pt-4">
        <div className="flex items-center gap-3 px-3">
          <div className="w-8 h-8 rounded-full bg-surface-alt border border-border flex items-center justify-center text-xs font-bold font-bricolage">
            SA
          </div>
          <div>
            <p className="text-[11px] font-bold leading-none">Super Admin</p>
            <span className="text-[9px] text-muted">admin@bornalabs.com</span>
          </div>
        </div>
        <Link
          href="/logout"
          className="flex items-center gap-3 px-3 py-2 rounded-sm text-xs font-semibold text-red hover:bg-red/5 transition-all"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </Link>
      </div>
    </aside>
  );
}
