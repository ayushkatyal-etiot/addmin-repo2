import {
  Building2,
  CreditCard,
  LayoutDashboard,
  ShieldCheck,
  Truck,
  Wrench,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Not wired to a page yet — shown for information architecture, not clickable. */
  comingSoon?: boolean;
}

// Mirrors the product IA from planmysaas-blueprint/05-features.md. Items stay
// visible (disabled) ahead of their build step so the shell doesn't need
// reshuffling as each module ships.
export const navItems: NavItem[] = [
  { label: "Office Home", href: "/", icon: LayoutDashboard },
  { label: "Obligations", href: "/obligations", icon: Building2, comingSoon: true },
  { label: "Approvals & Payments", href: "/approvals", icon: CreditCard, comingSoon: true },
  { label: "Vendors & AMCs", href: "/vendors", icon: Truck, comingSoon: true },
  { label: "Assets & Maintenance", href: "/assets", icon: Wrench, comingSoon: true },
  { label: "Compliance", href: "/compliance", icon: ShieldCheck, comingSoon: true },
];
