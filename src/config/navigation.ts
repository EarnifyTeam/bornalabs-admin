import { 
  LayoutDashboard, 
  Users, 
  Package, 
  Puzzle, 
  Key, 
  LifeBuoy,
  Settings 
} from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon: any;
  badge?: string;
}

export const navItems: NavItem[] = [
  {
    title: "Executive Overview",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    title: "User Accounts",
    href: "/users",
    icon: Users,
    badge: "Placeholder",
  },
  {
    title: "Products Catalog",
    href: "/products",
    icon: Package,
  },
  {
    title: "Chrome Extensions",
    href: "/extensions",
    icon: Puzzle,
  },
  {
    title: "Licenses Telemetry",
    href: "/licenses",
    icon: Key,
  },
  {
    title: "Support Desk",
    href: "/support",
    icon: LifeBuoy,
  },
  {
    title: "System Settings",
    href: "/settings",
    icon: Settings,
  },
];
